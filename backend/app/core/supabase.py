import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

supabase = None

if settings.supabase_configured:
    try:
        from supabase import create_client

        supabase = create_client(settings.supabase_url, settings.supabase_service_key)
    except Exception as exc:  # bad URL / key must not stop the API from booting
        logger.warning("Supabase client unavailable: %s", exc)
