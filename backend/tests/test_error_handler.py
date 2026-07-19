from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from app.middleware.error_handler import register_error_handlers, _error_response
from app.utils.exceptions import AppException
from pydantic import BaseModel, Field

def test_error_response_shape():
    resp = _error_response(400, "bad_request", "Something went wrong", "req-123")
    assert resp.status_code == 400
    body = resp.body.decode()
    assert '"success":false' in body
    assert '"code":"bad_request"' in body
    assert '"message":"Something went wrong"' in body
    assert '"request_id":"req-123"' in body

def test_error_handlers_integration():
    app = FastAPI()
    register_error_handlers(app)
    
    class Model(BaseModel):
        num: int = Field(...)

    @app.get("/http-error")
    def trigger_http():
        raise HTTPException(status_code=403, detail="Forbidden area")

    @app.get("/value-error")
    def trigger_value():
        raise ValueError("Invalid value entered")

    @app.post("/validation-error")
    def trigger_validation(data: Model):
        return data

    @app.get("/app-error")
    def trigger_app():
        raise AppException("App error message", code="custom_code", status_code=400)

    @app.get("/app-error-with-cause")
    def trigger_app_with_cause():
        raise AppException("App error with cause", code="cause_code", status_code=400, original=ValueError("Internal cause"))

    @app.get("/generic-error")
    def trigger_generic():
        raise Exception("Critical DB crash")

    client = TestClient(app)

    # 1. Test HTTP Exception
    r = client.get("/http-error")
    assert r.status_code == 403
    assert r.json()["success"] is False
    assert r.json()["error"]["code"] == "http_error"
    assert r.json()["error"]["message"] == "Forbidden area"

    # 2. Test ValueError Exception
    r = client.get("/value-error")
    assert r.status_code == 400
    assert r.json()["success"] is False
    assert r.json()["error"]["code"] == "bad_request"
    assert r.json()["error"]["message"] == "Invalid value entered"

    # 3. Test RequestValidationError
    r = client.post("/validation-error", json={"num": "not-an-int"})
    assert r.status_code == 422
    assert r.json()["success"] is False
    assert r.json()["error"]["code"] == "validation_error"

    # 4. Test AppException
    r = client.get("/app-error")
    assert r.status_code == 400
    assert r.json()["success"] is False
    assert r.json()["error"]["code"] == "custom_code"
    assert r.json()["error"]["message"] == "App error message"

    # 5. Test AppException with cause
    r = client.get("/app-error-with-cause")
    assert r.status_code == 400
    assert r.json()["success"] is False
    assert r.json()["error"]["code"] == "cause_code"

    # 6. Test Generic Exception
    r = client.get("/generic-error")
    assert r.status_code == 500
    assert r.json()["success"] is False
    assert r.json()["error"]["code"] == "internal_error"
