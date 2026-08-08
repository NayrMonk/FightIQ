from pydantic import BaseModel


class ExerciseResponse(BaseModel):
    id: int
    name: str
    category: str
    description: str | None = None
    default_instructions: str | None = None

    model_config = {"from_attributes": True}


class RoundExerciseResponse(BaseModel):
    id: int
    order_index: int
    reps: int | None = None
    duration_sec: int | None = None
    notes: str | None = None
    exercise: ExerciseResponse

    model_config = {"from_attributes": True}


class RoundResponse(BaseModel):
    id: int
    round_number: int
    round_type: str
    work_duration_sec: int
    rest_duration_sec: int
    round_exercises: list[RoundExerciseResponse] = []

    model_config = {"from_attributes": True}


class SessionTemplateSummary(BaseModel):
    id: int
    name: str
    discipline: str
    estimated_duration_min: int
    intensity: str
    description: str | None = None

    model_config = {"from_attributes": True}


class SessionTemplateDetail(SessionTemplateSummary):
    rounds: list[RoundResponse] = []


class ScheduledSessionResponse(BaseModel):
    id: int
    day_of_week: int
    session_template: SessionTemplateSummary

    model_config = {"from_attributes": True}


class ProgrammeWeekResponse(BaseModel):
    id: int
    week_number: int
    scheduled_sessions: list[ScheduledSessionResponse] = []

    model_config = {"from_attributes": True}


class ProgrammeSummary(BaseModel):
    id: int
    name: str
    discipline: str
    description: str | None = None
    duration_weeks: int
    level: str

    model_config = {"from_attributes": True}


class ProgrammeDetail(ProgrammeSummary):
    weeks: list[ProgrammeWeekResponse] = []
