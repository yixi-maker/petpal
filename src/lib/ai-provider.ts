// STAGING STATUS: OpenAI and Zhipu AI providers are fully implemented.
// The implementation includes 15s timeout, JSON response parsing with markdown
// fallback, drug name sanitization, and forced disclaimer injection.
// To use: set AI_PROVIDER=openai or AI_PROVIDER=zhipu and configure AI_API_KEY.
// If AI_API_KEY is missing, falls back to mock with a console.warn.
// Note: Not yet tested against real API keys. Test with valid credentials.

import { AI_SYSTEM_PROMPT } from './ai-system-prompt';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AITriageRequest {
  pet: {
    type: 'CAT' | 'DOG';
    breed?: string;
    age?: number;
    gender?: string;
    weight?: number;
    isNeutered?: boolean;
  };
  symptoms: string;
  duration: string;
  appetite: string;
  drinking: string;
  energy: string;
  bowelMovement?: string;
  isVomiting?: boolean;
  hasInjury?: boolean;
  images?: string[];
}

export interface AITriageResult {
  id: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  possibleConditions: string[];
  homeCareAdvice: string[];
  shouldSeeVet: boolean;
  urgencyNote?: string;
  precautions: string[];
  disclaimer: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DISCLAIMER =
  'AI 健康助手结果仅供健康咨询、初步分诊和风险判断参考，不能替代执业兽医的专业诊断。\n如您的宠物出现以下情况，请立即前往宠物医院就诊：呼吸困难、严重外伤、持续呕吐/腹泻、意识模糊、中毒可能、超过 24 小时拒食。';

const MAX_SYMPTOMS_LENGTH = 2000;

const VALID_RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH'] as const;

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

function validateTriageRequest(req: AITriageRequest): string | null {
  if (!req.symptoms || !req.symptoms.trim()) {
    return '请描述宠物症状';
  }
  if (req.symptoms.length > MAX_SYMPTOMS_LENGTH) {
    return `症状描述不能超过${MAX_SYMPTOMS_LENGTH}字`;
  }
  if (!req.pet || !req.pet.type) {
    return '请选择宠物类型';
  }
  if (!['CAT', 'DOG'].includes(req.pet.type)) {
    return '宠物类型仅支持 CAT 或 DOG';
  }
  return null;
}

// ---------------------------------------------------------------------------
// Provider selection
// ---------------------------------------------------------------------------

type AIProviderType = 'mock' | 'openai' | 'zhipu';

function getAIProviderType(): AIProviderType {
  const val = process.env.AI_PROVIDER;
  if (val === 'openai' || val === 'zhipu') return val;
  return 'mock';
}

// ---------------------------------------------------------------------------
// Build user message for AI API call
// ---------------------------------------------------------------------------

function formatPetInfo(pet: AITriageRequest['pet']): string {
  const parts: string[] = [];
  parts.push(`种类：${pet.type === 'CAT' ? '猫' : '狗'}`);
  if (pet.breed) parts.push(`品种：${pet.breed}`);
  if (pet.age !== undefined && pet.age !== null) {
    const ageLabel = pet.age < 1 ? `${Math.round(pet.age * 12)}个月` : `${pet.age}岁`;
    parts.push(`年龄：${ageLabel}`);
  }
  if (pet.gender) parts.push(`性别：${pet.gender}`);
  if (pet.weight !== undefined && pet.weight !== null) {
    parts.push(`体重：${pet.weight}kg`);
  }
  if (pet.isNeutered !== undefined) {
    parts.push(`绝育：${pet.isNeutered ? '是' : '否'}`);
  }
  return parts.join('；');
}

function buildUserMessage(request: AITriageRequest): string {
  const lines: string[] = [];

  lines.push('【宠物信息】');
  lines.push(formatPetInfo(request.pet));
  lines.push('');

  lines.push('【症状描述】');
  lines.push(request.symptoms);
  lines.push('');

  lines.push('【症状持续时长】');
  lines.push(request.duration || '未知');
  lines.push('');

  lines.push('【食欲状况】');
  lines.push(request.appetite || '未知');
  lines.push('');

  lines.push('【饮水状况】');
  lines.push(request.drinking || '未知');
  lines.push('');

  lines.push('【精神状态】');
  lines.push(request.energy || '未知');
  lines.push('');

  if (request.bowelMovement) {
    lines.push('【排便情况】');
    lines.push(request.bowelMovement);
    lines.push('');
  }

  const flags: string[] = [];
  if (request.isVomiting) flags.push('有呕吐');
  if (request.hasInjury) flags.push('有外伤');
  if (flags.length > 0) {
    lines.push('【额外标志】');
    lines.push(flags.join('；'));
    lines.push('');
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Validate and normalize AI response
// ---------------------------------------------------------------------------

function validateAndNormalize(
  raw: Record<string, unknown>,
): AITriageResult {
  const riskLevel: AITriageResult['riskLevel'] =
    typeof raw.riskLevel === 'string' &&
    (VALID_RISK_LEVELS as readonly string[]).includes(raw.riskLevel)
      ? (raw.riskLevel as AITriageResult['riskLevel'])
      : 'LOW';

  const possibleConditions = (
    Array.isArray(raw.possibleConditions) ? raw.possibleConditions : []
  )
    .map((condition) =>
      String(condition)
        .replace(/确诊|患有|得了|诊断|确认/g, '可能')
        .replace(/[\d.]+(?:mg|ml|g|片|粒|支|包|袋)/g, '适当剂量'),
    )
    .filter((condition) => condition.trim().length > 0);

  const homeCareAdvice = (
    Array.isArray(raw.homeCareAdvice) ? raw.homeCareAdvice : []
  )
    .map((advice) =>
      String(advice)
        .replace(/[\d.]+(?:mg|ml|g|片|粒|支|包|袋)/g, '适当剂量')
        .replace(/服用|口服|注射|喂药/g, '咨询兽医后使用'),
    )
    .filter((advice) => advice.trim().length > 0);

  const precautions = (Array.isArray(raw.precautions) ? raw.precautions : [])
    .map((precaution) =>
      String(precaution).replace(/[\d.]+(?:mg|ml|g|片|粒|支|包|袋)/g, '适当剂量'),
    )
    .filter((precaution) => precaution.trim().length > 0);

  const shouldSeeVet =
    typeof raw.shouldSeeVet === 'boolean' ? raw.shouldSeeVet : riskLevel !== 'LOW';

  // Generate unique ID
  const id = `triage-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  // Force disclaimer – if AI didn't include one or it lacks the reference marker, inject ours
  const hasDisclaimer =
    typeof raw.disclaimer === 'string' &&
    raw.disclaimer.length > 20 &&
    (raw.disclaimer.includes('参考') || raw.disclaimer.includes('不能替代'));
  const disclaimer = hasDisclaimer && typeof raw.disclaimer === 'string'
    ? raw.disclaimer
    : DISCLAIMER;

  return {
    id,
    riskLevel,
    possibleConditions,
    homeCareAdvice,
    shouldSeeVet,
    urgencyNote:
      typeof raw.urgencyNote === 'string' ? raw.urgencyNote : undefined,
    precautions,
    disclaimer,
  };
}

// ---------------------------------------------------------------------------
// Real AI provider – production implementation
// ---------------------------------------------------------------------------

async function callRealAI(request: AITriageRequest): Promise<AITriageResult> {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    console.warn('[AI] No AI_API_KEY set, falling back to mock');
    const { getMockAITriage } = await import('./mock-ai');
    return getMockAITriage(request);
  }

  const model = process.env.AI_MODEL || 'gpt-4o-mini';
  const provider = getAIProviderType();
  const userMessage = buildUserMessage(request);

  // 15-second timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    console.error('[AI] Request timed out after 15 seconds');
    controller.abort();
  }, 15000);

  try {
    const endpoint =
      provider === 'zhipu'
        ? 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';

    // Only OpenAI supports response_format json_object; zhipu does not
    const body: Record<string, unknown> = {
      model,
      messages: [
        { role: 'system', content: AI_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 800,
    };
    if (provider !== 'zhipu') {
      body.response_format = { type: 'json_object' };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'unknown');
      console.error(
        `[AI] API error ${response.status}: ${errorText.slice(0, 200)}`,
      );
      console.warn('[AI] Falling back to mock AI');
      const { getMockAITriage } = await import('./mock-ai');
      return getMockAITriage(request);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content || typeof content !== 'string') {
      console.error('[AI] Empty or invalid response content');
      console.warn('[AI] Falling back to mock AI');
      const { getMockAITriage } = await import('./mock-ai');
      return getMockAITriage(request);
    }

    console.log(
      `[AI] ${provider} response (${content.length} chars), model: ${data.model || model}`,
    );

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      // Try to extract JSON from the response if it's wrapped in markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[1].trim());
        } catch {
          console.error('[AI] Failed to parse response as JSON');
          console.warn('[AI] Falling back to mock AI');
          const { getMockAITriage } = await import('./mock-ai');
          return getMockAITriage(request);
        }
      } else {
        console.error('[AI] Response is not valid JSON');
        console.warn('[AI] Falling back to mock AI');
        const { getMockAITriage } = await import('./mock-ai');
        return getMockAITriage(request);
      }
    }

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      console.error('[AI] Parsed response is not an object');
      console.warn('[AI] Falling back to mock AI');
      const { getMockAITriage } = await import('./mock-ai');
      return getMockAITriage(request);
    }

    return validateAndNormalize(parsed as Record<string, unknown>);
  } catch (error: unknown) {
    clearTimeout(timeout);
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.error('[AI] Request aborted (timeout)');
    } else {
      console.error(
        '[AI] Request failed:',
        error instanceof Error ? error.message : error,
      );
    }
    console.warn('[AI] Falling back to mock AI');
    const { getMockAITriage } = await import('./mock-ai');
    return getMockAITriage(request);
  }
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Get an AI triage assessment for a pet's symptoms.
 *
 * Behaviour:
 * - Validates the request first (symptoms required, length cap, pet type).
 * - When AI_PROVIDER is "mock" (default): uses the local mock provider.
 * - When AI_PROVIDER is "openai" or "zhipu": attempts the real provider,
 *   falls back to mock with a warning log on failure.
 */
export async function getAITriage(
  request: AITriageRequest,
): Promise<AITriageResult> {
  const validationError = validateTriageRequest(request);
  if (validationError) {
    throw new Error(validationError);
  }

  const providerType = getAIProviderType();

  if (providerType === 'mock') {
    const { getMockAITriage } = await import('./mock-ai');
    return getMockAITriage(request);
  }

  // Real provider attempt with fallback
  try {
    return await callRealAI(request);
  } catch (err) {
    console.warn(
      `[AI Provider] ${providerType} call failed, falling back to mock:`,
      err instanceof Error ? err.message : err,
    );
    const { getMockAITriage } = await import('./mock-ai');
    return getMockAITriage(request);
  }
}
