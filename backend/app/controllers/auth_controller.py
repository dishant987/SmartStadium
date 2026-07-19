import os

from fastapi import APIRouter, Depends, Response, Request, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.auth_schema import RegisterRequest, LoginRequest
from app.services.auth_service import AuthService
from app.config import settings

router = APIRouter()

COOKIE_ACCESS = "spectrastadium_token"
COOKIE_REFRESH = "spectrastadium_refresh"

_is_prod = os.environ.get("RENDER") == "true" or "vercel.app" in settings.cors_origins
_samesite = "none" if _is_prod else "lax"
_secure = True if _is_prod else False


def _set_auth_cookies(response: Response, access: str, refresh: str):
    response.set_cookie(
        key=COOKIE_ACCESS,
        value=access,
        httponly=True,
        secure=_secure,
        samesite=_samesite,
        max_age=3600,
        path="/",
    )
    response.set_cookie(
        key=COOKIE_REFRESH,
        value=refresh,
        httponly=True,
        secure=_secure,
        samesite=_samesite,
        max_age=86400 * 7,
        path="/api/auth",
    )


def _clear_auth_cookies(response: Response):
    response.delete_cookie(
        COOKIE_ACCESS,
        path="/",
        secure=_secure,
        httponly=True,
        samesite=_samesite,
    )
    response.delete_cookie(
        COOKIE_REFRESH,
        path="/api/auth",
        secure=_secure,
        httponly=True,
        samesite=_samesite,
    )


@router.post("/register")
def register(body: RegisterRequest, response: Response, db: Session = Depends(get_db)):
    result = AuthService(db).register(body)
    _set_auth_cookies(response, result.access_token, result.refresh_token)
    return result


@router.post("/login")
def login(body: LoginRequest, response: Response, db: Session = Depends(get_db)):
    result = AuthService(db).login(body)
    _set_auth_cookies(response, result.access_token, result.refresh_token)
    return result


@router.post("/refresh")
def refresh(request: Request, response: Response, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get(COOKIE_REFRESH)
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token")
    result = AuthService(db).refresh_token(refresh_token)
    _set_auth_cookies(response, result.access_token, result.refresh_token)
    return result


@router.post("/logout")
def logout(response: Response):
    _clear_auth_cookies(response)
    return {"success": True}
