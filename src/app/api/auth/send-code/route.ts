import { NextResponse } from 'next/server';
import { generateCode, storeCode, checkSendCodeRateLimit } from '@/lib/auth';
import { getSmsProvider } from '@/lib/sms-provider';

export async function POST(req: Request) {
  const { phone } = await req.json();

  if (!phone || !/^1\d{10}$/.test(phone)) {
    return NextResponse.json({ error: '请输入正确的手机号' }, { status: 400 });
  }

  // Extract client IP for rate limiting
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || '127.0.0.1';

  // Rate limiting (dev: logged but not enforced)
  const rateCheck = checkSendCodeRateLimit(phone, ip);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: rateCheck.reason || '请求过于频繁，请稍后再试' },
      { status: 429 }
    );
  }

  // Generate and store verification code
  const code = generateCode();
  storeCode(phone, code);

  // Send via SMS provider
  const sms = getSmsProvider();
  const result = await sms.sendCode(phone, code);

  if (!result.success) {
    console.error(`[SMS] Failed to send code to ${phone}: ${result.error}`);
    return NextResponse.json(
      { error: '验证码发送失败，请稍后再试' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, message: '验证码已发送' });
}
