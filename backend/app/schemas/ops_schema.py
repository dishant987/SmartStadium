from pydantic import BaseModel, Field
from datetime import datetime
from typing import Literal


class IncidentReportRequest(BaseModel):
    severity: Literal["low", "medium", "high", "critical"]
    category: str = Field(min_length=1, max_length=100)
    description: str = Field(min_length=1, max_length=2000)
    location: str = Field(min_length=1, max_length=200)


class IncidentReportResponse(BaseModel):
    id: str
    status: str
    created_at: datetime | None = None


class CrowdZoneResponse(BaseModel):
    id: str
    name: str
    density: float
    capacity: int


class TransportLineResponse(BaseModel):
    id: str
    name: str
    status: str
    delay: int


class RecommendationResponse(BaseModel):
    id: str
    title: str
    description: str
    priority: str
