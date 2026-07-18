// src/app/dashboard/bill-split/page.tsx
"use client";

import { useState, useMemo } from "react";
import { useTripStore } from "@/lib/store/useTripStore";
import { UtensilsCrossed, IndianRupee } from "lucide-react";
import clsx from "clsx";

interface DinerItem {
  memberId: string;
  subtotal: number; // their personal item total
}

export default function BillSplitterPage() {
  const { activeTrip } = useTripStore();

  const [restaurantName, setRestaurantName] = useState("");
  const [taxPct, setTaxPct]                 = useState("5");
  const [tipPct, setTipPct]                 = useState("10");
  const [diners, setDiners]                 = useState<DinerItem[]>([]);
  const [splitEvenly, setSplitEvenly]       = useState(true);

  const members = useMemo(() => {
    return activeTrip?.members ?? [];
  }, [activeTrip]);

  // Initialize diners when switching modes
  const ensureDiner = (memberId: string) => {
    if (!diners.find((d) => d.memberId === memberId)) {
      setDiners((prev) => [...prev, { memberId, subtotal: 0 }]);
    }
  };

  const updateDiner = (memberId: string, subtotal: number) => {
    setDiners((prev) =>
      prev.map((d) => (d.memberId === memberId ? { ...d, subtotal } : d))
    );
  };

  const subtotal = diners.reduce((s, d) => s + d.subtotal, 0);
  const tax      = subtotal * (Number(taxPct) / 100);
  const tip      = subtotal * (Number(tipPct) / 100);
  const total    = subtotal + tax + tip;

  const perPersonBreakdown = useMemo(() => {
    if (diners.length === 0 || total === 0 || !subtotal) return [];
    const multiplier = total / subtotal;

    return members.map((m) => {
      const diner = diners.find((d) => d.memberId === m.id);
      if (splitEvenly) {
        return { member: m, amount: total / (members.length || 1) };
      }
      const personalSubtotal = diner?.subtotal ?? 0;
      return { member: m, amount: personalSubtotal * multiplier };
    });
  }, [diners, total, subtotal, members, splitEvenly]);

  if (!activeTrip) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center border-2 border-dashed border-[#24262c] bg-xploria-card rounded-2xl p-12 max-w-md shadow-2xl">
          <p className="text-xploria-muted font-bold">Select a trip to use the bill splitter.</p>
        </div>
      </div>
    );
  }

  const handleReset = () => {
    setRestaurantName(""); setTaxPct("5"); setTipPct("10");
    setDiners([]); setSplitEvenly(true);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200 text-left">
      <header>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Bill Splitter</h1>
        <p className="text-xploria-muted mt-1 text-sm font-semibold">Split restaurant bills with tax and tip, fairly.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
        {/* Input Panel */}
        <div className="space-y-5">
          {/* Restaurant name */}
          <div className="relative">
            <UtensilsCrossed className="absolute left-3 top-3.5 h-4 w-4 text-xploria-muted" />
            <input
              type="text"
              placeholder="Restaurant name (optional)"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className="input pl-10 text-sm"
            />
          </div>

          {/* Tax + Tip */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-xploria-muted font-bold block mb-1 uppercase tracking-wider">Tax %</label>
              <input
                type="number"
                min={0}
                max={50}
                value={taxPct}
                onChange={(e) => setTaxPct(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="text-xs text-xploria-muted font-bold block mb-1 uppercase tracking-wider">Tip %</label>
              <input
                type="number"
                min={0}
                max={100}
                value={tipPct}
                onChange={(e) => setTipPct(e.target.value)}
                className="input"
              />
            </div>
          </div>

          {/* Split Mode */}
          <div>
            <label className="text-xs text-xploria-muted font-bold block mb-2 uppercase tracking-wider">Split Mode</label>
            <div className="flex gap-2">
              <button
                onClick={() => setSplitEvenly(true)}
                className={clsx(
                  "flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors shadow-sm",
                  splitEvenly
                    ? "bg-xploria-primary/10 border-xploria-primary text-xploria-primary"
                    : "border-[#24262c] bg-slate-900/60 text-xploria-muted hover:border-slate-800 hover:text-slate-350"
                )}
              >
                Split Evenly
              </button>
              <button
                onClick={() => setSplitEvenly(false)}
                className={clsx(
                  "flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors shadow-sm",
                  !splitEvenly
                    ? "bg-xploria-primary/10 border-xploria-primary text-xploria-primary"
                    : "border-[#24262c] bg-slate-900/60 text-xploria-muted hover:border-slate-800 hover:text-slate-355"
                )}
              >
                By Item
              </button>
            </div>
          </div>

          {/* Members + subtotals */}
          <div>
            <label className="text-xs text-xploria-muted font-bold block mb-2 uppercase tracking-wider">
              {splitEvenly ? "Grand Total (₹)" : "Each Person's Item Total (₹)"}
            </label>
            <div className="space-y-2">
              {members.map((m) => {
                const diner = diners.find((d) => d.memberId === m.id);
                return (
                  <div key={m.id} className="flex items-center gap-3 bg-slate-900/40 border border-[#24262c] rounded-xl px-4 py-3 shadow-md">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: m.avatarColor ?? "#10B981" }}
                    >
                      {(m.id === "me" ? "Y" : m.name[0]).toUpperCase()}
                    </div>
                    <span className="flex-1 text-sm font-semibold text-white">
                      {m.id === "me" ? "You" : m.name}
                    </span>
                    {splitEvenly ? (
                      // In even mode only show one input for the total
                      m.id === members[0].id ? (
                        <div className="relative w-28">
                          <IndianRupee className="absolute left-2 top-2.5 h-3.5 w-3.5 text-xploria-muted" />
                          <input
                            type="number"
                            min={0}
                            placeholder="Total"
                            value={diner?.subtotal || ""}
                            onChange={(e) => {
                              ensureDiner(m.id);
                              // Put the whole amount on the first person — math spreads it
                              updateDiner(m.id, Number(e.target.value));
                            }}
                            className="input pl-7 py-2 text-sm w-full font-medium"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-xploria-muted font-bold italic uppercase tracking-wider">even split</span>
                      )
                    ) : (
                      <div className="relative w-28">
                        <IndianRupee className="absolute left-2 top-2.5 h-3.5 w-3.5 text-xploria-muted" />
                        <input
                          type="number"
                          min={0}
                          placeholder="0"
                          value={diner?.subtotal || ""}
                          onChange={(e) => {
                            ensureDiner(m.id);
                            updateDiner(m.id, Number(e.target.value));
                          }}
                          className="input pl-7 py-2 text-sm w-full font-medium"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full border border-[#24262c] text-xploria-muted hover:text-white hover:border-slate-700 py-2.5 bg-[#1a1b20] rounded-xl text-sm font-bold transition-all shadow-sm active:scale-[0.98]"
          >
            Reset
          </button>
        </div>

        {/* Summary Panel */}
        <div className="space-y-5">
          <div className="bg-xploria-card border border-[#24262c] rounded-2xl p-6 shadow-xl">
            <h3 className="font-bold text-white mb-4 text-lg">
              {restaurantName ? restaurantName : "Bill Summary"}
            </h3>

            <div className="space-y-2.5 text-sm font-semibold">
              <Row label="Subtotal" value={`₹${subtotal.toFixed(2)}`} />
              <Row label={`Tax (${taxPct}%)`} value={`₹${tax.toFixed(2)}`} />
              <Row label={`Tip (${tipPct}%)`} value={`₹${tip.toFixed(2)}`} />
              <div className="border-t border-[#24262c] pt-2.5 mt-2.5">
                <Row label="Total" value={`₹${total.toFixed(2)}`} bold />
              </div>
            </div>
          </div>

          {/* Per Person */}
          {perPersonBreakdown.length > 0 && total > 0 && (
            <div className="bg-xploria-card border border-[#24262c] rounded-2xl p-6 shadow-xl animate-in fade-in duration-200">
              <h3 className="font-bold text-white mb-4 text-lg">Each Person Owes</h3>
              <div className="space-y-3">
                {perPersonBreakdown.map(({ member, amount }) => (
                  <div key={member.id} className="flex items-center justify-between font-semibold">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: member.avatarColor ?? "#10B981" }}
                      >
                        {(member.id === "me" ? "Y" : member.name[0]).toUpperCase()}
                      </div>
                      <span className="text-sm text-white">
                        {member.id === "me" ? "You" : member.name}
                      </span>
                    </div>
                    <span className="font-black text-xploria-primary">
                      ₹{amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={clsx("flex justify-between", bold && "font-black text-base text-white")}>
      <span className={bold ? "text-white" : "text-xploria-muted font-medium"}>{label}</span>
      <span className={bold ? "text-xploria-primary" : "text-white"}>{value}</span>
    </div>
  );
}