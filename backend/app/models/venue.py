import uuid

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Venue(Base):
    __tablename__ = "venues"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String)
    gate_map: Mapped[str | None] = mapped_column(Text, nullable=True)
    accessibility_info: Mapped[str | None] = mapped_column(Text, nullable=True)
