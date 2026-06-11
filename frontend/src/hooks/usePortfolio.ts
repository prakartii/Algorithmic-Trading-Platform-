import { useState, useCallback, useEffect } from "react";
import { getPortfolio, getPositions } from "@/services/api";
import type { PortfolioResponse, Position } from "@/types";

interface UsePortfolioReturn {
  portfolio: PortfolioResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function usePortfolio(): UsePortfolioReturn {
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPortfolio();
      setPortfolio(data as PortfolioResponse);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load portfolio.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  return { portfolio, loading, error, refresh };
}

interface UsePositionsReturn {
  positions: Position[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function usePositions(): UsePositionsReturn {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPositions();
      setPositions(data as Position[]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load positions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  return { positions, loading, error, refresh };
}
