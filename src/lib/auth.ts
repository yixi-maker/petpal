import { checkRateLimit } from './rate-limit';

// ---------------------------------------------------------------------------
// Verification code store with TTL
// ---------------------------------------------------------------------------

interface CodeRecord {
  code: string;
  expiresAt: number;
}

const codeStore = new Map<string, CodeRecord>();

/** 5-minute TTL for verification codes */
const CODE_TTL_MS = 5 * 60 * 1000;

/** Clean expired entries periodically */
function pruneCodes(): void {
  const now = Date.now();
  for (const [key, record] of codeStore) {
    if (now > record.expiresAt) {
      codeStore.delete(key);
    }
  }
}

const DEV_CODE = '123456';

/**
 * Generate a 6-digit random verification code.
 * In dev mode (when SMS_PROVIDER is not "production"), always returns 123456.
 */
export function generateCode(): string {
  const isDev = process.env.SMS_PROVIDER !== 'production';
  if (isDev) return DEV_CODE;

  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Store a verification code for a phone number with 5-minute TTL.
 */
export function storeCode(phone: string, code: string): void {
  pruneCodes();
  codeStore.set(phone, {
    code,
    expiresAt: Date.now() + CODE_TTL_MS,
  });
}

/**
 * Verify a code against the stored code for a phone number.
 * In dev mode, also accepts 123456 for convenience.
 */
export function verifyCode(phone: string, code: string): boolean {
  pruneCodes();

  // Dev mode: 123456 always works
  const isDev = process.env.SMS_PROVIDER !== 'production';
  if (isDev && code === DEV_CODE) return true;

  const record = codeStore.get(phone);
  if (!record) return false;

  if (Date.now() > record.expiresAt) {
    codeStore.delete(phone);
    return false;
  }

  return record.code === code;
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
export function checkCodeRateLimit(phone: string): boolean {
  return checkRateLimit(`code:phone:${phone}`, 1, 60_000);
}

/**
 * Check whether an IP is allowed to request codes.
 *   - 5 requests per hour per IP
 *
 * Returns true if allowed, false if rate-limited.
 */
export function checkIpRateLimit(ip: string): boolean {
  return checkRateLimit(`code:ip:${ip}`, 5, 3600_000);
}

/**
 * Combined rate-limit check for a send-code request.
 * In dev mode, limits are checked but never enforced (always returns true).
 *
 * @returns An object with { allowed, reason? }. When allowed is false, reason explains why.
 */
export function checkSendCodeRateLimit(
  phone: string,
  ip: string
): { allowed: boolean; reason?: string } {
  const isDev = process.env.SMS_PROVIDER !== 'production';

  const phoneOk = checkCodeRateLimit(phone);
  const ipOk = checkIpRateLimit(ip);

  if (isDev) {
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
