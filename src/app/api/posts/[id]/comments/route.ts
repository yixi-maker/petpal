import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { getModerationProvider } from '@/lib/moderation-provider';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const comments = await prisma.comment.findMany({
    where: { postId: Number(id), status: 'ACTIVE' },
    orderBy: { createdAt: 'asc' },
    include: {
      author: {
        select: { id: true, name: true, breed: true, avatar: true, type: true },
      },
    },
  });

  return NextResponse.json({ comments });
}

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
  const { authorPetId, content } = body;

  if (!authorPetId || !content) {
    return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
  }

  if (content.length > 300) {
    return NextResponse.json({ error: '评论不能超过300字' }, { status: 400 });
  }

  // Verify the pet belongs to the user
  const pet = await prisma.pet.findUnique({ where: { id: authorPetId } });
  if (!pet || pet.userId !== session.userId) {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  // Verify the post exists
  const post = await prisma.post.findUnique({ where: { id: Number(id) } });
  if (!post || post.status !== 'ACTIVE') {
    return NextResponse.json({ error: '动态不存在' }, { status: 404 });
  }

  // Content moderation
  const moderation = getModerationProvider();
  const textResult = await moderation.checkText(content);
  let commentStatus = 'ACTIVE';
  let commentModeration = 'APPROVED';

  if (!textResult.approved) {
    commentStatus = 'HIDDEN';
    commentModeration = 'REJECTED';
  }

  const comment = await prisma.comment.create({
    data: {
      postId: Number(id),
      authorPetId,
      content,
      status: commentStatus,
      moderationStatus: commentModeration,
    },
    include: {
      author: {
        select: { id: true, name: true, breed: true, avatar: true, type: true },
      },
    },
  });

  return NextResponse.json({ comment }, { status: 201 });
}
