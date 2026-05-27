import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: '未登录' }, { status: 401 });

  // Get all user's pet IDs
  const userPets = await prisma.pet.findMany({
    where: { userId: session.userId },
    select: { id: true },
  });
  const userPetIds = userPets.map((p) => p.id);

  if (userPetIds.length === 0) {
    return NextResponse.json({ threads: [] });
  }

  // Find all threads where user's pet is a participant
  const threads = await prisma.messageThread.findMany({
    where: {
      OR: [
        { petId1: { in: userPetIds } },
        { petId2: { in: userPetIds } },
      ],
    },
    include: {
      pet1: { select: { id: true, name: true, type: true, avatar: true } },
      pet2: { select: { id: true, name: true, type: true, avatar: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { content: true, createdAt: true, senderPetId: true },
      },
    },
    orderBy: { lastMessageAt: 'desc' },
  });

  // Transform threads to include otherPet info and last message
  const result = threads.map((thread) => {
    const isPet1 = userPetIds.includes(thread.petId1);
    const otherPet = isPet1 ? thread.pet2 : thread.pet1;
    const lastMessage = thread.messages[0] || null;

    return {
      id: thread.id,
      otherPet: {
        id: otherPet.id,
        name: otherPet.name,
        type: otherPet.type,
        avatar: otherPet.avatar,
      },
      lastMessage: lastMessage
        ? {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt,
            isMine: lastMessage.senderPetId === (isPet1 ? thread.petId1 : thread.petId2),
          }
        : null,
      lastMessageAt: thread.lastMessageAt,
    };
  });

  return NextResponse.json({ threads: result });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const { fromPetId, toPetId, content } = await req.json();

  if (!fromPetId || !toPetId) {
    return NextResponse.json({ error: '缺少参数' }, { status: 400 });
  }

  if (!content || !content.trim()) {
    return NextResponse.json({ error: '消息内容不能为空' }, { status: 400 });
  }

  // Verify fromPetId belongs to current user
  const fromPet = await prisma.pet.findUnique({ where: { id: fromPetId } });
  if (!fromPet || fromPet.userId !== session.userId) {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  // Verify pets are friends
  const minId = Math.min(fromPetId, toPetId);
  const maxId = Math.max(fromPetId, toPetId);
  const friendship = await prisma.friendship.findUnique({
    where: { petId1_petId2: { petId1: minId, petId2: maxId } },
  });
  if (!friendship) {
    return NextResponse.json({ error: '仅好友之间可以发送私信' }, { status: 403 });
  }

  // Check if thread already exists
  const existingThread = await prisma.messageThread.findFirst({
    where: {
      OR: [
        { petId1: fromPetId, petId2: toPetId },
        { petId1: toPetId, petId2: fromPetId },
      ],
    },
  });

  if (existingThread) {
    const message = await prisma.message.create({
      data: {
        threadId: existingThread.id,
        senderPetId: fromPetId,
        content: content.trim(),
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    });

    await prisma.messageThread.update({
      where: { id: existingThread.id },
      data: { lastMessageAt: new Date() },
    });

    return NextResponse.json({ thread: existingThread, message }, { status: 201 });
  }

  // Create new thread + first message in transaction
  const result = await prisma.$transaction(async (tx) => {
    const thread = await tx.messageThread.create({
      data: {
        petId1: minId,
        petId2: maxId,
      },
    });

    const message = await tx.message.create({
      data: {
        threadId: thread.id,
        senderPetId: fromPetId,
        content: content.trim(),
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    });

    return { thread, message };
  });

  return NextResponse.json(result, { status: 201 });
}
