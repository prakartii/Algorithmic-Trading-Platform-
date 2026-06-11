export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

export const INTERVALS = [
  { label: "Daily",   value: "1d"  },
  { label: "Weekly",  value: "1wk" },
  { label: "Monthly", value: "1mo" },
] as const;

export const DEFAULT_INITIAL_CAPITAL = 10_000;
export const DEFAULT_COMMISSION_PCT  = 0.001;

export const NAV_LINKS = [
  { label: "Dashboard",  path: "/"            },
  { label: "Backtests",  path: "/backtests"   },
  { label: "Portfolio",  path: "/portfolio"   },
  { label: "Strategies", path: "/strategies"  },
] as const;
