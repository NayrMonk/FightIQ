from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import require_role
from app.db.session import get_db
from app.models.user import User
from app.schemas.admin import AdminUserResponse

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[AdminUserResponse])
def list_users(
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    return db.query(User).order_by(User.id).all()
