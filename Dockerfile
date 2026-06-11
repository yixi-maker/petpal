# Stage 1: Builder
FROM m.daocloud.io/docker.io/library/node:22-alpine AS builder
WORKDIR /app

# Install dependencies (including devDependencies needed for build)
COPY package.json package-lock.json ./
RUN npm ci

# Generate Prisma clients for both SQLite (dev) and PostgreSQL (staging/prod)
COPY prisma.config.postgres.ts ./
COPY prisma/ ./prisma/
RUN npx prisma generate
RUN npx prisma generate --config=prisma.config.postgres.ts

# Build-time placeholders let Next.js collect route metadata without weakening
# runtime security. Real secrets are injected by .env.staging / production envs.
ENV SESSION_SECRET=petpal-docker-build-session-secret-not-used-at-runtime-000000 \
    ADMIN_SESSION_SECRET=petpal-docker-build-admin-secret-not-used-at-runtime-000000 \
    SKIP_NEXT_TYPECHECK=1

# Copy source and build the Next.js app
COPY . .
RUN npm run build

# Stage 2: Runner
FROM m.daocloud.io/docker.io/library/node:22-alpine AS runner

# Install curl for healthcheck
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

WORKDIR /app

# Install production dependencies only
COPY --from=builder /app/package.json /app/package-lock.json ./
RUN npm ci --production

# Copy build artifacts from builder (includes both generated Prisma clients)
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
RUN rm -rf prisma/migrations && cp -R prisma/migrations-postgres prisma/migrations
COPY --from=builder /app/prisma.config.postgres.ts ./
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/api/provider-health || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy --config=prisma.config.postgres.ts && node node_modules/.bin/next start"]
