from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.deps import get_alpaca_service
from app.schemas.portfolio import PositionOut
from app.services.alpaca_service import AlpacaOrderError, AlpacaService

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])


# ── response models ───────────────────────────────────────────────────────────


class PortfolioResponse(BaseModel):
    portfolio_value: float
    equity: float
    cash: float
    buying_power: float
    unrealized_pnl: float
    day_pnl: float
    position_count: int
    positions: list[PositionOut]


# ── dependency ────────────────────────────────────────────────────────────────

AlpacaSvc = Annotated[AlpacaService, Depends(get_alpaca_service)]


# ── routes ────────────────────────────────────────────────────────────────────

@router.get(
    "",
    response_model=PortfolioResponse,
    summary="Current paper-trading portfolio summary",
)
def get_portfolio(svc: AlpacaSvc) -> PortfolioResponse:
    try:
        summary = svc.get_portfolio()
    except AlpacaOrderError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to retrieve portfolio from Alpaca: {exc}",
        ) from exc

    positions = [
        PositionOut(
            symbol=p.symbol,
            quantity=p.quantity,
            avg_cost=p.avg_cost,
            current_price=p.current_price,
            market_value=p.market_value,
            unrealized_pnl=p.unrealized_pnl,
            unrealized_pnl_pct=p.unrealized_pnl_pct,
            side=p.side,
        )
        for p in summary.positions
    ]

    return PortfolioResponse(
        portfolio_value=summary.portfolio_value,
        equity=summary.equity,
        cash=summary.cash,
        buying_power=summary.buying_power,
        unrealized_pnl=summary.unrealized_pnl,
        day_pnl=summary.day_pnl,
        position_count=len(positions),
        positions=positions,
    )
