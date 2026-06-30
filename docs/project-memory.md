# PetPal Long-Term Project Memory

> Last updated: 2026-06-30
> Purpose: durable archive of product decisions, user preferences, workflow rules, and staged roadmap.

## How To Use This File

Priority order for future agents:
1. `CLAUDE.md`
2. `AGENTS.md`
3. `docs/project-context.md`
4. `docs/project-memory.md` (this file)
5. Current user message

If a new request conflicts with this archive, ask for clarification. Do not silently overwrite product direction.

---

## Product Vision

PetPal is a pet app for both owners and pets as first-class subjects. The app should not feel like a generic pet owner utility. It should make the pet itself feel socially present.

Core emotional target:
- Warm and friendly for owners
- Playful and alive for pet social features
- Professional and trustworthy for health features
- Premium and refined visually

---

## Confirmed V1 Decisions

- Mobile-first Web App, future direction can become native
- V1: cats and dogs only
- App name: PetPal
- Bottom tabs: 首页 · 地图 · 宝贝 · 健康 · 我的
- Social model: owners create pets, pets have independent identities
- Feed: 关注 / 附近 / 推荐
- Friends require mutual following via greeting acceptance
- Location: fuzzy only, never precise coordinates
- Map: AMAP/高德地图, no merchant backend in V1
- Place types: hospitals, parks, malls, cafes, restaurants, grooming, boarding
- Health: records + AI triage (risk levels: LOW/MEDIUM/HIGH)
- AI must NOT claim diagnosis, prescription, dosage, treatment
- Admin: simple auth, content moderation, user management
- V1 cities: Beijing, Shanghai, Shenzhen

---

## UI Direction Archive

Approved direction: Apple/Instagram-inspired, blue-green/teal core, natural compound colors, soft glass/light depth.

Key decisions:
- Center tab is 宝贝 (not 伙伴)
- Pet avatars: DOG silhouette (warm beige, floppy ears), CAT silhouette (warm gray, pointy ears), PawPrint fallback
- No emoji as primary icons
- No cheap-looking icon-only buttons without aria-labels
- No plain white card lists — use gradient cards, shadow hierarchy
- Onboarding: 4 steps, skippable, per-user state via localStorage key `petpal-onboarding-done:${user.id}`
- Text-only posts: sea/sage gradient background with left border accent

---

## Task Line Architecture

### Main Line

"Build PetPal from idea → shippable, iterable pet social + map + health Web App."

Current stage: V1 Staging Stable → Real Provider integration → Small Beta prep.

### Side Lines (serve main line, not ends in themselves)

1. **Claude/Codex collaboration** — Claude implements, Codex reviews/tests/deploys
2. **GitHub repo** — `https://github.com/yixi-maker/petpal`, main branch
3. **Staging server** — Aliyun ECS, Ubuntu 24.04, IP `39.106.100.2`, Docker Compose
4. **Real Provider integration** — priority: Aliyun ARMS → OSS/S3 → AI → SMS → Moderation
5. **Testing & QA** — smoke (17/17), E2E (15/15), provider health, manual checks
6. **Compliance & launch** — ICP, domain, HTTPS, content safety, data backup
7. **Monetization** — deferred until after Beta validates daily use

---

## Staging Server State

- Provider: Aliyun ECS
- OS: Ubuntu 24.04.2 LTS, x86_64
- Specs: 2 vCPU, ~2GB RAM, 40GB disk, 4GB swap
- IP: `39.106.100.2` (HTTP, no domain)
- Docker: 29.5.3, Compose v5.1.4
- Path: `/opt/petpal-staging`
- GitHub: `https://github.com/yixi-maker/petpal.git`
- `.env.staging`: configured with SESSION_SECRET, ADMIN_SESSION_SECRET, ADMIN_PASSWORD_HASH, AMAP keys
- Containers: app, db (PostgreSQL 16), redis (Redis 7) — all healthy
- Latest deploy: `7febc8b`

See `docs/deployment-progress.md` for detailed server state.

---

## Provider Status & Roadmap

See `docs/provider-roadmap.md` for detailed status, priority, and verification steps.

---

## Key Version Nodes

| Commit | Date | Description |
|--------|------|-------------|
| `208e655` | Jun | Fix staging moderation provider (fail-closed gate) |
| `52ec70d` | Jun | Mobile UI audit (overflow, TabBar overlap, scrollbar) |
| `d64d493` | Jun | Real AMAP integration with MapPlaceholder fallback |
| `d07e96d` | Jun | Fix AMAP markers after async places load |
| `e2b9990` | Jun | Polish AMAP visuals + navigation deep-link |
| `7febc8b` | Jun | Gate fixed SMS code to mock provider only |

---

## Collaboration Rules

When the user says a task is finished:
1. Do not trust the summary alone — inspect relevant files
2. Run appropriate local checks (lint, build)
3. Report issues clearly

When making changes:
- Keep changes scoped
- Preserve current UI direction unless explicitly changed
- Do not add features during deployment phases
- Do not change health AI copy to imply diagnosis/prescription/dosage
- Do not expose precise pet/user location
- Do not commit secrets
- Do not restore legacy cleaned files

When reviewing output:
- "Script ready" ≠ "real service verified"
- "Docker config valid" ≠ "server deployed"
- "Mock provider works" ≠ "production provider works"

---

## Sensitive Information Rules

- Never commit real Keys to Git
- Never commit `.env.staging` to GitHub
- AMAP Key / Security JS Code only in server `.env.staging`
- Admin plaintext password never in docs
- Real Provider Keys only via environment variables
- If documenting, record variable names only, never values

---

## Future Roadmap

**V1:** mobile Web App, pet profiles, feed, map, nearby, health AI, Admin, compliance

**V1.1:** real reminders, better image upload, stronger onboarding, map SDK polish, beta feedback fixes

**V2:** native app or PWA, richer social graph, playdate flows, merchant/hospital onboarding, health timeline

**V3:** commercial integrations, membership, city expansion, deeper AI health
