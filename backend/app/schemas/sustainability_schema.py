from pydantic import BaseModel


class SustainabilityTipResponse(BaseModel):
    tip: str


class RecyclingStation(BaseModel):
    id: str
    location: str
    types: list[str]


class StationResponse(BaseModel):
    stations: list[RecyclingStation]
