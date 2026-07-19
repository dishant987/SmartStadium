"""Global error handlers that map exceptions to consistent JSON responses.

Every response uses the shape: {"success": false, "error": {"code": ..., "message": ..., "request_id": ...}}.
This keeps the API contract uniform for the frontend error-handling middleware."""

import traceback

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.utils.exceptions import AppException
from app.utils.logger import logger


def _request_id(request: Request) -> str:
    return getattr(request.state, "request_id", "-")


def _error_response(
    status: int, code: str, message: str, request_id: str
) -> JSONResponse:
    return JSONResponse(
        status_code=status,
        content={
            "success": False,
            "error": {"code": code, "message": message, "request_id": request_id},
        },
    )


def register_error_handlers(app: FastAPI):
    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        rid = _request_id(request)
        logger.warning(
            "HTTP {status} {detail}",
            status=exc.status_code,
            detail=exc.detail,
            request_id=rid,
        )
        return _error_response(exc.status_code, "http_error", exc.detail, rid)

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ):
        rid = _request_id(request)
        logger.warning(
            "Validation error: {errors}", errors=exc.errors(), request_id=rid
        )
        return _error_response(
            422,
            "validation_error",
            str(exc.errors()[0]["msg"]) if exc.errors() else "Invalid input",
            rid,
        )

    @app.exception_handler(ValueError)
    async def value_error_handler(request: Request, exc: ValueError):
        rid = _request_id(request)
        logger.warning("ValueError: {msg}", msg=str(exc), request_id=rid)
        return _error_response(400, "bad_request", "Invalid request.", rid)

    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        rid = _request_id(request)
        logger.error("{code}: {msg}", code=exc.code, msg=exc.message, request_id=rid)
        if exc.original:
            logger.error("Caused by: {exc}", exc=exc.original, request_id=rid)
        return _error_response(exc.status_code, exc.code, exc.message, rid)

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        rid = _request_id(request)
        logger.error("Unhandled exception: {exc}", exc=exc, request_id=rid)
        for line in traceback.format_exception(type(exc), exc, exc.__traceback__):
            logger.debug(line.rstrip(), request_id=rid)
        return _error_response(
            500, "internal_error", "Something went wrong — please try again.", rid
        )
