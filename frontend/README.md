# LapLens Frontend

Next.js 14 (App Router) TypeScript UI that consumes the LapLens backend for race-strategy visualisation.

---

## Features
- Shared header with navigation between Dashboard, Driver HUD, Post-Race, and Home.
- Dashboard shows current prediction with access to the simulation modal (pit now/+1/+2 scenarios, risk badges).
- Driver HUD streams live alerts via WebSocket (priority queue, readable overlay).
- Post-Race view renders lap tables and summary placeholder.
- API helper (`app/utils/api.ts`) targets `http://localhost:8000` unless overridden.

---

## Local Development
```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

The following routes are available:
- `/` – simple welcome page with navigation.
- `/dashboard` – engineer strategy panel and simulation modal.
- `/driver` – HUD alerts view; listens for `/ws/live_feed` events.
- `/postrace` – lap table and narrative placeholder.

---

## Backend Dependency
- By default, API calls go to `http://localhost:8000`.
- To point elsewhere, create `.env.local` with `NEXT_PUBLIC_API_BASE=https://my-backend.example`.
- Ensure the backend is running *before* the frontend to avoid fetch errors.

---

## Working with Synthetic Demo Data
1. Start backend in another terminal:
	```powershell
	cd ..\backend
	.\.venv\Scripts\Activate.ps1
	uvicorn app.main:app --reload
	```
2. Seed demo telemetry:
	```powershell
	curl "http://127.0.0.1:8000/start_demo/demo-session?speed=8&laps=20"
	```
3. Visit `/dashboard`, `/driver`, `/postrace`. They will use `demo-session` data transparently (prediction polling, modal simulation, lap alerts).

---

## Working with Real Telemetry
- Upload CSV: `curl -F "file=@path/to/telemetry.csv" http://127.0.0.1:8000/upload_telemetry`.
- Use returned `session_id` in front-end components by adjusting initial session context (e.g. pass via query param or update default ID in components).
- Prediction/simulation/UI flows stay the same; they simply operate on your uploaded session.

---

## Testing
- ESLint: `npm run lint`.
- (Optional) Add Cypress/Playwright for UI tests as the project evolves.

---

## Production Build
```powershell
npm run build
npm run start
```

Deploy on Vercel, Azure Static Web Apps, or any Node-capable platform. Remember to set `NEXT_PUBLIC_API_BASE` to your deployed backend URL.

---

## Docker Compose Preview
The repository root includes `docker-compose.yml` (backend + nginx static demo). To reuse the Next.js build inside Docker, create a separate production image or run `npm run build` and serve with `next start`.

---

Happy testing! The frontend is ready for both mock demos and real telemetry once the backend provides the session data.
