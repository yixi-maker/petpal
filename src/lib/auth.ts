import { checkRateLimit } from './rate-limit';
import { getCodeStore } from './code-store';

// ---------------------------------------------------------------------------
// Verification code store — backed by swappable CodeStore
// ---------------------------------------------------------------------------

const codeStore = getCodeStore();

/** 5-minute TTL for verification codes */
const CODE_TTL_SECONDS = 5 * 60;

const DEV_CODE = '123456';

function isMockSmsMode(): boolean {
  return (process.env.SMS_PROVIDER || 'mock') === 'mock';
}

/**
 * Generate a 6-digit random verification code.
 * In mock SMS mode, always returns 123456.
 */
export function generateCode(): string {
  if (isMockSmsMode()) return DEV_CODE;

  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Store a verification code for a phone number with 5-minute TTL.
 */
export async function storeCode(phone: string, code: string): Promise<void> {
  await codeStore.set(phone, code, CODE_TTL_SECONDS);
}

/**
 * Verify a code against the stored code for a phone number.
 * In mock SMS mode, also accepts 123456 for convenience.
 */
export async function verifyCode(phone: string, code: string): Promise<boolean> {
  if (isMockSmsMode() && code === DEV_CODE) return true;

  const stored = await codeStore.get(phone);
  if (!stored) return false;

  return stored === code;
}

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------

/**
 * Check whether a phone number is allowed to request a new code.
 *   - 1 code per 60 seconds per phone
 *
 * Returns true if allowed, false if rate-limited.
 */
export async function checkCodeRateLimit(phone: string): Promise<boolean> {
  return checkRateLimit(`code:phone:${phone}`, 1, 60_000);
}

/**
 * Check whether an IP is allowed to request codes.
 *   - 5 requests per hour per IP
 *
 * Returns true if allowed, false if rate-limited.
 */
export async function checkIpRateLimit(ip: string): Promise<boolean> {
  return checkRateLimit(`code:ip:${ip}`, 5, 3600_000);
}

/**
 * Combined rate-limit check for a send-code request.
 * In mock SMS mode, limits are checked but never enforced (always returns true).
 *
 * @returns An object with { allowed, reason? }. When allowed is false, reason explains why.
 */
export async function checkSendCodeRateLimit(
  phone: string,
  ip: string
): Promise<{ allowed: boolean; reason?: string }> {
  const phoneOk = await checkCodeRateLimit(phone);
  const ipOk = await checkIpRateLimit(ip);

  if (isMockSmsMode()) {
    if (!phoneOk) console.log(`[DEV] Rate limit would block phone: ${phone}`);
    if (!ipOk) console.log(`[DEV] Rate limit would block IP: ${ip}`);
    return { allowed: true };
  }

  if (!phoneOk) {
    return { allowed: false, reason: '验证码发送过于频繁，请60秒后再试' };
  }
  if (!ipOk) {
    return { allowed: false, reason: '请求过多，请稍后再试' };
  }

  return { allowed: true };
}

// ---------------------------------------------------------------------------
// Phone helpers
// ---------------------------------------------------------------------------

export function anonymizePhone(phone: string): string {
  if (phone.length < 7) return '****';
  return phone.slice(0, 3) + '****' + phone.slice(-4);
}
