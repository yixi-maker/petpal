// STAGING STATUS: RealModerationProvider is fail-closed.
// If MODERATION_API_KEY is missing, ALL content is rejected (text and images).
// To use in staging/production: set NODE_ENV=production and MODERATION_API_KEY.
// The text/image API call methods contain placeholder implementations;
// replace with actual Alibaba Cloud Green SDK calls before production use.
// Note: Not yet tested against a real moderation account. Test with valid credentials.

export interface ModerationProvider {
  /**
   * Check text content for inappropriate material.
   * Returns { approved: false, reason } when the content is rejected.
   */
  checkText(text: string): Promise<{ approved: boolean; reason?: string }>;

  /**
   * Check an image (by URL) for inappropriate material.
   */
  checkImage(url: string): Promise<{ approved: boolean; reason?: string }>;
}

// ---------------------------------------------------------------------------
// Mock provider – simple keyword blocklist for dev
// ---------------------------------------------------------------------------

class MockModerationProvider implements ModerationProvider {
  private static blockedKeywords = ['违禁', '诈骗', '赌博'];

  async checkText(text: string) {
    const hit = MockModerationProvider.blockedKeywords.find((kw) =>
      text.includes(kw),
    );
    if (hit) {
      return { approved: false, reason: `包含敏感词: ${hit}` };
    }
    return { approved: true };
  }

  async checkImage(url: string) {
    // Mock always approves images in dev
    console.log(`[DEV Moderation] Image check skipped (mock): ${url}`);
    return { approved: true };
  }
}

// ---------------------------------------------------------------------------
// Real moderation provider – FAIL-CLOSED in production
//
// In production, if the moderation API is not configured or unreachable,
// ALL content is REJECTED. This is safer than quietly approving everything.
//
// To configure: set MODERATION_API_KEY (and optionally MODERATION_ENDPOINT).
// Supported services: Alibaba Cloud Content Moderation, AWS Rekognition, etc.
// ---------------------------------------------------------------------------

class RealModerationProvider implements ModerationProvider {
  private apiKey: string;
  private endpoint: string;

  constructor() {
    this.apiKey = process.env.MODERATION_API_KEY || '';
    this.endpoint =
      process.env.MODERATION_ENDPOINT ||
      'https://green.cn-shanghai.aliyuncs.com/green/text/scan';

    if (!this.apiKey) {
      console.error(
        '[MODERATION] No MODERATION_API_KEY set. ALL content will be REJECTED in production.',
      );
    }
  }

  async checkText(
    text: string,
  ): Promise<{ approved: boolean; reason?: string }> {
    // FAIL-CLOSED: If no API key, reject everything
    if (!this.apiKey) {
      return {
        approved: false,
        reason: '内容审核服务未配置，暂不可发布',
      };
    }

    // Input validation: reject empty or extremely short text
    if (!text || text.trim().length === 0) {
      return { approved: false, reason: '内容不能为空' };
    }

    // Text length guard — split into chunks if needed, or reject if too long
    const MAX_TEXT_LENGTH = 10000;
    if (text.length > MAX_TEXT_LENGTH) {
      return {
        approved: false,
        reason: `内容过长（超过${MAX_TEXT_LENGTH}字符），请分段发送`,
      };
    }

    try {
      // Attempt real API call
      const result = await this.callTextModerationAPI(text);
      return result;
    } catch (error) {
      // FAIL-CLOSED on error: reject content when moderation is unavailable
      console.error(
        '[MODERATION] Text moderation API call failed:',
        error instanceof Error ? error.message : error,
      );
      return {
        approved: false,
        reason: '内容审核服务异常，请稍后重试',
      };
    }
  }

  async checkImage(
    url: string,
  ): Promise<{ approved: boolean; reason?: string }> {
    // FAIL-CLOSED: If no API key, reject everything
    if (!this.apiKey) {
      return {
        approved: false,
        reason: '图片审核服务未配置，暂不可上传',
      };
    }

    // Validate URL format
    if (!url || (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/'))) {
      return { approved: false, reason: '图片地址格式无效' };
    }

    try {
      const result = await this.callImageModerationAPI(url);
      return result;
    } catch (error) {
      // FAIL-CLOSED on error
      console.error(
        '[MODERATION] Image moderation API call failed:',
        error instanceof Error ? error.message : error,
      );
      return {
        approved: false,
        reason: '图片审核服务异常',
      };
    }
  }

  /**
   * Call Alibaba Cloud Content Moderation (Green) API for text scanning.
   *
   * In production, replace with actual SDK call:
   *   import Green from '@alicloud/green-sdk';
   *   const client = new Green({ accessKeyId, accessKeySecret, region });
   *   const result = await client.textScan({ tasks: [{ content: text }] });
   */
  /* eslint-disable @typescript-eslint/no-unused-vars */
  private async callTextModerationAPI(
    _text: string,
  ): Promise<{ approved: boolean; reason?: string }> {
    // TODO: Implement actual Alibaba Cloud / AWS Rekognition API call.
    //
    // For Alibaba Cloud Content Moderation:
    // 1. Sign the request with HMAC-SHA1 (similar to SMS provider)
    // 2. POST to https://green.cn-shanghai.aliyuncs.com/green/text/scan
    // 3. Parse response.suggestion: "pass" = approved, "block"/"review" = rejected
    //
    // Example response handling:
    //   const data = response.data[0];
    //   if (data.code !== 200) return { approved: false, reason: '审核服务异常' };
    //   if (data.results[0].suggestion === 'block') {
    //     return { approved: false, reason: `内容违规：${data.results[0].label}` };
    //   }
    //   return { approved: true };
    //
    // For now, this placeholder rejects all content in production to be safe.
    // Replace with the real implementation when the API credentials are set up.
    return {
      approved: false,
      reason: '内容审核API待实现，请联系管理员配置',
    };
  }

  /**
   * Call Alibaba Cloud Content Moderation (Green) API for image scanning.
   *
   * In production, replace with actual SDK call:
   *   const result = await client.imageScan({
   *     scenes: ['porn', 'terrorism', 'ad', 'live'],
   *     tasks: [{ url: imageUrl }],
   *   });
   */
  private async callImageModerationAPI(
    _url: string,
  ): Promise<{ approved: boolean; reason?: string }> {
    // TODO: Implement actual image moderation API call.
    //
    // For now, this placeholder rejects all images in production to be safe.
    // Replace with the real implementation when the API credentials are set up.
    return {
      approved: false,
      reason: '图片审核API待实现，请联系管理员配置',
    };
  }
}

// ---------------------------------------------------------------------------
// Factory
//
// In production (NODE_ENV=production), ALWAYS returns RealModerationProvider.
// In development, returns MockModerationProvider.
// ---------------------------------------------------------------------------

let cachedProvider: ModerationProvider | null = null;

export function getModerationProvider(): ModerationProvider {
  if (cachedProvider) return cachedProvider;

  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    cachedProvider = new RealModerationProvider();
  } else {
    cachedProvider = new MockModerationProvider();
  }

  return cachedProvider;
}
