import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { getAITriage } from '@/lib/ai-provider';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const body = await req.json();
  const {
    petId, symptoms, duration, appetite, drinking, energy,
    bowelMovement, isVomiting, hasInjury, images,
  } = body;

  if (!petId || !symptoms || !duration || !appetite || !drinking || !energy) {
    return NextResponse.json(
      { error: '请填写所有必填项（宠物、症状描述、持续时间、食欲、饮水、精神）' },
      { status: 400 }
    );
  }

  const pet = await prisma.pet.findFirst({
    where: { id: Number(petId), userId: session.userId },
    include: { healthProfile: true },
  });
  if (!pet) return NextResponse.json({ error: '宠物不存在' }, { status: 404 });

  const age = pet.birthday
    ? Math.floor((Date.now() - new Date(pet.birthday).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : undefined;

  const triageResult = await getAITriage({
    pet: {
      type: pet.type as 'CAT' | 'DOG',
      breed: pet.breed || undefined,
      age,
      gender: pet.gender || undefined,
      weight: pet.healthProfile?.weight || undefined,
      isNeutered: pet.healthProfile?.isNeutered ?? undefined,
    },
    symptoms,
    duration,
    appetite,
    drinking,
    energy,
    bowelMovement: bowelMovement || undefined,
    isVomiting: isVomiting || false,
    hasInjury: hasInjury || false,
    images: images
      ? (typeof images === 'string' ? images.split(',').map((s: string) => s.trim()).filter(Boolean) : images)
      : undefined,
  });

  return NextResponse.json({ result: triageResult });
}
