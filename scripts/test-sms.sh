#!/bin/bash
# Usage: SMS_PROVIDER=aliyun SMS_ACCESS_KEY=... SMS_SECRET=... SMS_SIGN_NAME=... SMS_TEMPLATE_ID=... PHONE=138... bash scripts/test-sms.sh
# Sends a real test SMS and reports success/failure.
# If SMS_PROVIDER is mock, prints "Skipped: using mock provider"

set -euo pipefail

SMS_PROVIDER="${SMS_PROVIDER:-mock}"
PHONE="${PHONE:-}"

if [ "${SMS_PROVIDER}" = "mock" ]; then
  echo "Skipped: using mock provider"
  exit 0
fi

# --- Validate required env vars ---
MISSING=""
for VAR in SMS_ACCESS_KEY SMS_SECRET SMS_SIGN_NAME SMS_TEMPLATE_ID PHONE; do
  if [ -z "${!VAR:-}" ]; then
    MISSING="${MISSING} ${VAR}"
  fi
done

if [ -n "${MISSING}" ]; then
  echo "ERROR: Missing required environment variables:${MISSING}"
  exit 1
fi

# --- Validate phone format (Chinese mobile: 1[3-9]XXXXXXXXX) ---
if ! echo "${PHONE}" | grep -qE '^1[3-9][0-9]{9}$'; then
  echo "ERROR: PHONE must be an 11-digit Chinese mobile number starting with 1[3-9]."
  exit 1
fi

echo "==> Sending test SMS via ${SMS_PROVIDER} to ${PHONE} ..."

# --- Build Aliyun SMS request ---
# Aliyun SMS SendSms API via HTTPS (simplified — uses common params)
# Reference: https://help.aliyun.com/document_detail/101414.html

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
NONCE=$(od -vN 16 -An -tx1 /dev/urandom | tr -d ' \n')

# Build signature (simplified POP signature)
# In production this should use Aliyun SDK; this script gives a quick manual test.

ENDPOINT="https://dysmsapi.aliyuncs.com"

# Generate signature manually for SendSms
HTTP_METHOD="POST"
SEPARATOR="&"
PARAMS=(
  "AccessKeyId=${SMS_ACCESS_KEY}"
  "Action=SendSms"
  "Format=JSON"
  "PhoneNumbers=${PHONE}"
  "RegionId=cn-hangzhou"
  "SignName=${SMS_SIGN_NAME}"
  "SignatureMethod=HMAC-SHA1"
  "SignatureNonce=${NONCE}"
  "SignatureVersion=1.0"
  "TemplateCode=${SMS_TEMPLATE_ID}"
  "TemplateParam={\"code\":\"888888\"}"
  "Timestamp=${TIMESTAMP}"
  "Version=2017-05-25"
)

# Sort params and build canonical query string
CANONICAL_QUERY=$(printf '%s\n' "${PARAMS[@]}" | sort | tr '\n' '&' | sed 's/&$//')
CANONICAL_QUERY_ENCODED=$(python3 -c "
import urllib.parse
print(urllib.parse.quote('${CANONICAL_QUERY}', safe=''))
" 2>/dev/null || echo "")

if [ -z "${CANONICAL_QUERY_ENCODED}" ]; then
  echo "WARNING: Python3 not available. Falling back to curl with raw params (may fail on special chars)."
  CANONICAL_QUERY_ENCODED="${CANONICAL_QUERY}"
fi

STRING_TO_SIGN="${HTTP_METHOD}&${SEPARATOR}&$(python3 -c "
import urllib.parse
print(urllib.parse.quote('/', safe=''))
")&$(python3 -c "
import urllib.parse
print(urllib.parse.quote('${CANONICAL_QUERY_ENCODED}', safe=''))
")"

SIGNATURE=$(echo -n "${STRING_TO_SIGN}" | openssl dgst -sha1 -hmac "${SMS_SECRET}&" -binary | base64)
SIGNATURE_ENCODED=$(python3 -c "
import urllib.parse
print(urllib.parse.quote('${SIGNATURE}', safe=''))
")

SIGNED_URL="${ENDPOINT}/?Signature=${SIGNATURE_ENCODED}&${CANONICAL_QUERY//\"/\\\"}"

echo "  POST ${ENDPOINT}/"

RESPONSE=$(curl -sS --max-time 15 -X POST "${SIGNED_URL}" 2>&1) || {
  echo ""
  echo "ERROR: SMS request failed (network or timeout)."
  echo "  ${RESPONSE}"
  exit 1
}

echo ""
echo "Response:"
echo "${RESPONSE}" | python3 -m json.tool 2>/dev/null || echo "${RESPONSE}"

# Check for Aliyun error code
if echo "${RESPONSE}" | grep -q '"Code":"OK"'; then
  echo ""
  echo "==> SUCCESS: Test SMS sent to ${PHONE}."
  exit 0
elif echo "${RESPONSE}" | grep -q '"Message"'; then
  echo ""
  echo "==> FAIL: Aliyun returned an error (see response above)."
  exit 1
else
  echo ""
  echo "==> UNKNOWN: Could not parse response (see raw output above)."
  exit 1
fi
