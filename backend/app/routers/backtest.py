from __future__ import annotations

from datetime import date
from typing import Annotated

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field, field_validator, model_validator

from app.core.supabase import supabase
from app.services.backtest_engine import (
    BacktestEngine,
    InsufficientDataError,
    NoTradesGeneratedError,
)
from app.services.data_ingestion import DataIngestionService, TickerNotFoundError
from app.services.risk_engine import RiskEngine

router = APIRouter(prefix="/backtest", tags=["Backtesting"])


# ── request model ─────────────────────────────────────────────────────────────

class BacktestRequest(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=10)
    start_date: date
    end_date: date
    initial_capital: float = Field(default=10_000.0, gt=0, description="Starting capital in USD")
    commission_pct: float = Field(default=0.001, ge=0, lt=1, description="Commission per trade (0.001 = 0.1%)")

    @field_validator("symbol")
    @classmethod
    def normalise_symbol(cls, v: str) -> str:
        return v.strip().upper()

    @model_validator(mode="after")
    def validate_date_range(self) -> "BacktestRequest":
        if self.start_date >= self.end_date:
            raise ValueError("start_date must be before end_date.")
        if (self.end_date - self.start_date).days < 252:
            raise ValueError(
                "Date range must span at least 252 trading days (~1 year) "
                "to compute the 200-day SMA."
            )
        return self


# ── response models ───────────────────────────────────────────────────────────

class EquityPoint(BaseModel):
    date: str
    value: float


class BacktestResponse(BaseModel):
    symbol: str
    start_date: str
    end_date: str
    # capital
    initial_capital: float
    final_value: float
    # return metrics
    total_return_pct: float
    cagr_pct: float
    trade_count: int
    # risk — from BacktestEngine (VectorBT)
    sharpe_ratio: float
    max_drawdown_pct: float
    # risk — from RiskEngine (standalone)
    sortino_ratio: float
    volatility_pct: float
    win_rate_pct: float
    profit_factor: float
    # chart
    equity_curve: list[EquityPoint]


class BacktestListItem(BaseModel):
    id: str | None = None
    symbol: str
    start_date: str
    end_date: str
    initial_capital: float
    final_capital: float | None = None
    total_return_pct: float | None = None
    sharpe_ratio: float | None = None
    max_drawdown_pct: float | None = None
    trade_count: int | None = None
    status: str
    created_at: str | None = None


# ── dependencies ──────────────────────────────────────────────────────────────

def _data_service() -> DataIngestionService:
    return DataIngestionService()


def _risk_engine() -> RiskEngine:
    return RiskEngine()


DataSvc  = Annotated[DataIngestionService, Depends(_data_service)]
RiskSvc  = Annotated[RiskEngine,           Depends(_risk_engine)]


# ── routes ────────────────────────────────────────────────────────────────────

@router.post(
    "",
    response_model=BacktestResponse,
    status_code=200,
    summary="Run a 50/200 SMA golden-cross backtest",
)
def run_backtest(
    req: BacktestRequest,
    data_svc: DataSvc,
    risk_svc: RiskSvc,
) -> BacktestResponse:
    # 1 ── fetch OHLCV
    try:
        bars = data_svc.fetch_ohlcv(req.symbol, req.start_date, req.end_date, "1d")
    except TickerNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Price data fetch failed: {exc}") from exc

    # 2 ── build close-price Series
    closes = pd.Series(
        data=[b["close"] for b in bars],
        index=pd.to_datetime([b["date"] for b in bars]),
        name="close",
        dtype=float,
    )

    # 3 ── run backtest engine
    try:
        engine = BacktestEngine(
            initial_capital=req.initial_capital,
            commission=req.commission_pct,
        )
        result = engine.run(closes, req.symbol)
    except InsufficientDataError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except NoTradesGeneratedError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Backtest engine error: {exc}") from exc

    # 4 ── run risk engine on equity curve
    equity_series = pd.Series(
        data=[p["value"] for p in result.equity_curve],
        index=pd.to_datetime([p["date"] for p in result.equity_curve]),
        dtype=float,
    )
    risk = risk_svc.compute(equity_series, trade_pnls=result.trade_pnls)

    response = BacktestResponse(
        symbol=result.symbol,
        start_date=result.start_date,
        end_date=result.end_date,
        initial_capital=result.initial_capital,
        final_value=result.final_value,
        total_return_pct=result.total_return_pct,
        cagr_pct=result.cagr_pct,
        trade_count=result.trade_count,
        sharpe_ratio=result.sharpe_ratio,
        max_drawdown_pct=result.max_drawdown_pct,
        sortino_ratio=risk.sortino_ratio,
        volatility_pct=risk.volatility_pct,
        win_rate_pct=risk.win_rate_pct,
        profit_factor=risk.profit_factor,
        equity_curve=[EquityPoint(**p) for p in result.equity_curve],
    )

    # ── persist to Supabase (non-blocking: failure never breaks the response) ──
    try:
        supabase.table("backtests").insert({
            "symbol":           result.symbol,
            "start_date":       result.start_date,
            "end_date":         result.end_date,
            "initial_capital":  result.initial_capital,
            "final_capital":    result.final_value,
            "total_return_pct": result.total_return_pct,
            "cagr_pct":         result.cagr_pct,
            "sharpe_ratio":     result.sharpe_ratio,
            "sortino_ratio":    risk.sortino_ratio,
            "max_drawdown_pct": result.max_drawdown_pct,
            "volatility_pct":   risk.volatility_pct,
            "win_rate_pct":     risk.win_rate_pct,
            "profit_factor":    risk.profit_factor,
            "trade_count":      result.trade_count,
            "equity_curve":     result.equity_curve,
            "status":           "completed",
        }).execute()
    except Exception:
        pass

    return response


@router.get(
    "",
    response_model=list[BacktestListItem],
    summary="List completed backtests (excludes equity curve)",
)
def list_backtests(
    limit: int = Query(default=20, ge=1, le=100, description="Max results to return"),
    symbol: str | None = Query(default=None, description="Filter by ticker symbol"),
) -> list[BacktestListItem]:
    try:
        query = (
            supabase.table("backtests")
            .select(
                "id, symbol, start_date, end_date, initial_capital, "
                "final_capital, total_return_pct, sharpe_ratio, "
                "max_drawdown_pct, trade_count, status, created_at"
            )
            .eq("status", "completed")
            .order("created_at", desc=True)
            .limit(limit)
        )

        if symbol:
            query = query.eq("symbol", symbol.upper())

        result = query.execute()
        return result.data or []

    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to retrieve backtest history: {exc}",
        ) from exc
