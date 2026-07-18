from fastapi import APIRouter, Depends, Query
from app.schemas.sustainability_schema import (
    SustainabilityTipResponse, StationResponse,
    CarbonImpactRequest, CarbonImpactResponse, PersonalizedTipResponse,
)
from app.services.sustainability_service import SustainabilityService
from app.services.auth_service import UserResponse
from app.middleware.auth import get_current_user

router = APIRouter()


@router.get("/tip", response_model=SustainabilityTipResponse)
async def tip(context: str = Query("", description="Context for AI-generated tip"), service: SustainabilityService = Depends()):
    return await service.get_tip(context)


@router.get("/stations", response_model=StationResponse)
async def stations(service: SustainabilityService = Depends()):
    return await service.get_stations()


@router.get("/personalized-tips", response_model=list[PersonalizedTipResponse])
async def personalized_tips(
    zone: str = Query("", description="Stadium zone"),
    match_status: str = Query("", description="Current match status"),
    service: SustainabilityService = Depends(),
    user: UserResponse = Depends(get_current_user),
):
    return await service.get_personalized_tips(zone, match_status)


@router.post("/carbon-impact", response_model=CarbonImpactResponse)
async def carbon_impact(body: CarbonImpactRequest, service: SustainabilityService = Depends(), user: UserResponse = Depends(get_current_user)):
    return await service.calculate_carbon(body.transport_mode, body.distance_km, body.group_size)
