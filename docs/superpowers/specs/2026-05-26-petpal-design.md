# PetPal 设计规格

## 概述

PetPal 是面向中国大陆猫狗主人的移动端优先 Web App / PWA，提供宠物社交与本地生活服务。

## 技术栈

- Next.js 14+ (App Router) + TypeScript + Tailwind CSS
- Prisma + SQLite
- React Context + useReducer（auth + currentPet）
- lucide-react 图标
- 移动端优先，桌面端自适应（max-w-lg 居中容器）

## 项目结构

```
petpal/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/                    # App Router
│   │   ├── layout.tsx          # 根布局（Providers + TabBar）
│   │   ├── page.tsx            # 首页动态
│   │   ├── login/
│   │   ├── nearby/
│   │   ├── map/
│   │   ├── health/
│   │   ├── me/
│   │   ├── pets/
│   │   ├── posts/
│   │   ├── messages/
│   │   ├── playdates/
│   │   ├── legal/
│   │   ├── admin/
│   │   └── api/                # Route Handlers
│   ├── components/
│   │   ├── ui/                 # Button, Input, Modal, Avatar...
│   │   ├── layout/             # TabBar, Header, MobileShell
│   │   ├── post/               # PostCard, PostList, CommentList
│   │   ├── pet/                # PetCard, PetAvatar, PetSwitcher
│   │   ├── social/             # FollowButton, FriendRequestCard
│   │   ├── map/                # MapPlaceholder, PlaceCard
│   │   └── health/             # SymptomForm, AIResultCard
│   ├── contexts/               # AuthContext, PetContext
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── mock-ai.ts          # AI 分诊 mock
│   │   └── mock-map.ts         # 地点数据 mock
│   └── types/
├── public/
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

## 数据模型

- **User** — id, phone, nickname, avatar, status, createdAt
- **Pet** — id, userId, name, type(CAT/DOG), breed, birthday, gender, size, personalityTags[], bio, avatar
- **PetHealthProfile** — petId(1:1), weight, isNeutered, vaccineRecords(JSON), dewormRecords(JSON), allergies, medicalHistory, currentMeds, lastVetVisit, lastVetReason, nextReminder
- **Post** — id, authorPetId, content, mediaType, fuzzyLocation, status, moderationStatus, createdAt
- **PostImage** — postId, url, order
- **Comment** — id, postId, authorPetId, content, status, moderationStatus, createdAt
- **Like** — id, postId, petId (unique compound)
- **Follow** — followerPetId, followingPetId
- **FriendRequest** — fromPetId, toPetId, message, status(PENDING/ACCEPTED/REJECTED)
- **Friendship** — petId1, petId2
- **MessageThread** — id, petId1, petId2
- **Message** — id, threadId, senderPetId, content, createdAt
- **Place** — id, name, type(HOSPITAL/PARK/CAFE/GROOMING), city, lat, lng, address, phone, rating, isOpen, petFriendlyTags[], ownerClaimStatus, merchantOwnerId
- **PlaceReview** — id, placeId, petId, rating, content
- **Playdate** — id, type(INVITE/PUBLIC), creatorPetId, targetPetId?, title, time, place, description, sizeLimit, suitableTypes[], suitableSizes[], status
- **PlaydateParticipant** — playdateId, petId
- **Report** — id, reporterId, targetType, targetId, reason, status(PENDING/RESOLVED/DISMISSED)
- **HealthRecord** — petId, type, recordDate, description, images[]
- **AdminUser** — id, username, passwordHash
- **AdminAction** — adminId, actionType, targetType, targetId, detail

所有 UGC 内容预留 moderationStatus 字段。

## 路由

| 路由 | 页面 |
|------|------|
| /login | 登录（手机号验证码模拟） |
| / | 首页动态（关注/附近/推荐 三段切换） |
| /nearby | 附近宠物 |
| /map | 地图发现 |
| /health | 健康档案 + AI 助手 |
| /me | 我的（个人信息/宠物管理/设置） |
| /pets/new | 创建宠物 |
| /pets/[id] | 宠物主页 |
| /posts/[id] | 动态详情 |
| /messages | 私信列表 |
| /messages/[threadId] | 聊天页 |
| /playdates | 约玩列表 |
| /playdates/[id] | 约玩详情 |
| /legal/privacy | 隐私政策 |
| /legal/terms | 用户协议 |
| /legal/health-disclaimer | 健康免责声明 |
| /admin | 管理后台 |

## API 路由组

- `/api/auth/*` — 登录/注销
- `/api/pets/*` — 宠物 CRUD + 切换当前
- `/api/posts/*` — 动态 CRUD + 列表
- `/api/social/*` — 关注/打招呼/好友/私信
- `/api/places/*` — 地点列表/详情
- `/api/playdates/*` — 约玩 CRUD + 报名
- `/api/health/*` — 健康档案 + AI 分诊
- `/api/admin/*` — 管理后台

## Mock Providers

- **mock-map.ts** — 北京/上海/深圳各 8-10 个地点，含坐标/评分/评价
- **mock-ai.ts** — 症状关键词匹配分诊，模拟 2-3s 延迟

## 状态管理

- `AuthContext` — 用户登录态（localStorage 持久化）
- `PetContext` — 当前选中宠物 + 宠物列表（localStorage 持久化当前选择）

## 视觉风格

- 温暖、清爽、可信的独立宠物品牌
- 动态流借鉴小红书式社区卡片
- 地图详情借鉴大众点评式本地生活
- 移动端 max-w-lg 居中，桌面端自适应

## 实现顺序

1. 项目脚手架 + 数据库 + 基础 UI + 布局
2. 登录 + 宠物档案 CRUD + 切换宠物
3. 首页动态（发布/列表/点赞/评论）
4. 附近宠物 + 关注/打招呼
5. 好友 + 私信
6. 约玩（邀请 + 公开活动）
7. 地图发现（mock）
8. AI 健康助手
9. Admin 后台
10. 合规页面 + PWA + 收尾
