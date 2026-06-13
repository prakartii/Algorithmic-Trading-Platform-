# QuantLab — Algorithmic Trading Platform

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Alpaca](https://img.shields.io/badge/Alpaca-Paper%20Trading-FFCD00?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

QuantLab is a full-stack algorithmic trading platform that combines quantitative backtesting, real-time paper trading execution, and institutional-grade portfolio analytics in a single cohesive application. It is built to demonstrate production-quality engineering across the entire software stack — from a vectorised backtesting engine and REST API layer to a dark-themed, animation-driven trading dashboard.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
  - [Backend](#backend-structure)
  - [Frontend](#frontend-structure)
- [API Reference](#api-reference)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Screenshots](#screenshots)
- [Future Improvements](#future-improvements)
- [Engineering Highlights](#engineering-highlights)
- [License](#license)

---

## Overview

QuantLab allows quantitative traders and developers to:

1. **Backtest** a 50/200-day SMA Golden Cross strategy against any equity ticker using historical OHLCV data from Yahoo Finance, powered by the [VectorBT](https://vectorbt.dev/) simulation engine.
2. **Analyse risk** with a standalone engine computing Sharpe ratio, Sortino ratio, annualised volatility, max drawdown, win rate, and profit factor from the resulting equity curve.
3. **Execute paper orders** against a live Alpaca Paper Trading account — market and limit orders for both equities and crypto — with automatic asset-class detection for correct `time_in_force` routing.
4. **Monitor portfolio state** in real time: open positions, unrealised P&L, cash, buying power, and day P&L pulled directly from the Alpaca API.
5. **Persist results** to a Supabase (PostgreSQL) database so backtest history and trade logs survive server restarts.

The frontend is a premium dark-theme SPA inspired by Linear, Stripe Dashboard, TradingView, and Hyperliquid — built with React 18, Framer Motion animations, and Recharts data visualisations.

---

## Features

### Backtesting Engine
- Vectorised 50/200-day SMA Golden Cross strategy via VectorBT
- Configurable initial capital (default $10,000) and commission rate (default 0.1%)
- Requires a minimum 252-bar history to ensure the 200-day SMA is computable
- Returns a full equity curve (date + portfolio value per trading day)
- Parallel risk computation from a dedicated `RiskEngine` class

### Risk Engine
- Annualised Sharpe Ratio (excess over configurable risk-free rate, default 5%)
- Annualised Sortino Ratio (downside-only standard deviation)
- Annualised Volatility (%)
- Max Drawdown (%) using running-peak calculation
- Win Rate (%) and Profit Factor derived from per-trade P&L records

### Paper Trading
- Market and limit orders for equities and crypto via Alpaca Paper API
- Automatic `time_in_force` routing: `DAY` for stocks, `GTC` for crypto assets (symbols ending in `USD`)
- Full order lifecycle inspection via `GET /api/paper-trade/orders/{order_id}`
- Sell-to-close support: omit quantity on a sell to liquidate the full position
- Structured logging of every submitted order with `order_id`, `asset_class`, `filled_qty`, and status

### Portfolio Dashboard
- Real-time portfolio value, cash, buying power, and day P&L
- Open positions table with unrealised P&L, cost basis, and current price
- Allocation donut chart with per-position percentage breakdown
- Equity curve chart with gradient fills, reference line at initial capital, and animated entry

### Data Persistence
- All completed backtests persisted to Supabase `backtests` table
- All paper orders persisted to Supabase `paper_trades` table
- History queries with `limit` and `symbol` filters
- Persistence is non-blocking: failures never break the API response

### Frontend UX
- Dark institutional design system (`#080810` canvas, `#0d0d1a` surfaces)
- Inter typeface, tabular-nums for all financial figures
- Framer Motion micro-animations with a consistent `[0.16, 1, 0.3, 1]` spring curve
- Collapsible sidebar with animated width transition and `AnimatePresence` text fade
- Stagger entrance animations on all list and grid layouts
- localStorage bridge: last backtest equity curve persists to the Dashboard without an additional API call
- Fully responsive layout with mobile sidebar overlay

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Browser (React SPA)                         │
│                                                                     │
│  ┌──────────┐  ┌────────────┐  ┌─────────────┐  ┌──────────────┐  │
│  │Dashboard │  │ Backtests  │  │PaperTrading │  │  Portfolio   │  │
│  └────┬─────┘  └─────┬──────┘  └──────┬──────┘  └──────┬───────┘  │
│       │               │                │                 │          │
│       └───────────────┴────────────────┴─────────────────┘          │
│                              │  Axios (REST)                        │
└──────────────────────────────┼──────────────────────────────────────┘
                               │ HTTP / JSON
┌──────────────────────────────▼──────────────────────────────────────┐
│                      FastAPI  (Python 3.11)                         │
│                                                                     │
│  ┌────────────┐  ┌───────────────┐  ┌──────────┐  ┌─────────────┐  │
│  │  /stocks   │  │  /backtest    │  │/portfolio│  │/paper-trade │  │
│  └─────┬──────┘  └──────┬────────┘  └────┬─────┘  └──────┬──────┘  │
│        │                │               │                │          │
│  ┌─────▼──────┐  ┌──────▼────────┐  ┌───▼──────────────▼──────┐   │
│  │DataIngestion│  │BacktestEngine │  │    AlpacaService        │   │
│  │(yfinance)  │  │  (VectorBT)   │  │  (alpaca-py SDK)        │   │
│  └────────────┘  └──────┬────────┘  └─────────────────────────┘   │
│                          │                        │                 │
│                   ┌──────▼──────┐                 │                 │
│                   │ RiskEngine  │                 │                 │
│                   │(numpy/pandas│                 │                 │
│                   └─────────────┘                 │                 │
└──────────────────────────────────────────────────┼─────────────────┘
                    │                              │
         ┌──────────▼───────────┐    ┌─────────────▼─────────────┐
         │  Supabase (Postgres) │    │  Alpaca Paper Trading API │
         │  - backtests         │    │  - Orders                 │
         │  - paper_trades      │    │  - Positions              │
         └──────────────────────┘    │  - Account / Portfolio    │
                                     └───────────────────────────┘
```

---

## Tech Stack

### Backend

| Layer | Technology | Purpose |
|---|---|---|
| API Framework | [FastAPI](https://fastapi.tiangolo.com/) 0.111 | REST API, request validation, OpenAPI docs |
| Data Validation | [Pydantic](https://docs.pydantic.dev/) v2 | Request/response models, field validators |
| Settings | [pydantic-settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/) | `.env` file loading with type safety |
| Backtesting | [VectorBT](https://vectorbt.dev/) | Vectorised SMA crossover simulation |
| Risk Analytics | NumPy + Pandas | Sharpe, Sortino, drawdown, volatility |
| Market Data | [yfinance](https://github.com/ranaroussi/yfinance) | OHLCV historical price ingestion |
| Broker API | [alpaca-py](https://github.com/alpacahq/alpaca-py) | Paper order submission, position queries |
| Database | [Supabase](https://supabase.com/) (PostgreSQL) | Backtest and trade persistence |
| ASGI Server | [Uvicorn](https://www.uvicorn.org/) | Production-ready async server |

### Frontend

| Layer | Technology | Purpose |
|---|---|---|
| Framework | React 18 + TypeScript | Component model, type safety |
| Build Tool | Vite 5 | Sub-second HMR, ESM bundling |
| Routing | React Router v6 | Client-side navigation |
| Styling | Tailwind CSS v3 | Utility-first design system |
| Animations | Framer Motion v11 | Micro-animations, layout transitions |
| Charts | Recharts | Equity curves, allocation donut chart |
| HTTP Client | Axios | REST calls with interceptors |
| Font | Inter (Google Fonts) | Institutional-grade typography |

---

## Project Structure

### Backend Structure

```
backend/
├── main.py                        # FastAPI app, CORS, router registration
└── app/
    ├── core/
    │   ├── config.py              # pydantic-settings — typed env vars
    │   ├── deps.py                # FastAPI dependency injection (AlpacaService singleton)
    │   └── supabase.py            # Supabase client initialisation
    ├── models/
    │   ├── backtest.py            # SQLAlchemy/dataclass models
    │   ├── position.py
    │   ├── strategy.py
    │   └── trade.py
    ├── schemas/
    │   ├── backtest.py            # Pydantic request/response schemas
    │   ├── portfolio.py           # PositionOut schema
    │   ├── strategy.py
    │   └── trade.py
    ├── routers/
    │   ├── stocks.py              # GET /api/stocks/{symbol}
    │   ├── backtest.py            # POST /api/backtest, GET /api/backtest
    │   ├── portfolio.py           # GET /api/portfolio
    │   └── paper_trading.py       # POST/GET /api/paper-trade/*
    └── services/
        ├── alpaca_service.py      # AlpacaService: buy/sell/positions/portfolio/get_order
        ├── backtest_engine.py     # BacktestEngine: VectorBT SMA crossover
        ├── risk_engine.py         # RiskEngine: Sharpe, Sortino, vol, drawdown
        ├── data_ingestion.py      # DataIngestionService: yfinance OHLCV fetch
        ├── momentum_strategy.py   # Cross-sectional momentum (in development)
        └── paper_trader.py        # Legacy paper trader (superseded by AlpacaService)
```

### Frontend Structure

```
frontend/
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── src/
    ├── main.tsx                   # ReactDOM.createRoot, RouterProvider
    ├── index.css                  # Google Fonts import, scrollbar styles, utilities
    ├── router/
    │   └── index.tsx              # createBrowserRouter — all 8 routes
    ├── layouts/
    │   ├── DashboardLayout.tsx    # Root shell: sidebar + topbar + <Outlet>
    │   ├── Sidebar.tsx            # Animated collapsible nav with 3 nav groups
    │   └── TopBar.tsx             # 52px bar: page title, search, market status, clock
    ├── pages/
    │   ├── Dashboard/             # 4 stats, equity curve, allocation, positions, backtest history
    │   ├── Portfolio/             # Holdings table + allocation donut chart
    │   ├── Strategies/            # Strategy library cards with params and metrics
    │   ├── Backtests/             # Backtest form + equity curve result + history table
    │   ├── PaperTrading/          # Order form + open positions + session order log
    │   ├── Analytics/             # Planned features stub
    │   ├── AIInsights/            # Planned features stub
    │   └── Settings/              # Read-only platform configuration display
    ├── components/
    │   ├── charts/
    │   │   ├── EquityCurveChart.tsx   # AreaChart with gradient fills, reference line
    │   │   ├── AllocationChart.tsx    # PieChart donut with legend
    │   │   └── OHLCVChart.tsx
    │   └── ui/
    │       ├── StatCard.tsx           # Metric tile with loading skeleton, P&L indicator
    │       ├── Card.tsx               # Surface container with CardHeader
    │       ├── Button.tsx             # primary / secondary / danger / ghost variants
    │       ├── Badge.tsx              # Inline label: success / warning / danger / blue
    │       ├── Spinner.tsx            # Animated loading indicator
    │       └── PageTransition.tsx     # Framer Motion fade+lift wrapper
    ├── services/
    │   └── api.ts                 # Axios instance, typed API functions, error classes
    ├── types/
    │   └── index.ts               # Shared TypeScript interfaces for all API shapes
    ├── utils/
    │   ├── cn.ts                  # clsx + tailwind-merge helper
    │   ├── formatters.ts          # formatCurrency, formatPercent, formatNumber
    │   ├── storage.ts             # localStorage bridge for last backtest result
    │   └── constants.ts
    └── hooks/
        ├── usePortfolio.ts
        ├── useBacktest.ts
        ├── usePaperTrading.ts
        └── useStockData.ts
```

---

## API Reference

All endpoints are prefixed with `/api`. Interactive documentation is available at `/api/docs` (Swagger UI) and `/api/redoc`.

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Liveness check — returns `{"status": "ok"}` |

### Market Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stocks/{symbol}` | OHLCV price history for a ticker |

**Query parameters:** `start` (YYYY-MM-DD, required), `end` (YYYY-MM-DD, required), `interval` (`1d` \| `1wk` \| `1mo`, default `1d`)

```json
// GET /api/stocks/AAPL?start=2024-01-01&end=2024-12-31
{
  "symbol": "AAPL",
  "interval": "1d",
  "count": 252,
  "data": [
    { "date": "2024-01-02", "open": 185.24, "high": 186.10, "low": 184.22, "close": 185.92, "volume": 72054000 }
  ]
}
```

### Backtesting

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/backtest` | Run a 50/200 SMA Golden Cross backtest |
| `GET` | `/api/backtest` | List completed backtests from Supabase |

**POST request body:**

```json
{
  "symbol": "AAPL",
  "start_date": "2019-01-01",
  "end_date": "2024-01-01",
  "initial_capital": 10000,
  "commission_pct": 0.001
}
```

**POST response (selected fields):**

```json
{
  "symbol": "AAPL",
  "initial_capital": 10000.0,
  "final_value": 18432.10,
  "total_return_pct": 84.32,
  "cagr_pct": 13.05,
  "sharpe_ratio": 0.8741,
  "sortino_ratio": 1.2103,
  "max_drawdown_pct": -22.48,
  "volatility_pct": 19.34,
  "win_rate_pct": 60.0,
  "profit_factor": 2.31,
  "trade_count": 10,
  "equity_curve": [
    { "date": "2019-01-02", "value": 10000.0 },
    { "date": "2019-01-03", "value": 9961.2 }
  ]
}
```

**GET query parameters:** `limit` (1–100, default 20), `symbol` (optional filter)

### Portfolio

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/portfolio` | Current paper-trading portfolio summary |

```json
{
  "portfolio_value": 102450.88,
  "equity": 102450.88,
  "cash": 98000.00,
  "buying_power": 196000.00,
  "unrealized_pnl": 450.88,
  "day_pnl": 112.30,
  "position_count": 2,
  "positions": [
    {
      "symbol": "AAPL",
      "quantity": 10.0,
      "avg_cost": 182.50,
      "current_price": 187.50,
      "market_value": 1875.00,
      "unrealized_pnl": 50.00,
      "unrealized_pnl_pct": 2.74,
      "side": "long"
    }
  ]
}
```

### Paper Trading

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/paper-trade/orders` | Submit a paper buy or sell order |
| `GET` | `/api/paper-trade/orders/{order_id}` | Fetch full Alpaca order object by ID |
| `GET` | `/api/paper-trade/positions` | All open paper-trading positions |

**POST request body:**

```json
{
  "symbol": "AAPL",
  "side": "buy",
  "quantity": 5,
  "limit_price": 182.00
}
```

> `quantity` is required for `buy` orders. Omit `quantity` on a `sell` to close the full position. Omit `limit_price` for a market order.

**POST response:**

```json
{
  "order_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "client_order_id": "ql-abc123",
  "symbol": "AAPL",
  "side": "buy",
  "quantity": 5.0,
  "order_type": "limit",
  "limit_price": 182.00,
  "status": "accepted",
  "submitted_at": "2026-06-14T09:32:00Z"
}
```

### Error Responses

All error responses follow FastAPI's standard shape:

```json
{ "detail": "Human-readable error message" }
```

| Status | Meaning |
|--------|---------|
| `404` | Ticker not found / position not found |
| `422` | Validation error (invalid dates, missing required fields) |
| `502` | Upstream failure (Alpaca API error, Yahoo Finance unreachable) |
| `500` | Unexpected server error |

---

## Installation

### Prerequisites

- Python 3.11+
- Node.js 18+ and npm
- A free [Alpaca](https://alpaca.markets/) account (Paper Trading enabled)
- A free [Supabase](https://supabase.com/) project

### 1. Clone the repository

```bash
git clone https://github.com/your-username/quantlab.git
cd quantlab
```

### 2. Backend setup

```bash
cd backend
python -m venv .venv

# macOS / Linux
source .venv/bin/activate

# Windows
.venv\Scripts\activate

pip install -r requirements.txt
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

### 4. Supabase schema

Run the following SQL in the Supabase SQL editor to create the required tables:

```sql
-- Backtest history
create table backtests (
  id               uuid primary key default gen_random_uuid(),
  symbol           text not null,
  start_date       text not null,
  end_date         text not null,
  initial_capital  numeric not null,
  final_capital    numeric,
  total_return_pct numeric,
  cagr_pct         numeric,
  sharpe_ratio     numeric,
  sortino_ratio    numeric,
  max_drawdown_pct numeric,
  volatility_pct   numeric,
  win_rate_pct     numeric,
  profit_factor    numeric,
  trade_count      integer,
  equity_curve     jsonb,
  status           text not null default 'completed',
  created_at       timestamptz default now()
);

-- Paper trade log
create table paper_trades (
  id               uuid primary key default gen_random_uuid(),
  order_id         text not null,
  client_order_id  text,
  symbol           text not null,
  side             text not null,
  quantity         numeric,
  order_type       text,
  limit_price      numeric,
  status           text,
  submitted_at     text,
  created_at       timestamptz default now()
);
```

---

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# ── Supabase ──────────────────────────────────────────────────────────
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-public-key
SUPABASE_SERVICE_KEY=your-service-role-key

# ── Alpaca Paper Trading ──────────────────────────────────────────────
ALPACA_API_KEY=your-alpaca-api-key
ALPACA_SECRET_KEY=your-alpaca-secret-key
ALPACA_BASE_URL=https://paper-api.alpaca.markets
```

Optionally, create a `.env` file in `frontend/` to override the API base URL:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

> **Security:** API keys are loaded server-side only via `pydantic-settings`. They are never shipped to the browser.

---

## Running Locally

### Start the backend

```bash
cd backend
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.
Swagger UI: `http://localhost:8000/api/docs`

### Start the frontend

```bash
cd frontend
npm run dev
```

The SPA will be available at `http://localhost:5173`.

### Verify the stack

```bash
curl http://localhost:8000/health
# {"status":"ok"}

curl "http://localhost:8000/api/portfolio"
# {"portfolio_value":...}
```

---

## Screenshots

> _Add screenshots by replacing the placeholders below with actual image paths or URLs._

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Backtesting — Equity Curve
![Backtests](docs/screenshots/backtests.png)

### Paper Trading — Order Form
![Paper Trading](docs/screenshots/paper-trading.png)

### Portfolio — Holdings + Allocation
![Portfolio](docs/screenshots/portfolio.png)

---

## Future Improvements

| Area | Planned Feature |
|------|----------------|
| Strategies | Cross-sectional momentum (12-1 month) with monthly rebalancing |
| Strategies | Mean reversion (Bollinger Bands, RSI-based) |
| Backtesting | Multi-asset portfolio backtests |
| Backtesting | Walk-forward optimisation and Monte Carlo simulation |
| Analytics | P&L attribution by strategy, sector, and time period |
| Analytics | Rolling Sharpe/Sortino charts |
| Analytics | Factor exposure decomposition (Fama-French) |
| AI Insights | Claude-powered strategy signals and risk alerts |
| AI Insights | Market regime classification (trending / mean-reverting / volatile) |
| Paper Trading | Order book and order history from Alpaca |
| Paper Trading | Stop-loss and take-profit order types |
| Infrastructure | WebSocket feed for real-time position updates |
| Infrastructure | Celery + Redis for async backtest jobs |
| Infrastructure | Docker Compose for one-command local setup |
| Infrastructure | CI/CD pipeline with GitHub Actions |

---

## Engineering Highlights

These design decisions reflect production engineering practices and are worth highlighting in technical discussions:

**Vectorised backtesting.** Rather than a loop-based event simulator, `BacktestEngine` delegates all signal generation and portfolio simulation to VectorBT, which uses NumPy broadcasting across the full price series in a single pass. This makes adding new indicators trivial and keeps simulations sub-second even for 20-year histories.

**Separation of risk concerns.** `BacktestEngine` computes exchange-reported metrics (total return, Sharpe via VectorBT's internal stats). `RiskEngine` re-derives the same equity curve independently using NumPy — providing a second opinion and enabling metrics VectorBT does not expose (Sortino, per-trade win rate, profit factor). The two engines never share state.

**Asset-class-aware order routing.** Alpaca silently rejects equity `time_in_force` values for crypto symbols. `AlpacaService._is_crypto()` normalises the symbol (strips `/`, uppercases) and selects `GTC` for crypto assets and `DAY` for equities before the SDK call — preventing the entire class of "invalid time_in_force" 422 errors without any client-side knowledge.

**Non-blocking persistence.** Supabase inserts in the backtest and paper-trade routes are wrapped in `try/except` with a bare `pass` on failure. The HTTP response is always returned regardless of database state, so a Supabase outage cannot degrade the core trading and backtesting experience.

**Singleton broker client.** `get_alpaca_service()` is decorated with `@lru_cache(maxsize=1)`. FastAPI's dependency injection calls it once per process and reuses the same `TradingClient` instance, avoiding repeated authentication handshakes on every request.

**localStorage equity curve bridge.** The Dashboard displays the equity chart from the most recent backtest without a second API call or a shared state store. `src/utils/storage.ts` serialises the full `BacktestResponse` to `localStorage` when a backtest completes on the Backtests page; the Dashboard reads it on mount. This keeps the two pages fully decoupled while delivering a zero-latency chart render.

**Typed end-to-end contract.** Backend Pydantic models and frontend TypeScript interfaces are kept in sync manually by design — there is no code-generation step. Every API shape has a corresponding interface in `src/types/index.ts`, and Axios interceptors convert all non-2xx responses to typed `ApiError` subclasses (`NotFoundError`, `ValidationError`, `UpstreamError`) before they reach component code.

**Design system over component library.** The UI is built entirely without a third-party component library (no MUI, Shadcn, Radix). Every primitive (`Button`, `Card`, `Badge`, `StatCard`, `Spinner`) is hand-authored in ~50 lines of Tailwind. This removes bundle overhead and gives complete control over the visual identity.

---

## License

MIT License — see [LICENSE](LICENSE) for full text.

```
MIT License

Copyright (c) 2026 QuantLab Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
