# PetPal V1 内测准备清单

> 最后更新：2026-06-05
> 当前状态：Dev/Mock 阶段，准备进入内部 Beta 测试

---

## 1. 内测账号准备

### 1.1 管理员账号

管理员账号通过环境变量配置，**不依赖数据库初始化**：

```bash
# .env.staging 中设置
ADMIN_USERNAME="admin"
ADMIN_PASSWORD_HASH="$2a$10$..."  # 通过 bcryptjs 生成
```

生成密码哈希：

```bash
node -e "const b=require('bcryptjs');b.hash('your-secure-password',10).then(h=>console.log(h))"
```

管理员后台入口：`/admin/login`，可管理用户、内容、举报等。

### 1.2 测试用户账号

测试用户通过登录页面自助创建——输入手机号，获取验证码（内测阶段验证码固定为 `123456`），同意协议后自动注册并登录。无需预先在数据库创建。

### 1.3 建议准备的测试号码

建议为内测团队准备 5-10 个测试手机号，覆盖以下角色场景：

| 序号 | 虚拟号码 | 角色 | 测试重点 |
|------|---------|------|---------|
| 1 | 13800000001 | 核心宠物主 | 发布动态、创建宠物档案、使用 AI 分诊 |
| 2 | 13800000002 | 社交互动者 | 点赞、评论、关注、私信 |
| 3 | 13800000003 | 多地用户 | 切换城市、搜索地点、附近场所 |
| 4 | 13800000004 | 内容发布者 | 多图上传、长文发布、健康档案创建 |
| 5 | 13800000005 | 被举报测试 | 模拟违规内容发布，验证举报流程 |
| 6 | 13800000006 | iOS 用户 | Safari + PWA 添加到主屏幕 |
| 7 | 13800000007 | Android 用户 | Chrome + 移动端适配 |
| 8 | 13800000008 | 低频用户 | 仅浏览、不互动，验证访客体验 |

> 测试号码格式不限（11 位数字即可），内测阶段不校验真实手机号。

---

## 2. 种子数据

### 2.1 现有种子脚本

当前种子脚本：`prisma/seed-feed.mjs`，功能有限——仅为第一个宠物创建 4 条动态帖子。

运行方式：

```bash
npx prisma db seed
# 或
npm run seed-feed
```

### 2.2 内测建议种子数据

内测前建议通过 **Admin 后台手动创建** 或编写临时脚本，准备以下种子数据，覆盖北京/上海/深圳三城：

#### 宠物档案（每城 2-3 只）

| 宠物名 | 城市 | 种类 | 品种 | 年龄 | 性别 |
|--------|------|------|------|------|------|
| 布丁 | 北京 | 狗 | 金毛 | 2岁 | 公 |
| 雪球 | 北京 | 猫 | 英短 | 1岁 | 母 |
| 元宝 | 上海 | 狗 | 柯基 | 3岁 | 公 |
| 花花 | 上海 | 猫 | 布偶 | 1.5岁 | 母 |
| lucky | 深圳 | 狗 | 柴犬 | 1岁 | 公 |
| 团子 | 深圳 | 猫 | 美短 | 2岁 | 母 |

#### 动态帖子（每城 3-5 条）

- 至少包含 1 条带图片的帖子
- 覆盖场景：日常遛宠、宠物趣事、健康咨询、求助问答
- 部分帖子添加地点标签（公园、宠物医院、宠物友好咖啡馆）

#### 地点数据

| 城市 | 地点类型 | 示例 |
|------|---------|------|
| 北京 | 宠物医院 | 美联众合动物医院（朝阳大悦城分院）、芭比堂动物医院 |
| 北京 | 宠物公园 | 朝阳公园宠物乐园、奥林匹克森林公园 |
| 上海 | 宠物医院 | 瑞鹏宠物医院（徐汇分院）、顽皮家族宠物医院 |
| 上海 | 宠物公园 | 世纪公园宠物区、徐汇滨江绿地 |
| 深圳 | 宠物医院 | 芭比堂动物医院（南山分院）、瑞鹏宠物医院 |
| 深圳 | 宠物公园 | 深圳湾公园宠物区、莲花山公园 |

#### 健康档案（每只宠物 1-2 条）

- 疫苗接种记录
- 体检记录（含体重、体温等指标）
- 病历记录（含症状描述和医嘱）

### 2.3 种子数据操作方式

由于当前 `prisma/seed-feed.mjs` 仅覆盖帖子种子，建议两种方式补充其他数据：

**方式 A：Admin 后台手动创建（推荐用于少量数据）**

- 用管理员账号登录 `/admin`
- 手动创建地点、健康档案等

**方式 B：编写临时 seed 脚本（推荐用于批量数据）**

在 `prisma/` 下创建 `seed-beta.mjs`，通过 Prisma Client 批量创建以上数据。示例结构：

```js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 1. 创建测试用户
// 2. 为每个用户创建宠物
// 3. 创建地点
// 4. 创建健康档案
// 5. 创建动态 + 图片
```

> 注意：创建用户种子数据时，密码不需要明文存储；登录流程是通过短信验证码（内测固定 `123456`）进行的，因此种子用户不需要预设密码。

---

## 3. 第三方 Key 清单

内测阶段所有第三方服务均为**可选**——未配置时系统自动使用 mock/本地方案，不妨碍核心功能测试。

| 服务 | Provider | 获取方式 | 是否必须 | 文档/申请链接 |
|------|----------|---------|---------|-------------|
| 阿里云 SMS | 短信验证码 | 阿里云控制台 > 短信服务 > 申请签名和模板 | 可选（暂用 mock，固定 `123456`） | https://help.aliyun.com/product/44282.html |
| OpenAI / 智谱 AI | AI 健康分诊 | OpenAI: https://platform.openai.com/api-keys / 智谱: https://open.bigmodel.cn/ | 可选（暂用 mock；`AI_API_KEY` 为空时自动回退） | https://platform.openai.com/docs / https://open.bigmodel.cn/dev/api |
| 阿里云 OSS / S3 兼容 | 图片对象存储 | 阿里云 OSS: 控制台 > 对象存储 OSS > 创建 Bucket；或任意 S3 兼容服务（MinIO / Cloudflare R2 / AWS S3） | 可选（暂用本地 `uploads/` 目录） | https://help.aliyun.com/product/31815.html |
| 阿里云 Green（内容安全） | 图片/文字审核 | 阿里云控制台 > 内容安全 > 开通服务 | 可选（暂用关键词匹配；NODE_ENV=production 时缺 Key 会自动 fail-closed，拒绝所有内容） | https://help.aliyun.com/product/28415.html |
| 高德地图 | 前端地图展示 + 地点搜索 | 高德开放平台 > 控制台 > 创建应用 > 获取 Web JS API Key | 可选（暂用 placeholder SVG；无 Key 时地图组件显示占位，不报错） | https://lbs.amap.com/api/javascript-api-v2/summary |
| Sentry | 错误监控 | https://sentry.io > 创建项目 > 获取 DSN | 可选 | https://docs.sentry.io/platforms/javascript/guides/nextjs/ |
| Redis | 验证码 & 限流持久化 | 任何 Redis 7+ 实例（云服务或自建） | 可选（暂用内存存储；单进程开发无影响，多进程 staging 推荐配置） | https://redis.io/docs/latest/ |

### 3.1 内测阶段推荐配置优先级

```
必须配置：SESSION_SECRET、ADMIN_SESSION_SECRET、ADMIN_PASSWORD_HASH
强烈推荐：DATABASE_URL（PostgreSQL，替代默认 SQLite）
可选：    所有第三方 Provider Key（无 Key 自动 mock/本地）
```

### 3.2 Key 安全提醒

- 所有 Key 通过环境变量注入，**不要硬编码在代码中**
- `.env.staging` 文件**不要提交到 Git**（已在 `.gitignore` 中）
- 内测环境建议使用**独立的测试 Key**，不与生产共用
- API Key 建议设置**用量配额和告警**，防止内测期间意外超额消费

---

## 4. Staging 部署步骤

详见 `docs/staging-deploy.md`，以下为快速摘要。

### 4.1 服务器最低要求

| 项目 | 最低配置 | 推荐配置 |
|------|---------|---------|
| OS | Linux (Ubuntu 22.04 / Debian 12 / CentOS 9) | Ubuntu 22.04 LTS |
| CPU | 1 核 | 2 核 |
| 内存 | 2 GB | 4 GB |
| 磁盘 | 20 GB | 40 GB SSD |
| Docker | 24+ | 26+ |
| Docker Compose | 2+ | 2+ |

### 4.2 快速部署（Docker Compose，推荐）

```bash
# 1. 克隆代码
git clone <repo-url> /opt/petpal-staging
cd /opt/petpal-staging

# 2. 配置环境变量
cp .env.example .env.staging
vim .env.staging  # 填入必需值（SESSION_SECRET 等，详见 .env.example 注释）

# 3. 一键启动（Docker Compose: app + PostgreSQL + Redis）
bash scripts/staging-start.sh

# 4. 验证
curl -f http://localhost:3000/api/auth/me
# 预期：HTTP 401（应用正常运行，仅未登录）

curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800000001","code":"123456","agreementAccepted":true}'
# 预期：{"success":true,"user":{...}}

# 5. 运行冒烟测试
bash scripts/smoke-test.sh
```

### 4.3 冒烟测试覆盖

冒烟脚本 `scripts/smoke-test.sh` 验证以下端点：

| 端点 | 预期 | 说明 |
|------|------|------|
| `GET /` | 200 | 首页渲染正常 |
| `POST /api/auth/send-code` | 200 | 验证码发送正常 |
| `POST /api/auth/login` | 200 + success | 登录流程正常 |
| `GET /api/auth/me` | 401 | 未登录鉴权正常（证明 Session 加密生效） |
| `GET /api/places?city=北京` | 200 | 地点 API 正常 |
| `POST /api/admin/auth/login` | 200 + success | 管理员登录正常 |

### 4.4 域名和 HTTPS（如需要）

```bash
# 使用 Nginx 反向代理 + Let's Encrypt
# 1. 安装 Nginx + Certbot
sudo apt install nginx certbot python3-certbot-nginx

# 2. 配置 Nginx 反向代理
# /etc/nginx/sites-available/petpal-staging
server {
    listen 80;
    server_name staging.petpal.app;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 3. 启用站点 + 申请证书
sudo ln -s /etc/nginx/sites-available/petpal-staging /etc/nginx/sites-enabled/
sudo certbot --nginx -d staging.petpal.app
```

> 内测阶段如无域名，使用 IP + 端口直接访问即可。

---

## 5. 回滚步骤

### 5.1 数据库回滚

```bash
# 部署前必须备份
pg_dump -Fc petpal_staging > /backups/petpal_$(date +%Y%m%d_%H%M%S).dump

# 回滚时恢复
pg_restore -d petpal_staging /backups/petpal_<timestamp>.dump
```

> 如果使用 SQLite（开发默认），备份方式为直接复制 `prisma/dev.db` 文件：
> ```bash
> cp prisma/dev.db prisma/dev.db.backup-$(date +%Y%m%d_%H%M%S)
> ```

### 5.2 应用回滚（Docker）

```bash
# 方案 A：回滚到上一版本 git tag
git checkout v<previous-tag>
docker compose -f docker-compose.staging.yml up -d --build

# 方案 B：使用特定 image tag
docker tag petpal-staging:latest petpal-staging:backup-$(date +%Y%m%d)
docker compose -f docker-compose.staging.yml up -d  # 使用之前的 image
```

### 5.3 配置回滚

```bash
# 修改环境变量前自动备份
cp .env.staging .env.staging.backup-$(date +%Y%m%d_%H%M%S)

# 回滚时恢复
cp .env.staging.backup-<timestamp> .env.staging
docker compose -f docker-compose.staging.yml up -d  # 重启以加载新配置
```

### 5.4 回滚决策矩阵

| 问题类型 | 回滚级别 | 操作 | 预计恢复时间 |
|---------|---------|------|------------|
| 代码 Bug（非数据相关） | 应用回滚 | Docker tag 切回上一版本 | < 5 分钟 |
| 数据库迁移失败 | 数据库回滚 | pg_restore 恢复备份 | < 15 分钟 |
| 环境变量配置错误 | 配置回滚 | 恢复 .env.staging + 重启 | < 3 分钟 |
| 第三方服务异常 | 无需回滚 | Provider 自动降级为 mock（如有降级逻辑） | 自动 |
| 所有方法都失效 | 完整重建 | docker compose down -v && 重新部署 | < 30 分钟 |

---

## 6. 已知限制

以下功能在内测阶段**暂未接入真实服务**，使用 mock/本地替代方案。内测期间仅需关注核心社区功能（发布、互动、地点、宠物档案），以下限制不影响基本使用体验。

| 功能 | 当前状态 | Mock 行为 | 影响范围 |
|------|---------|----------|---------|
| 短信验证码 | mock | 验证码固定为 `123456`，任意 11 位手机号均可注册/登录 | 无法测试真实短信到达率 |
| AI 分诊 | mock | 返回固定话术，不调用 AI API | 无法测试 AI 分诊准确性和响应速度 |
| 地图展示 | placeholder SVG | 地图区域显示占位 svg，不加载高德地图 | 无法测试地点定位和附近搜索 |
| 图片存储 | 本地 `uploads/` 目录 | 上传图片保存在服务器本地磁盘 | 无法测试 CDN 加速、跨服务器共享、大文件上传 |
| 内容审核 | 关键词匹配 | 仅对明显违规关键词做拦截，无图片审核 | 无法测试真实审核准确率和误杀率 |
| Service Worker | 已禁用 | PWA 离线缓存不生效 | 无法测试离线体验 |
| 推送通知 | 未实现 | 无 Web Push / 移动推送 | 无法测试通知触达率 |
| 商家后台 | 未实现 | 无商家入驻、服务发布功能 | V2 计划功能 |

### 6.1 内测范围说明

**内测重点验证：**
- 用户注册/登录流程（手机号 + 验证码）
- 宠物档案创建与管理
- 动态发布（文字 + 图片）
- 社交互动（点赞、评论、关注）
- 地点浏览与搜索
- 健康档案记录
- 管理后台功能（用户管理、举报处理、内容管理）
- 移动端适配（iOS Safari / Android Chrome）
- PWA 安装（添加到主屏幕入口存在但因 SW 禁用无离线能力）

**内测不验证：**
- 真实短信发送与接收
- AI 分诊准确性
- 地图定位与附近搜索精度
- 大文件/CDN 上传性能
- 真实内容审核效果
- 高并发性能

---

## 7. 用户反馈收集

### 7.1 推荐方案

| 方案 | 适用场景 | 链接 |
|------|---------|------|
| 飞书多维表格 + 群聊 | 内部团队，实时沟通 | 创建飞书群后生成表单链接 |
| 企业微信群 + 腾讯问卷 | 微信生态习惯的团队 | https://wj.qq.com/ |
| Google Form | 跨平台、通用场景 | https://forms.google.com/ |
| Notion 数据库 | 已有 Notion 工作流的团队 | https://www.notion.so/ |
| GitHub Issues | 技术团队，已有 GitHub 账号 | 在私有仓库创建 Bug Report 模板 |

### 7.2 反馈收集模板

建议收集以下维度的反馈：

```
【问题类型】Bug / 功能建议 / 体验问题 / 其他
【严重程度】阻塞 / 严重 / 一般 / 建议
【页面/功能】在哪发现的（如：发布动态页）
【操作步骤】做了什么操作
【预期结果】期望发生什么
【实际结果】实际发生了什么
【截图/录屏】附件
【设备信息】手机型号 + 浏览器 + 网络环境
【联系方式】选填，用于跟进
```

### 7.3 反馈响应 SLA（内测期间）

| 优先级 | 响应时间 | 处理时间 |
|--------|---------|---------|
| 阻塞（核心功能不可用） | 2 小时内 | 24 小时内 |
| 严重（影响使用但有绕过方式） | 1 天内 | 3 天内 |
| 一般（不影响使用） | 2 天内 | 下个迭代 |
| 建议 | 收集到迭代规划 | - |

---

## 8. 高风险问题处理流程

### 8.1 安全漏洞

```
发现安全漏洞
  -> 1. 立即报告：在安全群 / 私聊技术负责人
  -> 2. 紧急评估：确认影响范围（是否涉及用户数据泄漏、权限绕过等）
  -> 3. 立即下线：如涉及数据泄漏，立即 `docker compose down`
  -> 4. 修复：在独立分支修复并 Code Review
  -> 5. 验证：在 staging 验证修复有效性
  -> 6. 重新部署 + 通知内测用户
```

### 8.2 数据丢失

```
发现数据丢失
  -> 1. 确认丢失范围：哪张表、哪个时间段
  -> 2. 停止写操作：暂停相关功能，避免脏数据覆盖
  -> 3. 从备份恢复：选用最近的正常备份（见第 5 节回滚步骤）
  -> 4. 验证恢复结果：随机抽查恢复的数据完整性
  -> 5. 记录事故报告：原因、影响、修复措施、预防方案
```

### 8.3 服务不可用

```
服务不可用
  -> 1. 快速诊断
       docker compose -f docker-compose.staging.yml ps  # 容器状态
       docker compose -f docker-compose.staging.yml logs --tail=100 app  # 应用日志
       docker compose -f docker-compose.staging.yml logs --tail=100 db   # 数据库日志
  -> 2. 常见问题处理：
       - 容器退出：docker compose up -d（自动重启策略已在 compose 中配置）
       - 端口冲突：lsof -i :3000，更换 PORT 环境变量
       - 数据库连接失败：检查 DATABASE_URL、db 容器是否 running
       - 内存不足：docker stats，考虑增加服务器内存或 swap
  -> 3. 若无法快速恢复：执行回滚（见第 5 节）
```

### 8.4 内容违规

```
发现违规内容（内测期间）
  -> 1. 管理员登录 /admin/reports 查看举报
  -> 2. 确认违规：核实内容是否违反社区规范
  -> 3. 处置：
       - 隐藏内容：POST.status = 'HIDDEN'
       - 封禁用户：USER.status = 'BANNED'
       - 或发警告通知
  -> 4. 记录处置日志（当前通过数据库记录，后续可接入审计系统）
  -> 5. 如发现内容审核规则不足，更新关键词列表或调整审核策略
```

### 8.5 紧急联系人

内测期间建议建立以下角色分工：

| 角色 | 职责 | 至少 1 人 |
|------|------|----------|
| 后端 on-call | 服务宕机、数据库问题、API 异常 | 是 |
| 前端 on-call | 页面白屏、渲染异常、适配问题 | 是 |
| 内容安全 | 违规内容处置、举报处理 | 是 |
| 内测协调人 | 用户反馈汇总、问题分发、内测群维护 | 是 |

> 内测团队人数有限时，一人可兼任多角色。

### 8.6 事故升级

```
问题持续时间超过 SLA
  -> 通知内测群：当前问题 + 预计恢复时间
  -> 如超过 4 小时未解决：通知所有内测用户暂停测试相关功能
  -> 如超过 24 小时：考虑内测暂停，修复后重新启动
```

---

## 附录

### A. 相关文档索引

| 文档 | 路径 | 说明 |
|------|------|------|
| 项目 README | `../README.md` | 项目说明、开发启动、账号、环境变量、目录结构 |
| Staging 部署指南 | `staging-deploy.md` | 详细部署、环境变量、数据库迁移、回滚、监控 |
| 上线准备清单 | `launch-readiness.md` | 备案、合规、内容安全、数据安全、AI 合规、技术准备 |
| 环境变量模板 | `../.env.example` | 所有支持的环境变量及注释说明 |
| 数据模型 | `../prisma/schema.prisma` | 数据模型定义、provider 切换说明 |
| 种子脚本 | `../prisma/seed-feed.mjs` | 现有动态帖子种子数据 |

### B. 内测启动前检查清单

- [ ] 服务器已准备（Linux + Docker，2GB+ RAM）
- [ ] `.env.staging` 已配置（至少包含 SESSION_SECRET、ADMIN_SESSION_SECRET、ADMIN_PASSWORD_HASH）
- [ ] `bash scripts/staging-start.sh` 启动成功
- [ ] 健康检查 `/api/auth/me` 返回 401
- [ ] 登录 `/api/auth/login` 返回 success
- [ ] 冒烟测试 `bash scripts/smoke-test.sh` 全部通过
- [ ] 管理员账号可正常登录 `/admin`
- [ ] 种子数据已准备（或已确认可手动创建）
- [ ] 测试账号（5-10 个号码）已分配给内测成员
- [ ] 反馈收集渠道已建立（飞书群 / 腾讯问卷 / Google Form）
- [ ] 内测成员已知晓验证码为固定 `123456`
- [ ] 内测成员已知晓各 mock 限制
- [ ] 紧急联系人角色已分配
