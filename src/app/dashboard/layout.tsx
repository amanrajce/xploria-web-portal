"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTripStore } from "@/lib/store/useTripStore";
import { useAuth } from "@/components/auth/AuthProvider";
import { logoutUser } from "@/lib/auth";
import {
  Map,
  LayoutList,
  Wallet,
  ArrowLeftRight,
  CalendarDays,
  UtensilsCrossed,
  BarChart3,
  CheckSquare,
  ChevronDown,
  ExternalLink,
  Plus,
  Loader2,
  LogOut,
  Compass,
  LayoutGrid,
  Settings,
  Menu,
  X,
} from "lucide-react";
import clsx from "clsx";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Showcase View", icon: LayoutGrid, exact: true },
  { href: "/dashboard/trips", label: "Trips", icon: Map },
  { href: "/dashboard/itinerary", label: "Itinerary", icon: CalendarDays },
  { href: "/dashboard/todos", label: "To-do List", icon: CheckSquare },
  { href: "/dashboard/budget", label: "Budget", icon: Wallet },
  { href: "/dashboard/expenses", label: "Expenses", icon: LayoutList },
  { href: "/dashboard/settlements", label: "Settlements", icon: ArrowLeftRight },
  { href: "/dashboard/timeline", label: "Trip Timeline", icon: CalendarDays },
  { href: "/dashboard/bill-split", label: "Bill Splitter", icon: UtensilsCrossed },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const { trips, activeTrip, setActiveTrip } = useTripStore();
  const [tripMenuOpen, setTripMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName = profile?.displayName || user?.displayName || "Traveler";

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  const handleSignOut = async () => {
    setSigningOut(true);
    await logoutUser();
    router.replace("/login");
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-xploria-background">
        <Loader2 className="w-6 h-6 text-xploria-primary animate-spin" />
      </div>
    );
  }

  const renderSidebar = (onClose?: () => void) => {
    return (
      <>
        {/* Stylized Compass Logo */}
        <div className="mb-8 px-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-xploria-primary flex items-center justify-center text-white shadow-lg shadow-xploria-primary/20">
              <Compass className="w-5 h-5 shrink-0" />
            </div>
            <div className="text-left">
              <span className="text-xl font-black tracking-tight text-white block leading-none">Xploria</span>
              <span className="block text-[9px] uppercase font-bold tracking-widest text-xploria-primary mt-1">Trip Planner</span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 hover:bg-slate-800 text-xploria-muted hover:text-white rounded-lg transition-colors"
              title="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Active Trip Selector */}
        <div className="mb-6 relative">
          <button
            onClick={() => setTripMenuOpen((v) => !v)}
            className="w-full flex items-center justify-between bg-slate-800/30 border border-[#24262c] rounded-xl px-3 py-2.5 text-sm text-white hover:bg-slate-800/50 hover:border-slate-700 transition-all duration-200"
          >
            <span className="truncate font-medium text-left">
              {activeTrip ? activeTrip.title : "Select a trip"}
            </span>
            <ChevronDown className={clsx("w-4 h-4 text-xploria-muted shrink-0 transition-transform", tripMenuOpen && "rotate-180")} />
          </button>

          {tripMenuOpen && (
            <div className="absolute top-full mt-1.5 left-0 right-0 bg-[#16171b] border border-[#24262c] rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
              {trips.length === 0 ? (
                <p className="text-xploria-muted text-xs px-3 py-3">No trips yet</p>
              ) : (
                trips.map((trip) => (
                  <button
                    key={trip.id}
                    onClick={() => {
                      setActiveTrip(trip);
                      setTripMenuOpen(false);
                      if (onClose) onClose();
                    }}
                    className={clsx("w-full text-left px-3 py-2.5 text-sm hover:bg-slate-800/50 transition-colors", activeTrip?.id === trip.id ? "text-xploria-primary bg-xploria-primary/10 font-bold" : "text-slate-300")}
                  >
                    {trip.title}
                  </button>
                ))
              )}
              <Link
                href="/dashboard/trips"
                onClick={() => {
                  setTripMenuOpen(false);
                  if (onClose) onClose();
                }}
                className="flex items-center gap-2 px-3 py-2.5 text-xs text-xploria-muted hover:text-xploria-primary border-t border-[#24262c] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> New trip
              </Link>
            </div>
          )}
        </div>

        {/* Navigation Sidebar List */}
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.exact ? pathname === item.href : (pathname === item.href || pathname.startsWith(item.href + "/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (onClose) onClose();
                }}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                  active
                    ? "bg-xploria-primary/15 text-xploria-primary shadow-sm"
                    : "text-xploria-muted hover:text-white hover:bg-slate-800/40"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* ILP Portal External Link */}
        <div className="mt-2 pt-4 border-t border-[#24262c]">
          <a
            href="https://ilp.mizoram.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              if (onClose) onClose();
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-xploria-muted hover:text-xploria-primary hover:bg-xploria-primary/5 transition-colors"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            ILP Portal
          </a>
        </div>

        {/* Unify Sidebar Profile Card */}
        <div className="mt-2 pt-4 border-t border-[#24262c] relative">
          <div className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-800/20 border border-[#24262c]">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={profile?.photoURL || user?.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80"}
                alt={`${displayName} Profile`}
                className="w-9 h-9 rounded-full shrink-0 shadow-sm border border-xploria-primary/20 object-cover"
              />
              <div className="min-w-0 text-left">
                <p className="text-sm font-bold text-white truncate leading-tight">{displayName}</p>
                <p className="text-[10px] text-xploria-muted truncate leading-tight mt-0.5">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="p-1.5 hover:bg-slate-800 text-xploria-muted hover:text-white rounded-lg transition-colors shrink-0"
              title="Profile Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {profileMenuOpen && (
            <>
              {/* Overlay backdrop to close dropdown when clicking outside */}
              <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
              
              {/* Settings Dropdown Popover */}
              <div className="absolute bottom-16 left-0 right-0 z-50 bg-[#16171b] border border-[#24262c] rounded-xl shadow-2xl p-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
                <div className="px-2.5 py-2 border-b border-[#24262c] mb-1 text-left">
                  <p className="text-[10px] font-bold text-xploria-primary uppercase tracking-wider">{displayName}</p>
                  <p className="text-xs text-xploria-muted truncate mt-0.5">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    router.push("/dashboard/trips");
                    if (onClose) onClose();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  Account Settings
                </button>
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    router.push("/dashboard/analytics");
                    if (onClose) onClose();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  Preferences
                </button>
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="w-full flex items-center gap-2.5 mt-1 px-2.5 py-2 rounded-lg text-xs font-bold text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors disabled:opacity-50"
                >
                  {signingOut ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
                  ) : (
                    <LogOut className="w-3.5 h-3.5" />
                  )}
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-xploria-background text-xploria-text animate-in fade-in duration-350">
      {/* Mobile Header Navbar */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0d0e12] border-b border-[#1f2127] sticky top-0 z-30 h-16 shrink-0">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 hover:bg-slate-800 text-xploria-muted hover:text-white rounded-xl transition-all"
          title="Open Menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Brand Name / Title */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-xploria-primary flex items-center justify-center text-white">
            <Compass className="w-4 h-4 shrink-0" />
          </div>
          <span className="text-base font-black tracking-tight text-white">Xploria</span>
        </div>

        {/* Small avatar shortcut */}
        <button
          onClick={() => router.push("/dashboard/trips")}
          className="w-8 h-8 rounded-full border border-xploria-primary/20 overflow-hidden"
          title="Go to Trips"
        >
          <img
            src={profile?.photoURL || user?.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80"}
            alt="Profile Mini"
            className="w-full h-full object-cover"
          />
        </button>
      </header>

      {/* Mobile Drawer (Menu Overlay) */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed top-0 bottom-0 left-0 w-64 bg-[#0d0e12] border-r border-[#1f2127] z-50 flex flex-col py-6 px-4 overflow-y-auto lg:hidden animate-in slide-in-from-left duration-250">
            {renderSidebar(() => setMobileOpen(false))}
          </aside>
        </>
      )}

      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-[#0d0e12] border-r border-[#1f2127] flex-col py-6 px-4 sticky top-0 h-screen overflow-y-auto">
        {renderSidebar()}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-xploria-background">
        {children}
      </main>
    </div>
  );
}
