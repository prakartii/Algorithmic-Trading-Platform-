from functools import lru_cache

from supabase import Client

from app.core.supabase import supabase


def get_db() -> Client:
    return supabase


@lru_cache(maxsize=1)
def get_alpaca_service():
    from app.services.alpaca_service import AlpacaService
    return AlpacaService()
