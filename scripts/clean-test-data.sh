#!/bin/bash
# ============================================================
# PetPal Clean Test Data
# ============================================================
# Usage: bash scripts/clean-test-data.sh [API_BASE_URL]
#
# Hides posts containing "Smoke test", "CI smoke", or "E2E test" from the
# public feed using the admin PUT /api/admin/posts endpoint.
#
# Requires env vars for admin login. Uses the server's own
# admin account (set ADMIN_USERNAME + ADMIN_PASSWORD).
#
# Examples:
#   bash scripts/clean-test-data.sh
#   ADMIN_USERNAME=admin ADMIN_PASSWORD=admin123 bash scripts/clean-test-data.sh
#   ADMIN_USERNAME=admin ADMIN_PASSWORD=mypw bash scripts/clean-test-data.sh https://your-domain
# ============================================================
set -euo pipefail

API_BASE="${1:-http://localhost:3000}"
COOKIE_JAR="/tmp/petpal-clean-test-cookies"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "============================================"
echo "  PetPal Hide Smoke/E2E Test Posts"
echo "  Target: ${API_BASE}"
echo "============================================"
echo ""

# ---- Determine admin credentials ----

ADMIN_USER="${ADMIN_USERNAME:-admin}"
ADMIN_PASS="${ADMIN_PASSWORD:-admin123}"

echo "Using admin account: ${ADMIN_USER}"
echo ""

# ---- Check server reachable ----

if ! curl -s -o /dev/null -w "%{http_code}" "${API_BASE}/" > /dev/null 2>&1; then
  echo -e "${RED}ERROR: Cannot reach ${API_BASE}${NC}"
  exit 2
fi

echo -e "${GREEN}[OK]${NC} Server reachable"
echo ""

# ---- Login as admin ----

rm -f "$COOKIE_JAR"

echo "Logging in as admin ..."

LOGIN_RESP=$(curl -s -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
  -X POST "${API_BASE}/api/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"${ADMIN_USER}\",\"password\":\"${ADMIN_PASS}\"}" \
  2>&1) || LOGIN_RESP=""

if echo "${LOGIN_RESP}" | grep -q '"success":true'; then
  echo -e "${GREEN}[OK]${NC} Admin login successful"
else
  echo -e "${RED}[FAIL]${NC} Admin login failed"
  echo "  Response: $(echo "${LOGIN_RESP}" | head -c 200)"
  echo "  Set ADMIN_USERNAME and ADMIN_PASSWORD env vars."
  rm -f "$COOKIE_JAR"
  exit 3
fi

echo ""

# ---- Fetch posts ----

echo "Fetching posts from admin API ..."

POSTS_JSON=$(curl -s -b "$COOKIE_JAR" \
  "${API_BASE}/api/admin/posts" \
  2>&1) || POSTS_JSON=""

if [ -z "$POSTS_JSON" ]; then
  echo -e "${RED}[FAIL]${NC} Could not fetch posts"
  rm -f "$COOKIE_JAR"
  exit 4
fi

# ---- Find smoke test posts ----

TEST_POST_PATTERN="Smoke test|CI smoke|E2E test"

echo "Searching for smoke/E2E test posts ..."

MATCHING=$(echo "$POSTS_JSON" | grep -i -E "\"content\"[[:space:]]*:[[:space:]]*\"[^\"]*(${TEST_POST_PATTERN})[^\"]*\"" 2>/dev/null || echo "")

if [ -z "$MATCHING" ]; then
  echo -e "${GREEN}[OK]${NC} No smoke/E2E test posts found. Database is clean."
  rm -f "$COOKIE_JAR"
  exit 0
fi

echo "Found smoke/E2E test posts:"
echo "$MATCHING" | while read -r line; do
  CONTENT=$(echo "$line" | grep -oE '"content"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/"content"[[:space:]]*:[[:space:]]*"//' | tr -d '"')
  echo "  - \"${CONTENT}\""
done
echo ""

# ---- Hide posts using PUT /api/admin/posts ----

HIDDEN=0
FAILED=0

hide_post() {
  local id="$1"
  local content="$2"
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -b "$COOKIE_JAR" \
    -X PUT "${API_BASE}/api/admin/posts" \
    -H "Content-Type: application/json" \
    -d "{\"id\":${id},\"action\":\"HIDE\"}" \
    2>&1) || HTTP_CODE="000"

  if [ "${HTTP_CODE}" = "200" ]; then
    echo -e "  ${GREEN}[HIDDEN]${NC} Post ${id}: ${content}"
    return 0
  else
    echo -e "  ${RED}[FAIL]${NC} Post ${id}: HTTP ${HTTP_CODE}"
    return 1
  fi
}

if command -v jq &> /dev/null; then
  echo "Using jq for precise ID extraction ..."
  POST_IDS=$(echo "$POSTS_JSON" | jq -r '
    .posts[]?
    | select(.content | test("Smoke test|CI smoke|E2E test"; "i"))
    | "\(.id)\t\(.content)"' 2>/dev/null) || POST_IDS=""

  if [ -z "$POST_IDS" ]; then
    POST_IDS=$(echo "$POSTS_JSON" | jq -r '
      .[]?
      | select(.content | test("Smoke test|CI smoke|E2E test"; "i"))
      | "\(.id)\t\(.content)"' 2>/dev/null) || POST_IDS=""
  fi

  if [ -n "$POST_IDS" ]; then
    echo "Hiding smoke/E2E test posts ..."
    while IFS=$'\t' read -r id content; do
      if [ -z "$id" ] || [ "$id" = "null" ]; then continue; fi
      if hide_post "$id" "${content:0:50}"; then
        HIDDEN=$((HIDDEN + 1))
      else
        FAILED=$((FAILED + 1))
      fi
    done <<< "$POST_IDS"
  fi
else
  echo "jq not available — using grep-based extraction ..."
  POST_IDS=$(echo "$POSTS_JSON" | grep -B 3 -i -E "\"content\"[[:space:]]*:[[:space:]]*\"[^\"]*(${TEST_POST_PATTERN})" \
    | grep -oE '"id"[[:space:]]*:[[:space:]]*[0-9]+' \
    | grep -oE '[0-9]+' \
    | sort -u) || POST_IDS=""

  if [ -n "$POST_IDS" ]; then
    echo "Hiding smoke/E2E test posts ..."
    while read -r id; do
      if [ -z "$id" ]; then continue; fi
      if hide_post "$id" "(id ${id})"; then
        HIDDEN=$((HIDDEN + 1))
      else
        FAILED=$((FAILED + 1))
      fi
    done <<< "$POST_IDS"
  fi
fi

echo ""
echo "============================================"
echo "  Summary"
echo "  Hidden: ${HIDDEN}"
echo "  Failed: ${FAILED}"
echo "============================================"
echo ""

rm -f "$COOKIE_JAR"

if [ "${FAILED}" -gt 0 ]; then
  exit 1
fi
exit 0
