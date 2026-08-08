# FightIQ

Mobile-first combat sports training platform. This repo currently contains **Phase 1 (Athlete Experience)**: auth, athlete profile, home dashboard, training programmes, the workout/timer session flow, training history, and basic analytics. No AI coach or social features yet.

## Structure

- `backend/` — FastAPI + PostgreSQL API
- `mobile/` — Expo (React Native + TypeScript) app

## Running locally

### 1. Backend

Requires a local PostgreSQL instance and Python 3.12+ (Python 3.14 does not yet have prebuilt wheels for some dependencies).

```bash
cd backend
py -3.12 -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
copy .env.example .env         # then edit DATABASE_URL / JWT_SECRET as needed
```

Create the database (one time):

```bash
psql -U postgres -c "CREATE DATABASE fightiq;"
```

Run migrations and seed demo data:

```bash
alembic upgrade head
python -m app.seed.seed
```

Start the API:

```bash
uvicorn app.main:app --reload
```

Swagger docs: http://localhost:8000/docs

Demo login (created by the seed script): `athlete@test.com` / `password123`

### 2. Mobile

```bash
cd mobile
npm install
```

Set the API URL to your machine's LAN IP (not `localhost` — Expo Go runs on a physical device/simulator on its own network namespace). Create `mobile/.env`:

```
EXPO_PUBLIC_API_URL=http://<your-lan-ip>:8000
```

Start the app:

```bash
npx expo start
```

Scan the QR code in Expo Go, or press `i`/`a` for iOS/Android simulator.

## Notes

- No Docker — both apps run directly via local Python/Node tooling.
- No AI coach in this phase; a future pass will add it (planned provider: Groq).
