from fastapi import APIRouter, Depends

from app.schemas.wait_time_schema import WaitTimeRequest, WaitTimeResponse
from app.services.wait_time_service import WaitTimeService

router = APIRouter()


@router.post("/wait-times", response_model=WaitTimeResponse)
async def wait_times(body: WaitTimeRequest, service: WaitTimeService = Depends()):
    return await service.get_wait_times(body)
