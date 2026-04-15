# TaskFlow-Ansh — Submission checklist

Use this before you **email the GitHub link** for the take-home. Check every box you can; fix anything marked **BLOCKER** first.

---

## Automatic disqualifiers (must pass)

| #   | Requirement                                            | How to verify                                                                                                                                                  |
| --- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | App runs with **`docker compose up`** (full stack)     | From a clean clone (or after `docker compose down -v`): `docker compose up --build` → UI at **http://localhost:3000**, API at **http://localhost:4000/health** |
| D2  | **Migrations** exist (tool-based, not only a SQL dump) | `backend/db/migrations/*.sql` with `-- migrate:up` and `-- migrate:down`                                                                                       |
| D3  | Passwords **hashed** (not plaintext in DB)             | bcrypt in auth code; seed uses bcrypt hash                                                                                                                     |
| D4  | **JWT secret** not hardcoded in application source     | Loaded from **`process.env`** / `.env`; Compose defaults are infra-only — production uses Render/env vars                                                      |
| D5  | **README** present with required sections              | Root **README.md** §1–§7                                                                                                                                       |
| D6  | **No secrets in git**                                  | `.env` not committed; only **`.env.example`** with placeholders / dev defaults                                                                                 |

---

## README rubric (sections 1–7)

| #   | Section                                                   | In README?                     |
| --- | --------------------------------------------------------- | ------------------------------ |
| R1  | **Overview** — product + stack                            | §1                             |
| R2  | **Architecture decisions** — tradeoffs, omissions         | §2                             |
| R3  | **Running locally** — `git clone` → browser               | §3                             |
| R4  | **Running migrations** — auto on Docker or exact commands | §4                             |
| R5  | **Test credentials** — `test@example.com` / `password123` | §5                             |
| R6  | **API reference** — table or link                         | §6 + **docs/DOCUMENTATION.md** |
| R7  | **What you’d do with more time**                          | §7                             |

**Before submit:** Replace `https://github.com/<your-github>/taskflow-ansh.git` in README §3 with your **real** public repo URL if still a placeholder.

---

## Core product (full stack)

| #   | Requirement                                           | Verify                                                                   |
| --- | ----------------------------------------------------- | ------------------------------------------------------------------------ |
| P1  | Register / login, JWT persisted                       | Browser: register → refresh → still logged in                            |
| P2  | Projects CRUD + list “accessible” projects            | Create project, list shows it                                            |
| P3  | Tasks on project; filters **status** / **assignee**   | Project detail: filters + list                                           |
| P4  | Task create/edit (modal/sheet), assignee + due date   | Task sheet                                                               |
| P5  | Navbar: user name + logout                            | After login                                                              |
| P6  | Protected routes → `/login` if logged out             | Open `/projects` in private window                                       |
| P7  | Loading + error states visible                        | Network throttling / bad token                                           |
| P8  | Optimistic task **status** change + rollback on error | Kanban / list status actions                                             |
| P9  | **375px** and **desktop** usable                      | Responsive devtools                                                      |
| P10 | **Production build** no console errors                | `npm run build --workspace=frontend` then `vite preview` or static serve |

---

## Docker & infra

| #   | Requirement                                               | Verify                                                      |
| --- | --------------------------------------------------------- | ----------------------------------------------------------- |
| I1  | Root **`docker-compose.yml`** — Postgres + API + frontend | Three services                                              |
| I2  | **`.env.example`** at repo root with required vars        | Present                                                     |
| I3  | **Multi-stage** API Dockerfile                            | `backend/Dockerfile` — builder + runtime                    |
| I4  | Migrations (+ seed in Docker) on API start                | `backend/Dockerfile` `CMD` runs `dbmate up` + seed + `node` |

---

## Render (production) — if you deploy

| #   | Item                                                              | Correct value                                                                                                                       |
| --- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| B1  | **Build Command** (monorepo root)                                 | `npm install && npm run build --workspace=backend`                                                                                  |
| B2  | **Start Command** (monorepo root)                                 | **`npm run start:prod`** — **not** `npx dbmate up && npm run start` (dbmate would look for `./db/migrations` at repo root and fail) |
| B3  | **Env:** `DATABASE_URL`, `JWT_SECRET`, **`CORS_ALLOWED_ORIGINS`** | At least one real origin; empty → API boot fails                                                                                    |
| B4  | **Static site:** `VITE_API_URL` = public API URL                  | Set at **build** time; redeploy after change                                                                                        |
| B5  | **Health check path**                                             | `/health`                                                                                                                           |

---

## GitHub submission

| #   | Step                                                                                       |
| --- | ------------------------------------------------------------------------------------------ |
| S1  | Repo is **public** named like **`taskflow-[your-name]`** (per employer instructions)       |
| S2  | **Default branch** (e.g. `main`) has all submission code pushed                            |
| S3  | **Reply to assignment email** with the **GitHub URL** before the deadline                  |
| S4  | Prepare talking points for the **30 min review** (auth, migrations, one API + one UI flow) |

---

## Local verification commands (maintainer / CI-style)

Run from repo root after `npm install`:

Copy-paste **only** the shell lines below (not markdown table headers like `Step | Result`).

```bash
# Typecheck + compile backend
npm run build --workspace=backend

# Production frontend build
# (frontend/package.json optionalDependencies include Linux + darwin-arm64 native
#  bindings for Rolldown/Lightning so `vite build` works on Render and Apple Silicon.)
npm run build --workspace=frontend

# Compose file valid
docker compose config -q

# Full stack (needs Docker). Then: curl http://localhost:4000/health
docker compose up --build -d
# … smoke test …
docker compose down
```

**Intel Mac (darwin-x64):** if `vite build` fails on missing bindings, add matching **`@rolldown/binding-darwin-x64`** / **`lightningcss-darwin-x64`** optional deps (same versions as in `package-lock.json`) or build only on Linux CI / Render.

---

## “Definition of done” for this checklist

You are ready to submit when:

1. All **disqualifiers** pass.
2. README **§1–§7** are accurate and clone instructions work on a machine with **Docker only**.
3. **`npm run build`** for both workspaces succeeds.
4. If using **Render**: **Start Command** is **`npm run start:prod`** (monorepo root) and **`CORS_ALLOWED_ORIGINS`** / **`VITE_API_URL`** match your real URLs.

Last updated: generated with the repo; re-run local commands before each submission wave.
