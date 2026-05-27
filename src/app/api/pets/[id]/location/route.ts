import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { id } = await params;
  const pet = await prisma.pet.findUnique({ where: { id: Number(id) } });
  if (!pet || pet.userId !== session.userId) {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  const body = await req.json();
  const { city, district, lat, lng, geohash } = body;

  if (!city || lat === undefined || lng === undefined) {
    return NextResponse.json({ error: '缺少必要参数: city, lat, lng' }, { status: 400 });
  }

  const location = await prisma.petLocation.upsert({
    where: { petId: Number(id) },
    create: {
      petId: Number(id),
      city,
      district: district || null,
      lat,
      lng,
      geohash: geohash || null,
    },
    update: {
      city,
      district: district || null,
      lat,
      lng,
      geohash: geohash || null,
    },
  });

  return NextResponse.json({ location });
}
