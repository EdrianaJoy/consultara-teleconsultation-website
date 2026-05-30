# Vercel Deployment Guide

This document explains how to deploy this Next.js App Router project to Vercel and migrate the local SQLite database to a hosted Postgres (required for Vercel production deployments).

Summary
- Vercel is the recommended production host for Next.js App Router apps.
- Because Vercel serverless/edge functions are ephemeral, you must migrate from on-disk SQLite to a networked database such as Postgres (Supabase, Neon, Heroku Postgres, Amazon RDS).

1) Connect repository to Vercel
- Go to https://vercel.com/new and import this GitHub repository.
- Vercel detects Next.js and will use the `@vercel/next` builder. A minimal `vercel.json` exists in the repo.

2) Environment variables
- Add these env vars in the Vercel project settings (Production + Preview):
  - `DATABASE_URL` — Postgres connection string (example: `postgres://user:pass@host:5432/dbname`)
  - `NEXTAUTH_URL` — `https://your-vercel-domain.vercel.app` (if applicable)
  - Any OAuth/third-party keys used by your app

3) Choose a managed Postgres provider
- Recommended options:
  - Supabase (easy, free tier) — https://supabase.com
  - Neon (serverless Postgres) — https://neon.tech
  - Heroku Postgres, Amazon RDS, DigitalOcean Managed Databases

4) Migrate SQLite → Postgres

Option A: Use `pgloader` (recommended)

Prereqs (local machine or jump host):
```bash
# macOS (with Homebrew)
brew install pgloader
```

Run pgloader to migrate file `data/consultara.sqlite` to Postgres:
```bash
pgloader sqlite:///absolute/path/to/data/consultara.sqlite postgres://user:pass@host:5432/dbname
```

Option B: Node-based migration script (included)
- This repo includes `scripts/sqlite-to-postgres.js` which connects to your Postgres `DATABASE_URL`, creates tables, and copies rows from the local SQLite file into Postgres. It uses the `pg` package.

Run it locally like:
```bash
DATABASE_URL=postgres://user:pass@host:5432/dbname npm run migrate:pg
```

This is useful when `pgloader` is not available; it attempts to preserve seeded data and JSON fields.

5) Update runtime to use `DATABASE_URL`
- In Vercel, set `DATABASE_URL` to the Postgres connection string.
- The app's DB adapter (`lib/server/consultara-db.ts`) must support Postgres. The repo currently uses SQLite. You have two options:
  - Implement a Postgres adapter that mirrors the SQLite queries (recommended). I can implement this for you.
  - Use a lightweight migration shim that converts simple queries to Postgres (only safe for trivial schemas).

6) Deploy and verify
- Push a branch to GitHub. Vercel will build a Preview deployment — use that URL to test app flows.
- Run your acceptance tests and verify sign-up, appointment creation, notifications, and messages persist and behave as expected.

7) Promote to production
- Merge to `main` (or your designated production branch). Vercel will deploy production automatically.

Rollback and iteration
- Vercel keeps immutable deployments. To rollback, open the Deployments list and promote an older deployment or revert your Git branch and re-deploy.

I can next:
- Implement a Postgres adapter in `lib/server/consultara-db.ts` and add a simple migration script to create tables and seed demo data in Postgres.
- Or, if you prefer, I can draft a step-by-step `pgloader` script and test the migration locally.

Which would you like me to do next? (implement adapter | prepare migration script)
