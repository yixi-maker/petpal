import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session.adminId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = 20;

    const where: Record<string, unknown> = {};
    if (search) {
      where.content = { contains: search };
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        select: {
          id: true,
          content: true,
          status: true,
          createdAt: true,
          postId: true,
          post: {
            select: { id: true, content: true },
          },
          author: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.comment.count({ where }),
    ]);

    return NextResponse.json({
      comments,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Admin comments list error:', error);
    return NextResponse.json({ error: '获取评论列表失败' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session.adminId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { id, action } = await req.json();

    if (!id || !action) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const validActions = ['HIDE', 'RESTORE'];
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: '无效的操作' }, { status: 400 });
    }

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      return NextResponse.json({ error: '评论不存在' }, { status: 404 });
    }

    let newStatus: string;
    let actionType: string;

    if (action === 'HIDE') {
      newStatus = 'HIDDEN';
      actionType = 'HIDE_COMMENT';
    } else {
      newStatus = 'ACTIVE';
      actionType = 'RESTORE_COMMENT';
    }

    await prisma.comment.update({
      where: { id },
      data: { status: newStatus },
    });

    await prisma.adminAction.create({
      data: {
        adminId: session.adminId,
        actionType,
        targetType: 'COMMENT',
        targetId: id,
        detail: `将评论 #${id} 的状态从 ${comment.status} 修改为 ${newStatus}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin comment action error:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}
