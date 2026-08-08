from datetime import date, datetime

from pydantic import BaseModel

from app.schemas.programme import SessionTemplateDetail, SessionTemplateSummary


class StartSessionRequest(BaseModel):
    session_template_id: int
    scheduled_date: date


class UpdateSessionStatusRequest(BaseModel):
    status: str  # in_progress/skipped


class CompleteSessionRequest(BaseModel):
    rounds_completed: int
    total_duration_sec: int
    perceived_intensity: int | None = None
    notes: str | None = None


class SessionResultResponse(BaseModel):
    rounds_completed: int
    total_duration_sec: int
    perceived_intensity: int | None = None
    notes: str | None = None

    model_config = {"from_attributes": True}


class UserSessionResponse(BaseModel):
    id: int
    scheduled_date: date
    status: str
    started_at: datetime | None = None
    completed_at: datetime | None = None
    session_template: SessionTemplateSummary
    result: SessionResultResponse | None = None

    model_config = {"from_attributes": True}


class UserSessionDetailResponse(UserSessionResponse):
    session_template: SessionTemplateDetail


class PersonalRecordResponse(BaseModel):
    record_type: str
    value: float
    achieved_at: datetime

    model_config = {"from_attributes": True}


class CompleteSessionResponse(BaseModel):
    session: UserSessionResponse
    new_personal_records: list[PersonalRecordResponse] = []
