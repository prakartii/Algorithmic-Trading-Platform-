import { useState, useCallback } from "react";
import { placePaperTrade } from "@/services/api";
import type { OrderRequest, OrderResponse } from "@/types";

interface UsePaperTradingReturn {
  lastOrder: OrderResponse | null;
  loading: boolean;
  error: string | null;
  placeOrder: (req: OrderRequest) => Promise<OrderResponse | null>;
  reset: () => void;
}

export function usePaperTrading(): UsePaperTradingReturn {
  const [lastOrder, setLastOrder] = useState<OrderResponse | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const placeOrder = useCallback(async (req: OrderRequest) => {
    setLoading(true);
    setError(null);
    try {
      const order = await placePaperTrade(req);
      setLastOrder(order);
      return order;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Order submission failed.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLastOrder(null);
    setError(null);
  }, []);

  return { lastOrder, loading, error, placeOrder, reset };
}
