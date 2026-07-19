import uuid
from datetime import datetime, timezone

from sqlalchemy import select, desc
from sqlalchemy.orm import Session

from app.models.chat_session import ChatSession
from app.models.chat_message import ChatMessage, MessageRole
from app.schemas.chat_schema import (
    ChatRequest,
    ChatResponse,
    SessionResponse,
    MessageResponse,
)
from app.services.langgraph_agent import LangGraphAgent
from app.utils.sanitize import sanitize_prompt, contains_injection


class ChatService:
    def __init__(self, db: Session):
        self.db = db
        self.agent = LangGraphAgent()

    def _user_sessions_q(self, user_id: str):
        return (
            select(ChatSession)
            .where(
                ChatSession.user_session_id == user_id, ChatSession.deleted_at.is_(None)
            )
            .order_by(ChatSession.updated_at.desc())
        )

    async def respond(self, user_id: str, req: ChatRequest) -> ChatResponse:
        session = self.db.get(ChatSession, req.session_id)
        if not session or session.user_session_id != user_id:
            raise ValueError("Session not found")
        req.message = sanitize_prompt(req.message)
        if contains_injection(req.message):
            req.message = "[Content moderated]"

        db_messages = list(reversed(
            self.db.execute(
                select(ChatMessage)
                .where(ChatMessage.session_id == req.session_id)
                .order_by(desc(ChatMessage.created_at))
                .limit(10)
            )
            .scalars()
            .all()
        ))
        history = [{"role": m.role.value, "content": m.content} for m in db_messages]
        history.append({"role": "user", "content": req.message})

        reply = await self.agent.respond(history)

        user_msg = ChatMessage(
            id=str(uuid.uuid4()),
            session_id=req.session_id,
            role=MessageRole.user,
            content=req.message,
            language="en",
            created_at=datetime.now(timezone.utc),
        )
        asst_msg = ChatMessage(
            id=str(uuid.uuid4()),
            session_id=req.session_id,
            role=MessageRole.assistant,
            content=reply,
            language="en",
            created_at=datetime.now(timezone.utc),
        )
        self.db.add_all([user_msg, asst_msg])

        if session.title == "New Chat":
            session.title = req.message[:80]

        session.updated_at = datetime.now(timezone.utc)
        self.db.commit()

        return ChatResponse(
            reply=reply, session_id=req.session_id, language="en", sources=[]
        )

    async def stream(self, user_id: str, req: ChatRequest):
        session = self.db.get(ChatSession, req.session_id)
        if not session or session.user_session_id != user_id:
            yield "Session not found"
            return
        req.message = sanitize_prompt(req.message)
        if contains_injection(req.message):
            req.message = "[Content moderated]"

        db_messages = list(reversed(
            self.db.execute(
                select(ChatMessage)
                .where(ChatMessage.session_id == req.session_id)
                .order_by(desc(ChatMessage.created_at))
                .limit(10)
            )
            .scalars()
            .all()
        ))
        history = [{"role": m.role.value, "content": m.content} for m in db_messages]
        history.append({"role": "user", "content": req.message})

        user_msg = ChatMessage(
            id=str(uuid.uuid4()),
            session_id=req.session_id,
            role=MessageRole.user,
            content=req.message,
            language="en",
            created_at=datetime.now(timezone.utc),
        )
        self.db.add(user_msg)

        if session.title == "New Chat":
            session.title = req.message[:80]

        self.db.commit()

        full_reply = ""
        async for token in self.agent.respond_stream(history):
            full_reply += token
            yield token

        asst_msg = ChatMessage(
            id=str(uuid.uuid4()),
            session_id=req.session_id,
            role=MessageRole.assistant,
            content=full_reply,
            language="en",
            created_at=datetime.now(timezone.utc),
        )
        self.db.add(asst_msg)
        session.updated_at = datetime.now(timezone.utc)
        self.db.commit()

    def list_sessions(self, user_id: str) -> list[SessionResponse]:
        rows = self.db.execute(self._user_sessions_q(user_id)).scalars().all()
        return [
            SessionResponse(id=s.id, title=s.title, updated_at=s.updated_at)
            for s in rows
        ]

    def create_session(self, user_id: str) -> SessionResponse:
        now = datetime.now(timezone.utc)
        session = ChatSession(
            id=str(uuid.uuid4()),
            user_session_id=user_id,
            title="New Chat",
            created_at=now,
            updated_at=now,
        )
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return SessionResponse(
            id=session.id, title=session.title, updated_at=session.updated_at
        )

    def delete_session(self, user_id: str, session_id: str) -> dict:
        session = self.db.get(ChatSession, session_id)
        if session and session.user_session_id == user_id:
            session.deleted_at = datetime.now(timezone.utc)
            self.db.commit()
        return {"ok": True}

    def rename_session(
        self, user_id: str, session_id: str, title: str
    ) -> SessionResponse | None:
        session = self.db.get(ChatSession, session_id)
        if not session or session.user_session_id != user_id:
            return None
        session.title = title
        session.updated_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(session)
        return SessionResponse(
            id=session_id, title=session.title, updated_at=session.updated_at
        )

    def get_messages(self, user_id: str, session_id: str) -> list[MessageResponse]:
        session = self.db.get(ChatSession, session_id)
        if not session or session.user_session_id != user_id:
            return []
        rows = (
            self.db.execute(
                select(ChatMessage)
                .where(ChatMessage.session_id == session_id)
                .order_by(ChatMessage.created_at)
            )
            .scalars()
            .all()
        )
        return [
            MessageResponse(
                id=m.id,
                session_id=m.session_id,
                role=m.role.value,
                content=m.content,
                created_at=m.created_at,
            )
            for m in rows
        ]
