from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.chat_schema import ChatRequest, RenameRequest
from app.services.chat_service import ChatService
from app.services.auth_service import UserResponse
from app.middleware.auth import get_current_user

router = APIRouter()


@router.post("", response_model=None)
async def chat(
    body: ChatRequest,
    user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return ChatService(db).respond(user.id, body)


@router.post("/stream")
async def chat_stream(
    body: ChatRequest,
    user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    async def event_stream():
        async for token in ChatService(db).stream(user.id, body):
            yield f"data: {token}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.get("/sessions")
async def list_sessions(
    user: UserResponse = Depends(get_current_user), db: Session = Depends(get_db)
):
    return ChatService(db).list_sessions(user.id)


@router.post("/sessions")
async def create_session(
    user: UserResponse = Depends(get_current_user), db: Session = Depends(get_db)
):
    return ChatService(db).create_session(user.id)


@router.get("/sessions/{session_id}/messages")
async def get_messages(
    session_id: str,
    user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return ChatService(db).get_messages(user.id, session_id)


@router.patch("/sessions/{session_id}")
async def rename_session(
    session_id: str,
    body: RenameRequest,
    user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return ChatService(db).rename_session(user.id, session_id, body.title)


@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: str,
    user: UserResponse = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return ChatService(db).delete_session(user.id, session_id)
