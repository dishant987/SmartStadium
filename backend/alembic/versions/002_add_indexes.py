"""add_indexes

Revision ID: 002
Revises: 001
Create Date: 2026-07-15

"""

from typing import Sequence, Union

from alembic import op


revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index("ix_incidents_venue_id", "incidents", ["venue_id"])
    op.create_index("ix_incidents_created_at", "incidents", ["created_at"])
    op.create_index("ix_incidents_type", "incidents", ["type"])
    op.create_index("ix_incidents_severity", "incidents", ["severity"])
    op.create_index("ix_incidents_status", "incidents", ["status"])
    op.create_index("ix_chat_messages_session_id", "chat_messages", ["session_id"])
    op.create_index("ix_chat_messages_created_at", "chat_messages", ["created_at"])
    op.create_index("ix_events_venue_id", "events", ["venue_id"])
    op.create_index("ix_events_start_time", "events", ["start_time"])
    op.create_index(
        "ix_chat_sessions_user_session_id", "chat_sessions", ["user_session_id"]
    )
    op.create_index("ix_chat_sessions_updated_at", "chat_sessions", ["updated_at"])
    op.create_index("ix_chat_sessions_deleted_at", "chat_sessions", ["deleted_at"])


def downgrade() -> None:
    op.drop_index("ix_incidents_venue_id")
    op.drop_index("ix_incidents_created_at")
    op.drop_index("ix_incidents_type")
    op.drop_index("ix_incidents_severity")
    op.drop_index("ix_incidents_status")
    op.drop_index("ix_chat_messages_session_id")
    op.drop_index("ix_chat_messages_created_at")
    op.drop_index("ix_events_venue_id")
    op.drop_index("ix_events_start_time")
    op.drop_index("ix_chat_sessions_user_session_id")
    op.drop_index("ix_chat_sessions_updated_at")
    op.drop_index("ix_chat_sessions_deleted_at")
