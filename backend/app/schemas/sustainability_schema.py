from pydantic import BaseModel
from datetime import datetime


class SustainabilityTipResponse(BaseModel):
    tip: str
    source: str = "ai"


class RecyclingStation(BaseModel):
    id: str
    location: str
    types: list[str]


class StationResponse(BaseModel):
    stations: list[RecyclingStation]


class CarbonImpactRequest(BaseModel):
    transport_mode: str = "driving"
    distance_km: float = 10.0
    group_size: int = 1


class CarbonImpactResponse(BaseModel):
    transport_mode: str
    distance_km: float
    co2_kg: float
    equivalent: str
    greener_option: str | None = None
    tip: str


class PersonalizedTipResponse(BaseModel):
    tip: str
    context: str
    impact: str
    category: str
    generated_at: datetime
