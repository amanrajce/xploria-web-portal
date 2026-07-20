"use client";

import { useState } from "react";
import { useTripStore, Trip, TripType, ItineraryItem } from "@/lib/store/useTripStore";
import {
  Users, Compass,
  Map, CalendarDays, ArrowLeftRight, BarChart3,
  Heart, Trash2, UserCircle2, UsersRound, ArrowRight,
  CheckCircle2, Circle
} from "lucide-react";
import clsx from "clsx";

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

const TRIP_TYPES: { value: TripType; label: string; icon: React.ReactNode }[] = [
  { value: "friends", label: "Friends", icon: <UsersRound className="w-3.5 h-3.5" /> },
  { value: "couple",  label: "Couple",  icon: <Heart className="w-3.5 h-3.5" /> },
  { value: "solo",    label: "Solo",    icon: <UserCircle2 className="w-3.5 h-3.5" /> },
  { value: "family",  label: "Family",  icon: <Users className="w-3.5 h-3.5" /> },
];

const COVER_COLORS = ["#008cff", "#8b5cf6", "#f59e0b", "#10b981", "#ec4899", "#f97316"];

const CATEGORY_COLORS: Record<string, string> = {
  transport: "#008cff",
  accommodation: "#8b5cf6",
  food: "#f59e0b",
  sightseeing: "#10b981",
  tickets: "#ec4899",
  shopping: "#f97316",
  misc: "#64748b",
};

const CATEGORY_LABELS: Record<string, string> = {
  transport: "Transit",
  accommodation: "Stay",
  food: "Food",
  sightseeing: "Scenes",
  tickets: "Passes",
  shopping: "Shop",
  misc: "Other",
};

export default function ShowcaseDashboard() {
  const {
    trips, activeTrip, setActiveTrip, addTrip, deleteTrip,
    getTripExpenses, getTripItinerary, getTripTodos, getDaysArray,
    getMemberBalance, getSettlements, getTotalSpent,
    addItineraryItem, toggleItineraryItem, deleteItineraryItem,
    addExpense
  } = useTripStore();

  // Trips Form State
  const [tripType, setTripType] = useState<TripType>("friends");
  const [coverColor, setCoverColor] = useState(COVER_COLORS[0]);
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [formError, setFormError] = useState("");

  // Itinerary View State
  const [selectedDay, setSelectedDay] = useState(0);
  const [quickActivityTitle, setQuickActivityTitle] = useState("");
  const [mapViewOpen, setMapViewOpen] = useState(false);



  // 1. Create Trip handler
  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !destination || !startDate || !endDate || !budget) {
      setFormError("All fields are required.");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setFormError("End date must be after start date.");
      return;
    }

    const newTrip: Trip = {
      id: generateId(),
      title: title.trim(),
      destination: destination.trim(),
      startDate,
      endDate,
      budget: Number(budget),
      currency: "INR",
      type: tripType,
      coverColor,
      createdAt: Date.now(),
      members: [
        { id: "me", name: "You", email: "you@email.com", avatarColor: coverColor },
        { id: "member_1", name: "Priya", email: "priya@email.com", avatarColor: "#ec4899" },
        { id: "member_2", name: "Rahul", email: "rahul@email.com", avatarColor: "#8b5cf6" },
        { id: "member_3", name: "Zara", email: "zara@email.com", avatarColor: "#10b981" }
      ]
    };

    addTrip(newTrip);
    setActiveTrip(newTrip);
    
    // Reset Form
    setTitle(""); setDestination(""); setStartDate(""); setEndDate("");
    setBudget(""); setFormError("");
  };

  // 2. Add Activity handler
  const handleAddActivity = (e: React.FormEvent, days: string[]) => {
    e.preventDefault();
    if (!activeTrip || days.length === 0 || !quickActivityTitle.trim()) return;

    const currentDayDate = days[selectedDay];
    const newItem: ItineraryItem = {
      id: generateId(),
      tripId: activeTrip.id,
      day: selectedDay + 1,
      date: currentDayDate,
      title: quickActivityTitle.trim(),
      type: "activity",
      completed: false,
    };

    addItineraryItem(newItem);
    setQuickActivityTitle("");
  };

  // Compute Overall Statistics
  const totalTripsBudget = trips.reduce((sum, t) => sum + t.budget, 0);
  const activeTripsCount = trips.length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      
      {/* Dynamic Info Header Bar */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#16171b] border border-[#24262c] rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-xploria-primary/10 flex items-center justify-center border border-xploria-primary/20">
            <Compass className="w-5 h-5 text-xploria-primary" />
          </div>
          <div className="text-left">
            <h1 className="text-lg font-black tracking-tight text-white leading-none">Xploria Showcase</h1>
            <p className="text-xs text-xploria-muted font-semibold mt-1">High-Fidelity Real-time Dashboard (Premium Dark Mode)</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap text-xs font-semibold text-xploria-muted">
          <div className="px-3 py-1.5 bg-slate-800/40 border border-[#24262c] rounded-lg">
            Total Trips Budget: <span className="text-white font-extrabold">₹{totalTripsBudget.toLocaleString("en-IN")}</span>
          </div>
          <div className="px-3 py-1.5 bg-slate-800/40 border border-[#24262c] rounded-lg">
            Trips Count: <span className="text-white font-extrabold">{activeTripsCount}</span>
          </div>
          <div className="px-3 py-1.5 bg-xploria-primary/10 text-xploria-primary border border-xploria-primary/20 rounded-lg">
            Active: <span className="text-white font-extrabold">{activeTrip ? activeTrip.title : "None selected"}</span>
          </div>
        </div>
      </header>

      {/* 2x2 Grid Comparison Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* ========================================================
            PANEL 1: TRIPS DASHBOARD (Top-Left)
           ======================================================== */}
        <div className="bg-[#16171b] border border-[#24262c] rounded-3xl p-6 shadow-2xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                <Map className="w-4 h-4 text-xploria-primary" /> Trips Dashboard
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider text-xploria-muted">Real-Time Data</span>
            </div>

            {/* Quick Trip Plan inputs */}
            <form onSubmit={handleCreateTrip} className="space-y-3.5 bg-slate-900/30 border border-[#24262c] p-4.5 rounded-2xl">
              <h3 className="text-xs font-bold text-slate-350 uppercase tracking-wider mb-1 text-left">Plan a New Expedition</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Trip Name (e.g. Ladakh Trek)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input text-xs py-2"
                  required
                />
                <input
                  type="text"
                  placeholder="Destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="input text-xs py-2"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input text-xs py-2"
                  required
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input text-xs py-2"
                  required
                />
                <input
                  type="number"
                  placeholder="Budget (₹)"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="input text-xs py-2"
                  required
                />
              </div>

              {/* Trip Type Segmented control with Icons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TRIP_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTripType(t.value)}
                    className={clsx(
                      "flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl border text-[11px] font-bold transition-all duration-200 shadow-sm",
                      tripType === t.value
                        ? "bg-xploria-primary/10 border-xploria-primary text-xploria-primary"
                        : "border-[#24262c] bg-slate-900/60 text-xploria-muted hover:border-slate-800 hover:text-slate-350"
                    )}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              {/* Cover Color Selector */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-bold text-xploria-muted uppercase tracking-wider">Accent Theme Color</span>
                <div className="flex gap-1.5">
                  {COVER_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCoverColor(c)}
                      style={{ backgroundColor: c }}
                      className={clsx(
                        "w-4 h-4 rounded-full border border-[#0d0e12] transition-all",
                        coverColor === c ? "ring-2 ring-offset-2 ring-offset-slate-900 ring-xploria-primary scale-110" : "hover:scale-105"
                      )}
                    />
                  ))}
                </div>
              </div>

              {formError && <p className="text-red-400 text-xs font-semibold text-left">{formError}</p>}

              <button
                type="submit"
                className="w-full bg-xploria-primary hover:bg-xploria-primary-hover text-white font-bold py-2 rounded-xl text-xs transition-all active:scale-[0.99] shadow-md shadow-xploria-primary/10"
              >
                Create Trip Ledger
              </button>
            </form>

            {/* Trip Cards list */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {trips.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-[#24262c] bg-slate-900/10 rounded-2xl text-center">
                  <p className="text-xploria-muted text-xs font-semibold">No trips in your ledger. Create one above to begin.</p>
                </div>
              ) : (
                trips.map((trip) => {
                  const isActive = activeTrip?.id === trip.id;
                  const tripTodos = getTripTodos(trip.id);
                  const doneCount = tripTodos.filter((t) => t.done).length;
                  const progressPct = tripTodos.length > 0 ? Math.round((doneCount / tripTodos.length) * 100) : 0;
                  
                  return (
                    <div
                      key={trip.id}
                      className={clsx(
                        "bg-slate-900/40 border rounded-2xl p-4 space-y-3 hover:border-slate-800 transition-all duration-200 text-left",
                        isActive ? "border-xploria-primary bg-[#1e2026]/10" : "border-[#24262c]"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className="w-2.5 h-10 rounded-full shrink-0"
                            style={{ backgroundColor: trip.coverColor ?? "#008cff" }}
                          />
                          <div>
                            <h4 className="font-bold text-white text-sm leading-tight">{trip.title}</h4>
                            <p className="text-[11px] text-xploria-muted font-semibold mt-0.5">{trip.destination}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isActive ? (
                            <span className="text-[9px] bg-xploria-primary/10 text-xploria-primary px-2.5 py-0.5 rounded-full font-bold border border-xploria-primary/20">
                              Active
                            </span>
                          ) : (
                            <button
                              onClick={() => { setActiveTrip(trip); setSelectedDay(0); }}
                              className="text-[9px] bg-slate-800 hover:bg-slate-700 text-white px-2 py-0.5 rounded border border-[#24262c] font-bold transition-all"
                            >
                              Activate
                            </button>
                          )}
                          <button
                            onClick={() => deleteTrip(trip.id)}
                            className="text-xploria-muted hover:text-red-400 p-0.5 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-bold text-xploria-muted">
                          <span>Task Progress</span>
                          <span className="text-white">{progressPct}%</span>
                        </div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-xploria-primary rounded-full" style={{ width: `${progressPct}%` }} />
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex justify-between items-center pt-1 border-t border-[#24262c] text-[10px] text-xploria-muted">
                        <span>{trip.members.length} members</span>
                        <span className="font-black text-white">₹{trip.budget.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
          <div className="text-center text-[10px] text-xploria-muted pt-2 border-t border-[#24262c] font-bold uppercase tracking-wider">
            All data saved instantly to your cloud database
          </div>
        </div>

        {/* ========================================================
            PANEL 2: ITINERARY (Top-Right)
           ======================================================== */}
        <div className="bg-[#16171b] border border-[#24262c] rounded-3xl p-6 shadow-2xl space-y-6 flex flex-col justify-between">
          {activeTrip ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-xploria-primary" /> Itinerary Timeline
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider text-xploria-muted">Day Track</span>
              </div>

              {/* Day selectors based on activeTrip dates */}
              {(() => {
                const days = getDaysArray(activeTrip.id);
                const itinerary = getTripItinerary(activeTrip.id);
                const currentDayDate = days[selectedDay];
                const dayItems = currentDayDate ? itinerary.filter((i) => i.date === currentDayDate) : [];

                return (
                  <>
                    {days.length > 0 ? (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {days.map((d, i) => {
                          const dateObj = new Date(d + "T00:00:00");
                          const count = itinerary.filter((it) => it.date === d).length;
                          return (
                            <button
                              key={d}
                              type="button"
                              onClick={() => setSelectedDay(i)}
                              className={clsx(
                                "shrink-0 flex flex-col items-center px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-200",
                                selectedDay === i
                                  ? "bg-xploria-primary border-xploria-primary text-white shadow-md"
                                  : "border-[#24262c] bg-slate-900/40 text-xploria-muted hover:border-slate-800"
                              )}
                            >
                              <span className="opacity-75 text-[8px] uppercase tracking-wider">Day {i + 1}</span>
                              <span className="font-extrabold text-sm mt-0.5">{dateObj.getDate()}</span>
                              {count > 0 && (
                                <span className="mt-1 px-1 bg-xploria-primary/20 text-xploria-primary rounded text-[9px] font-bold">
                                  {count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-6 border border-[#24262c] bg-slate-900/20 rounded-2xl text-center">
                        <p className="text-xploria-muted text-xs font-semibold">Set trip start/end dates in Trips to generate calendar timeline.</p>
                      </div>
                    )}

                    {/* Active Day details */}
                    {currentDayDate && (
                      <div className="flex items-center justify-between bg-slate-900/30 border border-[#24262c] px-4 py-2.5 rounded-xl">
                        <div className="text-left">
                          <span className="text-[9px] text-xploria-muted font-bold uppercase tracking-wider">Active Day</span>
                          <p className="text-xs font-extrabold text-white mt-0.5">
                            {new Date(currentDayDate + "T00:00:00").toLocaleDateString("en-IN", {
                              weekday: "long", month: "short", day: "numeric"
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-xploria-muted font-semibold">Map View</span>
                          <button
                            onClick={() => setMapViewOpen(!mapViewOpen)}
                            className={clsx(
                              "w-8 h-5 rounded-full p-0.5 transition-colors duration-200 shrink-0",
                              mapViewOpen ? "bg-xploria-primary" : "bg-slate-700"
                            )}
                          >
                            <div className={clsx("w-4 h-4 bg-white rounded-full transition-transform", mapViewOpen ? "translate-x-3" : "translate-x-0")} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Timeline Activity Cards */}
                    <div className="space-y-3 relative text-left max-h-[260px] overflow-y-auto pr-1">
                      {dayItems.length === 0 ? (
                        <div className="py-8 text-center text-xploria-muted text-xs border border-dashed border-[#24262c] rounded-2xl">
                          No activities scheduled for this day.
                        </div>
                      ) : (
                        dayItems.map((item) => (
                          <div
                            key={item.id}
                            className={clsx(
                              "flex gap-3 bg-slate-900/40 border rounded-2xl p-3 hover:border-slate-800 transition-all text-left",
                              item.completed ? "border-slate-800 opacity-60" : "border-[#24262c]"
                            )}
                          >
                            <button
                              onClick={() => toggleItineraryItem(item.id)}
                              className="mt-0.5 text-xploria-muted hover:text-xploria-primary shrink-0"
                            >
                              {item.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-xploria-primary" />
                              ) : (
                                <Circle className="w-5 h-5" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-xploria-primary font-bold uppercase tracking-wider">
                                  {item.time || "Flexible"}
                                </span>
                                <button
                                  onClick={() => deleteItineraryItem(item.id)}
                                  className="text-xploria-muted hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <h4 className="font-bold text-white text-xs mt-0.5">{item.title}</h4>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Quick activity create */}
                    {days.length > 0 && (
                      <form onSubmit={(e) => handleAddActivity(e, days)} className="flex gap-2 pt-2 border-t border-[#24262c]">
                        <input
                          type="text"
                          placeholder="Quick add activity (e.g. Visit Monastery)"
                          value={quickActivityTitle}
                          onChange={(e) => setQuickActivityTitle(e.target.value)}
                          className="input flex-1 text-xs py-2"
                          required
                        />
                        <button
                          type="submit"
                          className="px-3 bg-xploria-primary hover:bg-xploria-primary-hover text-white rounded-xl text-xs font-bold transition-all"
                        >
                          Add
                        </button>
                      </form>
                    )}
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="py-20 text-center text-xploria-muted space-y-3">
              <CalendarDays className="w-8 h-8 mx-auto text-[#24262c]" />
              <p className="text-sm font-semibold">Select a trip in the Trips Dashboard panel to view itinerary cards.</p>
            </div>
          )}
          
          <div className="text-center text-[10px] text-xploria-muted font-bold uppercase tracking-wider mt-2">
            Build your day-by-day itineraries dynamically
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* ========================================================
            PANEL 3: SETTLEMENTS (Bottom-Left)
           ======================================================== */}
        <div className="bg-[#16171b] border border-[#24262c] rounded-3xl p-6 shadow-2xl space-y-6 flex flex-col justify-between">
          {activeTrip ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <ArrowLeftRight className="w-4 h-4 text-xploria-primary" /> Settlements & Balances
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider text-xploria-muted">Member Ledger</span>
              </div>

              {(() => {
                const balances = getMemberBalance(activeTrip.id);
                const totalSpent = getTotalSpent(activeTrip.id);
                const settlements = getSettlements(activeTrip.id);

                return (
                  <>
                    {/* Member Balances Progress List */}
                    <div className="bg-slate-900/30 border border-[#24262c] p-4.5 rounded-2xl space-y-3.5 text-left">
                      <h3 className="text-xs font-bold text-slate-350 uppercase tracking-wider">Balances Status</h3>
                      <div className="space-y-3">
                        {activeTrip.members.map((m) => {
                          const bal = balances[m.id] ?? 0;
                          const isOwed = bal > 0.01;
                          const isOwing = bal < -0.01;
                          const pct = totalSpent > 0 ? Math.min((Math.abs(bal) / totalSpent) * 100, 100) : 0;

                          return (
                            <div key={m.id} className="flex items-center gap-3">
                              <div
                                className="w-6.5 h-6.5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 shadow-sm"
                                style={{ backgroundColor: m.avatarColor ?? "#008cff" }}
                              >
                                {(m.id === "me" ? "Y" : m.name[0]).toUpperCase()}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between text-xs font-bold mb-1">
                                  <span className="text-slate-300">{m.id === "me" ? "You" : m.name}</span>
                                  <span className={clsx(isOwed ? "text-emerald-400" : isOwing ? "text-red-400" : "text-xploria-muted")}>
                                    {isOwed ? "+" : ""}₹{Math.abs(bal).toFixed(0)}
                                  </span>
                                </div>
                                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                  <div
                                    className={clsx("h-full rounded-full", isOwed ? "bg-emerald-500" : isOwing ? "bg-red-500" : "bg-slate-700")}
                                    style={{ width: `${pct || 1}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Settlement transaction plan list */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-slate-350 uppercase tracking-wider text-left">Settle Transactions</h3>
                      
                      <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                        {settlements.length === 0 ? (
                          <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold py-6 text-xs bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                            <CheckCircle2 className="w-4 h-4" /> All ledger bills settled up!
                          </div>
                        ) : (
                          settlements.map((s, idx) => {
                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between border rounded-xl px-3.5 py-2.5 bg-slate-900/40 text-left transition-all border-[#24262c]"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="text-center">
                                    <div className="w-7 h-7 rounded-full bg-red-500/15 border border-red-500/20 flex items-center justify-center text-[10px] font-bold text-red-400 mx-auto">
                                      {s.fromName[0].toUpperCase()}
                                    </div>
                                  </div>
                                  
                                  <div className="flex flex-col items-center gap-0.5 min-w-[60px]">
                                    <span className="text-xs font-black text-white">₹{s.amount.toFixed(0)}</span>
                                    <div className="flex items-center gap-0.5 text-xploria-muted">
                                      <div className="w-3.5 h-px bg-slate-700" />
                                      <ArrowRight className="w-2 h-2" />
                                      <div className="w-3.5 h-px bg-slate-700" />
                                    </div>
                                  </div>

                                  <div className="text-center">
                                    <div className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-400 mx-auto">
                                      {s.toName[0].toUpperCase()}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      addExpense({
                                        id: generateId(),
                                        tripId: activeTrip.id,
                                        title: `Settle: ${s.fromName} paid ${s.toName}`,
                                        amount: s.amount,
                                        category: "misc",
                                        paidBy: s.from,
                                        splitAmong: [s.to],
                                        date: new Date().toISOString().split("T")[0],
                                        createdAt: 0,
                                      });
                                    }}
                                    className="px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all border bg-xploria-primary border-xploria-primary text-white hover:bg-xploria-primary-hover active:scale-95 shadow-md shadow-xploria-primary/10"
                                  >
                                    Settle Up
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="py-20 text-center text-xploria-muted space-y-3">
              <ArrowLeftRight className="w-8 h-8 mx-auto text-[#24262c]" />
              <p className="text-sm font-semibold">Select a trip in the Trips Dashboard panel to load member settlements.</p>
            </div>
          )}
          
          <div className="text-center text-[10px] text-xploria-muted font-bold uppercase tracking-wider mt-2">
            Calculate split balances automatically from logging expenses
          </div>
        </div>

        {/* ========================================================
            PANEL 4: ANALYTICS (Bottom-Right)
           ======================================================== */}
        <div className="bg-[#16171b] border border-[#24262c] rounded-3xl p-6 shadow-2xl space-y-6 flex flex-col justify-between">
          {activeTrip ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-xploria-primary" /> Spending Analytics
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider text-xploria-muted">Stats View</span>
              </div>

              {(() => {
                const expenses = getTripExpenses(activeTrip.id);
                const totalSpent = getTotalSpent(activeTrip.id);
                const remaining = activeTrip.budget - totalSpent;
                const days = getDaysArray(activeTrip.id);
                const dailyAvg = totalSpent / (days.length || 1);

                // Category aggregates
                const catTotals: Record<string, number> = {};
                expenses.forEach(e => {
                  catTotals[e.category] = (catTotals[e.category] ?? 0) + e.amount;
                });
                const sortedCategories = Object.entries(catTotals).sort((a,b) => b[1] - a[1]);

                // Daily spending line graph points
                const dateTotals: Record<string, number> = {};
                days.forEach(d => { dateTotals[d] = 0; });
                expenses.forEach(e => {
                  if (dateTotals[e.date] !== undefined) {
                    dateTotals[e.date] += e.amount;
                  }
                });
                const dailyAmounts = Object.values(dateTotals);
                const maxAmount = Math.max(...dailyAmounts, 1000);

                const linePoints = dailyAmounts.map((val, idx) => {
                  const x = (idx / Math.max(dailyAmounts.length - 1, 1)) * 90 + 5;
                  const y = 45 - (val / maxAmount) * 35;
                  return `${idx === 0 ? 'M' : 'L'} ${x},${y}`;
                }).join(' ');

                const fillPoints = dailyAmounts.length > 0 ? `${linePoints} L 95,50 L 5,50 Z` : "";

                // Payment distribution breakdown
                const payers: Record<string, number> = {};
                activeTrip.members.forEach(m => { payers[m.id] = 0; });
                expenses.forEach(e => {
                  payers[e.paidBy] = (payers[e.paidBy] ?? 0) + e.amount;
                });

                return (
                  <>
                    {/* Metrics Row */}
                    <div className="grid grid-cols-3 gap-2 text-left">
                      <div className="bg-slate-900/30 border border-[#24262c] p-2.5 rounded-xl">
                        <span className="text-[8px] text-xploria-muted font-bold uppercase tracking-wider block">Total Spent</span>
                        <p className="text-sm font-black mt-1 text-blue-400">₹{totalSpent.toLocaleString("en-IN")}</p>
                        <span className="text-[8px] text-xploria-muted font-semibold block mt-0.5">{expenses.length} records</span>
                      </div>
                      <div className="bg-slate-900/30 border border-[#24262c] p-2.5 rounded-xl">
                        <span className="text-[8px] text-xploria-muted font-bold uppercase tracking-wider block">Remaining</span>
                        <p className={clsx("text-sm font-black mt-1", remaining >= 0 ? "text-emerald-400" : "text-red-400")}>
                          ₹{Math.abs(remaining).toLocaleString("en-IN")}
                        </p>
                        <span className="text-[8px] text-xploria-muted font-semibold block mt-0.5">{remaining >= 0 ? "under budget" : "over budget"}</span>
                      </div>
                      <div className="bg-slate-900/30 border border-[#24262c] p-2.5 rounded-xl">
                        <span className="text-[8px] text-xploria-muted font-bold uppercase tracking-wider block">Daily Avg</span>
                        <p className="text-sm font-black mt-1 text-purple-400">₹{dailyAvg.toFixed(0)}</p>
                        <span className="text-[8px] text-xploria-muted font-semibold block mt-0.5">{days.length} days range</span>
                      </div>
                    </div>

                    {/* Chart Rows */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Trendline chart */}
                      <div className="bg-slate-900/30 border border-[#24262c] p-3 rounded-xl space-y-2">
                        <span className="text-[9px] text-xploria-muted font-bold uppercase tracking-wider block text-left">Daily Spending</span>
                        <div className="h-24 w-full relative flex items-end">
                          {expenses.length === 0 ? (
                            <span className="text-[9px] text-xploria-muted font-bold m-auto">No expenses to plot trend</span>
                          ) : (
                            <>
                              <svg className="w-full h-full text-xploria-primary overflow-visible" viewBox="0 0 100 50">
                                <path d={linePoints} fill="none" stroke="currentColor" strokeWidth="2.5" />
                                {fillPoints && <path d={fillPoints} fill="url(#grad_showcase)" className="opacity-15" />}
                                <defs>
                                  <linearGradient id="grad_showcase" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="var(--color-xploria-primary)" />
                                    <stop offset="100%" stopColor="transparent" />
                                  </linearGradient>
                                </defs>
                              </svg>
                              <div className="absolute top-2 left-2 bg-slate-950/80 border border-[#24262c] text-[8px] text-white px-1.5 py-0.5 rounded font-bold">
                                Max Peak: ₹{maxAmount.toFixed(0)}
                              </div>
                            </>
                          )}
                        </div>
                        <div className="flex justify-between text-[8px] text-xploria-muted font-bold uppercase">
                          <span>Start</span>
                          <span>End</span>
                        </div>
                      </div>

                      {/* Category distribution breakdown */}
                      <div className="bg-slate-900/30 border border-[#24262c] p-3 rounded-xl space-y-2">
                        <span className="text-[9px] text-xploria-muted font-bold uppercase tracking-wider block text-left">Category Breakdown</span>
                        <div className="max-h-[96px] overflow-y-auto space-y-1.5 text-left text-[9px] font-bold text-xploria-muted">
                          {sortedCategories.length === 0 ? (
                            <span className="text-[9px] text-xploria-muted font-bold text-center block py-6">No data logged</span>
                          ) : (
                            sortedCategories.map(([cat, val]) => {
                              const pct = totalSpent > 0 ? (val / totalSpent) * 100 : 0;
                              const color = CATEGORY_COLORS[cat] ?? "#cbd5e1";
                              return (
                                <div key={cat} className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                    {CATEGORY_LABELS[cat] || cat}
                                  </span>
                                  <span className="text-white">₹{val.toFixed(0)} ({pct.toFixed(0)}%)</span>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Paid distribution table */}
                    <div className="bg-slate-900/30 border border-[#24262c] p-3 rounded-xl space-y-2">
                      <span className="text-[9px] text-xploria-muted font-bold uppercase tracking-wider block text-left">Expense Payer Weight</span>
                      <div className="space-y-1.5">
                        {activeTrip.members.map((m) => {
                          const paidVal = payers[m.id] ?? 0;
                          const weightPct = totalSpent > 0 ? Math.round((paidVal / totalSpent) * 100) : 0;
                          return (
                            <div key={m.id} className="flex items-center justify-between text-xs font-semibold">
                              <span className="text-slate-350 text-[11px]">{m.id === "me" ? "You" : m.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xploria-muted text-[10px]">₹{paidVal.toLocaleString("en-IN")}</span>
                                <span className="text-white font-bold bg-slate-800 px-1 py-0.5 rounded text-[8px]">{weightPct}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="py-20 text-center text-xploria-muted space-y-3">
              <BarChart3 className="w-8 h-8 mx-auto text-[#24262c]" />
              <p className="text-sm font-semibold">Select a trip in the Trips Dashboard panel to load expense analytics.</p>
            </div>
          )}
          
          <div className="text-center text-[10px] text-xploria-muted font-bold uppercase tracking-wider mt-2">
            Track daily metrics and category weights dynamically
          </div>
        </div>

      </div>
      
    </div>
  );
}
