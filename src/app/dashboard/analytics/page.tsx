// src/app/dashboard/analytics/page.tsx
"use client";

import { useMemo } from "react";
import { useTripStore, ExpenseCategory } from "@/lib/store/useTripStore";
import { BarChart3, TrendingDown, Calendar, Users } from "lucide-react";

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

export default function AnalyticsPage() {
  const { activeTrip, getTripExpenses, getSpentByCategory, getTotalSpent } = useTripStore();

  const expenses = useMemo(() => {
    return activeTrip ? getTripExpenses(activeTrip.id) : [];
  }, [activeTrip, getTripExpenses]);

  const byCategory = activeTrip ? getSpentByCategory(activeTrip.id) : {} as Record<ExpenseCategory, number>;
  const totalSpent = activeTrip ? getTotalSpent(activeTrip.id) : 0;

  // Spending by day
  const byDay = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.date] = (map[e.date] ?? 0) + e.amount;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({ date, amount }));
  }, [expenses]);

  // Spending by member
  const byMember = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.paidBy] = (map[e.paidBy] ?? 0) + e.amount;
    });
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .map(([id, amount]) => ({
        id,
        name: id === "me" ? "You" : activeTrip?.members.find((m) => m.id === id)?.name ?? id,
        amount,
      }));
  }, [expenses, activeTrip]);

  const maxDay    = byDay.length > 0 ? Math.max(...byDay.map((d) => d.amount)) : 1;
  const maxMember = byMember.length > 0 ? Math.max(...byMember.map((m) => m.amount)) : 1;

  if (!activeTrip) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center border-2 border-dashed border-slate-200 bg-white rounded-2xl p-12 max-w-md shadow-sm">
          <p className="text-xploria-muted font-medium">Select a trip to view spending analytics.</p>
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
        <header>
          <h1 className="text-4xl font-extrabold text-xploria-text tracking-tight">Analytics</h1>
          <p className="text-xploria-muted mt-1 text-sm font-medium">{activeTrip.title}</p>
        </header>
        <div className="text-center py-16 border-2 border-dashed border-slate-200 bg-white rounded-2xl text-xploria-muted font-medium shadow-sm">
          Add expenses to see spending analytics.
        </div>
      </div>
    );
  }

  const avgPerDay = byDay.length > 0 ? totalSpent / byDay.length : 0;
  const avgPerPerson = activeTrip.members.length > 0 ? totalSpent / activeTrip.members.length : 0;
  const topCategory = (Object.entries(byCategory) as [ExpenseCategory, number][])
    .sort(([, a], [, b]) => b - a)[0];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      <header>
        <h1 className="text-4xl font-extrabold text-xploria-text tracking-tight">Analytics</h1>
        <div className="flex items-center gap-2 text-xploria-muted mt-1 text-sm font-medium">
          <span>{activeTrip.title}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
          <span>spending report</span>
        </div>
      </header>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Spent",    value: `₹${totalSpent.toLocaleString("en-IN")}`,    icon: <TrendingDown className="w-4 h-4 text-blue-600" /> },
          { label: "Daily Average",  value: `₹${avgPerDay.toFixed(0)}`,                  icon: <Calendar className="w-4 h-4 text-xploria-primary" /> },
          { label: "Per Person",     value: `₹${avgPerPerson.toFixed(0)}`,               icon: <Users className="w-4 h-4 text-indigo-600" /> },
          { label: "Top Category",   value: topCategory ? CATEGORY_LABELS[topCategory[0]] : "None", icon: <BarChart3 className="w-4 h-4 text-emerald-600" /> },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-xploria-card border border-slate-200/80 rounded-2xl p-5 shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2 text-xploria-muted mb-2 text-xs font-bold uppercase tracking-wider">
              {icon} {label}
            </div>
            <p className="text-xl font-extrabold text-xploria-text">{value}</p>
          </div>
        ))}
      </div>

      {/* Category chart */}
      <div className="bg-xploria-card border border-slate-200/80 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <h3 className="font-bold text-xploria-text mb-5 text-lg">Spending by Category</h3>
        <div className="space-y-3">
          {(Object.entries(byCategory) as [ExpenseCategory, number][])
            .filter(([, v]) => v > 0)
            .sort(([, a], [, b]) => b - a)
            .map(([cat, amount]) => {
              const pct = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
              return (
                <div key={cat} className="flex items-center gap-4">
                  <span className="text-sm text-xploria-muted w-28 shrink-0 font-medium">{CATEGORY_LABELS[cat]}</span>
                  <div className="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden relative">
                    <div
                      className="h-full rounded-lg transition-all duration-700 flex items-center pl-2"
                      style={{ width: `${pct}%`, backgroundColor: CATEGORY_COLORS[cat] }}
                    >
                      {pct > 12 && (
                        <span className="text-xs text-white font-semibold">{pct.toFixed(0)}%</span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-xploria-text w-24 text-right shrink-0">
                    ₹{amount.toLocaleString("en-IN")}
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Daily spending */}
      {byDay.length > 0 && (
        <div className="bg-xploria-card border border-slate-200/80 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <h3 className="font-bold text-xploria-text mb-5 text-lg">Daily Spending</h3>
          <div className="flex items-end gap-2 h-40 overflow-x-auto pb-2">
            {byDay.map(({ date, amount }) => {
              const height = maxDay > 0 ? (amount / maxDay) * 100 : 0;
              const d = new Date(date + "T00:00:00");
              return (
                <div key={date} className="flex flex-col items-center gap-1 shrink-0 group">
                  <div className="relative">
                    <div
                      className="group-hover:opacity-85 transition-opacity w-8 bg-xploria-primary rounded-t-md"
                      style={{ height: `${Math.max(height, 4)}%`, minHeight: "4px" }}
                      title={`₹${amount}`}
                    />
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold">
                      ₹{amount.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <span className="text-xs text-xploria-muted font-medium">{d.getDate()}/{d.getMonth() + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Who spent most */}
      {byMember.length > 0 && (
        <div className="bg-xploria-card border border-slate-200/80 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <h3 className="font-bold text-xploria-text mb-5 text-lg">Paid By Member</h3>
          <div className="space-y-3">
            {byMember.map(({ id, name, amount }) => {
              const member = activeTrip.members.find((m) => m.id === id);
              const pct = maxMember > 0 ? (amount / maxMember) * 100 : 0;
              return (
                <div key={id} className="flex items-center gap-4">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: member?.avatarColor ?? "#10B981" }}
                  >
                    {name[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1 font-medium">
                      <span className="text-xploria-text font-semibold">{name}</span>
                      <span className="text-xploria-muted">₹{amount.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-xploria-primary rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
