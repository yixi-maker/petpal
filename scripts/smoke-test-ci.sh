#!/bin/bash
# PetPal Smoke Tests (CI variant) — run against localhost:3000
# Usage: bash scripts/smoke-test-ci.sh [BASE_URL]
#
# Same tests as smoke-test.sh but:
#   - Plain-text output (no ANSI colors, CI-friendly)
#   - Exits with code 1 if ANY test fails
#   - Exits with code 2 if the server is unreachable
#
# Intended for CI pipelines (GitHub Actions, GitLab CI, etc.)

set -euo pipefail

BASE="${1:-http://localhost:3000}"
USER_COOKIE_JAR="/tmp/petpal-smoke-ci-user-cookies"
ADMIN_COOKIE_JAR="/tmp/petpal-smoke-ci-admin-cookies"
PASS=0
FAIL=0
SKIP=0

rm -f "$USER_COOKIE_JAR" "$ADMIN_COOKIE_JAR"

# ---- helpers ----

check() {
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
  resp=$(curl "${curl_args[@]}" 2>/dev/null || echo "000")

  if [ "$resp" = "$expected_code" ]; then
    echo "PASS  $desc (HTTP $resp)"
    PASS=$((PASS + 1))
    return 0
  else
    echo "FAIL  $desc (expected $expected_code, got $resp)"
    FAIL=$((FAIL + 1))
    return 1
  fi
}

check_json() {
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
  body=$(curl "${curl_args[@]}" 2>/dev/null || echo "")

  if [ -n "$body" ] && echo "$body" | grep -qE '^[\{\[]'; then
    echo "PASS  $desc (JSON body, $(printf '%s' "$body" | wc -c | tr -d ' ') bytes)"
    PASS=$((PASS + 1))
    printf '%s' "$body"
    return 0
  else
    echo "FAIL  $desc (bad or empty response: ${body:0:120})"
    FAIL=$((FAIL + 1))
    return 1
  fi
}

jsonval() {
  grep -oE "\"$1\"[[:space:]]*:[[:space:]]*\"?[^\",}]+\"?" | head -1 | sed -E 's/.*: *"?([^",}]+)"?.*/\1/'
}

# ---- preflight ----

echo ""
echo "=== PetPal CI Smoke Tests ==="
echo "Target:  $BASE"
echo "Started: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo ""

# Check server is reachable before running tests
if ! curl -s -o /dev/null -w "%{http_code}" "$BASE/" > /dev/null 2>&1; then
  echo "FATAL: Cannot reach $BASE — is the server running?"
  exit 2
fi

# ---- tests ----

echo "--- Phase 1: Unauthenticated ---"
check "GET / returns 200"  GET "/" "" 200
check "GET /api/auth/me returns 401" GET "/api/auth/me" "" 401

echo ""
echo "--- Phase 2: User Auth ---"
LOGIN_DATA='{"phone":"13800000001","code":"123456","agreementAccepted":true}'
check "POST /api/auth/login" POST "/api/auth/login" "$LOGIN_DATA" 200

ME_BODY=$(check_json "GET /api/auth/me" GET "/api/auth/me" "" 200 || echo "")
USER_ID=""
[ -n "$ME_BODY" ] && USER_ID=$(echo "$ME_BODY" | jsonval "id") || true

echo ""
echo "--- Phase 3: Pet Setup ---"
PETS_BODY=$(check_json "GET /api/pets" GET "/api/pets" "" 200 || echo "")
PET_ID=""
[ -n "$PETS_BODY" ] && PET_ID=$(echo "$PETS_BODY" | jsonval "id") || true

if [ -z "$PET_ID" ] || [ "$PET_ID" = "0" ]; then
  echo "INFO   No pets found, creating a test pet..."
  PET_DATA='{"name":"SmokeTestPet","type":"DOG","breed":"Golden Retriever","gender":"MALE","size":"LARGE"}'
  PET_BODY=$(check_json "POST /api/pets" POST "/api/pets" "$PET_DATA" 201 || echo "")
  [ -n "$PET_BODY" ] && PET_ID=$(echo "$PET_BODY" | jsonval "id") || true
fi
echo "INFO   Using pet id = ${PET_ID:-none}"

echo ""
echo "--- Phase 4: Content & Social ---"
if [ -n "$PET_ID" ] && [ "$PET_ID" != "0" ]; then
  POST_DATA="{\"content\":\"CI smoke test $(date +%s)\",\"authorPetId\":$PET_ID}"
  check "POST /api/posts" POST "/api/posts" "$POST_DATA" 201

  TRIAGE_DATA="{\"petId\":$PET_ID,\"symptoms\":\"test\",\"duration\":\"<1天\",\"appetite\":\"正常\",\"drinking\":\"正常\",\"energy\":\"正常\"}"
  check "POST /api/health/triage" POST "/api/health/triage" "$TRIAGE_DATA" 200
else
  echo "SKIP   No pet available for post/triage tests"
  SKIP=$((SKIP + 2))
fi

echo ""
echo "--- Phase 5: Public Endpoints ---"
check "GET /api/places?city=北京" GET "/api/places?city=%E5%8C%97%E4%BA%AC" "" 200

echo ""
echo "--- Phase 6: Admin ---"
ADMIN_DATA='{"username":"admin","password":"admin123"}'
check "POST /api/admin/auth/login" POST "/api/admin/auth/login" "$ADMIN_DATA" 200 "$ADMIN_COOKIE_JAR"
check "GET /api/admin/dashboard" GET "/api/admin/dashboard" "" 200 "$ADMIN_COOKIE_JAR"

# ---- results ----

echo ""
echo "=== Results ==="
echo "Passed:  $PASS"
echo "Failed:  $FAIL"
[ $SKIP -gt 0 ] && echo "Skipped: $SKIP"
echo "Finished: $(date -u +%Y-%m-%dT%H:%M:%SZ)"

if [ $FAIL -gt 0 ]; then
  echo ""
  echo "EXIT 1 — one or more tests failed"
  exit 1
fi

echo ""
echo "EXIT 0 — all tests passed"
exit 0
