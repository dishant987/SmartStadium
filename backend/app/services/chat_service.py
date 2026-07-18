import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.chat_session import ChatSession
from app.models.chat_message import ChatMessage, MessageRole
from app.schemas.chat_schema import (
    ChatRequest,
    ChatResponse,
    SessionResponse,
    MessageResponse,
)
from app.services.llm_router_service import LLMRouterService
from app.services.rag_service import RAGService

SYSTEM_PROMPT = """You are StadiumSense, an expert AI assistant for the FIFA World Cup 2026.
You help fans, staff, and organizers with:
- Stadium navigation (gates, sections, levels, elevators, ramps)
- Transit info (Meadowlands Rail, shuttle schedules, parking lots)
- Accessibility (wheelchair access, accessible restrooms, assistive services)
- Matchday info (schedules, ticketing, food vendors, security)
- Sustainability (recycling, low-carbon transport, water stations)
- Multilingual support (respond in the user's language)

Be concise, helpful, and specific. Use markdown formatting when it helps.
If you have stadium knowledge context below, use it to give accurate answers.
If you don't know something specific, say so honestly rather than guessing."""


class ChatService:
    def __init__(self, db: Session):
        self.db = db
        self.llm = LLMRouterService()
        self.rag = RAGService()

    def _user_sessions_q(self, user_id: str):
        return (
            select(ChatSession)
            .where(
                ChatSession.user_session_id == user_id, ChatSession.deleted_at.is_(None)
            )
            .order_by(ChatSession.updated_at.desc())
        )

    async def _build_prompt(self, message: str, history_text: str) -> str:
        rag_docs = await self.rag.retrieve(message)
        rag_context = "\n\n".join(rag_docs) if rag_docs else ""

        parts = [SYSTEM_PROMPT]
        if rag_context:
            parts.append(f"\nRelevant stadium knowledge:\n{rag_context}")
        if history_text:
            parts.append(f"\nConversation history:\n{history_text}")
        parts.append(f"\nUser: {message}")
        return "\n".join(parts)

    async def respond(self, user_id: str, req: ChatRequest) -> ChatResponse:
        session = self.db.get(ChatSession, req.session_id)
        if not session or session.user_session_id != user_id:
            raise ValueError("Session not found")

        db_messages = (
            self.db.execute(
                select(ChatMessage)
                .where(ChatMessage.session_id == req.session_id)
                .order_by(ChatMessage.created_at)
            )
            .scalars()
            .all()
        )
        history_text = "\n".join(
            [f"{m.role.value}: {m.content}" for m in db_messages[-10:]]
        )

        prompt = await self._build_prompt(req.message, history_text)
        reply = await self.llm.complete(prompt)

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

        db_messages = (
            self.db.execute(
                select(ChatMessage)
                .where(ChatMessage.session_id == req.session_id)
                .order_by(ChatMessage.created_at)
            )
            .scalars()
            .all()
        )
        history_text = "\n".join(
            [f"{m.role.value}: {m.content}" for m in db_messages[-10:]]
        )

        prompt = await self._build_prompt(req.message, history_text)

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
        async for token in self.llm.complete_stream(prompt):
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
