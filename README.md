# consultara-teleconsultation-website

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_m1GzJjzSoUOJYs1hnPgthjO0UtqW)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

If it doesn't open automatically, try:
npm install
npm run dev

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Backend and Data

This version uses a SQLite-backed API layer for authentication, appointments, messages, medical records, notifications, and prescriptions. The database is seeded from the existing demo data so the site works immediately after install.

Demo sign-in password for seeded accounts: `Consultara123!`

## Build

The production build is now available with:

```bash
npm run build
```

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

## Project Structure & Key Files

- **Overview**: This repository is a Next.js App Router application with a lightweight SQLite-backed API layer used for development and demos.
- **Key folders/files**:
	- [app](app) — Next.js app routes and pages (auth flows, patient, doctor areas).
	- [components](components) — shared UI components (auth forms, ui primitives).
	- [lib](lib) — client contexts and server DB adapter (`lib/server/consultara-db.ts`).
	- [app/api](app/api) — server API routes (session, state, doctors).
	- [scripts/verify-ui-check.js](scripts/verify-ui-check.js) — simple dev verification script for API/state checks.
	- [docs/verification-checklist.md](docs/verification-checklist.md) — verification checklist for Technical Expectations, Patient, and Doctor modules.

## Verification Checklist

Run through the verification checklist in [docs/verification-checklist.md](docs/verification-checklist.md) to confirm the application implements the required Technical Expectations, Patient Module, and Doctor Module features and actions. The checklist contains manual test steps and expected outcomes.

## Development Notes

- The app uses an embedded SQLite database (located under `.data/` during development). Generated SQLite artifacts (`*.sqlite`, `*.sqlite-shm`, `*.sqlite-wal`) are now ignored by `.gitignore` to avoid accidental commits of binary DB files.
- Appointment creation is server-authoritative. The `createAppointment` API returns an object with the authoritative `appointment` plus any `notifications` and `messages` the server persisted. Client code merges these into local state.

## Deployment

Two recommended deployment options are included below: Vercel (recommended for Next.js) and Docker + PM2/systemd for self-hosting.

Vercel (recommended)
- Push this repository to GitHub and connect the repo to Vercel. Vercel auto-detects Next.js App Router projects and will handle builds and deployments.
- A minimal `vercel.json` is included to help detect the Next.js project.

Self-hosting with Docker + PM2/systemd
- A production Dockerfile and `docker-compose.yml` are included. The compose file mounts `./data` for persistence (SQLite). Build and run with:

```bash
docker compose build
docker compose up -d
```

- Alternatively use PM2 to keep the process alive with `ecosystem.config.js`:

```bash
# build locally
npm ci
npm run build
# start with pm2
npx pm2 start ecosystem.config.js
```

- For systemd installations, use the template at `scripts/systemd-service.template` as a starting point and customize `WorkingDirectory` and `ExecStart` paths.

Postgres (optional - production-ready)
-------------------------------
This project ships with an opt-in Postgres adapter for production or staging environments. The app defaults to the SQLite adapter for development and demos. To enable Postgres set both `DATABASE_URL` and `ENABLE_PG_ADAPTER=true` in your environment.

Local development with Postgres (recommended for production parity)

- Quick (Docker):

```bash
docker run --name consultara-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=consultara -p 5432:5432 -d postgres:15
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/consultara
export ENABLE_PG_ADAPTER=true
pnpm dev
```

- Helper script: run `sh ./scripts/dev-postgres.sh` to start Docker Postgres (if Docker is installed) and print the env vars you need.

- Managed DB: set `DATABASE_URL` to your managed Postgres connection string and `ENABLE_PG_ADAPTER=true`.

Migration from SQLite

- A helper migration script exists at `scripts/sqlite-to-postgres.js`. To migrate data from your local SQLite development DB to Postgres after enabling Postgres run:

```bash
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/consultara
export ENABLE_PG_ADAPTER=true
pnpm migrate:pg
```

Production considerations

- Connection pool: the app uses a `pg` Pool. Configure `PGSSLMODE`, `PG_MAX_POOL_SIZE`, and other Pool-related environment variables through your hosting provider.
- Keep `ENABLE_PG_ADAPTER` as an explicit opt-in toggle to avoid accidental runtime flips. The delegator will gracefully fall back to SQLite if the Postgres adapter cannot be loaded.
- Use a managed Postgres or a robust pooler (PgBouncer) when deploying multiple Node instances to avoid connection exhaustion.

Environment variables

- `DATABASE_URL`: full Postgres connection string.
- `ENABLE_PG_ADAPTER`: set to `true` to enable the Postgres adapter.
- `PORT`: the port the Next.js dev/production server listens on (optional).

CI / GitHub Actions secrets

When using the included GitHub Actions workflow (`.github/workflows/deploy-check.yml`), you can supply managed DB credentials via repository secrets. Recommended secrets to set in your repo's Settings → Secrets:

- `DATABASE_URL` — (optional) Postgres connection string for managed DB; if omitted the workflow will start a local Postgres service via Docker Compose.
- `ENABLE_PG_ADAPTER` — set to `true` to enable the Postgres adapter in CI (defaults to `true` for the workflow).
- `PGSSLMODE` — (optional) if your managed DB requires SSL, set this to `require` or `verify-full` and ensure the network runner can validate the certs.

- `SENTRY_DSN` — (optional) set this to your Sentry DSN to enable server-side error monitoring in CI and production. If `@sentry/node` isn't installed, the app will log a warning and continue running.
- `SENTRY_TRACES_SAMPLE_RATE` — (optional) decimal between 0 and 1 to control tracing sample rate (defaults to `0.1`).

Client/browser Sentry

- `NEXT_PUBLIC_SENTRY_DSN` — (optional) public DSN to enable browser-side monitoring using `@sentry/react`. Set this in your hosting provider (or in `.env` for local dev) to capture frontend exceptions.
- `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` — (optional, CI only) provide these secrets in GitHub to enable automatic sourcemap upload during CI runs. The workflow will skip sourcemap upload if `SENTRY_AUTH_TOKEN` is missing.

Add these secrets so the CI can verify the deployed artifact against a production-like Postgres instance without exposing credentials in commits.

Verify after enabling Postgres

- Start the app with `ENABLE_PG_ADAPTER=true` and `DATABASE_URL` set.
- Visit `/auth` flows and complete the Verification Checklist in `docs/verification-checklist.md`.
- Run `pnpm migrate:pg` only after confirming your Postgres instance is reachable and empty or accepts migrated data.


## How to Verify Quickly (dev)

1. Install dependencies and run the dev server:

```bash
pnpm install
pnpm dev
```

2. Open http://localhost:3000 and perform these quick checks:
	- Sign up as a patient and doctor using the signup flows under /auth.
	- Book an appointment as a patient and confirm the doctor receives notification/messages (server-persisted).
	- Confirm upcoming appointments list deduplicates entries and shows authoritative appointment IDs.

If you'd like, I can run the `scripts/verify-ui-check.js` script and report results locally.
