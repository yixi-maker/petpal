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
  const placeId = parseInt(id);

  if (isNaN(placeId)) {
    return NextResponse.json({ error: '无效的地点ID' }, { status: 400 });
  }

  let body: { petId?: number; rating?: number; content?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }

  const { petId, rating, content } = body;

  if (!petId || typeof petId !== 'number') {
    return NextResponse.json({ error: '请选择要使用的宠物' }, { status: 400 });
  }

  if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
    return NextResponse.json({ error: '评分需为1-5的整数' }, { status: 400 });
  }

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return NextResponse.json({ error: '评价内容不能为空' }, { status: 400 });
  }

  if (content.trim().length > 500) {
    return NextResponse.json({ error: '评价内容不能超过500字' }, { status: 400 });
  }

  try {
    // Verify the pet belongs to the current user
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      select: { userId: true },
    });

    if (!pet) {
      return NextResponse.json({ error: '宠物不存在' }, { status: 404 });
    }

    if (pet.userId !== session.userId) {
      return NextResponse.json({ error: '该宠物不属于当前用户' }, { status: 403 });
    }

    // Verify the place exists
    const place = await prisma.place.findUnique({
      where: { id: placeId },
      select: { id: true },
    });

    if (!place) {
      return NextResponse.json({ error: '地点不存在' }, { status: 404 });
    }

    // Create the review
    const review = await prisma.placeReview.create({
      data: {
        placeId,
        petId,
        rating,
        content: content.trim(),
      },
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
    });

    // Update the place's average rating
    const allRatings = await prisma.placeReview.findMany({
      where: { placeId },
      select: { rating: true },
    });
    const avgRating =
      allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
    await prisma.place.update({
      where: { id: placeId },
      data: { rating: Math.round(avgRating * 10) / 10 },
    });

    return NextResponse.json({
      review: {
        id: review.id,
        rating: review.rating,
        content: review.content,
        createdAt: review.createdAt,
        pet: review.pet,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create review:', error);
    return NextResponse.json({ error: '发布评价失败' }, { status: 500 });
  }
}
