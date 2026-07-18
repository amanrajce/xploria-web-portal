// src/lib/queries.ts
//
// Example query patterns for the collections in schema-design.md.
// All of these assume `request.auth.uid` matches an entry in the relevant
// trip's `memberIds` — the security rules enforce that server-side, these
// just shape efficient client-side reads on top of it.

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  getDocs,
  getAggregateFromServer,
  sum,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import type { Trip, Expense, ItineraryItem, Result } from "@/types";

// ─── 1. Real-time: all trips the current user belongs to ──────────────────
//
// Uses `array-contains` on the denormalized `memberIds` field — this is why
// that field exists rather than relying on the (unindexable) nested
// `members[].uid`. Requires the composite index on
// (memberIds ARRAY_CONTAINS, createdAt DESC) from firestore.indexes.json.

export function subscribeToMyTrips(
  onData: (trips: Trip[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    onError(new Error("Not signed in."));
    return () => {};
  }

  const q = query(
    collection(db, "trips"),
    where("memberIds", "array-contains", uid),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => d.data() as Trip)),
    (err) => onError(err)
  );
}

// ─── 2. Paginated expenses for a specific trip ─────────────────────────────
//
// Membership is already guaranteed by the security rules (a non-member's
// query would return zero results / a permission-denied error, never leak
// other trips' data). This paginates 25 at a time, newest first.

const EXPENSES_PAGE_SIZE = 25;

export async function fetchExpensesPage(
  tripId: string,
  cursor?: QueryDocumentSnapshot
): Promise<Result<{ expenses: Expense[]; nextCursor: QueryDocumentSnapshot | null }>> {
  try {
    const baseQuery = query(
      collection(db, "expenses"),
      where("tripId", "==", tripId),
      orderBy("date", "desc"),
      limit(EXPENSES_PAGE_SIZE)
    );

    const q = cursor ? query(baseQuery, startAfter(cursor)) : baseQuery;
    const snap = await getDocs(q);

    return {
      success: true,
      data: {
        expenses: snap.docs.map((d) => d.data() as Expense),
        nextCursor: snap.docs.length === EXPENSES_PAGE_SIZE
          ? snap.docs[snap.docs.length - 1]
          : null,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load expenses.",
    };
  }
}

// ─── 3. Real-time itinerary for a single day ───────────────────────────────
//
// Scoped to (tripId, date) rather than pulling the whole trip's itinerary —
// keeps the itinerary page's listener payload small even for long trips.

export function subscribeToDayItinerary(
  tripId: string,
  date: string, // "YYYY-MM-DD"
  onData: (items: ItineraryItem[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, "itineraries"),
    where("tripId", "==", tripId),
    where("date", "==", date),
    orderBy("time", "asc")
  );

  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => d.data() as ItineraryItem)),
    (err) => onError(err)
  );
}

// ─── 4. Aggregation query: total spent, without downloading every doc ─────
//
// For the Budget page's "Total Spent" figure, summing client-side means
// downloading every expense doc just to add up one number. `sum()`
// aggregation queries compute this server-side and bill for a single read.
// (Requires firebase v10.7+ / the modular SDK's aggregation API.)

export async function getTripTotalSpent(tripId: string): Promise<Result<number>> {
  try {
    const q = query(collection(db, "expenses"), where("tripId", "==", tripId));
    const snapshot = await getAggregateFromServer(q, { total: sum("amount") });
    return { success: true, data: snapshot.data().total ?? 0 };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to compute total spend.",
    };
  }
}

// ─── 5. Spending by category (for Analytics/Budget breakdown) ─────────────
//
// Firestore has no server-side GROUP BY, so for a per-category breakdown
// you have two real options:
//   (a) one `sum()` aggregation query per category (7 small reads, no doc
//       downloads at all) — best when you only need the numbers, e.g. for
//       the Budget page's category bars.
//   (b) a single `where("tripId","==",tripId)` query with `getDocs` and
//       reduce client-side (as your current `getSpentByCategory` does) —
//       better when you're already paginating/displaying the expense list
//       anyway, since you avoid N extra round-trips.
// Example of (a):

const EXPENSE_CATEGORIES = [
  "transport", "accommodation", "food", "sightseeing", "tickets", "shopping", "misc",
] as const;

export async function getSpentByCategory(
  tripId: string
): Promise<Result<Record<(typeof EXPENSE_CATEGORIES)[number], number>>> {
  try {
    const entries = await Promise.all(
      EXPENSE_CATEGORIES.map(async (category) => {
        const q = query(
          collection(db, "expenses"),
          where("tripId", "==", tripId),
          where("category", "==", category)
        );
        const snap = await getAggregateFromServer(q, { total: sum("amount") });
        return [category, snap.data().total ?? 0] as const;
      })
    );

    return {
      success: true,
      data: Object.fromEntries(entries) as Record<(typeof EXPENSE_CATEGORIES)[number], number>,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to compute category breakdown.",
    };
  }
}