import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const petId = searchParams.get('petId');
  if (!petId) return NextResponse.json({ error: '缺少 petId 参数' }, { status: 400 });

  const pet = await prisma.pet.findFirst({
    where: { id: Number(petId), userId: session.userId },
  });
  if (!pet) return NextResponse.json({ error: '宠物不存在' }, { status: 404 });

  let profile = await prisma.petHealthProfile.findUnique({
    where: { petId: pet.id },
  });

  if (!profile) {
    profile = await prisma.petHealthProfile.create({
      data: { petId: pet.id },
    });
  }

  return NextResponse.json({ profile });
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const body = await req.json();
  const { petId, ...updateFields } = body;

  if (!petId) return NextResponse.json({ error: '缺少 petId' }, { status: 400 });

  const pet = await prisma.pet.findFirst({
    where: { id: Number(petId), userId: session.userId },
  });
  if (!pet) return NextResponse.json({ error: '宠物不存在' }, { status: 404 });

  const allowedFields = [
    'weight', 'isNeutered', 'vaccineRecords', 'dewormRecords',
    'allergies', 'medicalHistory', 'currentMeds',
    'lastVetVisit', 'lastVetReason', 'nextReminder',
  ];

  const data: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in updateFields) {
      const val = updateFields[field];
      if (field === 'vaccineRecords' || field === 'dewormRecords') {
        data[field] = typeof val === 'string' ? val : JSON.stringify(val);
      } else if (field === 'lastVetVisit' || field === 'nextReminder') {
        data[field] = val ? new Date(val as string) : null;
      } else {
        data[field] = val;
      }
    }
  }

  const profile = await prisma.petHealthProfile.upsert({
    where: { petId: Number(petId) },
    create: { petId: Number(petId), ...data },
    update: data,
  });

  return NextResponse.json({ profile });
}
