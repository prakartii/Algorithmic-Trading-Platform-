import re
from datetime import date
from typing import Literal

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.services.data_ingestion import DataIngestionService, TickerNotFoundError

router = APIRouter(prefix="/stocks", tags=["market-data"])

_service = DataIngestionService()
_SYMBOL_RE = re.compile(r"^[A-Z]{1,10}$")


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


@router.get("/{symbol}", response_model=OHLCVResponse)
def get_ohlcv(
    symbol: str,
    start: date = Query(..., description="Start date inclusive (YYYY-MM-DD)"),
    end: date = Query(..., description="End date exclusive (YYYY-MM-DD)"),
    interval: Literal["1d", "1wk", "1mo"] = Query("1d", description="Bar interval"),
):
    symbol = symbol.upper()

    if not _SYMBOL_RE.match(symbol):
        raise HTTPException(
            status_code=422,
            detail="Symbol must be 1–10 uppercase letters (e.g. AAPL, BRK.B not supported).",
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
        bars = _service.fetch_ohlcv(symbol, start, end, interval)
    except TickerNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Upstream data error: {exc}") from exc

    return OHLCVResponse(
        symbol=symbol,
        interval=interval,
        count=len(bars),
        data=bars,
    )
