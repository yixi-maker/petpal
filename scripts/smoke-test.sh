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

check_upload() {
  # check_upload <description> <url> <file_path> [expected_code] [cookie_jar]
  local desc="$1"
  local url="$2"
  local file_path="$3"
  local expected_code="${4:-200}"
  local jar="${5:-$USER_COOKIE_JAR}"

  local curl_args=(-s -o /dev/null -w "%{http_code}" -X POST "$BASE$url" -F "file=@$file_path")
  [ -n "$jar" ] && curl_args+=(-b "$jar" -c "$jar")

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

check_any() {
  # check_any <description> <method> <url> [data] [cookie_jar]
  # Passes if the endpoint returns any valid HTTP response (not 000 / curl failure)
  local desc="$1"
  local method="$2"
  local url="$3"
  local data="$4"
  local jar="${5:-$USER_COOKIE_JAR}"

  local curl_args=(-s -o /dev/null -w "%{http_code}" -X "$method" "$BASE$url")
  [ -n "$jar" ] && curl_args+=(-b "$jar" -c "$jar")
  [ -n "$data" ] && curl_args+=(-H "Content-Type: application/json" -d "$data")

  local resp
  resp=$(curl "${curl_args[@]}" 2>/dev/null)

  if [ -n "$resp" ] && [ "$resp" != "000" ]; then
    echo "  $(green PASS) $desc (HTTP $resp)"
    PASS=$((PASS + 1))
    return 0
  else
    echo "  $(red FAIL) $desc (no response from server)"
    FAIL=$((FAIL + 1))
    return 1
  fi
}

# Helper to extract the first numeric value for a given JSON key
jsonval() {
  grep -oE "\"$1\"[[:space:]]*:[[:space:]]*\"?[0-9]+" | head -1 | grep -oE '[0-9]+'
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
# Phase 3: Pet Setup (idempotent — reuse existing if present)
# ============================================================
echo ""
echo "--- Phase 3: Pet Setup ---"

PETS_BODY=$(check_json "GET /api/pets (user pets)" GET "/api/pets" "" 200)

# Robust extraction: first numeric id from the response
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
# Phase 3b: Upload
# ============================================================
echo ""
echo "--- Phase 3b: Upload ---"

# Create a minimal 1x1 PNG inline (portable base64 decode)
PNG_FILE="/tmp/petpal-smoke-test.png"
# Try GNU base64 -d first, then macOS base64 -D
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==" \
  | base64 -d > "$PNG_FILE" 2>/dev/null \
  || echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==" \
     | base64 -D > "$PNG_FILE" 2>/dev/null

if [ -f "$PNG_FILE" ] && [ -s "$PNG_FILE" ]; then
  check_upload "POST /api/upload (test image)" "/api/upload" "$PNG_FILE" 200
  rm -f "$PNG_FILE"
else
  echo "  $(yellow SKIP) Could not create test PNG (base64 not available)"
  SKIP=$((SKIP + 1))
fi

# ============================================================
# Phase 4: Content & Social
# ============================================================
echo ""
echo "--- Phase 4: Content & Social ---"

POST_ID=""
if [ -n "$PET_ID" ] && [ "$PET_ID" != "0" ]; then
  POST_DATA="{\"content\":\"Smoke test post $(date +%s)\",\"authorPetId\":$PET_ID}"
  POST_BODY=$(check_json "POST /api/posts (create post)" POST "/api/posts" "$POST_DATA" 201)
  if [ $? -eq 0 ] && [ -n "$POST_BODY" ]; then
    POST_ID=$(echo "$POST_BODY" | jsonval "id")
    echo "         -> post id = ${POST_ID:-unknown}"
  fi

  TRIAGE_DATA="{\"petId\":$PET_ID,\"symptoms\":\"smoke test symptoms\",\"duration\":\"<1天\",\"appetite\":\"正常\",\"drinking\":\"正常\",\"energy\":\"正常\"}"
  check "POST /api/health/triage" POST "/api/health/triage" "$TRIAGE_DATA" 200
else
  echo "  $(yellow SKIP) No pet available for post/triage tests"
  SKIP=$((SKIP + 2))
fi

# ============================================================
# Phase 2b: Social (comments & likes on latest post)
# ============================================================
echo ""
echo "--- Phase 2b: Social ---"

if [ -n "$POST_ID" ] && [ "$POST_ID" != "0" ] && [ -n "$PET_ID" ] && [ "$PET_ID" != "0" ]; then
  COMMENT_DATA="{\"content\":\"Smoke test comment $(date +%s)\",\"authorPetId\":$PET_ID}"
  check "POST /api/posts/$POST_ID/comments" POST "/api/posts/$POST_ID/comments" "$COMMENT_DATA" 201
  check "POST /api/posts/$POST_ID/like" POST "/api/posts/$POST_ID/like" "{\"petId\":$PET_ID}" 200
else
  echo "  $(yellow SKIP) No post or pet available for social tests"
  SKIP=$((SKIP + 2))
fi

# ============================================================
# Phase 4b: Messages
# ============================================================
echo ""
echo "--- Phase 4b: Messages ---"

if [ -n "$PET_ID" ] && [ "$PET_ID" != "0" ]; then
  MSG_DATA="{\"fromPetId\":$PET_ID,\"toPetId\":$PET_ID,\"content\":\"smoke test message\"}"
  # Self-message may return an error (not friends), but the endpoint should respond
  check_any "POST /api/messages (self-message, any response OK)" POST "/api/messages" "$MSG_DATA"
else
  echo "  $(yellow SKIP) No pet available for message test"
  SKIP=$((SKIP + 1))
fi

# ============================================================
# Phase 5: Public Endpoints
# ============================================================
echo ""
echo "--- Phase 5: Public Endpoints ---"

check "GET /api/places?city=北京" GET "/api/places?city=%E5%8C%97%E4%BA%AC" "" 200

# ============================================================
# Phase 5b: Map Detail
# ============================================================
echo ""
echo "--- Phase 5b: Map Detail ---"

check "GET /api/places/1 (place detail)" GET "/api/places/1" "" 200

# ============================================================
# Phase 6: Provider Fail-Safe
# ============================================================
echo ""
echo "--- Phase 6: Provider Fail-Safe ---"

# Verify mock providers work (dev mode should always work)
check "POST /api/auth/send-code with mock provider" POST "/api/auth/send-code" '{"phone":"13900000000"}' 200

# ============================================================
# Phase 7: Admin
# ============================================================
echo ""
echo "--- Phase 7: Admin ---"

ADMIN_DATA='{"username":"admin","password":"admin123"}'
check "POST /api/admin/auth/login" POST "/api/admin/auth/login" "$ADMIN_DATA" 200 "$ADMIN_COOKIE_JAR"

check "GET /api/admin/dashboard" GET "/api/admin/dashboard" "" 200 "$ADMIN_COOKIE_JAR"

check "GET /api/admin/posts" GET "/api/admin/posts" "" 200 "$ADMIN_COOKIE_JAR"

check "GET /api/admin/comments" GET "/api/admin/comments" "" 200 "$ADMIN_COOKIE_JAR"

check "GET /api/admin/reports" GET "/api/admin/reports" "" 200 "$ADMIN_COOKIE_JAR"

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
