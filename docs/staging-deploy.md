# PetPal Staging 部署指南

> 最后更新：2026-06-04
> 适用环境：Staging / 生产
>
> **Current Staging Status**: The project runs on SQLite with in-memory stores (code store, rate limiter).
> All provider implementations (Aliyun SMS, S3 storage, moderation) are code-complete but untested against real accounts.
> See individual provider status comments in their source files for details.

---

## Docker 部署（推荐）

使用 Docker Compose 一键部署 PetPal 全部服务（Next.js 应用 + PostgreSQL + Redis）。

### 前置条件

- Docker 24+ 和 Docker Compose 2+
- Node.js 22+（仅在生成密码哈希时需要）

### 步骤 1：准备环境变量文件

创建工作目录下的 `.env.staging`（可参考 `.env.example`）：

```bash
cp .env.example .env.staging
# 编辑 .env.staging 填入实际值
```

### 步骤 2：生成 Session 密钥

```bash
# 生成 SESSION_SECRET（至少 32 位随机字符串）
openssl rand -base64 64
# 生成 ADMIN_SESSION_SECRET
openssl rand -base64 64
```

将生成的值写入 `.env.staging` 或设置为 shell 环境变量（`export SESSION_SECRET=...`）。

### 步骤 3：生成管理员密码哈希

```bash
# 生成 bcrypt 哈希（需在项目目录下执行）
node -e "const b=require('bcryptjs');b.hash('your-secure-password',10).then(h=>console.log(h))"
```

将输出的 `$2a$10$...` 设置为 `ADMIN_PASSWORD_HASH`。

### 步骤 4：启动服务

```bash
# 确保环境变量已设置
export SESSION_SECRET="<步骤2生成的值>"
export ADMIN_SESSION_SECRET="<步骤2生成的值>"
export ADMIN_USERNAME="admin"
export ADMIN_PASSWORD_HASH="<步骤3生成的值>"

# 构建并启动所有服务
docker compose -f docker-compose.staging.yml up -d
```

或使用一键启动脚本：

```bash
bash scripts/staging-start.sh
```

### 步骤 5：验证部署

```bash
# 等待约 30 秒后检查健康状态
curl -f http://localhost:3000/api/auth/me
# 预期：返回 HTTP 401（表示应用在正常运行，只是未登录）

# 查看容器状态
docker compose -f docker-compose.staging.yml ps
# 预期：app、db、redis 均为 Up / healthy

# 测试登录 API
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800000001","code":"123456","agreementAccepted":true}'
# 预期：{"success":true,"user":{...}}
```

### 常用命令

```bash
# 查看日志
docker compose -f docker-compose.staging.yml logs -f app

# 重启服务
docker compose -f docker-compose.staging.yml restart

# 停止服务
docker compose -f docker-compose.staging.yml down

# 停止服务并清空数据库卷
docker compose -f docker-compose.staging.yml down -v
```

### 架构说明

| 服务 | 镜像 | 端口 | 说明 |
|------|------|------|------|
| `app` | 本地构建（Dockerfile） | 3000 | Next.js 16 + Prisma |
| `db` | postgres:16-alpine | - | PostgreSQL 数据库 |
| `redis` | redis:7-alpine | - | 验证码 / 限流存储 |

应用容器启动时自动执行 `prisma migrate deploy`，无需手动迁移。

---

## 环境准备

| 组件 | 版本要求 | 说明 | Staging 状态 |
|------|----------|------|--------------|
| Node.js | 22+ | 运行时 | 当前使用中 |
| npm | 10+ | 随 Node.js 22 自带 | 当前使用中 |
| PostgreSQL | 15+ | 生产数据库 | 未配置（运行在 SQLite） |
| Redis | 7+ | 可选，用于验证码/限流持久化；通过 CODE_STORE=redis / RATE_LIMIT_STORE=redis 启用；未配置时自动使用内存存储（MemoryCodeStore / MemoryRateLimitStore），适合单进程开发和低流量场景 | 未配置（使用内存存储） |

---

## 1. 环境变量配置

在项目根目录创建 `.env` 文件，或通过部署平台（PM2 ecosystem、Docker env、Vercel env 等）注入以下环境变量。

### 1.1 必须配置

```bash
# === 数据库 ===
DATABASE_URL="postgresql://petpal_user:your_strong_password@localhost:5432/petpal_staging?schema=public"

# === Session 安全（必须为 32 位以上随机字符串）===
# 生成方式: openssl rand -base64 64
SESSION_SECRET="a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"
ADMIN_SESSION_SECRET="x1y2z3w4v5u6t7s8r9q0p1o2n3m4l5k6j7i8h7g6f5e4d3c2b1a0z9y8x7w6"

# === 管理员账号（生产必须通过环境变量设置）===
ADMIN_USERNAME="admin"
ADMIN_PASSWORD_HASH="$2a$10$..."  # 使用 bcryptjs 生成
```

### 1.2 Provider 相关（按需配置）

```bash
# === 短信服务 ===
SMS_PROVIDER="aliyun"                       # 从 "mock" 切换为 "aliyun"（构造时即要求 SMS_ACCESS_KEY / SMS_SECRET / SMS_TEMPLATE_ID）
SMS_ACCESS_KEY="your_aliyun_access_key"
SMS_SECRET="your_aliyun_secret"
SMS_SIGN_NAME="PetPal"
SMS_TEMPLATE_ID="SMS_123456789"

# === AI 服务 ===
AI_PROVIDER="openai"                         # openai | zhipu | mock（默认）
AI_API_KEY="sk-your-api-key"
AI_MODEL="gpt-4o-mini"                       # 可选，默认 gpt-4o-mini
# AI 服务内置 15s 超时、JSON 解析降级（markdown 代码块提取）、药品名/剂量擦除。
# AI_API_KEY 为空时自动回退到 mock 并输出 console.warn。

# === 地图服务 ===
NEXT_PUBLIC_AMAP_KEY="your_amap_web_key"     # 前端地图展示（客户端可见）
# 未设置时地图组件显示占位状态，不会报错。

# === 对象存储 ===
STORAGE_PROVIDER="s3"                        # s3 | local（默认）
STORAGE_ENDPOINT="https://s3.amazonaws.com"
STORAGE_BUCKET="petpal-uploads-staging"
STORAGE_ACCESS_KEY="your_storage_access_key"
STORAGE_SECRET_KEY="your_storage_secret_key"
STORAGE_REGION="us-east-1"                   # 可选
# 兼容：AWS S3、阿里云 OSS、腾讯云 COS、MinIO、Cloudflare R2（AWS SigV4 签名）

# === 内容审核 ===
# 注意：内容审核在 NODE_ENV=production 时自动启用 RealModerationProvider（fail-closed）。
# 开发环境使用 mock（关键词过滤）。生产环境无需单独设置 MODERATION_PROVIDER，
# NODE_ENV=production 即启用真实审核。
# 若未配置 MODERATION_API_KEY，RealModerationProvider 会拒绝所有内容（fail-closed，安全优先）。
MODERATION_API_KEY="your_moderation_api_key"

# === Redis（验证码 & 限流持久化，强烈推荐 staging/production 启用）===
REDIS_URL="redis://localhost:6379"
CODE_STORE="redis"                           # memory（默认）| redis
RATE_LIMIT_STORE="redis"                     # memory（默认）| redis
# 未设置 REDIS_URL 但 CODE_STORE/RATE_LIMIT_STORE=redis 时，模块加载即抛出明确错误。
# 默认 memory 模式无需 Redis，适合单进程开发和低流量场景。

# === 错误监控（可选）===
# SENTRY_DSN="https://xxx@sentry.io/xxx"
```

### 1.3 完整示例 `.env`（Staging）

```bash
DATABASE_URL="postgresql://petpal_user:password@db-staging.internal:5432/petpal_staging?schema=public"

SESSION_SECRET="prod-session-secret-64-chars-min-replace-this-with-openssl-rand-base64-64"
ADMIN_SESSION_SECRET="prod-admin-secret-64-chars-min-replace-this-with-openssl-rand-base64-64"

ADMIN_USERNAME="admin"
ADMIN_PASSWORD_HASH="$2a$10$Ci3MZDucxCw1oJMcFPkIiO7GfKGJBR6APJKAjNBXYFwG6hFYD3uOe"

SMS_PROVIDER="aliyun"
SMS_ACCESS_KEY="LTAI5t..."
SMS_SECRET="..."
SMS_SIGN_NAME="PetPal"
SMS_TEMPLATE_ID="SMS_123456789"

AI_PROVIDER="openai"
AI_API_KEY="sk-..."
AI_MODEL="gpt-4o"

NEXT_PUBLIC_AMAP_KEY="089e..."
AMAP_KEY="338b..."

STORAGE_PROVIDER="s3"
STORAGE_ENDPOINT="https://oss-cn-beijing.aliyuncs.com"
STORAGE_BUCKET="petpal-staging"
STORAGE_ACCESS_KEY="LTAI5t..."
STORAGE_SECRET_KEY="..."

# 内容审核在 NODE_ENV=production 时自动启用（fail-closed），无需单独的 MODERATION_PROVIDER 变量
MODERATION_API_KEY="..."

REDIS_URL="redis://redis-staging.internal:6379"
CODE_STORE="redis"
RATE_LIMIT_STORE="redis"

NODE_ENV="production"
```

---

## 2. 数据库迁移

### 2.1 开发环境（SQLite）

开发环境开箱即用，无需额外配置：

```bash
npm install
npx prisma migrate dev --name init
# 此时 dev.db 已创建，表结构已就绪
```

### 2.2 Staging / 生产（PostgreSQL）

**步骤 1：创建 PostgreSQL 数据库**

```sql
CREATE USER petpal_user WITH PASSWORD 'your_strong_password';
CREATE DATABASE petpal_staging OWNER petpal_user;
GRANT ALL PRIVILEGES ON DATABASE petpal_staging TO petpal_user;
```

**步骤 2：修改 Prisma Schema**

编辑 `prisma/schema.prisma`，将 SQLite 切换为 PostgreSQL：

```diff
  datasource db {
-   provider = "sqlite"
+   provider = "postgresql"
    url      = env("DATABASE_URL")
  }
```

> 注意：Prisma schema 中不需要 `@db.Text` 等 PostgreSQL 特有类型注解 —— Prisma 会根据 provider 自动映射。SQLite 的 `String` 在 PostgreSQL 中自动映射为 `text`。

**步骤 3：设置 DATABASE_URL 并执行迁移**

```bash
# 确保 .env 中 DATABASE_URL 指向 PostgreSQL
DATABASE_URL="postgresql://petpal_user:password@localhost:5432/petpal_staging?schema=public"

# 执行迁移（不生成新的迁移文件，仅应用已有迁移）
npx prisma migrate deploy

# 生成 Prisma Client
npx prisma generate
```

**步骤 4：验证**

```bash
# 检查表是否创建成功
psql "$DATABASE_URL" -c "\dt"
# 应列出 User, Pet, Post, Comment, Like, Follow, ... 等所有表
```

### 2.3 从 SQLite 迁移数据到 PostgreSQL（如需要）

```bash
# 导出 SQLite 数据
sqlite3 prisma/dev.db .dump > dev-dump.sql

# 手动处理 SQL 差异后导入 PostgreSQL
psql "$DATABASE_URL" < dev-dump.sql
```

> 建议使用专业 ETL 工具（如 `pgloader`）处理 SQLite 到 PostgreSQL 的数据迁移，避免手动处理 SQL 方言差异。

### 2.4 Prisma 迁移命令速查

| 命令 | 用途 | 环境 |
|------|------|------|
| `npx prisma migrate dev` | 生成并应用迁移（开发迭代） | 仅开发 |
| `npx prisma migrate deploy` | 应用已有迁移（不生成新文件） | Staging/生产 |
| `npx prisma generate` | 重新生成 Prisma Client | 所有环境 |
| `npx prisma db push` | 直接同步 schema 到数据库（无迁移文件） | 原型/临时环境 |
| `npx prisma studio` | 打开数据库管理 UI | 开发 |

---

## 3. Seed Admin

### 3.1 开发环境（自动）

开发环境首次管理员登录时自动创建 `admin / admin123`（`src/lib/admin-setup.ts` 中的 `ensureAdmin()`）。

### 3.2 Staging / 生产（必须通过环境变量）

生产环境不会自动创建默认管理员。必须先设置环境变量：

```bash
# 1. 生成密码哈希
ADMIN_PASSWORD_HASH=$(node -e "const bcrypt=require('bcryptjs');bcrypt.hash('your-secure-password',10).then(h=>console.log(h))")

# 2. 设置环境变量（写入 .env 或部署平台）
ADMIN_USERNAME="admin"
ADMIN_PASSWORD_HASH="$2a$10$Ci3MZDucxCw1oJMcFPkIiO7GfKGJBR6APJKAjNBXYFwG6hFYD3uOe"
```

> 安全提醒：
> - 不要在环境变量中存储明文密码，始终使用 bcrypt 哈希
> - `ADMIN_PASSWORD_HASH` 是 `$2a$10$...` 格式的 60 字符 bcrypt 哈希
> - 不同环境（staging / production）应使用不同的管理员密码

---

## 4. 启动服务

### 4.1 构建

```bash
npm ci --production=false   # 安装所有依赖（含 devDependencies 用于构建）
npm run build               # Next.js 生产构建
```

### 4.2 直接启动

```bash
NODE_ENV=production npm start
# 服务默认监听 http://localhost:3000
```

### 4.3 PM2 部署

```bash
# 安装 PM2
npm install -g pm2

# 创建 ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'petpal-staging',
    script: 'node_modules/.bin/next',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: '3000',
    },
    instances: 2,
    exec_mode: 'cluster',
    max_memory_restart: '512M',
  }],
};
EOF

# 启动
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # 设置开机自启
```

### 4.4 Docker 部署

```dockerfile
# Dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
# 构建镜像
docker build -t petpal-staging:latest .

# 运行容器
docker run -d \
  --name petpal-staging \
  -p 3000:3000 \
  --env-file .env \
  petpal-staging:latest

# 运行数据库迁移（在容器内）
docker exec petpal-staging npx prisma migrate deploy
```

> 注意：需要 `next.config.ts` 中配置 `output: 'standalone'` 才能使用 Docker standalone 模式。

---

## 5. 健康检查

### 5.1 基本连通性

```bash
# 首页（未登录应返回 200 并有登录页面内容）
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
# 预期: 200

# 登录 API
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800000001","code":"123456","agreementAccepted":true}'
# 预期: {"success":true,"user":{...}}

# 身份验证（未登录应返回 401）
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/auth/me
# 预期: 401（正常，表示 Session 加密正常工作）

# 管理员登录
curl -s -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
# 预期: {"success":true}

# 地点 API（无需登录）
curl -s http://localhost:3000/api/places?city=%E5%8C%97%E4%BA%AC
# 预期: {"places":[...]}
```

### 5.2 自动化健康检查脚本

```bash
#!/bin/bash
# 健康检查 — 可用于负载均衡器/监控系统
BASE="http://localhost:3000"

# 检查 HTTP 200
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/")
if [ "$HTTP_CODE" != "200" ]; then
  echo "FAIL: homepage returned $HTTP_CODE"
  exit 1
fi

# 检查 API 可用
LOGIN_RESP=$(curl -s -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800000001","code":"123456","agreementAccepted":true}')
if ! echo "$LOGIN_RESP" | grep -q '"success":true'; then
  echo "FAIL: login returned $LOGIN_RESP"
  exit 1
fi

echo "OK"
exit 0
```

---

## 6. Provider 切换对照表

| 功能 | 开发环境 | Staging | 生产 |
|------|----------|---------|------|
| **数据库** | SQLite (`file:./dev.db`) | PostgreSQL | PostgreSQL |
| **短信验证码** | mock（固定 `123456`） | Aliyun SMS | Aliyun SMS |
| **AI 健康助手** | mock（固定话术） | OpenAI / 智谱 | OpenAI / 智谱 |
| **图片存储** | 本地 `uploads/` 目录 | OSS / S3 | OSS / S3 |
| **地图服务** | Mock 占位数据 | 高德地图 API | 高德地图 API |
| **内容审核** | mock（全部通过） | 阿里云/第三方审核 (fail-closed) | 阿里云/第三方审核 |
| **Session 存储** | 加密 Cookie | 加密 Cookie | 加密 Cookie |
| **验证码存储** | 内存 (`Map`) | Redis（已实现，需配置 REDIS_URL + CODE_STORE=redis） | Redis（已实现，需配置 REDIS_URL + CODE_STORE=redis） |
| **限流存储** | 内存 (`Map`) | Redis（已实现，需配置 REDIS_URL + RATE_LIMIT_STORE=redis） | Redis（已实现，需配置 REDIS_URL + RATE_LIMIT_STORE=redis） |

### Provider 切换步骤

以短信为例：

```bash
# 1. 设置环境变量
SMS_PROVIDER="aliyun"
SMS_ACCESS_KEY="LTAI5t..."
SMS_SECRET="..."
SMS_SIGN_NAME="PetPal"
SMS_TEMPLATE_ID="SMS_123456789"

# 2. 重启服务
pm2 restart petpal-staging

# 3. 测试
curl -X POST http://localhost:3000/api/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800000001"}'
# 期望：手机收到真实短信验证码
```

---

## 7. 回滚方案

### 7.1 数据库回滚

```bash
# 方案 A：从备份恢复（推荐）
pg_restore -d petpal_staging /backups/petpal_pre_migration_20260604.dump

# 方案 B：回滚 Prisma 迁移（需有回滚 SQL）
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource prisma/schema.prisma \
  --script > rollback.sql
psql "$DATABASE_URL" < rollback.sql
```

> 迁移前务必执行数据库备份：
> ```bash
> pg_dump -Fc petpal_staging > /backups/petpal_$(date +%Y%m%d_%H%M%S).dump
> ```

### 7.2 应用回滚

```bash
# Git 回滚
git revert <commit-hash>
git push
# 重新部署

# Docker 回滚
docker stop petpal-staging
docker run -d --name petpal-staging ... petpal-staging:previous-tag

# PM2 回滚
pm2 stop petpal-staging
# 切换到上一个版本的代码目录
cd /path/to/previous-version
pm2 start ecosystem.config.js
```

### 7.3 环境变量回滚

保留上一版本的 `.env` 备份：

```bash
cp .env .env.backup-$(date +%Y%m%d_%H%M%S)
```

---

## 8. 监控

### 8.1 应用日志

```bash
# 直接启动 — 日志输出到 stdout/stderr
NODE_ENV=production npm start 2>&1 | tee -a /var/log/petpal/app.log

# PM2 — 日志管理
pm2 logs petpal-staging
pm2 logs petpal-staging --lines 100
pm2 flush petpal-staging
```

### 8.2 错误追踪（Sentry）

```bash
# 设置 Sentry DSN
SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"

# Next.js 集成 Sentry（参考 @sentry/nextjs 文档）
npm install @sentry/nextjs
```

### 8.3 API 健康监控

建议配置以下监控端点：

| 端点 | 用途 | 预期 |
|------|------|------|
| `GET /` | 页面渲染 | HTTP 200 |
| `POST /api/auth/login` | 登录功能 | HTTP 200 with `success:true` |
| `GET /api/auth/me` (未登录) | API 网关 | HTTP 401 (正常) |
| `GET /api/places?city=北京` | 外部服务依赖 | HTTP 200 with places 数组 |

### 8.4 数据库监控

```sql
-- 检查活跃连接数
SELECT count(*) FROM pg_stat_activity WHERE datname = 'petpal_staging';

-- 检查长时间运行的查询
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active' AND now() - pg_stat_activity.query_start > interval '5 seconds';
```

### 8.5 告警规则建议

| 指标 | 阈值 | 级别 |
|------|------|------|
| HTTP 5xx 错误率 | > 1% | P1 紧急 |
| HTTP 4xx 错误率 | > 10% | P2 警告 |
| API 响应时间 p95 | > 2s | P2 警告 |
| 数据库连接池耗尽 | 活跃连接 > 80% | P1 紧急 |
| 磁盘使用率 | > 85% | P2 警告 |
| 内存使用率 | > 90% | P1 紧急 |

---

## 9. 部署检查清单

- [ ] PostgreSQL 数据库已创建并可通过 `DATABASE_URL` 访问
- [ ] `npx prisma migrate deploy` 已成功执行
- [ ] `npx prisma generate` 已成功执行
- [ ] `SESSION_SECRET` 和 `ADMIN_SESSION_SECRET` 已设置为 32 位以上随机字符串
- [ ] `ADMIN_USERNAME` 和 `ADMIN_PASSWORD_HASH` 已设置
- [ ] SMS Provider 已从 `mock` 切换为真实服务
- [ ] AI Provider 已从 `mock` 切换为真实服务（如适用）
- [ ] 内容审核 Provider 已从 `mock` 切换为真实服务
- [ ] 对象存储 Provider 已从 `local` 切换为 OSS/S3
- [ ] 地图 Key 已配置
- [ ] `NODE_ENV=production`
- [ ] `npm run build` 成功
- [ ] 健康检查通过
- [ ] 数据库备份脚本已配置
- [ ] 监控和告警已配置
