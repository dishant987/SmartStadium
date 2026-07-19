from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from app.config import settings
from app.db.session import engine
from app.models import Base
from app.controllers.health_controller import router as health_router
from app.controllers.auth_controller import router as auth_router
from app.controllers.chat_controller import router as chat_router
from app.controllers.ops_controller import router as ops_router
from app.controllers.nav_controller import router as nav_router
from app.controllers.transport_controller import router as transport_router
from app.controllers.sustainability_controller import router as sustainability_router
from app.controllers.evacuation_controller import router as evacuation_router
from app.controllers.wait_time_controller import router as wait_time_router
from app.controllers.pa_controller import router as pa_router
from app.controllers.analytics_controller import router as analytics_router
from app.controllers.realtime_controller import router as realtime_router
from app.controllers.volunteer_controller import router as volunteer_router
from app.controllers.accessibility_controller import router as accessibility_router
from app.middleware.error_handler import register_error_handlers
from app.middleware.logging_middleware import LoggingMiddleware
from app.middleware.rate_limit import RateLimitMiddleware


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        return response


app = FastAPI(
    title="StadiumSense — FIFA World Cup 2026",
    description="AI-powered stadium operations platform for FIFA World Cup 2026 at MetLife Stadium. "
    "Provides navigation, crowd management, accessibility, transit, sustainability, "
    "PA broadcasting, real-time analytics, volunteer coordination, and AI chat.",
    version="1.0.0",
    contact={"name": "StadiumSense Team", "url": "https://github.com/anomalyco/fifa"},
)

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["localhost", "127.0.0.1", "testserver", "test", "*.onrender.com", "*.fly.dev"])
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitMiddleware, max_requests=30, window_seconds=60)

register_error_handlers(app)


@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)


app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(health_router, prefix="/api/health", tags=["health"])
app.include_router(chat_router, prefix="/api/chat", tags=["chat"])
app.include_router(ops_router, prefix="/api/ops", tags=["ops"])
app.include_router(nav_router, prefix="/api/nav", tags=["nav"])
app.include_router(transport_router, prefix="/api/transport", tags=["transport"])
app.include_router(
    sustainability_router, prefix="/api/sustainability", tags=["sustainability"]
)
app.include_router(evacuation_router, tags=["evacuation"])
app.include_router(wait_time_router, prefix="/api/ops", tags=["wait-times"])
app.include_router(pa_router, prefix="/api/pa", tags=["pa"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["analytics"])
app.include_router(realtime_router, tags=["realtime"])
app.include_router(volunteer_router, prefix="/api/volunteer", tags=["volunteer"])
app.include_router(accessibility_router, prefix="/api/accessibility", tags=["accessibility"])
