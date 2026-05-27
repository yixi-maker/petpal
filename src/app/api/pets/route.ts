import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const pets = await prisma.pet.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ pets });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const body = await req.json();
  const { name, type, breed, birthday, gender, size, personalityTags, bio, avatar } = body;

  if (!name || !type) {
    return NextResponse.json({ error: '昵称和类型为必填项' }, { status: 400 });
  }

  const pet = await prisma.pet.create({
    data: {
      userId: session.userId,
      name,
      type,
      breed: breed || null,
      birthday: birthday ? new Date(birthday) : null,
      gender: gender || 'UNKNOWN',
      size: size || 'MEDIUM',
      personalityTags: JSON.stringify(personalityTags || []),
      bio: bio || null,
      avatar: avatar || null,
    },
  });

  return NextResponse.json({ pet }, { status: 201 });
}
