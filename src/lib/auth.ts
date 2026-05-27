// Mock verification: "123456" is the documented test code
export function generateCode(): string {
  return '123456';
}

export function verifyCode(phone: string, code: string): boolean {
  return code === '123456' || /^\d{6}$/.test(code);
}

export function anonymizePhone(phone: string): string {
  if (phone.length < 7) return '****';
  return phone.slice(0, 3) + '****' + phone.slice(-4);
}
