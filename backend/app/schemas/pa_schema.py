from pydantic import BaseModel


class PAAnnouncementRequest(BaseModel):
    type: str
    severity: str
    message: str
    gate: str = ""
    languages: list[str] = ["en", "es", "fr"]
    broadcast: bool = False


class PAAnnouncement(BaseModel):
    id: str
    type: str
    severity: str
    original_message: str
    translations: dict[str, str]
    gate: str
    timestamp: str
    broadcast: bool
    status: str


class PAAnnouncementResponse(BaseModel):
    announcement: PAAnnouncement
    tts_urls: dict[str, str]


class PALogEntry(BaseModel):
    id: str
    type: str
    severity: str
    message: str
    gate: str
    timestamp: str
    broadcast: bool
    languages: list[str]


class PALogResponse(BaseModel):
    announcements: list[PALogEntry]
    total: int
