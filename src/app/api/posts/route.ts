import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const feedType = searchParams.get('feedType') || 'RECOMMENDED';
  const cursor = searchParams.get('cursor');
  const currentPetId = Number(searchParams.get('currentPetId') || 0);
  const limit = 20;

  const where: Record<string, unknown> = { status: 'ACTIVE' };

  let orderBy: Record<string, string> = {};

  switch (feedType) {
    case 'FOLLOWING': {
      const session = await getSession();
      if (!session.userId) {
        return NextResponse.json({ error: '未登录' }, { status: 401 });
      }
      // Get pets owned by user, then get posts from pets they follow
      const userPets = await prisma.pet.findMany({
        where: { userId: session.userId },
        select: { id: true },
      });
      const petIds = userPets.map((p) => p.id);
      const followingRecords = await prisma.follow.findMany({
        where: { followerPetId: { in: petIds } },
        select: { followingPetId: true },
      });
      const followingPetIds = followingRecords.map((f) => f.followingPetId);
      if (followingPetIds.length === 0) {
        return NextResponse.json({ posts: [] });
      }
      where.authorPetId = { in: followingPetIds };
      orderBy = { createdAt: 'desc' };
      break;
    }
    case 'NEARBY':
      orderBy = { createdAt: 'desc' };
      break;
    case 'RECOMMENDED':
    default:
      // Most liked recent posts - get recent posts and sort by likes
      orderBy = { createdAt: 'desc' };
      break;
  }

  if (cursor) {
    where.id = { lt: Number(cursor) };
  }

  const posts = await prisma.post.findMany({
    where,
    orderBy,
    take: limit + 1,
    include: {
      author: {
        select: { id: true, name: true, breed: true, avatar: true, type: true },
      },
      images: { orderBy: { order: 'asc' } },
      _count: { select: { likes: true, comments: true } },
    },
  });

  const hasMore = posts.length > limit;
  const result = hasMore ? posts.slice(0, limit) : posts;

  // For RECOMMENDED, sort by like count (client-side after fetching recent)
  if (feedType === 'RECOMMENDED') {
    result.sort((a, b) => b._count.likes - a._count.likes);
  }

  const likedPostIds = currentPetId
    ? new Set(
        (
          await prisma.like.findMany({
            where: {
              petId: currentPetId,
              postId: { in: result.map((post) => post.id) },
            },
            select: { postId: true },
          })
        ).map((like) => like.postId)
      )
    : new Set<number>();

  return NextResponse.json({
    posts: result.map((post) => ({
      ...post,
      likedByCurrentPet: likedPostIds.has(post.id),
    })),
    nextCursor: hasMore ? String(result[result.length - 1].id) : null,
  });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const body = await req.json();
  const { authorPetId, content, mediaType, fuzzyLocation, images } = body;

  if (!authorPetId || !content) {
    return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
  }

  if (content.length > 500) {
    return NextResponse.json({ error: '内容不能超过500字' }, { status: 400 });
  }

  // Verify the pet belongs to the user
  const pet = await prisma.pet.findUnique({ where: { id: authorPetId } });
  if (!pet || pet.userId !== session.userId) {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  // Content moderation
  const { getModerationProvider } = await import('@/lib/moderation-provider');
  const moderation = getModerationProvider();
  const textResult = await moderation.checkText(content);
  let moderationStatus = 'APPROVED';
  let postStatus = 'ACTIVE';

  if (!textResult.approved) {
    moderationStatus = 'REJECTED';
    postStatus = 'HIDDEN';
  }

  // Check images if present
  if (textResult.approved && images && images.length > 0) {
    for (const img of images as { url: string; order: number }[]) {
      const imgResult = await moderation.checkImage(img.url);
      if (!imgResult.approved) {
        moderationStatus = 'REJECTED';
        postStatus = 'HIDDEN';
        break;
      }
    }
  }

  const post = await prisma.post.create({
    data: {
      authorPetId,
      content,
      mediaType: mediaType || 'TEXT',
      fuzzyLocation: fuzzyLocation || null,
      status: postStatus,
      moderationStatus,
      images: images && images.length > 0
        ? {
            create: (images as { url: string; order: number }[]).map((img) => ({
              url: img.url,
              order: img.order,
            })),
          }
        : undefined,
    },
    include: {
      author: {
        select: { id: true, name: true, breed: true, avatar: true, type: true },
      },
      images: { orderBy: { order: 'asc' } },
      _count: { select: { likes: true, comments: true } },
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}
