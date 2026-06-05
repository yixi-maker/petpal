# PetPal - 毛孩子的社交与健康空间

PetPal 是一个手机优先的宠物社交、本地生活与健康管理 Web App。V1 面向猫狗主人，同时把宠物作为独立主体：宠物可以拥有档案、主页、动态、朋友关系和健康记录，主人可以探索附近宠物友好地点，并通过 AI 助手做初步健康分诊。

## 技术栈

- **框架**: Next.js 16.2 (App Router)
- **语言**: TypeScript 5
- **样式**: Tailwind CSS v4
- **数据库**: SQLite 开发库（Prisma ORM），生产环境预留 PostgreSQL
- **认证**: iron-session + bcryptjs
- **UI 图标**: Lucide React
- **服务抽象**: SMS、AI、Storage、Moderation、Maps Provider
- **移动端能力**: Web App Manifest + 移动端视口适配（V1 暂不启用 Service Worker）

## 快速开始

```bash
# 安装依赖
npm install

# 初始化数据库
npx prisma migrate dev

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 打开应用。

## 默认账号

| 角色 | 手机号 | 密码 | 用途 |
|------|--------|------|------|
| 普通用户 | 13800000001 | 123456 | 测试用户 |  
| 管理员 | admin | admin123 | 后台管理 |  

> 注册或登录时，短信验证码可用 `123456`（开发环境万能验证码）。

## 环境变量

复制 `.env.example` 为 `.env`，根据需要修改：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DATABASE_URL` | 数据库连接串；开发环境会解析到 `prisma/dev.db` | `file:./dev.db` |
| `SESSION_SECRET` | 用户会话密钥（最少 32 字符） | 已预设开发值 |
| `ADMIN_SESSION_SECRET` | 管理员会话密钥（最少 32 字符） | 已预设开发值 |
| `SMS_PROVIDER` | 短信服务 Provider | `mock` |
| `AI_PROVIDER` | AI 健康分诊 Provider | `mock` |
| `STORAGE_PROVIDER` | 图片存储 Provider | `local` |
| `MODERATION_PROVIDER` | 内容审核 Provider | `mock` |
| `NEXT_PUBLIC_AMAP_KEY` / `AMAP_KEY` | 高德地图 Key（可选） | 空 |

## 生产环境部署

部署到生产环境前，请完成以下步骤：

1. **配置环境变量**：复制 `.env.example` 为 `.env` 并根据生产环境修改所有变量。
   - 必须设置 `SESSION_SECRET` 和 `ADMIN_SESSION_SECRET`（各至少 32 字符，可使用 `openssl rand -base64 64` 生成）。
   - 必须设置 `ADMIN_USERNAME` 和 `ADMIN_PASSWORD_HASH`（管理员密码的 bcrypt 哈希，可用 `node -e "const bcrypt=require('bcryptjs');bcrypt.hash('your-password',10).then(h=>console.log(h))"` 生成）。
   - 根据实际使用的服务配置 AI、SMS、地图、存储、内容审核的 Provider。

2. **数据库**：将 `prisma/schema.prisma` 中的 provider 从 `sqlite` 改为 `postgresql`，设置 PostgreSQL 连接串，执行 `npx prisma migrate deploy && npx prisma generate`。

3. **会话安全**：应用启动时会自动检测生产环境中是否仍在使用开发默认密钥，若未修改则会抛出错误并拒绝启动。

4. **管理员账号**：生产环境不会自动创建默认 admin/admin123 账号，必须通过环境变量 `ADMIN_USERNAME` 和 `ADMIN_PASSWORD_HASH` 配置。

5. **构建与启动**：
   ```bash
   npm run build
   npm start
   ```

## 项目结构

```
src/
├── app/                        # Next.js App Router 页面与 API 路由
│   ├── admin/                  # 管理后台（仪表盘、用户/帖子/评论管理）
│   ├── api/                    # REST API 路由
│   │   ├── auth/               # 认证接口（登录/登出/注销）
│   │   ├── admin/              # 管理员接口
│   │   ├── health/             # 健康记录与 AI 分诊
│   │   ├── messages/           # 私信
│   │   ├── nearby/             # 附近场所
│   │   ├── pets/               # 宠物档案
│   │   ├── places/             # 宠物友好场所
│   │   ├── playdates/          # 约玩活动
│   │   ├── posts/              # 动态与评论
│   │   └── social/             # 关注与好友
│   ├── health/                 # 健康中心页面
│   ├── login/                  # 登录页
│   ├── map/                    # 地图页
│   ├── me/                     # 个人中心
│   ├── messages/               # 私信页
│   ├── nearby/                 # 附近宠物与社交发现页
│   ├── pets/                   # 宠物管理页
│   ├── playdates/              # 约玩活动页
│   ├── posts/                  # 动态详情页
│   ├── legal/                  # 法律条款页
│   ├── layout.tsx              # 根布局（含 PWA 配置）
│   └── page.tsx                # 首页（动态流）
├── components/
│   ├── admin/                  # 管理后台组件
│   ├── health/                 # 健康相关组件
│   ├── layout/                 # 布局组件（MobileShell, TabBar, Providers）
│   ├── pet/                    # 宠物相关组件
│   ├── post/                   # 动态相关组件
│   ├── social/                 # 社交相关组件
│   └── ui/                     # 通用 UI 组件（Button, Input, Modal, Avatar, Tabs）
├── contexts/                   # React Context（Auth, Pet）
├── lib/                        # 工具库（prisma, session, auth, ai, distance）
└── proxy.ts                    # API 请求代理配置
public/
├── manifest.json               # PWA 清单
├── icon.svg                    # App 图标
├── favicon.svg                 # 网站图标
└── uploads/                    # 用户上传文件
prisma/
├── schema.prisma               # 数据库 Schema
└── dev.db                      # 开发环境 SQLite 数据库
```

## 移动端支持

PetPal V1 按手机优先体验设计，并提供 Web App Manifest，可在移动设备上添加到主屏幕：

- 独立的 App 图标和启动画面
- 贴近原生 App 的竖屏使用体验
- 蓝绿色主题色与移动端浏览器状态栏适配

> V1 为了稳定性暂不注册 Service Worker；真正的离线缓存、推送提醒可放到 V1.1/V2 处理。

> 生产环境部署前，请将 `public/icon.svg` 转换为 192x192 和 512x512 的 PNG 图标，
> 并更新 `public/manifest.json` 中的 `icons` 数组。可使用 `sharp` 或 [favicon generator](https://realfavicongenerator.net) 等工具。
