"""Simple in-memory per-IP rate limiter.

Tracks request counts per IP in a sliding 60-second window. When the limit
is exceeded, returns a 429 response. Uses a dict — reset on server restart.
Upgrade to Redis-based limiting for multi-instance deployments."""

import time
from collections import defaultdict
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_requests: int = 30, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: dict[str, list[float]] = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        if request.url.path.startswith("/api/chat") or request.url.path.startswith(
            "/api/auth/login"
        ):
            ip = request.client.host if request.client else "unknown"
            now = time.time()
            window_start = now - self.window_seconds
            self.requests[ip] = [t for t in self.requests[ip] if t > window_start]
            if len(self.requests[ip]) >= self.max_requests:
                return JSONResponse(
                    status_code=429,
                    content={
                        "success": False,
                        "error": {
                            "code": "rate_limited",
                            "message": "Too many requests — please wait before sending another.",
                            "request_id": "-",
                        },
                    },
                )
            self.requests[ip].append(now)
        return await call_next(request)
