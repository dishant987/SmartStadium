from fastapi import APIRouter, Depends
from app.schemas.accessibility_schema import AccessibilityStatus, AccessibilityRouteRequest, AccessibilityRouteResponse
from app.services.accessibility_service import AccessibilityService
from app.services.auth_service import UserResponse
from app.middleware.auth import get_current_user

router = APIRouter()


@router.get("/status", response_model=list[AccessibilityStatus])
async def accessibility_status(service: AccessibilityService = Depends(), user: UserResponse = Depends(get_current_user)):
    return await service.get_status()


@router.post("/ai-route", response_model=AccessibilityRouteResponse)
async def ai_route(body: AccessibilityRouteRequest, service: AccessibilityService = Depends(), user: UserResponse = Depends(get_current_user)):
    return await service.get_ai_route(body)
