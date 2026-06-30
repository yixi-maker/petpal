# PetPal Provider Roadmap

> Last updated: 2026-06-30
> Purpose: track real Provider integration status, priority, and verification steps.

## Current Staging Status

| Provider | Status | Notes |
|----------|--------|-------|
| PostgreSQL | ✅ configured | Migrations deployed, healthy |
| Redis | ✅ configured | Code store + rate limit active |
| Maps (AMAP) | ✅ configured | Real AMAP SDK, markers, navigation deep-link |
| SMS | 🔶 mock | Aliyun provider implemented, real creds needed |
| AI | 🔶 mock | OpenAI/Zhipu provider implemented, real key needed |
| Storage | 🔶 mock | S3/OSS provider implemented, bucket needed |
| Moderation | 🔶 mock | Fail-closed gate implemented, Green service needed |
| Sentry | 🔶 ready | SDK installed, DSN needed |

## Priority Order

1. **Sentry** — zero-infra cost to start, catch staging errors immediately
2. **OSS/S3** — pet avatars and post images need real storage for beta
3. **AI** — health triage needs real AI for beta credibility
4. **SMS** — real login codes needed before public use
5. **Moderation** — content safety required before public launch

## Provider Details

### 1. Sentry

**Files:** `sentry.client.config.ts`, `sentry.server.config.ts`, `src/lib/monitoring.ts`

**To enable:**
1. Create Sentry project → get DSN
2. Add `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` to `.env.staging`
3. Rebuild: phone/symptom data is already redacted in `beforeSend`

**Verify:** trigger a test error, confirm it appears in Sentry dashboard.

### 2. OSS / S3 Storage

**File:** `src/lib/storage-provider.ts` (S3StorageProvider with AWS SigV4)

**To enable:**
1. Create OSS bucket / S3 bucket
2. Set in `.env.staging`: `STORAGE_PROVIDER=s3`, `STORAGE_ENDPOINT`, `STORAGE_BUCKET`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`, `STORAGE_REGION`
3. Rebuild

**Verify:** upload a pet avatar via `/pets/[id]/edit`, confirm URL is from bucket, not `/uploads/`.

### 3. AI (OpenAI / Zhipu)

**File:** `src/lib/ai-provider.ts` (callRealAI with 15s timeout, JSON validation, disclaimer injection)

**To enable:**
1. Get API key from OpenAI or Zhipu
2. Set in `.env.staging`: `AI_PROVIDER=openai` (or `zhipu`), `AI_API_KEY`, `AI_MODEL`
3. Configure billing/cost limits on provider dashboard
4. Rebuild

**Verify:** submit a health triage, confirm response is from real AI (not mock), verify disclaimer present, no drug names in output.

### 4. SMS (Aliyun)

**File:** `src/lib/sms-provider.ts` (AliyunSmsProvider with HMAC-SHA1 signing)

**To enable:**
1. Register Aliyun SMS service, apply for signature and template
2. Set in `.env.staging`: `SMS_PROVIDER=aliyun`, `SMS_ACCESS_KEY`, `SMS_SECRET`, `SMS_SIGN_NAME`, `SMS_TEMPLATE_ID`
3. Rebuild

**Verify:** request verification code on login page, receive real SMS. Code must NOT be `123456`.

### 5. Moderation (Aliyun Green)

**File:** `src/lib/moderation-provider.ts` (RealModerationProvider, fail-closed)

**To enable:**
1. Activate Aliyun Content Moderation (Green) service
2. Set in `.env.staging`: `MODERATION_PROVIDER=aliyun`, `MODERATION_API_KEY`
3. Rebuild

**Verify:** post compliant content → passes. Post blocked keywords → rejected with clear message. No silent pass-through.

## Post-Connection Verification

After each Provider connection, run:

```bash
# Provider health
curl -s 'http://39.106.100.2/api/provider-health?format=table'

# Full smoke
ADMIN_USERNAME=admin ADMIN_PASSWORD=<pw> bash scripts/smoke-test.sh http://39.106.100.2

# Full E2E
BASE_URL=http://39.106.100.2 ADMIN_USERNAME=admin ADMIN_PASSWORD=<pw> npm run test:e2e:staging

# Manual check
# Open http://39.106.100.2 in browser, test the relevant feature
```
