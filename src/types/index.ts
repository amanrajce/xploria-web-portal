// src/types/index.ts
//
// Shared types for the Xploria Firestore backend.
// `Timestamp` shapes are what you get back from a *read*.
// The `New*` variants are what you pass to `addDoc`/`setDoc` on *create*,
// where `createdAt`/`updatedAt` must be `serverTimestamp()` (a `FieldValue`),
// not a `Timestamp`, until the write round-trips.

import type { Timestamp, FieldValue } from "firebase/firestore";

// ─── Shared helpers ─────────────────────────────────────────────────────────

/** Any doc with server-managed audit fields. */
export interface Audited {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Swap the audit fields for FieldValue sentinels when creating a doc. */
export type ForCreate<T extends Audited> = Omit<T, "createdAt" | "updatedAt"> & {
  createdAt: FieldValue;
  updatedAt: FieldValue;
};

// ─── users/{uid} ────────────────────────────────────────────────────────────

export interface UserDoc extends Audited {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
}

export type NewUserDoc = ForCreate<UserDoc>;

// ─── trips/{tripId} ─────────────────────────────────────────────────────────

export type TripType = "friends" | "couple" | "solo" | "family";

export type MemberStatus = "active" | "invited";

export interface TripMember {
  id: string;            // stable local id, referenced by expenses.paidBy / splitAmong
  uid?: string;           // set once the invited person registers & accepts
  name: string;
  email?: string;
  avatarColor?: string;
  status: MemberStatus;
  invitedAt?: Timestamp;
  joinedAt?: Timestamp;
}

export interface Trip extends Audited {
  id: string;
  title: string;
  destination: string;
  startDate: string;     // "YYYY-MM-DD"
  endDate: string;        // "YYYY-MM-DD"
  budget: number;
  currency: string;       // e.g. "INR"
  type: TripType;
  coverColor?: string;
  ownerId: string;        // Auth uid of the creator
  memberIds: string[];    // Auth uids — SECURITY-CRITICAL, keep in sync with `members`
  members: TripMember[];  // denormalized display copy
}

export type NewTrip = ForCreate<Trip>;

// ─── expenses/{expenseId} ───────────────────────────────────────────────────

export type ExpenseCategory =
  | "transport"
  | "accommodation"
  | "food"
  | "sightseeing"
  | "tickets"
  | "shopping"
  | "misc";

export interface Expense extends Audited {
  id: string;
  tripId: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  paidBy: string;         // member id (TripMember.id)
  splitAmong: string[];   // member ids
  date: string;           // "YYYY-MM-DD"
  notes?: string;
  createdBy: string;      // Auth uid — immutable, used for delete permission
}

export type NewExpense = ForCreate<Expense>;

// ─── itineraries/{itemId} ───────────────────────────────────────────────────

export type ItineraryItemType = "activity" | "transport" | "accommodation" | "meal" | "note";

export interface ItineraryItem extends Audited {
  id: string;
  tripId: string;
  day: number;
  date: string;           // "YYYY-MM-DD"
  time?: string;
  title: string;
  description?: string;
  type: ItineraryItemType;
  location?: string;
  expenseId?: string;     // optional link back to an expenses doc
  completed: boolean;
  createdBy: string;
}

export type NewItineraryItem = ForCreate<ItineraryItem>;

// ─── todos/{todoId} ─────────────────────────────────────────────────────────

export interface TodoItem extends Audited {
  id: string;
  tripId: string;
  text: string;
  done: boolean;
  createdBy: string;
}

export type NewTodoItem = ForCreate<TodoItem>;

// ─── restaurantBills/{billId} ───────────────────────────────────────────────

export interface RestaurantBillParticipant {
  memberId: string;
  itemSubtotal: number;
}

export interface RestaurantBill extends Audited {
  id: string;
  tripId: string;
  restaurantName: string;
  totalAmount: number;
  taxPercent: number;
  tipPercent: number;
  splitEvenly: boolean;
  participants: RestaurantBillParticipant[];
  createdBy: string;
  linkedExpenseId?: string;
}

export type NewRestaurantBill = ForCreate<RestaurantBill>;

// ─── Derived / computed (never persisted) ──────────────────────────────────

export interface Settlement {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}

export interface MemberBalance {
  memberId: string;
  balance: number; // positive = is owed, negative = owes
}

// ─── API result wrapper (used by auth.ts and query helpers) ────────────────

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };