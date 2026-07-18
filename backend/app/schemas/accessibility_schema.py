from pydantic import BaseModel
from datetime import datetime


class AccessibilityStatus(BaseModel):
    elevator_id: str
    elevator_name: str
    status: str
    note: str


class AccessibilityRouteRequest(BaseModel):
    from_zone: str
    to_zone: str
    wheelchair: bool = True
    avoid_crowds: bool = False


class AccessibilityRouteStep(BaseModel):
    step_number: int
    instruction: str
    distance_m: int
    accessibility_note: str = ""
    warning: str = ""


class AccessibilityRouteResponse(BaseModel):
    from_name: str
    to_name: str
    steps: list[AccessibilityRouteStep]
    total_distance_m: int
    estimated_time_min: int
    ai_summary: str
    warnings: list[str]
    generated_at: datetime
