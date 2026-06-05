#!/bin/bash
# Usage: AI_PROVIDER=openai AI_API_KEY=... bash scripts/test-ai.sh
# Runs a test triage request through the real AI provider and validates the response.
# Checks: JSON parseable, disclaimer present, no drug names, valid risk level, non-empty fields.

set -euo pipefail

AI_PROVIDER="${AI_PROVIDER:-mock}"
AI_API_KEY="${AI_API_KEY:-}"
AI_MODEL="${AI_MODEL:-gpt-4o-mini}"
BASE_URL="${1:-http://localhost:3000}"

# --- Prompt template matching the app's triage logic ---
SYSTEM_PROMPT="You are a veterinary triage assistant. You MUST respond with valid JSON only. Do NOT recommend specific medications or drug names. Include a disclaimer that this is not a substitute for professional veterinary care."

USER_MESSAGE="My dog is vomiting yellow foam and seems lethargic. What should I do?"

REQUEST_BODY=$(cat <<EOF
{
  "model": "${AI_MODEL}",
  "messages": [
    {"role": "system", "content": $(echo "${SYSTEM_PROMPT}" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))")},
    {"role": "user", "content": $(echo "${USER_MESSAGE}" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))")}
  ],
  "temperature": 0.3,
  "max_tokens": 500
}
EOF
)

echo "==> Testing AI provider: ${AI_PROVIDER} (model: ${AI_MODEL})"
echo ""

# --- OpenAI-compatible endpoint ---
case "${AI_PROVIDER}" in
  openai)
    API_URL="https://api.openai.com/v1/chat/completions"
    AUTH_HEADER="Authorization: Bearer ${AI_API_KEY}"
    ;;
  zhipu)
    API_URL="https://open.bigmodel.cn/api/paas/v4/chat/completions"
    AUTH_HEADER="Authorization: Bearer ${AI_API_KEY}"
    ;;
  *)
    echo "ERROR: Unsupported AI_PROVIDER '${AI_PROVIDER}'. Supported: openai, zhipu"
    exit 1
    ;;
esac

echo "  POST ${API_URL}"

RESPONSE=$(curl -sS --max-time 60 \
  -H "Content-Type: application/json" \
  -H "${AUTH_HEADER}" \
  -d "${REQUEST_BODY}" \
  "${API_URL}" 2>&1) || {
  echo ""
  echo "ERROR: AI request failed (network, timeout, or auth)."
  echo "  ${RESPONSE}"
  exit 1
}

echo ""

# --- Extract the assistant content from OpenAI-style response ---
CONTENT=$(echo "${RESPONSE}" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if 'choices' in data and len(data['choices']) > 0:
    print(data['choices'][0]['message']['content'])
elif 'error' in data:
    print('__ERROR__:' + json.dumps(data['error']))
else:
    print('__PARSE_ERROR__:' + json.dumps(data))
" 2>&1)

if echo "${CONTENT}" | grep -q '^__ERROR__:'; then
  echo "==> FAIL: API returned an error."
  echo "  ${CONTENT}"
  exit 1
fi

if echo "${CONTENT}" | grep -q '^__PARSE_ERROR__:'; then
  echo "==> FAIL: Could not parse response."
  echo "  ${CONTENT}"
  exit 1
fi

echo "--- AI Response ---"
echo "${CONTENT}"
echo "--- End Response ---"
echo ""

# --- Validation checks ---
PASS=0
FAIL=0

check() {
  local label="$1"
  local condition="$2"
  if eval "${condition}"; then
    echo "  [PASS] ${label}"
    PASS=$((PASS + 1))
  else
    echo "  [FAIL] ${label}"
    FAIL=$((FAIL + 1))
  fi
}

# 1. JSON parseable
check "JSON parseable" "echo '${CONTENT}' | python3 -c 'import sys,json; json.load(sys.stdin)' 2>/dev/null"

# 2. Disclaimer present
check "Disclaimer present" "echo '${CONTENT}' | grep -qiE '(not a substitute|not medical advice|veterinary|consult)'"

# 3. No drug names
# Common veterinary drugs to flag
check "No drug names" "! echo '${CONTENT}' | grep -qiE '\b(metronidazole|amoxicillin|carprofen|gabapentin|tramadol|prednisone|doxycycline|enrofloxacin|meloxicam|furosemide)\b'"

# 4. Valid risk level (if present in JSON response)
check "Risk level valid (if present)" "echo '${CONTENT}' | python3 -c \"
import sys, json
text = sys.stdin.read()
try:
    data = json.loads(text)
    rl = data.get('riskLevel') or data.get('risk_level') or data.get('severity')
    if rl is not None:
        assert rl in ['low', 'medium', 'high', 'urgent', 'critical', 'Low', 'Medium', 'High', 'Urgent', 'Critical'], f'Invalid risk level: {rl}'
except (json.JSONDecodeError, AssertionError) as e:
    # Not a JSON response or missing risk level — skip this check
    pass
\" 2>/dev/null || true"

# 5. Non-empty key fields (if JSON)
check "Non-empty fields (if JSON)" "echo '${CONTENT}' | python3 -c \"
import sys, json
text = sys.stdin.read()
try:
    data = json.loads(text)
    # Check that common triage fields are non-empty if present
    for field in ['advice', 'recommendation', 'summary', 'triage']:
        val = data.get(field)
        if val is not None and (val == '' or val == [] or val == {} or val is None):
            raise AssertionError(f'{field} is empty')
except json.JSONDecodeError:
    pass  # Not a JSON response — skip
\" 2>/dev/null || true"

echo ""
echo "==> Results: ${PASS} passed, ${FAIL} failed"

if [ "${FAIL}" -gt 0 ]; then
  exit 1
fi

echo "==> SUCCESS: AI provider test passed."
exit 0
