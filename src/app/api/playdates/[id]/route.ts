import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

function parseJsonArray(val: string): string[] {
  try { return JSON.parse(val); } catch { return []; }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();

  const { searchParams } = new URL(req.url);
  const petIdParam = searchParams.get('petId');
  const petId = petIdParam ? Number(petIdParam) : null;

  const playdate = await prisma.playdate.findUnique({
    where: { id: Number(id) },
    include: {
      creator: {
        select: { id: true, name: true, avatar: true, type: true, breed: true, userId: true },
      },
      target: {
        select: { id: true, name: true, avatar: true, type: true, breed: true },
      },
      participants: {
        include: {
          pet: {
            select: { id: true, name: true, avatar: true, type: true, breed: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
      _count: { select: { participants: true } },
    },
  });

  if (!playdate) {
    return NextResponse.json({ error: '约玩不存在' }, { status: 404 });
  }

  const isCreator = session.userId
    ? playdate.creator.userId === session.userId
    : false;

  return NextResponse.json({
    playdate: {
      id: playdate.id,
      type: playdate.type,
      creatorPetId: playdate.creatorPetId,
      targetPetId: playdate.targetPetId,
      title: playdate.title,
      time: playdate.time.toISOString(),
      place: playdate.place,
      description: playdate.description,
      sizeLimit: playdate.sizeLimit,
      suitableTypes: parseJsonArray(playdate.suitableTypes),
      suitableSizes: parseJsonArray(playdate.suitableSizes),
      status: playdate.status,
      moderationStatus: playdate.moderationStatus,
      createdAt: playdate.createdAt.toISOString(),
      updatedAt: playdate.updatedAt.toISOString(),
      creator: playdate.creator,
      target: playdate.target,
      participantCount: playdate._count.participants,
      participants: playdate.participants.map((p) => ({
        id: p.pet.id,
        name: p.pet.name,
        avatar: p.pet.avatar,
        type: p.pet.type,
        breed: p.pet.breed,
        joinedAt: p.createdAt.toISOString(),
      })),
      isJoined: petId
        ? playdate.participants.some((p) => p.petId === petId)
        : false,
      isCreator,
    },
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { id } = await params;
  const playdate = await prisma.playdate.findUnique({
    where: { id: Number(id) },
    include: { creator: { select: { userId: true } } },
  });

  if (!playdate) {
    return NextResponse.json({ error: '约玩不存在' }, { status: 404 });
  }

  if (playdate.creator.userId !== session.userId) {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  if (playdate.status === 'CANCELLED' || playdate.status === 'COMPLETED') {
    return NextResponse.json({ error: '该约玩已结束' }, { status: 400 });
  }

  const body = await req.json();
  const { title, time, place, description, sizeLimit, status } = body;

  const data: Record<string, unknown> = {};

  if (status === 'CANCELLED') {
    data.status = 'CANCELLED';
  } else {
    if (title !== undefined) data.title = title;
    if (time !== undefined) data.time = new Date(time);
    if (place !== undefined) data.place = place;
    if (description !== undefined) data.description = description;
    if (sizeLimit !== undefined) data.sizeLimit = sizeLimit;
  }

  const updated = await prisma.playdate.update({
    where: { id: Number(id) },
    data,
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
      ...updated,
      time: updated.time.toISOString(),
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      suitableTypes: parseJsonArray(updated.suitableTypes),
      suitableSizes: parseJsonArray(updated.suitableSizes),
      participantCount: updated._count.participants,
      _count: undefined,
    },
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { id } = await params;
  const playdate = await prisma.playdate.findUnique({
    where: { id: Number(id) },
    include: { creator: { select: { userId: true } } },
  });

  if (!playdate) {
    return NextResponse.json({ error: '约玩不存在' }, { status: 404 });
  }

  if (playdate.creator.userId !== session.userId) {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  await prisma.playdate.update({
    where: { id: Number(id) },
    data: { status: 'CANCELLED' },
  });

  return NextResponse.json({ success: true });
}
