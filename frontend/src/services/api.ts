import axios from "axios";
import type {
  OHLCVResponse,
  BacktestRequest,
  BacktestResponse,
  BacktestListItem,
  PortfolioResponse,
  Position,
  OrderRequest,
  OrderResponse,
} from "@/types";

// ── Error types ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  statusCode: number | null;
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name      = "ApiError";
    this.statusCode = statusCode ?? null;
  }
}

export class NotFoundError  extends ApiError {
  constructor(m: string) { super(m, 404); this.name = "NotFoundError"; }
}
export class ValidationError extends ApiError {
  constructor(m: string) { super(m, 422); this.name = "ValidationError"; }
}
export class UpstreamError  extends ApiError {
  constructor(m: string) { super(m, 502); this.name = "UpstreamError"; }
}

// ── Axios instance ────────────────────────────────────────────────────────────

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 60_000,
});

client.interceptors.request.use(
  (config) => config,
  (error)  => Promise.reject(error),
);

client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const detail = error.response?.data?.detail ?? error.message ?? "Unexpected error.";

    if (status === 404) return Promise.reject(new NotFoundError(detail));
    if (status === 422) return Promise.reject(new ValidationError(detail));
    if (status >= 500)  return Promise.reject(new UpstreamError(detail));
    return Promise.reject(new ApiError(detail, status));
  },
);

// ── Market data ───────────────────────────────────────────────────────────────

export function getStockData(
  symbol:   string,
  start:    string,
  end:      string,
  interval: "1d" | "1wk" | "1mo" = "1d",
): Promise<OHLCVResponse> {
  return client.get(`/stocks/${symbol.toUpperCase()}`, {
    params: { start, end, interval },
  });
}

// ── Backtesting ───────────────────────────────────────────────────────────────

export function runBacktest(params: BacktestRequest): Promise<BacktestResponse> {
  return client.post("/backtest", {
    ...params,
    symbol: params.symbol.toUpperCase(),
  });
}

export function getBacktests(
  limit  = 20,
  symbol?: string,
): Promise<BacktestListItem[]> {
  return client.get("/backtest", {
    params: {
      limit,
      ...(symbol && { symbol: symbol.toUpperCase() }),
    },
  });
}

// ── Portfolio ─────────────────────────────────────────────────────────────────

export function getPortfolio(): Promise<PortfolioResponse> {
  return client.get("/portfolio");
}

// ── Paper trading ─────────────────────────────────────────────────────────────

export function placePaperTrade(params: OrderRequest): Promise<OrderResponse> {
  const body: Record<string, unknown> = {
    symbol: params.symbol.toUpperCase(),
    side:   params.side,
  };
  if (params.quantity    != null) body.quantity    = params.quantity;
  if (params.limit_price != null) body.limit_price = params.limit_price;
  return client.post("/paper-trade/orders", body);
}

export function getPositions(): Promise<Position[]> {
  return client.get("/paper-trade/positions");
}
