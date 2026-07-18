from pydantic import BaseModel


class WaitTimeLocation(BaseModel):
    id: str
    name: str
    type: str
    zone: str
    current_wait_min: int
    predicted_wait_halftime_min: int
    predicted_wait_post_match_min: int
    crowd_density: float
    status: str
    recommendation: str


class WaitTimeResponse(BaseModel):
    locations: list[WaitTimeLocation]
    match_minute: int
    match_status: str
    summary: str


class WaitTimeRequest(BaseModel):
    zone: str = "all"
    match_minute: int = 0
    match_status: str = "pre_match"
