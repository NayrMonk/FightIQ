from datetime import date

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from app.db.session import SessionLocal
from app.models.session import UserSession
from app.models.user import User
from app.services.push import notify_user
from app.services.stats import get_current_streak_days

_scheduler: BackgroundScheduler | None = None


def send_session_reminders() -> None:
    """Nudge users who have a session scheduled today but haven't started it."""
    db = SessionLocal()
    try:
        today = date.today()
        # ponytail: there's no user->programme assignment model in this codebase, so
        # "scheduled for today" == a UserSession row for today (same resolution the
        # /sessions/today and /dashboard endpoints already use), not a ProgrammeWeek/
        # ScheduledSession walk which has no per-user linkage to hang a date off of.
        due = (
            db.query(UserSession)
            .filter(UserSession.scheduled_date == today, UserSession.status != "completed")
            .all()
        )
        for user_session in due:
            notify_user(
                db,
                user_session.user_id,
                type="session_reminder",
                title="Today's session is waiting",
                body="You have a training session scheduled today. Let's get after it.",
                data={"user_session_id": user_session.id},
            )
    finally:
        db.close()


def send_streak_risk_alerts() -> None:
    """Warn users whose active streak will break if they skip today."""
    db = SessionLocal()
    try:
        today = date.today()
        completed_today_user_ids = {
            row[0]
            for row in db.query(UserSession.user_id)
            .filter(UserSession.scheduled_date == today, UserSession.status == "completed")
            .all()
        }
        for user_id in [row[0] for row in db.query(User.id).all()]:
            if user_id in completed_today_user_ids:
                continue
            streak = get_current_streak_days(db, user_id)
            if streak > 0:
                notify_user(
                    db,
                    user_id,
                    type="streak_risk",
                    title="Don't lose your streak",
                    body=f"You're on a {streak}-day streak. Complete a session today to keep it alive.",
                    data={"streak_days": streak},
                )
    finally:
        db.close()


def start_scheduler() -> None:
    # ponytail: in-process BackgroundScheduler only works with a single uvicorn worker;
    # move to Celery/RQ + Redis if the backend ever scales to multiple workers/processes.
    global _scheduler
    if _scheduler is not None:
        return
    _scheduler = BackgroundScheduler()
    _scheduler.add_job(send_session_reminders, CronTrigger(hour=8, minute=0))
    _scheduler.add_job(send_streak_risk_alerts, CronTrigger(hour=18, minute=0))
    _scheduler.start()
