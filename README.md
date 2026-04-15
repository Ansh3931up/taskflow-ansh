# TaskFlow-Ansh

## 1. Overview

**TaskFlow-Ansh** is a minimal but real **task management** product: users **register and log in**, create **projects**, add **tasks**, assign work to **themselves or others**, and filter by **status** and **assignee**. It is a **full-stack** submission: **PostgreSQL** + **REST API** + **React SPA**, with **Docker Compose** for a one-command demo environment.

| Layer    | Technology                                                                                                  |
| -------- | ----------------------------------------------------------------------------------------------------------- |
| Frontend | React 19, TypeScript, Vite, Redux Toolkit, React Router, Tailwind CSS, Radix UI (primitives), Lucide        |
| Backend  | **Node.js** (not Go — see §2), Express 5, TypeScript, PostgreSQL (`pg`), Zod, bcrypt, JWT, Pino, **dbmate** |
| Infra    | Docker Compose, **multi-stage** API and frontend Dockerfiles                                                |

Deeper walkthrough (data flow, env vars, API shapes, bonuses): **[docs/DOCUMENTATION.md](docs/DOCUMENTATION.md)**.

---

## 2. Architecture Decisions

- **Monorepo (npm workspaces):** one `npm install`, shared conventions, single Compose file at the repo root.
- **SQL-first data layer:** schema is owned by **dbmate migrations** under `backend/db/migrations/` (up + down sections per file). No ORM auto-sync.
- **Backend in TypeScript/Express:** the brief prefers **Go**; this repo uses **Node.js** for speed of delivery and strong typing with Zod at the boundary. Tradeoff: different runtime from the “preferred” stack, but behavior matches the spec (JWT, bcrypt cost, REST semantics).
- **Auth:** JWT in `Authorization: Bearer` for protected routes; tokens stored on the client (e.g. localStorage) with protected React Router routes.
- **Docker defaults:** Compose supplies **development defaults** for Postgres and `JWT_SECRET` so `docker compose up` works **without** copying `.env` first. For anything beyond local demos, use a **root `.env`** (from `.env.example`) and **never** commit it. The take-home disqualifier targets **application source** hardcoding a production secret; here the **dev default** lives in Compose/env documentation — override with `.env` for real deployments.
- **Postgres volume (`pgdata`):** named volume so first boot initializes the DB password to match the Compose defaults. If you change `DB_PASSWORD` without a fresh volume, Postgres can keep an old password (see §3.4).
- **Intentionally light:** no WebSocket layer in core scope; polling and optional bonuses are documented in `docs/DOCUMENTATION.md`.

---

## 3. Running Locally

Assume **Docker Desktop** (or Docker Engine + Compose plugin) is installed — **no Node install required** for the Docker path.

### 3.1 Start the full stack

```bash
git clone https://github.com/<your-github>/taskflow-ansh.git
cd taskflow-ansh
docker compose up --build
```

Equivalent from the repo root:

```bash
npm run docker:up
```

Wait until:

- **`taskflow-db`** is healthy,
- **`taskflow-backend`** has applied migrations and seed, then logs that the API is live,
- **`taskflow-frontend`** (nginx) is serving the SPA.

Then open:

| What        | URL                                |
| ----------- | ---------------------------------- |
| **Web app** | http://localhost:3000              |
| **API**     | http://localhost:4000              |
| **Health**  | `GET http://localhost:4000/health` |

**First boot:** the API container runs `dbmate up`, then `psql … -f db/seed.sql`, then starts Node. You should see seed `INSERT` lines in the backend logs.

### 3.2 Optional: use a root `.env` (recommended for non-demo use)

Defaults match [`.env.example`](.env.example). To **override** Postgres or secrets:

```bash
cp .env.example .env
# Edit .env — set DB_PASSWORD, JWT_SECRET (≥10 chars), CORS_ALLOWED_ORIGINS, etc.
docker compose up --build
```

Compose interpolates variables from a project-root **`.env`** file automatically if it exists (same names as in `.env.example`).

### 3.3 PostgreSQL credentials (what password goes where)

| Variable      | Default (no `.env`) | Role                                                                                                                  |
| ------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `DB_USER`     | `postgres`          | Postgres superuser inside the `db` container                                                                          |
| `DB_PASSWORD` | `postgres`          | Must match **both** the `db` service env **and** `DATABASE_URL` in the `backend` service (Compose wires this for you) |
| `DB_NAME`     | `taskflow`          | Application database name                                                                                             |

**Application login (seed user)** — this is **not** the database password; it is the **web/API test user** from seed data:

| Field    | Value              |
| -------- | ------------------ |
| Email    | `test@example.com` |
| Password | `password123`      |

Use that pair on the **Login** page at http://localhost:3000 after the stack is up.

### 3.4 If something fails (troubleshooting)

| Symptom                                              | Likely cause                                                                                                                                                                                           | What to do                                                                                                                                                                  |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `password authentication failed for user "postgres"` | Postgres **data volume** was created earlier with a **different** `POSTGRES_PASSWORD` than your current Compose/env. Postgres **does not** change the password when the data directory already exists. | Run **`docker compose down -v`** once (removes named volumes), then **`docker compose up --build`** again. **Warning:** `-v` deletes local DB data (fine for a fresh demo). |
| Backend exits right after start                      | Migration error, seed error, or bad `DATABASE_URL`.                                                                                                                                                    | Check **`docker logs taskflow-backend`**. Fix `.env` if you customized URLs or passwords.                                                                                   |
| Frontend loads but API calls fail / CORS             | Browser origin not allowed.                                                                                                                                                                            | Set `CORS_ALLOWED_ORIGINS` in `.env` to include your exact origin (e.g. `http://localhost:3000`). Defaults already include common localhost ports.                          |
| Port already in use                                  | Another Postgres or API on **5432** / **4000** / **3000**.                                                                                                                                             | Stop the other service or change the **published** ports in `docker-compose.yml`.                                                                                           |

**Clean rebuild (keeps Compose defaults, wipes DB volume):**

```bash
docker compose down -v
docker compose up --build
```

---

## 4. Running Migrations

**In Docker:** migrations run **automatically** on every backend container start: `dbmate up` in `backend/Dockerfile` before the server starts.

**Locally (without Docker):** install dbmate, set `DATABASE_URL`, then from `backend/`:

```bash
dbmate up
```

Each migration file under `backend/db/migrations/` includes **both** `-- migrate:up` and `-- migrate:down` sections (dbmate format).

---

## 5. Test Credentials

Seed data is applied in Docker after migrations (`backend/db/seed.sql`).

| Field        | Value              |
| ------------ | ------------------ |
| **Email**    | `test@example.com` |
| **Password** | `password123`      |

You can log in immediately without registering. There is also a second seeded user (`jane@example.com`, same password) for assignee scenarios.

---

## 6. API Reference

Summary (all JSON; protected routes need `Authorization: Bearer <token>`):

| Method | Path                  | Description                                |
| ------ | --------------------- | ------------------------------------------ |
| POST   | `/auth/register`      | Register                                   |
| POST   | `/auth/login`         | JWT + user                                 |
| GET    | `/projects`           | List accessible projects (`?page=&limit=`) |
| POST   | `/projects`           | Create project                             |
| GET    | `/projects/:id`       | Project + tasks                            |
| PATCH  | `/projects/:id`       | Update (owner)                             |
| DELETE | `/projects/:id`       | Delete (owner)                             |
| GET    | `/projects/:id/tasks` | List tasks (`?status=&assignee=`)          |
| POST   | `/projects/:id/tasks` | Create task                                |
| PATCH  | `/tasks/:id`          | Update task                                |
| DELETE | `/tasks/:id`          | Delete (owner or creator)                  |
| GET    | `/projects/:id/stats` | **Bonus:** counts by status / assignee     |
| GET    | `/users`              | List users (assignment UI)                 |

**Details, examples, and error shapes:** **[docs/DOCUMENTATION.md](docs/DOCUMENTATION.md)**.

---

## 7. What You’d Do With More Time

- **E2E tests** (Playwright): login → project → task → assignee.
- **Integration tests** in CI for auth + tasks (rubric bonus).
- **Explicit project membership** instead of visibility derived only from ownership + assignment.
- **True real-time** (WebSocket/SSE) with an auth story, not polling.
- **Stricter production story:** require `.env` for `JWT_SECRET` in production builds and fail fast if unset.

---

## Bonus / rubric extras (implemented)

- Pagination-style lists with **`total`**; load-more on projects.
- **`GET /projects/:id/stats`** + UI summary.
- **Optimistic UI** for task status changes with rollback on error.
- **Kanban drag-and-drop** (HTML5 DnD) to change status.
- **Dark mode** with persistence.
- **Polling** while the tab is visible (near real-time without WebSockets).

---

## Local dev (optional — requires Node)

```bash
npm install
# Run Postgres (e.g. via Docker) and copy backend/.env.example → backend/.env
npm run dev
```

---

## License

Private / assignment use unless you add a license.
