import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const { id } = await params;
  const { action } = await req.json();

  const friendRequest = await prisma.friendRequest.findUnique({ where: { id: Number(id) } });
  if (!friendRequest) {
    return NextResponse.json({ error: '请求不存在' }, { status: 404 });
  }

  // Verify current user owns the receiving pet
  const toPet = await prisma.pet.findUnique({ where: { id: friendRequest.toPetId } });
  if (!toPet || toPet.userId !== session.userId) {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  if (friendRequest.status !== 'PENDING') {
    return NextResponse.json({ error: '该请求已处理' }, { status: 400 });
  }

  if (action === 'accept') {
    const fromPetId = friendRequest.fromPetId;
    const toPetId = friendRequest.toPetId;

    // Execute in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update request status
      await tx.friendRequest.update({
        where: { id: Number(id) },
        data: { status: 'ACCEPTED' },
      });

      // 2. Create bidirectional follows
      await tx.follow.upsert({
        where: { followerPetId_followingPetId: { followerPetId: fromPetId, followingPetId: toPetId } },
        create: { followerPetId: fromPetId, followingPetId: toPetId },
        update: {},
      });
      await tx.follow.upsert({
        where: { followerPetId_followingPetId: { followerPetId: toPetId, followingPetId: fromPetId } },
        create: { followerPetId: toPetId, followingPetId: fromPetId },
        update: {},
      });

      // 3. Create friendship (petId1 < petId2)
      const minId = Math.min(fromPetId, toPetId);
      const maxId = Math.max(fromPetId, toPetId);
      await tx.friendship.upsert({
        where: { petId1_petId2: { petId1: minId, petId2: maxId } },
        create: { petId1: minId, petId2: maxId },
        update: {},
      });
    });

    return NextResponse.json({ status: 'ACCEPTED' });
  }

  if (action === 'reject') {
    await prisma.friendRequest.update({
      where: { id: Number(id) },
      data: { status: 'REJECTED' },
    });
    return NextResponse.json({ status: 'REJECTED' });
  }

  return NextResponse.json({ error: '无效的 action' }, { status: 400 });
}
