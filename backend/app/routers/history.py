from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.session import UserSession
from app.models.user import User
from app.schemas.session import UserSessionResponse

router = APIRouter(prefix="/history", tags=["history"])


@router.get("", response_model=list[UserSessionResponse])
def get_history(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(UserSession)
        .options(joinedload(UserSession.session_template), joinedload(UserSession.result))
        .filter(UserSession.user_id == current_user.id, UserSession.status == "completed")
        .order_by(UserSession.scheduled_date.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
