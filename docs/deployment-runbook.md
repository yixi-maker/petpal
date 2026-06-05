# PetPal Staging Deployment Runbook

> One-page quick reference for deploying and verifying PetPal on staging.
> Last updated: 2026-06-05

---

## Prerequisites

- **Linux server** (Ubuntu 22.04+ recommended; Debian 12, CentOS 9 also supported)
- **Docker 24+** and **Docker Compose v2**
- **2 GB+ RAM**, **20 GB+ disk** (SSD recommended)
- **Git** (to clone the repo)
- **Node.js 22+** (only needed on the deploy host to generate bcrypt password hashes)

---

## Quick Deploy

```bash
# 1. Clone the repository
git clone <repo-url> /opt/petpal-staging
cd /opt/petpal-staging

# 2. Generate secrets (save these — they must be 64+ chars)
SESSION_SECRET=$(openssl rand -base64 64)
ADMIN_SESSION_SECRET=$(openssl rand -base64 64)

# 3. Generate admin password hash (choose a secure password)
ADMIN_PASSWORD_HASH=$(node -e "const b=require('bcryptjs');b.hash('your-secure-password',10).then(h=>console.log(h))")

# 4. Create .env.staging
cat > .env.staging << ENVEOF
SESSION_SECRET=${SESSION_SECRET}
ADMIN_SESSION_SECRET=${ADMIN_SESSION_SECRET}
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=${ADMIN_PASSWORD_HASH}
# Optional — add provider keys when ready:
# SMS_PROVIDER=aliyun
# SMS_ACCESS_KEY=...
# SMS_SECRET=...
# SMS_SIGN_NAME=PetPal
# SMS_TEMPLATE_ID=...
# AI_PROVIDER=openai
# AI_API_KEY=sk-...
# NEXT_PUBLIC_AMAP_KEY=...
# STORAGE_PROVIDER=s3
# STORAGE_ENDPOINT=...
# STORAGE_BUCKET=...
# STORAGE_ACCESS_KEY=...
# STORAGE_SECRET_KEY=...
# MODERATION_API_KEY=...
ENVEOF

# 5. Deploy with Docker Compose
bash scripts/staging-start.sh
```

---

## Verify Deploy

```bash
# Basic reachability check
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
# Expected: 200

# API is alive (unauthenticated — 401 means session layer works)
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/auth/me
# Expected: 401

# Login API (mock SMS with code 123456)
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800000001","code":"123456","agreementAccepted":true}'
# Expected: {"success":true,"user":{...}}

# Public places endpoint
curl -s http://localhost:3000/api/places?city=%E5%8C%97%E4%BA%AC | head -c 200
# Expected: JSON array of places

# Admin login
curl -s -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-secure-password"}'
# Expected: {"success":true}

# Container health
docker compose -f docker-compose.staging.yml ps
# Expected: app, db, redis all "Up" and "healthy"
```

---

## Run Smoke Tests

```bash
# Local deployment
bash scripts/smoke-test.sh

# Remote deployment (replace URL)
bash scripts/smoke-test.sh https://staging.petpal.example.com

# CI variant (plain text, no colors)
bash scripts/smoke-test-ci.sh https://staging.petpal.example.com
```

The smoke test covers: unauthenticated health check, user login, pet CRUD, image upload, post creation, comments, likes, messages, places API, provider fail-safe, and admin endpoints.

---

## Run E2E Tests

```bash
# Against local staging
BASE_URL=http://localhost:3000 npm run test:e2e:staging

# Against remote staging
BASE_URL=https://staging.petpal.example.com npm run test:e2e:staging
```

Uses `playwright.staging.config.ts` (60 s timeout, 2 retries, no local webServer).

---

## Check Provider Status

```bash
# Table format (human-readable)
curl -s "http://localhost:3000/api/provider-health?format=table"

# JSON format (machine-readable)
curl -s http://localhost:3000/api/provider-health | python3 -m json.tool

# Or use the helper script
bash scripts/verify-providers.sh http://localhost:3000
```

Exit code 1 if any provider is in `error` state, 2 if endpoint is unreachable.

---

## Seed Admin Account

```bash
# Set credentials via env vars
export ADMIN_USERNAME="admin"
export ADMIN_PASSWORD_HASH='$2a$10$...'

# Trigger admin account creation/verification
bash scripts/setup-admin.sh http://localhost:3000
```

The admin account is auto-created on first `POST /api/admin/auth/login` when `ADMIN_USERNAME` and `ADMIN_PASSWORD_HASH` env vars are set.

---

## Clean Up Test Data

```bash
# Remove smoke-test posts (those containing "Smoke test" or "CI smoke")
bash scripts/clean-test-data.sh http://localhost:3000
```

Requires admin credentials (reads from env vars or uses staging defaults).

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `curl: (7) Failed to connect` | App container not running | `docker compose -f docker-compose.staging.yml up -d` |
| App exits with `SMS_ACCESS_KEY required` | SMS_PROVIDER set to `aliyun` without credentials | Set `SMS_PROVIDER=mock` or provide real keys in `.env.staging` |
| App exits with `DATABASE_URL must be set` | Missing `.env.staging` or env var | Verify `docker compose --env-file .env.staging` is used |
| `401` on admin login | Wrong password or `ADMIN_PASSWORD_HASH` not set | Re-run `node -e "const b=require('bcryptjs');b.hash('your-pw',10).then(h=>console.log(h))"` and update `.env.staging` |
| `403` on content creation | Moderation fail-closed in production | Set `MODERATION_API_KEY` or set `NODE_ENV=development` (not recommended for staging) |
| Login returns error about code | SMS provider misconfigured | Check `SMS_PROVIDER=mock` for testing; use `123456` as code |
| `500` on AI endpoints | AI provider misconfigured or timed out | Set `AI_PROVIDER=mock` for testing or check `AI_API_KEY` |
| Redis connection refused | Redis container not healthy | `docker compose -f docker-compose.staging.yml restart redis` |
| Database migration fails | Schema mismatch or connection issues | `docker compose -f docker-compose.staging.yml logs app` to see migration output |

### Quick Diagnostic Commands

```bash
# View app logs (last 100 lines)
docker compose -f docker-compose.staging.yml logs --tail=100 app

# View database logs
docker compose -f docker-compose.staging.yml logs --tail=50 db

# Check resource usage
docker stats --no-stream

# Restart everything
docker compose -f docker-compose.staging.yml down
docker compose -f docker-compose.staging.yml up -d

# Full reset (WARNING: destroys database volume)
docker compose -f docker-compose.staging.yml down -v
docker compose -f docker-compose.staging.yml up -d --build
```

### Rollback

```bash
# Code rollback — revert to a known-good commit
git checkout <last-stable-tag>
docker compose -f docker-compose.staging.yml up -d --build

# Database rollback — restore from backup
pg_restore -d petpal /backups/petpal_<timestamp>.dump

# Config rollback — restore previous .env.staging
cp .env.staging.backup-<timestamp> .env.staging
docker compose -f docker-compose.staging.yml up -d
```

---

## Scripts Reference

| Script | Path | Purpose |
|--------|------|---------|
| `staging-start.sh` | `scripts/staging-start.sh` | One-command Docker Compose deploy |
| `smoke-test.sh` | `scripts/smoke-test.sh` | Full smoke test (color output) |
| `smoke-test-ci.sh` | `scripts/smoke-test-ci.sh` | CI-friendly smoke test (plain text) |
| `verify-providers.sh` | `scripts/verify-providers.sh` | Provider health check |
| `setup-admin.sh` | `scripts/setup-admin.sh` | Admin account creation/verification |
| `clean-test-data.sh` | `scripts/clean-test-data.sh` | Remove smoke-test posts from DB |
| `test-ai.sh` | `scripts/test-ai.sh` | AI provider smoke test |
| `test-sms.sh` | `scripts/test-sms.sh` | SMS provider smoke test |

## Related Docs

- `docs/staging-deploy.md` — detailed deployment guide (environment variables, database migration, rollback, monitoring)
- `docs/beta-readiness.md` — beta test preparation checklist, known limitations, feedback process
- `docs/launch-readiness.md` — production launch compliance and legal checklist
- `docs/beta-user-guide.md` — Chinese-language guide for beta testers
