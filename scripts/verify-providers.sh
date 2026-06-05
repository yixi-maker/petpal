#!/bin/bash
# Usage: bash scripts/verify-providers.sh [BASE_URL]
# Checks provider health endpoint and reports status per provider.
# Exit code 1 if any provider is in 'error' state.

set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"
HEALTH_URL="${BASE_URL}/api/provider-health"

echo "==> Checking provider health at ${HEALTH_URL} ..."
echo ""

# Fetch health status as table format
RESPONSE=$(curl -sS --max-time 10 "${HEALTH_URL}?format=table" 2>&1) || {
  echo "ERROR: Failed to reach provider-health endpoint."
  echo "  Details: ${RESPONSE}"
  exit 2
}

echo "${RESPONSE}"
echo ""

# Also fetch JSON to check for errors programmatically
JSON=$(curl -sS --max-time 10 "${HEALTH_URL}" 2>/dev/null) || {
  echo "WARNING: Could not fetch JSON for error parsing."
  exit 2
}

# Check if any provider has 'error' status
ERROR_COUNT=$(echo "${JSON}" | grep -o '"status":"error"' | wc -l | tr -d ' ')

if [ "${ERROR_COUNT}" -gt 0 ]; then
  echo ""
  echo "==> FAIL: ${ERROR_COUNT} provider(s) in error state."
  echo "    See details above. Fix missing credentials and re-run."
  exit 1
fi

echo "==> OK: All providers are healthy (no errors)."
exit 0
