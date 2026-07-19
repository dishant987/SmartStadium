import time
import uuid
from app.utils.logger import logger

class LoggingMiddleware:
    def __init__(self, app) -> None:
        self.app = app

    async def __call__(self, scope, receive, send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        request_id = str(uuid.uuid4())
        if "state" not in scope:
            scope["state"] = {}
        scope["state"]["request_id"] = request_id

        start = time.time()
        path = scope.get("path", "")
        method = scope.get("method", "")

        async def send_wrapper(message) -> None:
            if message["type"] == "http.response.start":
                status = message["status"]
                elapsed = time.time() - start
                logger.info(
                    "{method} {path} {status} {elapsed:.3f}s",
                    method=method,
                    path=path,
                    status=status,
                    elapsed=elapsed,
                    request_id=request_id,
                )
            await send(message)

        await self.app(scope, receive, send_wrapper)

