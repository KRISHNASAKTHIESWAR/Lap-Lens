# LapLens Frontend

Next.js 14 (App Router) TypeScript UI for the LapLens F1 telemetry and race-strategy system. It consumes the FastAPI backend to display session state, predictions, and analysis views for engineers.

---

## Features
- Shared header and layout across pages.
- Dashboard / analysis views for strategy and telemetry insight.
- Vehicle/session views for exploring different cars or sessions.
- Typed API client and hooks for talking to the backend.
- Configurable backend base URL via environment variable.

---

## App Structure & Routes

Key locations:
- `app/page.tsx` – landing / home view.
- `app/dashboard/page.tsx` – dashboard view.
- `app/analysis/page.tsx` – analysis view.
- `app/vehicles/page.tsx` – vehicles/sessions view.
- `app/components/**` – shared UI pieces (cards, header, dashboard panels, charts, etc.).
- `app/hooks/useSession.ts` – session state hook.
- `app/hooks/usePredictions.ts` – predictions hook.
- `app/lib/api.ts` – API helper targeting `NEXT_PUBLIC_API_BASE` (defaults to `http://localhost:8000`).

At runtime, the most important routes are:
- `/` – welcome / entry point.
- `/dashboard` – main strategy dashboard.
- `/analysis` – additional analysis view.
- `/vehicles` – vehicles/sessions.

---

## Local Development
```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

---

## Backend Dependency
- By default, API calls go to `http://localhost:8000`.
- To point elsewhere, create `.env.local` with `NEXT_PUBLIC_API_BASE=https://my-backend.example`.
- Ensure the FastAPI backend in `../backend` is running *before* the frontend to avoid fetch errors.

---

## Testing
- ESLint: `npm run lint`.

You can add Cypress/Playwright (or another E2E framework) as the project evolves.

---

## Production Build
```powershell
npm run build
npm run start
```


