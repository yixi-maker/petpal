#!/bin/bash
# PetPal Smoke Tests — run against localhost:3000
# Usage: bash scripts/smoke-test.sh [BASE_URL]
#
# Prerequisites:
#   1. A PetPal dev server running on localhost:3000 (npm run dev)
#   2. SMS_PROVIDER is NOT set to "production" (mock mode with code 123456)
#
# The script creates its own test data and is safe to run repeatedly.

set -o pipefail

BASE="${1:-http://localhost:3000}"
USER_COOKIE_JAR="/tmp/petpal-smoke-user-cookies"
ADMIN_COOKIE_JAR="/tmp/petpal-smoke-admin-cookies"
PASS=0
FAIL=0
SKIP=0

# Clean up old cookie jars
rm -f "$USER_COOKIE_JAR" "$ADMIN_COOKIE_JAR"

# ---- helpers ----

red()   { printf '\033[31m%s\033[0m' "$*"; }
green() { printf '\033[32m%s\033[0m' "$*"; }
yellow(){ printf '\033[33m%s\033[0m' "$*"; }

check() {
  # check <description> <method> <url> [data] [expected_code] [cookie_jar]
  local desc="$1"
  local method="$2"
  local url="$3"
  local data="$4"
  local expected_code="${5:-200}"
  local jar="${6:-$USER_COOKIE_JAR}"

  local curl_args=(-s -o /dev/null -w "%{http_code}" -X "$method" "$BASE$url")
  [ -n "$jar" ] && curl_args+=(-b "$jar" -c "$jar")
  [ -n "$data" ] && curl_args+=(-H "Content-Type: application/json" -d "$data")

  local resp
  resp=$(curl "${curl_args[@]}" 2>/dev/null)

  if [ "$resp" = "$expected_code" ]; then
    echo "  $(green PASS) $desc (HTTP $resp)"
    PASS=$((PASS + 1))
    return 0
  else
    echo "  $(red FAIL) $desc (expected $expected_code, got $resp)"
    FAIL=$((FAIL + 1))
    return 1
  fi
}

check_json() {
  # check_json <description> <method> <url> [data] [expected_code] [cookie_jar]
  local desc="$1"
  local method="$2"
  local url="$3"
  local data="$4"
  local expected_code="${5:-200}"
  local jar="${6:-$USER_COOKIE_JAR}"

  local curl_args=(-s -X "$method" "$BASE$url")
  [ -n "$jar" ] && curl_args+=(-b "$jar" -c "$jar")
  [ -n "$data" ] && curl_args+=(-H "Content-Type: application/json" -d "$data")

  local body
  body=$(curl "${curl_args[@]}" 2>/dev/null)

  # Quick check: body is non-empty and looks like JSON (starts with { or [)
  if [ -n "$body" ] && { echo "$body" | grep -qE '^[\{\[]'; }; then
    echo "  $(green PASS) $desc (JSON body received, $(echo "$body" | wc -c | tr -d ' ') bytes)"
    PASS=$((PASS + 1))
    # Return the body via stdout for callers to parse
    printf '%s' "$body"
    return 0
  else
    echo "  $(red FAIL) $desc (bad or empty response: ${body:0:120})"
    FAIL=$((FAIL + 1))
    return 1
  fi
}

# Helper to extract a value from JSON using grep (no jq dependency)
jsonval() {
  # Simple extraction: "key":"value" or "key":123 — first match only
  grep -oE "\"$1\"[[:space:]]*:[[:space:]]*\"?[^\",}]+\"?" | head -1 | sed -E 's/.*: *"?([^",}]+)"?.*/\1/'
}

# ---- main ----

echo ""
echo "============================================="
echo "  PetPal Smoke Tests"
echo "  Target: $BASE"
echo "  Time:   $(date '+%Y-%m-%d %H:%M:%S')"
echo "============================================="
echo ""

# ============================================================
# Phase 1: Unauthenticated
# ============================================================
echo "--- Phase 1: Unauthenticated ---"

check "GET / redirects to login"  GET "/" "" 307
check "GET /health redirects to login" GET "/health" "" 307
check "GET /api/auth/me returns 401 (not logged in)" GET "/api/auth/me" "" 401

# ============================================================
# Phase 2: User Authentication
# ============================================================
echo ""
echo "--- Phase 2: User Authentication ---"

LOGIN_DATA='{"phone":"13800000001","code":"123456","agreementAccepted":true}'
check "POST /api/auth/login (mock code 123456)" POST "/api/auth/login" "$LOGIN_DATA" 200

ME_BODY=$(check_json "GET /api/auth/me (logged-in user)" GET "/api/auth/me" "" 200)
if [ $? -eq 0 ] && [ -n "$ME_BODY" ]; then
  USER_ID=$(echo "$ME_BODY" | jsonval "id")
  echo "         -> user id = ${USER_ID:-unknown}"
else
  USER_ID=""
fi

# ============================================================
# Phase 3: Pet Setup (create if needed)
# ============================================================
echo ""
echo "--- Phase 3: Pet Setup ---"

PETS_BODY=$(check_json "GET /api/pets (user pets)" GET "/api/pets" "" 200)

PET_ID=""
if [ -n "$PETS_BODY" ]; then
  PET_ID=$(echo "$PETS_BODY" | jsonval "id")
fi

if [ -z "$PET_ID" ] || [ "$PET_ID" = "0" ]; then
  echo "  $(yellow INFO) No pets found, creating a test pet..."
  PET_DATA='{"name":"SmokeTestPet","type":"DOG","breed":"Golden Retriever","gender":"MALE","size":"LARGE"}'
  PET_BODY=$(check_json "POST /api/pets (create test pet)" POST "/api/pets" "$PET_DATA" 201)
  if [ $? -eq 0 ] && [ -n "$PET_BODY" ]; then
    PET_ID=$(echo "$PET_BODY" | jsonval "id")
    echo "         -> created pet id = ${PET_ID:-unknown}"
  fi
else
  echo "         -> using existing pet id = $PET_ID"
fi

# ============================================================
# Phase 4: Content & Social
# ============================================================
echo ""
echo "--- Phase 4: Content & Social ---"

if [ -n "$PET_ID" ] && [ "$PET_ID" != "0" ]; then
  POST_DATA="{\"content\":\"Smoke test post $(date +%s)\",\"authorPetId\":$PET_ID}"
  check "POST /api/posts (create post)" POST "/api/posts" "$POST_DATA" 201

  TRIAGE_DATA="{\"petId\":$PET_ID,\"symptoms\":\"smoke test symptoms\",\"duration\":\"<1天\",\"appetite\":\"正常\",\"drinking\":\"正常\",\"energy\":\"正常\"}"
  check "POST /api/health/triage" POST "/api/health/triage" "$TRIAGE_DATA" 200
else
  echo "  $(yellow SKIP) No pet available for post/triage tests"
  SKIP=$((SKIP + 2))
fi

# ============================================================
# Phase 5: Public Endpoints
# ============================================================
echo ""
echo "--- Phase 5: Public Endpoints ---"

check "GET /api/places?city=北京" GET "/api/places?city=%E5%8C%97%E4%BA%AC" "" 200

# ============================================================
# Phase 6: Provider Fail-Safe (no production config = no silent pass)
# ============================================================
echo ""
echo "--- Phase 6: Provider Fail-Safe ---"

# Verify mock providers work (dev mode should always work)
check "POST /api/auth/send-code with mock provider" POST "/api/auth/send-code" '{"phone":"13900000000"}' 200

# ============================================================
# Phase 7: Admin
# ============================================================
echo ""
echo "--- Phase 6: Admin ---"

ADMIN_DATA='{"username":"admin","password":"admin123"}'
check "POST /api/admin/auth/login" POST "/api/admin/auth/login" "$ADMIN_DATA" 200 "$ADMIN_COOKIE_JAR"

check "GET /api/admin/dashboard" GET "/api/admin/dashboard" "" 200 "$ADMIN_COOKIE_JAR"

# ============================================================
# Results
# ============================================================
echo ""
echo "============================================="
if [ $FAIL -eq 0 ] && [ $SKIP -eq 0 ]; then
  echo "  $(green ALL CHECKS PASSED)"
elif [ $FAIL -eq 0 ]; then
  echo "  $(green ALL CHECKS PASSED) ($SKIP skipped)"
else
  echo "  $(red SOME CHECKS FAILED)"
fi
echo "  Passed:  $PASS"
echo "  Failed:  $FAIL"
[ $SKIP -gt 0 ] && echo "  Skipped: $SKIP"
echo "============================================="
echo ""

exit $FAIL
