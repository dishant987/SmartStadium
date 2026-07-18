# StadiumSense — FIFA World Cup 2026 Fan Companion

GenAI-enabled stadium operations platform. Built for the FIFA World Cup 2026 challenge.

---

## Problem Statement Alignment

| Requirement | Implementation | How to Verify |
|---|---|---|
| **Navigation** | `backend/app/services/nav_service.py` + `frontend/src/pages/WayfindingPage.tsx` | Visit `/wayfinding`, select zones, get BFS-based route with accessibility option |
| **Crowd Management** | `frontend/src/hooks/useCrowdDensity.ts` + `frontend/src/components/dashboard/CrowdDensityWidget.tsx` | Dashboard at `/chat` shows live venue density heatmap via polling |
| **Accessibility** | `frontend/src/components/accessibility/AccessibilityPanel.tsx` + accessible routes in NavService | Landing page has large-text toggle; wayfinding includes wheelchair-accessible ramps |
| **Transportation** | `frontend/src/components/transport/TransitWidget.tsx` + `backend/app/controllers/transport_controller.py` | See transit schedule and shuttle status widget on dashboard |
| **Sustainability** | `frontend/src/components/sustainability/SustainabilityWidget.tsx` + `backend/app/controllers/sustainability_controller.py` | Carbon tip and eco-stations displayed in sustainability card |
| **Multilingual Assistance** | Chat LLM prompt instructs multilingual response + `backend/app/services/pa_service.py` has translation templates | Ask the chat assistant in Spanish, French, or Hindi — it responds in the same language |
| **Operational Intelligence** | `frontend/src/components/dashboard/IncidentFeed.tsx` + `frontend/src/components/dashboard/DecisionSupportPanel.tsx` | Dashboard shows live incident feed and AI-generated recommendations |
| **Real-time Decision Support** | `frontend/src/hooks/useRecommendations.ts` + streaming LLM in chat | Recommendations update as incident/crowd state changes; chat streams responses token-by-token |

---

## Architecture

```
frontend/  — React + TypeScript + Vite + Tailwind CSS
  ├── src/
  │   ├── components/   (ui, chat, dashboard, evacuation, navigation, transport, sustainability)
  │   ├── hooks/        (TanStack Query data fetching)
  │   ├── pages/        (route pages)
  │   ├── services/     (API client layer)
  │   ├── context/      (Auth, Theme, Toast)
  │   └── store/        (Zustand UI state)
  └── ...

backend/   — FastAPI + SQLAlchemy + ChromaDB + SQLite/Neon
  ├── app/
  │   ├── controllers/  (thin route handlers — MVC boundary enforced)
  │   ├── services/     (business logic, LLM routing, RAG)
  │   ├── models/       (SQLAlchemy ORM models)
  │   ├── schemas/      (Pydantic request/response validation)
  │   ├── middleware/    (auth, error handling, rate limiting, logging)
  │   └── db/           (session, Chroma client)
  └── ...
```

---

## Quick Start

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate    # Windows
pip install -r requirements.txt
cp .env.example .env       # fill in API keys (optional — mock mode works without keys)
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env       # VITE_API_BASE_URL=http://localhost:8000/api
npm run dev
```

Open http://localhost:5173

---

## Testing

### Backend Tests

```bash
cd backend
pytest -v
```

Tests cover:
- **Unit**: LLM router failover (mocked provider failures), RAG retrieval, error handler mapping (`backend/tests/`)
- **Integration**: `/api/chat`, `/api/chat/stream`, `/api/ops/incidents` against a test database

### Frontend Tests

```bash
cd frontend
npm run test
```

Tests cover:
- **Component**: Button, Modal, Toast, ChatWidget send/stream/delete flows
- **No E2E yet**: Playwright smoke test planned for `chat → send → stream → delete` flow

### Test Requirements

- Backend: `pytest`, `httpx`, `pytest-asyncio` (see `requirements.txt`)
- Frontend: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` (see `devDependencies`)

---

## Key Design Decisions

- **LLM Router** (`llm_router_service.py`): Tries Groq → Gemini → Mistral in order. Falls through on failure. Mock provider active when no API keys are set so the demo always works.
- **RAG** (`rag_service.py`): ChromaDB vector store with `top_k=3`. Degrades gracefully (empty context) when Chroma is not configured.
- **Rate Limiting** (`rate_limit.py`): In-memory per-IP, 30 req/min on `/api/chat` and `/api/auth/login`.
- **MVC**: Controllers delegate to services. No DB queries or LLM calls in controllers.
- **Accessibility**: Focus trap in Modal, `aria-live` on chat, `aria-label` on all icon buttons, keyboard-navigable chat sessions.

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, React Router, Zustand, react-markdown
- **Backend**: FastAPI, SQLAlchemy, Alembic, Pydantic, ChromaDB, httpx
- **Auth**: JWT (PyJWT + bcrypt)
- **LLM Providers**: Groq (Llama 3.3 70B), Gemini 2.0 Flash, Mistral Large
- **Database**: SQLite (dev) / Neon PostgreSQL (production)
- **Infrastructure**: Vercel (frontend), Railway/Fly.io (backend)
