import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { seedPlaces } from '@/lib/mock-map';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const placeId = parseInt(id);

  if (isNaN(placeId)) {
    return NextResponse.json({ error: '无效的地点ID' }, { status: 400 });
  }

  try {
    // Ensure DB has seeded data
    await seedPlaces();

    const place = await prisma.place.findUnique({
      where: { id: placeId },
      include: {
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: {
            pet: {
              select: {
                id: true,
                name: true,
                type: true,
                breed: true,
                avatar: true,
              },
            },
          },
        },
        _count: { select: { reviews: true } },
      },
    });

    if (!place) {
      return NextResponse.json({ error: '地点不存在' }, { status: 404 });
    }

    return NextResponse.json({
      place: {
        id: place.id,
        name: place.name,
        type: place.type,
        city: place.city,
        district: place.district,
        lat: place.lat,
        lng: place.lng,
        address: place.address,
        phone: place.phone,
        rating: place.rating,
        isOpen: place.isOpen,
        openHours: place.openHours,
        petFriendlyTags: JSON.parse(place.petFriendlyTags || '[]'),
        images: JSON.parse(place.images || '[]'),
        reviewCount: place._count.reviews,
        reviews: place.reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          content: r.content,
          createdAt: r.createdAt,
          pet: r.pet,
        })),
      },
    });
  } catch (error) {
    console.error('Failed to fetch place:', error);
    return NextResponse.json({ error: '获取地点详情失败' }, { status: 500 });
  }
}
