"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/auth";
import { Mail, Key, User, Loader2, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await registerUser(email, password, name);
    setLoading(false);

    if (res.success) {
      router.push("/dashboard/trips");
    } else {
      setError(res.error || "Failed to create account.");
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-black text-white tracking-tight">Create Account</h2>
        <p className="text-xs text-xploria-muted font-semibold mt-1">
          Begin your high-fidelity travel organization ledger.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-xploria-muted">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3.5 h-4 w-4 text-xploria-muted transition-colors duration-200" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Aman Raj"
              className="w-full pl-11 pr-4 py-3.5 bg-[#0d0e12] border border-[#24262c] rounded-2xl text-sm focus:outline-none focus:border-xploria-primary focus:ring-2 focus:ring-xploria-primary/10 transition-all text-white placeholder-slate-700 font-medium"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-xploria-muted">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-xploria-muted transition-colors duration-200" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@xploria.co"
              className="w-full pl-11 pr-4 py-3.5 bg-[#0d0e12] border border-[#24262c] rounded-2xl text-sm focus:outline-none focus:border-xploria-primary focus:ring-2 focus:ring-xploria-primary/10 transition-all text-white placeholder-slate-700 font-medium"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-xploria-muted">
            Password
          </label>
          <div className="relative">
            <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-xploria-muted transition-colors duration-200" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="w-full pl-11 pr-4 py-3.5 bg-[#0d0e12] border border-[#24262c] rounded-2xl text-sm focus:outline-none focus:border-xploria-primary focus:ring-2 focus:ring-xploria-primary/10 transition-all text-white placeholder-slate-700"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-xs font-semibold bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 rounded-xl">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-xploria-primary hover:bg-xploria-primary-hover text-white rounded-2xl text-sm font-bold shadow-lg shadow-xploria-primary/10 transition-all duration-250 cursor-pointer disabled:opacity-60 active:scale-[0.99] mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            <>
              Sign Up <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center text-xs text-xploria-muted pt-4 border-t border-[#24262c]">
        Already have an account?{" "}
        <Link href="/login" className="text-xploria-primary hover:underline font-bold">
          Sign in
        </Link>
      </div>
    </div>
  );
}
