#!/usr/bin/env bash
set -euo pipefail
# Start or restart app using PM2
if ! command -v pm2 >/dev/null 2>&1; then
  echo "pm2 not installed. Install with: npm i -g pm2"
  exit 1
fi

echo "Installing dependencies and building..."
npm ci
npm run build

echo "Starting with PM2..."
npx pm2 start ecosystem.config.js --update-env || npx pm2 restart ecosystem.config.js --update-env
npx pm2 save

echo "PM2 managed process started."
