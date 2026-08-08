from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.session import SessionResult, UserSession
from app.models.user import User
from app.schemas.analytics import DashboardResponse
from app.services.stats import get_current_streak_days

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()
    week_start = today - timedelta(days=today.weekday())

    loaded = lambda q: q.options(joinedload(UserSession.session_template), joinedload(UserSession.result))

    today_session = loaded(
        db.query(UserSession).filter(
            UserSession.user_id == current_user.id,
            UserSession.scheduled_date == today,
        )
    ).first()

    weekly_scheduled = (
        db.query(UserSession)
        .filter(UserSession.user_id == current_user.id, UserSession.scheduled_date >= week_start)
        .count()
    )
    weekly_completed = (
        db.query(UserSession)
        .filter(
            UserSession.user_id == current_user.id,
            UserSession.scheduled_date >= week_start,
            UserSession.status == "completed",
        )
        .count()
    )

    recent_sessions = (
        loaded(
            db.query(UserSession).filter(
                UserSession.user_id == current_user.id, UserSession.status == "completed"
            )
        )
        .order_by(UserSession.scheduled_date.desc())
        .limit(5)
        .all()
    )

    avg_intensity = (
        db.query(func.avg(SessionResult.perceived_intensity))
        .join(UserSession)
        .filter(
            UserSession.user_id == current_user.id,
            UserSession.status == "completed",
            UserSession.scheduled_date >= today - timedelta(days=14),
        )
        .scalar()
    )

    return DashboardResponse(
        today_session=today_session,
        weekly_sessions_completed=weekly_completed,
        weekly_sessions_scheduled=weekly_scheduled,
        current_streak_days=get_current_streak_days(db, current_user.id),
        recent_sessions=recent_sessions,
        avg_recent_intensity=round(avg_intensity, 2) if avg_intensity is not None else None,
    )
