import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const currentPetId = Number(searchParams.get('currentPetId') || 0);
  const post = await prisma.post.findUnique({
    where: { id: Number(id) },
    include: {
      author: {
        select: { id: true, name: true, breed: true, avatar: true, type: true },
      },
      images: { orderBy: { order: 'asc' } },
      _count: { select: { likes: true, comments: true } },
    },
  });

  if (!post || post.status !== 'ACTIVE') {
    return NextResponse.json({ error: '动态不存在' }, { status: 404 });
  }

  const likedByCurrentPet = currentPetId
    ? !!(await prisma.like.findUnique({
        where: {
          postId_petId: {
            postId: post.id,
            petId: currentPetId,
          },
        },
        select: { id: true },
      }))
    : false;

  return NextResponse.json({ post: { ...post, likedByCurrentPet } });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id: Number(id) },
    include: { author: true },
  });

  if (!post) {
    return NextResponse.json({ error: '动态不存在' }, { status: 404 });
  }

  // Only author (via userId) can delete
  if (post.author.userId !== session.userId) {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  // Soft delete
  await prisma.post.update({
    where: { id: Number(id) },
    data: { status: 'DELETED' },
  });

  return NextResponse.json({ success: true });
}
