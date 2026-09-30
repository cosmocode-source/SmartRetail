#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 20+ is required." >&2
  exit 1
fi

NODE_MAJOR="$(node -p 'Number(process.versions.node.split(".")[0])')"
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "Node.js 20+ is required; found $(node --version)." >&2
  exit 1
fi

if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "Created .env.local. Replace all placeholder secrets before continuing."
fi

if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  docker compose up -d
else
  echo "Docker Compose was not found; start PostgreSQL 16 and MongoDB 7 manually."
fi

npm install

cat <<'MSG'

Setup finished.
Next steps:
1. Update .env.local with safe local credentials.
2. Apply PostgreSQL files in database/postgresql order.
3. Apply database/mongodb/validators.js and indexes.js with mongosh.
4. Run: npm run dev
5. Start with the first coding task in AGENTS.md.
MSG
