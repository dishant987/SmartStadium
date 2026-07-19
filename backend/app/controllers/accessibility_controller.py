from fastapi import APIRouter, Depends
from app.schemas.accessibility_schema import AccessibilityStatus, AccessibilityRouteRequest, AccessibilityRouteResponse
from app.services.accessibility_service import AccessibilityService

router = APIRouter()


@router.get("/status", response_model=list[AccessibilityStatus])
async def accessibility_status(service: AccessibilityService = Depends()) -> list[AccessibilityStatus]:
    return await service.get_status()


@router.post("/ai-route", response_model=AccessibilityRouteResponse)
async def ai_route(body: AccessibilityRouteRequest, service: AccessibilityService = Depends()) -> AccessibilityRouteResponse:
    return await service.get_ai_route(body)
