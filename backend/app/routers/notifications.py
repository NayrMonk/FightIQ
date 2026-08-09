from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.notification import Notification, PushToken
from app.models.user import User
from app.schemas.notification import NotificationResponse, RegisterPushTokenRequest

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationResponse])
def list_notifications(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.post("/mark-all-read", status_code=status.HTTP_204_NO_CONTENT)
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id, Notification.read_at.is_(None)
    ).update({"read_at": datetime.now(timezone.utc)})
    db.commit()
    return None


@router.post("/register-token", status_code=status.HTTP_204_NO_CONTENT)
def register_push_token(
    payload: RegisterPushTokenRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = (
        db.query(PushToken)
        .filter(PushToken.user_id == current_user.id, PushToken.expo_push_token == payload.expo_push_token)
        .first()
    )
    if existing:
        existing.updated_at = datetime.now(timezone.utc)
    else:
        db.add(PushToken(user_id=current_user.id, expo_push_token=payload.expo_push_token))
    db.commit()
    return None
