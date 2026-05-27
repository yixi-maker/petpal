import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const { threadId } = await params;
  if (isNaN(Number(threadId))) {
    return NextResponse.json({ error: '无效的对话ID' }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const beforeId = searchParams.get('before');
  const limit = 30;

  // Find the thread
  const thread = await prisma.messageThread.findUnique({
    where: { id: Number(threadId) },
    include: {
      pet1: { select: { id: true, name: true, type: true, avatar: true } },
      pet2: { select: { id: true, name: true, type: true, avatar: true } },
    },
  });

  if (!thread) {
    return NextResponse.json({ error: '对话不存在' }, { status: 404 });
  }

  // Verify current user owns one of the pets in the thread
  const userPets = await prisma.pet.findMany({
    where: { userId: session.userId },
    select: { id: true },
  });
  const userPetIds = userPets.map((p) => p.id);

  if (!userPetIds.includes(thread.petId1) && !userPetIds.includes(thread.petId2)) {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  // Build query conditions
  const where: Record<string, unknown> = { threadId: Number(threadId) };
  if (beforeId) {
    const cursorMsg = await prisma.message.findUnique({
      where: { id: Number(beforeId) },
      select: { createdAt: true },
    });
    if (cursorMsg) {
      where.createdAt = { lt: cursorMsg.createdAt };
    }
  }

  // Fetch newest 30 messages (desc order) then reverse for chat-style asc display
  const messages = await prisma.message.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
    },
  });
  messages.reverse();

  return NextResponse.json({
    messages,
    otherPet: userPetIds.includes(thread.petId1) ? thread.pet2 : thread.pet1,
    userPetId: userPetIds.includes(thread.petId1) ? thread.petId1 : thread.petId2,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const { threadId } = await params;
  if (isNaN(Number(threadId))) {
    return NextResponse.json({ error: '无效的对话ID' }, { status: 400 });
  }

  const { senderPetId, content } = await req.json();

  if (!senderPetId || !content || !content.trim()) {
    return NextResponse.json({ error: '缺少参数' }, { status: 400 });
  }

  // Verify senderPetId belongs to current user
  const senderPet = await prisma.pet.findUnique({ where: { id: senderPetId } });
  if (!senderPet || senderPet.userId !== session.userId) {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  // Find the thread and verify sender is a participant
  const thread = await prisma.messageThread.findUnique({
    where: { id: Number(threadId) },
  });

  if (!thread) {
    return NextResponse.json({ error: '对话不存在' }, { status: 404 });
  }

  if (thread.petId1 !== senderPetId && thread.petId2 !== senderPetId) {
    return NextResponse.json({ error: '你不是该对话的参与者' }, { status: 403 });
  }

  // Create message and update thread
  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        threadId: Number(threadId),
        senderPetId,
        content: content.trim(),
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    }),
    prisma.messageThread.update({
      where: { id: Number(threadId) },
      data: { lastMessageAt: new Date() },
    }),
  ]);

  return NextResponse.json({ message }, { status: 201 });
}
