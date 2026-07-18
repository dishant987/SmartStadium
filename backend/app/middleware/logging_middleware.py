import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.utils.logger import logger


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        start = time.time()
        response = await call_next(request)
        elapsed = time.time() - start
        logger.info(
            "{method} {path} {status} {elapsed:.3f}s",
            method=request.method,
            path=request.url.path,
            status=response.status_code,
            elapsed=elapsed,
            request_id=request_id,
        )
        return response
