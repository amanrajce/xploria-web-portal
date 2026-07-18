// src/app/dashboard/itinerary/page.tsx
"use client";

import { useState } from "react";
import { useTripStore, ItineraryItem, ItineraryItemType } from "@/lib/store/useTripStore";
import {
  Plus, X, Trash2, CheckCircle2, Circle,
  Bus, Hotel, UtensilsCrossed, Binoculars, StickyNote, Clock, MapPin
} from "lucide-react";
import clsx from "clsx";

const ITEM_TYPES: { value: ItineraryItemType; label: string; icon: React.ReactNode; color: string }[] = [
  { value: "activity",      label: "Activity",     icon: <Binoculars className="w-4 h-4" />,       color: "text-emerald-400 bg-emerald-500/15" },
  { value: "transport",     label: "Transport",    icon: <Bus className="w-4 h-4" />,               color: "text-blue-400 bg-blue-500/15" },
  { value: "accommodation", label: "Stay",         icon: <Hotel className="w-4 h-4" />,             color: "text-purple-400 bg-purple-500/15" },
  { value: "meal",          label: "Meal",         icon: <UtensilsCrossed className="w-4 h-4" />,   color: "text-amber-400 bg-amber-500/15" },
  { value: "note",          label: "Note",         icon: <StickyNote className="w-4 h-4" />,        color: "text-gray-400 bg-gray-500/15" },
];

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

export default function ItineraryPage() {
  const {
    activeTrip, getTripItinerary, getDaysArray,
    addItineraryItem, deleteItineraryItem, toggleItineraryItem,
  } = useTripStore();

  const [selectedDay, setSelectedDay] = useState(0); // index
  const [showForm, setShowForm]       = useState(false);
  const [itemTitle, setItemTitle]     = useState("");
  const [itemType, setItemType]       = useState<ItineraryItemType>("activity");
  const [itemTime, setItemTime]       = useState("");
  const [itemLocation, setItemLocation] = useState("");
  const [itemDesc, setItemDesc]       = useState("");
  const [formError, setFormError]     = useState("");

  if (!activeTrip) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center border-2 border-dashed border-gray-800 rounded-2xl p-12 max-w-md">
          <p className="text-xploria-muted">Select a trip to build your itinerary.</p>
        </div>
      </div>
    );
  }

  const days        = getDaysArray(activeTrip.id);
  const itinerary   = getTripItinerary(activeTrip.id);
  const currentDate = days[selectedDay];
  const dayItems    = itinerary.filter((i) => i.date === currentDate);

  const handleAdd = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!itemTitle.trim()) {
      setFormError("Title is required.");
      return;
    }

    const newItem: ItineraryItem = {
      id:          generateId(),
      tripId:      activeTrip.id,
      day:         selectedDay + 1,
      date:        currentDate,
      time:        itemTime || undefined,
      title:       itemTitle.trim(),
      description: itemDesc.trim() || undefined,
      type:        itemType,
      location:    itemLocation.trim() || undefined,
      completed:   false,
    };

    addItineraryItem(newItem);
    setItemTitle(""); setItemTime(""); setItemLocation(""); setItemDesc("");
    setShowForm(false); setFormError("");
  };

  const getTypeInfo = (type: ItineraryItemType) =>
    ITEM_TYPES.find((t) => t.value === type) ?? ITEM_TYPES[0];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200 text-left">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Itinerary</h1>
          <p className="text-xploria-muted mt-1 text-sm font-semibold">{activeTrip.title}</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-xploria-primary hover:bg-xploria-primary-hover text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-md shadow-xploria-primary/10 active:scale-[0.98]"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "Add Activity"}
        </button>
      </div>

      {/* Day Tabs */}
      {days.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {days.map((d, i) => {
            const date  = new Date(d + "T00:00:00");
            const count = itinerary.filter((it) => it.date === d).length;
            return (
              <button
                key={d}
                onClick={() => setSelectedDay(i)}
                className={clsx(
                  "shrink-0 flex flex-col items-center px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors shadow-sm",
                  selectedDay === i
                    ? "bg-xploria-primary/15 border-xploria-primary text-xploria-primary"
                    : "border-[#24262c] bg-slate-900/60 text-xploria-muted hover:border-slate-800 hover:text-slate-300"
                )}
              >
                <span className="text-xs opacity-75">Day {i + 1}</span>
                <span className="font-bold text-base mt-0.5 text-white">{date.getDate()}</span>
                <span className="text-xs opacity-75 mt-0.5">
                  {date.toLocaleDateString("en-IN", { month: "short" })}
                </span>
                {count > 0 && (
                  <span className="mt-1 w-5 h-5 bg-xploria-primary/20 text-xploria-primary rounded-full text-xs flex items-center justify-center font-bold">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-xploria-muted text-sm font-semibold">
          Set trip dates to generate itinerary days.
        </p>
      )}

      {/* Add Item Form */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          className="bg-[#16171b] border border-[#24262c] rounded-2xl p-6 space-y-4 shadow-2xl text-left"
        >
          <h3 className="font-bold text-white flex items-center gap-2">
            <span>Add to Day {selectedDay + 1}</span>
            <span className="text-xploria-muted font-bold text-xs bg-slate-800 px-2 py-0.5 rounded-full">
              {new Date(currentDate + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </span>
          </h3>

          {/* Type selector */}
          <div className="flex flex-wrap gap-2">
            {ITEM_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setItemType(t.value)}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors",
                  itemType === t.value
                    ? "bg-xploria-primary/10 border-xploria-primary text-xploria-primary shadow-sm"
                    : "border-[#24262c] bg-slate-900/60 text-xploria-muted hover:border-slate-805"
                )}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Activity title"
            value={itemTitle}
            onChange={(e) => setItemTitle(e.target.value)}
            className="input"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-4 w-4 text-xploria-muted" />
              <input
                type="time"
                value={itemTime}
                onChange={(e) => setItemTime(e.target.value)}
                className="input pl-10 text-sm"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-xploria-muted" />
              <input
                type="text"
                placeholder="Location (optional)"
                value={itemLocation}
                onChange={(e) => setItemLocation(e.target.value)}
                className="input pl-10 text-sm"
              />
            </div>
          </div>

          <textarea
            placeholder="Description / notes (optional)"
            value={itemDesc}
            onChange={(e) => setItemDesc(e.target.value)}
            rows={2}
            className="input resize-none text-sm"
          />

          {formError && <p className="text-red-400 text-sm font-semibold">{formError}</p>}

          <button type="submit" className="w-full bg-xploria-primary hover:bg-xploria-primary-hover text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-md shadow-xploria-primary/10 active:scale-[0.99]">
            Add to Itinerary
          </button>
        </form>
      )}

      {/* Day Timeline */}
      {days.length > 0 && (
        <div className="pt-2 text-left">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <span>Day {selectedDay + 1}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-750 shrink-0" />
            <span className="text-xploria-muted font-bold text-sm">
              {new Date(currentDate + "T00:00:00").toLocaleDateString("en-IN", {
                weekday: "long", day: "numeric", month: "long",
              })}
            </span>
          </h3>

          {dayItems.length === 0 ? (
            <div className="text-center py-10 text-xploria-muted border-2 border-dashed border-[#24262c] bg-xploria-card rounded-2xl text-sm font-bold shadow-2xl">
              Nothing planned yet. Add an activity above.
            </div>
          ) : (
            <div className="relative pl-6 space-y-0 text-left">
              {/* Vertical line */}
              <div className="absolute left-2.5 top-0 bottom-0 w-px bg-[#24262c]" />

              {dayItems.map((item) => {
                const typeInfo = getTypeInfo(item.type);
                return (
                  <div key={item.id} className="relative pb-6 last:pb-0">
                    {/* Dot */}
                    <div
                      className={clsx(
                        "absolute -left-3.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#16171b] shadow-sm z-10",
                        item.completed ? "bg-xploria-primary" : "bg-slate-700"
                      )}
                    />

                    <div
                      className={clsx(
                        "ml-4 bg-xploria-card border rounded-xl px-4 py-3 shadow-md transition-all",
                        item.completed ? "border-[#24262c] opacity-60" : "border-[#24262c] hover:border-slate-750"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3 min-w-0">
                          <button
                            onClick={() => toggleItineraryItem(item.id)}
                            className="mt-0.5 text-xploria-muted hover:text-xploria-primary transition-colors"
                          >
                            {item.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-xploria-primary" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>
                          <div className="min-w-0 text-left">
                            <div className="flex items-center gap-2 flex-wrap">
                              {item.time && (
                                <span className="text-xs text-xploria-muted flex items-center gap-0.5 font-bold">
                                  <Clock className="w-3 h-3" /> {item.time}
                                </span>
                              )}
                              <span className={clsx("text-xs px-2 py-0.5 rounded-full font-bold", typeInfo.color)}>
                                {typeInfo.label}
                              </span>
                            </div>
                            <p className={clsx("font-bold mt-1.5 text-sm", item.completed ? "line-through text-xploria-muted" : "text-white")}>
                              {item.title}
                            </p>
                            {item.location && (
                              <p className="text-xs text-xploria-muted flex items-center gap-1 mt-1 font-semibold">
                                <MapPin className="w-3 h-3" /> {item.location}
                              </p>
                            )}
                            {item.description && (
                              <p className="text-xs text-xploria-muted/80 mt-1.5 font-semibold leading-relaxed bg-[#1a1b20] p-2 rounded-lg">{item.description}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteItineraryItem(item.id)}
                          className="p-1.5 text-xploria-muted hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}