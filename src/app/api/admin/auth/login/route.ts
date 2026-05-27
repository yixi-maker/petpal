import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAdminSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: '请输入用户名和密码' }, { status: 400 });
    }

    // Check if any admin exists; if not, create default admin
    const adminCount = await prisma.adminUser.count();
    if (adminCount === 0) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      await prisma.adminUser.create({
        data: { username: 'admin', passwordHash },
      });
    }

    const admin = await prisma.adminUser.findUnique({
      where: { username },
    });

    if (!admin) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
    }

    const session = await getAdminSession();
    session.adminId = admin.id;
    session.username = admin.username;
    await session.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: '登录失败，请稍后重试' }, { status: 500 });
  }
}
