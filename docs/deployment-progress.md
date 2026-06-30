# PetPal Deployment Progress

> Last updated: 2026-06-30
> Purpose: live staging server state, deployment history, pending actions.

## Current Status (2026-06-30)

Staging is live at `http://39.106.100.2`. All 3 containers healthy. AMAP real maps active. Latest source sync: `1a6f098`.

## Server

| Item | Value |
|------|-------|
| Provider | Aliyun ECS |
| OS | Ubuntu 24.04.2 LTS, x86_64 |
| Specs | 2 vCPU, ~2GB RAM, 40GB disk, 4GB swap |
| Public IP | `39.106.100.2` |
| Domain | None (HTTP only) |
| Docker | 29.5.3 |
| Compose | v5.1.4 |
| Path | `/opt/petpal-staging` |
| GitHub | `https://github.com/yixi-maker/petpal.git` (main) |

## Container Status

| Container | Image | Health |
|-----------|-------|--------|
| app | Built from Dockerfile | healthy |
| db | postgres:16-alpine (DaoCloud mirror) | healthy |
| redis | redis:7-alpine (DaoCloud mirror) | healthy |

## .env.staging (current intent)

```
NODE_ENV=production
APP_ENV=staging
DATABASE_URL=postgresql://petpal:petpal@db:5432/petpal
REDIS_URL=redis://redis:6379
CODE_STORE=redis
RATE_LIMIT_STORE=redis
ADMIN_USERNAME=admin
NEXT_PUBLIC_AMAP_KEY=<real key>
NEXT_PUBLIC_AMAP_SECURITY_JS_CODE=<real key>
NEXT_PUBLIC_MONITORING_PROVIDER=arms
NEXT_PUBLIC_ARMS_PID=<pending>
NEXT_PUBLIC_ARMS_ENV=staging
SMS_PROVIDER=mock
AI_PROVIDER=mock
STORAGE_PROVIDER=local
MODERATION_PROVIDER=mock
```

Sensitive values (SESSION_SECRET, ADMIN_SESSION_SECRET, ADMIN_PASSWORD_HASH) exist in server file only — never committed.

## Deploy Commands

```bash
cd /opt/petpal-staging
git pull origin main
sudo docker compose --env-file .env.staging -f docker-compose.staging.yml up -d --build --force-recreate
```

## Verify After Deploy

```bash
# Container health
sudo docker compose -f docker-compose.staging.yml ps
sudo docker compose -f docker-compose.staging.yml logs --tail=50 app

# Provider status
curl -s 'http://localhost:3000/api/provider-health?format=table'

# Smoke (from local)
ADMIN_USERNAME=admin ADMIN_PASSWORD=<pw> bash scripts/smoke-test.sh http://39.106.100.2

# E2E (from local)
BASE_URL=http://39.106.100.2 ADMIN_USERNAME=admin ADMIN_PASSWORD=<pw> npm run test:e2e:staging
```

## Historical Issues (Resolved)

1. **Docker Hub timeout** — China mainland can't pull from Docker Hub. Fixed: use `m.daocloud.io/docker.io/library/` mirror in Dockerfile and compose.
2. **Build-time SESSION_SECRET** — Next.js build imports session.ts. Fixed: Dockerfile supplies placeholder secrets in builder stage.
3. **Prisma migration directory** — Migrate deploy read SQLite migrations. Fixed: runner stage copies `migrations-postgres` to `migrations`.
4. **Next.js build OOM on 2GB** — TypeScript typecheck consumed memory. Fixed: `SKIP_NEXT_TYPECHECK=1` in builder only.
5. **Upload EACCES** — `nextjs` user couldn't write to `public/uploads`. Fixed: `mkdir -p public/uploads && chown nextjs:nodejs` in runner.
6. **Port 3000 unreachable** — Aliyun security group. Fixed: expose port 80 in compose and open in cloud console.
7. **Admin password hash mismatch** — Hash generated locally had `$` escaping issues. Fixed: generate on server directly.

## Pending

- [ ] Bind domain + HTTPS
- [ ] PostgreSQL backup cron
- [ ] Rollback runbook
- [ ] AMAP Key domain whitelist update
