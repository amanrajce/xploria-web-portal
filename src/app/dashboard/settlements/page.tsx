// src/app/dashboard/settlements/page.tsx
"use client";

import { useTripStore } from "@/lib/store/useTripStore";
import { ArrowRight, CheckCircle2, IndianRupee } from "lucide-react";
import clsx from "clsx";

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

export default function SettlementsPage() {
  const { activeTrip, getSettlements, getMemberBalance, getTotalSpent, addExpense } = useTripStore();

  if (!activeTrip) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[60vh]">
        <div className="text-center border-2 border-dashed border-[#24262c] bg-xploria-card rounded-2xl p-12 max-w-md shadow-2xl">
          <p className="text-xploria-muted font-bold">Select a trip to see settlements.</p>
        </div>
      </div>
    );
  }

  const settlements = getSettlements(activeTrip.id);
  const balances    = getMemberBalance(activeTrip.id);
  const totalSpent  = getTotalSpent(activeTrip.id);

  const handleSettle = (fromId: string, fromName: string, toId: string, toName: string, amount: number) => {
    addExpense({
      id: generateId(),
      tripId: activeTrip.id,
      title: `Settle: ${fromName} paid ${toName}`,
      amount: amount,
      category: "misc",
      paidBy: fromId,
      splitAmong: [toId],
      date: new Date().toISOString().split("T")[0],
      createdAt: 0,
    });
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200 text-left">
      <header>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Settlements</h1>
        <div className="flex items-center gap-2 text-xploria-muted mt-1 text-sm font-semibold">
          <span>{activeTrip.title}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-750 shrink-0" />
          <span>debt settlement plan</span>
        </div>
      </header>

      {/* Member Balances */}
      <div className="bg-xploria-card border border-[#24262c] rounded-2xl p-6 shadow-xl">
        <h3 className="font-bold text-white mb-4 text-lg">Member Balances</h3>
        <div className="space-y-3">
          {activeTrip.members.map((member) => {
            const balance = balances[member.id] ?? 0;
            const isPositive = balance > 0.01;
            const isNegative = balance < -0.01;
            const pct = totalSpent > 0 ? Math.abs(balance / totalSpent) * 100 : 0;

            return (
              <div key={member.id} className="flex items-center gap-4">
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-sm"
                  style={{ backgroundColor: member.avatarColor ?? "#10B981" }}
                >
                  {(member.id === "me" ? "Y" : member.name[0]).toUpperCase()}
                </div>

                {/* Name + bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-sm mb-1 font-semibold">
                    <span className="text-white">
                      {member.id === "me" ? "You" : member.name}
                    </span>
                    <span
                      className={clsx(
                        "font-bold",
                        isPositive ? "text-emerald-400" : isNegative ? "text-red-400" : "text-xploria-muted"
                      )}
                    >
                      {isPositive ? "+" : ""}₹{Math.abs(balance).toFixed(0)}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-800/40 rounded-full overflow-hidden">
                    <div
                      className={clsx(
                        "h-full rounded-full transition-all duration-700",
                        isPositive ? "bg-emerald-500" : isNegative ? "bg-red-500" : "bg-slate-700"
                      )}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-xploria-muted mt-1 font-semibold">
                    {isPositive ? "is owed" : isNegative ? "owes" : "settled"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settlement Plan */}
      <div className="bg-xploria-card border border-[#24262c] rounded-2xl p-6 shadow-xl">
        <h3 className="font-bold text-white mb-1 text-lg">Settlement Plan</h3>
        <p className="text-xs text-xploria-muted mb-5 font-semibold">
          Minimum transactions needed to settle all debts.
        </p>

        {settlements.length === 0 ? (
          <div className="flex items-center gap-3 text-emerald-400 py-4 font-semibold">
            <CheckCircle2 className="w-5 h-5" />
            <span>Everyone is settled up!</span>
          </div>
        ) : (
          <div className="space-y-3">
            {settlements.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 border border-[#24262c] rounded-xl px-5 py-4 bg-slate-900/40 shadow-md text-left"
              >
                <div className="flex items-center gap-6">
                  {/* From */}
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-sm font-bold text-red-400 mx-auto shadow-sm">
                      {s.fromName[0].toUpperCase()}
                    </div>
                    <p className="text-xs text-xploria-muted font-bold mt-1.5 max-w-[72px] truncate">{s.fromName}</p>
                  </div>

                  {/* Arrow + amount */}
                  <div className="flex flex-col items-center gap-0.5 min-w-[100px]">
                    <span className="text-lg font-black text-white">
                      ₹{s.amount.toLocaleString("en-IN")}
                    </span>
                    <div className="flex items-center gap-1 text-slate-700">
                      <div className="w-8 h-px bg-slate-700" />
                      <ArrowRight className="w-4 h-4" />
                      <div className="w-8 h-px bg-slate-700" />
                    </div>
                    <span className="text-xs text-xploria-muted font-bold uppercase tracking-wider">pays</span>
                  </div>

                  {/* To */}
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-sm font-bold text-emerald-400 mx-auto shadow-sm">
                      {s.toName[0].toUpperCase()}
                    </div>
                    <p className="text-xs text-xploria-muted font-bold mt-1.5 max-w-[72px] truncate">{s.toName}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleSettle(s.from, s.fromName, s.to, s.toName, s.amount)}
                  className="flex items-center gap-1.5 bg-xploria-primary hover:bg-xploria-primary-hover text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-xploria-primary/10 active:scale-95"
                >
                  <IndianRupee className="w-3.5 h-3.5" />
                  Settle Up
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}