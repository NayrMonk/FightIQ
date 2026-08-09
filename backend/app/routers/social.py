from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_role
from app.db.session import get_db
from app.models.session import SessionResult, UserSession
from app.models.social import ActivityEvent, Challenge, ChallengeParticipant, Follow
from app.models.user import User
from app.schemas.social import (
    ActivityEventResponse,
    ChallengeCreateRequest,
    ChallengeDetailResponse,
    ChallengeParticipantEntry,
    ChallengeResponse,
    LeaderboardEntry,
    UserSummary,
)
from app.services.stats import get_current_streak_days

router = APIRouter(prefix="/social", tags=["social"])


def _user_summary(user: User) -> UserSummary:
    return UserSummary(id=user.id, display_name=user.profile.display_name if user.profile else None)


def _following_ids(db: Session, user_id: int) -> list[int]:
    return [
        row[0]
        for row in db.query(Follow.followee_id).filter(Follow.follower_id == user_id).all()
    ]


# --- Follow ---


@router.post("/follow/{user_id}", response_model=UserSummary, status_code=status.HTTP_201_CREATED)
def follow_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot follow yourself")
    target = db.get(User, user_id)
    if target is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    existing = (
        db.query(Follow)
        .filter(Follow.follower_id == current_user.id, Follow.followee_id == user_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already following")
    db.add(Follow(follower_id=current_user.id, followee_id=user_id))
    db.commit()
    return _user_summary(target)


@router.delete("/follow/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def unfollow_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(Follow).filter(
        Follow.follower_id == current_user.id, Follow.followee_id == user_id
    ).delete()
    db.commit()
    return None


@router.get("/followers", response_model=list[UserSummary])
def list_followers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    follower_ids = [row[0] for row in db.query(Follow.follower_id).filter(Follow.followee_id == current_user.id).all()]
    if not follower_ids:
        return []
    users = db.query(User).filter(User.id.in_(follower_ids)).all()
    return [_user_summary(u) for u in users]


@router.get("/following", response_model=list[UserSummary])
def list_following(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    followee_ids = _following_ids(db, current_user.id)
    if not followee_ids:
        return []
    users = db.query(User).filter(User.id.in_(followee_ids)).all()
    return [_user_summary(u) for u in users]


# --- Feed ---


@router.get("/feed", response_model=list[ActivityEventResponse])
def get_feed(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    followee_ids = _following_ids(db, current_user.id)
    if not followee_ids:
        return []
    events = (
        db.query(ActivityEvent)
        .filter(ActivityEvent.user_id.in_(followee_ids))
        .order_by(ActivityEvent.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    users_by_id = {u.id: u for u in db.query(User).filter(User.id.in_({e.user_id for e in events})).all()}
    return [
        ActivityEventResponse(
            id=e.id,
            user=_user_summary(users_by_id[e.user_id]),
            event_type=e.event_type,
            payload=e.payload or {},
            created_at=e.created_at,
        )
        for e in events
    ]


# --- Leaderboard ---


@router.get("/leaderboard", response_model=list[LeaderboardEntry])
def get_leaderboard(
    metric: str = Query("sessions", pattern="^(streak|sessions)$"),
    scope: str = Query("global", pattern="^(global|following)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if scope == "following":
        user_ids = set(_following_ids(db, current_user.id))
        user_ids.add(current_user.id)
    else:
        user_ids = {row[0] for row in db.query(User.id).all()}

    if not user_ids:
        return []

    values: dict[int, float] = {}
    if metric == "sessions":
        rows = (
            db.query(UserSession.user_id, func.count(UserSession.id))
            .filter(UserSession.user_id.in_(user_ids), UserSession.status == "completed")
            .group_by(UserSession.user_id)
            .all()
        )
        values = {uid: float(count) for uid, count in rows}
    else:
        for uid in user_ids:
            streak = get_current_streak_days(db, uid)
            if streak:
                values[uid] = float(streak)

    ranked = sorted(values.items(), key=lambda kv: kv[1], reverse=True)[:20]
    users_by_id = {u.id: u for u in db.query(User).filter(User.id.in_([uid for uid, _ in ranked])).all()}
    return [
        LeaderboardEntry(user=_user_summary(users_by_id[uid]), rank=idx + 1, value=value, metric=metric)
        for idx, (uid, value) in enumerate(ranked)
        if uid in users_by_id
    ]


# --- Challenges ---


def _challenge_value(db: Session, user_id: int, challenge: Challenge) -> float:
    sessions_q = db.query(UserSession).filter(
        UserSession.user_id == user_id,
        UserSession.status == "completed",
        UserSession.scheduled_date >= challenge.start_date,
        UserSession.scheduled_date <= challenge.end_date,
    )
    if challenge.metric == "total_sessions":
        return float(sessions_q.count())
    if challenge.metric == "total_rounds":
        total = (
            db.query(func.coalesce(func.sum(SessionResult.rounds_completed), 0))
            .join(UserSession)
            .filter(
                UserSession.user_id == user_id,
                UserSession.status == "completed",
                UserSession.scheduled_date >= challenge.start_date,
                UserSession.scheduled_date <= challenge.end_date,
            )
            .scalar()
        )
        return float(total or 0)
    # streak_days
    return float(get_current_streak_days(db, user_id))


def _challenge_response(db: Session, challenge: Challenge) -> ChallengeResponse:
    creator = db.get(User, challenge.creator_id)
    participant_count = (
        db.query(func.count(ChallengeParticipant.id))
        .filter(ChallengeParticipant.challenge_id == challenge.id)
        .scalar()
    )
    return ChallengeResponse(
        id=challenge.id,
        title=challenge.title,
        description=challenge.description,
        metric=challenge.metric,
        target_value=challenge.target_value,
        start_date=challenge.start_date,
        end_date=challenge.end_date,
        creator=_user_summary(creator),
        participant_count=participant_count or 0,
    )


@router.post("/challenges", response_model=ChallengeResponse, status_code=status.HTTP_201_CREATED)
def create_challenge(
    payload: ChallengeCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("coach", "admin")),
):
    challenge = Challenge(creator_id=current_user.id, **payload.model_dump())
    db.add(challenge)
    db.commit()
    db.refresh(challenge)
    return _challenge_response(db, challenge)


@router.get("/challenges", response_model=list[ChallengeResponse])
def list_challenges(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    challenges = db.query(Challenge).order_by(Challenge.start_date.desc()).all()
    return [_challenge_response(db, c) for c in challenges]


@router.get("/challenges/{challenge_id}", response_model=ChallengeDetailResponse)
def get_challenge(
    challenge_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    challenge = db.get(Challenge, challenge_id)
    if challenge is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")

    participants = db.query(ChallengeParticipant).filter(ChallengeParticipant.challenge_id == challenge_id).all()
    entries: list[ChallengeParticipantEntry] = []
    for p in participants:
        current_value = _challenge_value(db, p.user_id, challenge)
        if p.completed_at is None and current_value >= challenge.target_value:
            p.completed_at = datetime.now(timezone.utc)
            db.add(p)
        user = db.get(User, p.user_id)
        entries.append(
            ChallengeParticipantEntry(user=_user_summary(user), current_value=current_value, completed_at=p.completed_at)
        )
    db.commit()

    base = _challenge_response(db, challenge)
    return ChallengeDetailResponse(**base.model_dump(), participants=entries)


@router.post("/challenges/{challenge_id}/join", response_model=ChallengeParticipantEntry, status_code=status.HTTP_201_CREATED)
def join_challenge(
    challenge_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    challenge = db.get(Challenge, challenge_id)
    if challenge is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")
    existing = (
        db.query(ChallengeParticipant)
        .filter(ChallengeParticipant.challenge_id == challenge_id, ChallengeParticipant.user_id == current_user.id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already joined")
    participant = ChallengeParticipant(challenge_id=challenge_id, user_id=current_user.id)
    db.add(participant)
    db.commit()
    return ChallengeParticipantEntry(user=_user_summary(current_user), current_value=0.0, completed_at=None)
