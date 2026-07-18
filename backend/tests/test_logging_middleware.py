import pytest
from fastapi.testclient import TestClient
from fastapi import FastAPI, Request
from app.middleware.logging_middleware import LoggingMiddleware

def test_logging_middleware():
    test_app = FastAPI()
    test_app.add_middleware(LoggingMiddleware)

    @test_app.get("/api/test-log")
    def mock_log_test(request: Request):
        return {"request_id": request.state.request_id}

    client = TestClient(test_app)
    resp = client.get("/api/test-log")
    assert resp.status_code == 200
    data = resp.json()
    assert "request_id" in data
    assert len(data["request_id"]) > 0
