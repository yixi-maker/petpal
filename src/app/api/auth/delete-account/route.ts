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
