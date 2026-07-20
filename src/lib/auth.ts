// src/lib/auth.ts
//
// Auth is the gatekeeper: every registration / login flows through here,
// and `ensureUserDocument` guarantees the Firestore `users/{uid}` doc always
// exists and is kept in sync with the Auth profile — including self-healing
// if a previous signup crashed after Auth succeeded but before the
// Firestore write landed (defensive by design, never assume prior success).

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  type User as FirebaseUser,
  type Unsubscribe,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { UserDoc, Result } from "@/types";

// ─── Error mapping ──────────────────────────────────────────────────────────

/**
 * Firebase throws opaque `auth/xxx` codes. Never surface those raw to users —
 * map the ones we expect and fall back to a safe generic message for
 * anything unrecognized (never leak internal error internals).
 */
function mapAuthError(err: unknown): { message: string; code?: string } {
  const code = (err as { code?: string })?.code;

  const known: Record<string, string> = {
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/invalid-email": "That email address looks invalid.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
    "auth/network-request-failed": "Network error — check your connection and try again.",
    "auth/user-disabled": "This account has been disabled. Contact support.",
    "auth/requires-recent-login": "Please log in again to complete this action.",
  };

  if (code && known[code]) {
    return { message: known[code], code };
  }

  return { message: "Something went wrong. Please try again.", code };
}

// ─── User document sync ─────────────────────────────────────────────────────

/**
 * Ensures `users/{uid}` exists and mirrors the current Auth profile.
 * - On first call for a uid: creates the doc with `createdAt`.
 * - On subsequent calls: merges profile fields + bumps `updatedAt`, without
 *   touching `createdAt`.
 * Safe to call on every login, not just registration — this is what makes
 * the sync self-healing if a prior write failed.
 */
export async function ensureUserDocument(user: FirebaseUser): Promise<Result<UserDoc>> {
  try {
    const userRef = doc(db, "users", user.uid);
    const existing = await getDoc(userRef);

    const existingData = existing.exists() ? existing.data() as UserDoc : null;

    const profileFields = {
      uid: user.uid,
      email: user.email ?? "",
      displayName: user.displayName || existingData?.displayName || (user.email ? user.email.split("@")[0] : "Traveler"),
      photoURL: user.photoURL || existingData?.photoURL || null,
      updatedAt: serverTimestamp(),
    };

    if (!existing.exists()) {
      await setDoc(userRef, {
        ...profileFields,
        createdAt: serverTimestamp(),
      });
    } else {
      await setDoc(userRef, profileFields, { merge: true });
    }

    const finalSnap = await getDoc(userRef);
    if (!finalSnap.exists()) {
      // Should be unreachable, but never assume a write succeeded silently.
      return { success: false, error: "Failed to create user profile. Please try again." };
    }

    return { success: true, data: finalSnap.data() as UserDoc };
  } catch (err) {
    const { message, code } = mapAuthError(err);
    return { success: false, error: message, code };
  }
}

// ─── Registration ───────────────────────────────────────────────────────────

export async function registerUser(
  email: string,
  password: string,
  displayName: string
): Promise<Result<UserDoc>> {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedName = displayName.trim();

  if (!trimmedEmail || !password || !trimmedName) {
    return { success: false, error: "Name, email, and password are all required." };
  }
  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters." };
  }

  try {
    const credential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);

    // Set the Auth profile display name before syncing to Firestore so both
    // stores agree from the very first read.
    try {
      await updateProfile(credential.user, { displayName: trimmedName });
    } catch {
      // Non-fatal: proceed even if the Auth profile update fails — the
      // Firestore doc write below still carries the intended name.
    }

    const syncResult = await ensureUserDocument({
      ...credential.user,
      displayName: trimmedName,
    } as FirebaseUser);

    if (!syncResult.success) {
      // Auth account exists but profile sync failed — surface this clearly
      // rather than pretending registration fully succeeded.
      return {
        success: false,
        error: "Account created, but profile setup failed. Please try logging in.",
      };
    }

    return syncResult;
  } catch (err) {
    const { message, code } = mapAuthError(err);
    return { success: false, error: message, code };
  }
}

// ─── Login ──────────────────────────────────────────────────────────────────

export async function loginUser(email: string, password: string): Promise<Result<UserDoc>> {
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedEmail || !password) {
    return { success: false, error: "Email and password are required." };
  }

  try {
    const credential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
    // Re-sync on every login — self-heals any missing/stale user doc.
    return await ensureUserDocument(credential.user);
  } catch (err) {
    const { message, code } = mapAuthError(err);
    return { success: false, error: message, code };
  }
}

// ─── Logout ─────────────────────────────────────────────────────────────────

export async function logoutUser(): Promise<Result<null>> {
  try {
    await firebaseSignOut(auth);
    return { success: true, data: null };
  } catch (err) {
    const { message, code } = mapAuthError(err);
    return { success: false, error: message, code };
  }
}

// ─── Password reset ─────────────────────────────────────────────────────────

export async function requestPasswordReset(email: string): Promise<Result<null>> {
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail) {
    return { success: false, error: "Enter your email address first." };
  }
  try {
    await sendPasswordResetEmail(auth, trimmedEmail);
    return { success: true, data: null };
  } catch (err) {
    const { message, code } = mapAuthError(err);
    return { success: false, error: message, code };
  }
}

// ─── Auth state subscription ────────────────────────────────────────────────

/**
 * Subscribe to Auth state. On every sign-in event, re-syncs the Firestore
 * user doc before invoking `callback`, so consumers never observe a signed-in
 * user without a corresponding `users/{uid}` doc.
 */
export function subscribeToAuthChanges(
  callback: (user: FirebaseUser | null, profile: UserDoc | null) => void
): Unsubscribe {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback(null, null);
      return;
    }
    const result = await ensureUserDocument(user);
    callback(user, result.success ? result.data : null);
  });
}