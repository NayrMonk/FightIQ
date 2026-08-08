from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.session import UserSession


def get_current_streak_days(db: Session, user_id: int) -> int:
    """Count consecutive days (ending today or yesterday) with a completed session."""
    completed_dates = set(
        db.scalars(
            select(UserSession.scheduled_date)
            .where(UserSession.user_id == user_id, UserSession.status == "completed")
        ).all()
    )
    if not completed_dates:
        return 0

    today = date.today()
    cursor = today if today in completed_dates else today - timedelta(days=1)
    if cursor not in completed_dates:
        return 0

    streak = 0
    while cursor in completed_dates:
        streak += 1
        cursor -= timedelta(days=1)
    return streak
