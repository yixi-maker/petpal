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

export async function getAITriage(request: AITriageRequest): Promise<AITriageResult> {
  if (process.env.AI_API_KEY) {
    // TODO: When AI_API_KEY is set, call the real AI API here.
    // For now, delegate to mock provider even when key is present
    // to avoid breaking the build / runtime.
  }

  const { getMockAITriage } = await import('./mock-ai');
  return getMockAITriage(request);
}
