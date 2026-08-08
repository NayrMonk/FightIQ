from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.session import PersonalRecord, SessionResult, UserSession
from app.models.user import User
from app.schemas.session import (
    CompleteSessionRequest,
    CompleteSessionResponse,
    PersonalRecordResponse,
    StartSessionRequest,
    UpdateSessionStatusRequest,
    UserSessionDetailResponse,
    UserSessionResponse,
)
from app.services.stats import get_current_streak_days

router = APIRouter(prefix="/sessions", tags=["sessions"])


def _load(query):
    return query.options(
        joinedload(UserSession.session_template),
        joinedload(UserSession.result),
    )


@router.get("/today", response_model=UserSessionDetailResponse | None)
def get_today_session(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session_row = _load(
        db.query(UserSession).filter(
            UserSession.user_id == current_user.id,
            UserSession.scheduled_date == date.today(),
        )
    ).first()
    return session_row


@router.get("/{user_session_id}", response_model=UserSessionDetailResponse)
def get_session(
    user_session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_session = _load(db.query(UserSession).filter(UserSession.id == user_session_id)).first()
    if not user_session or user_session.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return user_session


@router.post("", response_model=UserSessionResponse, status_code=status.HTTP_201_CREATED)
def start_session(
    payload: StartSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = (
        db.query(UserSession)
        .filter(
            UserSession.user_id == current_user.id,
            UserSession.scheduled_date == payload.scheduled_date,
            UserSession.session_template_id == payload.session_template_id,
        )
        .first()
    )
    if existing:
        user_session = existing
    else:
        user_session = UserSession(
            user_id=current_user.id,
            session_template_id=payload.session_template_id,
            scheduled_date=payload.scheduled_date,
        )
        db.add(user_session)

    user_session.status = "in_progress"
    user_session.started_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user_session)
    return user_session


@router.patch("/{user_session_id}", response_model=UserSessionResponse)
def update_session_status(
    user_session_id: int,
    payload: UpdateSessionStatusRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_session = db.get(UserSession, user_session_id)
    if not user_session or user_session.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    user_session.status = payload.status
    db.commit()
    db.refresh(user_session)
    return user_session


@router.post("/{user_session_id}/complete", response_model=CompleteSessionResponse)
def complete_session(
    user_session_id: int,
    payload: CompleteSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_session = db.get(UserSession, user_session_id)
    if not user_session or user_session.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    user_session.status = "completed"
    user_session.completed_at = datetime.now(timezone.utc)

    result = db.query(SessionResult).filter(SessionResult.user_session_id == user_session.id).first()
    if result is None:
        result = SessionResult(user_session_id=user_session.id)
        db.add(result)
    result.rounds_completed = payload.rounds_completed
    result.total_duration_sec = payload.total_duration_sec
    result.perceived_intensity = payload.perceived_intensity
    result.notes = payload.notes
    db.commit()

    new_records: list[PersonalRecord] = []

    max_rounds = db.query(func.max(SessionResult.rounds_completed)).filter(
        SessionResult.user_session_id.in_(
            db.query(UserSession.id).filter(UserSession.user_id == current_user.id)
        )
    ).scalar() or 0
    if payload.rounds_completed >= max_rounds and payload.rounds_completed > 0:
        pr = PersonalRecord(
            user_id=current_user.id,
            record_type="most_rounds_session",
            value=payload.rounds_completed,
            user_session_id=user_session.id,
        )
        db.add(pr)
        new_records.append(pr)

    streak = get_current_streak_days(db, current_user.id)
    longest_streak_pr = (
        db.query(PersonalRecord)
        .filter(PersonalRecord.user_id == current_user.id, PersonalRecord.record_type == "longest_streak")
        .order_by(PersonalRecord.value.desc())
        .first()
    )
    if streak > (longest_streak_pr.value if longest_streak_pr else 0):
        pr = PersonalRecord(
            user_id=current_user.id,
            record_type="longest_streak",
            value=streak,
            user_session_id=user_session.id,
        )
        db.add(pr)
        new_records.append(pr)

    db.commit()
    db.refresh(user_session)
    for pr in new_records:
        db.refresh(pr)

    return CompleteSessionResponse(
        session=user_session,
        new_personal_records=[PersonalRecordResponse.model_validate(pr) for pr in new_records],
    )
