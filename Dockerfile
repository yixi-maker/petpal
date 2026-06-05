# Stage 1: Builder
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies (including devDependencies needed for build)
COPY package.json package-lock.json ./
RUN npm ci

# Generate Prisma client
COPY prisma/ ./prisma/
RUN npx prisma generate

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Runner
FROM node:22-alpine AS runner

# Install curl for healthcheck
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

WORKDIR /app

# Install production dependencies only
COPY --from=builder /app/package.json /app/package-lock.json ./
RUN npm ci --production

# Copy build artifacts from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/api/auth/me || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma generate && node node_modules/.bin/next start"]
