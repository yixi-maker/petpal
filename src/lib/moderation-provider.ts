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
      text.includes(kw)
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
// Real provider – placeholder for cloud moderation API
// ---------------------------------------------------------------------------

class RealModerationProvider implements ModerationProvider {
  async checkText(text: string) {
    const apiKey = process.env.MODERATION_API_KEY;
    if (!apiKey) {
      console.warn('[Moderation] MODERATION_API_KEY not set, skipping check');
      return { approved: true };
    }

    // TODO: Integrate with Alibaba Cloud Content Moderation / Tencent Cloud
    // Tianyu / AWS Rekognition / Google Vision SafeSearch.
    // Example pseudo-flow:
    //   1. POST text to moderation API endpoint
    //   2. Parse the response for flagged categories
    //   3. Return { approved: false, reason: "检测到违规内容" } when flagged
    console.log(`[PROD Moderation] Would check text (${text.length} chars)`);
    return { approved: true };
  }

  async checkImage(url: string) {
    const apiKey = process.env.MODERATION_API_KEY;
    if (!apiKey) {
      console.warn('[Moderation] MODERATION_API_KEY not set, skipping check');
      return { approved: true };
    }

    console.log(`[PROD Moderation] Would check image at ${url}`);
    return { approved: true };
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

let cachedProvider: ModerationProvider | null = null;

export function getModerationProvider(): ModerationProvider {
  if (cachedProvider) return cachedProvider;

  if (process.env.MODERATION_PROVIDER === 'production') {
    cachedProvider = new RealModerationProvider();
  } else {
    cachedProvider = new MockModerationProvider();
  }

  return cachedProvider;
}
