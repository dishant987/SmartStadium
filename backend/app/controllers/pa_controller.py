from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse

from app.schemas.pa_schema import PAAnnouncementRequest, PAAnnouncementResponse, PALogResponse
from app.services.pa_service import PAService

router = APIRouter()


@router.post("/announce", response_model=PAAnnouncementResponse)
async def announce(body: PAAnnouncementRequest, service: PAService = Depends()):
    return await service.create_announcement(body)


@router.get("/log", response_model=PALogResponse)
async def pa_log(service: PAService = Depends()):
    return await service.get_log()


@router.get("/tts/{ann_id}/{lang}")
async def tts_audio(ann_id: str, lang: str, service: PAService = Depends()):
    filepath = await service.get_tts_audio(ann_id, lang)
    if not filepath:
        raise HTTPException(404, "Audio not found")
    return FileResponse(str(filepath), media_type="audio/mpeg", filename=f"{ann_id}_{lang}.mp3")
