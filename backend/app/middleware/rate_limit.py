import time
from collections import defaultdict
from fastapi.responses import JSONResponse

class RateLimitMiddleware:
    def __init__(self, app, max_requests: int = 30, window_seconds: int = 60) -> None:
        self.app = app
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: dict[str, list[float]] = defaultdict(list)

    async def __call__(self, scope, receive, send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path = scope.get("path", "")
        if path.startswith("/api/chat") or path.startswith("/api/auth/login"):
            client = scope.get("client")
            ip = client[0] if client else "unknown"
            now = time.time()
            window_start = now - self.window_seconds
            self.requests[ip] = [t for t in self.requests[ip] if t > window_start]
            if len(self.requests[ip]) >= self.max_requests:
                response = JSONResponse(
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
                await response(scope, receive, send)
                return
            self.requests[ip].append(now)

        await self.app(scope, receive, send)

