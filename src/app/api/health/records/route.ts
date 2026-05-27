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

  const records = await prisma.healthRecord.findMany({
    where: { petId: pet.id },
    orderBy: { recordDate: 'desc' },
  });

  return NextResponse.json({ records });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const body = await req.json();
  const { petId, type, recordDate, description, images } = body;

  if (!petId || !type || !recordDate) {
    return NextResponse.json({ error: 'petId、type 和 recordDate 为必填项' }, { status: 400 });
  }

  const pet = await prisma.pet.findFirst({
    where: { id: Number(petId), userId: session.userId },
  });
  if (!pet) return NextResponse.json({ error: '宠物不存在' }, { status: 404 });

  const record = await prisma.healthRecord.create({
    data: {
      petId: Number(petId),
      type,
      recordDate: new Date(recordDate),
      description: description || null,
      images: images ? JSON.stringify(images) : '[]',
    },
  });

  return NextResponse.json({ record }, { status: 201 });
}
