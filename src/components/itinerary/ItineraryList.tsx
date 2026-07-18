"use client";

import { useState } from "react";
import { useTripStore } from "@/lib/store/useTripStore";
import { Clock, MapPin } from "lucide-react";

export default function ItineraryList() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  
  const itinerary = useTripStore((state) => state.itinerary) || [];
  const addItineraryItem = useTripStore((state) => state.addItineraryItem);
  const activeTrip = useTripStore((state) => state.activeTrip);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrip) return alert("Create a trip first!");

    addItineraryItem({
      id: Date.now().toString(),
      tripId: activeTrip.id,
      title,
      location,
      date,
      day: 1,
      type: "activity",
      completed: false
    });
    setTitle(""); setLocation(""); setDate("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
      <form onSubmit={handleSubmit} className="bg-xploria-card p-6 rounded-2xl border border-gray-800 space-y-4 shadow-lg h-fit">
        <h3 className="text-lg font-bold text-xploria-text">Add to Timeline</h3>
        <input type="datetime-local" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-xploria-text outline-none" value={date} onChange={(e) => setDate(e.target.value)} required />
        <input type="text" placeholder="Activity (e.g., Visit Museum)" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-xploria-text outline-none" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <input type="text" placeholder="Location" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-xploria-text outline-none" value={location} onChange={(e) => setLocation(e.target.value)} required />
        <button className="w-full bg-xploria-primary text-white py-3 rounded-lg font-bold hover:bg-emerald-600 transition shadow-md">Add to Itinerary</button>
      </form>

      <div className="bg-xploria-card p-6 rounded-2xl border border-gray-800 shadow-lg">
        <h3 className="text-lg font-bold text-xploria-text mb-6">Trip Timeline</h3>
        {itinerary.length === 0 ? (
          <p className="text-xploria-muted">No activities planned yet.</p>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-700 before:to-transparent">
            {itinerary.map((item) => (
              <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-800 bg-gray-900 text-xploria-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-900 p-4 rounded-xl border border-gray-800 shadow">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-gray-200">{item.title}</h4>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-xploria-muted">
                    <MapPin className="w-3 h-3" /> {item.location}
                  </div>
                  <time className="block text-xs font-medium text-xploria-primary mt-2">{new Date(item.date).toLocaleString()}</time>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}