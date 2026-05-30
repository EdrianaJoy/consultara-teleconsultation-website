#!/usr/bin/env bash
set -euo pipefail
# Deploy script for the host: backs up SQLite, pulls new image, recreates container
# Usage: ./scripts/deploy.sh [project_dir]

PROJECT_DIR=${1:-$(pwd)}
cd "$PROJECT_DIR"

TIMESTAMP=$(date +%s)
DB_PATH="./data/consultara.sqlite"
BACKUP_DIR="./data/backups"

if [ -f "$DB_PATH" ]; then
  mkdir -p "$BACKUP_DIR"
  cp "$DB_PATH" "$BACKUP_DIR/consultara.sqlite.bak.$TIMESTAMP"
  echo "Backed up DB to $BACKUP_DIR/consultara.sqlite.bak.$TIMESTAMP"
else
  echo "No SQLite DB found at $DB_PATH — skipping backup"
fi

echo "Pulling latest images..."
docker compose pull web

echo "Recreating app container..."
docker compose up -d --no-deps --force-recreate web

echo "Deployment finished."
