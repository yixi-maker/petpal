import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

function parseJsonArray(val: string): string[] {
  try { return JSON.parse(val); } catch { return []; }
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'PUBLIC';
  const status = searchParams.get('status') || 'ACTIVE';
  const petIdParam = searchParams.get('petId');
  const petId = petIdParam ? Number(petIdParam) : null;

  const where: Record<string, unknown> = { status };

  if (type === 'PUBLIC') {
    where.type = 'PUBLIC';

    const playdates = await prisma.playdate.findMany({
      where,
      orderBy: { time: 'asc' },
      include: {
        creator: {
          select: { id: true, name: true, avatar: true, type: true, breed: true },
        },
        participants: {
          select: { petId: true },
        },
        _count: { select: { participants: true } },
      },
    });

    const result = playdates.map((pd) => ({
      id: pd.id,
      type: pd.type,
      creatorPetId: pd.creatorPetId,
      title: pd.title,
      time: pd.time.toISOString(),
      place: pd.place,
      description: pd.description,
      sizeLimit: pd.sizeLimit,
      suitableTypes: parseJsonArray(pd.suitableTypes),
      suitableSizes: parseJsonArray(pd.suitableSizes),
      status: pd.status,
      moderationStatus: pd.moderationStatus,
      createdAt: pd.createdAt.toISOString(),
      updatedAt: pd.updatedAt.toISOString(),
      creator: pd.creator,
      participantCount: pd._count.participants,
      isJoined: petId ? pd.participants.some((p) => p.petId === petId) : false,
    }));

    return NextResponse.json({ playdates: result });
  }

  // INVITE: return invites related to user's pets (sent or received)
  const userPets = await prisma.pet.findMany({
    where: { userId: session.userId },
    select: { id: true },
  });
  const userPetIds = userPets.map((p) => p.id);

  if (userPetIds.length === 0) {
    return NextResponse.json({ playdates: [] });
  }

  where.type = 'INVITE';
  where.OR = [
    { creatorPetId: { in: userPetIds } },
    { targetPetId: { in: userPetIds } },
  ];

  const playdates = await prisma.playdate.findMany({
    where,
    orderBy: { time: 'asc' },
    include: {
      creator: {
        select: { id: true, name: true, avatar: true, type: true, breed: true },
      },
      target: {
        select: { id: true, name: true, avatar: true, type: true, breed: true },
      },
      _count: { select: { participants: true } },
    },
  });

  return NextResponse.json({
    playdates: playdates.map((pd) => ({
      id: pd.id,
      type: pd.type,
      creatorPetId: pd.creatorPetId,
      targetPetId: pd.targetPetId,
      title: pd.title,
      time: pd.time.toISOString(),
      place: pd.place,
      description: pd.description,
      sizeLimit: pd.sizeLimit,
      suitableTypes: parseJsonArray(pd.suitableTypes),
      suitableSizes: parseJsonArray(pd.suitableSizes),
      status: pd.status,
      moderationStatus: pd.moderationStatus,
      createdAt: pd.createdAt.toISOString(),
      updatedAt: pd.updatedAt.toISOString(),
      creator: pd.creator,
      target: pd.target,
      participantCount: pd._count.participants,
    })),
  });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const body = await req.json();
  const {
    type,
    creatorPetId,
    targetPetId,
    title,
    time,
    place,
    description,
    sizeLimit,
    suitableTypes,
    suitableSizes,
  } = body;

  if (type !== 'INVITE' && type !== 'PUBLIC') {
    return NextResponse.json({ error: '无效的约玩类型' }, { status: 400 });
  }

  // Verify creatorPetId belongs to current user
  const creatorPet = await prisma.pet.findUnique({ where: { id: creatorPetId } });
  if (!creatorPet || creatorPet.userId !== session.userId) {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  if (type === 'INVITE') {
    if (!targetPetId) {
      return NextResponse.json({ error: '请选择邀请对象' }, { status: 400 });
    }

    // Verify friendship exists between creator and target
    const minId = Math.min(creatorPetId, targetPetId);
    const maxId = Math.max(creatorPetId, targetPetId);
    const friendship = await prisma.friendship.findUnique({
      where: { petId1_petId2: { petId1: minId, petId2: maxId } },
    });
    if (!friendship) {
      return NextResponse.json({ error: '只能邀请好友参加一对一约玩' }, { status: 403 });
    }
  }

  if (type === 'PUBLIC') {
    if (!title || !time || !place) {
      return NextResponse.json({ error: '请填写活动标题、时间和地点' }, { status: 400 });
    }
  }

  const playdate = await prisma.playdate.create({
    data: {
      type,
      creatorPetId,
      targetPetId: targetPetId || null,
      title: title || '约玩活动',
      time: new Date(time),
      place: place || '',
      description: description || null,
      sizeLimit: sizeLimit || null,
      suitableTypes: suitableTypes ? JSON.stringify(suitableTypes) : '[]',
      suitableSizes: suitableSizes ? JSON.stringify(suitableSizes) : '[]',
    },
    include: {
      creator: {
        select: { id: true, name: true, avatar: true, type: true, breed: true },
      },
      target: {
        select: { id: true, name: true, avatar: true, type: true, breed: true },
      },
      _count: { select: { participants: true } },
    },
  });

  return NextResponse.json({
    playdate: {
      ...playdate,
      time: playdate.time.toISOString(),
      createdAt: playdate.createdAt.toISOString(),
      updatedAt: playdate.updatedAt.toISOString(),
      suitableTypes: parseJsonArray(playdate.suitableTypes),
      suitableSizes: parseJsonArray(playdate.suitableSizes),
      participantCount: playdate._count.participants,
      _count: undefined,
    },
  }, { status: 201 });
}
