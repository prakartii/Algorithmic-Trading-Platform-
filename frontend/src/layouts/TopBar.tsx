import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/utils/cn";

interface TopBarProps {
  onMobileMenuClick: () => void;
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const ip = { width: 16, height: 16, fill: "none", strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const IconMenu = () => (
  <svg {...ip} viewBox="0 0 24 24" stroke="currentColor">
    <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const IconSearch = () => (
  <svg {...ip} viewBox="0 0 24 24" stroke="currentColor">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconBell = () => (
  <svg {...ip} viewBox="0 0 24 24" stroke="currentColor">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const IconChevronRight = () => (
  <svg {...ip} viewBox="0 0 24 24" stroke="currentColor"><polyline points="9 18 15 12 9 6" /></svg>
);

// ── Market status hook ────────────────────────────────────────────────────────

type MarketStatus = "open" | "pre" | "after" | "closed";

interface MarketState {
  status:  MarketStatus;
  label:   string;
  etTime:  string;
  etDate:  string;
}

function useMarketClock(): MarketState {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const day      = et.getDay();
  const minutes  = et.getHours() * 60 + et.getMinutes();

  const PRE_OPEN  = 4  * 60;       //  4:00 AM
  const OPEN      = 9  * 60 + 30;  //  9:30 AM
  const CLOSE     = 16 * 60;       //  4:00 PM
  const AFTER_END = 20 * 60;       //  8:00 PM

  const isWeekday = day >= 1 && day <= 5;

  let status: MarketStatus;
  let label: string;

  if (!isWeekday || minutes < PRE_OPEN || minutes >= AFTER_END) {
    status = "closed"; label = "CLOSED";
  } else if (minutes >= OPEN && minutes < CLOSE) {
    status = "open";  label = "MARKET OPEN";
  } else if (minutes < OPEN) {
    status = "pre";   label = "PRE-MARKET";
  } else {
    status = "after"; label = "AFTER HOURS";
  }

  const etTime = et.toLocaleTimeString("en-US", {
    timeZone:  "America/New_York",
    hour:      "2-digit",
    minute:    "2-digit",
    second:    "2-digit",
    hour12:    false,
  });

  const etDate = et.toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    month:    "short",
    day:      "numeric",
    year:     "numeric",
  });

  return { status, label, etTime, etDate };
}

// ── Page title map ────────────────────────────────────────────────────────────

const PAGE_META: Record<string, { title: string; sub: string }> = {
  "/":           { title: "Dashboard",  sub: "Overview"          },
  "/backtests":  { title: "Backtests",  sub: "Strategy Testing"  },
  "/portfolio":  { title: "Portfolio",  sub: "Paper Trading"     },
  "/strategies": { title: "Strategies", sub: "Signal Library"    },
};

// ── Status style maps ─────────────────────────────────────────────────────────

const STATUS_BADGE: Record<MarketStatus, string> = {
  open:   "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  pre:    "text-amber-400  bg-amber-500/10   border-amber-500/20",
  after:  "text-amber-400  bg-amber-500/10   border-amber-500/20",
  closed: "text-slate-500  bg-slate-800/50   border-slate-700/40",
};

const STATUS_DOT: Record<MarketStatus, string> = {
  open:   "bg-emerald-400 animate-pulse",
  pre:    "bg-amber-400",
  after:  "bg-amber-400",
  closed: "bg-slate-600",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function TopBar({ onMobileMenuClick }: TopBarProps) {
  const location = useLocation();
  const { status, label, etTime, etDate } = useMarketClock();

  const meta = PAGE_META[location.pathname] ?? { title: "QuantLab", sub: "" };

  return (
    <header className="h-14 shrink-0 flex items-center gap-3 px-4 bg-[#0d0d1a] border-b border-[#ffffff08]">

      {/* Mobile menu toggle */}
      <button
        onClick={onMobileMenuClick}
        className="lg:hidden p-1.5 rounded-md text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition-colors"
        aria-label="Open menu"
      >
        <IconMenu />
      </button>

      {/* ── Breadcrumb / page title ── */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[11px] font-medium tracking-[0.18em] uppercase text-slate-600 hidden sm:block select-none">
          QuantLab
        </span>
        <span className="text-slate-700 hidden sm:block">
          <IconChevronRight />
        </span>
        <span className="text-[13px] font-semibold text-slate-100 tracking-wide truncate">
          {meta.title}
        </span>
        {meta.sub && (
          <>
            <span className="text-slate-700 hidden md:block">/</span>
            <span className="text-[12px] text-slate-500 hidden md:block truncate">{meta.sub}</span>
          </>
        )}
      </div>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Search ── */}
      <button className="hidden md:flex items-center gap-2 h-8 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-slate-500 text-[12px] hover:text-slate-300 hover:border-white/[0.10] hover:bg-white/[0.06] transition-all select-none">
        <IconSearch />
        <span className="hidden lg:block">Search anything…</span>
        <kbd className="hidden lg:block ml-2 text-[10px] font-mono bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 rounded text-slate-600">
          ⌘K
        </kbd>
      </button>

      {/* ── Divider ── */}
      <div className="hidden md:block h-5 w-px bg-white/[0.06]" />

      {/* ── Market status badge ── */}
      <div className={cn(
        "hidden md:flex items-center gap-1.5 px-2.5 h-7 rounded-md",
        "text-[11px] font-mono font-semibold tracking-widest border select-none",
        STATUS_BADGE[status],
      )}>
        <span className={cn("w-[6px] h-[6px] rounded-full shrink-0", STATUS_DOT[status])} />
        {label}
      </div>

      {/* ── ET clock ── */}
      <div className="hidden lg:flex flex-col items-end select-none">
        <span className="font-mono text-[12px] text-slate-300 tracking-widest leading-tight">
          {etTime}
        </span>
        <span className="text-[10px] text-slate-600 leading-tight tracking-wide">
          {etDate} ET
        </span>
      </div>

      {/* ── Divider ── */}
      <div className="h-5 w-px bg-white/[0.06]" />

      {/* ── Notifications ── */}
      <button
        className="relative p-1.5 rounded-md text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition-colors"
        aria-label="Notifications"
      >
        <IconBell />
        {/* Unread dot */}
        <span className="absolute top-[5px] right-[5px] w-[6px] h-[6px] rounded-full bg-blue-500 ring-1 ring-[#0d0d1a]" />
      </button>

      {/* ── User avatar ── */}
      <button
        className="flex items-center gap-2 pl-1 group"
        aria-label="User menu"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500/25 to-violet-500/25 border border-blue-500/25 flex items-center justify-center shrink-0 group-hover:border-blue-400/40 transition-colors">
          <span className="text-[11px] font-bold text-blue-400">Q</span>
        </div>
        <span className="hidden xl:block text-[12px] font-medium text-slate-400 group-hover:text-slate-200 transition-colors">
          Demo
        </span>
      </button>

    </header>
  );
}
