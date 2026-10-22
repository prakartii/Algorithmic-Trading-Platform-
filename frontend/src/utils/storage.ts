import type { BacktestResponse } from "@/types";

const LAST_BACKTEST_KEY = "ql_last_backtest_result";

export function saveLastBacktest(result: BacktestResponse): void {
  try {
    localStorage.setItem(LAST_BACKTEST_KEY, JSON.stringify(result));
  } catch {
    // storage unavailable – silently ignore
  }
}

export function getLastBacktest(): BacktestResponse | null {
  try {
    const raw = localStorage.getItem(LAST_BACKTEST_KEY);
    return raw ? (JSON.parse(raw) as BacktestResponse) : null;
  } catch {
    return null;
  }
}

// ── user preferences ──────────────────────────────────────────────────────────

export interface Preferences {
  defaultCapital: number;
  defaultYears:   number;
}

const PREFS_KEY = "ql_preferences";
export const DEFAULT_PREFS: Preferences = { defaultCapital: 10_000, defaultYears: 5 };

export function getPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<Preferences>) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePreferences(prefs: Preferences): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // storage unavailable – silently ignore
  }
}
