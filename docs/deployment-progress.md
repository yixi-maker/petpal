# PetPal Deployment Progress Handoff

> Last updated: 2026-06-10
> Purpose: exact handoff for continuing Staging deployment if conversation context is interrupted.

## User Constraint

The user explicitly allowed full access for deployment, but then added this constraint:

- Apart from project files, do not change other local machine files or local machine configuration.

Practical interpretation:

- Local project edits under `/Users/luohanyu/Documents/petpal` are allowed.
- SSH commands to the staging server are allowed for deployment.
- Server-side work should stay inside `/opt/petpal-staging` and the Docker Compose resources for this project unless the user explicitly approves broader server changes.
- Do not modify local global config, local SSH config, Docker daemon config, system firewall, or unrelated machine settings.

## Project Mainline And Active Side Task

PetPal product completion is the mainline task.

This document tracks the active side task: deploy the PetPal V1 baseline to the purchased staging server for Staging testing and later beta validation.

Staging server:

- Public IP: `39.106.100.2`
- OS: Ubuntu 24.04.2 LTS
- Arch: x86_64
- CPU/RAM/Disk: 2 vCPU, about 2GB RAM, 40GB disk
- Swap: 4GB created
- Docker: 29.5.3
- Docker Compose: v5.1.4

Repository:

- GitHub: `https://github.com/yixi-maker/petpal.git`
- Branch: `main`
- Latest pushed commit at the time of this handoff: `a7d56d6 fix: use provider health for docker healthcheck`

Server project directory:

- `/opt/petpal-staging`

## Completed Deployment Side-task Steps

1. GitHub repository was created and pushed.
2. `.env.example` was originally missing from GitHub because `.gitignore` ignored `.env*`.
3. Fixed `.gitignore` with `!.env.example`, committed, and pushed:
   - `4eaa964 chore: include staging env example`
4. Found Docker healthcheck bug:
   - old check: `/api/auth/me`
   - problem: unauthenticated endpoint returns 401, so `curl -f` marks container unhealthy
   - fixed check: `/api/provider-health`
   - commit pushed: `a7d56d6 fix: use provider health for docker healthcheck`
5. SSH access from Codex local environment to server was enabled by the user adding the generated public key to `/root/.ssh/authorized_keys`.
6. Server repo was pulled to latest `a7d56d6`.
7. `.env.staging` was created on server under `/opt/petpal-staging/.env.staging`.
8. `.env.staging` contains generated random session secrets and bcrypt admin password hash.
9. Admin username is `admin`.
10. The generated admin plaintext password was printed once in the conversation output. It is intentionally not stored in this document or repository.
11. If the admin plaintext password is lost, generate a new bcrypt hash and update only `/opt/petpal-staging/.env.staging`.

## Current `.env.staging` Intent

The staging file should contain only staging values and no real production keys yet.

Current intended settings:

```text
NODE_ENV=production
APP_ENV=staging
DATABASE_URL=postgresql://petpal:petpal@db:5432/petpal
REDIS_URL=redis://redis:6379
CODE_STORE=redis
RATE_LIMIT_STORE=redis
ADMIN_USERNAME=admin
SMS_PROVIDER=mock
AI_PROVIDER=mock
AI_MODEL=gpt-4o-mini
STORAGE_PROVIDER=local
MODERATION_PROVIDER=mock
NEXT_PUBLIC_AMAP_KEY=
NEXT_PUBLIC_APP_URL=http://39.106.100.2:3000
```

Sensitive values exist in the server file but must not be committed or copied into docs:

- `SESSION_SECRET`
- `ADMIN_SESSION_SECRET`
- `ADMIN_PASSWORD_HASH`
- admin plaintext password

## Current Blocker

Docker Hub is timing out from the China mainland staging server:

```text
docker pull node:22-alpine
failed to resolve reference "docker.io/library/node:22-alpine"
i/o timeout
```

Alibaba public mirror paths tested:

```text
registry.cn-hangzhou.aliyuncs.com/library/node:22-alpine
registry.cn-hangzhou.aliyuncs.com/library/redis:7-alpine
```

Both returned pull access denied / repository does not exist.

DaoCloud mirror test:

```text
docker pull docker.m.daocloud.io/library/node:22-alpine
```

This started pulling but stalled for a long time and did not produce a usable image. The stuck pull process was stopped.

Additional mirror tests completed after the initial handoff:

- `docker.1ms.run`: manifest checks failed / unknown blob / missing manifest.
- `docker.1panel.live`: manifest checks failed.
- `dockerpull.cn`: returned HTML / unsupported manifest media type.
- `hub.rat.dev`: timeout / unknown blob.
- `docker.m.daocloud.io`: node pull started but stalled; manifest checks failed.
- `public.ecr.aws/docker/library`: manifest checks for `node:22-alpine`, `postgres:16-alpine`, and `redis:7-alpine` failed or timed out.

Current resolution path: use project-scoped DaoCloud mirror image references instead of Docker Hub default image references.

Verified on the staging server:

- `m.daocloud.io/docker.io/library/node:22-alpine` pulled successfully.
- `m.daocloud.io/docker.io/library/postgres:16-alpine` manifest check succeeded.
- `m.daocloud.io/docker.io/library/redis:7-alpine` manifest check succeeded.

First Docker build then failed during `next build` because build-time route collection imported `src/lib/session.ts` while `NODE_ENV=production` and no `SESSION_SECRET` existed in the builder environment. The fix is project-scoped: Dockerfile supplies non-sensitive build-time placeholder secrets only in the builder stage. Runtime still requires real secrets from `.env.staging` / production envs.

## Likely Next Action

Use these project-scoped images:

- `Dockerfile`: `m.daocloud.io/docker.io/library/node:22-alpine`
- `docker-compose.staging.yml`: `m.daocloud.io/docker.io/library/postgres:16-alpine`
- `docker-compose.staging.yml`: `m.daocloud.io/docker.io/library/redis:7-alpine`

After committing and pushing the project-scoped mirror changes, pull on server and run:

```bash
cd /opt/petpal-staging
bash scripts/staging-start.sh
```

As of 2026-06-11, the user has approved modifying server service configuration for the deployment side task. If no image registry works, choose one of these broader alternatives carefully and record the change:

1. Configure a Docker registry mirror in server Docker daemon config.
2. Use a private image registry in China mainland, such as Alibaba Cloud ACR, and push required images there.
3. Install Node.js, PostgreSQL, and Redis directly on the server and run PetPal without Docker for Staging.
4. Use a managed PostgreSQL/Redis service and only deploy the Next app runtime.

Do not choose these alternatives silently because they modify server-level configuration or introduce new external services.

## Validation Targets After Startup

After Docker Compose starts:

```bash
cd /opt/petpal-staging
docker compose -f docker-compose.staging.yml ps
docker compose -f docker-compose.staging.yml logs --tail=200 app
curl -s http://localhost:3000/api/provider-health?format=table
```

From local machine:

```bash
bash scripts/smoke-test.sh http://39.106.100.2:3000
BASE_URL=http://39.106.100.2:3000 npm run test:e2e:staging
```

If port `3000` is inaccessible externally, check the cloud provider security group / firewall in the cloud console. Do not change server firewall config unless the user approves.

## Important Reminder

Do not call mock provider checks "real service verified".

Current staging goal is first deployment with mock providers:

- SMS mock
- AI mock
- local storage
- mock moderation
- placeholder / no AMAP key

Real provider integration comes after staging is live.
