# Deploying on Render (API)

## Why `could not find migrations directory ./db/migrations`

`dbmate` resolves `./db/migrations` relative to the **shell’s current working directory**. If Render’s **Start Command** is run from the **monorepo root** (e.g. `npx dbmate up && …`), there is no `db/` folder at the repo root — migrations live under **`backend/db/migrations`**.

## Fix (pick one)

### A. Recommended: monorepo root + npm workspace (cwd = `backend`)

- **Root Directory:** leave empty (repository root), or your repo default.
- **Build Command:**  
  `npm install && npm run build --workspace=backend`
- **Start Command:**  
  `npm run start:prod --workspace=backend`

`npm` runs the `backend` package’s `start:prod` script with the **backend** package as context, so `dbmate` finds `backend/db/migrations`.

### B. Service rooted at `backend`

- **Root Directory:** `backend`
- **Build Command:**  
  `npm install && npm run build`
- **Start Command:**  
  `npm run start:prod`

### Do **not** use from repo root

```bash
npx dbmate up && npm run start
```

unless you first `cd backend`, because `npx dbmate` uses the wrong cwd.

## Required environment variables (API)

| Variable               | Notes                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------- |
| `DATABASE_URL`         | Render Postgres **internal** URL if DB + API are both on Render.                        |
| `JWT_SECRET`           | ≥ 10 characters, random.                                                                |
| `CORS_ALLOWED_ORIGINS` | Comma-separated **exact** frontend origins (e.g. `https://your-frontend.onrender.com`). |
| `NODE_ENV`             | `production`                                                                            |

Render sets `PORT` automatically.

## Frontend (Static Site)

- **Root Directory:** `frontend`
- **Build:** `npm install && npm run build`
- **Publish directory:** `dist`
- **Build env:** `VITE_API_URL=https://your-api.onrender.com` (no trailing slash)

After deploy, add the static site URL to the API’s `CORS_ALLOWED_ORIGINS` and redeploy the API.
