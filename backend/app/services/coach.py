import httpx
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.core.config import settings
from app.models.session import SessionResult, UserSession
from app.models.user import User
from app.services.stats import get_current_streak_days

GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions"

SYSTEM_PROMPT = """You are Coach IQ, the AI training coach inside FightIQ, a combat sports training app.
You are talking directly to the athlete. Use the ATHLETE CONTEXT below to ground every answer in their
actual training history — cite concrete numbers (rounds, intensity, streak, sessions/week) when relevant.
Keep answers concise, direct, and actionable, like a real corner coach. If the context has too little
data to support a claim, say so plainly instead of inventing numbers."""


def build_athlete_context(db: Session, user: User) -> str:
    profile = user.profile
    recent_sessions = (
        db.query(UserSession)
        .options(joinedload(UserSession.session_template), joinedload(UserSession.result))
        .filter(UserSession.user_id == user.id, UserSession.status == "completed")
        .order_by(UserSession.scheduled_date.desc())
        .limit(8)
        .all()
    )

    avg_intensity = (
        db.query(func.avg(SessionResult.perceived_intensity))
        .join(UserSession)
        .filter(UserSession.user_id == user.id, UserSession.status == "completed")
        .scalar()
    )

    lines = ["ATHLETE CONTEXT", "================"]
    if profile:
        lines.append(
            f"Profile: {profile.display_name or 'Unnamed'}, "
            f"discipline={profile.primary_discipline or 'unspecified'}, "
            f"level={profile.experience_level or 'unspecified'}"
        )
    lines.append(f"Current streak: {get_current_streak_days(db, user.id)} days")
    lines.append(f"Average perceived intensity (recent): {round(avg_intensity, 1) if avg_intensity else 'no data'}")

    if recent_sessions:
        lines.append("Last completed sessions (most recent first):")
        for s in recent_sessions:
            result = s.result
            lines.append(
                f"- {s.scheduled_date}: {s.session_template.name} "
                f"({s.session_template.discipline}) — "
                f"{result.rounds_completed if result else 0} rounds, "
                f"{round((result.total_duration_sec if result else 0) / 60, 1)} min, "
                f"intensity {result.perceived_intensity if result and result.perceived_intensity else 'n/a'}/10"
            )
    else:
        lines.append("No completed sessions yet.")

    return "\n".join(lines)


def call_groq(messages: list[dict]) -> str:
    if not settings.groq_api_key:
        raise RuntimeError("GROQ_API_KEY is not configured on the backend")

    response = httpx.post(
        GROQ_CHAT_URL,
        headers={"Authorization": f"Bearer {settings.groq_api_key}"},
        json={"model": settings.groq_model, "messages": messages, "temperature": 0.6},
        timeout=30.0,
    )
    response.raise_for_status()
    data = response.json()
    return data["choices"][0]["message"]["content"]
