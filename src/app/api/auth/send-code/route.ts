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
