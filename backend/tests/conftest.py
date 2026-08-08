from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401 -- registers all models on Base.metadata
from app.db.session import Base, get_db
from app.main import app as fastapi_app
from app.models.programme import Exercise, Programme, Round, RoundExercise, SessionTemplate


@pytest.fixture()
def db_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    fastapi_app.dependency_overrides[get_db] = override_get_db

    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        fastapi_app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db_session):
    with TestClient(fastapi_app) as c:
        yield c


def register_user(client: TestClient, email: str = "athlete@test.com", password: str = "password123") -> str:
    res = client.post("/auth/register", json={"email": email, "password": password})
    assert res.status_code == 201, res.text
    return res.json()["access_token"]


def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def auth_client(client):
    """A TestClient plus a bearer token for a freshly registered user."""
    token = register_user(client)
    return client, auth_headers(token)


@pytest.fixture()
def session_template(db_session):
    """A minimal programme -> session template -> round -> exercise chain for session-flow tests."""
    programme = Programme(name="Boxing Fundamentals", discipline="boxing", duration_weeks=1, level="beginner")
    db_session.add(programme)
    db_session.flush()

    template = SessionTemplate(
        programme_id=programme.id,
        name="Jab-Cross Foundations",
        discipline="boxing",
        estimated_duration_min=20,
        intensity="medium",
    )
    db_session.add(template)
    db_session.flush()

    exercise = Exercise(name="Shadowboxing", category="technique")
    db_session.add(exercise)
    db_session.flush()

    for round_number in range(1, 3):
        round_row = Round(
            session_template_id=template.id,
            round_number=round_number,
            round_type="work",
            work_duration_sec=180,
            rest_duration_sec=60,
        )
        db_session.add(round_row)
        db_session.flush()
        db_session.add(RoundExercise(round_id=round_row.id, exercise_id=exercise.id, order_index=0))

    db_session.commit()
    db_session.refresh(template)
    return template


@pytest.fixture()
def today_iso() -> str:
    return date.today().isoformat()


@pytest.fixture()
def yesterday_iso() -> str:
    return (date.today() - timedelta(days=1)).isoformat()
