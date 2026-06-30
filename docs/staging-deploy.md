# PetPal Staging Deployment Guide

> Last updated: 2026-06-30
> Scope: current Docker Compose staging deployment.
> Detailed daily operations: `docs/deployment-runbook.md`.
> Current progress log: `docs/deployment-progress.md`.

## Current Baseline

Staging is a side task that supports the main PetPal product line. It exists to test V1 safely before Beta.

Current staging state:

- Server: Aliyun ECS, Ubuntu 24.04, x86_64
- Public IP: `39.106.100.2`
- Project path: `/opt/petpal-staging`
- Runtime: Docker Compose
- Services: Next.js app, PostgreSQL 16, Redis 7
- Latest known source sync: `1a6f098`
- Real Provider status: AMAP configured; SMS, AI, Storage, Moderation still staged/mock unless changed in `.env.staging`

## Files That Matter

| File | Purpose |
|------|---------|
| `Dockerfile` | Builds the Next.js staging image |
| `docker-compose.staging.yml` | Starts app, PostgreSQL, Redis |
| `.env.example` | Template for `.env.staging` |
| `scripts/staging-start.sh` | Validated staging startup helper |
| `scripts/smoke-test.sh` | API smoke tests |
| `playwright.staging.config.ts` | Staging E2E config |
| `docs/deployment-runbook.md` | Operator runbook |
| `docs/provider-roadmap.md` | Real Provider integration plan |

Never commit `.env.staging`, real API keys, or plaintext admin passwords.

## Deployment Model

Development and staging use different Prisma schemas and migrations:

| Environment | Database | Prisma config |
|-------------|----------|---------------|
| Local dev | SQLite | `prisma.config.ts` |
| Staging | PostgreSQL | `prisma.config.postgres.ts` |
| Production | PostgreSQL | `prisma.config.postgres.ts` |

Staging runs with:

```bash
NODE_ENV=production
APP_ENV=staging
DATABASE_URL=postgresql://petpal:petpal@db:5432/petpal
REDIS_URL=redis://redis:6379
CODE_STORE=redis
RATE_LIMIT_STORE=redis
```

## Prepare `.env.staging`

On the server:

```bash
cd /opt/petpal-staging
cp .env.example .env.staging
```

Required staging values:

```bash
NODE_ENV=production
APP_ENV=staging

DATABASE_URL=postgresql://petpal:petpal@db:5432/petpal
REDIS_URL=redis://redis:6379
CODE_STORE=redis
RATE_LIMIT_STORE=redis

SESSION_SECRET=<64-byte-random-secret>
ADMIN_SESSION_SECRET=<64-byte-random-secret>
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<bcrypt-hash-only>

NEXT_PUBLIC_AMAP_KEY=<amap-web-js-key>
NEXT_PUBLIC_AMAP_SECURITY_JS_CODE=<amap-security-js-code>

SMS_PROVIDER=mock
AI_PROVIDER=mock
STORAGE_PROVIDER=local
MODERATION_PROVIDER=mock
```

Generate secrets:

```bash
openssl rand -base64 64
openssl rand -base64 64
```

Generate admin password hash without writing the plaintext password to docs:

```bash
ADMIN_PASSWORD="<your-admin-password>" node -e "const b=require('bcryptjs');b.hash(process.env.ADMIN_PASSWORD,10).then(h=>console.log(h))"
```

Keep the plaintext admin password in your password manager. Only the bcrypt hash belongs in `.env.staging`.

## Deploy

Recommended:

```bash
cd /opt/petpal-staging
git pull origin main
bash scripts/staging-start.sh
```

Manual:

```bash
cd /opt/petpal-staging
sudo docker compose --env-file .env.staging -f docker-compose.staging.yml up -d --build --force-recreate
```

The app container runs PostgreSQL migrations with `prisma.config.postgres.ts` during startup.

## Verify

On the server:

```bash
sudo docker compose -f docker-compose.staging.yml ps
sudo docker compose -f docker-compose.staging.yml logs --tail=80 app
curl -s 'http://localhost:3000/api/provider-health?format=table'
```

From local machine:

```bash
ADMIN_USERNAME=admin ADMIN_PASSWORD=<plaintext-admin-password> bash scripts/smoke-test.sh http://39.106.100.2
BASE_URL=http://39.106.100.2 ADMIN_USERNAME=admin ADMIN_PASSWORD=<plaintext-admin-password> npm run test:e2e:staging
```

Manual checks:

- Login with SMS mock code only when `SMS_PROVIDER=mock`
- Home feed loads without horizontal overflow
- Map loads AMAP tiles and markers
- Map detail navigation opens AMAP route
- 宝贝 discovery, Health, Me, Admin pages load

## Provider Status

| Provider | Staging default | Real switch |
|----------|-----------------|-------------|
| Database | PostgreSQL | Already active |
| Redis | Redis | Already active |
| Maps | AMAP | Already active when key/code are set |
| SMS | mock | `SMS_PROVIDER=aliyun` plus Aliyun SMS credentials |
| AI | mock | `AI_PROVIDER=openai` or `AI_PROVIDER=zhipu` plus API key |
| Storage | local | `STORAGE_PROVIDER=s3` plus OSS/S3 bucket credentials |
| Moderation | mock | Real provider still needs implementation of API calls before production |
| Monitoring | ready | China mainland preferred: Aliyun ARMS with `NEXT_PUBLIC_ARMS_PID`; Sentry remains available as fallback |

Provider connection priority:

1. Aliyun ARMS
2. OSS/S3 Storage
3. AI
4. SMS
5. Moderation

After every Provider change, rebuild and run provider health, smoke, E2E, and one manual feature check.

## Moderation Warning

`src/lib/moderation-provider.ts` currently has a fail-closed real provider boundary, but the actual Aliyun Green API calls are placeholders. For staging, keep:

```bash
MODERATION_PROVIDER=mock
```

Before production, implement and test real text/image moderation. Do not assume that setting `MODERATION_API_KEY` alone is enough.

## Common Operations

View logs:

```bash
sudo docker compose -f docker-compose.staging.yml logs -f app
```

Restart:

```bash
sudo docker compose --env-file .env.staging -f docker-compose.staging.yml up -d --force-recreate
```

Stop:

```bash
sudo docker compose -f docker-compose.staging.yml down
```

Do not run `down -v` unless you intentionally want to remove the PostgreSQL and Redis volumes.

## Rollback

Application rollback:

```bash
cd /opt/petpal-staging
git log --oneline -5
git checkout <known-good-commit>
sudo docker compose --env-file .env.staging -f docker-compose.staging.yml up -d --build --force-recreate
```

After rollback:

```bash
curl -s 'http://localhost:3000/api/provider-health?format=table'
ADMIN_USERNAME=admin ADMIN_PASSWORD=<plaintext-admin-password> bash scripts/smoke-test.sh http://39.106.100.2
```

For production, database rollback must use backups. Staging does not yet have automated backup cron configured.

## Remaining Before Public Production

- Domain and HTTPS
- ICP / required China mainland compliance
- PostgreSQL backup cron and restore rehearsal
- Aliyun ARMS monitoring configured and verified
- Real object storage
- Real SMS
- Real AI
- Real content moderation implementation and verification
- AMAP key domain whitelist
- Beta feedback loop and incident process
