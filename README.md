# PetPal - 毛孩子的社交乐园

面向猫狗主人的宠物社交与本地生活应用。用户可以分享宠物动态、约玩交友、探索附近的宠物友好场所、管理宠物健康记录，以及获得 AI 健康咨询。

## 技术栈

- **框架**: Next.js 16.2 (App Router)
- **语言**: TypeScript 5
- **样式**: Tailwind CSS v4
- **数据库**: SQLite (Prisma ORM)
- **认证**: iron-session + bcryptjs
- **UI 图标**: Lucide React
- **PWA**: Service Worker + Web App Manifest

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
| `DATABASE_URL` | 数据库连接串 | `file:./dev.db` |
| `SESSION_SECRET` | 用户会话密钥（最少 32 字符） | 已预设开发值 |
| `ADMIN_SESSION_SECRET` | 管理员会话密钥（最少 32 字符） | 已预设开发值 |
| `AI_API_KEY` | AI API 密钥（可选，不填则使用模拟 AI） | 空 |
| `AMAP_KEY` | 高德地图 API Key（可选） | 空 |

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
│   ├── nearby/                 # 附近场所页
│   ├── pets/                   # 宠物管理页
│   ├── playdates/              # 约玩活动页
│   ├── posts/                  # 动态详情页
│   ├── legal/                  # 法律条款页
│   ├── layout.tsx              # 根布局（含 PWA 配置）
│   └── page.tsx                # 首页（动态流）
├── components/
│   ├── admin/                  # 管理后台组件
│   ├── health/                 # 健康相关组件
│   ├── layout/                 # 布局组件（MobileShell, TabBar, OfflineBanner）
│   ├── pet/                    # 宠物相关组件
│   ├── post/                   # 动态相关组件
│   ├── social/                 # 社交相关组件
│   └── ui/                     # 通用 UI 组件（Button, Input, Modal, Avatar, Tabs）
├── contexts/                   # React Context（Auth, Pet）
├── lib/                        # 工具库（prisma, session, auth, ai, distance）
└── proxy.ts                    # API 请求代理配置
public/
├── manifest.json               # PWA 清单
├── sw.js                       # Service Worker
├── icon.svg                    # App 图标
├── favicon.svg                 # 网站图标
└── uploads/                    # 用户上传文件
prisma/
└── schema.prisma               # 数据库 Schema
```

## PWA 支持

PetPal 支持 PWA（渐进式 Web 应用），可在移动设备上添加到主屏幕：

- 独立的 App 图标和启动画面
- Service Worker 提供离线缓存（首页、登录、附近、地图、健康、我的）
- 离线状态下显示 "当前处于离线状态" 提示条

> 生产环境部署前，请将 `public/icon.svg` 转换为 192x192 和 512x512 的 PNG 图标，
> 并更新 `public/manifest.json` 中的 `icons` 数组。可使用 `sharp` 或 [favicon generator](https://realfavicongenerator.net) 等工具。
