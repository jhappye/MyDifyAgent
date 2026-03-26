#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="${1:-docker/docker-compose.yaml}"
PROJECT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$PROJECT_DIR"

log() { echo "[diagnose] $*"; }

log "Checking container status"
docker compose -f "$COMPOSE_FILE" ps || true

log "Checking nginx upstream errors"
docker compose -f "$COMPOSE_FILE" logs --tail=200 nginx | rg -n "host not found|emerg|upstream|admin-web|admin-server" || true

log "Checking API traceback for /console/api/setup"
docker compose -f "$COMPOSE_FILE" logs --tail=200 api | rg -n "setup|Traceback|ERROR|relation .* does not exist|ProgrammingError" || true

log "Calling setup endpoint"
set +e
curl -sS -i http://127.0.0.1/console/api/setup | head -n 20
set -e

cat <<'TIPS'

Likely fixes:
1) If nginx logs show "host not found in upstream admin-web", update to latest nginx template and restart nginx:
   docker compose -f docker/docker-compose.yaml up -d --force-recreate nginx

2) If API logs show missing DB tables (e.g., relation does not exist), run migrations:
   docker compose -f docker/docker-compose.yaml exec api flask db upgrade

3) If you still see Dify logos, you are using upstream images (langgenius/dify-*).
   Build and deploy your customized images instead of official tags.
TIPS
