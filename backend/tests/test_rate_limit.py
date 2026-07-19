from fastapi.testclient import TestClient
from fastapi import FastAPI
from app.middleware.rate_limit import RateLimitMiddleware

def test_rate_limiter_enforcement():
    test_app = FastAPI()
    test_app.add_middleware(RateLimitMiddleware, max_requests=3, window_seconds=10)

    @test_app.post("/api/auth/login")
    def mock_login():
        return {"ok": True}

    @test_app.get("/api/unlimited")
    def mock_unlimited():
        return {"ok": True}

    client = TestClient(test_app)

    # 1. Accessing unlimited path does not trigger rate limit
    for _ in range(5):
        resp = client.get("/api/unlimited")
        assert resp.status_code == 200

    # 2. Accessing rate-limited path
    # First 3 requests succeed
    for _ in range(3):
        resp = client.post("/api/auth/login")
        assert resp.status_code == 200

    # 4th request gets rate limited (429)
    resp = client.post("/api/auth/login")
    assert resp.status_code == 429
    assert resp.json()["error"]["code"] == "rate_limited"
