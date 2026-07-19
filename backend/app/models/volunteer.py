import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
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

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, index=True)
    name: Mapped[str] = mapped_column(String(200))
    role: Mapped[str] = mapped_column(String(50), default=VolunteerRole.concierge.value)
    status: Mapped[str] = mapped_column(String(20), default=VolunteerStatus.available.value)
    zone: Mapped[str | None] = mapped_column(String(10), nullable=True)
    languages: Mapped[str] = mapped_column(String(500), default="en")
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))


class VolunteerTask(Base):
    __tablename__ = "volunteer_tasks"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    volunteer_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    task_type: Mapped[str] = mapped_column(String(50))
    description: Mapped[str] = mapped_column(Text)
    zone: Mapped[str | None] = mapped_column(String(10), nullable=True)
    priority: Mapped[str] = mapped_column(String(10), default="medium")
    status: Mapped[str] = mapped_column(String(20), default=VolunteerTaskStatus.assigned.value)
    assigned_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
