import { getIronSession, SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

// ============================================================
// SESSION SECURITY
// In production, both SESSION_SECRET and ADMIN_SESSION_SECRET
// MUST be set to unique, high-entropy values (min 32 chars).
// The dev defaults below are intentionally weak and will cause
// a hard error at startup if used in production.
//
// Generate secure secrets:
//   openssl rand -base64 64
// ============================================================

const DEV_SESSION_SECRET = 'petpal-dev-secret-at-least-32-chars-long!!';
const DEV_ADMIN_SESSION_SECRET = 'petpal-admin-dev-secret-32-chars!!';

if (process.env.NODE_ENV === 'production') {
  if (
    !process.env.SESSION_SECRET ||
    process.env.SESSION_SECRET === DEV_SESSION_SECRET
  ) {
    throw new Error(
      '[SECURITY] Production requires a unique SESSION_SECRET env var. ' +
      'Do NOT use the dev default. Generate one with: openssl rand -base64 64'
    );
  }
  if (
    !process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET === DEV_ADMIN_SESSION_SECRET
  ) {
    throw new Error(
      '[SECURITY] Production requires a unique ADMIN_SESSION_SECRET env var. ' +
      'Do NOT use the dev default. Generate one with: openssl rand -base64 64'
    );
  }
}

export interface UserSession {
  userId: number;
  phone: string;
}

export interface AdminSession {
  adminId: number;
  username: string;
}

const sessionOptions: SessionOptions = {
  cookieName: 'petpal_token',
  password: process.env.SESSION_SECRET || DEV_SESSION_SECRET,
  ttl: 60 * 60 * 24 * 7, // 7 days
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
  },
};

const adminSessionOptions: SessionOptions = {
  cookieName: 'petpal_admin_token',
  password: process.env.ADMIN_SESSION_SECRET || DEV_ADMIN_SESSION_SECRET,
  ttl: 60 * 60 * 8, // 8 hours
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
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
