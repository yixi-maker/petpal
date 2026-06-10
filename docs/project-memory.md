# PetPal Long-Term Project Memory

> Last updated: 2026-06-10
> Purpose: durable archive of product decisions, user preferences, workflow rules, and staged roadmap for Codex, Claude Code, and future maintainers.

## How To Use This File

Read this file before planning, coding, reviewing, deploying, or optimizing PetPal.

Priority order for future agents:

1. `CLAUDE.md`
2. `AGENTS.md`
3. `docs/project-context.md`
4. `docs/project-memory.md`
5. Current user message

If a new user request conflicts with this archive, ask for clarification or follow the latest explicit user request. Do not silently overwrite product direction.

## Product Vision

PetPal is a pet app for both owners and pets as first-class subjects. The app should not feel like a generic pet owner utility. It should make the pet itself feel socially present: each pet can have a profile, identity, friends, posts, health records, and nearby interactions.

The intended long-term product is a high-quality pet social + pet health + pet-friendly location platform for China mainland users.

Core emotional target:

- Warm and friendly for owners
- Playful and alive for pet social features
- Professional and trustworthy for health features
- Premium and refined visually, not cheap, not generic, not over-simplified

The user wants to build a product that can break industry conventions, not just a conventional pet directory or simple CRUD app.

## Confirmed V1 Product Decisions

Platform:

- Start as a mobile-first Web App.
- Future direction can become a native mobile app.

Target pets:

- V1 focuses on cats and dogs.
- Later versions can expand to other pet types.

Brand:

- App name: `PetPal`.

Core tabs:

- 首页
- 地图
- 宝贝
- 健康
- 我的

The center tab must be `宝贝`, not `伙伴`, because the product serves both owners and pets, and the pet subject needs strong product weight.

Social model:

- Owners create pet profiles.
- Pets have independent social identities and profile pages.
- Pets can follow, become friends, send greetings, match, and chat.
- Friends require mutual following / accepted relationship.
- Private chat should start only after sending a greeting and receiving consent.

Feed:

- V1 feed has three tabs: 关注 / 附近 / 推荐.
- Posts support text, images, pet tags, optional fuzzy location, likes, comments, and sharing.
- Short video is reserved for later versions.
- Location must be fuzzy, never precise.

Nearby / play:

- Nearby pets
- Private messages for walk/play invitations
- Playdate fields:
  - title
  - initiating pet
  - time
  - place
  - suitable pet type / size
  - participant limit
  - remarks
  - signup list

Map:

- Use AMAP / 高德地图 for China mainland.
- V1 can use platform-owned built-in place data.
- No merchant backend in V1.
- Later versions can invite merchants, cafes, hospitals, and grooming/boarding providers to join.
- Place categories:
  - pet hospitals
  - pet-friendly parks
  - pet-friendly malls
  - pet-friendly cafes / restaurants
  - grooming / boarding
- Place detail fields:
  - name
  - type
  - distance
  - rating
  - business status
  - address
  - phone
  - pet-friendly tags
  - user reviews
  - navigation button

Health:

- V1 health module includes health records and AI health triage.
- AI assistant must support text questions, symptom form, emergency level judgment, and image upload / image analysis interface.
- Risk levels:
  - low: home observation
  - medium: recommend appointment with vet
  - high: seek vet / emergency care soon
- Health profile fields:
  - weight
  - neuter status
  - vaccine records
  - deworm records
  - allergies
  - medical history
  - current medication
  - latest vet visit and reason
- V1 supports health record + next reminder date.
- Real push reminders can be V1.1.

Admin:

- V1 includes a simple `/admin`.
- Dev can use fixed admin credentials.
- Staging / production must use environment variables and password hash.
- Admin can view users, pets, posts, comments, reports.
- Admin can hide content and ban accounts.
- Do not build complex RBAC in V1.

Cities:

- V1 location/place data can start with Beijing, Shanghai, and Shenzhen.

## UI Direction And Preferences

The approved UI direction is closer to the shared concept image with four panels:

- A: immersive social feed, story rail, pet-first post cards
- B: full-screen map with floating controls and bottom sheet
- C: pet profile / identity homepage with health and friend status
- D: professional but warm AI health assistant

The user liked the concept direction and later asked for UI to move toward that version.

Visual preferences:

- Mobile-first
- Premium, refined, Apple/Instagram-inspired
- Blue-green / teal as core tone
- Natural compound colors are welcome
- Soft glass / light depth / refined shadows can be used
- Pet-specific iconography is preferred over generic app icons where appropriate
- The design should feel friendly to pet owners and emotionally close to the pet

Avoid:

- Cheap-looking icons
- Plain traditional dashboard UI
- Overly simple or empty pages
- Blindly copying Xiaohongshu
- Generic SaaS card-heavy layouts
- Monotonous background
- In-app explanatory text that only describes features

Known UI decisions:

- Center nav is `宝贝`.
- Pet avatars must support image upload.
- Pet elements in icons are acceptable and desired.
- Health can be more professional; social can be lighter and more playful.

## Current Technical Baseline

Current framework:

- Next.js 16.2 App Router
- React 19
- TypeScript 5
- Tailwind CSS v4
- Prisma 6
- SQLite for local dev
- PostgreSQL schema and migrations for staging / production
- Redis-ready code store and rate limit
- Playwright E2E
- Sentry SDK installed

Important local commands:

```bash
npm run lint
npm run build
npx playwright test
bash scripts/smoke-test.sh http://localhost:3000
```

Current local baseline:

- V1 baseline has been stabilized.
- Local lint passes.
- Local build passes.
- API smoke passes 17/17.
- E2E passes 15/15.
- Key screenshots are saved in `docs/screenshots/`.

Do not restore removed legacy files:

- root `dev.db`
- `docs/superpowers`
- `public/sw.js`
- `src/components/layout/OfflineBanner.tsx`
- `src/components/ui/IconBadge.tsx`
- `src/components/ui/SegmentedControl.tsx`
- `src/lib/errors.ts`

## Staging And Production Understanding

Staging is a test environment on a real server. It exists so the team can validate real deployment, real URLs, and real third-party service behavior before public launch.

Production is the real user-facing environment. It should be separate from Staging.

Recommended environment split:

- Local: development and fast iteration
- Staging: real server, real deployment, internal testing
- Production: public users, real traffic, stable operations

Do not develop directly on the server. Develop locally, commit, deploy to Staging, validate, then promote.

Current staging status:

- Stage two deployment preparation is complete.
- File completeness, environment variable coverage, PostgreSQL schema validation, migration structure, shell syntax, lint, build, and E2E list checks passed.
- Local Docker was unavailable, so `docker compose config` and `docker compose up` must be run on a real server.
- GitHub repository is configured and pushed: `https://github.com/yixi-maker/petpal.git`.
- Staging server has been purchased:
  - Ubuntu 24.04.2 LTS
  - x86_64
  - 2 vCPU / about 2GB RAM
  - 40GB system disk
  - public IP: `39.106.100.2`
  - 4GB swap created
  - Docker installed: `29.5.3`
  - Docker Compose installed: `v5.1.4`
- The next step is to clone the GitHub repository on the server and create `.env.staging`.

Staging minimum requirements:

- Linux server, Ubuntu 22.04+ preferred
- 2GB+ RAM
- Docker and Docker Compose
- domain or temporary access URL
- `.env.staging`
- PostgreSQL
- Redis

Staging can first run with mock / placeholder providers to validate deployment. Real provider verification happens after the server runs.

Provider priority for real service connection:

1. SMS
2. Storage
3. Sentry
4. AI
5. Moderation
6. AMAP

## Production Launch Requirements

Do not rush to public production launch immediately after Staging.

Recommended sequence:

1. Real Staging deployment
2. Real providers connected
3. 5-20 person internal beta
4. V1.1 fixes based on feedback
5. China mainland compliance checks
6. Production infrastructure setup
7. Small public launch

Production needs:

- separate production server / app runtime
- production PostgreSQL database
- Redis
- object storage
- HTTPS
- backup and restore plan
- monitoring and error reporting
- log privacy controls
- rollback plan
- Admin password and secrets from environment variables
- no mock SMS / storage / AI / moderation claims

Compliance for China mainland:

- ICP备案 for website/domain
- 公安联网备案 after launch
- APP备案 if native app is later released
- privacy policy and user agreement review
- community guidelines
- health disclaimer
- sensitive personal information handling for location and health-related data
- account deletion and data deletion process
- content moderation and report handling
- AI health assistant must remain triage / risk judgment only

## Cost Understanding

Staging is much cheaper than Production because it can accept lower availability and fewer managed services.

Rough current planning ranges:

- Staging minimal: about 50-200 RMB/month
- Staging stable: about 150-400 RMB/month
- Production MVP: about 500-1500 RMB/month
- Production stable growth: about 1500-5000 RMB/month

Production is usually 3-10x the cost of Staging because it needs backup, monitoring, managed database, storage, real SMS, AI cost, security, and better reliability.

## Business And Monetization Notes

Potential revenue directions:

- premium membership for owners
- advanced pet health record / reminder features
- AI health assistant paid tiers
- pet-friendly place promotion
- merchant / hospital / grooming shop entry
- ads or sponsored posts, used carefully
- activity / playdate marketplace features
- e-commerce partnerships
- insurance / vet service partnerships

Do not prioritize monetization before proving daily use and retention.

Near-term product validation should focus on:

- whether owners create pet profiles
- whether pets as identities are understood
- whether users post pet content
- whether nearby and map features are useful
- whether health AI feels trustworthy and safe
- whether UI feels premium and emotionally close

## Future Roadmap Direction

V1:

- mobile-first Web App
- pet profiles
- feed
- map/place discovery
- nearby pets
- health records and AI triage
- Admin and basic compliance pages

V1.1:

- real reminder notifications
- better image upload UX
- stronger onboarding
- staging feedback fixes
- more robust content moderation workflow
- map SDK integration polish

V2:

- native app or PWA polish depending on beta feedback
- richer pet social graph
- playdate flows
- better matching / discovery
- merchant and hospital onboarding
- more complete health timeline

V3:

- deeper commercial integrations
- city expansion
- richer AI health assistant with stronger guardrails
- merchant dashboard
- membership / paid services

## Collaboration Rules For Future Work

When the user says Claude has finished a task:

1. Do not trust the summary alone.
2. Inspect relevant files.
3. Run appropriate local checks.
4. Use Playwright / screenshots for UI changes.
5. Report issues clearly and give Claude-ready instructions when needed.

When making changes:

- Keep changes scoped.
- Preserve the current UI direction unless the user explicitly changes it.
- Do not add features during deployment phases.
- Do not change product copy in health AI to imply diagnosis, prescription, dosage, or treatment.
- Do not expose precise pet/user location.
- Do not commit secrets.
- Do not restore legacy cleaned files.

When preparing instructions for Claude:

- Write clear phase goals.
- Include constraints.
- Include exact commands.
- Ask for a completion report with:
  - modified files
  - commands run
  - tests passed
  - tests not run and why
  - blockers
  - next recommendation

When reviewing Claude output:

- Treat "script ready" as different from "real service verified".
- Treat "Docker config valid" as different from "server deployed".
- Treat "mock provider works" as different from "production provider works".

## Current Next Step

Proceed to real Staging deployment on a Linux server.

Once the server URL exists, validate:

```bash
bash scripts/verify-providers.sh https://your-staging-domain
bash scripts/smoke-test.sh https://your-staging-domain
BASE_URL=https://your-staging-domain npm run test:e2e:staging
```

Only after Staging is live and stable should the team start connecting real third-party services and inviting internal beta users.
