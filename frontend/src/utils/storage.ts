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
