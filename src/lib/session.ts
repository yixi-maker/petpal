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
  cookieName: 'petpal_token',
  password: process.env.SESSION_SECRET || 'petpal-dev-secret-at-least-32-chars-long!!',
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
  password: process.env.ADMIN_SESSION_SECRET || 'petpal-admin-dev-secret-32-chars!!',
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
