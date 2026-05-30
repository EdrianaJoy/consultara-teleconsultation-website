#!/usr/bin/env sh
# Helper to run a local Postgres instance (Docker) and print env vars for dev
# Usage: sh ./scripts/dev-postgres.sh

set -e

if command -v docker >/dev/null 2>&1; then
  echo "Starting Postgres container 'consultara-postgres' (if not already running)..."
  if [ "$(docker ps -a -q -f name=consultara-postgres)" = "" ]; then
    docker run --name consultara-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=consultara -p 5432:5432 -d postgres:15
  else
    echo "Container exists; starting if stopped..."
    docker start consultara-postgres || true
  fi
  echo "Postgres should be available at: postgres://postgres:postgres@localhost:5432/consultara"
  echo
  echo "Run the app with Postgres enabled (example):"
  echo "  export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/consultara"
  echo "  export ENABLE_PG_ADAPTER=true"
  echo "  pnpm dev"
else
  echo "Docker not found. Start a Postgres instance manually or provide DATABASE_URL and set ENABLE_PG_ADAPTER=true."
  echo "Example for managed DB or local Postgres:"
  echo "  export DATABASE_URL=postgresql://postgres:postgres@<host>:5432/consultara"
  echo "  export ENABLE_PG_ADAPTER=true"
  echo "  pnpm dev"
fi
