from pydantic import BaseModel


class VenueZone(BaseModel):
    id: str
    name: str
    type: str


class VenueGate(BaseModel):
    id: str
    name: str
    zone_id: str


class VenueAmenity(BaseModel):
    id: str
    name: str
    type: str
    zone_id: str


class VenueMapResponse(BaseModel):
    zones: list[VenueZone]
    gates: list[VenueGate]
    amenities: list[VenueAmenity]


class RouteRequest(BaseModel):
    from_zone: str
    to_zone: str
    accessible: bool = False


class RouteStep(BaseModel):
    instruction: str
    distance_m: int


class RouteResponse(BaseModel):
    steps: list[RouteStep]
    total_distance_m: int
    accessible: bool
