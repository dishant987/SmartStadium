from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.volunteer_schema import (
    VolunteerCreate, VolunteerResponse, VolunteerUpdate,
    VolunteerTaskCreate, VolunteerTaskResponse, VolunteerTaskUpdate,
    VolunteerDashboardResponse,
)
from app.services.volunteer_service import VolunteerService
from app.services.auth_service import UserResponse
from app.middleware.auth import get_current_user

router = APIRouter()


def _svc(db: Session = Depends(get_db)) -> VolunteerService:
    return VolunteerService(db)


@router.get("/volunteers", response_model=list[VolunteerResponse])
def list_volunteers(role: str | None = None, svc: VolunteerService = Depends(_svc), user: UserResponse = Depends(get_current_user)):
    return svc.list_volunteers(role)


@router.get("/volunteers/{volunteer_id}", response_model=VolunteerResponse)
def get_volunteer(volunteer_id: str, svc: VolunteerService = Depends(_svc), user: UserResponse = Depends(get_current_user)):
    v = svc.get_volunteer(volunteer_id)
    if not v:
        raise HTTPException(404, "Volunteer not found")
    return v


@router.post("/volunteers", response_model=VolunteerResponse)
def create_volunteer(body: VolunteerCreate, svc: VolunteerService = Depends(_svc), user: UserResponse = Depends(get_current_user)):
    return svc.create_volunteer(user.id, body)


@router.patch("/volunteers/{volunteer_id}", response_model=VolunteerResponse)
def update_volunteer(volunteer_id: str, body: VolunteerUpdate, svc: VolunteerService = Depends(_svc), user: UserResponse = Depends(get_current_user)):
    v = svc.update_volunteer(volunteer_id, body)
    if not v:
        raise HTTPException(404, "Volunteer not found")
    return v


@router.get("/tasks", response_model=list[VolunteerTaskResponse])
def list_tasks(status: str | None = None, svc: VolunteerService = Depends(_svc), user: UserResponse = Depends(get_current_user)):
    return svc.list_tasks(status)


@router.post("/tasks", response_model=VolunteerTaskResponse)
def create_task(body: VolunteerTaskCreate, svc: VolunteerService = Depends(_svc), user: UserResponse = Depends(get_current_user)):
    return svc.create_task(body)


@router.patch("/tasks/{task_id}", response_model=VolunteerTaskResponse)
def update_task(task_id: str, body: VolunteerTaskUpdate, svc: VolunteerService = Depends(_svc), user: UserResponse = Depends(get_current_user)):
    t = svc.update_task(task_id, body)
    if not t:
        raise HTTPException(404, "Task not found")
    return t


@router.get("/dashboard", response_model=VolunteerDashboardResponse)
def dashboard(svc: VolunteerService = Depends(_svc), user: UserResponse = Depends(get_current_user)):
    return svc.dashboard()
