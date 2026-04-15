# TaskFlow-Ansh

A **full-stack task management** app: register, sign in, create **projects**, add **tasks**, assign work to **users**, filter by **status** and **assignee**, and track progress with **stats**. Submission for the **TaskFlow** engineering take-home: clear boundaries, explicit SQL migrations, and a UI that works from **375px phones** to **desktop**.

**→ In-depth technical guide:** [docs/DOCUMENTATION.md](docs/DOCUMENTATION.md) (architecture, data flow, env vars, API details, bonuses, troubleshooting).

---

## Stack

| Layer    | Technology                                                                                            |
| -------- | ----------------------------------------------------------------------------------------------------- |
| Frontend | React 19, TypeScript, Vite, Redux Toolkit, React Router, Tailwind CSS, Radix UI (Label, Slot), Lucide |
| Backend  | Node.js, Express 5, TypeScript, PostgreSQL (`pg`), Zod, bcrypt, JWT, Pino, dbmate                     |
| Infra    | Docker Compose, multi-stage Dockerfiles (where configured)                                            |

---

## Quick start (Docker)

```bash
git clone <your-repo-url>
cd taskflow-ansh
cp .env.example .env
docker compose up --build
```

- **App (UI):** http://localhost:3000 (or the port mapped in compose)
- **API:** http://localhost:4000
- **Health:** `GET http://localhost:4000/health`

---

## Local dev (no Docker)

```bash
npm install
# PostgreSQL running; set DATABASE_URL in backend/.env
npm run dev
```

Runs frontend and backend concurrently via workspaces.

---

## Migrations & seed

Migrations live in `backend/db/migrations/`. They are intended to run via **dbmate** (see Docker entrypoint or README in `backend/` if present).

Seed SQL (optional): `backend/db/seed.sql` — includes test user and sample data when applied.

---

## Test credentials (seed)

| Field    | Value              |
| -------- | ------------------ |
| Email    | `test@example.com` |
| Password | `password123`      |

---

## API (summary)

All non-auth routes expect: `Authorization: Bearer <token>`.

| Method         | Path                  | Notes                                                                         |
| -------------- | --------------------- | ----------------------------------------------------------------------------- |
| POST           | `/auth/register`      | Name, email, password                                                         |
| POST           | `/auth/login`         | Returns JWT + user                                                            |
| GET            | `/projects`           | `?page=&limit=` — response includes **`total`**                               |
| POST           | `/projects`           | Create (owner = current user)                                                 |
| GET            | `/projects/:id`       | Project + tasks embedded                                                      |
| PATCH / DELETE | `/projects/:id`       | Owner-only updates / delete                                                   |
| GET            | `/projects/:id/tasks` | `?status=&assignee=` (`assignee=unassigned` supported) — includes **`total`** |
| POST           | `/projects/:id/tasks` | Create task                                                                   |
| PATCH          | `/tasks/:id`          | Update fields (snake_case body after validation)                              |
| DELETE         | `/tasks/:id`          | Owner or creator                                                              |
| GET            | `/projects/:id/stats` | Counts by status, by assignee, **`unassigned_count`**                         |
| GET            | `/users`              | List users for assignment UI                                                  |

Full request/response discussion: **[docs/DOCUMENTATION.md](docs/DOCUMENTATION.md)**.

---

## Bonus / rubric extras implemented

- **Pagination:** `total` on project and task list responses; **Load more** on the projects page.
- **Stats API + UI:** Dashboard-style summary on project detail.
- **Optimistic UI:** Task status PATCH updates immediately, rolls back on failure.
- **Drag-and-drop:** Kanban columns accept drag to change status (native HTML5 DnD).
- **Dark mode:** Toggle with persistence (`taskflow-theme` in `localStorage`).
- **Near real-time:** Polling refresh for tasks + stats while the tab is visible.
- **Responsive + safe areas:** Horizontal board scroll on small screens; `viewport-fit=cover`; `env(safe-area-inset-*)` padding on layout, auth, and sheets.
- **Visual polish:** `.shadow-elevated`, card ring, hover elevation on project cards.

---

## Architecture (short)

Monorepo **npm workspaces** keep one install and aligned versioning. The backend uses **explicit SQL** and migrations (no ORM auto-sync). The frontend keeps API calls in **`/api`**, async logic in **Redux thunks**, and route-level code splitting in **`App.tsx`**.

**Why this shape:** predictable data flow, easy onboarding for reviewers, and a straight line from UI action → thunk → HTTP → SQL.

**Intentionally omitted:** WebSocket layer (would need auth strategy for EventSource or a socket gateway), full Playwright suite, Redis cache.

---

## What we’d add with more time

- E2E tests (Playwright) for login → project → task flows.
- Row-level **project membership** instead of “owner or assignee” visibility only.
- **WebSocket** or SSE with cookie-based session for true live updates.
- **Optimistic create/delete** with rollback parity to updates.

---

## License

Private / assignment use unless you add a license.
