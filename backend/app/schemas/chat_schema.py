from pydantic import BaseModel, ConfigDict
from datetime import datetime


def _to_camel(s: str) -> str:
    parts = s.split("_")
    return parts[0] + "".join(p.title() for p in parts[1:])


class ChatRequest(BaseModel):
    session_id: str
    message: str


class ChatResponse(BaseModel):
    model_config = ConfigDict(alias_generator=_to_camel, populate_by_name=True)

    reply: str
    session_id: str
    language: str = "en"
    sources: list[str] = []


class SessionResponse(BaseModel):
    model_config = ConfigDict(alias_generator=_to_camel, populate_by_name=True)

    id: str
    title: str
    updated_at: datetime


class MessageResponse(BaseModel):
    model_config = ConfigDict(alias_generator=_to_camel, populate_by_name=True)

    id: str
    session_id: str
    role: str
    content: str
    created_at: datetime


class RenameRequest(BaseModel):
    title: str
