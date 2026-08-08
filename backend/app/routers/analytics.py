from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.programme import Round
from app.models.session import PersonalRecord, SessionResult, UserSession
from app.models.user import User
from app.schemas.analytics import AnalyticsSummaryResponse
from app.schemas.session import PersonalRecordResponse
from app.services.stats import get_current_streak_days

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary", response_model=AnalyticsSummaryResponse)
def get_analytics_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    completed_query = db.query(UserSession).join(SessionResult).filter(
        UserSession.user_id == current_user.id,
        UserSession.status == "completed",
    )

    total_completed = completed_query.count()

    today = date.today()
    sessions_7d = completed_query.filter(UserSession.scheduled_date >= today - timedelta(days=7)).count()
    sessions_30d = completed_query.filter(UserSession.scheduled_date >= today - timedelta(days=30)).count()

    avg_duration = (
        db.query(func.avg(SessionResult.total_duration_sec))
        .join(UserSession)
        .filter(UserSession.user_id == current_user.id, UserSession.status == "completed")
        .scalar()
    ) or 0.0

    avg_intensity = (
        db.query(func.avg(SessionResult.perceived_intensity))
        .join(UserSession)
        .filter(UserSession.user_id == current_user.id, UserSession.status == "completed")
        .scalar()
    )

    completed_sessions = completed_query.options(joinedload(UserSession.result)).all()
    total_rounds_completed = sum(s.result.rounds_completed for s in completed_sessions if s.result)
    total_rounds_scheduled = 0
    for s in completed_sessions:
        total_rounds_scheduled += db.query(Round).filter(Round.session_template_id == s.session_template_id).count()
    round_completion_rate = (total_rounds_completed / total_rounds_scheduled) if total_rounds_scheduled else 0.0

    scheduled_4wk = (
        db.query(UserSession)
        .filter(UserSession.user_id == current_user.id, UserSession.scheduled_date >= today - timedelta(weeks=4))
        .count()
    )
    completed_4wk = completed_query.filter(UserSession.scheduled_date >= today - timedelta(weeks=4)).count()
    consistency_pct = (completed_4wk / scheduled_4wk * 100) if scheduled_4wk else 0.0

    return AnalyticsSummaryResponse(
        total_sessions_completed=total_completed,
        sessions_last_7_days=sessions_7d,
        sessions_last_30_days=sessions_30d,
        avg_session_duration_sec=round(avg_duration, 1),
        avg_perceived_intensity=round(avg_intensity, 2) if avg_intensity is not None else None,
        round_completion_rate=round(round_completion_rate, 3),
        current_streak_days=get_current_streak_days(db, current_user.id),
        consistency_pct_last_4_weeks=round(consistency_pct, 1),
    )


@router.get("/personal-records", response_model=list[PersonalRecordResponse])
def get_personal_records(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(PersonalRecord)
        .filter(PersonalRecord.user_id == current_user.id)
        .order_by(PersonalRecord.achieved_at.desc())
        .all()
    )
