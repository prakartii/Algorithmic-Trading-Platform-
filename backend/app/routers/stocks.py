from __future__ import annotations

import re
from datetime import date
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.services.data_ingestion import DataIngestionService, TickerNotFoundError

router = APIRouter(prefix="/stocks", tags=["Market Data"])

_SYMBOL_RE = re.compile(r"^[A-Z]{1,10}$")


# ── response models ───────────────────────────────────────────────────────────

class OHLCVBar(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int


class OHLCVResponse(BaseModel):
    symbol: str
    interval: str
    count: int
    data: list[OHLCVBar]


# ── dependency ────────────────────────────────────────────────────────────────

def _data_service() -> DataIngestionService:
    return DataIngestionService()


DataSvc = Annotated[DataIngestionService, Depends(_data_service)]


# ── routes ────────────────────────────────────────────────────────────────────

@router.get(
    "/{symbol}",
    response_model=OHLCVResponse,
    summary="OHLCV price history for a ticker",
)
def get_ohlcv(
    symbol: str,
    svc: DataSvc,
    start: date = Query(..., description="Start date inclusive (YYYY-MM-DD)"),
    end: date = Query(..., description="End date exclusive (YYYY-MM-DD)"),
    interval: Literal["1d", "1wk", "1mo"] = Query("1d", description="Bar interval"),
) -> OHLCVResponse:
    symbol = symbol.upper()

    if not _SYMBOL_RE.match(symbol):
        raise HTTPException(
            status_code=422,
            detail="Symbol must be 1–10 uppercase letters (e.g. AAPL).",
        )

    if start >= end:
        raise HTTPException(
            status_code=422,
            detail=f"'start' ({start}) must be before 'end' ({end}).",
        )

    if (end - start).days > 365 * 20:
        raise HTTPException(
            status_code=422,
            detail="Date range cannot exceed 20 years.",
        )

    try:
        bars = svc.fetch_ohlcv(symbol, start, end, interval)
    except TickerNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Upstream data error: {exc}") from exc

    return OHLCVResponse(
        symbol=symbol,
        interval=interval,
        count=len(bars),
        data=[OHLCVBar(**bar) for bar in bars],
    )
