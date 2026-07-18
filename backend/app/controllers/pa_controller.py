from fastapi import APIRouter, Depends

from app.schemas.pa_schema import (
    PAAnnouncementRequest,
    PAAnnouncementResponse,
    PALogResponse,
)
from app.services.pa_service import PAService

router = APIRouter()


@router.post("/announce", response_model=PAAnnouncementResponse)
async def announce(body: PAAnnouncementRequest, service: PAService = Depends()):
    return await service.create_announcement(body)


@router.get("/log", response_model=PALogResponse)
async def pa_log(service: PAService = Depends()):
    return await service.get_log()
