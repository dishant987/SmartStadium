from fastapi import APIRouter, Depends

from app.schemas.ops_schema import IncidentReportRequest, IncidentReportResponse
from app.services.ops_service import OpsService

router = APIRouter()


@router.get("/incidents")
async def get_incidents(service: OpsService = Depends()):
    return await service.list_incidents()


@router.post("/incidents", response_model=IncidentReportResponse)
async def report_incident(body: IncidentReportRequest, service: OpsService = Depends()):
    return await service.report_incident(body)


@router.get("/crowd-density")
async def crowd_density(service: OpsService = Depends()):
    return await service.get_crowd_density()


@router.get("/recommendations")
async def recommendations(service: OpsService = Depends()):
    return await service.get_recommendations()
