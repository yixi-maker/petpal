import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const petIdParam = searchParams.get('petId');
  const petId = petIdParam ? Number(petIdParam) : null;

  if (!petId) {
    return NextResponse.json({ error: '缺少 petId' }, { status: 400 });
  }

  // Verify pet belongs to current user
  const pet = await prisma.pet.findUnique({ where: { id: petId } });
  if (!pet || pet.userId !== session.userId) {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  // Find all friendships involving this pet
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { petId1: petId },
        { petId2: petId },
      ],
    },
    include: {
      pet1: {
        select: { id: true, name: true, avatar: true, type: true, breed: true },
      },
      pet2: {
        select: { id: true, name: true, avatar: true, type: true, breed: true },
      },
    },
  });

  const friends = friendships.map((f) =>
    f.petId1 === petId ? f.pet2 : f.pet1
  );

  return NextResponse.json({ friends });
}
