#!/usr/bin/env bash
# ============================================================
# PetPal Staging Startup Script (Docker)
# ============================================================
# Prerequisites: Docker, Docker Compose
# Usage: bash scripts/staging-start.sh
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "============================================"
echo "  PetPal Staging — Docker Deployment"
echo "============================================"
echo ""

# --- Check prerequisites ---
if ! command -v docker &> /dev/null; then
    echo -e "${RED}ERROR: docker not found. Please install Docker.${NC}"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo -e "${RED}ERROR: docker compose not found. Please install Docker Compose.${NC}"
    exit 1
fi

# --- Load .env.staging FIRST (before any var checks) ---
if [ -f "$PROJECT_DIR/.env.staging" ]; then
    echo -e "${GREEN}[OK]${NC} .env.staging found, loading..."
    set -a  # automatically export all variables
    source "$PROJECT_DIR/.env.staging"
    set +a
else
    echo -e "${RED}ERROR: .env.staging not found.${NC}"
    echo "  Create one: cp .env.example .env.staging"
    echo "  Then edit .env.staging with your staging configuration."
    echo "  At minimum, set: SESSION_SECRET, ADMIN_SESSION_SECRET, ADMIN_PASSWORD_HASH"
    exit 1
fi

# --- Check required env vars (now loaded from .env.staging) ---
MISSING=""
for VAR in SESSION_SECRET ADMIN_SESSION_SECRET ADMIN_PASSWORD_HASH; do
    if [ -z "${!VAR:-}" ]; then
        MISSING="$MISSING $VAR"
    fi
done

if [ -n "$MISSING" ]; then
    echo -e "${RED}ERROR: Required env vars missing from .env.staging:${NC}$MISSING"
    echo "  Generate SESSION_SECRET:   openssl rand -base64 64"
    echo "  Generate ADMIN_SESSION_SECRET: openssl rand -base64 64"
    echo "  Generate ADMIN_PASSWORD_HASH: node -e 'const b=require(\"bcryptjs\");b.hash(\"your-pw\",10).then(h=>console.log(h))'"
    exit 1
fi

echo -e "${GREEN}[OK]${NC} SESSION_SECRET is set"
echo -e "${GREEN}[OK]${NC} ADMIN_SESSION_SECRET is set"
echo -e "${GREEN}[OK]${NC} ADMIN_PASSWORD_HASH is set"

if [ -z "${ADMIN_USERNAME:-}" ]; then
    echo -e "${YELLOW}[INFO]${NC} ADMIN_USERNAME not set, defaulting to 'admin'"
fi

echo ""

# --- Start services ---
echo "Starting Docker services..."
cd "$PROJECT_DIR"
docker compose --env-file .env.staging -f docker-compose.staging.yml up -d --build

echo ""
echo "Waiting for health checks (this may take ~30s)..."

MAX_WAIT=60
WAITED=0
while [ $WAITED -lt $MAX_WAIT ]; do
    STATUS=$(docker inspect --format='{{json .State.Health.Status}}' "$(docker compose -f docker-compose.staging.yml ps -q app)" 2>/dev/null || echo "starting")
    if [ "$STATUS" = '"healthy"' ]; then
        break
    fi
    if [ "$STATUS" = '"unhealthy"' ]; then
        echo -e "${RED}ERROR: App container is unhealthy. Check logs:${NC}"
        echo "  docker compose -f docker-compose.staging.yml logs app"
        exit 1
    fi
    sleep 5
    WAITED=$((WAITED + 5))
done

if [ $WAITED -ge $MAX_WAIT ]; then
    echo -e "${YELLOW}[WARN]${NC} Health check timed out waiting for app to become healthy."
    echo "  Check logs: docker compose -f docker-compose.staging.yml logs app"
    exit 1
fi

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  PetPal Staging is running!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "  App URL:  http://localhost:3000"
echo ""
echo "  Manage:   docker compose -f docker-compose.staging.yml logs -f app"
echo "  Stop:     docker compose -f docker-compose.staging.yml down"
echo ""
