from pydantic import BaseModel
from datetime import datetime


class TransitLine(BaseModel):
    id: str
    name: str
    mode: str
    status: str
    next_departure: str | None = None
    delay_minutes: int = 0


class TransportStatusResponse(BaseModel):
    lines: list[TransitLine]
    last_updated: datetime
