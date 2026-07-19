"""Tests for CSRF middleware."""
import pytest
from starlette.applications import Starlette
from starlette.routing import Route
from starlette.testclient import TestClient
from starlette.responses import JSONResponse
from app.middleware.csrf import CSRFProtectMiddleware


async def dummy_handler(request):
    return JSONResponse({"ok": True})


async def post_handler(request):
    return JSONResponse({"posted": True})


app = Starlette(
    routes=[
        Route("/test", dummy_handler, methods=["GET"]),
        Route("/test", post_handler, methods=["POST"]),
        Route("/api/auth/login", post_handler, methods=["POST"]),
        Route("/api/health", dummy_handler, methods=["GET"]),
    ],
)
app.add_middleware(CSRFProtectMiddleware)
client = TestClient(app, raise_server_exceptions=False)


def test_get_sets_csrf_cookie():
    resp = client.get("/test")
    assert resp.status_code == 200
    assert "csrf_token" in resp.cookies


def test_post_without_cookie_or_header_returns_403():
    resp = client.post("/test")
    assert resp.status_code == 403
    assert resp.json()["error"]["code"] == "csrf_forbidden"


def test_post_with_mismatched_tokens_returns_403():
    client.cookies.set("csrf_token", "token_a")
    resp = client.post("/test", headers={"X-CSRF-Token": "token_b"})
    assert resp.status_code == 403


def test_post_with_matching_tokens_succeeds():
    token = "valid_csrf_token_12345"
    client.cookies.set("csrf_token", token)
    resp = client.post("/test", headers={"X-CSRF-Token": token})
    assert resp.status_code == 200
    assert resp.json()["posted"] is True


def test_skipped_path_auth_bypasses_csrf():
    resp = client.post("/api/auth/login")
    assert resp.status_code == 200


def test_skipped_path_health_bypasses_csrf():
    resp = client.get("/api/health")
    assert resp.status_code == 200
