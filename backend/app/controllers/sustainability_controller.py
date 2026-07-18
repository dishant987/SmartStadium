from fastapi import APIRouter, Depends

from app.schemas.sustainability_schema import SustainabilityTipResponse, StationResponse
from app.services.sustainability_service import SustainabilityService

router = APIRouter()


@router.get("/tip", response_model=SustainabilityTipResponse)
async def tip(service: SustainabilityService = Depends()):
    return await service.get_tip()


@router.get("/stations", response_model=StationResponse)
async def stations(service: SustainabilityService = Depends()):
    return await service.get_stations()
