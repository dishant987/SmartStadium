import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Text, DateTime, Enum as SAEnum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base
import enum


class IncidentSeverity(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"


class IncidentStatus(str, enum.Enum):
    open = "open"
    resolved = "resolved"


class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    venue_id: Mapped[str] = mapped_column(String, ForeignKey("venues.id"))
    type: Mapped[str] = mapped_column(String)
    severity: Mapped[IncidentSeverity] = mapped_column(SAEnum(IncidentSeverity))
    description: Mapped[str] = mapped_column(Text)
    status: Mapped[IncidentStatus] = mapped_column(
        SAEnum(IncidentStatus), default=IncidentStatus.open
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc))
