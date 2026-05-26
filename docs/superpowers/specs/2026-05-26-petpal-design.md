# PetPal 设计规格

## 概述

PetPal 是面向中国大陆猫狗主人的移动端优先 Web App / PWA，提供宠物社交与本地生活服务。

## 技术栈

- Next.js 14+ (App Router) + TypeScript + Tailwind CSS
- Prisma + SQLite
- React Context + useReducer（auth + currentPet）
- lucide-react 图标
- 移动端优先，桌面端自适应（max-w-lg 居中容器）

---

## 1. 登录与鉴权

### 1.1 登录流程

- 用户输入手机号 → 前端模拟发送验证码（显示倒计时 60s）
- 输入 6 位验证码 → 后端校验
- 验证通过 → 服务端创建 session，Set-Cookie 返回 signed token（`petpal_token`）
- 前端不再直接操作 token，所有后续请求自动携带 cookie

### 1.2 Session 与鉴权

- 使用 `iron-session` 或基于 `crypto` 的自签名 token 实现服务端 session
- Session 内容：`{ userId, phone, expiresAt }`
- 所有 `/api/*` 路由通过 `getSession()` 获取 currentUser
- 未登录访问受保护 API → 返回 401
- 前端 AuthContext 通过 `/api/auth/me` 获取当前用户状态

### 1.3 Admin 独立 Session

- Admin 登录路由：`/api/admin/auth/login`
- Admin session 独立于用户 session，cookie 名 `petpal_admin_token`
- Admin session 内容：`{ adminId, username }`
- Admin API 通过 `getAdminSession()` 鉴权
- 管理员账号通过环境变量 `ADMIN_USERNAME` / `ADMIN_PASSWORD` 或 seed 脚本创建

### 1.4 中间件

- `middleware.ts` 拦截 `/admin` 路由检查 admin session，拦截受保护页面检查 user session

---

## 2. 数据模型（完整字段）

### 2.1 User
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (PK) | 自增 |
| phone | String (unique) | 手机号 |
| nickname | String? | 昵称 |
| avatar | String? | 头像 URL |
| status | Enum(ACTIVE, BANNED, DELETED) | 默认 ACTIVE |
| deletedAt | DateTime? | 注销时间 |
| agreementAccepted | Boolean | 是否同意用户协议 |
| createdAt | DateTime | |
| updatedAt | DateTime | |

账号注销规则：
- 用户发起注销 → `/api/auth/delete-account` → status=DELETED，deletedAt=now
- 手机号脱敏存储（如 `138****1234` → hash 保留），原号不可登录
- 注销用户的所有宠物、动态等数据保留但标记关联用户为"已注销用户"
- 前台展示时，注销用户的 nickname 显示为"已注销用户"，头像替换为默认灰色占位

### 2.2 Pet
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (PK) | 自增 |
| userId | Int (FK → User) | 主人 |
| name | String | 宠物昵称 |
| type | Enum(CAT, DOG) | 猫/狗 |
| breed | String? | 品种 |
| birthday | DateTime? | 生日 |
| gender | Enum(MALE, FEMALE, UNKNOWN) | |
| size | Enum(SMALL, MEDIUM, LARGE) | 体型 |
| personalityTags | String (JSON array) | 如 ["活泼","亲人"] |
| bio | String? | 简介 |
| avatar | String? | 头像 URL |
| moderationStatus | Enum(PENDING, APPROVED, REJECTED) | 简介审核 |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### 2.3 PetHealthProfile
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (PK) | |
| petId | Int (FK → Pet, unique) | 1:1 |
| weight | Float? | 体重(kg) |
| isNeutered | Boolean? | 绝育 |
| vaccineRecords | String (JSON) | `[{name,date,nextDate}]` |
| dewormRecords | String (JSON) | `[{type,date,nextDate}]` |
| allergies | String? | 过敏史 |
| medicalHistory | String? | 既往病史 |
| currentMeds | String? | 当前用药 |
| lastVetVisit | DateTime? | 最近就医时间 |
| lastVetReason | String? | 最近就医原因 |
| nextReminder | DateTime? | 下次提醒日期 |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### 2.4 HealthRecord
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (PK) | |
| petId | Int (FK → Pet) | |
| type | Enum(CHECKUP, VACCINE, DEWORM, ILLNESS, OTHER) | 记录类型 |
| recordDate | DateTime | |
| description | String? | |
| images | String (JSON array) | 图片 URL 数组 |
| createdAt | DateTime | |

### 2.5 Post
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (PK) | |
| authorPetId | Int (FK → Pet) | |
| content | String | |
| mediaType | Enum(TEXT, IMAGE, VIDEO) | 默认 TEXT |
| fuzzyLocation | String? | 模糊位置如"朝阳区" |
| status | Enum(ACTIVE, HIDDEN) | ACTIVE |
| moderationStatus | Enum(PENDING, APPROVED, REJECTED) | PENDING |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### 2.6 PostImage
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (PK) | |
| postId | Int (FK → Post) | |
| url | String | 图片 URL |
| order | Int | 排序 |

### 2.7 Comment
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (PK) | |
| postId | Int (FK → Post) | |
| authorPetId | Int (FK → Pet) | |
| content | String | |
| status | Enum(ACTIVE, HIDDEN) | ACTIVE |
| moderationStatus | Enum(PENDING, APPROVED, REJECTED) | PENDING |
| createdAt | DateTime | |

### 2.8 Like
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (PK) | |
| postId | Int (FK → Post) | |
| petId | Int (FK → Pet) | |
| createdAt | DateTime | |
| @@unique([postId, petId]) | | |

### 2.9 Follow
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (PK) | |
| followerPetId | Int (FK → Pet) | 关注方 |
| followingPetId | Int (FK → Pet) | 被关注方 |
| createdAt | DateTime | |
| @@unique([followerPetId, followingPetId]) | | |

### 2.10 FriendRequest（打招呼）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (PK) | |
| fromPetId | Int (FK → Pet) | 发起方 |
| toPetId | Int (FK → Pet) | 接收方 |
| message | String | 打招呼语 |
| status | Enum(PENDING, ACCEPTED, REJECTED) | PENDING |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### 2.10a 好友建立规则（服务端事务）

接受打招呼时，服务端在**同一事务**内执行：
1. 更新 FriendRequest.status = ACCEPTED
2. 确保双方互相关注：`upsert Follow(follower=fromPetId, following=toPetId)` + `upsert Follow(follower=toPetId, following=fromPetId)`
3. 创建 Friendship：`INSERT INTO Friendship(petId1, petId2)`（petId1 < petId2）

**好友权限：**
- 私信（创建 MessageThread 和发送 Message）仅限好友之间
- 一对一约玩邀请（Playdate type=INVITE）仅限好友之间发起
- 公开约玩活动（Playdate type=PUBLIC）无好友限制，任何人均可报名
- 取关（取消 Follow）不影响已有好友关系和私信历史

### 2.11 Friendship（好友）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (PK) | |
| petId1 | Int (FK → Pet) | 较小 ID |
| petId2 | Int (FK → Pet) | 较大 ID |
| createdAt | DateTime | |
| @@unique([petId1, petId2]) | | |

### 2.12 MessageThread
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (PK) | |
| petId1 | Int (FK → Pet) | |
| petId2 | Int (FK → Pet) | |
| lastMessageAt | DateTime | 最后消息时间 |
| createdAt | DateTime | |

### 2.13 Message
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (PK) | |
| threadId | Int (FK → MessageThread) | |
| senderPetId | Int (FK → Pet) | |
| content | String | |
| moderationStatus | Enum(PENDING, APPROVED, REJECTED) | PENDING |
| createdAt | DateTime | |

### 2.14 PetLocation
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (PK) | |
| petId | Int (FK → Pet, unique) | |
| city | String | 城市 |
| district | String? | 区 |
| lat | Float | 纬度（仅服务端使用） |
| lng | Float | 经度（仅服务端使用） |
| geohash | String? | geohash 编码（用于附近查询粗筛） |
| updatedAt | DateTime | |

**重要：PetLocation 不存储 fuzzyDistance。** 附近宠物 API 在服务端完成以下流程：
1. 以当前用户的 `(lat, lng)` 为基准，用 geohash 前缀匹配粗筛候选宠物
2. 通过 Haversine 公式计算当前用户与每个候选宠物的 numeric distance（`lib/distance.ts`）
3. 按 numeric distance 升序排序
4. 将 numeric distance 按规则（见 5.3）转换为 `fuzzyDistance` 文案返回
5. **API 响应绝不返回任何宠物的 `lat`/`lng` 字段**

前端仅展示返回的 `fuzzyDistance` 或从 `city`/`district` 派生的模糊文本（如"同城区附近""约 2.3km"），绝不渲染坐标原始值。

### 2.15 Place
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (PK) | |
| name | String | 名称 |
| type | Enum(HOSPITAL, PARK, MALL, CAFE, RESTAURANT, GROOMING, BOARDING) | |
| city | String | 城市（北京/上海/深圳） |
| district | String? | 区 |
| lat | Float | |
| lng | Float | |
| address | String | 详细地址 |
| phone | String? | 电话 |
| rating | Float? | 评分 1-5 |
| isOpen | Boolean | 营业状态 |
| openHours | String? | 营业时间描述 |
| petFriendlyTags | String (JSON) | 如 ["可带宠入内","提供饮水"] |
| images | String (JSON array) | 图片列表 |
| ownerClaimStatus | Enum(UNCLAIMED, PENDING, CLAIMED) | 默认 UNCLAIMED |
| merchantOwnerId | Int? | 认领商家 ID（预留） |
| status | Enum(ACTIVE, HIDDEN) | ACTIVE |
| createdAt | DateTime | |
| updatedAt | DateTime | |

地点类型说明：
- **HOSPITAL** — 宠物医院
- **PARK** — 宠物友好公园
- **MALL** — 宠物友好商场
- **CAFE** — 宠物友好咖啡店
- **RESTAURANT** — 宠物友好餐厅
- **GROOMING** — 洗护美容
- **BOARDING** — 寄养

### 2.16 PlaceReview
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (PK) | |
| placeId | Int (FK → Place) | |
| petId | Int (FK → Pet) | |
| rating | Int | 1-5 |
| content | String | |
| status | Enum(ACTIVE, HIDDEN) | ACTIVE |
| moderationStatus | Enum(PENDING, APPROVED, REJECTED) | PENDING |
| createdAt | DateTime | |

### 2.17 Playdate
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (PK) | |
| type | Enum(INVITE, PUBLIC) | INVITE=一对一邀请, PUBLIC=公开活动 |
| creatorPetId | Int (FK → Pet) | |
| targetPetId | Int? (FK → Pet) | INVITE 类型时必填 |
| title | String | 活动标题 |
| time | DateTime | 约定时间 |
| place | String | 地点描述 |
| description | String? | 备注 |
| sizeLimit | Int? | 人数上限 |
| suitableTypes | String (JSON) | 适合宠物类型 |
| suitableSizes | String (JSON) | 适合体型 |
| status | Enum(ACTIVE, CANCELLED, COMPLETED) | ACTIVE |
| moderationStatus | Enum(PENDING, APPROVED, REJECTED) | PENDING |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### 2.18 PlaydateParticipant
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (PK) | |
| playdateId | Int (FK → Playdate) | |
| petId | Int (FK → Pet) | |
| createdAt | DateTime | |
| @@unique([playdateId, petId]) | | |

### 2.19 Report
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (PK) | |
| reporterId | Int (FK → User) | 举报人 |
| targetType | Enum(POST, COMMENT, MESSAGE, PET, PLACEREVIEW, PLAYDATE) | |
| targetId | Int | 被举报内容 ID |
| reason | String | 举报原因 |
| status | Enum(PENDING, RESOLVED, DISMISSED) | PENDING |
| handlerAdminId | Int? (FK → AdminUser) | 处理人 |
| resolution | String? | 处理结果描述 |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### 2.20 AdminUser
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (PK) | |
| username | String (unique) | |
| passwordHash | String | bcrypt hash |
| createdAt | DateTime | |

### 2.21 AdminAction
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (PK) | |
| adminId | Int (FK → AdminUser) | |
| actionType | Enum(HIDE_POST, RESTORE_POST, HIDE_COMMENT, RESTORE_COMMENT, BAN_USER, UNBAN_USER, RESOLVE_REPORT, DISMISS_REPORT, HIDE_PLACE, RESTORE_PLACE, HIDE_REVIEW, RESTORE_REVIEW) | 操作类型 |
| targetType | Enum(POST, COMMENT, USER, REPORT, PLACE, PLACEREVIEW, PET) | 操作目标类型 |
| targetId | Int | |
| detail | String? | 操作说明 |
| createdAt | DateTime | |

---

## 3. UGC 内容审核矩阵

所有用户生成内容均需 `status`（显示状态）和 `moderationStatus`（审核状态）字段：

| 模型 | status 字段 | moderationStatus 字段 | 审核动作 |
|------|------------|----------------------|---------|
| Post | ACTIVE / HIDDEN | PENDING / APPROVED / REJECTED | Admin 可隐藏/恢复 |
| Comment | ACTIVE / HIDDEN | PENDING / APPROVED / REJECTED | Admin 可隐藏/恢复 |
| Message | — | PENDING / APPROVED / REJECTED | 私信不隐藏但可举报 |
| PlaceReview | ACTIVE / HIDDEN | PENDING / APPROVED / REJECTED | Admin 可隐藏/恢复 |
| Pet (bio) | — | PENDING / APPROVED / REJECTED | bio 和昵称审核 |
| Playdate (desc) | — | PENDING / APPROVED / REJECTED | 活动描述审核 |

默认策略：新内容 moderationStatus=PENDING，查询时默认过滤 APPROVED 或 PENDING（给新内容展示机会），管理员可从后台隐藏/驳回。

---

## 4. AI 健康助手

### 4.1 症状表单字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| petId | Int | 是 | 选择就诊宠物 |
| symptoms | String | 是 | 症状描述（自由文本） |
| duration | Enum | 是 | <1天 / 1-3天 / 4-7天 / 1-2周 / >2周 |
| appetite | Enum | 是 | 正常 / 减退 / 废绝 |
| drinking | Enum | 是 | 正常 / 增多 / 减少 |
| energy | Enum | 是 | 正常 / 嗜睡 / 焦躁 |
| bowelMovement | String | 否 | 排便/排尿情况描述 |
| isVomiting | Boolean | 否 | 是否呕吐 |
| hasInjury | Boolean | 否 | 是否有外伤 |
| images | File[] | 否 | 上传图片（最多 3 张） |

### 4.2 AI 分诊请求结构

```typescript
interface AITriageRequest {
  pet: {
    type: 'CAT' | 'DOG';
    breed?: string;
    age?: number;
    gender?: string;
    weight?: number;
    isNeutered?: boolean;
  };
  symptoms: string;
  duration: string;
  appetite: string;
  drinking: string;
  energy: string;
  bowelMovement?: string;
  isVomiting?: boolean;
  hasInjury?: boolean;
  images?: string[]; // base64 or URLs
}
```

### 4.3 AI 分诊返回结构

```typescript
interface AITriageResult {
  id: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  possibleConditions: string[];  // 可能原因（不超过 5 条）
  homeCareAdvice: string[];      // 居家观察建议
  shouldSeeVet: boolean;         // 是否建议就医
  urgencyNote?: string;          // 紧急提示（中/高风险必有）
  precautions: string[];         // 注意事项
  disclaimer: string;            // 固定免责声明
}
```

### 4.4 风险等级定义

| 等级 | 含义 | 建议动作 |
|------|------|---------|
| LOW（低风险） | 轻微症状，常见自限性问题 | 居家观察，如加重则就医 |
| MEDIUM（中风险） | 需关注，可能需医疗干预 | 建议预约就医 |
| HIGH（高风险） | 紧急/危重警示 | **尽快就医或前往急诊** |

### 4.5 禁止输出规则（Hard Constraints）

Mock 和真实 AI provider 均须遵守，通过 system prompt 约束：

- **禁止**输出确定性诊断（如"你的宠物患有 XX 病"）
- **禁止**推荐具体药物名称、剂量、用法
- **禁止**提供治疗方案或治疗承诺
- **必须**在每次回复末尾附带固定免责声明

### 4.6 固定免责声明

> **AI 健康助手结果仅供健康咨询和初步分诊参考，不能替代执业兽医诊断。**
> 如您的宠物出现以下情况，请立即前往宠物医院就诊：呼吸困难、严重外伤、持续呕吐/腹泻、意识模糊、中毒可能、超过 24 小时拒食。

### 4.7 Mock AI 实现策略

`mock-ai.ts` 基于症状关键词匹配：
- 匹配到"吐血""抽搐""昏迷""中毒""车祸"等 → HIGH
- 匹配到"呕吐""腹泻""不吃""跛行""频繁抓痒"等 → MEDIUM
- 其他 → LOW
- 模拟 2-3 秒延迟后返回结构化结果
- 代码中预留真实 AI API 调用接口（`lib/ai-provider.ts`），通过环境变量 `AI_API_KEY` 切换

---

## 5. 附近宠物与位置隐私

### 5.1 位置数据模型（见 2.14）

### 5.2 位置采集

- 用户首次使用附近/地图功能时，前端请求浏览器定位授权
- 获取成功后存储到 PetLocation 表
- 用户可在设置中清除位置或关闭定位
- 授权文案：「PetPal 使用您的位置来展示附近宠物和周边服务，您的位置不会被精确展示给其他用户」

### 5.3 模糊距离展示规则

| 实际距离 | 展示文案 |
|---------|---------|
| < 200m | "200m 内" |
| 200m - 1km | "约 XXXm"（取整到 50m） |
| 1km - 5km | "约 X.Xkm" |
| 5km - 20km | "同城 · XX区附近" |
| > 20km 或同城 | "同城" |

### 5.4 附近宠物排序

- 服务端以当前用户 PetLocation 的 `(lat, lng)` 为基准
- 第一步：geohash 前缀匹配粗筛同城候选
- 第二步：Haversine 公式计算 numeric distance，按距离升序排序
- 第三步：numeric distance → fuzzyDistance 文案转换（规则见 5.3）
- API 响应仅返回 pet 信息 + fuzzyDistance + city/district，不含 lat/lng

---

## 6. Admin 后台

### 6.1 路由与鉴权

- `/admin` — 后台入口，未登录重定向至 `/admin/login`
- `/admin/login` — 管理员登录页
- 通过独立 cookie `petpal_admin_token` 鉴权

### 6.2 Dashboard（仪表盘）

首页展示统计卡片：
- 用户总数、宠物总数、动态总数
- 待处理举报数、今日新增动态数
- 近 7 天新注册用户趋势（简单计数）

### 6.3 管理视图

| 视图 | 路径 | 功能 |
|------|------|------|
| 用户管理 | /admin/users | 列表、搜索（手机号/昵称）、封禁/解封、查看详情 |
| 宠物管理 | /admin/pets | 列表、搜索（昵称）、隐藏 bio、查看详情 |
| 动态管理 | /admin/posts | 列表、搜索（内容关键词）、隐藏/恢复、查看详情 |
| 评论管理 | /admin/comments | 列表、搜索（内容关键词）、隐藏/恢复 |
| 举报管理 | /admin/reports | 列表按状态筛选、查看被举报内容、处理（解决/驳回）、记录处理结果 |
| 地点管理 | /admin/places | 列表、隐藏/恢复地点、隐藏/恢复评价 |

### 6.4 操作规范

- 所有管理操作记录到 AdminAction 表（含隐藏、恢复、封禁、解封、举报处理），每条记录包含 adminId、actionType、targetType、targetId、detail、createdAt
- 封禁用户 → status=BANNED，该用户无法登录
- 解封用户 → status=ACTIVE，记录 UNBAN_USER
- 隐藏内容 → status=HIDDEN，记录 HIDE_POST / HIDE_COMMENT / HIDE_PLACE / HIDE_REVIEW，前端查询时排除
- 恢复内容 → status=ACTIVE，记录 RESTORE_POST / RESTORE_COMMENT / RESTORE_PLACE / RESTORE_REVIEW
- 处理举报 → status=RESOLVED/DISMISSED，记录 handlerAdminId 和 resolution
- 每个列表支持分页（每页 20 条）

---

## 7. 地图地点类型

### 7.1 地点类型枚举

```typescript
enum PlaceType {
  HOSPITAL    = 'HOSPITAL',    // 宠物医院
  PARK        = 'PARK',        // 宠物友好公园
  MALL        = 'MALL',        // 宠物友好商场
  CAFE        = 'CAFE',        // 宠物友好咖啡店
  RESTAURANT  = 'RESTAURANT',  // 宠物友好餐厅
  GROOMING    = 'GROOMING',    // 洗护美容
  BOARDING    = 'BOARDING',    // 寄养
}
```

### 7.2 商家认领预留

| 字段 | 说明 |
|------|------|
| ownerClaimStatus | UNCLAIMED — 未认领；PENDING — 待审核；CLAIMED — 已认领 |
| merchantOwnerId | 认领后关联的商家账号 ID（预留，当前不实现商家后台） |

### 7.3 Mock 地点数据

- 北京、上海、深圳各 10-12 个地点
- 覆盖全部 7 种类型
- 包含真实区名、合理坐标、评分（3.5-5.0）、营业时间、petFriendlyTags
- 2-3 条 fake 评价供详情页展示

---

## 8. 项目结构（不变）

```
petpal/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                 # 种子数据（管理员 + mock 地点）
├── src/
│   ├── app/                    # App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
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
│   │   │   ├── privacy/
│   │   │   ├── terms/
│   │   │   └── health-disclaimer/
│   │   ├── admin/
│   │   │   ├── login/
│   │   │   ├── users/
│   │   │   ├── pets/
│   │   │   ├── posts/
│   │   │   ├── comments/
│   │   │   └── reports/
│   │   └── api/
│   ├── components/
│   │   ├── ui/                 # Button, Input, Modal, Avatar, Tabs...
│   │   ├── layout/             # TabBar, Header, MobileShell, AdminShell
│   │   ├── post/               # PostCard, PostList, CommentList, PostForm
│   │   ├── pet/                # PetCard, PetAvatar, PetSwitcher, PetForm
│   │   ├── social/             # FollowButton, FriendRequestCard, ChatBubble
│   │   ├── map/                # MapPlaceholder, PlaceCard, PlaceList
│   │   ├── health/             # SymptomForm, AIResultCard, HealthRecordList
│   │   └── admin/              # StatCard, ReportTable, AdminLayout
│   ├── contexts/               # AuthContext, PetContext
│   ├── lib/
│   │   ├── prisma.ts           # Prisma 客户端单例
│   │   ├── session.ts          # getSession / getAdminSession
│   │   ├── auth.ts             # 验证码生成/校验
│   │   ├── distance.ts         # Haversine + fuzzyDistance 转换
│   │   ├── mock-ai.ts          # AI 分诊 mock
│   │   ├── mock-map.ts         # 地点 mock 数据
│   │   └── ai-provider.ts      # 真实 AI API 接口（预留）
│   ├── middleware.ts           # Session 拦截
│   └── types/
├── public/
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## 9. 路由汇总

| 路由 | 页面 | 鉴权 |
|------|------|------|
| /login | 登录 | 否 |
| / | 首页动态 | 是 |
| /nearby | 附近宠物 | 是 |
| /map | 地图发现 | 是 |
| /health | 健康档案 + AI 助手 | 是 |
| /me | 我的 | 是 |
| /pets/new | 创建宠物 | 是 |
| /pets/[id] | 宠物主页 | 是 |
| /posts/[id] | 动态详情 | 是 |
| /messages | 私信列表 | 是 |
| /messages/[threadId] | 聊天页 | 是 |
| /playdates | 约玩列表 | 是 |
| /playdates/[id] | 约玩详情 | 是 |
| /legal/privacy | 隐私政策 | 否 |
| /legal/terms | 用户协议 | 否 |
| /legal/health-disclaimer | 健康免责声明 | 否 |
| /admin | 后台首页（重定向） | Admin |
| /admin/login | 管理员登录 | 否 |
| /admin/dashboard | 仪表盘 | Admin |
| /admin/users | 用户管理 | Admin |
| /admin/pets | 宠物管理 | Admin |
| /admin/posts | 动态管理 | Admin |
| /admin/comments | 评论管理 | Admin |
| /admin/reports | 举报管理 | Admin |
| /admin/places | 地点管理 | Admin |

---

## 10. API 路由组

- `/api/auth/*` — 登录/注销/me/delete-account
- `/api/pets/*` — 宠物 CRUD + 切换当前
- `/api/posts/*` — 动态 CRUD + 列表（关注/附近/推荐）
- `/api/social/*` — 关注/打招呼/好友/私信
- `/api/places/*` — 地点列表/详情
- `/api/playdates/*` — 约玩 CRUD + 报名
- `/api/health/*` — 健康档案 + AI 分诊
- `/api/admin/auth/*` — Admin 登录
- `/api/admin/*` — 管理 CRUD
- `/api/reports/*` — 举报提交
- `/api/upload/*` — 图片上传（本地存储到 public/uploads）

---

## 11. Mock Providers

- **mock-map.ts** — 北京/上海/深圳各 10-12 个地点，覆盖全部 7 种类型，含评分/营业时间/petFriendlyTags/evaluations
- **mock-ai.ts** — 基于症状关键词匹配返回分诊结果，模拟 2-3s 延迟
- **ai-provider.ts** — 预留真实 AI API 调用，通过 `AI_API_KEY` 环境变量切换
- **mock-auth.ts** — 验证码固定为 `123456`，方便开发测试

---

## 12. 状态管理

- `AuthContext` — 用户登录态、login/logout/me
- `PetContext` — 宠物列表、当前选中宠物、切换宠物
- 持久化：当前宠物 ID 存 localStorage；登录态通过 cookie/session 维护

---

## 13. 视觉风格

- 主色调：暖橙色系（#F97316 ~ #FB923C），搭配柔和的奶油色背景
- 动态流借鉴小红书式卡片布局
- 地图详情借鉴大众点评式本地生活
- 移动端 max-w-lg 居中，桌面端自适应
- 字体：系统默认中文字体栈

---

## 14. 实现顺序

1. 项目脚手架 + Prisma schema + seed + 基础 UI 组件 + 布局（TabBar）
2. 登录系统（session + 验证码 mock） + 协议勾选
3. 宠物档案 CRUD + 当前宠物切换 + 位置采集
4. 首页动态（发布/列表/点赞/评论）+ UGC 审核字段
5. 附近宠物 + 模糊距离 + 关注/打招呼
6. 好友 + 私信（打招呼 → 接受 → 聊天）
7. 约玩（一对一邀请 + 公开活动 + 报名）
8. 地图发现（mock 地点 + 列表/详情 + 城市切换）
9. AI 健康助手（症状表单 + mock 分诊 + 图片上传）
10. Admin 后台（dashboard + 全部管理视图 + 操作日志）
11. 合规页面（协议/隐私/免责）+ 举报入口 + 注销入口
12. PWA manifest + service worker + 收尾
