"use client";

import { useState } from "react";
import { useTripStore, Trip, getAvatarColor } from "@/lib/store/useTripStore";
import { MapPin, Users, IndianRupee, Heart } from "lucide-react";

export default function CreateTripCard() {
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState("");
  const [friendEmail, setFriendEmail] = useState("");
  const [invitedFriends, setInvitedFriends] = useState<string[]>([]);
  const [isCouplePlan, setIsCouplePlan] = useState(false);

  const addTrip = useTripStore((state) => state.addTrip);
  const setActiveTrip = useTripStore((state) => state.setActiveTrip);

  const handleInvite = (e: React.MouseEvent) => {
    e.preventDefault();
    if (friendEmail && !invitedFriends.includes(friendEmail)) {
      setInvitedFriends([...invitedFriends, friendEmail]);
      setFriendEmail("");
    }
  };

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    const newTrip: Trip = {
      id: Math.random().toString(36).substring(2, 11),
      title,
      destination: title,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      budget: Number(budget),
      currency: "INR",
      type: isCouplePlan ? "couple" : (invitedFriends.length > 0 ? "friends" : "solo"),
      members: [
        { id: "me", name: "You", email: "you@example.com", avatarColor: getAvatarColor(0) }, 
        ...invitedFriends.map((email, i) => ({
          id: `friend-${i + 1}`,
          name: email.split('@')[0],
          email,
          avatarColor: getAvatarColor(i + 1)
        }))
      ],
      createdAt: Date.now(),
      coverColor: "#10B981"
    };
    addTrip(newTrip);
    setActiveTrip(newTrip);
    setTitle("");
    setBudget("");
    setInvitedFriends([]);
  };

  return (
    <div className="bg-xploria-card p-6 rounded-2xl shadow-lg border border-gray-800 w-full">
      <h2 className="text-2xl font-bold text-xploria-text mb-6">Plan a New Trip</h2>
      <form onSubmit={handleCreateTrip} className="space-y-4">
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-5 w-5 text-xploria-muted" />
          <input type="text" placeholder="Destination" className="w-full bg-gray-900 text-xploria-text rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-xploria-primary border border-gray-700" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="relative">
          <IndianRupee className="absolute left-3 top-3 h-5 w-5 text-xploria-muted" />
          <input type="number" placeholder="Estimated Budget" className="w-full bg-gray-900 text-xploria-text rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-xploria-primary border border-gray-700" value={budget} onChange={(e) => setBudget(e.target.value)} required />
        </div>
        <div className="flex items-center gap-3 py-2">
          <button type="button" onClick={() => setIsCouplePlan(!isCouplePlan)} className={`p-2 rounded-lg border ${isCouplePlan ? 'bg-pink-500/20 border-pink-500 text-pink-500' : 'bg-gray-900 border-gray-700 text-xploria-muted'}`}>
            <Heart className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-300">Special Couple Plan</span>
        </div>
        {!isCouplePlan && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Users className="absolute left-3 top-3 h-5 w-5 text-xploria-muted" />
                <input type="email" placeholder="Friend's email" className="w-full bg-gray-900 text-xploria-text rounded-lg py-3 pl-10 pr-4 focus:outline-none border border-gray-700" value={friendEmail} onChange={(e) => setFriendEmail(e.target.value)} />
              </div>
              <button onClick={handleInvite} className="bg-gray-800 hover:bg-gray-700 text-xploria-text px-4 py-2 rounded-lg border border-gray-700">Add</button>
            </div>
            {invitedFriends.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {invitedFriends.map((email, idx) => <span key={idx} className="bg-xploria-primary/20 text-xploria-primary px-3 py-1 rounded-full text-xs font-medium border border-xploria-primary/30">{email}</span>)}
              </div>
            )}
          </div>
        )}
        <button type="submit" className="w-full bg-xploria-primary hover:bg-emerald-600 text-white font-bold py-3 rounded-lg mt-4 transition-colors">Create Ledger</button>
      </form>
    </div>
  );
}