from pydantic import BaseModel
from typing import Any
from uuid import UUID
from datetime import date


class BacktestCreate(BaseModel):
    strategy_id: UUID
    symbol: str
    start_date: date
    end_date: date
    initial_capital: float
    commission_pct: float = 0.001


class BacktestResponse(BaseModel):
    id: UUID
    strategy_id: UUID
    symbol: str
    status: str
    total_return_pct: float | None = None
    sharpe_ratio: float | None = None
    max_drawdown_pct: float | None = None
    win_rate_pct: float | None = None
    total_trades: int | None = None
    equity_curve: list[dict[str, Any]] | None = None
