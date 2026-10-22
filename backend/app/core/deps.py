from functools import lru_cache

from fastapi import HTTPException

from app.core.config import settings
from app.core.supabase import supabase


def get_db():
    return supabase


@lru_cache(maxsize=1)
def _alpaca_service():
    from app.services.alpaca_service import AlpacaService
    return AlpacaService()


def get_alpaca_service():
    if not settings.alpaca_configured:
        raise HTTPException(
            status_code=503,
            detail="Alpaca is not configured. Set ALPACA_API_KEY and ALPACA_SECRET_KEY in backend/.env.",
        )
    return _alpaca_service()
