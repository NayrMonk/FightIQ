from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.programme import Programme, SessionTemplate
from app.schemas.programme import ProgrammeDetail, ProgrammeSummary, SessionTemplateDetail

router = APIRouter(tags=["programmes"])


@router.get("/programmes", response_model=list[ProgrammeSummary])
def list_programmes(
    discipline: str | None = None,
    level: str | None = None,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    query = db.query(Programme)
    if discipline:
        query = query.filter(Programme.discipline == discipline)
    if level:
        query = query.filter(Programme.level == level)
    return query.all()


@router.get("/programmes/{programme_id}", response_model=ProgrammeDetail)
def get_programme(
    programme_id: int,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    programme = (
        db.query(Programme)
        .options(joinedload(Programme.weeks))
        .filter(Programme.id == programme_id)
        .first()
    )
    if not programme:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Programme not found")
    return programme


@router.get("/session-templates/{session_template_id}", response_model=SessionTemplateDetail)
def get_session_template(
    session_template_id: int,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
):
    template = db.get(SessionTemplate, session_template_id)
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session template not found")
    return template
