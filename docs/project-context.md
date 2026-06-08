# PetPal Project Context

> Last updated: 2026-06-08
> Purpose: shared memory for Codex, Claude Code, and future maintainers.

## Product Direction

PetPal is a mobile-first Web App for pet owners and pets as dual subjects. V1 focuses on cats and dogs. Pets are not only profile data; each pet has a social identity, profile page, activity feed presence, friends/follows, and health records.

The desired product feeling is warm, premium, natural, and pet-friendly. The approved UI direction is Apple/Instagram-inspired, with blue-green and natural compound colors, refined pet elements, immersive feed cards, and a bottom navigation of:

- Home
- Map
- 宝贝
- Health
- Me

The product should feel like a real app, not a marketing page or a component demo.

## Current V1 Scope

Core user features:

- SMS-style login with dev/mock code `123456`
- Home feed with Follow / Nearby / Recommended switching
- Posts with text, images, pet tag, fuzzy location, likes, comments
- Pet creation, edit, avatar upload, pet profile pages
- Nearby pets and social discovery
- Friend/follow/greeting/private message flows
- Map and pet-friendly places
- Health records and AI health triage
- Admin pages for users, pets, posts, comments, reports, hide/ban workflows
- Legal pages: privacy, terms, community guidelines, health disclaimer

Current product stance:

- Health AI is only initial triage / risk judgment / care guidance.
- It must not claim diagnosis, prescription, dosage, or treatment authority.
- Precise user/pet location must not be exposed.

## Current Engineering State

Framework and runtime:

- Next.js 16.2 App Router
- React 19
- TypeScript 5
- Tailwind CSS v4
- Prisma 6
- iron-session
- bcryptjs
- Playwright
- Sentry SDK installed, but real DSN reporting still needs live verification

Database setup:

- Local development uses SQLite:
  - `prisma/schema.prisma`
  - `prisma/migrations`
  - `prisma/dev.db`
- Staging/production use PostgreSQL:
  - `prisma/schema.postgres.prisma`
  - `prisma.config.postgres.ts`
  - `prisma/migrations-postgres/0001_init/migration.sql`

Important: do not restore root-level `dev.db`. The real local SQLite database is `prisma/dev.db`.

Provider setup:

- SMS: mock locally, Aliyun provider implemented but needs real credentials
- AI: mock locally, OpenAI/Zhipu provider implemented but needs real key verification
- Storage: local uploads locally, S3-compatible provider implemented but needs real bucket verification
- Moderation: mock locally, fail-closed real provider boundary exists but needs real moderation service
- Maps: placeholder by default, AMAP key detection and SDK URL helper exist
- Redis: optional locally, required/recommended for staging code store and rate limit
- Sentry: config files exist; must be tested with real DSN before calling monitoring complete

## Deployment State

Stage five is complete from local engineering checks. The next real milestone is a live Staging deployment.

Available deployment artifacts:

- `Dockerfile`
- `docker-compose.staging.yml`
- `scripts/staging-start.sh`
- `docs/deployment-runbook.md`
- `docs/staging-deploy.md`
- `docs/beta-readiness.md`
- `docs/beta-user-guide.md`

Staging expectation:

- Linux server with Docker and Docker Compose
- PostgreSQL 16 container
- Redis 7 container
- `.env.staging` with generated session secrets and `ADMIN_PASSWORD_HASH`
- `NODE_ENV=production`
- `APP_ENV=staging`
- HTTP can be used for local Docker staging; real remote beta should use HTTPS

Admin setup:

- Server env uses `ADMIN_USERNAME` and `ADMIN_PASSWORD_HASH`
- Operator keeps the plaintext admin password separately
- `scripts/setup-admin.sh` verifies login with `ADMIN_USERNAME` + `ADMIN_PASSWORD`
- Do not write `ADMIN_PASSWORD` into `.env.staging`

## Validation Commands

Local baseline:

```bash
npm run lint
npm run build
npx playwright test --list
npx playwright test --config=playwright.staging.config.ts --list
bash -n scripts/*.sh
```

PostgreSQL schema validation:

```bash
DATABASE_URL="postgresql://petpal:petpal@localhost:5432/petpal" \
  npx prisma validate --config=prisma.config.postgres.ts
```

Local full-flow validation:

```bash
npm run dev
bash scripts/smoke-test.sh http://localhost:3000
npx playwright test
```

Staging validation:

```bash
bash scripts/staging-start.sh
bash scripts/verify-providers.sh https://your-staging-domain
bash scripts/smoke-test.sh https://your-staging-domain
BASE_URL=https://your-staging-domain npm run test:e2e:staging
```

## Latest Local Stabilization

Completed on 2026-06-08:

- Restored a broken local Git index from a valid `.git/index.lock`; source files were not lost.
- Reworked `e2e/smoke.spec.ts` to match the current UI and avoid false failures from stale selectors.
- Ran local full-flow validation:
  - `npm run lint` passed.
  - `npm run build` passed.
  - `bash scripts/smoke-test.sh http://localhost:3000` passed 17/17.
  - `npx playwright test` passed 15/15.
- Cleaned local test artifacts:
  - removed stale untracked legacy files/directories listed in Cleanup Rules
  - removed local Playwright `test-results`
  - removed generated test upload images
  - hid and then deleted local Smoke/E2E test posts from `prisma/dev.db`
  - removed the E2E test account `13800009901` and its pets from `prisma/dev.db`
- Saved key mobile screenshots under `docs/screenshots/`:
  - `01-login.png`
  - `02-home-feed.png`
  - `03-map.png`
  - `04-nearby.png`
  - `05-health.png`
  - `06-me.png`
  - `07-admin-dashboard.png`

## Cleanup Rules

Do not restore these removed legacy files or directories:

- root `dev.db`
- `docs/superpowers`
- `public/sw.js`
- `src/components/layout/OfflineBanner.tsx`
- `src/components/ui/IconBadge.tsx`
- `src/components/ui/SegmentedControl.tsx`
- `src/lib/errors.ts`

Do not commit secrets:

- `.env`
- `.env.staging`
- real API keys
- real Sentry DSN
- plaintext admin password

Do not treat mock provider output as real service validation. Scripts being ready is not the same as real SMS, storage, AI, moderation, map, or Sentry verification.

## Current Next Step

The local V1 baseline is stable enough to proceed toward real Staging.

Recommended next sequence:

1. Prepare the real Staging server and `.env.staging`.
2. Configure real third-party keys in priority order: SMS, Storage, AI, Moderation, AMAP, Sentry.
3. Run `bash scripts/staging-start.sh`.
4. Run provider, API smoke, and E2E validation against the real Staging URL.
5. Start a small internal beta only after real SMS login, storage upload, provider health, and Sentry reporting are verified.
