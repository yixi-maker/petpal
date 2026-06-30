# PetPal Project Context

> Last updated: 2026-06-30
> Purpose: operational context for Codex, Claude Code, and future maintainers.
> For durable decision archive, see `docs/project-memory.md`.

## Product Direction

PetPal is a mobile-first Web App for pet owners and pets as dual subjects. V1 focuses on cats and dogs. Each pet has a social identity, profile page, activity feed presence, friends/follows, and health records.

The desired product feeling is warm, premium, natural, and pet-friendly. The approved UI direction is Apple/Instagram-inspired, with blue-green and natural compound colors, refined pet elements, immersive feed cards.

Bottom navigation: Home · Map · 宝贝 · Health · Me

## Main Line vs Side Lines

**Main Line:** Build PetPal from idea → shippable, iterable pet social + map + health Web App.

**Side Lines** (serve the main line, not ends in themselves):
- Claude/Codex collaboration
- GitHub repo management
- Staging server deployment
- Real Provider integration
- Testing & QA
- Compliance & launch prep
- Monetization planning (deferred)

Current main-line stage: **V1 Staging Stable → Real Provider integration → Small Beta prep**

## V1 Scope (Complete)

- SMS-style login with dev/mock code `123456`
- Home feed with Follow / Nearby / Recommended tabs
- Posts with text, images, pet tag, fuzzy location, likes, comments
- Pet creation, edit, avatar upload, pet profile pages
- Nearby pets and social discovery (宝贝 discovery)
- Friend/follow/greeting/private message flows
- Map and pet-friendly places (AMAP real integration)
- AMAP navigation (app deep-link + web fallback)
- Health records and AI health triage (mock)
- Admin pages: users, pets, posts, comments, reports, hide/ban
- Legal pages: privacy, terms, community guidelines, health disclaimer
- Onboarding flow (4 steps, skippable)

## UI Direction (Finalized)

- Mobile-first, 390x844 primary viewport
- Blue-green / teal primary, natural compound colors
- Soft glass / light depth / refined shadows
- Pet-specific iconography (DOG/CAT SVG avatars, paw elements)
- Immersive feed cards (image-first, gradient overlays)
- Map with floating bottom sheet
- Health: professional, sage/teal medical feel
- Avoid: cheap icons, emoji as primary, plain white cards, heavy gradients

## Technical Baseline

- Next.js 16.2 App Router, React 19, TypeScript 5, Tailwind CSS v4
- Prisma 6: SQLite (dev) + PostgreSQL (staging/prod)
- Redis-ready code store & rate limit
- Docker Compose staging deployment
- Playwright E2E (15 tests), Bash smoke (17 tests)
- Monitoring ready: Aliyun ARMS browser RUM scaffolded; Sentry SDK remains available as fallback

## Current Staging

- Server: Aliyun ECS, Ubuntu 24.04, 2 vCPU, ~2GB RAM, 40GB disk
- IP: `39.106.100.2` (HTTP only, no domain yet)
- Docker Compose: app + PostgreSQL 16 + Redis 7
- Project path: `/opt/petpal-staging`
- Latest source sync: `1a6f098`

## Key Version Nodes

| Commit | Description |
|--------|-------------|
| `208e655` | Fix staging moderation provider (fail-closed gate) |
| `52ec70d` | Mobile UI audit fixes (overflow, TabBar overlap) |
| `d64d493` | Real AMAP integration with MapPlaceholder fallback |
| `d07e96d` | Fix AMAP markers after async places load |
| `e2b9990` | Polish AMAP visuals + navigation deep-link |
| `7febc8b` | Gate fixed SMS code to mock provider only |

## Provider Status (Staging)

| Provider | Status |
|----------|--------|
| Database | PostgreSQL configured |
| Redis | configured |
| Maps | AMAP configured (real) |
| SMS | mock |
| AI | mock |
| Storage | local uploads |
| Moderation | mock |
| Monitoring | not configured |

## Cleanup Rules

Do NOT restore: root `dev.db`, `docs/superpowers/`, `public/sw.js`, `OfflineBanner.tsx`, `IconBadge.tsx`, `SegmentedControl.tsx`, `src/lib/errors.ts`.

Do NOT commit: `.env`, `.env.staging`, real API keys, real AMAP keys, plaintext admin passwords.

## Next Step

Connect real Providers in priority order: Aliyun ARMS → OSS/S3 → AI → SMS → Moderation. After each: re-run provider health + smoke + E2E + manual check.
