// src/app/dashboard/expenses/page.tsx
"use client";

import { useState } from "react";
import { useTripStore, Expense, ExpenseCategory } from "@/lib/store/useTripStore";
import {
  Plus, X, Trash2, IndianRupee,
  Bus, Hotel, UtensilsCrossed, Binoculars, Ticket, ShoppingBag, MoreHorizontal
} from "lucide-react";
import clsx from "clsx";

const CATEGORIES: { value: ExpenseCategory; label: string; icon: React.ReactNode }[] = [
  { value: "transport",     label: "Transport",     icon: <Bus className="w-4 h-4" /> },
  { value: "accommodation", label: "Stay",          icon: <Hotel className="w-4 h-4" /> },
  { value: "food",          label: "Food",          icon: <UtensilsCrossed className="w-4 h-4" /> },
  { value: "sightseeing",   label: "Sightseeing",   icon: <Binoculars className="w-4 h-4" /> },
  { value: "tickets",       label: "Tickets",       icon: <Ticket className="w-4 h-4" /> },
  { value: "shopping",      label: "Shopping",      icon: <ShoppingBag className="w-4 h-4" /> },
  { value: "misc",          label: "Misc",          icon: <MoreHorizontal className="w-4 h-4" /> },
];

const CAT_COLORS: Record<ExpenseCategory, string> = {
  transport:      "bg-blue-50 text-blue-600 border border-blue-100",
  accommodation:  "bg-purple-50 text-purple-600 border border-purple-100",
  food:           "bg-amber-50 text-amber-600 border border-amber-100",
  sightseeing:    "bg-emerald-50 text-emerald-600 border border-emerald-100",
  tickets:        "bg-pink-50 text-pink-600 border border-pink-100",
  shopping:       "bg-orange-50 text-orange-600 border border-orange-100",
  misc:           "bg-slate-50 text-slate-600 border border-slate-100",
};

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

export default function ExpensesPage() {
  const { activeTrip, getTripExpenses, addExpense, deleteExpense } = useTripStore();

  const [showForm, setShowForm]       = useState(false);
  const [filterCat, setFilterCat]     = useState<ExpenseCategory | "all">("all");
  const [title, setTitle]             = useState("");
  const [amount, setAmount]           = useState("");
  const [category, setCategory]       = useState<ExpenseCategory>("misc");
  const [paidBy, setPaidBy]           = useState("me");
  const [splitAll, setSplitAll]       = useState(true);
  const [splitMembers, setSplitMembers] = useState<string[]>([]);
  const [date, setDate]               = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes]             = useState("");
  const [formError, setFormError]     = useState("");

  if (!activeTrip) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[60vh]">
        <div className="text-center border-2 border-dashed border-slate-200 bg-white rounded-2xl p-12 max-w-md shadow-sm">
          <p className="text-xploria-muted font-medium">Select or create a trip to log expenses.</p>
        </div>
      </div>
    );
  }

  const allExpenses   = getTripExpenses(activeTrip.id);
  const filtered      = filterCat === "all" ? allExpenses : allExpenses.filter((e) => e.category === filterCat);
  const totalFiltered = filtered.reduce((s, e) => s + e.amount, 0);

  const getMemberName = (id: string) =>
    id === "me" ? "You" : activeTrip.members.find((m) => m.id === id)?.name ?? id;

  const handleAddExpense = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) {
      setFormError("Title and a positive amount are required.");
      return;
    }

    const splitAmong = splitAll
      ? activeTrip.members.map((m) => m.id)
      : splitMembers.length > 0
      ? splitMembers
      : [paidBy];

    const expense: Expense = {
      id:          generateId(),
      tripId:      activeTrip.id,
      title:       title.trim(),
      amount:      Number(amount),
      category,
      paidBy,
      splitAmong,
      date,
      notes:       notes.trim() || undefined,
      createdAt:   Date.now(),
    };

    addExpense(expense);
    setTitle(""); setAmount(""); setNotes("");
    setCategory("misc"); setSplitAll(true); setSplitMembers([]);
    setShowForm(false); setFormError("");
  };

  const toggleSplitMember = (id: string) => {
    setSplitMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-xploria-text tracking-tight">Expenses</h1>
          <p className="text-xploria-muted mt-1 text-sm font-medium">{activeTrip.title}</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-xploria-primary hover:bg-xploria-primary-hover text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-md shadow-xploria-primary/10 active:scale-[0.98]"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "Add Expense"}
        </button>
      </div>

      {/* Add Expense Form */}
      {showForm && (
        <form
          onSubmit={handleAddExpense}
          className="bg-xploria-card border border-slate-200/80 rounded-2xl p-6 space-y-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
        >
          <h3 className="font-bold text-xploria-text text-lg">New Expense</h3>

          {/* Category */}
          <div>
            <label className="text-xs text-xploria-muted font-bold block mb-2 uppercase tracking-wider">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors",
                    category === c.value
                      ? "bg-xploria-primary/10 border-xploria-primary text-xploria-primary shadow-sm"
                      : "border-slate-200 bg-white text-xploria-muted hover:border-slate-300"
                  )}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title + Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="What was it for?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input text-sm"
              required
            />
            <div className="relative">
              <IndianRupee className="absolute left-3 top-3.5 h-4 w-4 text-xploria-muted" />
              <input
                type="number"
                min={0}
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input pl-10 text-sm"
                required
              />
            </div>
          </div>

          {/* Date + Paid By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input text-sm"
            />
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="input text-sm"
            >
              {activeTrip.members.map((m) => (
                <option key={m.id} value={m.id}>
                  Paid by {m.id === "me" ? "You" : m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Split */}
          <div>
            <label className="text-xs text-xploria-muted font-bold block mb-2 uppercase tracking-wider">Split Among</label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setSplitAll(true)}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
                  splitAll
                    ? "bg-xploria-primary/10 border-xploria-primary text-xploria-primary"
                    : "border-slate-200 bg-white text-xploria-muted"
                )}
              >
                Everyone
              </button>
              <button
                type="button"
                onClick={() => setSplitAll(false)}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
                  !splitAll
                    ? "bg-xploria-primary/10 border-xploria-primary text-xploria-primary"
                    : "border-slate-200 bg-white text-xploria-muted"
                )}
              >
                Select
              </button>
            </div>
            {!splitAll && (
              <div className="flex flex-wrap gap-2 animate-in fade-in duration-150">
                {activeTrip.members.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleSplitMember(m.id)}
                    className={clsx(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
                      splitMembers.includes(m.id)
                        ? "bg-xploria-primary/10 border-xploria-primary text-xploria-primary shadow-sm"
                        : "border-slate-200 bg-white text-xploria-muted hover:border-slate-300"
                    )}
                  >
                    {m.id === "me" ? "You" : m.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <textarea
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="input resize-none text-sm"
          />

          {formError && <p className="text-red-600 text-sm font-semibold">{formError}</p>}

          <button
            type="submit"
            className="w-full bg-xploria-primary hover:bg-xploria-primary-hover text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-md shadow-xploria-primary/10 active:scale-[0.99]"
          >
            Record Expense
          </button>
        </form>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterCat("all")}
          className={clsx(
            "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors shadow-sm",
            filterCat === "all"
              ? "bg-xploria-primary/10 border-xploria-primary text-xploria-primary"
              : "border-slate-200 bg-white text-xploria-muted hover:border-slate-300"
          )}
        >
          All ({allExpenses.length})
        </button>
        {CATEGORIES.map((c) => {
          const count = allExpenses.filter((e) => e.category === c.value).length;
          if (count === 0) return null;
          return (
            <button
              key={c.value}
              onClick={() => setFilterCat(c.value)}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors shadow-sm",
                filterCat === c.value
                  ? "bg-xploria-primary/10 border-xploria-primary text-xploria-primary"
                  : "border-slate-200 bg-white text-xploria-muted hover:border-slate-300"
              )}
            >
              {c.icon} {c.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Expenses List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-xploria-muted border-2 border-dashed border-slate-200 bg-white rounded-2xl shadow-sm">
          No expenses yet. Add one to start tracking.
        </div>
      ) : (
        <div className="space-y-3">
          {/* Total */}
          <div className="flex justify-between items-center px-1 pb-1 border-b border-slate-200">
            <span className="text-sm text-xploria-muted font-medium">{filtered.length} expenses</span>
            <span className="font-bold text-xploria-text">
              ₹{totalFiltered.toLocaleString("en-IN")}
            </span>
          </div>

          {filtered.map((exp) => {
            const catInfo = CATEGORIES.find((c) => c.value === exp.category);
            const perPerson = exp.amount / exp.splitAmong.length;
            return (
              <div
                key={exp.id}
                className="bg-xploria-card border border-slate-200/80 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 shadow-[0_4px_15px_rgba(0,0,0,0.01)] transition-all duration-200"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={clsx("p-2 rounded-lg shrink-0", CAT_COLORS[exp.category])}>
                    {catInfo?.icon}
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="font-bold text-xploria-text text-sm truncate">{exp.title}</p>
                    <p className="text-xs text-xploria-muted mt-1 font-semibold leading-none">
                      Paid by <span className="text-xploria-text">{getMemberName(exp.paidBy)}</span>
                      {" · "}split {exp.splitAmong.length} ways
                      {" · "}₹{perPerson.toFixed(0)}/person
                      {" · "}{new Date(exp.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                    {exp.notes && (
                      <p className="text-xs text-xploria-muted/80 mt-1.5 italic truncate bg-slate-50 px-2 py-1 rounded border border-slate-100">{exp.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-black text-xploria-primary text-base">
                    ₹{exp.amount.toLocaleString("en-IN")}
                  </span>
                  <button
                    onClick={() => deleteExpense(exp.id)}
                    className="p-1.5 text-xploria-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}