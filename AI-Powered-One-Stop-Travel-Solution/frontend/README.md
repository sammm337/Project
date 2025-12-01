# Hyper-Local AI Travel Marketplace (Frontend)

Modern React + Vite + Tailwind + shadcn/ui interface for the local-only travel marketplace. All network calls target the local backend endpoints described in the product brief; mock mode is provided for development when agents/backends are offline.

## Tech Stack

- React 18 + TypeScript + Vite
- TailwindCSS, shadcn/ui (Radix primitives), Framer Motion, Lucide icons
- TanStack Query for future data fetching (optional), Zustand-ready structure
- Vitest unit tests, Playwright e2e scenario

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:5173. The dev proxy now targets the API gateway on http://localhost:3000 by default (matching the Docker Compose setup). Override `VITE_API_PROXY_TARGET` if your backend listens elsewhere.

### Environment Variables

Create `.env` (optional):

```
VITE_API_BASE=http://localhost:3000
VITE_API_PROXY_TARGET=http://localhost:3000
```

`VITE_API_BASE` is optional for production builds when you want absolute URLs; dev uses the proxy target automatically.

## Available Scripts

- `npm run dev` – Vite dev server with Tailwind.
- `npm run build` – Type-check + production build.
- `npm run preview` – Preview production build.
- `npm run test` – Vitest unit tests.
- `npm run e2e` – Playwright test that simulates vendor upload & pipeline events (requires backend or mock mode plus `npm run dev`).

## Features

- Traveler search with vendor/agency modes, filters, and semantic search UI.
- Recommendations page with personalization reasons.
- Itinerary generator with print-to-PDF download.
- Vendor dashboard supporting audio/image upload and live pipeline timeline via WebSocket/SSE wrapper (mock mode included).
- Agency events management + booking flow UI.
- Reusable components (`PackageCard`, `EventCard`, `AgentPipelineTimeline`, `UploadWidget`) and API service layer hitting exact backend endpoints.

## Tests

1. `npm run test` – runs Vitest (jsdom) for UI components.
2. `npm run e2e` – launches Playwright using local dev server; ensures vendor dashboard allows uploading and renders timeline states.

## Real-time Agents

`src/utils/realtime.ts` exposes helpers for WebSockets (`/ws`) and SSE (`/events/stream`). Vendor dashboard subscribes to both, falling back to SSE when the socket errors. Mock mode feeds deterministic events without backend dependencies.

---

Everything executes locally; no remote APIs or paid services involved. Plug into your existing local backend or run the mock mode for demos. Contributions welcome!

