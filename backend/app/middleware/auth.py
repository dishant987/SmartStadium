from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.auth_service import decode_token, AuthService
from app.utils.logger import logger

_security = HTTPBearer(auto_error=False)


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_security),
    request: Request = None,
    db: Session = Depends(get_db),
):
    token = None
    if creds is not None:
        token = creds.credentials
    if not token or token in ("undefined", "null", ""):
        token = request.cookies.get("spectrastadium_token") if request else None
    if not token or token in ("undefined", "null", ""):
        raise HTTPException(status_code=401, detail="Please sign in again")
    user_id = decode_token(token)
    if not user_id:
        logger.warning("JWT decode failed")
        raise HTTPException(status_code=401, detail="Session expired - please sign in again")
    user = AuthService(db).get_user(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
