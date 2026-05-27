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
      where.name = { contains: search };
    }

    const [places, total] = await Promise.all([
      prisma.place.findMany({
        where,
        select: {
          id: true,
          name: true,
          type: true,
          city: true,
          district: true,
          status: true,
          rating: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.place.count({ where }),
    ]);

    return NextResponse.json({
      places,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Admin places list error:', error);
    return NextResponse.json({ error: '获取地点列表失败' }, { status: 500 });
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

    const place = await prisma.place.findUnique({ where: { id } });
    if (!place) {
      return NextResponse.json({ error: '地点不存在' }, { status: 404 });
    }

    let newStatus: string;
    let actionType: string;

    if (action === 'HIDE') {
      newStatus = 'HIDDEN';
      actionType = 'HIDE_PLACE';
    } else {
      newStatus = 'ACTIVE';
      actionType = 'RESTORE_PLACE';
    }

    await prisma.place.update({
      where: { id },
      data: { status: newStatus },
    });

    await prisma.adminAction.create({
      data: {
        adminId: session.adminId,
        actionType,
        targetType: 'PLACE',
        targetId: id,
        detail: `将地点 ${place.name} (#${id}) 的状态从 ${place.status} 修改为 ${newStatus}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin place action error:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}
