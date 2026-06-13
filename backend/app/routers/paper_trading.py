from __future__ import annotations

from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator, model_validator

from app.core.deps import get_alpaca_service
from app.core.supabase import supabase
from app.schemas.portfolio import PositionOut
from app.services.alpaca_service import (
    AlpacaOrderError,
    AlpacaService,
    PositionNotFoundError,
)

router = APIRouter(prefix="/paper-trade", tags=["Paper Trading"])


# ── request models ────────────────────────────────────────────────────────────

class OrderRequest(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=10)
    side: Literal["buy", "sell"]
    quantity: float | None = Field(
        default=None,
        gt=0,
        description="Number of shares. Omit on a sell to close the full position.",
    )
    limit_price: float | None = Field(
        default=None,
        gt=0,
        description="Limit price in USD. Omit for a market order.",
    )

    @field_validator("symbol")
    @classmethod
    def normalise_symbol(cls, v: str) -> str:
        return v.strip().upper()

    @model_validator(mode="after")
    def validate_buy_requires_qty(self) -> "OrderRequest":
        if self.side == "buy" and self.quantity is None:
            raise ValueError("quantity is required for buy orders.")
        return self


# ── response models ───────────────────────────────────────────────────────────

class OrderResponse(BaseModel):
    order_id: str
    client_order_id: str
    symbol: str
    side: str
    quantity: float
    order_type: str
    limit_price: float | None
    status: str
    submitted_at: str



# ── dependency ────────────────────────────────────────────────────────────────

AlpacaSvc = Annotated[AlpacaService, Depends(get_alpaca_service)]


# ── routes ────────────────────────────────────────────────────────────────────

@router.post(
    "/orders",
    response_model=OrderResponse,
    status_code=201,
    summary="Submit a paper buy or sell order",
)
def submit_order(req: OrderRequest, svc: AlpacaSvc) -> OrderResponse:
    try:
        if req.side == "buy":
            result = svc.buy(
                symbol=req.symbol,
                quantity=req.quantity,        # type: ignore[arg-type]  # validated non-None above
                limit_price=req.limit_price,
            )
        else:
            result = svc.sell(
                symbol=req.symbol,
                quantity=req.quantity,        # None closes the full position
                limit_price=req.limit_price,
            )

    except PositionNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except AlpacaOrderError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Unexpected error submitting order: {exc}",
        ) from exc

    response = OrderResponse(
        order_id=result.order_id,
        client_order_id=result.client_order_id,
        symbol=result.symbol,
        side=result.side,
        quantity=result.quantity,
        order_type=result.order_type,
        limit_price=result.limit_price,
        status=result.status,
        submitted_at=result.submitted_at,
    )

    # ── persist to Supabase (non-blocking) ────────────────────────────────────
    try:
        supabase.table("paper_trades").insert({
            "order_id":         result.order_id,
            "client_order_id":  result.client_order_id,
            "symbol":           result.symbol,
            "side":             result.side,
            "quantity":         result.quantity,
            "order_type":       result.order_type,
            "limit_price":      result.limit_price,
            "status":           result.status,
            "submitted_at":     result.submitted_at,
        }).execute()
    except Exception:
        pass

    return response


@router.get(
    "/orders/{order_id}",
    summary="Fetch full Alpaca order by ID",
)
def get_order(order_id: str, svc: AlpacaSvc) -> dict:
    try:
        return svc.get_order(order_id)
    except AlpacaOrderError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch order: {exc}",
        ) from exc


@router.get(
    "/positions",
    response_model=list[PositionOut],
    summary="All open paper-trading positions",
)
def get_positions(svc: AlpacaSvc) -> list[PositionOut]:
    try:
        positions = svc.get_positions()
    except AlpacaOrderError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to retrieve positions from Alpaca: {exc}",
        ) from exc

    return [
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
        for p in positions
    ]
