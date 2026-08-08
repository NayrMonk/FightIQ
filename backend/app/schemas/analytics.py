from pydantic import BaseModel

from app.schemas.session import PersonalRecordResponse, UserSessionResponse


class AnalyticsSummaryResponse(BaseModel):
    total_sessions_completed: int
    sessions_last_7_days: int
    sessions_last_30_days: int
    avg_session_duration_sec: float
    avg_perceived_intensity: float | None
    round_completion_rate: float  # rounds_completed / rounds_scheduled across templates run
    current_streak_days: int
    consistency_pct_last_4_weeks: float  # sessions completed / sessions scheduled


class DashboardResponse(BaseModel):
    today_session: UserSessionResponse | None
    weekly_sessions_completed: int
    weekly_sessions_scheduled: int
    current_streak_days: int
    recent_sessions: list[UserSessionResponse]
    avg_recent_intensity: float | None
