from fastapi import Depends, HTTPException, Header
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.auth_service import decode_token, AuthService
from app.utils.logger import logger


def get_current_user(authorization: str = Header(...), db: Session = Depends(get_db)):
    if (
        not authorization.startswith("Bearer ")
        or authorization == "Bearer undefined"
        or authorization == "Bearer null"
    ):
        raise HTTPException(status_code=401, detail="Please sign in again")
    token = authorization[7:]
    user_id = decode_token(token)
    if not user_id:
        logger.warning(
            "JWT decode failed for token prefix: {prefix}",
            prefix=token[:20] if len(token) > 20 else token,
        )
        raise HTTPException(
            status_code=401, detail="Session expired — please sign in again"
        )
    user = AuthService(db).get_user(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
