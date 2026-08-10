# FightIQ

> A mobile-first combat sports training platform for athletes — built with Expo (React Native) + FastAPI + PostgreSQL.

FightIQ gives fighters a structured way to track training, follow curated programmes, complete timed workout sessions, and chat with an AI coach powered by Groq. The app is built around a clean mobile UX with dark-themed screens, onboarding flows, analytics dashboards, and real-time workout timers.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Mobile Setup](#2-mobile-setup)
- [Environment Variables](#environment-variables)
- [Demo Account](#demo-account)
- [Running Tests](#running-tests)
- [Roadmap](#roadmap)

---

## Features

### 🥊 Athlete Experience
- **Auth** — Register and login with JWT-based authentication
- **Onboarding** — Select combat sports interests → set training goals → welcome summary + 3-step tutorial carousel
- **Home Dashboard** — Today's scheduled sessions, recent activity, quick stats
- **Training Programmes** — Browse and start structured multi-week combat sports programmes (Boxing, MMA, etc.)
- **Active Workout Timer** — Round-by-round timer with haptic feedback and audio cues
- **Training History** — Log of all completed sessions with dates and duration
- **Performance Analytics** — Weekly/monthly summaries, personal records, charts
- **AI Coach** — Chat interface powered by Groq (llama-3.3-70b) with athlete context
- **Profile** — View and edit athlete profile (weight class, discipline, experience level, etc.)
- **Notifications** — In-app notification feed
- **Settings** — App preferences, reachable from the profile tab

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Framework | FastAPI 0.115 |
| Database | PostgreSQL 18 |
| ORM | SQLAlchemy 2.0 |
| Migrations | Alembic |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| AI Coach | Groq API (llama-3.3-70b-versatile) |
| Server | Uvicorn |

### Mobile
| Layer | Technology |
|---|---|
| Framework | Expo SDK 54 (React Native 0.81) |
| Language | TypeScript |
| Routing | Expo Router v6 (file-based) |
| Styling | NativeWind v4 (Tailwind for RN) |
| State | Zustand |
| Server State | TanStack Query v5 |
| Charts | react-native-gifted-charts |
| Storage | Expo SecureStore + AsyncStorage |
| Haptics | expo-haptics |
| Audio | expo-audio |
| Icons | @expo/vector-icons |

---

## Project Structure

```
FightIQ/
├── backend/
│   ├── app/
│   │   ├── core/           # Config, security, dependencies
│   │   ├── db/             # SQLAlchemy session & base
│   │   ├── models/         # ORM models (User, Programme, Session, etc.)
│   │   ├── routers/        # API route handlers
│   │   ├── schemas/        # Pydantic request/response schemas
│   │   ├── seed/           # Demo data seed script
│   │   └── main.py         # FastAPI app entry point
│   ├── alembic/            # Database migrations
│   ├── tests/              # Pytest test suite
│   ├── requirements.txt
│   └── .env.example
│
└── mobile/
    ├── app/
    │   ├── (tabs)/         # Bottom tab screens
    │   │   ├── index.tsx       # Home dashboard
    │   │   ├── programmes.tsx  # Training programmes list
    │   │   ├── coach.tsx       # AI coach chat
    │   │   ├── history.tsx     # Training history
    │   │   └── profile.tsx     # Athlete profile
    │   ├── onboarding/     # Post-signup onboarding flow
    │   │   ├── select-interests.tsx
    │   │   ├── training-goals.tsx
    │   │   ├── tutorial-tracking.tsx
    │   │   ├── tutorial-ai-coach.tsx
    │   │   ├── tutorial-analytics.tsx
    │   │   └── welcome-summary.tsx
    │   ├── session/        # Active workout screens
    │   ├── programme/      # Programme detail screens
    │   ├── login.tsx
    │   ├── register.tsx
    │   ├── analytics.tsx
    │   ├── notifications.tsx
    │   └── settings.tsx
    ├── src/
    │   ├── api/            # API client + TanStack Query hooks
    │   ├── components/     # Reusable UI components
    │   ├── stores/         # Zustand stores (auth, etc.)
    │   └── types/          # Shared TypeScript types
    └── package.json
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a new athlete |
| `POST` | `/auth/login` | Login and receive JWT |
| `GET` | `/profile/me` | Get current athlete's profile |
| `PUT` | `/profile/me` | Update athlete profile |
| `GET` | `/dashboard` | Today's schedule + stats |
| `GET` | `/programmes` | List all training programmes |
| `GET` | `/programmes/{id}` | Get programme detail |
| `GET` | `/session-templates/{id}` | Get session template |
| `POST` | `/sessions` | Start a new session |
| `GET` | `/sessions/{id}` | Get session detail |
| `POST` | `/sessions/{id}/complete` | Complete a session |
| `GET` | `/history` | List completed sessions |
| `GET` | `/analytics/summary` | Weekly/monthly stats |
| `GET` | `/analytics/personal-records` | Personal records |
| `POST` | `/coach/chat` | Chat with AI coach |
| `GET` | `/health` | Health check |

> 📖 Interactive Swagger docs available at **http://localhost:8000/docs** when the backend is running.

---

## Getting Started

### Prerequisites

- **Python 3.12+** (3.14 not yet supported — some wheels are missing)
- **PostgreSQL 15+** (tested on PostgreSQL 18)
- **Node.js 18+**
- **Expo Go** app on your phone (iOS or Android), or an iOS/Android simulator
- Both your PC and phone must be on the **same Wi-Fi network**

---

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
py -3.12 -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment variables
copy .env.example .env
# Edit .env — set your DATABASE_URL and a strong JWT_SECRET
```

**Create the database:**
```bash
psql -U postgres -c "CREATE DATABASE fightiq;"
```

**Run migrations:**
```bash
python -m alembic upgrade head
```

**Seed demo data:**
```bash
python -m app.seed.seed
```

**Start the API server:**
```bash
# Development (with auto-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or using the venv directly on Windows
venv\Scripts\uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

### 2. Mobile Setup

```bash
cd mobile
npm install
```

**Create `mobile/.env`:**

> ⚠️ Use your machine's **LAN IP address** (not `localhost`). Expo Go runs on your phone on a separate network namespace and cannot reach `localhost` on your PC.

Find your LAN IP:
- **Windows:** `ipconfig` → look for IPv4 Address under your Wi-Fi adapter (e.g. `192.168.1.x`)
- **macOS/Linux:** `ifconfig` or `ip addr`

```
EXPO_PUBLIC_API_URL=http://<your-lan-ip>:8000
```

Example:
```
EXPO_PUBLIC_API_URL=http://192.168.18.17:8000
```

**Start the Expo dev server:**
```bash
npx expo start
```

- Scan the QR code with **Expo Go** on your phone
- Press `a` to open on Android emulator
- Press `i` to open on iOS simulator

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/fightiq` | PostgreSQL connection string |
| `JWT_SECRET` | *(required)* | Secret key for signing JWT tokens |
| `JWT_ALGORITHM` | `HS256` | JWT signing algorithm |
| `JWT_EXPIRE_MINUTES` | `10080` | Token expiry (7 days) |
| `GROQ_API_KEY` | *(optional)* | Groq API key for the AI coach feature |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Groq model to use |

### Mobile (`mobile/.env`)

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_API_URL` | Full base URL of the backend API (e.g. `http://192.168.1.5:8000`) |

---

## Demo Account

The seed script (`python -m app.seed.seed`) creates a demo athlete pre-loaded with training programmes and session history:

```
Email:    athlete@test.com
Password: password123
```

---

## Running Tests

### Backend

```bash
cd backend
venv\Scripts\activate
pip install -r requirements-dev.txt
pytest
```

The backend test suite uses an **in-memory SQLite** database — no PostgreSQL needed for testing.

### Mobile

```bash
cd mobile
npm test
```
Video 1:


https://github.com/user-attachments/assets/6c019474-a59b-404d-bb2f-37c5798483fb






Video 2:




https://github.com/user-attachments/assets/c3913ffb-d64a-4e1f-acbf-2c7baa29b6d6






---

## Roadmap

- [ ] **Social features** — follow athletes, share sessions, leaderboards
- [ ] **Push notifications** — workout reminders, PR alerts
- [ ] **Coach memory** — persist AI coach conversation history per athlete
- [ ] **Custom programmes** — athlete-built training plans
- [ ] **Video technique library** — exercise demonstration videos
- [ ] **Wearable integration** — heart rate, round tracking from smartwatches
