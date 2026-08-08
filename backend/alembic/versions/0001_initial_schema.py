"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-08-08

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "athlete_profiles",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False, unique=True),
        sa.Column("display_name", sa.String(length=100)),
        sa.Column("weight_class", sa.String(length=50)),
        sa.Column("primary_discipline", sa.String(length=50)),
        sa.Column("experience_level", sa.String(length=30)),
        sa.Column("height_cm", sa.Integer()),
        sa.Column("weight_kg", sa.Float()),
        sa.Column("avatar_url", sa.String(length=500)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "programmes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("discipline", sa.String(length=50), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("duration_weeks", sa.Integer(), server_default="4"),
        sa.Column("level", sa.String(length=30), server_default="beginner"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "programme_weeks",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("programme_id", sa.Integer(), sa.ForeignKey("programmes.id"), nullable=False),
        sa.Column("week_number", sa.Integer(), nullable=False),
    )

    op.create_table(
        "session_templates",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("programme_id", sa.Integer(), sa.ForeignKey("programmes.id"), nullable=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("discipline", sa.String(length=50), nullable=False),
        sa.Column("estimated_duration_min", sa.Integer(), server_default="30"),
        sa.Column("intensity", sa.String(length=20), server_default="medium"),
        sa.Column("description", sa.Text()),
    )

    op.create_table(
        "scheduled_sessions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("programme_week_id", sa.Integer(), sa.ForeignKey("programme_weeks.id"), nullable=False),
        sa.Column("day_of_week", sa.Integer(), nullable=False),
        sa.Column("session_template_id", sa.Integer(), sa.ForeignKey("session_templates.id"), nullable=False),
    )

    op.create_table(
        "rounds",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("session_template_id", sa.Integer(), sa.ForeignKey("session_templates.id"), nullable=False),
        sa.Column("round_number", sa.Integer(), nullable=False),
        sa.Column("round_type", sa.String(length=30), server_default="work"),
        sa.Column("work_duration_sec", sa.Integer(), nullable=False),
        sa.Column("rest_duration_sec", sa.Integer(), server_default="60"),
    )

    op.create_table(
        "exercises",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("category", sa.String(length=30), server_default="drill"),
        sa.Column("description", sa.Text()),
        sa.Column("default_instructions", sa.Text()),
    )

    op.create_table(
        "round_exercises",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("round_id", sa.Integer(), sa.ForeignKey("rounds.id"), nullable=False),
        sa.Column("exercise_id", sa.Integer(), sa.ForeignKey("exercises.id"), nullable=False),
        sa.Column("order_index", sa.Integer(), server_default="0"),
        sa.Column("reps", sa.Integer()),
        sa.Column("duration_sec", sa.Integer()),
        sa.Column("notes", sa.Text()),
    )

    op.create_table(
        "user_sessions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("session_template_id", sa.Integer(), sa.ForeignKey("session_templates.id"), nullable=False),
        sa.Column("scheduled_date", sa.Date(), nullable=False),
        sa.Column("status", sa.String(length=20), server_default="pending"),
        sa.Column("started_at", sa.DateTime(timezone=True)),
        sa.Column("completed_at", sa.DateTime(timezone=True)),
        sa.UniqueConstraint("user_id", "scheduled_date", "session_template_id", name="uq_user_session_slot"),
    )
    op.create_index("ix_user_sessions_user_id", "user_sessions", ["user_id"])
    op.create_index("ix_user_sessions_scheduled_date", "user_sessions", ["scheduled_date"])
    op.create_index("ix_user_sessions_status", "user_sessions", ["status"])

    op.create_table(
        "session_results",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_session_id", sa.Integer(), sa.ForeignKey("user_sessions.id"), nullable=False, unique=True),
        sa.Column("rounds_completed", sa.Integer(), server_default="0"),
        sa.Column("total_duration_sec", sa.Integer(), server_default="0"),
        sa.Column("perceived_intensity", sa.Integer()),
        sa.Column("notes", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "personal_records",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("record_type", sa.String(length=50), nullable=False),
        sa.Column("value", sa.Float(), nullable=False),
        sa.Column("achieved_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("user_session_id", sa.Integer(), sa.ForeignKey("user_sessions.id")),
    )
    op.create_index("ix_personal_records_user_id", "personal_records", ["user_id"])


def downgrade() -> None:
    op.drop_table("personal_records")
    op.drop_table("session_results")
    op.drop_index("ix_user_sessions_status", table_name="user_sessions")
    op.drop_index("ix_user_sessions_scheduled_date", table_name="user_sessions")
    op.drop_index("ix_user_sessions_user_id", table_name="user_sessions")
    op.drop_table("user_sessions")
    op.drop_table("round_exercises")
    op.drop_table("exercises")
    op.drop_table("rounds")
    op.drop_table("scheduled_sessions")
    op.drop_table("session_templates")
    op.drop_table("programme_weeks")
    op.drop_table("programmes")
    op.drop_table("athlete_profiles")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
