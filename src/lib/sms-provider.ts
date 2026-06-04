// import { createHmac } from 'crypto';

export interface SmsProvider {
  sendCode(phone: string, code: string): Promise<{ success: boolean; error?: string }>;
}

// ---------------------------------------------------------------------------
// Mock provider – logs to console, always succeeds (dev)
// ---------------------------------------------------------------------------

class MockSmsProvider implements SmsProvider {
  async sendCode(phone: string, code: string) {
    console.log(`[DEV SMS] To: ${phone}, Code: ${code}`);
    return { success: true };
  }
}

// ---------------------------------------------------------------------------
// Alibaba Cloud SMS production provider
// HMAC-SHA1 signing per https://help.aliyun.com/document_detail/101346.html
// ---------------------------------------------------------------------------

const ALIYUN_SMS_ENDPOINT = 'https://dysmsapi.aliyuncs.com';
const ALIYUN_SMS_API_VERSION = '2017-05-25';

function encode(str: string): string {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
}

async function aliyunHmacSha1(key: string, data: string): Promise<string> {
  // Use Web Crypto API to avoid relying on Node-only crypto in edge runtimes
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(data);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

class AliyunSmsProvider implements SmsProvider {
  async sendCode(phone: string, code: string) {
    const accessKey = process.env.SMS_ACCESS_KEY;
    const secret = process.env.SMS_SECRET;
    const signName = process.env.SMS_SIGN_NAME || 'PetPal';
    const templateId = process.env.SMS_TEMPLATE_ID;

    if (!accessKey || !secret) {
      return {
        success: false,
        error: 'SMS_ACCESS_KEY and SMS_SECRET required for production SMS',
      };
    }
    if (!templateId) {
      return {
        success: false,
        error: 'SMS_TEMPLATE_ID required for production SMS',
      };
    }

    // Build sorted params for signature
    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    const nonce = Math.random().toString(36).substring(2, 15);

    const params: Record<string, string> = {
      AccessKeyId: accessKey,
      Action: 'SendSms',
      Format: 'JSON',
      PhoneNumbers: phone,
      SignatureMethod: 'HMAC-SHA1',
      SignatureNonce: nonce,
      SignatureVersion: '1.0',
      SignName: signName,
      TemplateCode: templateId,
      TemplateParam: JSON.stringify({ code }),
      Timestamp: timestamp,
      Version: ALIYUN_SMS_API_VERSION,
    };

    // Sort keys alphabetically and build canonical query string
    const sortedKeys = Object.keys(params).sort();
    const canonicalQuery = sortedKeys
      .map((k) => `${encode(k)}=${encode(params[k])}`)
      .join('&');

    const stringToSign = `POST&${encode('/')}&${encode(canonicalQuery)}`;

    // Sign with HMAC-SHA1 using secret + "&"
    const signature = await aliyunHmacSha1(`${secret}&`, stringToSign);

    // Append signature to params
    params.Signature = signature;

    // Build final query string
    const finalSortedKeys = Object.keys(params).sort();
    const finalQuery = finalSortedKeys
      .map((k) => `${encode(k)}=${encode(params[k])}`)
      .join('&');

    try {
      const response = await fetch(`${ALIYUN_SMS_ENDPOINT}/?${finalQuery}`, {
        method: 'POST',
      });

      if (!response.ok) {
        console.error(
          `[SMS] Alibaba Cloud SMS API HTTP ${response.status}`,
        );
        return { success: false, error: `短信服务返回HTTP错误: ${response.status}` };
      }

      const result = await response.json();

      if (result.Code !== 'OK') {
        console.error(
          `[SMS] Alibaba Cloud SMS API error: ${result.Code} - ${result.Message}`,
        );
        return {
          success: false,
          error: result.Message || '短信发送失败',
        };
      }

      console.log(
        `[SMS] Sent code to ${phone}, BizId: ${result.BizId}`,
      );
      return { success: true };
    } catch (error) {
      console.error(
        '[SMS] Alibaba Cloud SMS request failed:',
        error instanceof Error ? error.message : error,
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : '短信发送请求失败',
      };
    }
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function getSmsProvider(): SmsProvider {
  if (process.env.SMS_PROVIDER === 'aliyun') {
    return new AliyunSmsProvider();
  }
  return new MockSmsProvider();
}
