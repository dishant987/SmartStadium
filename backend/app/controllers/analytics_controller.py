from fastapi import APIRouter, Depends

from app.schemas.analytics_schema import PostMatchAnalyticsResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter()


@router.get("/post-match", response_model=PostMatchAnalyticsResponse)
async def post_match_analytics(service: AnalyticsService = Depends()):
    return await service.get_post_match_analytics()
