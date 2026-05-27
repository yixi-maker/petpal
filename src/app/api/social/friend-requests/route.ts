import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const direction = searchParams.get('direction') || 'received';

  const userPets = await prisma.pet.findMany({
    where: { userId: session.userId },
    select: { id: true },
  });
  const userPetIds = userPets.map((p) => p.id);

  let requests;
  if (direction === 'sent') {
    requests = await prisma.friendRequest.findMany({
      where: { fromPetId: { in: userPetIds } },
      include: {
        toPet: { select: { id: true, name: true, type: true, breed: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  } else {
    requests = await prisma.friendRequest.findMany({
      where: { toPetId: { in: userPetIds }, status: 'PENDING' },
      include: {
        fromPet: { select: { id: true, name: true, type: true, breed: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  return NextResponse.json({ requests });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const { fromPetId, toPetId, message } = await req.json();

  const fromPet = await prisma.pet.findUnique({ where: { id: fromPetId } });
  if (!fromPet || fromPet.userId !== session.userId) {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  // Check not already friends
  const minId = Math.min(fromPetId, toPetId);
  const maxId = Math.max(fromPetId, toPetId);
  const alreadyFriends = await prisma.friendship.findUnique({
    where: { petId1_petId2: { petId1: minId, petId2: maxId } },
  });
  if (alreadyFriends) {
    return NextResponse.json({ error: '已经是好友' }, { status: 400 });
  }

  // Check no existing pending request
  const existing = await prisma.friendRequest.findFirst({
    where: {
      OR: [
        { fromPetId, toPetId, status: 'PENDING' },
        { fromPetId: toPetId, toPetId: fromPetId, status: 'PENDING' },
      ],
    },
  });
  if (existing) {
    return NextResponse.json({ error: '已存在待处理的打招呼请求' }, { status: 400 });
  }

  const request = await prisma.friendRequest.create({
    data: { fromPetId, toPetId, message: message || '你好呀，交个朋友吧~' },
    include: {
      toPet: { select: { id: true, name: true, avatar: true } },
    },
  });

  return NextResponse.json({ request }, { status: 201 });
}
