import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TripType = "friends" | "couple" | "solo" | "family";

export interface Member {
  id: string;
  name: string;
  email?: string;
  avatarColor?: string;
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
  type: TripType;
  members: Member[];
  createdAt: number;
  coverColor?: string;
}

export type ExpenseCategory =
  | "transport"
  | "accommodation"
  | "food"
  | "sightseeing"
  | "tickets"
  | "shopping"
  | "misc";

export interface Expense {
  id: string;
  tripId: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  paidBy: string;          // member id
  splitAmong: string[];    // member ids
  date: string;
  notes?: string;
  createdAt: number;
}

export type ItineraryItemType = "activity" | "transport" | "accommodation" | "meal" | "note";

export interface ItineraryItem {
  id: string;
  tripId: string;
  day: number;
  date: string;
  time?: string;
  title: string;
  description?: string;
  type: ItineraryItemType;
  location?: string;
  expenseId?: string;
  completed: boolean;
}

export interface TodoItem {
  id: string;
  tripId: string;
  text: string;
  done: boolean;
  createdAt: number;
}

export interface Settlement {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}

export interface RestaurantBill {
  id: string;
  tripId: string;
  restaurantName: string;
  totalAmount: number;
  taxPercent: number;
  tipPercent: number;
  participants: { memberId: string; items: number }[];
  createdAt: number;
}

// ─── Store State ──────────────────────────────────────────────────────────────

interface TripState {
  trips: Trip[];
  activeTrip: Trip | null;
  expenses: Expense[];
  itinerary: ItineraryItem[];
  todos: TodoItem[];
  restaurantBills: RestaurantBill[];

  // Trip actions
  initializeForUser: (userId: string | null) => void;
  addTrip: (trip: Trip) => void;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  setActiveTrip: (trip: Trip | null) => void;

  // Expense actions
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Itinerary actions
  addItineraryItem: (item: ItineraryItem) => void;
  updateItineraryItem: (id: string, updates: Partial<ItineraryItem>) => void;
  deleteItineraryItem: (id: string) => void;
  toggleItineraryItem: (id: string) => void;

  // Todo actions
  addTodo: (todo: TodoItem) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;

  // Restaurant bill actions
  addRestaurantBill: (bill: RestaurantBill) => void;
  deleteRestaurantBill: (id: string) => void;

  // Computed
  getTripExpenses: (tripId: string) => Expense[];
  getTotalSpent: (tripId?: string) => number;
  getSpentByCategory: (tripId: string) => Record<ExpenseCategory, number>;
  getMemberBalance: (tripId: string) => Record<string, number>;
  getSettlements: (tripId: string) => Settlement[];
  getBudgetRemaining: (tripId: string) => number;
  getTripItinerary: (tripId: string) => ItineraryItem[];
  getTripTodos: (tripId: string) => TodoItem[];
  getDaysArray: (tripId: string) => string[];
}

// ─── Avatar Colors ────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "#10B981", "#3B82F6", "#F59E0B", "#EF4444",
  "#8B5CF6", "#EC4899", "#14B8A6", "#F97316",
];

export function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

// ─── Firestore Subscriptions ──────────────────────────────────────────────────

let tripsUnsubscribe: Unsubscribe | null = null;
let expensesUnsubscribe: Unsubscribe | null = null;
let itineraryUnsubscribe: Unsubscribe | null = null;
let todosUnsubscribe: Unsubscribe | null = null;
let billsUnsubscribe: Unsubscribe | null = null;
let serverTripIds = new Set<string>();

function unsubscribeActiveTripDetails() {
  if (expensesUnsubscribe) {
    expensesUnsubscribe();
    expensesUnsubscribe = null;
  }
  if (itineraryUnsubscribe) {
    itineraryUnsubscribe();
    itineraryUnsubscribe = null;
  }
  if (todosUnsubscribe) {
    todosUnsubscribe();
    todosUnsubscribe = null;
  }
  if (billsUnsubscribe) {
    billsUnsubscribe();
    billsUnsubscribe = null;
  }
}

function cleanUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined) as unknown as T;
  }
  if (typeof obj === "object" && !(obj instanceof Date)) {
    const result: Record<string, unknown> = {};
    Object.entries(obj).forEach(([key, val]) => {
      if (val !== undefined) {
        result[key] = cleanUndefined(val);
      }
    });
    return result as unknown as T;
  }
  return obj;
}

function unsubscribeAll() {
  if (tripsUnsubscribe) {
    tripsUnsubscribe();
    tripsUnsubscribe = null;
  }
  serverTripIds.clear();
  unsubscribeActiveTripDetails();
}

function subscribeToActiveTripDetails(
  tripId: string | null,
  set: (state: Partial<TripState> | ((state: TripState) => Partial<TripState>)) => void,
  retryCount = 0
) {
  unsubscribeActiveTripDetails();

  if (!tripId) {
    set({
      expenses: [],
      itinerary: [],
      todos: [],
      restaurantBills: [],
    });
    return;
  }

  let hasError = false;

  const handleSubscriptionError = (source: string, err: Error) => {
    console.warn(`[Firestore] Query warning on ${source} for trip ${tripId} (retry: ${retryCount}):`, err.message || err);
    
    // If a temporary replication or index lookup lag occurs, schedule a retry.
    if (!hasError && retryCount < 4) {
      hasError = true;
      unsubscribeActiveTripDetails();
      
      setTimeout(() => {
        const currentActive = useTripStore.getState().activeTrip;
        if (currentActive && currentActive.id === tripId) {
          subscribeToActiveTripDetails(tripId, set, retryCount + 1);
        }
      }, 1200);
    }
  };

  // Subscribe to expenses
  const expensesQuery = query(
    collection(db, "expenses"),
    where("tripId", "==", tripId)
  );
  expensesUnsubscribe = onSnapshot(
    expensesQuery,
    (snap) => {
      const expenses = snap.docs.map((d) => d.data() as Expense);
      expenses.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      set({ expenses });
    },
    (err) => handleSubscriptionError("expenses", err)
  );

  // Subscribe to itinerary
  const itineraryQuery = query(
    collection(db, "itineraries"),
    where("tripId", "==", tripId)
  );
  itineraryUnsubscribe = onSnapshot(
    itineraryQuery,
    (snap) => {
      const itinerary = snap.docs.map((d) => d.data() as ItineraryItem);
      set({ itinerary });
    },
    (err) => handleSubscriptionError("itinerary", err)
  );

  // Subscribe to todos
  const todosQuery = query(
    collection(db, "todos"),
    where("tripId", "==", tripId)
  );
  todosUnsubscribe = onSnapshot(
    todosQuery,
    (snap) => {
      const todos = snap.docs.map((d) => d.data() as TodoItem);
      todos.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      set({ todos });
    },
    (err) => handleSubscriptionError("todos", err)
  );

  // Subscribe to restaurant bills
  const billsQuery = query(
    collection(db, "restaurantBills"),
    where("tripId", "==", tripId)
  );
  billsUnsubscribe = onSnapshot(
    billsQuery,
    (snap) => {
      const restaurantBills = snap.docs.map((d) => d.data() as RestaurantBill);
      restaurantBills.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      set({ restaurantBills });
    },
    (err) => handleSubscriptionError("restaurantBills", err)
  );
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      trips: [],
      activeTrip: null,
      expenses: [],
      itinerary: [],
      todos: [],
      restaurantBills: [],

      // ── Trip actions ──────────────────────────────────────────────────────
      addTrip: async (trip) => {
        // Optimistic update
        set((s) => ({ trips: [trip, ...s.trips] }));

        const uid = auth.currentUser?.uid;
        if (uid) {
          const newTrip = {
            ...trip,
            ownerId: uid,
            memberIds: [uid],
            createdAt: trip.createdAt || Date.now(),
          };
          await setDoc(doc(db, "trips", trip.id), cleanUndefined(newTrip));
        }
      },

      updateTrip: async (id, updates) => {
        set((s) => ({
          trips: s.trips.map((t) => (t.id === id ? { ...t, ...updates } : t)),
          activeTrip: s.activeTrip?.id === id
            ? { ...s.activeTrip, ...updates }
            : s.activeTrip,
        }));

        const uid = auth.currentUser?.uid;
        if (uid) {
          await setDoc(doc(db, "trips", id), cleanUndefined(updates), { merge: true });
        }
      },

      deleteTrip: async (id) => {
        set((s) => ({
          trips: s.trips.filter((t) => t.id !== id),
          activeTrip: s.activeTrip?.id === id ? null : s.activeTrip,
        }));

        const uid = auth.currentUser?.uid;
        if (uid) {
          await deleteDoc(doc(db, "trips", id));
        }
      },

      initializeForUser: (userId) => {
        unsubscribeAll();

        if (!userId) {
          set({
            trips: [],
            activeTrip: null,
            expenses: [],
            itinerary: [],
            todos: [],
            restaurantBills: [],
          });
          return;
        }

        // Subscribe to trips containing this user as a member
        const tripsQuery = query(
          collection(db, "trips"),
          where("memberIds", "array-contains", userId)
        );
        tripsUnsubscribe = onSnapshot(
          tripsQuery,
          (snap) => {
            const tripsList = snap.docs.map((d) => d.data() as Trip);
            tripsList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            
            // Re-build serverTripIds set with server-verified items
            serverTripIds = new Set(tripsList.map((t) => t.id));
            set({ trips: tripsList });

            // Sync activeTrip reference from the new trips list
            const currentActive = get().activeTrip;
            if (currentActive) {
              const updatedActive = tripsList.find((t) => t.id === currentActive.id);
              if (updatedActive) {
                set({ activeTrip: updatedActive });
                // Hook up details listener if not active already and exists in database
                if (!expensesUnsubscribe && serverTripIds.has(updatedActive.id)) {
                  subscribeToActiveTripDetails(updatedActive.id, set);
                }
              } else {
                set({ activeTrip: null });
                subscribeToActiveTripDetails(null, set);
              }
            }
          },
          (err) => console.error("Error subscribing to trips:", err)
        );
      },

      setActiveTrip: (trip) => {
        set({ activeTrip: trip });
        if (trip && serverTripIds.has(trip.id)) {
          subscribeToActiveTripDetails(trip.id, set);
        } else {
          unsubscribeActiveTripDetails();
        }
      },

      // ── Expense actions ───────────────────────────────────────────────────
      addExpense: async (expense) => {
        set((s) => ({ expenses: [expense, ...s.expenses] }));

        const uid = auth.currentUser?.uid;
        if (uid) {
          const newExpense = {
            ...expense,
            createdBy: uid,
            createdAt: expense.createdAt || Date.now(),
          };
          await setDoc(doc(db, "expenses", expense.id), cleanUndefined(newExpense));
        }
      },

      updateExpense: async (id, updates) => {
        set((s) => ({
          expenses: s.expenses.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        }));

        const uid = auth.currentUser?.uid;
        if (uid) {
          await setDoc(doc(db, "expenses", id), cleanUndefined(updates), { merge: true });
        }
      },

      deleteExpense: async (id) => {
        set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }));

        const uid = auth.currentUser?.uid;
        if (uid) {
          await deleteDoc(doc(db, "expenses", id));
        }
      },

      // ── Itinerary actions ─────────────────────────────────────────────────
      addItineraryItem: async (item) => {
        set((s) => ({ itinerary: [...s.itinerary, item] }));

        const uid = auth.currentUser?.uid;
        if (uid) {
          const newItem = {
            ...item,
            createdBy: uid,
          };
          await setDoc(doc(db, "itineraries", item.id), cleanUndefined(newItem));
        }
      },

      updateItineraryItem: async (id, updates) => {
        set((s) => ({
          itinerary: s.itinerary.map((i) =>
            i.id === id ? { ...i, ...updates } : i
          ),
        }));

        const uid = auth.currentUser?.uid;
        if (uid) {
          await setDoc(doc(db, "itineraries", id), cleanUndefined(updates), { merge: true });
        }
      },

      deleteItineraryItem: async (id) => {
        set((s) => ({ itinerary: s.itinerary.filter((i) => i.id !== id) }));

        const uid = auth.currentUser?.uid;
        if (uid) {
          await deleteDoc(doc(db, "itineraries", id));
        }
      },

      toggleItineraryItem: async (id) => {
        set((s) => ({
          itinerary: s.itinerary.map((i) =>
            i.id === id ? { ...i, completed: !i.completed } : i
          ),
        }));

        const uid = auth.currentUser?.uid;
        if (uid) {
          const item = get().itinerary.find((i) => i.id === id);
          if (item) {
            await setDoc(doc(db, "itineraries", id), { completed: !item.completed }, { merge: true });
          }
        }
      },

      // ── Todo actions ──────────────────────────────────────────────────────
      addTodo: async (todo) => {
        set((s) => ({ todos: [todo, ...s.todos] }));

        const uid = auth.currentUser?.uid;
        if (uid) {
          const newTodo = {
            ...todo,
            createdBy: uid,
            createdAt: todo.createdAt || Date.now(),
          };
          await setDoc(doc(db, "todos", todo.id), cleanUndefined(newTodo));
        }
      },

      toggleTodo: async (id) => {
        set((s) => ({
          todos: s.todos.map((td) =>
            td.id === id ? { ...td, done: !td.done } : td
          ),
        }));

        const uid = auth.currentUser?.uid;
        if (uid) {
          const todo = get().todos.find((td) => td.id === id);
          if (todo) {
            await setDoc(doc(db, "todos", id), { done: !todo.done }, { merge: true });
          }
        }
      },

      deleteTodo: async (id) => {
        set((s) => ({ todos: s.todos.filter((td) => td.id !== id) }));

        const uid = auth.currentUser?.uid;
        if (uid) {
          await deleteDoc(doc(db, "todos", id));
        }
      },

      // ── Restaurant bill actions ───────────────────────────────────────────
      addRestaurantBill: async (bill) => {
        set((s) => ({ restaurantBills: [bill, ...s.restaurantBills] }));

        const uid = auth.currentUser?.uid;
        if (uid) {
          const newBill = {
            ...bill,
            createdBy: uid,
            createdAt: bill.createdAt || Date.now(),
          };
          await setDoc(doc(db, "restaurantBills", bill.id), cleanUndefined(newBill));
        }
      },

      deleteRestaurantBill: async (id) => {
        set((s) => ({
          restaurantBills: s.restaurantBills.filter((b) => b.id !== id),
        }));

        const uid = auth.currentUser?.uid;
        if (uid) {
          await deleteDoc(doc(db, "restaurantBills", id));
        }
      },

      // ── Computed ──────────────────────────────────────────────────────────
      getTripExpenses: (tripId) =>
        get().expenses.filter((e) => e.tripId === tripId),

      getTotalSpent: (tripId) => {
        const expenses = tripId
          ? get().expenses.filter((e) => e.tripId === tripId)
          : get().expenses;
        return expenses.reduce((sum, e) => sum + e.amount, 0);
      },

      getSpentByCategory: (tripId) => {
        const expenses = get().expenses.filter((e) => e.tripId === tripId);
        const result: Record<ExpenseCategory, number> = {
          transport: 0,
          accommodation: 0,
          food: 0,
          sightseeing: 0,
          tickets: 0,
          shopping: 0,
          misc: 0,
        };
        expenses.forEach((e) => {
          result[e.category] = (result[e.category] || 0) + e.amount;
        });
        return result;
      },

      getMemberBalance: (tripId) => {
        const trip = get().trips.find((t) => t.id === tripId);
        const expenses = get().expenses.filter((e) => e.tripId === tripId);
        if (!trip) return {};

        const balances: Record<string, number> = {};
        trip.members.forEach((m) => (balances[m.id] = 0));

        expenses.forEach((exp) => {
          const perPerson = exp.amount / exp.splitAmong.length;
          // Payer gets credit for the full amount
          if (balances[exp.paidBy] !== undefined) {
            balances[exp.paidBy] += exp.amount;
          }
          // Everyone in the split owes their share
          exp.splitAmong.forEach((memberId) => {
            if (balances[memberId] !== undefined) {
              balances[memberId] -= perPerson;
            }
          });
        });

        return balances;
      },

      getSettlements: (tripId) => {
        const trip = get().trips.find((t) => t.id === tripId);
        if (!trip) return [];

        const balances = get().getMemberBalance(tripId);

        // Build mutable lists sorted by magnitude
        type BalanceEntry = { id: string; amount: number };
        const debtors: BalanceEntry[] = Object.entries(balances)
          .filter(([, bal]) => bal < -0.01)
          .map(([id, amount]) => ({ id, amount: Math.abs(amount) }))
          .sort((a, b) => b.amount - a.amount);

        const creditors: BalanceEntry[] = Object.entries(balances)
          .filter(([, bal]) => bal > 0.01)
          .map(([id, amount]) => ({ id, amount }))
          .sort((a, b) => b.amount - a.amount);

        const getName = (id: string) =>
          trip.members.find((m) => m.id === id)?.name ?? id;

        const settlements: Settlement[] = [];
        let i = 0;
        let j = 0;

        while (i < debtors.length && j < creditors.length) {
          const debtor = debtors[i];
          const creditor = creditors[j];
          const transfer = Math.min(debtor.amount, creditor.amount);

          if (transfer > 0.01) {
            settlements.push({
              from: debtor.id,
              fromName: getName(debtor.id),
              to: creditor.id,
              toName: getName(creditor.id),
              amount: Math.round(transfer * 100) / 100,
            });
          }

          debtor.amount -= transfer;
          creditor.amount -= transfer;

          if (debtor.amount < 0.01) i++;
          if (creditor.amount < 0.01) j++;
        }

        return settlements;
      },

      getBudgetRemaining: (tripId) => {
        const trip = get().trips.find((t) => t.id === tripId);
        if (!trip) return 0;
        const spent = get().getTotalSpent(tripId);
        return trip.budget - spent;
      },

      getTripItinerary: (tripId) =>
        get()
          .itinerary.filter((i) => i.tripId === tripId)
          .sort((a, b) => a.day - b.day || (a.time ?? "").localeCompare(b.time ?? "")),

      getTripTodos: (tripId) =>
        get().todos.filter((td) => td.tripId === tripId),

      getDaysArray: (tripId) => {
        const trip = get().trips.find((t) => t.id === tripId);
        if (!trip) return [];
        const start = new Date(trip.startDate);
        const end = new Date(trip.endDate);
        const days: string[] = [];
        const current = new Date(start);
        while (current <= end) {
          days.push(current.toISOString().split("T")[0]);
          current.setDate(current.getDate() + 1);
        }
        return days;
      },
    }),
    {
      name: "xploria-trip-store",
      storage: createJSONStorage(() => sessionStorage),
      // Only persist serializable data, not computed functions
      partialize: (s) => ({
        trips: s.trips,
        activeTrip: s.activeTrip,
        expenses: s.expenses,
        itinerary: s.itinerary,
        todos: s.todos,
        restaurantBills: s.restaurantBills,
      }),
    }
  )
);