import { prisma } from './prisma';
import type { AITriageResult } from './ai-provider';

export async function saveTriageRecord(petId: number, result: AITriageResult) {
  // Store triage result as a HealthRecord with type='OTHER'
  // The full AI result is serialized into the images field for persistence
  return prisma.healthRecord.create({
    data: {
      petId,
      type: 'OTHER',
      recordDate: new Date(),
      description: `AI分诊 - 风险等级: ${result.riskLevel} - ${result.shouldSeeVet ? '建议就医' : '居家观察'}`,
      images: JSON.stringify([JSON.stringify(result)]),
    },
  });
}
