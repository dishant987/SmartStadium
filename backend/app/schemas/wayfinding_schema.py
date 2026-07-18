from pydantic import BaseModel


class WayfindingStep(BaseModel):
    step_number: int
    instruction: str
    landmark: str = ""
    distance_m: int
    accessibility_note: str = ""
    level_change: str = ""


class WayfindingRoute(BaseModel):
    from_name: str
    to_name: str
    steps: list[WayfindingStep]
    total_distance_m: int
    estimated_time_min: int
    accessible: bool
    accessibility_summary: str
    wheelchair_alternative: str = ""


class WayfindingRequest(BaseModel):
    from_zone: str
    to_zone: str
    accessible: bool = False
    wheelchair: bool = False
    language: str = "en"
