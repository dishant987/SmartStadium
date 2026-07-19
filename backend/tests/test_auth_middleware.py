"""Tests for the auth middleware (401/403 paths)."""


def _error_message(resp):
    body = resp.json()
    return body.get("error", {}).get("message", "").lower()


def test_no_token_returns_401(client):
    resp = client.get("/api/pa/log")
    assert resp.status_code == 401
    assert "sign in" in _error_message(resp)


def test_invalid_token_returns_401(client):
    headers = {"Authorization": "Bearer invalid-jwt-token"}
    resp = client.get("/api/pa/log", headers=headers)
    assert resp.status_code == 401


def test_expired_token_returns_401(client):
    headers = {"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"}
    resp = client.get("/api/pa/log", headers=headers)
    assert resp.status_code == 401


def test_null_token_returns_401(client):
    headers = {"Authorization": "Bearer null"}
    resp = client.get("/api/pa/log", headers=headers)
    assert resp.status_code == 401


def test_undefined_token_returns_401(client):
    headers = {"Authorization": "Bearer undefined"}
    resp = client.get("/api/pa/log", headers=headers)
    assert resp.status_code == 401


def test_empty_token_returns_401(client):
    headers = {"Authorization": "Bearer "}
    resp = client.get("/api/pa/log", headers=headers)
    assert resp.status_code == 401
