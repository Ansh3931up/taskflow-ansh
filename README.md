# Taskflow

## 1. Overview

Taskflow is a scalable, monorepo-based web application orchestrator. It uses a **React (Vite) & TypeScript** frontend combined with an **Express/Node.js** backend. The system enforces strict senior-engineering automation standards including Conventional Commits (`commitlint`), Dependabot, pre-commit styling hooks (`Husky`/`lint-staged`), and Docs-as-Code implementations.

## 2. Architecture Decisions

Why did we structure things the way we did?

- **NPM Workspaces (Monorepo)**: Chosen to share configurations (like TS, Prettier, ESLint) and hoist dependency trees over juggling multiple isolated repositories.
- **Strict TypeScript (Base Config)**: Enforces `ES2022` globally so the frontend and backend implementations never invent their own conflicting typing standards.
- **Concurrent Execution**: Integrated `concurrently` so developers interact with a single `npm run dev` script rather than orchestrating multiple terminal server executions.

### Automated Architecture Decision Records (ADRs)

<!-- ADRs:START -->
<!-- ADRs:END -->

## 3. Running Locally

Exact commands from `git clone` to the app running in a browser:

```bash
git clone https://github.com/your-name/taskflow-ansh
cd taskflow-ansh

# Install dependencies for both frontend and backend
npm install

# Run the full stack locally
npm run dev

# App Frontend available at http://localhost:5173
# App Backend available at http://localhost:3000
```

_(Note: Moving forward, a `docker-compose` environment will be established to handle the background services)._

## 4. Running Migrations

_(Pending Database Implementation)_. Once our ORM or database driver is selected, schema updates will be triggered via:

```bash
# npm run db:migrate
```

## 5. Test Credentials

Use the following seed credentials to log in and test immediately without registering:

- **Email**: `test@example.com`
- **Password**: `password123`

## 6. API Reference

_(Pending deeper implementation, below is the intended standard)_:

| Endpoint      | Method | Description                | Payload               | Example Response        |
| ------------- | ------ | -------------------------- | --------------------- | ----------------------- |
| `/api/health` | GET    | Validates server uptime    | None                  | `{ "status": "ok" }`    |
| `/api/login`  | POST   | Authenticates testing user | `{ email, password }` | `{ "token": "jwt..." }` |

## 7. What You'd Do With More Time

If given more time, several optimizations and features would be prioritized:

- **Full Dockerization**: Implement a multi-stage `Dockerfile` and `docker-compose.yml` to completely encapsulate the frontend, backend, and a database layer so reviewers _only_ need to run `docker compose up`.
- **Comprehensive Testing Strategy**: Integrate Vitest/Cypress for the React UI and Jest/Supertest for the unified backend API.
- **Database/ORM Layer**: We intentionally left the DB logic out of the initial scaffold to ensure the foundational monorepo standards were immaculate first. We would introduce Prisma or Drizzle ORM linked to PostgreSQL.
- **CI/CD Expansion**: Expand our basic GitHub Actions workflow to run end-to-end testing metrics, blocking PRs that dip below 80% coverage.
