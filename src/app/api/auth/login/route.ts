import { NextResponse } from 'next/server';
import { verifyCode } from '@/lib/auth';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { phone, code, agreementAccepted } = await req.json();

  if (!phone || !code) {
    return NextResponse.json({ error: '请输入手机号和验证码' }, { status: 400 });
  }

  if (!(await verifyCode(phone, code))) {
    return NextResponse.json({ error: '验证码错误或已过期' }, { status: 400 });
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
