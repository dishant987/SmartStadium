import secrets
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

SKIP_PATHS = ("/api/auth/", "/api/health", "/ws/")


class CSRFProtectMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, cookie_name: str = "csrf_token", header_name: str = "X-CSRF-Token"):
        super().__init__(app)
        self.cookie_name = cookie_name
        self.header_name = header_name

    async def dispatch(self, request: Request, call_next):
        if any(request.url.path.startswith(p) for p in SKIP_PATHS):
            return await call_next(request)

        if request.method in ("GET", "HEAD", "OPTIONS", "TRACE"):
            response = await call_next(request)
            token = secrets.token_hex(32)
            response.set_cookie(
                key=self.cookie_name,
                value=token,
                httponly=True,
                samesite="lax",
                secure=False,
                max_age=3600,
                path="/",
            )
            return response

        if request.method in ("POST", "PUT", "PATCH", "DELETE"):
            cookie_token = request.cookies.get(self.cookie_name)
            header_token = request.headers.get(self.header_name)
            if not cookie_token or not header_token or not secrets.compare_digest(cookie_token, header_token):
                return JSONResponse(
                    status_code=403,
                    content={
                        "success": False,
                        "error": {
                            "code": "csrf_forbidden",
                            "message": "CSRF validation failed",
                            "request_id": "-",
                        },
                    },
                )

        return await call_next(request)
