"""Seed the database with a demo user and the 'Boxing Fundamentals' programme.

Run after migrations: python -m app.seed.seed
"""
from datetime import date, timedelta

from app.core.security import hash_password
from app.db.session import Base, SessionLocal, engine
from app.models.programme import (
    Exercise,
    Programme,
    ProgrammeWeek,
    Round,
    RoundExercise,
    ScheduledSession,
    SessionTemplate,
)
from app.models.session import SessionResult, UserSession
from app.models.user import AthleteProfile, User

DEMO_EMAIL = "athlete@test.com"
DEMO_PASSWORD = "password123"


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == DEMO_EMAIL).first()
        if existing:
            print(f"Demo user {DEMO_EMAIL} already exists, skipping seed.")
            return

        user = User(email=DEMO_EMAIL, hashed_password=hash_password(DEMO_PASSWORD))
        db.add(user)
        db.flush()
        db.add(
            AthleteProfile(
                user_id=user.id,
                display_name="Alex Rivera",
                weight_class="Welterweight",
                primary_discipline="boxing",
                experience_level="intermediate",
                height_cm=178,
                weight_kg=71.5,
            )
        )

        exercises = {
            name: Exercise(name=name, category=category, description=desc)
            for name, category, desc in [
                ("Shadowboxing", "technique", "Freeform shadowboxing focusing on form and movement."),
                ("Jab-Cross Drill", "combo", "1-2, slip, 1-2 repeated combination."),
                ("Footwork Ladder", "drill", "Lateral and pivot footwork drill."),
                ("Burpee-Punch Combo", "conditioning", "Burpee into a 2-punch combo, repeat."),
                ("Power Cross Drill", "combo", "Rear-hand power cross emphasis combo."),
                ("Plank Hold", "conditioning", "Core stability hold."),
                ("Jump Rope", "conditioning", "Continuous jump rope for conditioning."),
                ("Core Circuit", "conditioning", "Rotating core exercise circuit."),
            ]
        }
        db.add_all(exercises.values())
        db.flush()

        programme = Programme(
            name="Boxing Fundamentals",
            discipline="boxing",
            description="A 4-week beginner-to-intermediate boxing programme covering technique, footwork, power, and conditioning.",
            duration_weeks=4,
            level="beginner",
        )
        db.add(programme)
        db.flush()

        def make_template(name, discipline, duration, intensity, description, rounds_spec):
            template = SessionTemplate(
                programme_id=programme.id,
                name=name,
                discipline=discipline,
                estimated_duration_min=duration,
                intensity=intensity,
                description=description,
            )
            db.add(template)
            db.flush()
            for round_number, (round_type, work_sec, rest_sec, exercise_specs) in enumerate(rounds_spec, start=1):
                round_row = Round(
                    session_template_id=template.id,
                    round_number=round_number,
                    round_type=round_type,
                    work_duration_sec=work_sec,
                    rest_duration_sec=rest_sec,
                )
                db.add(round_row)
                db.flush()
                for order_index, (exercise_name, notes) in enumerate(exercise_specs):
                    db.add(
                        RoundExercise(
                            round_id=round_row.id,
                            exercise_id=exercises[exercise_name].id,
                            order_index=order_index,
                            notes=notes,
                        )
                    )
            return template

        jab_cross = make_template(
            "Jab-Cross Foundations",
            "boxing",
            35,
            "medium",
            "Warm up and drill the core jab-cross combination with a conditioning finisher.",
            [
                ("work", 180, 60, [("Shadowboxing", "Warm-up: loose, relaxed movement")]),
                ("work", 180, 60, [("Jab-Cross Drill", "1-2, slip, 1-2")]),
                ("work", 180, 60, [("Footwork Ladder", "Lateral steps between combos")]),
                ("conditioning", 120, 30, [("Burpee-Punch Combo", "Max effort finisher")]),
            ],
        )

        footwork = make_template(
            "Footwork & Combinations",
            "boxing",
            40,
            "medium",
            "Footwork-focused session layering combinations on top of lateral movement.",
            [
                ("work", 180, 60, [("Footwork Ladder", "Focus on pivots")]),
                ("work", 180, 60, [("Jab-Cross Drill", "Add lateral step after each combo")]),
                ("work", 180, 60, [("Power Cross Drill", "Full hip rotation on cross")]),
                ("work", 180, 60, [("Shadowboxing", "Combine footwork with combos")]),
                ("conditioning", 120, 30, [("Jump Rope", "Steady pace")]),
            ],
        )

        power = make_template(
            "Power Punching Circuit",
            "boxing",
            45,
            "high",
            "High-intensity circuit emphasizing power output on every round.",
            [
                ("work", 180, 45, [("Power Cross Drill", "Max power, controlled form")]),
                ("work", 180, 45, [("Jab-Cross Drill", "Speed and power combo")]),
                ("work", 180, 45, [("Power Cross Drill", "Combos to the body")]),
                ("work", 180, 45, [("Footwork Ladder", "Explosive direction changes")]),
                ("work", 180, 45, [("Shadowboxing", "Sustain intensity")]),
                ("conditioning", 120, 30, [("Burpee-Punch Combo", "All-out finisher")]),
            ],
        )

        conditioning = make_template(
            "Conditioning & Core",
            "general_fitness",
            30,
            "medium",
            "General conditioning and core session to round out the training week.",
            [
                ("conditioning", 90, 30, [("Jump Rope", "Steady pace")]),
                ("conditioning", 90, 30, [("Core Circuit", "Rotate through exercises")]),
                ("conditioning", 90, 30, [("Plank Hold", "Maintain neutral spine")]),
                ("conditioning", 90, 30, [("Burpee-Punch Combo", "Finisher")]),
            ],
        )

        # day_of_week: 0=Mon .. 6=Sun. Same weekly pattern across all 4 weeks.
        day_template_pattern = [(0, jab_cross), (2, footwork), (4, power), (5, conditioning)]

        weeks = []
        for week_number in range(1, programme.duration_weeks + 1):
            week = ProgrammeWeek(programme_id=programme.id, week_number=week_number)
            db.add(week)
            db.flush()
            weeks.append(week)
            for day_of_week, template in day_template_pattern:
                db.add(
                    ScheduledSession(
                        programme_week_id=week.id,
                        day_of_week=day_of_week,
                        session_template_id=template.id,
                    )
                )
        db.flush()

        # Backdate ~2 weeks of completed sessions (Mon/Wed/Fri/Sat) so analytics/history aren't empty.
        today = date.today()
        week_start = today - timedelta(days=today.weekday())
        for weeks_ago in range(2, 0, -1):
            base = week_start - timedelta(weeks=weeks_ago)
            for day_offset, template, rounds_completed, intensity in [
                (0, jab_cross, 4, 6),
                (2, footwork, 5, 7),
                (4, power, 6, 8),
                (5, conditioning, 4, 5),
            ]:
                session_date = base + timedelta(days=day_offset)
                if session_date >= today:
                    continue
                user_session = UserSession(
                    user_id=user.id,
                    session_template_id=template.id,
                    scheduled_date=session_date,
                    status="completed",
                )
                db.add(user_session)
                db.flush()
                db.add(
                    SessionResult(
                        user_session_id=user_session.id,
                        rounds_completed=rounds_completed,
                        total_duration_sec=template.estimated_duration_min * 60,
                        perceived_intensity=intensity,
                    )
                )

        # Today's scheduled session (pending) so /sessions/today and the dashboard have data immediately.
        today_weekday = today.weekday()
        todays_template = next((t for d, t in day_template_pattern if d == today_weekday), jab_cross)
        db.add(
            UserSession(
                user_id=user.id,
                session_template_id=todays_template.id,
                scheduled_date=today,
                status="pending",
            )
        )

        db.commit()
        print(f"Seed complete. Demo login: {DEMO_EMAIL} / {DEMO_PASSWORD}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
