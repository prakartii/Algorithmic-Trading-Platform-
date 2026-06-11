import { useState, useCallback, useEffect } from "react";
import { runBacktest as apiRunBacktest, getBacktests } from "@/services/api";
import type { BacktestRequest, BacktestResponse, BacktestListItem } from "@/types";

interface UseBacktestReturn {
  result: BacktestResponse | null;
  history: BacktestListItem[];
  loading: boolean;
  error: string | null;
  run: (req: BacktestRequest) => Promise<void>;
  fetchHistory: (symbol?: string) => Promise<void>;
  reset: () => void;
}

export function useBacktest(): UseBacktestReturn {
  const [result,  setResult]  = useState<BacktestResponse | null>(null);
  const [history, setHistory] = useState<BacktestListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const run = useCallback(async (req: BacktestRequest) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRunBacktest(req);
      setResult(data as BacktestResponse);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Backtest failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async (symbol?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBacktests(20, symbol);
      setHistory(data as BacktestListItem[]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load history.");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, history, loading, error, run, fetchHistory, reset };
}

export function useBacktestHistory() {
  const [history, setHistory] = useState<BacktestListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    getBacktests()
      .then((data) => setHistory(data as BacktestListItem[]))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load history.")
      )
      .finally(() => setLoading(false));
  }, []);

  return { history, loading, error };
}
