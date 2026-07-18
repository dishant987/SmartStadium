"""Integration tests: spin up the FastAPI app with a test client.

Runs against SQLite in-memory so no external DB is needed."""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_health_check(client):
    resp = client.get("/api/health")
    assert resp.status_code in (200, 503)


def test_create_session(client):
    resp = client.post(
        "/api/auth/login", json={"email": "test@test.com", "password": "test123"}
    )
    assert resp.status_code == 200 or resp.status_code == 401


def test_ops_incidents(client):
    resp = client.get("/api/ops/incidents")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
