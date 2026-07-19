from fastapi import APIRouter, Depends

from app.schemas.nav_schema import RouteRequest, RouteResponse, VenueMapResponse
from app.schemas.wayfinding_schema import WayfindingRequest, WayfindingRoute
from app.services.nav_service import NavService

router = APIRouter()


@router.get("/venue-map", response_model=VenueMapResponse)
async def venue_map(service: NavService = Depends()) -> VenueMapResponse:
    return await service.get_venue_map()


@router.post("/route", response_model=RouteResponse)
async def route(body: RouteRequest, service: NavService = Depends()) -> RouteResponse:
    return await service.get_route(body)


@router.post("/wayfinding", response_model=WayfindingRoute)
async def wayfinding(body: WayfindingRequest, service: NavService = Depends()) -> WayfindingRoute:
    return await service.get_wayfinding_route(body)
