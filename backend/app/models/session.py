from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class UserSession(Base):
    __tablename__ = "user_sessions"
    __table_args__ = (
        UniqueConstraint("user_id", "scheduled_date", "session_template_id", name="uq_user_session_slot"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    session_template_id: Mapped[int] = mapped_column(ForeignKey("session_templates.id"), nullable=False)
    scheduled_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)  # pending/in_progress/completed/skipped
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    session_template: Mapped["SessionTemplate"] = relationship()
    result: Mapped["SessionResult"] = relationship(back_populates="user_session", uselist=False, cascade="all, delete-orphan")


class SessionResult(Base):
    __tablename__ = "session_results"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_session_id: Mapped[int] = mapped_column(ForeignKey("user_sessions.id"), unique=True, nullable=False)
    rounds_completed: Mapped[int] = mapped_column(default=0)
    total_duration_sec: Mapped[int] = mapped_column(default=0)
    perceived_intensity: Mapped[int | None]  # 1-10
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user_session: Mapped["UserSession"] = relationship(back_populates="result")


class PersonalRecord(Base):
    __tablename__ = "personal_records"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    record_type: Mapped[str] = mapped_column(String(50), nullable=False)  # longest_streak/most_rounds_session/...
    value: Mapped[float] = mapped_column(nullable=False)
    achieved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    user_session_id: Mapped[int | None] = mapped_column(ForeignKey("user_sessions.id"))
