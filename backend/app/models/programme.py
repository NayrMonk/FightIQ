from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Programme(Base):
    __tablename__ = "programmes"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    discipline: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    duration_weeks: Mapped[int] = mapped_column(default=4)
    level: Mapped[str] = mapped_column(String(30), default="beginner")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    weeks: Mapped[list["ProgrammeWeek"]] = relationship(back_populates="programme", cascade="all, delete-orphan", order_by="ProgrammeWeek.week_number")
    session_templates: Mapped[list["SessionTemplate"]] = relationship(back_populates="programme", cascade="all, delete-orphan")


class ProgrammeWeek(Base):
    __tablename__ = "programme_weeks"

    id: Mapped[int] = mapped_column(primary_key=True)
    programme_id: Mapped[int] = mapped_column(ForeignKey("programmes.id"), nullable=False)
    week_number: Mapped[int] = mapped_column(nullable=False)

    programme: Mapped["Programme"] = relationship(back_populates="weeks")
    scheduled_sessions: Mapped[list["ScheduledSession"]] = relationship(back_populates="programme_week", cascade="all, delete-orphan", order_by="ScheduledSession.day_of_week")


class SessionTemplate(Base):
    __tablename__ = "session_templates"

    id: Mapped[int] = mapped_column(primary_key=True)
    programme_id: Mapped[int] = mapped_column(ForeignKey("programmes.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    discipline: Mapped[str] = mapped_column(String(50), nullable=False)
    estimated_duration_min: Mapped[int] = mapped_column(default=30)
    intensity: Mapped[str] = mapped_column(String(20), default="medium")
    description: Mapped[str | None] = mapped_column(Text)

    programme: Mapped["Programme"] = relationship(back_populates="session_templates")
    rounds: Mapped[list["Round"]] = relationship(back_populates="session_template", cascade="all, delete-orphan", order_by="Round.round_number")


class ScheduledSession(Base):
    __tablename__ = "scheduled_sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    programme_week_id: Mapped[int] = mapped_column(ForeignKey("programme_weeks.id"), nullable=False)
    day_of_week: Mapped[int] = mapped_column(nullable=False)  # 0=Mon .. 6=Sun
    session_template_id: Mapped[int] = mapped_column(ForeignKey("session_templates.id"), nullable=False)

    programme_week: Mapped["ProgrammeWeek"] = relationship(back_populates="scheduled_sessions")
    session_template: Mapped["SessionTemplate"] = relationship()


class Round(Base):
    __tablename__ = "rounds"

    id: Mapped[int] = mapped_column(primary_key=True)
    session_template_id: Mapped[int] = mapped_column(ForeignKey("session_templates.id"), nullable=False)
    round_number: Mapped[int] = mapped_column(nullable=False)
    round_type: Mapped[str] = mapped_column(String(30), default="work")  # work/conditioning
    work_duration_sec: Mapped[int] = mapped_column(nullable=False)
    rest_duration_sec: Mapped[int] = mapped_column(default=60)

    session_template: Mapped["SessionTemplate"] = relationship(back_populates="rounds")
    round_exercises: Mapped[list["RoundExercise"]] = relationship(back_populates="round", cascade="all, delete-orphan", order_by="RoundExercise.order_index")


class Exercise(Base):
    __tablename__ = "exercises"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    category: Mapped[str] = mapped_column(String(30), default="drill")  # combo/drill/conditioning/technique
    description: Mapped[str | None] = mapped_column(Text)
    default_instructions: Mapped[str | None] = mapped_column(Text)


class RoundExercise(Base):
    __tablename__ = "round_exercises"

    id: Mapped[int] = mapped_column(primary_key=True)
    round_id: Mapped[int] = mapped_column(ForeignKey("rounds.id"), nullable=False)
    exercise_id: Mapped[int] = mapped_column(ForeignKey("exercises.id"), nullable=False)
    order_index: Mapped[int] = mapped_column(default=0)
    reps: Mapped[int | None]
    duration_sec: Mapped[int | None]
    notes: Mapped[str | None] = mapped_column(Text)

    round: Mapped["Round"] = relationship(back_populates="round_exercises")
    exercise: Mapped["Exercise"] = relationship()
