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

# --- Check required env vars ---
if [ -z "${SESSION_SECRET:-}" ]; then
    echo -e "${RED}ERROR: SESSION_SECRET is not set.${NC}"
    echo "  Generate one with: openssl rand -base64 64"
    exit 1
fi

if [ -z "${ADMIN_SESSION_SECRET:-}" ]; then
    echo -e "${RED}ERROR: ADMIN_SESSION_SECRET is not set.${NC}"
    echo "  Generate one with: openssl rand -base64 64"
    exit 1
fi

echo -e "${GREEN}[OK]${NC} SESSION_SECRET is set"
echo -e "${GREEN}[OK]${NC} ADMIN_SESSION_SECRET is set"

# --- Load .env.staging ---
if [ -f "$PROJECT_DIR/.env.staging" ]; then
    echo -e "${GREEN}[OK]${NC} .env.staging found, loading..."
    set -a  # automatically export all variables
    source "$PROJECT_DIR/.env.staging"
    set +a
else
    echo -e "${YELLOW}[WARN]${NC} .env.staging not found."
    echo "  Create one: cp .env.example .env.staging"
    echo "  Then edit .env.staging with your staging configuration."
    echo ""
fi

# --- Warn about optional vars ---
if [ -z "${ADMIN_USERNAME:-}" ]; then
    echo -e "${YELLOW}[WARN]${NC} ADMIN_USERNAME is not set (admin user will not be auto-created)."
fi
if [ -z "${ADMIN_PASSWORD_HASH:-}" ]; then
    echo -e "${YELLOW}[WARN]${NC} ADMIN_PASSWORD_HASH is not set (admin user will not be auto-created)."
    echo "  Generate one with:"
    echo '    node -e '\''const b=require("bcryptjs");b.hash("your-pw",10).then(h=>console.log(h))'\'
fi

echo ""

# --- Start services ---
echo "Starting Docker services..."
cd "$PROJECT_DIR"
docker compose -f docker-compose.staging.yml up -d --build

echo ""
echo "Waiting for health checks (this may take ~30s)..."

# Wait for app container to become healthy
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
    echo "  Check status: docker compose -f docker-compose.staging.yml ps"
    exit 1
fi

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  PetPal Staging is running!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "  App URL:  http://localhost:3000"
echo ""
echo "  Next steps:"
echo "    1. Verify health: curl -f http://localhost:3000/api/auth/me"
echo "    2. Seed admin (if first deploy):"
echo "       Set ADMIN_USERNAME and ADMIN_PASSWORD_HASH env vars and restart."
echo "    3. Test login: curl -X POST http://localhost:3000/api/auth/login \\"
echo "         -H 'Content-Type: application/json' \\"
echo "         -d '{\"phone\":\"13800000001\",\"code\":\"123456\",\"agreementAccepted\":true}'"
echo ""
echo "  View logs:    docker compose -f docker-compose.staging.yml logs -f app"
echo "  Stop:         docker compose -f docker-compose.staging.yml down"
echo "  Restart:      docker compose -f docker-compose.staging.yml restart"
echo ""
