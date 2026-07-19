"""add_volunteer_indexes

Revision ID: 003
Revises: 002
Create Date: 2026-07-19

"""

from typing import Sequence, Union

from alembic import op


revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index("ix_volunteers_status", "volunteers", ["status"])
    op.create_index("ix_volunteers_zone", "volunteers", ["zone"])
    op.create_index("ix_volunteers_role", "volunteers", ["role"])
    op.create_index("ix_volunteer_tasks_status", "volunteer_tasks", ["status"])


def downgrade() -> None:
    op.drop_index("ix_volunteers_status")
    op.drop_index("ix_volunteers_zone")
    op.drop_index("ix_volunteers_role")
    op.drop_index("ix_volunteer_tasks_status")
