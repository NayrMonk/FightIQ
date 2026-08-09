from datetime import datetime

from pydantic import BaseModel


class ProfileResponse(BaseModel):
    display_name: str | None = None
    weight_class: str | None = None
    primary_discipline: str | None = None
    experience_level: str | None = None
    primary_goal: str | None = None
    onboarding_completed_at: datetime | None = None
    height_cm: int | None = None
    weight_kg: float | None = None
    avatar_url: str | None = None

    model_config = {"from_attributes": True}


class ProfileUpdateRequest(BaseModel):
    display_name: str | None = None
    weight_class: str | None = None
    primary_discipline: str | None = None
    experience_level: str | None = None
    primary_goal: str | None = None
    onboarding_completed_at: datetime | None = None
    height_cm: int | None = None
    weight_kg: float | None = None
    avatar_url: str | None = None
