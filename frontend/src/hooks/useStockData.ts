import { useState, useCallback } from "react";
import { getStockData } from "@/services/api";
import type { OHLCVResponse, BarInterval } from "@/types";

interface UseStockDataReturn {
  data: OHLCVResponse | null;
  loading: boolean;
  error: string | null;
  fetch: (symbol: string, start: string, end: string, interval?: BarInterval) => Promise<void>;
  reset: () => void;
}

export function useStockData(): UseStockDataReturn {
  const [data,    setData]    = useState<OHLCVResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const fetch = useCallback(async (
    symbol:   string,
    start:    string,
    end:      string,
    interval: BarInterval = "1d",
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getStockData(symbol, start, end, interval);
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load price data.");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, loading, error, fetch, reset };
}
