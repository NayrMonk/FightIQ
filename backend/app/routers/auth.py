from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.limiter import limiter
from app.core.security import (
    as_aware_utc,
    create_access_token,
    create_refresh_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.db.session import get_db
from app.models.auth import AuthToken, RefreshToken
from app.models.user import AthleteProfile, User
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    LogoutRequest,
    RefreshRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    VerifyEmailRequest,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def _issue_tokens(db: Session, user: User) -> TokenResponse:
    access_token = create_access_token(str(user.id))
    raw_refresh = create_refresh_token()
    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hash_token(raw_refresh),
            expires_at=datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days),
        )
    )
    db.commit()
    return TokenResponse(access_token=access_token, refresh_token=raw_refresh)


def _issue_auth_token(db: Session, user: User, purpose: str, expires_in: timedelta) -> str:
    raw = create_refresh_token()
    db.add(
        AuthToken(
            user_id=user.id,
            purpose=purpose,
            token_hash=hash_token(raw),
            expires_at=datetime.now(timezone.utc) + expires_in,
        )
    )
    return raw


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def register(request: Request, payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(email=payload.email, hashed_password=hash_password(payload.password))
    db.add(user)
    db.flush()
    db.add(AthleteProfile(user_id=user.id))
    verify_token = _issue_auth_token(db, user, "verify_email", timedelta(days=1))
    db.commit()
    db.refresh(user)
    print(f"[auth] email verification token for {user.email}: {verify_token}")

    return _issue_tokens(db, user)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login(request: Request, payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    return _issue_tokens(db, user)


@router.post("/refresh", response_model=TokenResponse)
@limiter.limit("5/minute")
def refresh(request: Request, payload: RefreshRequest, db: Session = Depends(get_db)):
    token_hash = hash_token(payload.refresh_token)
    stored = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
    now = datetime.now(timezone.utc)
    if not stored or stored.revoked_at is not None or as_aware_utc(stored.expires_at) <= now:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    stored.revoked_at = now
    user = db.get(User, stored.user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return _issue_tokens(db, user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(payload: LogoutRequest, db: Session = Depends(get_db)):
    token_hash = hash_token(payload.refresh_token)
    stored = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
    if stored and stored.revoked_at is None:
        stored.revoked_at = datetime.now(timezone.utc)
        db.commit()
    return None


@router.post("/forgot-password")
@limiter.limit("5/minute")
def forgot_password(request: Request, payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if user:
        raw = _issue_auth_token(db, user, "reset", timedelta(hours=1))
        db.commit()
        print(f"[auth] password reset token for {user.email}: {raw}")
    return {"message": "If that email is registered, a reset link has been sent."}


@router.post("/reset-password", status_code=status.HTTP_204_NO_CONTENT)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    token_hash = hash_token(payload.token)
    now = datetime.now(timezone.utc)
    stored = (
        db.query(AuthToken)
        .filter(AuthToken.token_hash == token_hash, AuthToken.purpose == "reset")
        .first()
    )
    if not stored or stored.used_at is not None or as_aware_utc(stored.expires_at) <= now:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")

    user = db.get(User, stored.user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")

    user.hashed_password = hash_password(payload.new_password)
    stored.used_at = now
    db.query(RefreshToken).filter(
        RefreshToken.user_id == user.id, RefreshToken.revoked_at.is_(None)
    ).update({RefreshToken.revoked_at: now})
    db.commit()
    return None


@router.post("/verify-email", status_code=status.HTTP_204_NO_CONTENT)
def verify_email(payload: VerifyEmailRequest, db: Session = Depends(get_db)):
    token_hash = hash_token(payload.token)
    now = datetime.now(timezone.utc)
    stored = (
        db.query(AuthToken)
        .filter(AuthToken.token_hash == token_hash, AuthToken.purpose == "verify_email")
        .first()
    )
    if not stored or stored.used_at is not None or as_aware_utc(stored.expires_at) <= now:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")

    user = db.get(User, stored.user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")

    user.email_verified_at = now
    stored.used_at = now
    db.commit()
    return None
