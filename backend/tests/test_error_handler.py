"""Test that error handlers return consistent JSON responses."""

from app.middleware.error_handler import _error_response


def test_error_response_shape():
    resp = _error_response(400, "bad_request", "Something went wrong", "req-123")
    assert resp.status_code == 400
    body = resp.body.decode()
    assert '"success":false' in body
    assert '"code":"bad_request"' in body
    assert '"message":"Something went wrong"' in body
    assert '"request_id":"req-123"' in body
