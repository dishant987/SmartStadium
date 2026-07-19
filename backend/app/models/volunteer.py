import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text
from app.models.base import Base
import enum


class VolunteerRole(str, enum.Enum):
    gate_ops = "gate_ops"
    concierge = "concierge"
    transit_support = "transit_support"
    accessibility = "accessibility"
    emergency_response = "emergency_response"


class VolunteerStatus(str, enum.Enum):
    available = "available"
    on_shift = "on_shift"
    on_break = "on_break"
    off_duty = "off_duty"


class VolunteerTaskStatus(str, enum.Enum):
    assigned = "assigned"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class Volunteer(Base):
    __tablename__ = "volunteers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    role = Column(String(50), nullable=False, default=VolunteerRole.concierge.value)
    status = Column(String(20), nullable=False, default=VolunteerStatus.available.value)
    zone = Column(String(10), nullable=True)
    languages = Column(String(500), default="en")
    phone = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class VolunteerTask(Base):
    __tablename__ = "volunteer_tasks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    volunteer_id = Column(String, nullable=True, index=True)
    task_type = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    zone = Column(String(10), nullable=True)
    priority = Column(String(10), default="medium")
    status = Column(String(20), default=VolunteerTaskStatus.assigned.value)
    assigned_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
