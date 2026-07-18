from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.auth_schema import RegisterRequest, LoginRequest
from app.services.auth_service import AuthService

router = APIRouter()


@router.post("/register")
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    return AuthService(db).register(body)


@router.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    return AuthService(db).login(body)
