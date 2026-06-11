-- QuantLab — Supabase schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Safe to re-run: all statements use CREATE TABLE IF NOT EXISTS.

-- ── Extensions ────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()


-- ── backtests ─────────────────────────────────────────────────────────────────
-- One row per completed backtest run.

CREATE TABLE IF NOT EXISTS backtests (
    id                uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol            text         NOT NULL,
    start_date        date         NOT NULL,
    end_date          date         NOT NULL,
    initial_capital   numeric      NOT NULL CHECK (initial_capital > 0),
    final_capital     numeric,
    total_return_pct  numeric,
    cagr_pct          numeric,
    sharpe_ratio      numeric,
    sortino_ratio     numeric,
    max_drawdown_pct  numeric,
    volatility_pct    numeric,
    win_rate_pct      numeric,
    profit_factor     numeric,
    trade_count       integer,
    equity_curve      jsonb,       -- array of {date: str, value: float}
    status            text         NOT NULL DEFAULT 'completed'
                                   CHECK (status IN ('pending','running','completed','failed')),
    created_at        timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS backtests_symbol_idx    ON backtests (symbol);
CREATE INDEX IF NOT EXISTS backtests_created_idx   ON backtests (created_at DESC);
CREATE INDEX IF NOT EXISTS backtests_status_idx    ON backtests (status);


-- ── paper_trades ──────────────────────────────────────────────────────────────
-- One row per order submitted to Alpaca paper trading.

CREATE TABLE IF NOT EXISTS paper_trades (
    id                uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id          text         NOT NULL UNIQUE,   -- Alpaca order id
    client_order_id   text,
    symbol            text         NOT NULL,
    side              text         NOT NULL CHECK (side IN ('buy','sell')),
    quantity          numeric      NOT NULL,
    order_type        text         NOT NULL CHECK (order_type IN ('market','limit')),
    limit_price       numeric,
    status            text         NOT NULL,
    submitted_at      timestamptz,
    created_at        timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS paper_trades_symbol_idx  ON paper_trades (symbol);
CREATE INDEX IF NOT EXISTS paper_trades_side_idx    ON paper_trades (side);
CREATE INDEX IF NOT EXISTS paper_trades_created_idx ON paper_trades (created_at DESC);


-- ── strategies ────────────────────────────────────────────────────────────────
-- Strategy definitions (seed data below).

CREATE TABLE IF NOT EXISTS strategies (
    id          uuid   PRIMARY KEY DEFAULT gen_random_uuid(),
    name        text   NOT NULL UNIQUE,
    tag         text   NOT NULL,
    description text,
    params      jsonb,           -- [{label, value}, ...]
    available   boolean NOT NULL DEFAULT false,
    created_at  timestamptz NOT NULL DEFAULT now()
);

-- Seed strategies (idempotent via ON CONFLICT DO NOTHING).
INSERT INTO strategies (name, tag, description, params, available) VALUES
(
    'SMA Golden Cross',
    'Trend Following',
    'Buys when the 50-day SMA crosses above the 200-day SMA, exits on the reverse cross. Classic long-only trend filter.',
    '[
        {"label": "Fast Window",  "value": "50 days"},
        {"label": "Slow Window",  "value": "200 days"},
        {"label": "Min History",  "value": "252 bars"},
        {"label": "Order Type",   "value": "Market"}
    ]',
    true
),
(
    'Momentum (12-1)',
    'Momentum',
    'Ranks assets by trailing 12-month return (skip last month). Buys top performers, rebalances monthly.',
    '[
        {"label": "Lookback",  "value": "12 months"},
        {"label": "Skip Last", "value": "1 month"},
        {"label": "Rebalance", "value": "Monthly"},
        {"label": "Universe",  "value": "S&P 500"}
    ]',
    false
)
ON CONFLICT (name) DO NOTHING;


-- ── Row Level Security ────────────────────────────────────────────────────────
-- Enable RLS on all tables.  In the current single-user paper-trading setup
-- the service-role key bypasses RLS entirely, so these policies are a no-op
-- for now but enforce least-privilege if you add auth later.

ALTER TABLE backtests     ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_trades  ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies    ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read on strategies (public reference data).
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'strategies' AND policyname = 'strategies_read_public'
    ) THEN
        CREATE POLICY strategies_read_public ON strategies
            FOR SELECT USING (true);
    END IF;
END $$;
