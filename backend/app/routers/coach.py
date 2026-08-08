from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.coach import ChatRequest, ChatResponse
from app.services.coach import SYSTEM_PROMPT, build_athlete_context, call_groq

router = APIRouter(prefix="/coach", tags=["coach"])


@router.post("/chat", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    context = build_athlete_context(db, current_user)
    messages = [
        {"role": "system", "content": f"{SYSTEM_PROMPT}\n\n{context}"},
        *[{"role": m.role, "content": m.content} for m in payload.history],
        {"role": "user", "content": payload.message},
    ]

    try:
        reply = call_groq(messages)
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))
    except Exception:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="AI coach is temporarily unavailable")

    return ChatResponse(reply=reply)
