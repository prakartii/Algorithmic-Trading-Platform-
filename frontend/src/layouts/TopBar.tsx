import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/utils/cn";

interface TopBarProps {
  onMobileMenuClick: () => void;
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const ip = { width: 15, height: 15, fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const IconMenu   = () => <svg {...ip} viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const IconSearch = () => <svg {...ip} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconBell   = () => <svg {...ip} viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;

// ── Market clock ──────────────────────────────────────────────────────────────

type MarketStatus = "open" | "pre" | "after" | "closed";

function useMarketClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const et      = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const day     = et.getDay();
  const mins    = et.getHours() * 60 + et.getMinutes();
  const weekday = day >= 1 && day <= 5;

  let status: MarketStatus;
  if (!weekday || mins < 240 || mins >= 1200)        status = "closed";
  else if (mins >= 570 && mins < 960)                 status = "open";
  else if (mins < 570)                                status = "pre";
  else                                                status = "after";

  const etTime = et.toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const etDate = et.toLocaleDateString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric" });

  const label: Record<MarketStatus, string> = { open: "OPEN", pre: "PRE", after: "AH", closed: "CLOSED" };
  return { status, label: label[status], etTime, etDate };
}

// ── Page meta ─────────────────────────────────────────────────────────────────

const META: Record<string, string> = {
  "/":              "Dashboard",
  "/portfolio":     "Portfolio",
  "/strategies":    "Strategies",
  "/backtests":     "Backtesting",
  "/paper-trading": "Paper Trading",
  "/analytics":     "Analytics",
  "/ai-insights":   "AI Insights",
  "/settings":      "Settings",
};

const STATUS_DOT: Record<MarketStatus, string> = {
  open:   "bg-emerald-400 animate-pulse-dot",
  pre:    "bg-amber-400",
  after:  "bg-amber-400",
  closed: "bg-slate-600",
};

const STATUS_TEXT: Record<MarketStatus, string> = {
  open:   "text-emerald-400",
  pre:    "text-amber-400",
  after:  "text-amber-400",
  closed: "text-slate-600",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function TopBar({ onMobileMenuClick }: TopBarProps) {
  const location = useLocation();
  const { status, label, etTime, etDate } = useMarketClock();

  const pageTitle = META[location.pathname] ?? "QuantLab";

  return (
    <header className="h-[52px] shrink-0 flex items-center gap-3 px-4 bg-[#080810] border-b border-[#ffffff07]">

      {/* Mobile menu */}
      <button
        onClick={onMobileMenuClick}
        className="lg:hidden p-1.5 rounded-md text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition-colors"
      >
        <IconMenu />
      </button>

      {/* Page title */}
      <span className="text-[13px] font-semibold text-slate-200 tracking-wide select-none">
        {pageTitle}
      </span>

      <div className="flex-1" />

      {/* Search trigger */}
      <button className="hidden md:flex items-center gap-2 h-7 px-3 rounded-md bg-white/[0.03] border border-white/[0.06] text-slate-600 text-[12px] hover:text-slate-400 hover:border-white/[0.10] transition-all select-none">
        <IconSearch />
        <span className="hidden lg:block text-[11px]">Search…</span>
        <kbd className="hidden lg:block ml-1 text-[10px] font-mono bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 rounded text-slate-700">
          ⌘K
        </kbd>
      </button>

      <div className="h-4 w-px bg-white/[0.07] hidden md:block" />

      {/* Market status */}
      <div className={cn("hidden md:flex items-center gap-1.5 select-none", STATUS_TEXT[status])}>
        <span className={cn("w-[5px] h-[5px] rounded-full shrink-0", STATUS_DOT[status])} />
        <span className="text-[11px] font-mono font-semibold tracking-widest">{label}</span>
      </div>

      {/* ET clock */}
      <div className="hidden lg:flex flex-col items-end select-none">
        <span className="font-mono text-[11px] text-slate-400 tracking-widest leading-tight">{etTime}</span>
        <span className="text-[10px] text-slate-700 leading-tight">{etDate} ET</span>
      </div>

      <div className="h-4 w-px bg-white/[0.07]" />

      {/* Notifications */}
      <button className="relative p-1.5 rounded-md text-slate-600 hover:text-slate-300 hover:bg-white/[0.06] transition-colors">
        <IconBell />
        <span className="absolute top-[5px] right-[5px] w-[5px] h-[5px] rounded-full bg-blue-500 ring-1 ring-[#080810]" />
      </button>

      {/* Avatar */}
      <button className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-blue-500/[0.12] border border-blue-500/20 flex items-center justify-center">
          <span className="text-[10px] font-bold text-blue-400">Q</span>
        </div>
      </button>

    </header>
  );
}
