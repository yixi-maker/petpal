import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const pet = await prisma.pet.findUnique({
    where: { id: Number(id) },
    include: {
      healthProfile: true,
      location: true,
      _count: { select: { followers: true, following: true } },
    },
  });

  if (!pet) return NextResponse.json({ error: '宠物不存在' }, { status: 404 });

  const friendCount = await prisma.friendship.count({
    where: { OR: [{ petId1: pet.id }, { petId2: pet.id }] },
  });

  const parsedTags = JSON.parse(pet.personalityTags || '[]');

  return NextResponse.json({
    pet: {
      ...pet,
      personalityTags: parsedTags,
      followerCount: pet._count.followers,
      followingCount: pet._count.following,
      friendCount,
    },
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const { id } = await params;
  const pet = await prisma.pet.findUnique({ where: { id: Number(id) } });
  if (!pet || pet.userId !== session.userId) {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.type !== undefined) data.type = body.type;
  if (body.breed !== undefined) data.breed = body.breed;
  if (body.birthday !== undefined) data.birthday = body.birthday ? new Date(body.birthday) : null;
  if (body.gender !== undefined) data.gender = body.gender;
  if (body.size !== undefined) data.size = body.size;
  if (body.personalityTags !== undefined) data.personalityTags = JSON.stringify(body.personalityTags);
  if (body.bio !== undefined) data.bio = body.bio;
  if (body.avatar !== undefined) data.avatar = body.avatar;

  const updated = await prisma.pet.update({ where: { id: Number(id) }, data });
  return NextResponse.json({ pet: updated });
}
