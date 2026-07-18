"use client";

import { useTripStore } from "@/lib/store/useTripStore";
import { ArrowRight } from "lucide-react";

export default function BillSplitter() {
  const activeTrip = useTripStore((state) => state.activeTrip);
  const expenses = useTripStore((state) => state.expenses) || [];
  const getTotalSpent = useTripStore((state) => state.getTotalSpent);
  const getSettlements = useTripStore((state) => state.getSettlements);
  
  if (!activeTrip) {
    return (
      <div className="bg-xploria-card p-6 rounded-2xl border border-gray-800 text-center shadow-lg">
        <h3 className="text-xl font-bold text-xploria-text mb-2">Settlements</h3>
        <p className="text-xploria-muted">Select a trip to see settlements.</p>
      </div>
    );
  }

  const total = getTotalSpent ? getTotalSpent(activeTrip.id) : 0;
  const settlements = getSettlements ? getSettlements(activeTrip.id) : [];

  if (expenses.length === 0) {
    return (
      <div className="bg-xploria-card p-6 rounded-2xl border border-gray-800 text-center shadow-lg">
        <h3 className="text-xl font-bold text-xploria-text mb-2">Settlements</h3>
        <p className="text-xploria-muted">No expenses recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-xploria-card p-6 rounded-2xl border border-gray-800 shadow-lg flex flex-col gap-6">
      <div>
        <h3 className="text-xl font-bold text-xploria-text mb-4">Total Spent: <span className="text-xploria-primary">₹{total}</span></h3>
        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
          {expenses.map((exp) => (
            <div key={exp.id} className="flex justify-between items-center bg-gray-900 p-3 rounded-lg border border-gray-800">
              <div>
                <p className="text-xploria-text text-sm font-medium">{exp.title} <span className="text-xs text-gray-500">({exp.category})</span></p>
              </div>
              <span className="text-gray-300 font-bold">₹{exp.amount}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-700 pt-4">
        <h3 className="text-lg font-bold text-xploria-text mb-4">How to Settle Up</h3>
        {settlements.length === 0 ? (
          <p className="text-sm text-xploria-primary bg-xploria-primary/10 p-3 rounded-lg">Everyone is settled up!</p>
        ) : (
          <div className="space-y-3">
            {settlements.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between bg-gray-900 p-3 rounded-lg border border-gray-800">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-300">{s.fromName}</span>
                  <ArrowRight className="w-4 h-4 text-xploria-muted" />
                  <span className="font-medium text-gray-300">{s.toName}</span>
                </div>
                <span className="font-bold text-rose-400">₹{s.amount}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}