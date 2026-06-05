#!/bin/bash
# Usage: bash scripts/clean-test-data.sh [API_BASE_URL]
# Removes posts containing "Smoke test" or "CI smoke" from the database.
# Requires admin login. Uses default admin credentials from env vars,
# or falls back to staging defaults (admin / admin123).
#
# Examples:
#   bash scripts/clean-test-data.sh
#   bash scripts/clean-test-data.sh https://staging.petpal.example.com

set -euo pipefail

API_BASE="${1:-http://localhost:3000}"
COOKIE_JAR="/tmp/petpal-clean-test-cookies"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "============================================"
echo "  PetPal Clean Test Data"
echo "  Target: ${API_BASE}"
echo "============================================"
echo ""

# ---- Determine admin credentials ----
ADMIN_USER="${ADMIN_USERNAME:-admin}"
ADMIN_PASS="admin123"  # staging default

# If password is explicitly set via env, use a hash-based approach
if [ -n "${ADMIN_PASSWORD:-}" ]; then
  ADMIN_PASS="${ADMIN_PASSWORD}"
fi

echo "Using admin account: ${ADMIN_USER}"
echo ""

# ---- Check server is reachable ----

if ! curl -s -o /dev/null -w "%{http_code}" "${API_BASE}/" > /dev/null 2>&1; then
  echo -e "${RED}ERROR: Cannot reach ${API_BASE}${NC}"
  echo "  Is the server running?"
  exit 2
fi

echo -e "${GREEN}[OK]${NC} Server is reachable"
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
  echo "  Set ADMIN_USERNAME and ADMIN_PASSWORD env vars if defaults don't match."
  rm -f "$COOKIE_JAR"
  exit 3
fi

echo ""

# ---- Fetch posts to find test data ----

echo "Fetching posts from admin API ..."

POSTS_JSON=$(curl -s -b "$COOKIE_JAR" \
  "${API_BASE}/api/admin/posts" \
  2>&1) || POSTS_JSON=""

if [ -z "$POSTS_JSON" ]; then
  echo -e "${RED}[FAIL]${NC} Could not fetch posts from admin API"
  rm -f "$COOKIE_JAR"
  exit 4
fi

# ---- Identify and clean test posts ----
# Look for posts whose content matches smoke test patterns

echo "Searching for smoke test posts ..."

# Extract post IDs where content matches "Smoke test" or "CI smoke"
# Using grep to find matching content lines, then extract nearby "id" values
# This approach handles the JSON response structure flexibly

MATCHING_POSTS=$(echo "$POSTS_JSON" | grep -i -E '"content"[[:space:]]*:[[:space:]]*"[^"]*(Smoke test|CI smoke)[^"]*"' 2>/dev/null || echo "")

if [ -z "$MATCHING_POSTS" ]; then
  echo -e "${GREEN}[OK]${NC} No smoke test posts found. Database is clean."
  rm -f "$COOKIE_JAR"
  exit 0
fi

# Extract content lines to show what we found
echo ""
echo "Found smoke test posts:"
echo "$MATCHING_POSTS" | while read -r line; do
  CONTENT=$(echo "$line" | grep -oE '"content"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/"content"[[:space:]]*:[[:space:]]*"//' | tr -d '"')
  echo "  - \"${CONTENT}\""
done
echo ""

# Delete approach: use the admin posts DELETE endpoint
# We need to extract IDs. Let's do a more targeted fetch.

# Use jq if available, otherwise fall back to grep extraction
DELETED=0
FAILED=0

if command -v jq &> /dev/null; then
  # jq is available — precise extraction
  echo "Using jq for precise ID extraction ..."

  POST_IDS=$(echo "$POSTS_JSON" | jq -r '
    .posts[]?
    | select(.content | test("Smoke test|CI smoke"; "i"))
    | .id' 2>/dev/null) || POST_IDS=""

  if [ -z "$POST_IDS" ]; then
    # Try alternate JSON shape (posts might be at top level)
    POST_IDS=$(echo "$POSTS_JSON" | jq -r '
      .[]?
      | select(.content | test("Smoke test|CI smoke"; "i"))
      | .id' 2>/dev/null) || POST_IDS=""
  fi

  if [ -n "$POST_IDS" ]; then
    echo "Deleting smoke test posts ..."
    echo "$POST_IDS" | while read -r id; do
      if [ -z "$id" ] || [ "$id" = "null" ]; then
        continue
      fi
      HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
        -b "$COOKIE_JAR" \
        -X DELETE "${API_BASE}/api/admin/posts/${id}" \
        2>&1) || HTTP_CODE="000"

      if [ "${HTTP_CODE}" = "200" ] || [ "${HTTP_CODE}" = "204" ]; then
        echo -e "  ${GREEN}[DELETED]${NC} Post ID ${id} (HTTP ${HTTP_CODE})"
        DELETED=$((DELETED + 1))
      else
        echo -e "  ${RED}[FAIL]${NC} Post ID ${id} (HTTP ${HTTP_CODE})"
        FAILED=$((FAILED + 1))
      fi
    done
  fi
else
  # Fallback: extract IDs from the JSON using grep/sed
  echo "jq not available — using grep-based extraction ..."

  # Extract IDs near matching content lines
  # Strategy: find lines with "Smoke test" or "CI smoke", then look backward for an "id" field
  POST_IDS=$(echo "$POSTS_JSON" | grep -B 3 -i -E '"content"[[:space:]]*:[[:space:]]*"[^"]*(Smoke test|CI smoke)' \
    | grep -oE '"id"[[:space:]]*:[[:space:]]*[0-9]+' \
    | grep -oE '[0-9]+' \
    | sort -u) || POST_IDS=""

  if [ -n "$POST_IDS" ]; then
    echo "Deleting smoke test posts ..."
    echo "$POST_IDS" | while read -r id; do
      if [ -z "$id" ]; then
        continue
      fi
      HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
        -b "$COOKIE_JAR" \
        -X DELETE "${API_BASE}/api/admin/posts/${id}" \
        2>&1) || HTTP_CODE="000"

      if [ "${HTTP_CODE}" = "200" ] || [ "${HTTP_CODE}" = "204" ]; then
        echo -e "  ${GREEN}[DELETED]${NC} Post ID ${id} (HTTP ${HTTP_CODE})"
        DELETED=$((DELETED + 1))
      else
        echo -e "  ${RED}[FAIL]${NC} Post ID ${id} (HTTP ${HTTP_CODE})"
        FAILED=$((FAILED + 1))
      fi
    done
  fi
fi

echo ""
echo "============================================"
echo "  Cleanup Summary"
echo "  Deleted: ${DELETED}"
echo "  Failed:  ${FAILED}"
echo "============================================"
echo ""

rm -f "$COOKIE_JAR"

if [ "${FAILED}" -gt 0 ]; then
  exit 1
fi

exit 0
