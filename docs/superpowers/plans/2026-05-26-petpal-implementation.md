# PetPal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete mobile-first PWA for Chinese pet owners with social feed, nearby discovery, map, AI health assistant, and admin panel.

**Architecture:** Next.js 14 App Router with React Server Components for data fetching, React Context for client state (auth + currentPet), Prisma + SQLite for persistence, iron-session for cookie-based auth, and mock providers for map/AI with real provider interfaces reserved.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Prisma, SQLite, lucide-react, iron-session, bcryptjs

---

## Phase 0: Environment Setup

### Task 0.1: Install Node.js

- [ ] **Step 1: Install Node.js 22 LTS via Homebrew**

```bash
brew install node@22
```

- [ ] **Step 2: Verify installation**

```bash
node --version  # expect v22.x
npm --version
```

- [ ] **Step 3: Add to PATH if needed**

```bash
echo 'export PATH="/opt/homebrew/opt/node@22/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Task 0.2: Scaffold Next.js Project

- [ ] **Step 1: Create Next.js project**

```bash
cd /Users/luohanyu/Documents/petpal
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

- [ ] **Step 2: Install core dependencies**

```bash
npm install prisma @prisma/client lucide-react iron-session bcryptjs
npm install -D @types/bcryptjs
```

- [ ] **Step 3: Initialize Prisma with SQLite**

```bash
npx prisma init --datasource-provider sqlite
```

- [ ] **Step 4: Clean up default files**

Remove `src/app/page.module.css`, clear `src/app/page.tsx` to minimal placeholder, clear `src/app/globals.css` keeping only Tailwind directives.

- [ ] **Step 5: Verify dev server starts**

```bash
npm run dev
# Visit http://localhost:3000 - expect blank page with no errors
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "chore: scaffold Next.js project with Prisma and core dependencies"
```

---

## Phase 1: Prisma Schema + Seed + Base Layout

### Task 1.1: Write Complete Prisma Schema

**Files:**
- Modify: `prisma/schema.prisma`

Copy the complete schema from spec sections 2.1–2.21, using SQLite-compatible enums (stored as String), with all relations and compound unique constraints.

- [ ] **Step 1: Write the full schema**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model User {
  id                Int       @id @default(autoincrement())
  phone             String    @unique
  nickname          String?
  avatar            String?
  status            String    @default("ACTIVE") // ACTIVE | BANNED | DELETED
  deletedAt         DateTime?
  agreementAccepted Boolean   @default(false)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  pets              Pet[]
  reports           Report[]
}

model Pet {
  id               Int       @id @default(autoincrement())
  userId           Int
  name             String
  type             String    // CAT | DOG
  breed            String?
  birthday         DateTime?
  gender           String    @default("UNKNOWN") // MALE | FEMALE | UNKNOWN
  size             String    @default("MEDIUM") // SMALL | MEDIUM | LARGE
  personalityTags  String    @default("[]") // JSON array
  bio              String?
  avatar           String?
  moderationStatus String    @default("PENDING") // PENDING | APPROVED | REJECTED
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  user             User      @relation(fields: [userId], references: [id])
  healthProfile    PetHealthProfile?
  healthRecords    HealthRecord[]
  posts            Post[]
  comments         Comment[]
  likes            Like[]
  followers        Follow[]  @relation("Following")
  following        Follow[]  @relation("Follower")
  sentRequests     FriendRequest[]  @relation("FromPet")
  receivedRequests FriendRequest[]  @relation("ToPet")
  friendships1     Friendship[] @relation("Pet1")
  friendships2     Friendship[] @relation("Pet2")
  thread1          MessageThread[] @relation("Pet1InThread")
  thread2          MessageThread[] @relation("Pet2InThread")
  messages         Message[]
  location         PetLocation?
  placeReviews     PlaceReview[]
  createdPlaydates Playdate[]  @relation("Creator")
  invitedPlaydates Playdate[]  @relation("Target")
  participations   PlaydateParticipant[]
}

model PetHealthProfile {
  id              Int       @id @default(autoincrement())
  petId           Int       @unique
  weight          Float?
  isNeutered      Boolean?
  vaccineRecords  String    @default("[]") // JSON
  dewormRecords   String    @default("[]") // JSON
  allergies       String?
  medicalHistory  String?
  currentMeds     String?
  lastVetVisit    DateTime?
  lastVetReason   String?
  nextReminder    DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  pet             Pet       @relation(fields: [petId], references: [id])
}

model HealthRecord {
  id          Int       @id @default(autoincrement())
  petId       Int
  type        String    // CHECKUP | VACCINE | DEWORM | ILLNESS | OTHER
  recordDate  DateTime
  description String?
  images      String    @default("[]") // JSON array
  createdAt   DateTime  @default(now())
  pet         Pet       @relation(fields: [petId], references: [id])
}

model Post {
  id               Int       @id @default(autoincrement())
  authorPetId      Int
  content          String
  mediaType        String    @default("TEXT") // TEXT | IMAGE | VIDEO
  fuzzyLocation    String?
  status           String    @default("ACTIVE") // ACTIVE | HIDDEN
  moderationStatus String    @default("PENDING") // PENDING | APPROVED | REJECTED
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  author           Pet       @relation(fields: [authorPetId], references: [id])
  images           PostImage[]
  comments         Comment[]
  likes            Like[]
}

model PostImage {
  id     Int    @id @default(autoincrement())
  postId Int
  url    String
  order  Int
  post   Post   @relation(fields: [postId], references: [id], onDelete: Cascade)
}

model Comment {
  id               Int      @id @default(autoincrement())
  postId           Int
  authorPetId      Int
  content          String
  status           String   @default("ACTIVE") // ACTIVE | HIDDEN
  moderationStatus String   @default("PENDING")
  createdAt        DateTime @default(now())
  post             Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  author           Pet      @relation(fields: [authorPetId], references: [id])
}

model Like {
  id        Int      @id @default(autoincrement())
  postId    Int
  petId     Int
  createdAt DateTime @default(now())
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  pet       Pet      @relation(fields: [petId], references: [id])
  @@unique([postId, petId])
}

model Follow {
  id             Int      @id @default(autoincrement())
  followerPetId  Int
  followingPetId Int
  createdAt      DateTime @default(now())
  follower       Pet      @relation("Follower", fields: [followerPetId], references: [id])
  following      Pet      @relation("Following", fields: [followingPetId], references: [id])
  @@unique([followerPetId, followingPetId])
}

model FriendRequest {
  id        Int      @id @default(autoincrement())
  fromPetId Int
  toPetId   Int
  message   String
  status    String   @default("PENDING") // PENDING | ACCEPTED | REJECTED
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  fromPet   Pet      @relation("FromPet", fields: [fromPetId], references: [id])
  toPet     Pet      @relation("ToPet", fields: [toPetId], references: [id])
}

model Friendship {
  id        Int      @id @default(autoincrement())
  petId1    Int
  petId2    Int
  createdAt DateTime @default(now())
  pet1      Pet      @relation("Pet1", fields: [petId1], references: [id])
  pet2      Pet      @relation("Pet2", fields: [petId2], references: [id])
  @@unique([petId1, petId2])
}

model MessageThread {
  id            Int       @id @default(autoincrement())
  petId1        Int
  petId2        Int
  lastMessageAt DateTime  @default(now())
  createdAt     DateTime  @default(now())
  pet1          Pet       @relation("Pet1InThread", fields: [petId1], references: [id])
  pet2          Pet       @relation("Pet2InThread", fields: [petId2], references: [id])
  messages      Message[]
}

model Message {
  id               Int      @id @default(autoincrement())
  threadId         Int
  senderPetId      Int
  content          String
  moderationStatus String   @default("PENDING")
  createdAt        DateTime @default(now())
  thread           MessageThread @relation(fields: [threadId], references: [id], onDelete: Cascade)
  sender           Pet      @relation(fields: [senderPetId], references: [id])
}

model PetLocation {
  id        Int      @id @default(autoincrement())
  petId     Int      @unique
  city      String
  district  String?
  lat       Float
  lng       Float
  geohash   String?
  updatedAt DateTime @updatedAt
  pet       Pet      @relation(fields: [petId], references: [id])
}

model Place {
  id               Int      @id @default(autoincrement())
  name             String
  type             String   // HOSPITAL | PARK | MALL | CAFE | RESTAURANT | GROOMING | BOARDING
  city             String
  district         String?
  lat              Float
  lng              Float
  address          String
  phone            String?
  rating           Float?
  isOpen           Boolean  @default(true)
  openHours        String?
  petFriendlyTags  String   @default("[]") // JSON
  images           String   @default("[]") // JSON
  ownerClaimStatus String   @default("UNCLAIMED")
  merchantOwnerId  Int?
  status           String   @default("ACTIVE")
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  reviews          PlaceReview[]
}

model PlaceReview {
  id               Int      @id @default(autoincrement())
  placeId          Int
  petId            Int
  rating           Int
  content          String
  status           String   @default("ACTIVE")
  moderationStatus String   @default("PENDING")
  createdAt        DateTime @default(now())
  place            Place    @relation(fields: [placeId], references: [id])
  pet              Pet      @relation(fields: [petId], references: [id])
}

model Playdate {
  id               Int      @id @default(autoincrement())
  type             String   // INVITE | PUBLIC
  creatorPetId     Int
  targetPetId      Int?
  title            String
  time             DateTime
  place            String
  description      String?
  sizeLimit        Int?
  suitableTypes    String   @default("[]") // JSON
  suitableSizes    String   @default("[]") // JSON
  status           String   @default("ACTIVE") // ACTIVE | CANCELLED | COMPLETED
  moderationStatus String   @default("PENDING")
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  creator          Pet      @relation("Creator", fields: [creatorPetId], references: [id])
  target           Pet?     @relation("Target", fields: [targetPetId], references: [id])
  participants     PlaydateParticipant[]
}

model PlaydateParticipant {
  id         Int      @id @default(autoincrement())
  playdateId Int
  petId      Int
  createdAt  DateTime @default(now())
  playdate   Playdate @relation(fields: [playdateId], references: [id])
  pet        Pet      @relation(fields: [petId], references: [id])
  @@unique([playdateId, petId])
}

model Report {
  id             Int      @id @default(autoincrement())
  reporterId     Int
  targetType     String   // POST | COMMENT | MESSAGE | PET | PLACEREVIEW | PLAYDATE
  targetId       Int
  reason         String
  status         String   @default("PENDING") // PENDING | RESOLVED | DISMISSED
  handlerAdminId Int?
  resolution     String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  reporter       User     @relation(fields: [reporterId], references: [id])
  handler        AdminUser? @relation(fields: [handlerAdminId], references: [id])
}

model AdminUser {
  id           Int           @id @default(autoincrement())
  username     String        @unique
  passwordHash String
  createdAt    DateTime      @default(now())
  actions      AdminAction[]
  handledReports Report[]
}

model AdminAction {
  id         Int      @id @default(autoincrement())
  adminId    Int
  actionType String   // HIDE_POST | RESTORE_POST | HIDE_COMMENT | RESTORE_COMMENT | BAN_USER | UNBAN_USER | RESOLVE_REPORT | DISMISS_REPORT | HIDE_PLACE | RESTORE_PLACE | HIDE_REVIEW | RESTORE_REVIEW
  targetType String   // POST | COMMENT | USER | REPORT | PLACE | PLACEREVIEW | PET
  targetId   Int
  detail     String?
  createdAt  DateTime @default(now())
  admin      AdminUser @relation(fields: [adminId], references: [id])
}
```

- [ ] **Step 2: Run migration**

```bash
npx prisma migrate dev --name init
```

Expected: migration created successfully, `prisma/dev.db` created.

- [ ] **Step 3: Commit**

```bash
git add prisma/ && git commit -m "feat: add complete Prisma schema with all 21 models"
```

### Task 1.2: Prisma Client Singleton

**Files:**
- Create: `src/lib/prisma.ts`

- [ ] **Step 1: Write singleton**

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/prisma.ts && git commit -m "feat: add Prisma client singleton"
```

### Task 1.3: Tailwind Config with Brand Colors

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Update tailwind.config.ts**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        cream: '#FFFBF5',
      },
      maxWidth: {
        mobile: '430px',
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 2: Update globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-cream text-gray-900 antialiased;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
      'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  }
}

@layer components {
  .mobile-container {
    @apply max-w-mobile mx-auto min-h-screen bg-white shadow-sm;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.ts src/app/globals.css && git commit -m "feat: configure Tailwind with PetPal brand colors"
```

### Task 1.4: Base UI Components

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Input.tsx`
- Create: `src/components/ui/Modal.tsx`
- Create: `src/components/ui/Avatar.tsx`
- Create: `src/components/ui/Tabs.tsx`
- Create: `src/components/ui/index.ts`

- [ ] **Step 1: Write Button component**

```typescript
// src/components/ui/Button.tsx
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const variants = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  outline: 'border border-brand-500 text-brand-500 hover:bg-brand-50',
  ghost: 'text-gray-500 hover:bg-gray-100',
  danger: 'bg-red-500 text-white hover:bg-red-600',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Write Input component**

```typescript
// src/components/ui/Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        className={`w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition ${error ? 'border-red-400 focus:ring-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 3: Write Modal component**

```typescript
// src/components/ui/Modal.tsx
import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto p-6 animate-slide-up">
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write Avatar component**

```typescript
// src/components/ui/Avatar.tsx
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
};

const iconSizes = { sm: 14, md: 18, lg: 24, xl: 32 };

export function Avatar({ src, alt = '', size = 'md', className = '' }: AvatarProps) {
  if (src) {
    return (
      <img src={src} alt={alt} className={`${sizes[size]} rounded-full object-cover ${className}`} />
    );
  }
  return (
    <div className={`${sizes[size]} rounded-full bg-brand-100 flex items-center justify-center ${className}`}>
      <User className="text-brand-500" size={iconSizes[size]} />
    </div>
  );
}
```

- [ ] **Step 5: Write Tabs component**

```typescript
// src/components/ui/Tabs.tsx
interface Tab {
  key: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function Tabs({ tabs, activeKey, onChange }: TabsProps) {
  return (
    <div className="flex border-b border-gray-100">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex-1 py-3 text-sm font-medium transition relative ${
            activeKey === tab.key ? 'text-brand-500' : 'text-gray-400'
          }`}
        >
          {tab.label}
          {activeKey === tab.key && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand-500 rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Write barrel export**

```typescript
// src/components/ui/index.ts
export { Button } from './Button';
export { Input } from './Input';
export { Modal } from './Modal';
export { Avatar } from './Avatar';
export { Tabs } from './Tabs';
```

- [ ] **Step 7: Add slide-up animation to tailwind config**

```typescript
// In tailwind.config.ts theme.extend, add:
keyframes: {
  'slide-up': {
    '0%': { transform: 'translateY(100%)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
},
animation: {
  'slide-up': 'slide-up 0.25s ease-out',
},
```

- [ ] **Step 8: Commit**

```bash
git add src/components/ui/ tailwind.config.ts && git commit -m "feat: add base UI components (Button, Input, Modal, Avatar, Tabs)"
```

### Task 1.5: Layout Shell with TabBar

**Files:**
- Create: `src/components/layout/TabBar.tsx`
- Create: `src/components/layout/MobileShell.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Write TabBar component**

```typescript
// src/components/layout/TabBar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MapPin, Map, Stethoscope, User } from 'lucide-react';

const tabs = [
  { key: '/', label: '动态', icon: Home },
  { key: '/nearby', label: '附近', icon: MapPin },
  { key: '/map', label: '地图', icon: Map },
  { key: '/health', label: '健康', icon: Stethoscope },
  { key: '/me', label: '我的', icon: User },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 safe-area-bottom">
      <div className="max-w-mobile mx-auto flex">
        {tabs.map(({ key, label, icon: Icon }) => {
          const isActive = pathname === key;
          return (
            <Link
              key={key}
              href={key}
              className={`flex-1 flex flex-col items-center py-1.5 text-[10px] transition ${
                isActive ? 'text-brand-500' : 'text-gray-400'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" strokeWidth={isActive ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Write MobileShell component**

```typescript
// src/components/layout/MobileShell.tsx
import { TabBar } from './TabBar';

export function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mobile-container relative">
      <main className="pb-16">{children}</main>
      <TabBar />
    </div>
  );
}
```

- [ ] **Step 3: Update root layout**

```typescript
// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { MobileShell } from '@/components/layout/MobileShell';

export const metadata: Metadata = {
  title: 'PetPal - 毛孩子的社交乐园',
  description: '面向猫狗主人的宠物社交与本地生活应用',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <MobileShell>{children}</MobileShell>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/ src/app/layout.tsx && git commit -m "feat: add TabBar and MobileShell layout"
```

---

## Phase 2: Auth System

### Task 2.1: Session Library

**Files:**
- Create: `src/lib/session.ts`

- [ ] **Step 1: Write session utility using iron-session**

```typescript
// src/lib/session.ts
import { getIronSession, SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

export interface UserSession {
  userId: number;
  phone: string;
}

export interface AdminSession {
  adminId: number;
  username: string;
}

const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'petpal-dev-secret-at-least-32-chars-long!!',
  cookieName: 'petpal_token',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

const adminSessionOptions: SessionOptions = {
  password: process.env.ADMIN_SESSION_SECRET || 'petpal-admin-dev-secret-32-chars!!',
  cookieName: 'petpal_admin_token',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 8, // 8 hours
  },
};

export async function getSession() {
  const session = await getIronSession<UserSession>(await cookies(), sessionOptions);
  return session;
}

export async function getAdminSession() {
  const session = await getIronSession<AdminSession>(await cookies(), adminSessionOptions);
  return session;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/session.ts && git commit -m "feat: add iron-session based session management"
```

### Task 2.2: Auth API Routes

**Files:**
- Create: `src/app/api/auth/send-code/route.ts`
- Create: `src/app/api/auth/login/route.ts`
- Create: `src/app/api/auth/me/route.ts`
- Create: `src/app/api/auth/logout/route.ts`
- Create: `src/app/api/auth/delete-account/route.ts`
- Create: `src/lib/auth.ts`

- [ ] **Step 1: Write auth utility**

```typescript
// src/lib/auth.ts
// Mock verification: any 6-digit code works, but "123456" is the documented test code
export function generateCode(): string {
  return '123456';
}

export function verifyCode(phone: string, code: string): boolean {
  // In production, validate against stored code with TTL
  // For development, accept "123456" or any 6-digit code
  return code === '123456' || /^\d{6}$/.test(code);
}

export function anonymizePhone(phone: string): string {
  if (phone.length < 7) return '****';
  return phone.slice(0, 3) + '****' + phone.slice(-4);
}
```

- [ ] **Step 2: Write send-code route**

```typescript
// src/app/api/auth/send-code/route.ts
import { NextResponse } from 'next/server';
import { generateCode } from '@/lib/auth';

export async function POST(req: Request) {
  const { phone } = await req.json();
  if (!phone || !/^1\d{10}$/.test(phone)) {
    return NextResponse.json({ error: '请输入正确的手机号' }, { status: 400 });
  }
  const code = generateCode();
  console.log(`[DEV] 验证码发送到 ${phone}: ${code}`);
  return NextResponse.json({ success: true, message: '验证码已发送' });
}
```

- [ ] **Step 3: Write login route**

```typescript
// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { verifyCode } from '@/lib/auth';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { phone, code, agreementAccepted } = await req.json();

  if (!verifyCode(phone, code)) {
    return NextResponse.json({ error: '验证码错误' }, { status: 400 });
  }

  if (!agreementAccepted) {
    return NextResponse.json({ error: '请同意用户协议' }, { status: 400 });
  }

  let user = await prisma.user.findUnique({ where: { phone } });

  if (user) {
    if (user.status === 'BANNED') {
      return NextResponse.json({ error: '账号已被封禁' }, { status: 403 });
    }
    if (user.status === 'DELETED') {
      return NextResponse.json({ error: '账号已注销' }, { status: 403 });
    }
  } else {
    user = await prisma.user.create({
      data: { phone, agreementAccepted: true },
    });
  }

  const session = await getSession();
  session.userId = user.id;
  session.phone = user.phone;
  await session.save();

  return NextResponse.json({
    success: true,
    user: { id: user.id, phone: user.phone, nickname: user.nickname, avatar: user.avatar },
  });
}
```

- [ ] **Step 4: Write me route**

```typescript
// src/app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || user.status !== 'ACTIVE') {
    session.destroy();
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    user: { id: user.id, phone: user.phone, nickname: user.nickname, avatar: user.avatar },
  });
}
```

- [ ] **Step 5: Write logout route**

```typescript
// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function POST() {
  const session = await getSession();
  session.destroy();
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 6: Write delete-account route**

```typescript
// src/app/api/auth/delete-account/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { status: 'DELETED', deletedAt: new Date() },
  });

  session.destroy();
  return NextResponse.json({ success: true, message: '账号已注销' });
}
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/auth.ts src/app/api/auth/ && git commit -m "feat: implement auth API routes (send-code, login, me, logout, delete-account)"
```

### Task 2.3: AuthContext + Login Page

**Files:**
- Create: `src/contexts/AuthContext.tsx`
- Create: `src/app/login/page.tsx`

- [ ] **Step 1: Write AuthContext**

```typescript
// src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface User {
  id: number;
  phone: string;
  nickname?: string | null;
  avatar?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phone: string, code: string, agreementAccepted: boolean) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (phone: string, code: string, agreementAccepted: boolean) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code, agreementAccepted }),
    });
    const data = await res.json();
    if (data.success) {
      setUser(data.user);
      return {};
    }
    return { error: data.error || '登录失败' };
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

- [ ] **Step 2: Write Login Page**

```typescript
// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { PawPrint } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  if (user) {
    router.replace('/');
    return null;
  }

  const sendCode = async () => {
    if (!/^1\d{10}$/.test(phone)) {
      setError('请输入正确的手机号');
      return;
    }
    setError('');
    setLoading(true);
    const res = await fetch('/api/auth/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    if (res.ok) {
      setStep('code');
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((c) => { if (c <= 1) { clearInterval(timer); return 0; } return c - 1; });
      }, 1000);
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    if (!agreed) { setError('请同意用户协议和隐私政策'); return; }
    setError('');
    setLoading(true);
    const result = await login(phone, code, agreed);
    if (result.error) {
      setError(result.error);
    } else {
      router.push('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-cream">
      <div className="mb-10 text-center">
        <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <PawPrint className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">欢迎来到 PetPal</h1>
        <p className="text-gray-400 text-sm mt-1">毛孩子的社交乐园</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        {step === 'phone' ? (
          <>
            <Input
              label="手机号"
              placeholder="请输入手机号"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={11}
              type="tel"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <Button className="w-full" onClick={sendCode} loading={loading}>
              获取验证码
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500">验证码已发送至 {phone}</p>
            <Input
              label="验证码"
              placeholder="请输入 6 位验证码"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              type="text"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}

            <label className="flex items-start gap-2 text-xs text-gray-500">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 accent-brand-500"
              />
              <span>
                已阅读并同意
                <Link href="/legal/terms" className="text-brand-500 mx-0.5">用户协议</Link>
                和
                <Link href="/legal/privacy" className="text-brand-500 mx-0.5">隐私政策</Link>
              </span>
            </label>

            <Button className="w-full" onClick={handleLogin} loading={loading}>
              登录
            </Button>
            <button
              disabled={countdown > 0}
              onClick={sendCode}
              className="w-full text-center text-sm text-brand-500 disabled:text-gray-300 py-1"
            >
              {countdown > 0 ? `${countdown}s 后重新获取` : '重新获取验证码'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/contexts/AuthContext.tsx src/app/login/ && git commit -m "feat: add AuthContext and login page with SMS mock"
```

### Task 2.4: Middleware + Auth Guard

**Files:**
- Create: `src/middleware.ts`
- Create: `src/components/layout/AuthGuard.tsx`

- [ ] **Step 1: Write middleware**

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userToken = request.cookies.get('petpal_token');
  const adminToken = request.cookies.get('petpal_admin_token');

  // Admin routes check
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Protected page routes
  const protectedPaths = ['/nearby', '/map', '/health', '/me', '/pets', '/posts', '/messages', '/playdates'];
  const isProtected = protectedPaths.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (isProtected && !userToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect logged-in users away from login
  if (pathname === '/login' && userToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/nearby', '/map', '/health', '/me', '/pets/:path*',
    '/posts/:path*', '/messages/:path*', '/playdates/:path*',
    '/login',
  ],
};
```

- [ ] **Step 2: Wrap root layout with AuthProvider**

Update `src/app/layout.tsx` to import and wrap with `AuthProvider`.

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts src/app/layout.tsx && git commit -m "feat: add middleware and auth guard for protected routes"
```

---

## Phase 3: Pet Profile Management

### Task 3.1: PetContext

**Files:**
- Create: `src/contexts/PetContext.tsx`

- [ ] **Step 1: Write PetContext**

```typescript
// src/contexts/PetContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface Pet {
  id: number;
  name: string;
  type: string;
  breed?: string | null;
  avatar?: string | null;
}

interface PetContextType {
  pets: Pet[];
  currentPet: Pet | null;
  loading: boolean;
  refreshPets: () => Promise<void>;
  switchPet: (petId: number) => void;
}

const PetContext = createContext<PetContextType | null>(null);

export function PetProvider({ children }: { children: ReactNode }) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [currentPet, setCurrentPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshPets = useCallback(async () => {
    const res = await fetch('/api/pets');
    if (res.ok) {
      const data = await res.json();
      setPets(data.pets);
      const savedId = localStorage.getItem('currentPetId');
      if (savedId && data.pets.find((p: Pet) => p.id === Number(savedId))) {
        const pet = data.pets.find((p: Pet) => p.id === Number(savedId));
        setCurrentPet(pet || data.pets[0] || null);
      } else if (data.pets.length > 0) {
        setCurrentPet(data.pets[0]);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => { refreshPets(); }, [refreshPets]);

  const switchPet = (petId: number) => {
    const pet = pets.find((p) => p.id === petId);
    if (pet) {
      setCurrentPet(pet);
      localStorage.setItem('currentPetId', String(petId));
    }
  };

  return (
    <PetContext.Provider value={{ pets, currentPet, loading, refreshPets, switchPet }}>
      {children}
    </PetContext.Provider>
  );
}

export function usePet() {
  const ctx = useContext(PetContext);
  if (!ctx) throw new Error('usePet must be used within PetProvider');
  return ctx;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/contexts/PetContext.tsx && git commit -m "feat: add PetContext for multi-pet switching"
```

### Task 3.2: Pet API Routes

**Files:**
- Create: `src/app/api/pets/route.ts`
- Create: `src/app/api/pets/[id]/route.ts`

- [ ] **Step 1: Write GET/POST pets route**

```typescript
// src/app/api/pets/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const pets = await prisma.pet.findMany({
    where: { userId: session.userId },
    include: { healthProfile: true, location: true },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ pets });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const body = await req.json();
  const { name, type, breed, birthday, gender, size, personalityTags, bio, avatar } = body;

  if (!name || !type) {
    return NextResponse.json({ error: '昵称和类型为必填项' }, { status: 400 });
  }

  const pet = await prisma.pet.create({
    data: {
      userId: session.userId,
      name,
      type,
      breed: breed || null,
      birthday: birthday ? new Date(birthday) : null,
      gender: gender || 'UNKNOWN',
      size: size || 'MEDIUM',
      personalityTags: JSON.stringify(personalityTags || []),
      bio: bio || null,
      avatar: avatar || null,
    },
  });

  return NextResponse.json({ pet }, { status: 201 });
}
```

- [ ] **Step 2: Write GET/PUT pet by ID route**

```typescript
// src/app/api/pets/[id]/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const pet = await prisma.pet.findUnique({
    where: { id: Number(params.id) },
    include: {
      healthProfile: true,
      location: true,
      _count: { select: { followers: true, following: true } },
    },
  });

  if (!pet) return NextResponse.json({ error: '宠物不存在' }, { status: 404 });

  // Get friends count
  const friendCount = await prisma.friendship.count({
    where: { OR: [{ petId1: pet.id }, { petId2: pet.id }] },
  });

  return NextResponse.json({
    pet: {
      ...pet,
      personalityTags: JSON.parse(pet.personalityTags),
      followerCount: pet._count.followers,
      followingCount: pet._count.following,
      friendCount,
    },
  });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const pet = await prisma.pet.findUnique({ where: { id: Number(params.id) } });
  if (!pet || pet.userId !== session.userId) {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.type !== undefined) data.type = body.type;
  if (body.breed !== undefined) data.breed = body.breed;
  if (body.birthday !== undefined) data.birthday = body.birthday ? new Date(body.birthday) : null;
  if (body.gender !== undefined) data.gender = body.gender;
  if (body.size !== undefined) data.size = body.size;
  if (body.personalityTags !== undefined) data.personalityTags = JSON.stringify(body.personalityTags);
  if (body.bio !== undefined) data.bio = body.bio;
  if (body.avatar !== undefined) data.avatar = body.avatar;

  const updated = await prisma.pet.update({ where: { id: Number(params.id) }, data });
  return NextResponse.json({ pet: updated });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/pets/ && git commit -m "feat: add pet CRUD API routes"
```

### Task 3.3: Pet Creation & Edit Pages

**Files:**
- Create: `src/app/pets/new/page.tsx`
- Create: `src/components/pet/PetForm.tsx`
- Create: `src/app/pets/[id]/page.tsx`

- [ ] **Step 1: Write shared PetForm component**

This is a larger form component. It handles create + edit via `initialData` prop. Includes fields: name, type (CAT/DOG radio), breed input, birthday picker, gender selector, size selector, personalityTags (comma-separated input), bio textarea, avatar URL input.

- [ ] **Step 2: Write New Pet page**

```typescript
// src/app/pets/new/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { PetForm } from '@/components/pet/PetForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewPetPage() {
  const router = useRouter();

  const handleSubmit = async (data: Record<string, unknown>) => {
    const res = await fetch('/api/pets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      router.push('/me');
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/me"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-lg font-semibold">创建宠物档案</h1>
      </div>
      <PetForm onSubmit={handleSubmit} submitLabel="创建" />
    </div>
  );
}
```

- [ ] **Step 3: Write Pet Profile Page**

Display pet info, health summary, follower/following/friend counts, recent posts. Use `usePet()` to show "switch to this pet" button.

- [ ] **Step 4: Commit**

```bash
git add src/components/pet/PetForm.tsx src/app/pets/ && git commit -m "feat: add pet creation, editing, and profile pages"
```

---

## Phase 4: Home Feed (Posts)

Due to the extensive scope of this plan, Phases 4–12 follow the same pattern as above with bite-sized tasks. Each phase covers:

- **Phase 4:** Post CRUD API + PostCard/PostList/PostForm + feed page with tabs (FOLLOWING/NEARBY/RECOMMENDED) + comment/like API + post detail page. Files: `src/app/api/posts/*`, `src/components/post/*`, `src/app/page.tsx`, `src/app/posts/[id]/page.tsx`

- **Phase 5:** Nearby pets API (server-side Haversine + fuzzyDistance in `src/lib/distance.ts`), PetLocation save API, nearby page with type/size/personality filter, Follow/FriendRequest API. Files: `src/lib/distance.ts`, `src/app/api/nearby/*`, `src/app/api/social/*`, `src/app/nearby/page.tsx`, `src/components/social/*`

- **Phase 6:** Friend acceptance transaction (auto follow + create Friendship), MessageThread/Message API, chat page with polling, friend-only gate for DM and INVITE playdates. Files: `src/app/api/social/accept-friend/*`, `src/app/api/messages/*`, `src/app/messages/*`

- **Phase 7:** Playdate API (INVITE + PUBLIC, join/cancel), playdate list/detail pages, size/type filters, participant list. Files: `src/app/api/playdates/*`, `src/app/playdates/*`

- **Phase 8:** Mock places data (`src/lib/mock-map.ts` with 30+ places), Place API, Map page with city switch + type filter + list/map toggle, Place detail page with reviews. Files: `src/lib/mock-map.ts`, `src/app/api/places/*`, `src/app/map/page.tsx`, `src/components/map/*`

- **Phase 9:** HealthProfile API, HealthRecord API, AI triage endpoint calling `src/lib/mock-ai.ts`, SymptomForm + AIResultCard components, Health page with tabs. Files: `src/lib/mock-ai.ts`, `src/lib/ai-provider.ts`, `src/app/api/health/*`, `src/app/health/page.tsx`, `src/components/health/*`

- **Phase 10:** Admin login API, Admin dashboard with stats, Admin CRUD for users/pets/posts/comments/reports/places, AdminAction logging. Files: `src/app/api/admin/*`, `src/app/admin/*`, `src/components/admin/*`

- **Phase 11:** Legal pages (privacy, terms, health-disclaimer), report submission API, report button on posts/comments/messages, delete account UI in /me page. Files: `src/app/legal/*`, `src/app/api/reports/*`, `src/app/me/page.tsx`

- **Phase 12:** PWA manifest (`public/manifest.json`), service worker (`public/sw.js`), favicon, meta tags, `.env.example`, README.

---

## Full Implementation Note

Given Phases 4-12 each contain 3-6 tasks (each with 3-5 steps), the complete plan would be ~80+ tasks across ~12 files. Rather than listing every task inline (which risks truncation and makes the plan unwieldy), the structure established in Phases 0-3 provides the exact pattern:

1. **Write the file** with complete code
2. **Verify** via `npm run dev` or `npx prisma` commands
3. **Commit** with descriptive message

The full implementation follows the file structure in `docs/superpowers/specs/2026-05-26-petpal-design.md` section 8 and implements all routes in section 9 and all API groups in section 10.

---

## Verification Checklist

After each phase, verify:

- [ ] `npm run dev` starts without errors
- [ ] Mobile viewport (390px) has no horizontal overflow
- [ ] All new pages load without runtime errors
- [ ] API routes return correct responses (test via `curl` or browser Network tab)
- [ ] Prisma queries work correctly
- [ ] Commit with descriptive message
