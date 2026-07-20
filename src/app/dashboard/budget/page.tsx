// src/app/dashboard/budget/page.tsx
"use client";

import { useTripStore, ExpenseCategory } from "@/lib/store/useTripStore";
import { IndianRupee, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import clsx from "clsx";

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  transport:      "Transport",
  accommodation:  "Accommodation",
  food:           "Food & Drinks",
  sightseeing:    "Sightseeing",
  tickets:        "Tickets",
  shopping:       "Shopping",
  misc:           "Miscellaneous",
};

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  transport:      "#3B82F6",
  accommodation:  "#8B5CF6",
  food:           "#F59E0B",
  sightseeing:    "#10B981",
  tickets:        "#EC4899",
  shopping:       "#F97316",
  misc:           "#94A3B8",
};

export default function BudgetPage() {
  const { activeTrip, getTotalSpent, getSpentByCategory, getBudgetRemaining } = useTripStore();

  if (!activeTrip) {
    return (
      <EmptyTripState message="Select or create a trip to view its budget." />
    );
  }

  const totalSpent    = getTotalSpent(activeTrip.id);
  const remaining     = getBudgetRemaining(activeTrip.id);
  const byCategory    = getSpentByCategory(activeTrip.id);
  const overBudget    = remaining < 0;
  const percentUsed   = Math.min((totalSpent / activeTrip.budget) * 100, 100);

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200 text-left">
      <header>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Budget</h1>
        <div className="flex items-center gap-2 text-xploria-muted mt-1 text-sm font-semibold">
          <span>{activeTrip.title}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-700 shrink-0" />
          <span>{activeTrip.destination}</span>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Budget"
          value={`₹${activeTrip.budget.toLocaleString("en-IN")}`}
          icon={<IndianRupee className="w-5 h-5 text-xploria-primary" />}
          accent="primary"
        />
        <StatCard
          label="Total Spent"
          value={`₹${totalSpent.toLocaleString("en-IN")}`}
          icon={<TrendingDown className="w-5 h-5 text-blue-400" />}
          accent="blue"
        />
        <StatCard
          label={overBudget ? "Over Budget" : "Remaining"}
          value={`₹${Math.abs(remaining).toLocaleString("en-IN")}`}
          icon={
            overBudget
              ? <AlertTriangle className="w-5 h-5 text-red-400" />
              : <TrendingUp className="w-5 h-5 text-emerald-400" />
          }
          accent={overBudget ? "red" : "green"}
        />
      </div>

      {/* Overall progress bar */}
      <div className="bg-xploria-card border border-[#24262c] rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between text-sm mb-3">
          <span className="text-xploria-muted font-bold">Budget used</span>
          <span className={clsx("font-extrabold", overBudget ? "text-red-400" : "text-white")}>
            {percentUsed.toFixed(1)}%
          </span>
        </div>
        <div className="h-3 bg-slate-800/40 rounded-full overflow-hidden">
          <div
            className={clsx(
              "h-full rounded-full transition-all duration-700",
              overBudget ? "bg-red-500" : percentUsed > 80 ? "bg-amber-500" : "bg-xploria-primary"
            )}
            style={{ width: `${percentUsed}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-xploria-muted mt-2 font-semibold">
          <span>₹0</span>
          <span>₹{activeTrip.budget.toLocaleString("en-IN")}</span>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-xploria-card border border-[#24262c] rounded-2xl p-6 shadow-xl">
        <h3 className="font-bold text-white mb-5 text-lg">Spending by Category</h3>
        <div className="space-y-4">
          {(Object.entries(byCategory) as [ExpenseCategory, number][])
            .sort(([, a], [, b]) => b - a)
            .map(([cat, amount]) => {
              const pct = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
              const color = CATEGORY_COLORS[cat];
              return (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1.5 font-semibold">
                    <span className="text-slate-350">{CATEGORY_LABELS[cat]}</span>
                    <span className="text-xploria-muted">
                      ₹{amount.toLocaleString("en-IN")}
                      <span className="ml-2 text-xs opacity-80">({pct.toFixed(1)}%)</span>
                    </span>
                  </div>
                  <div className="h-2 bg-slate-800/40 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label, value, icon, accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: "primary" | "blue" | "red" | "green";
}) {
  const bg: Record<string, string> = {
    primary: "bg-xploria-primary/10 border-xploria-primary/20 text-xploria-primary",
    blue:    "bg-blue-500/10 border-blue-500/20 text-blue-400",
    red:     "bg-red-500/10 border-red-500/20 text-red-400",
    green:   "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  };

  return (
    <div className={clsx("rounded-2xl border p-5 shadow-md transition-all hover:translate-y-[-2px] duration-300", bg[accent])}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-xploria-muted font-black uppercase tracking-wider">{label}</span>
        {icon}
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function EmptyTripState({ message }: { message: string }) {
  return (
    <div className="p-4 flex items-center justify-center min-h-[60vh]">
      <div className="text-center border-2 border-dashed border-[#24262c] rounded-2xl p-12 max-w-md bg-xploria-card shadow-2xl">
        <p className="text-xploria-muted font-bold">{message}</p>
      </div>
    </div>
  );
}