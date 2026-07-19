from pydantic import BaseModel
from datetime import datetime


class VolunteerCreate(BaseModel):
    name: str
    role: str = "concierge"
    zone: str | None = None
    languages: str = "en"
    phone: str | None = None


class VolunteerResponse(BaseModel):
    id: str
    user_id: str
    name: str
    role: str
    status: str
    zone: str | None = None
    languages: str
    phone: str | None = None
    created_at: datetime


class VolunteerUpdate(BaseModel):
    status: str | None = None
    zone: str | None = None


class VolunteerTaskCreate(BaseModel):
    volunteer_id: str | None = None
    task_type: str
    description: str
    zone: str | None = None
    priority: str = "medium"


class VolunteerTaskResponse(BaseModel):
    id: str
    volunteer_id: str | None = None
    task_type: str
    description: str
    zone: str | None = None
    priority: str
    status: str
    assigned_at: datetime | None = None
    completed_at: datetime | None = None
    created_at: datetime


class VolunteerTaskUpdate(BaseModel):
    status: str
    volunteer_id: str | None = None


class VolunteerDashboardResponse(BaseModel):
    total: int
    on_shift: int
    available: int
    active_tasks: int
    volunteers: list[VolunteerResponse]
    tasks: list[VolunteerTaskResponse]
