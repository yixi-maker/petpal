#!/bin/bash
# ============================================================
# PetPal Admin Account Setup
# ============================================================
# Usage: bash scripts/setup-admin.sh [API_BASE_URL]
#
# Verifies that an admin account exists and can log in on a
# running PetPal instance.
#
# Requires env vars:
#   ADMIN_USERNAME   — admin username (e.g. "admin")
#   ADMIN_PASSWORD   — admin plaintext password (e.g. "admin123")
#
# The server's ensureAdmin() function (src/lib/admin-setup.ts)
# creates the admin account on first login attempt, using
# ADMIN_PASSWORD_HASH from the server's .env.staging.
#
# This script uses the PLAINTEXT password to log in — it does
# NOT need or use ADMIN_PASSWORD_HASH directly.
#
# Examples:
#   ADMIN_USERNAME=admin ADMIN_PASSWORD=admin123 bash scripts/setup-admin.sh
#   ADMIN_USERNAME=admin ADMIN_PASSWORD=admin123 bash scripts/setup-admin.sh https://your-domain
# ============================================================
set -euo pipefail

API_BASE="${1:-http://localhost:3000}"
COOKIE_JAR="/tmp/petpal-setup-admin-cookies"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "============================================"
echo "  PetPal Admin Account Setup"
echo "  Target: ${API_BASE}"
echo "============================================"
echo ""

# ---- Validate env vars ----

if [ -z "${ADMIN_USERNAME:-}" ]; then
  echo -e "${RED}ERROR: ADMIN_USERNAME is not set.${NC}"
  echo "  export ADMIN_USERNAME=\"admin\""
  exit 1
fi

if [ -z "${ADMIN_PASSWORD:-}" ]; then
  echo -e "${RED}ERROR: ADMIN_PASSWORD is not set.${NC}"
  echo "  export ADMIN_PASSWORD=\"your-password\""
  exit 1
fi

echo -e "${GREEN}[OK]${NC} ADMIN_USERNAME = ${ADMIN_USERNAME}"
echo ""

# ---- Check server reachable ----

if ! curl -s -o /dev/null -w "%{http_code}" "${API_BASE}/" > /dev/null 2>&1; then
  echo -e "${RED}ERROR: Cannot reach ${API_BASE}${NC}"
  echo "  Is the server running?"
  exit 2
fi

echo -e "${GREEN}[OK]${NC} Server reachable at ${API_BASE}"
echo ""

# ---- Login as admin ----

rm -f "$COOKIE_JAR"

echo "Logging in with ADMIN_USERNAME + ADMIN_PASSWORD ..."

HTTP_CODE=$(curl -s -o /tmp/petpal-admin-response.txt -w "%{http_code}" \
  -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
  -X POST "${API_BASE}/api/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"${ADMIN_USERNAME}\",\"password\":\"${ADMIN_PASSWORD}\"}" \
  2>&1) || HTTP_CODE="000"

RESP_BODY=$(cat /tmp/petpal-admin-response.txt 2>/dev/null || echo "")

if [ "${HTTP_CODE}" = "200" ] && echo "${RESP_BODY}" | grep -q '"success":true'; then
  echo -e "${GREEN}[OK]${NC} Admin login successful (HTTP ${HTTP_CODE})"
else
  echo -e "${RED}[FAIL]${NC} Admin login failed (HTTP ${HTTP_CODE})"
  echo "  Response: $(echo "${RESP_BODY}" | head -c 300)"
  echo ""
  echo "  Possible causes:"
  echo "  1. Server .env.staging does not have ADMIN_PASSWORD_HASH set."
  echo "     → Set ADMIN_PASSWORD_HASH in server env, restart server, re-run."
  echo "  2. Admin account exists but password is different."
  echo "     → Use the correct ADMIN_PASSWORD for the existing account."
  echo "  3. Server is in dev mode — admin/admin123 should work."
  rm -f "$COOKIE_JAR" /tmp/petpal-admin-response.txt
  exit 3
fi

# ---- Verify dashboard access ----

echo ""
echo "Verifying dashboard access ..."

DASHBOARD_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -b "$COOKIE_JAR" \
  "${API_BASE}/api/admin/dashboard" 2>&1) || DASHBOARD_CODE="000"

if [ "${DASHBOARD_CODE}" = "200" ]; then
  echo -e "${GREEN}[OK]${NC} Dashboard accessible (HTTP ${DASHBOARD_CODE})"
else
  echo -e "${YELLOW}[WARN]${NC} Dashboard returned HTTP ${DASHBOARD_CODE}"
fi

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  Admin account is ready!${NC}"
echo -e "${GREEN}  Username:  ${ADMIN_USERNAME}${NC}"
echo -e "${GREEN}  Login URL: ${API_BASE}/admin/login${NC}"
echo -e "${GREEN}============================================${NC}"

rm -f "$COOKIE_JAR" /tmp/petpal-admin-response.txt
