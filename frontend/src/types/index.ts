// ── Market Data ───────────────────────────────────────────────────────────────

export interface OHLCVBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OHLCVResponse {
  symbol: string;
  interval: string;
  count: number;
  data: OHLCVBar[];
}

export type BarInterval = "1d" | "1wk" | "1mo";

// ── Backtesting ───────────────────────────────────────────────────────────────

export interface BacktestRequest {
  symbol: string;
  start_date: string;          // YYYY-MM-DD
  end_date: string;            // YYYY-MM-DD
  initial_capital?: number;    // default 10 000
  commission_pct?: number;     // default 0.001
}

export interface EquityPoint {
  date: string;
  value: number;
}

export interface BacktestResponse {
  symbol: string;
  start_date: string;
  end_date: string;
  initial_capital: number;
  final_value: number;
  total_return_pct: number;
  cagr_pct: number;
  trade_count: number;
  sharpe_ratio: number;
  max_drawdown_pct: number;
  sortino_ratio: number;
  volatility_pct: number;
  win_rate_pct: number;
  profit_factor: number;
  equity_curve: EquityPoint[];
}

export interface BacktestListItem {
  id?: string;
  symbol: string;
  start_date: string;
  end_date: string;
  initial_capital: number;
  final_capital?: number;
  total_return_pct?: number;
  sharpe_ratio?: number;
  max_drawdown_pct?: number;
  trade_count?: number;
  status: "pending" | "running" | "completed" | "failed";
  created_at?: string;
}

// ── Portfolio ─────────────────────────────────────────────────────────────────

export interface Position {
  symbol: string;
  quantity: number;
  avg_cost: number;
  current_price: number;
  market_value: number;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
  side: "long" | "short";
}

export interface PortfolioResponse {
  portfolio_value: number;
  equity: number;
  cash: number;
  buying_power: number;
  unrealized_pnl: number;
  day_pnl: number;
  position_count: number;
  positions: Position[];
}

// ── Paper Trading ─────────────────────────────────────────────────────────────

export type OrderSide = "buy" | "sell";

export interface OrderRequest {
  symbol: string;
  side: OrderSide;
  quantity?: number;         // required for buy; omit to close full position on sell
  limit_price?: number;      // omit for market order
}

export interface OrderResponse {
  order_id: string;
  client_order_id: string;
  symbol: string;
  side: OrderSide;
  quantity: number;
  order_type: "market" | "limit";
  limit_price?: number;
  status: string;
  submitted_at: string;
}

// ── Shared ────────────────────────────────────────────────────────────────────

export interface ApiError {
  detail: string;
}
