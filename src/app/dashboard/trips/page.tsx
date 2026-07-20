// src/app/dashboard/trips/page.tsx
"use client";

import { useState } from "react";
import { useTripStore, Trip, TripType, getAvatarColor } from "@/lib/store/useTripStore";
import {
  MapPin, Calendar, IndianRupee, Users, X, Plane,
  Heart, UserCircle2, UsersRound, Trash2, CalendarRange
} from "lucide-react";
import clsx from "clsx";

const TRIP_TYPES: { value: TripType; label: string; icon: React.ReactNode }[] = [
  { value: "friends", label: "Friends Trip",  icon: <UsersRound className="w-4 h-4" /> },
  { value: "couple",  label: "Couple Trip",   icon: <Heart className="w-4 h-4" /> },
  { value: "solo",    label: "Solo",          icon: <UserCircle2 className="w-4 h-4" /> },
  { value: "family",  label: "Family",        icon: <Users className="w-4 h-4" /> },
];

const COVER_COLORS = [
  "#10B981", "#3B82F6", "#8B5CF6", "#F59E0B",
  "#EF4444", "#EC4899", "#14B8A6", "#F97316",
];

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

export default function TripsPage() {
  const { trips, activeTrip, setActiveTrip, addTrip, deleteTrip } = useTripStore();

  const [title, setTitle]           = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate]   = useState("");
  const [endDate, setEndDate]       = useState("");
  const [budget, setBudget]         = useState("");
  const [tripType, setTripType]     = useState<TripType>("friends");
  const [coverColor, setCoverColor] = useState(COVER_COLORS[0]);
  const [friendEmail, setFriendEmail] = useState("");
  const [invitedFriends, setInvitedFriends] = useState<string[]>([]);
  const [error, setError] = useState("");

  const handleInvite = () => {
    if (!friendEmail.trim()) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(friendEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (invitedFriends.includes(friendEmail)) {
      setError("Already added.");
      return;
    }
    setInvitedFriends((prev) => [...prev, friendEmail]);
    setFriendEmail("");
    setError("");
  };

  const handleRemoveFriend = (email: string) => {
    setInvitedFriends((prev) => prev.filter((e) => e !== email));
  };

  const handleCreate = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!title || !destination || !startDate || !endDate || !budget) {
      setError("All fields are required.");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError("End date must be after start date.");
      return;
    }

    const newTrip: Trip = {
      id: generateId(),
      title,
      destination,
      startDate,
      endDate,
      budget: Number(budget),
      currency: "INR",
      type: tripType,
      coverColor,
      createdAt: Date.now(),
      members: [
        { id: "me", name: "You", email: "", avatarColor: COVER_COLORS[0] },
        ...invitedFriends.map((email, i) => ({
          id: generateId(),
          name: email.split("@")[0],
          email,
          avatarColor: getAvatarColor(i + 1),
        })),
      ],
    };

    addTrip(newTrip);
    setActiveTrip(newTrip);

    // Reset
    setTitle(""); setDestination(""); setStartDate(""); setEndDate("");
    setBudget(""); setInvitedFriends([]); setError("");
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-10 text-left">
      {/* Header */}
      <header>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Your Trips</h1>
        <p className="text-xploria-muted mt-1 font-semibold">Plan adventures, invite friends, and track shared expenses.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* ── Create Trip Form ─────────────────────────────────────── */}
        <section>
          <form
            onSubmit={handleCreate}
            className="bg-[#16171b] border border-[#24262c] rounded-2xl p-6 space-y-5 shadow-2xl text-left"
          >
            <h2 className="text-xl font-bold text-white">Plan a New Trip</h2>

            {/* Trip Type */}
            <div className="grid grid-cols-2 gap-2">
              {TRIP_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTripType(t.value)}
                  className={clsx(
                    "flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-semibold transition-colors",
                    tripType === t.value
                      ? "bg-xploria-primary/10 border-xploria-primary text-xploria-primary shadow-sm"
                      : "border-[#24262c] bg-slate-900/60 text-xploria-muted hover:border-slate-800 hover:text-slate-350"
                  )}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* Title */}
            <div className="relative">
              <Plane className="absolute left-3 top-3 h-5 w-5 text-xploria-muted" />
              <input
                type="text"
                placeholder="Trip name (e.g., Daman Getaway)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input pl-10"
                required
              />
            </div>

            {/* Destination */}
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-xploria-muted" />
              <input
                type="text"
                placeholder="Destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="input pl-10"
                required
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-xploria-muted" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input pl-10 text-sm"
                  required
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-xploria-muted" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input pl-10 text-sm"
                  required
                />
              </div>
            </div>

            {/* Budget */}
            <div className="relative">
              <IndianRupee className="absolute left-3 top-3 h-5 w-5 text-xploria-muted" />
              <input
                type="number"
                min={0}
                placeholder="Total budget (₹)"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="input pl-10"
                required
              />
            </div>

            {/* Cover color */}
            <div>
              <label className="text-xs text-xploria-muted font-bold block mb-2 uppercase tracking-wider">Cover Color</label>
              <div className="flex gap-2">
                {COVER_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCoverColor(c)}
                    style={{ backgroundColor: c }}
                    className={clsx(
                      "w-7 h-7 rounded-full transition-all shadow-sm border border-black/10",
                      coverColor === c ? "ring-2 ring-offset-2 ring-offset-slate-950 ring-xploria-primary scale-110" : "hover:scale-105"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Invite friends */}
            <div>
              <label className="text-xs text-xploria-muted font-bold block mb-2 uppercase tracking-wider">
                Invite Friends to Bucket
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-xploria-muted" />
                  <input
                    type="email"
                    placeholder="friend@email.com"
                    value={friendEmail}
                    onChange={(e) => { setFriendEmail(e.target.value); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleInvite())}
                    className="input pl-10 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleInvite}
                  className="px-4 py-2 bg-[#1a1b20] hover:bg-slate-800 border border-[#24262c] text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  Add
                </button>
              </div>

              {invitedFriends.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {invitedFriends.map((email) => (
                    <span
                      key={email}
                      className="flex items-center gap-1.5 bg-xploria-primary/10 text-xploria-primary px-3 py-1 rounded-full text-xs font-bold border border-xploria-primary/20 shadow-sm"
                    >
                      {email}
                      <button
                        type="button"
                        onClick={() => handleRemoveFriend(email)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {error && <p className="text-red-400 text-sm font-semibold">{error}</p>}

            <button
              type="submit"
              className="w-full bg-xploria-primary hover:bg-xploria-primary-hover text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-md shadow-xploria-primary/10 active:scale-[0.99]"
            >
              Create Trip Ledger
            </button>
          </form>
        </section>

        {/* ── Trips List ───────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">All Trips</h2>

          {trips.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-[#24262c] bg-xploria-card rounded-2xl shadow-2xl">
              <p className="text-xploria-muted text-sm font-semibold">
                No trips yet. Create your first trip to get started.
              </p>
            </div>
          ) : (
            trips.map((trip) => {
              const isActive = activeTrip?.id === trip.id;
              const duration = Math.ceil(
                (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) /
                  (1000 * 60 * 60 * 24)
              ) + 1;

              return (
                <div
                  key={trip.id}
                  className={clsx(
                    "bg-xploria-card border rounded-2xl p-5 shadow-md transition-all duration-300 hover:border-slate-800",
                    isActive ? "border-xploria-primary shadow-lg shadow-xploria-primary/5" : "border-[#24262c]"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Color strip + info */}
                    <div className="flex items-start gap-4">
                      <div
                        className="w-2 self-stretch rounded-full shrink-0"
                        style={{ backgroundColor: trip.coverColor ?? "#10B981" }}
                      />
                      <div className="text-left">
                        <h3 className="font-bold text-white text-base leading-snug">{trip.title}</h3>
                        <p className="text-xs text-xploria-muted font-medium mt-0.5">{trip.destination}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2.5 text-xs text-xploria-muted font-semibold">
                          <span className="flex items-center gap-1">
                            <CalendarRange className="w-3.5 h-3.5" />
                            {new Date(trip.startDate).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short",
                            })}
                            {" to "}
                            {new Date(trip.endDate).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short",
                            })}
                            &nbsp;({duration}d)
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {trip.members.length}
                          </span>
                          <span className="flex items-center gap-1">
                            <IndianRupee className="w-3.5 h-3.5" />
                            {trip.budget.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isActive ? (
                        <span className="text-xs bg-xploria-primary/10 text-xploria-primary px-3 py-1 rounded-full font-bold shadow-sm border border-xploria-primary/20">
                          Active
                        </span>
                      ) : (
                        <button
                          onClick={() => setActiveTrip(trip)}
                          className="text-xs bg-[#1a1b20] hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg border border-[#24262c] font-bold transition-all shadow-sm active:scale-[0.97]"
                        >
                          Set Active
                        </button>
                      )}
                      <button
                        onClick={() => deleteTrip(trip.id)}
                        className="p-1.5 text-xploria-muted hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}