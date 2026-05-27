import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userToken = request.cookies.get('petpal_token');
  const adminToken = request.cookies.get('petpal_admin_token');

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  const protectedPaths = ['/nearby', '/map', '/health', '/me', '/pets', '/posts', '/messages', '/playdates'];
  const isProtected = protectedPaths.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (isProtected && !userToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/admin/:path*',
    '/nearby',
    '/map',
    '/health',
    '/me',
    '/pets/:path*',
    '/posts/:path*',
    '/messages/:path*',
    '/playdates/:path*',
  ],
};
