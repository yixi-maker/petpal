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
  const body = await req.json();
  const { petId } = body;

  if (!petId) {
    return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
  }

  // Verify the pet belongs to the user
  const pet = await prisma.pet.findUnique({ where: { id: petId } });
  if (!pet || pet.userId !== session.userId) {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  // Verify the post exists
  const post = await prisma.post.findUnique({ where: { id: Number(id) } });
  if (!post || post.status !== 'ACTIVE') {
    return NextResponse.json({ error: '动态不存在' }, { status: 404 });
  }

  // Check if already liked
  const existing = await prisma.like.findUnique({
    where: { postId_petId: { postId: Number(id), petId } },
  });

  let liked: boolean;
  if (existing) {
    // Unlike
    await prisma.like.delete({ where: { id: existing.id } });
    liked = false;
  } else {
    // Like
    await prisma.like.create({
      data: { postId: Number(id), petId },
    });
    liked = true;
  }

  const likeCount = await prisma.like.count({
    where: { postId: Number(id) },
  });

  return NextResponse.json({ liked, likeCount });
}
