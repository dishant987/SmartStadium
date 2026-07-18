from pydantic import BaseModel
from datetime import datetime


class IncidentReportRequest(BaseModel):
    severity: str
    category: str
    description: str
    location: str


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
