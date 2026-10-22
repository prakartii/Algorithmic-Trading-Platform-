"""
Backtest history persistence.

Writes go to Supabase when it is configured; otherwise (or if Supabase errors)
they land in a bounded in-memory list so the UI's history keeps working in
local development.
"""
from __future__ import annotations

import logging
import uuid
from collections import deque
from datetime import datetime, timezone

from app.core.supabase import supabase

logger = logging.getLogger(__name__)

_MEMORY: deque[dict] = deque(maxlen=200)

_LIST_COLUMNS = (
    "id, symbol, start_date, end_date, initial_capital, final_capital, "
    "total_return_pct, sharpe_ratio, max_drawdown_pct, trade_count, status, created_at"
)


def save_backtest(record: dict) -> None:
    if supabase is not None:
        try:
            supabase.table("backtests").insert(record).execute()
            return
        except Exception as exc:
            logger.warning("Supabase insert failed, keeping backtest in memory: %s", exc)

    _MEMORY.appendleft({
        **{k: v for k, v in record.items() if k != "equity_curve"},
        "id": str(uuid.uuid4()),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })


def list_backtests(limit: int, symbol: str | None) -> list[dict]:
    if supabase is not None:
        try:
            query = (
                supabase.table("backtests")
                .select(_LIST_COLUMNS)
                .eq("status", "completed")
                .order("created_at", desc=True)
                .limit(limit)
            )
            if symbol:
                query = query.eq("symbol", symbol.upper())
            return query.execute().data or []
        except Exception as exc:
            logger.warning("Supabase query failed, serving in-memory history: %s", exc)

    rows = [r for r in _MEMORY if not symbol or r["symbol"] == symbol.upper()]
    return rows[:limit]
