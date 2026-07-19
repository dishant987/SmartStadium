# StadiumSense — FIFA World Cup 2026 Fan Companion

GenAI-enabled stadium operations platform. Built for the FIFA World Cup 2026 challenge.

---

## Problem Statement Alignment

| Requirement | Implementation | How to Verify |
|---|---|---|
| **Navigation** | `backend/app/services/nav_service.py` + `frontend/src/pages/WayfindingPage.tsx` | Visit `/wayfinding`, select zones, get BFS-based route with accessibility option |
| **Crowd Management** | `frontend/src/hooks/useCrowdDensity.ts` + `frontend/src/components/dashboard/CrowdDensityWidget.tsx` | Dashboard shows live venue density heatmap via polling |
| **Accessibility** | `backend/app/services/accessibility_service.py` + `frontend/src/components/accessibility/AccessibilityPanel.tsx` | Landing page `/` (accessible without login) has large-text toggle, live elevator status simulation, and AI-optimized route generation avoiding obstacles/crowds |
| **Transportation** | `frontend/src/components/transport/TransitWidget.tsx` + `backend/app/controllers/transport_controller.py` | See transit schedule and shuttle status widget on dashboard |
| **Sustainability** | `frontend/src/components/sustainability/SustainabilityWidget.tsx` + `backend/app/controllers/sustainability_controller.py` | Carbon tip and eco-stations displayed in sustainability card |
| **Multilingual Assistance** | Chat LLM prompt instructs multilingual response + `backend/app/services/pa_service.py` | Ask the chat assistant in Spanish, French, or Hindi — it responds in the same language. PA system broadcasts are translated instantly into 6 languages |
| **Operational Intelligence** | `frontend/src/components/dashboard/IncidentFeed.tsx` + `frontend/src/components/dashboard/DecisionSupportPanel.tsx` | Dashboard shows live incident feed and AI-generated recommendations |
| **Real-time Decision Support** | `frontend/src/hooks/useRecommendations.ts` + streaming LLM in chat | Recommendations update as incident/crowd state changes; chat streams responses token-by-token |

---

## Key Features & Enhancements

### 1. AI-Powered Accessibility & Elevator Status
* **Real-time Monitoring**: Publicly accessible real-time elevator status tracking and ramp availability directly on the landing page (no login required).
* **Dynamic Simulation**: Simulates elevator outages and crowd path blockages using a seed-based Random Number Generator (`accessibility_service.py`).
* **AI Routing**: Custom AI-optimized route generation that dynamically adapts to avoid crowds and out-of-service elevators, summarizing routing instructions with LLM intelligence.

### 2. PA Announcement TTS & Cloudinary Media Storage
* **Automatic Uploads**: Generated text-to-speech `.mp3` translation audios are uploaded asynchronously to Cloudinary using a thread-safe implementation.
* **Resilient Fallback**: Fallback logic automatically serves files locally from `tts_output/` when Cloudinary credentials are absent or network requests fail.
* **Endpoints**: Supports direct Cloudinary URL serving via the API payload (`tts_urls` object) or local stream endpoints (`/api/pa/tts/{ann_id}/{lang}`).

### 3. Dynamic CORS Configuration
* **Configurable Origins**: Supports dynamic CORS origins configuration using the `CORS_ORIGINS` environment variable (comma-separated list), enabling flexible deployment.

### 4. Interactive Chat & Token Streaming
* **Zero Flickering UI**: Chat messages maintain persistent history state preventing UI jumps and flickering during streaming.
* **Format-rich Rendering**: Renders responses using React Markdown for rich typography.
* **Unbuffered Streaming**: Backend rate-limiting and logging middleware are configured to allow Server-Sent Events (SSE) to stream unbuffered to the client.

---

## Architecture

```
frontend/  — React + TypeScript + Vite + Tailwind CSS
  ├── src/
  │   ├── components/   (ui, chat, dashboard, evacuation, navigation, transport, sustainability, accessibility)
  │   ├── hooks/        (TanStack Query data fetching, state hooks)
  │   ├── pages/        (route pages: Landing, Wayfinding, Evacuation, etc.)
  │   ├── services/     (API client layer with fetch wrapper)
  │   ├── context/      (Auth, Theme, Toast)
  │   └── store/        (Zustand UI state)
  └── ...

backend/   — FastAPI + SQLAlchemy + ChromaDB + SQLite/Neon
  ├── app/
  │   ├── controllers/  (thin route handlers — MVC boundary enforced)
  │   ├── services/     (business logic: LLM routing, accessibility, PA TTS, RAG)
  │   ├── models/       (SQLAlchemy ORM models)
  │   ├── schemas/      (Pydantic request/response validation)
  │   ├── middleware/   (auth, error handling, rate limiting, logging)
  │   └── db/           (session, Chroma client)
  └── ...
```

---

## Quick Start

### Backend

1. Navigate to the backend directory and set up a virtual environment. We recommend **uv** for extremely fast dependency installation, but you can also use standard **pip**:

   **Using uv (Recommended):**
   ```bash
   cd backend
   uv venv
   .venv\Scripts\activate          # Windows
   # source .venv/bin/activate    # macOS/Linux
   uv pip install -r requirements.txt
   ```

   **Using standard pip:**
   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\activate          # Windows
   # source .venv/bin/activate    # macOS/Linux
   pip install -r requirements.txt
   ```

2. Configure environment variables in `backend/.env` (copying from `.env.example`):
   ```ini
   NEON_DATABASE_URL=sqlite:///./stadiumsense.db
   CORS_ORIGINS=http://localhost:5173,http://localhost:4173
   JWT_SECRET=your-random-secret
   
   # Optional API keys for AI Router
   GROQ_API_KEY=
   GEMINI_API_KEY=
   MISTRAL_API_KEY=
   
   # Optional Cloudinary Configuration for TTS
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   ```

3. Run the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```

2. Set up environment variables in `frontend/.env`:
   ```ini
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Testing

### Backend Tests
Execute Python tests inside the `backend` folder:
```bash
pytest -v
```
Tests cover:
* **Unit**: LLM router failover (mocked provider failures), RAG retrieval, custom error handlers.
* **Integration**: `/api/chat`, `/api/chat/stream`, `/api/ops/incidents` against a test database.
* **Services**: PA service translation templates and accessibility routing.

### Frontend Tests
Execute component tests inside the `frontend` folder:
```bash
npm run test
```
Tests cover:
* **Components**: Buttons, Modals, Toast, and ChatWidget send/stream/delete flows.

---

## Key Design Decisions

* **LLM Router** (`llm_router_service.py`): Attempts Groq → Gemini → Mistral sequentially. Integrates a mock provider when API keys are omitted.
* **RAG** (`rag_service.py`): ChromaDB vector store with `top_k=3`. Degrades gracefully when Chroma is unconfigured.
* **Rate Limiting** (`rate_limit.py`): In-memory per-IP token bucket limits request volume on `/api/chat` and `/api/auth/login`.
* **Clean Architecture**: Strong boundary between controllers and services. Controllers only handle HTTP concerns.
* **Accessibility Compliance**: Focus trap inside Modals, `aria-live` regions for live assistant streams, and `aria-label` elements on interactive components.
* **Media Delivery**: Decoupled media storage using Cloudinary with thread-safe uploads and local file fallback mechanism for maximum reliability.
