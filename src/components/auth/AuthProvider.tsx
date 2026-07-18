"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User as FirebaseUser } from "firebase/auth";
import { subscribeToAuthChanges } from "@/lib/auth";
import { useTripStore } from "@/lib/store/useTripStore";
import type { UserDoc } from "@/types";

interface AuthContextValue {
  user: FirebaseUser | null;
  profile: UserDoc | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthContextValue>({
    user: null,
    profile: null,
    loading: true,
  });

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user, profile) => {
      setState({ user, profile, loading: false });
      useTripStore.getState().initializeForUser(user?.uid ?? null);
    });

    return () => unsubscribe();
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
