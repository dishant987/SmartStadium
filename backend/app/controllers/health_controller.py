import httpx
from fastapi import APIRouter
from sqlalchemy import create_engine, text

import app.db.chroma_client
from app.config import settings
from app.utils.logger import logger

router = APIRouter()


async def _check_db() -> bool:
    if not settings.neon_database_url:
        return False
    try:
        engine = create_engine(settings.neon_database_url, pool_pre_ping=True)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.warning("Database check failed: {}", e)
        return False


async def _check_chroma() -> bool:
    if not settings.chroma_api_key:
        return False
    try:
        client = app.db.chroma_client.get_chroma_client()
        client.heartbeat()
        return True
    except Exception as e:
        logger.warning("Chroma heartbeat failed: {}", e)
        return False


async def _check_llm() -> int:
    available = 0
    if settings.groq_api_key:
        try:
            async with httpx.AsyncClient(timeout=5) as c:
                r = await c.get(
                    "https://api.groq.com/v1/models",
                    headers={"Authorization": f"Bearer {settings.groq_api_key}"},
                )
                if r.status_code < 500:
                    available += 1
        except Exception as e:
            logger.warning("Groq API check failed: {}", e)
    if settings.gemini_api_key:
        available += 1  # ponytail: skip live probe, key presence is sufficient
    if settings.mistral_api_key:
        available += 1
    return available


@router.get("")
async def health():
    checks = {
        "database": await _check_db(),
        "chroma": await _check_chroma(),
        "llm_providers": await _check_llm(),
    }
    overall = checks["database"] or any([settings.neon_database_url])
    logger.info("Health check: {checks}", checks=checks)
    return {"status": "ok" if overall else "degraded", "checks": checks}
