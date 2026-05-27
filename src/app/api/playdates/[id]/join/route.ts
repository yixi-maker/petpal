import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { petId } = body;

  if (!petId) {
    return NextResponse.json({ error: '缺少 petId' }, { status: 400 });
  }

  // Verify pet belongs to current user
  const pet = await prisma.pet.findUnique({ where: { id: petId } });
  if (!pet || pet.userId !== session.userId) {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  // Check playdate exists and is active
  const playdate = await prisma.playdate.findUnique({
    where: { id: Number(id) },
    include: {
      participants: { select: { petId: true } },
      _count: { select: { participants: true } },
    },
  });

  if (!playdate) {
    return NextResponse.json({ error: '约玩不存在' }, { status: 404 });
  }

  if (playdate.status !== 'ACTIVE') {
    return NextResponse.json({ error: '该约玩已结束' }, { status: 400 });
  }

  const alreadyJoined = playdate.participants.some((p) => p.petId === petId);

  if (alreadyJoined) {
    // Cancel participation
    await prisma.playdateParticipant.delete({
      where: {
        playdateId_petId: { playdateId: Number(id), petId },
      },
    });

    const updatedCount = await prisma.playdateParticipant.count({
      where: { playdateId: Number(id) },
    });

    return NextResponse.json({ joined: false, participantCount: updatedCount });
  }

  // Join: check size limit
  if (playdate.sizeLimit && playdate._count.participants >= playdate.sizeLimit) {
    return NextResponse.json({ error: '该活动已满员' }, { status: 400 });
  }

  await prisma.playdateParticipant.create({
    data: {
      playdateId: Number(id),
      petId,
    },
  });

  const updatedCount = playdate._count.participants + 1;

  return NextResponse.json({ joined: true, participantCount: updatedCount });
}
