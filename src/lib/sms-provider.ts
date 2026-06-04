export interface SmsProvider {
  sendCode(phone: string, code: string): Promise<{ success: boolean; error?: string }>;
}

/**
 * Dev provider: logs to console, always succeeds.
 * Activated when SMS_PROVIDER is unset or set to "mock".
 */
class MockSmsProvider implements SmsProvider {
  async sendCode(phone: string, code: string) {
    console.log(`[DEV SMS] To: ${phone}, Code: ${code}`);
    return { success: true };
  }
}

/**
 * Production provider: placeholder for real SMS service integration.
 *
 * TODO: Integrate with Alibaba Cloud SMS / Tencent Cloud SMS.
 * Expected env vars:
 *   SMS_ACCESS_KEY  – cloud provider access key
 *   SMS_SECRET      – cloud provider secret
 *   SMS_SIGN_NAME   – SMS signature name (e.g. "PetPal")
 *   SMS_TEMPLATE_ID – template code for verification SMS
 */
class RealSmsProvider implements SmsProvider {
  async sendCode(phone: string, code: string) {
    const accessKey = process.env.SMS_ACCESS_KEY;
    if (!accessKey) {
      return { success: false, error: 'SMS_ACCESS_KEY not configured' };
    }
    // TODO: Call SMS API (Alibaba Cloud / Tencent Cloud) here
    console.log(`[PROD SMS] Would send code ${code} to ${phone} via cloud SMS API`);
    return { success: true };
  }
}

export function getSmsProvider(): SmsProvider {
  if (process.env.SMS_PROVIDER === 'production') {
    return new RealSmsProvider();
  }
  return new MockSmsProvider();
}
