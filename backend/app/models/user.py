from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False, server_default="athlete")
    email_verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    profile: Mapped["AthleteProfile"] = relationship(back_populates="user", uselist=False, cascade="all, delete-orphan")


class AthleteProfile(Base):
    __tablename__ = "athlete_profiles"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)
    display_name: Mapped[str | None] = mapped_column(String(100))
    weight_class: Mapped[str | None] = mapped_column(String(50))
    primary_discipline: Mapped[str | None] = mapped_column(String(50))
    experience_level: Mapped[str | None] = mapped_column(String(30))
    primary_goal: Mapped[str | None] = mapped_column(String(50))
    onboarding_completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    height_cm: Mapped[int | None]
    weight_kg: Mapped[float | None]
    avatar_url: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user: Mapped["User"] = relationship(back_populates="profile")
