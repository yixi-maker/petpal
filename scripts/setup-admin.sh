#!/bin/bash
# Usage: bash scripts/setup-admin.sh [API_BASE_URL]
# Creates the admin account on a running PetPal instance.
# Requires ADMIN_USERNAME and ADMIN_PASSWORD_HASH env vars.
#
# The admin account is auto-created by the server on first successful
# POST /api/admin/auth/login when the env vars are set. This script
# triggers that login, verifies it succeeds, and reports the result.
#
# Examples:
#   export ADMIN_USERNAME="admin"
#   export ADMIN_PASSWORD_HASH='$2a$10$...'
#   bash scripts/setup-admin.sh
#   bash scripts/setup-admin.sh https://staging.petpal.example.com

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
  echo "  Set it in your environment or .env.staging:"
  echo "  export ADMIN_USERNAME=\"admin\""
  exit 1
fi

if [ -z "${ADMIN_PASSWORD_HASH:-}" ]; then
  echo -e "${RED}ERROR: ADMIN_PASSWORD_HASH is not set.${NC}"
  echo "  Generate one with:"
  echo "  node -e \"const b=require('bcryptjs');b.hash('your-password',10).then(h=>console.log(h))\""
  echo "  Then export it:"
  echo "  export ADMIN_PASSWORD_HASH='\$2a\$10\$...'"
  exit 1
fi

echo -e "${GREEN}[OK]${NC} ADMIN_USERNAME = ${ADMIN_USERNAME}"
echo -e "${GREEN}[OK]${NC} ADMIN_PASSWORD_HASH = ${ADMIN_PASSWORD_HASH:0:12}..."
echo ""

# ---- Check server is reachable ----

if ! curl -s -o /dev/null -w "%{http_code}" "${API_BASE}/" > /dev/null 2>&1; then
  echo -e "${RED}ERROR: Cannot reach ${API_BASE}${NC}"
  echo "  Is the server running?"
  exit 2
fi

echo -e "${GREEN}[OK]${NC} Server is reachable at ${API_BASE}"
echo ""

# ---- Trigger admin account creation via login ----
# The server's admin-setup module auto-creates the admin account
# on first POST /api/admin/auth/login when env vars match.

rm -f "$COOKIE_JAR"

echo "Triggering admin account creation via POST /api/admin/auth/login ..."

LOGIN_RESP=$(curl -s -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
  -X POST "${API_BASE}/api/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"${ADMIN_USERNAME}\",\"password\":\"SETUP_VIA_HASH_ONLY\"}" \
  2>&1) || true

# The login endpoint may use the password from the env hash directly.
# If the server's admin-setup uses env var comparison, the password field
# may be ignored — the env ADMIN_PASSWORD_HASH is what matters.
# Try a second approach: POST with the hash in a setup-specific field.

# Actually, the canonical approach: the admin-setup module checks
# ADMIN_USERNAME and ADMIN_PASSWORD_HASH from process.env and creates
# the account. The login endpoint just needs to trigger the ensureAdmin()
# call. Let's try a dedicated approach — just hit the endpoint.

echo ""
echo "Attempting admin login to trigger auto-creation ..."

HTTP_CODE=$(curl -s -o /tmp/petpal-admin-response.txt -w "%{http_code}" \
  -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
  -X POST "${API_BASE}/api/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"${ADMIN_USERNAME}\",\"password\":\"setup-via-env-hash\"}" \
  2>&1) || HTTP_CODE="000"

RESP_BODY=$(cat /tmp/petpal-admin-response.txt 2>/dev/null || echo "")

echo "  HTTP status: ${HTTP_CODE}"
echo "  Response:    $(echo "${RESP_BODY}" | head -c 200)"

# ---- Verify ----
# Check if we got a successful login response or a session cookie

if [ "${HTTP_CODE}" = "200" ] && echo "${RESP_BODY}" | grep -q '"success":true'; then
  echo ""
  echo -e "${GREEN}============================================${NC}"
  echo -e "${GREEN}  Admin account is ready!${NC}"
  echo -e "${GREEN}  Username: ${ADMIN_USERNAME}${NC}"
  echo -e "${GREEN}  Login URL: ${API_BASE}/admin/login${NC}"
  echo -e "${GREEN}============================================${NC}"

  # Verify dashboard access with the session cookie
  echo ""
  echo "Verifying admin dashboard access ..."
  DASHBOARD_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -b "$COOKIE_JAR" \
    "${API_BASE}/api/admin/dashboard" 2>&1) || DASHBOARD_CODE="000"

  if [ "${DASHBOARD_CODE}" = "200" ]; then
    echo -e "${GREEN}[OK]${NC} Dashboard accessible (HTTP ${DASHBOARD_CODE})"
  else
    echo -e "${YELLOW}[WARN]${NC} Dashboard returned HTTP ${DASHBOARD_CODE} (may need manual investigation)"
  fi

  rm -f "$COOKIE_JAR" /tmp/petpal-admin-response.txt
  exit 0
fi

# If we didn't get success, the admin account may need to be created differently
# The server's ensureAdmin() function is called on login attempt.
# In production mode, the password from the request must match the hash.
# The actual password is known only to the operator.

echo ""
echo -e "${YELLOW}[INFO]${NC} Direct login didn't return success=true."
echo "  The admin account may already exist, or the server needs the actual"
echo "  plaintext password that corresponds to ADMIN_PASSWORD_HASH."
echo ""
echo "  If you know the plaintext password, try:"
echo "  curl -X POST ${API_BASE}/api/admin/auth/login \\"
echo "    -H \"Content-Type: application/json\" \\"
echo "    -d '{\"username\":\"${ADMIN_USERNAME}\",\"password\":\"YOUR_ACTUAL_PASSWORD\"}'"
echo ""
echo "  To generate a new password hash:"
echo "  node -e \"const b=require('bcryptjs');b.hash('your-new-password',10).then(h=>console.log(h))\""

# Clean up
rm -f "$COOKIE_JAR" /tmp/petpal-admin-response.txt
exit 1
