// src/app/dashboard/timeline/page.tsx
"use client";

import { useTripStore } from "@/lib/store/useTripStore";
import { CalendarDays, IndianRupee, Clock, MapPin } from "lucide-react";
import clsx from "clsx";

export default function TimelinePage() {
  const { activeTrip, getTripItinerary, getDaysArray, getTripExpenses } = useTripStore();

  if (!activeTrip) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[60vh]">
        <div className="text-center border-2 border-dashed border-[#24262c] bg-xploria-card rounded-2xl p-12 max-w-md shadow-2xl">
          <p className="text-xploria-muted font-bold">Select a trip to view its timeline.</p>
        </div>
      </div>
    );
  }

  const days      = getDaysArray(activeTrip.id);
  const itinerary = getTripItinerary(activeTrip.id);
  const expenses  = getTripExpenses(activeTrip.id);

  if (days.length === 0) {
    return (
      <div className="p-4 sm:p-8 max-w-4xl mx-auto animate-in fade-in duration-200">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Trip Timeline</h1>
          <p className="text-xploria-muted mt-1 text-sm font-medium">{activeTrip.title}</p>
        </header>
        <div className="text-center py-16 text-xploria-muted border-2 border-dashed border-[#24262c] bg-xploria-card rounded-2xl font-bold shadow-2xl">
          Set trip start and end dates to see the timeline.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200 text-left">
      <header>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Trip Timeline</h1>
        <p className="text-xploria-muted mt-1 text-sm font-semibold">
          {activeTrip.title} · {days.length} days ·{" "}
          {new Date(activeTrip.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          {" to "}
          {new Date(activeTrip.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      </header>

      <div className="relative">
        {/* Vertical axis */}
        <div className="absolute left-[3.25rem] top-0 bottom-0 w-px bg-[#24262c]" />

        <div className="space-y-10 text-left">
          {days.map((d, idx) => {
            const date       = new Date(d + "T00:00:00");
            const dayItems   = itinerary.filter((i) => i.date === d);
            const dayExpenses = expenses.filter((e) => e.date === d);
            const dayTotal   = dayExpenses.reduce((s, e) => s + e.amount, 0);
            const isToday    = d === new Date().toISOString().split("T")[0];

            return (
              <div key={d} className="flex gap-6">
                {/* Day badge */}
                <div className="shrink-0 w-24 text-right pt-1 relative z-10">
                  <div
                    className={clsx(
                      "inline-flex flex-col items-center px-3 py-2 rounded-xl border shadow-md",
                      isToday
                        ? "bg-xploria-primary border-xploria-primary text-white"
                        : "bg-slate-900/60 border-[#24262c] text-slate-350"
                    )}
                  >
                    <span className="text-xs opacity-75 font-semibold">Day {idx + 1}</span>
                    <span className="font-extrabold text-lg leading-none mt-0.5 text-white">{date.getDate()}</span>
                    <span className="text-xs opacity-75 font-semibold mt-0.5">
                      {date.toLocaleDateString("en-IN", { month: "short" })}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-3 pb-2">
                  {/* Weekday label */}
                  <p className="text-xs text-xploria-muted font-bold uppercase tracking-wider pt-2">
                    {date.toLocaleDateString("en-IN", { weekday: "long" })}
                    {dayTotal > 0 && (
                      <span className="ml-3 text-xploria-primary font-bold">
                        ₹{dayTotal.toLocaleString("en-IN")} spent
                      </span>
                    )}
                  </p>

                  {/* Activities */}
                  {dayItems.length === 0 && dayExpenses.length === 0 ? (
                    <p className="text-xs text-xploria-muted italic font-medium">Nothing planned</p>
                  ) : (
                    <>
                      {dayItems.map((item) => (
                        <div
                          key={item.id}
                          className={clsx(
                            "bg-xploria-card border border-[#24262c] rounded-xl px-4 py-3 shadow-md hover:border-slate-800 transition-colors",
                            item.completed && "opacity-60"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <CalendarDays className="w-4 h-4 text-xploria-primary mt-0.5 shrink-0" />
                            <div className="min-w-0">
                              <p className={clsx("font-bold text-sm text-white", item.completed && "line-through text-xploria-muted")}>
                                {item.title}
                              </p>
                              <div className="flex items-center gap-3 mt-1.5 text-xs text-xploria-muted font-semibold">
                                {item.time && (
                                  <span className="flex items-center gap-0.5">
                                    <Clock className="w-3.5 h-3.5" /> {item.time}
                                  </span>
                                )}
                                {item.location && (
                                  <span className="flex items-center gap-0.5">
                                    <MapPin className="w-3.5 h-3.5" /> {item.location}
                                  </span>
                                )}
                                <span className="capitalize text-xploria-muted">{item.type}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {dayExpenses.map((exp) => (
                        <div
                          key={exp.id}
                          className="bg-xploria-card border border-[#24262c] rounded-xl px-4 py-3 border-l-2 border-l-xploria-primary shadow-md hover:border-slate-800 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <IndianRupee className="w-4 h-4 text-xploria-primary shrink-0" />
                              <div>
                                <p className="font-bold text-sm text-white">{exp.title}</p>
                                <p className="text-xs text-xploria-muted font-semibold capitalize mt-0.5">{exp.category}</p>
                              </div>
                            </div>
                            <span className="font-black text-xploria-primary text-sm">
                              ₹{exp.amount.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}