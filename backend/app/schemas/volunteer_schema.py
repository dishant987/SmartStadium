from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class VolunteerCreate(BaseModel):
    name: str
    role: str = "concierge"
    zone: Optional[str] = None
    languages: str = "en"
    phone: Optional[str] = None


class VolunteerResponse(BaseModel):
    id: str
    user_id: str
    name: str
    role: str
    status: str
    zone: Optional[str] = None
    languages: str
    phone: Optional[str] = None
    created_at: datetime


class VolunteerUpdate(BaseModel):
    status: Optional[str] = None
    zone: Optional[str] = None


class VolunteerTaskCreate(BaseModel):
    volunteer_id: Optional[str] = None
    task_type: str
    description: str
    zone: Optional[str] = None
    priority: str = "medium"


class VolunteerTaskResponse(BaseModel):
    id: str
    volunteer_id: Optional[str] = None
    task_type: str
    description: str
    zone: Optional[str] = None
    priority: str
    status: str
    assigned_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime


class VolunteerTaskUpdate(BaseModel):
    status: str
    volunteer_id: Optional[str] = None


class VolunteerDashboardResponse(BaseModel):
    total: int
    on_shift: int
    available: int
    active_tasks: int
    volunteers: list[VolunteerResponse]
    tasks: list[VolunteerTaskResponse]
