from fastapi import APIRouter, Depends

from app.schemas.transport_schema import TransportStatusResponse
from app.services.transport_service import TransportService

router = APIRouter()


@router.get("/status", response_model=TransportStatusResponse)
async def transport_status(service: TransportService = Depends()):
    return await service.get_status()
