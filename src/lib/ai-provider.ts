// NOTE: When real AI provider is implemented, import the system prompt:
// import { AI_SYSTEM_PROMPT } from './ai-system-prompt';

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
// Input validation
// ---------------------------------------------------------------------------

const MAX_SYMPTOMS_LENGTH = 2000;

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
// Real provider stub (placeholder for external AI API)
// ---------------------------------------------------------------------------

async function callRealAI(request: AITriageRequest): Promise<AITriageResult> {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    throw new Error('AI_API_KEY not configured');
  }

  const providerType = getAIProviderType();

  // TODO: Integrate with the selected provider's API.
  // Example for OpenAI-compatible endpoint:
  //
  //   const response = await fetch('https://api.openai.com/v1/chat/completions', {
  //     method: 'POST',
  //     headers: {
  //       'Authorization': `Bearer ${apiKey}`,
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       model: process.env.AI_MODEL || 'gpt-4o',
  //       messages: [
  //         { role: 'system', content: AI_SYSTEM_PROMPT },
  //         { role: 'user', content: JSON.stringify(request) },
  //       ],
  //       response_format: { type: 'json_object' },
  //       temperature: 0.3,
  //     }),
  //   });
  //
  //   const data = await response.json();
  //   return JSON.parse(data.choices[0].message.content) as AITriageResult;

  console.log(
    `[AI Provider] Would call ${providerType} API for symptoms: ${request.symptoms.slice(0, 80)}...`
  );

  // Placeholder: throw so the caller falls back to mock
  throw new Error('Real AI provider not yet implemented');
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
export async function getAITriage(request: AITriageRequest): Promise<AITriageResult> {
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
      err instanceof Error ? err.message : err
    );
    const { getMockAITriage } = await import('./mock-ai');
    return getMockAITriage(request);
  }
}
