from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.limiter import limiter
from app.routers import admin, analytics, auth, coach, dashboard, history, notifications, profile, programmes, sessions, social
from app.services.scheduler import start_scheduler

app = FastAPI(title="FightIQ API", version="0.1.0")


@app.on_event("startup")
def _on_startup():
    start_scheduler()

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(profile.router)
app.include_router(programmes.router)
app.include_router(sessions.router)
app.include_router(history.router)
app.include_router(analytics.router)
app.include_router(dashboard.router)
app.include_router(coach.router)
app.include_router(social.router)
app.include_router(notifications.router)


@app.get("/health")
def health():
    return {"status": "ok"}
