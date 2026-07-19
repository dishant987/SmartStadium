import uuid
from datetime import datetime, timedelta, timezone

import jwt
import bcrypt
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.models.user import User
from app.schemas.auth_schema import (
    RegisterRequest,
    LoginRequest,
    AuthResponse,
    UserResponse,
)

if not settings.jwt_secret:
    raise RuntimeError("JWT_SECRET must be configured in .env")
SECRET_KEY = settings.jwt_secret
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 72


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def create_token(user_id: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRE_HOURS)
    return jwt.encode({"sub": user_id, "exp": exp}, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except jwt.PyJWTError:
        return None


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def register(self, req: RegisterRequest) -> AuthResponse:
        existing = self.db.execute(
            select(User).where(User.email == req.email)
        ).scalar_one_or_none()
        if existing:
            raise ValueError("Email already registered")
        user = User(
            id=str(uuid.uuid4()),
            email=req.email,
            name=req.name,
            password_hash=hash_password(req.password),
            created_at=datetime.now(timezone.utc),
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        token = create_token(user.id)
        return AuthResponse(
            access_token=token,
            user=UserResponse(id=user.id, email=user.email, name=user.name),
        )

    def login(self, req: LoginRequest) -> AuthResponse:
        user = self.db.execute(
            select(User).where(User.email == req.email)
        ).scalar_one_or_none()
        if not user or not verify_password(req.password, user.password_hash):
            raise ValueError("Invalid email or password")
        token = create_token(user.id)
        return AuthResponse(
            access_token=token,
            user=UserResponse(id=user.id, email=user.email, name=user.name),
        )

    def get_user(self, user_id: str) -> UserResponse | None:
        user = self.db.execute(
            select(User).where(User.id == user_id)
        ).scalar_one_or_none()
        if not user:
            return None
        return UserResponse(id=user.id, email=user.email, name=user.name)
