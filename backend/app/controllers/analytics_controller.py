from fastapi import APIRouter, Depends

from app.middleware.auth import get_current_user
from app.schemas.analytics_schema import PostMatchAnalyticsResponse
from app.schemas.auth_schema import UserResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter()


@router.get("/post-match", response_model=PostMatchAnalyticsResponse)
async def post_match_analytics(service: AnalyticsService = Depends(), _user: UserResponse = Depends(get_current_user)) -> PostMatchAnalyticsResponse:
    return await service.get_post_match_analytics()
