import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/utils/cn";

interface TopBarProps {
  onMobileMenuClick: () => void;
}

const ip = {
  width: 15, height: 15, fill: "none", stroke: "currentColor",
  strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
};

const IconMenu   = () => <svg {...ip} viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const IconSearch = () => <svg {...ip} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconBell   = () => <svg {...ip} viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IconChevron = () => <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 4.5 6 7.5 9 4.5"/></svg>;

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
  if (!weekday || mins < 240 || mins >= 1200) status = "closed";
  else if (mins >= 570 && mins < 960)         status = "open";
  else if (mins < 570)                        status = "pre";
  else                                        status = "after";

  const etTime = et.toLocaleTimeString("en-US", {
    timeZone: "America/New_York", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  });
  const etDate = et.toLocaleDateString("en-US", {
    timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric",
  });

  const labels: Record<MarketStatus, string> = { open: "Market Open", pre: "Pre-Market", after: "After Hours", closed: "Market Closed" };
  const short:  Record<MarketStatus, string> = { open: "OPEN", pre: "PRE", after: "AH", closed: "CLOSED" };
  return { status, label: labels[status], short: short[status], etTime, etDate };
}

const META: Record<string, { title: string; sub?: string }> = {
  "/":              { title: "Dashboard",     sub: "Overview" },
  "/portfolio":     { title: "Portfolio",     sub: "Holdings & P&L" },
  "/strategies":    { title: "Strategies",    sub: "Strategy Library" },
  "/backtests":     { title: "Backtesting",   sub: "Strategy Analysis" },
  "/paper-trading": { title: "Paper Trading", sub: "Order Management" },
  "/analytics":     { title: "Analytics",     sub: "Performance Analysis" },
  "/ai-insights":   { title: "AI Insights",   sub: "Claude-Powered Analysis" },
  "/settings":      { title: "Settings",      sub: "Configuration" },
};

const STATUS_CONFIG: Record<MarketStatus, { dot: string; text: string; bg: string; border: string }> = {
  open:   { dot: "bg-emerald-400 animate-pulse-dot", text: "text-emerald-400", bg: "bg-emerald-500/[0.08]", border: "border-emerald-500/20" },
  pre:    { dot: "bg-amber-400",                     text: "text-amber-400",   bg: "bg-amber-500/[0.08]",   border: "border-amber-500/20"   },
  after:  { dot: "bg-amber-400",                     text: "text-amber-400",   bg: "bg-amber-500/[0.08]",   border: "border-amber-500/20"   },
  closed: { dot: "bg-slate-600",                     text: "text-slate-500",   bg: "bg-white/[0.03]",       border: "border-white/[0.07]"   },
};

export default function TopBar({ onMobileMenuClick }: TopBarProps) {
  const location = useLocation();
  const { status, short, etTime, etDate } = useMarketClock();

  const meta  = META[location.pathname] ?? { title: "QuantLab" };
  const cfg   = STATUS_CONFIG[status];

  return (
    <header className="h-[52px] shrink-0 flex items-center gap-3 px-4 bg-[#09090e] border-b border-white/[0.06] select-none">

      <button
        onClick={onMobileMenuClick}
        className="lg:hidden p-1.5 rounded-md text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition-colors"
      >
        <IconMenu />
      </button>

      {/* Page title */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[14px] font-semibold text-slate-100 leading-none">{meta.title}</span>
        {meta.sub && (
          <>
            <span className="text-slate-700 text-[14px] leading-none">/</span>
            <span className="text-[12px] text-slate-500 leading-none hidden sm:block">{meta.sub}</span>
          </>
        )}
      </div>

      <div className="flex-1" />

      {/* Search */}
      <button className="hidden md:flex items-center gap-2 h-[30px] px-3 rounded-lg bg-white/[0.04] border border-white/[0.07] text-slate-500 text-[12px] hover:text-slate-300 hover:bg-white/[0.06] hover:border-white/[0.10] transition-all">
        <IconSearch />
        <span className="hidden lg:block text-[11px] text-slate-600">Quick search…</span>
        <kbd className="hidden lg:flex items-center gap-0.5 ml-1 text-[10px] font-mono bg-white/[0.04] border border-white/[0.08] px-1.5 py-0.5 rounded text-slate-700">
          ⌘K
        </kbd>
      </button>

      <div className="h-4 w-px bg-white/[0.08] hidden md:block" />

      {/* Market status pill */}
      <div className={cn(
        "hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border",
        cfg.bg, cfg.border,
      )}>
        <span className={cn("w-[5px] h-[5px] rounded-full shrink-0", cfg.dot)} />
        <span className={cn("text-[11px] font-semibold tracking-[0.06em]", cfg.text)}>
          {short}
        </span>
      </div>

      {/* Clock */}
      <div className="hidden lg:flex flex-col items-end">
        <span className="font-mono text-[11px] text-slate-400 tracking-[0.06em] leading-tight">{etTime}</span>
        <span className="text-[10px] text-slate-600 leading-tight">{etDate} ET</span>
      </div>

      <div className="h-4 w-px bg-white/[0.08]" />

      {/* Notifications */}
      <button className="relative p-1.5 rounded-md text-slate-600 hover:text-slate-300 hover:bg-white/[0.06] transition-colors">
        <IconBell />
        <span className="absolute top-[5px] right-[5px] w-[5px] h-[5px] rounded-full bg-blue-500 ring-1 ring-[#09090e]" />
      </button>

      {/* User avatar */}
      <button className="flex items-center gap-1.5 pl-0.5">
        <div className="w-[26px] h-[26px] rounded-full bg-blue-500/[0.14] border border-blue-500/25 flex items-center justify-center">
          <span className="text-[10px] font-bold text-blue-400">Q</span>
        </div>
        <span className="hidden lg:block">
          <IconChevron />
        </span>
      </button>

    </header>
  );
}
