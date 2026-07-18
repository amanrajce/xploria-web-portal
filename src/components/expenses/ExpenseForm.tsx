"use client";

import { useState } from "react";
import { useTripStore, ExpenseCategory } from "@/lib/store/useTripStore";

export default function ExpenseForm() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("misc");
  
  const addExpense = useTripStore((state) => state.addExpense);
  const activeTrip = useTripStore((state) => state.activeTrip);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrip) return alert("Select a trip first!");

    addExpense({
      id: Date.now().toString(),
      tripId: activeTrip.id,
      title,
      amount: Number(amount),
      category,
      paidBy: "me", // Assuming logged in user
      splitAmong: activeTrip.members.map(m => m.id),
      date: new Date().toISOString().split("T")[0],
      createdAt: Date.now(),
    });

    setTitle("");
    setAmount("");
  };

  if (!activeTrip) return null;

  return (
    <form onSubmit={handleSubmit} className="bg-xploria-card p-6 rounded-2xl border border-gray-800 space-y-4 shadow-lg">
      <h3 className="text-lg font-bold text-xploria-text">Add Shared Expense</h3>
      <div className="flex flex-col gap-4">
        <input className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-xploria-text focus:ring-2 focus:ring-xploria-primary outline-none" placeholder="Description (e.g., Dinner at Cafe)" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <div className="flex gap-4">
          <input type="number" className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-3 text-xploria-text focus:ring-2 focus:ring-xploria-primary outline-none" placeholder="Amount (₹)" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          <select className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-3 text-xploria-text outline-none" value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)}>
            <option value="food">Restaurant / Food</option>
            <option value="accommodation">Accommodation</option>
            <option value="transport">Travel</option>
            <option value="sightseeing">Sightseeing</option>
            <option value="misc">Other</option>
          </select>
        </div>
      </div>
      <button className="w-full bg-xploria-primary text-white py-3 rounded-lg font-bold hover:bg-emerald-600 transition shadow-md">Split Bill</button>
    </form>
  );
}