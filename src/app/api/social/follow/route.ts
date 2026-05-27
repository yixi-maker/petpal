import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const petId = parseInt(searchParams.get('petId') || '');
  const type = searchParams.get('type') || 'followers';

  if (isNaN(petId)) {
    return NextResponse.json({ error: '缺少 petId 参数' }, { status: 400 });
  }

  if (type === 'followers') {
    const followers = await prisma.follow.findMany({
      where: { followingPetId: petId },
      include: { follower: { select: { id: true, name: true, type: true, breed: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ list: followers.map((f) => ({ ...f.follower, followedAt: f.createdAt })) });
  }

  const following = await prisma.follow.findMany({
    where: { followerPetId: petId },
    include: { following: { select: { id: true, name: true, type: true, breed: true, avatar: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ list: following.map((f) => ({ ...f.following, followedAt: f.createdAt })) });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const { followerPetId, followingPetId } = await req.json();

  const followerPet = await prisma.pet.findUnique({ where: { id: followerPetId } });
  if (!followerPet || followerPet.userId !== session.userId) {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  const existing = await prisma.follow.findUnique({
    where: { followerPetId_followingPetId: { followerPetId, followingPetId } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return NextResponse.json({ following: false });
  }

  await prisma.follow.create({ data: { followerPetId, followingPetId } });
  return NextResponse.json({ following: true });
}
