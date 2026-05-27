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

    const where: Record<string, unknown> = { deletedAt: null };
    if (search) {
      where.OR = [
        { phone: { contains: search } },
        { nickname: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          phone: true,
          nickname: true,
          avatar: true,
          status: true,
          createdAt: true,
          _count: { select: { pets: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Admin users list error:', error);
    return NextResponse.json({ error: '获取用户列表失败' }, { status: 500 });
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

    const validActions = ['BAN', 'UNBAN', 'RESTORE'];
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: '无效的操作' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    let newStatus: string;
    let actionType: string;

    switch (action) {
      case 'BAN':
        newStatus = 'BANNED';
        actionType = 'BAN_USER';
        break;
      case 'UNBAN':
      case 'RESTORE':
        newStatus = 'ACTIVE';
        actionType = 'UNBAN_USER';
        break;
      default:
        newStatus = 'ACTIVE';
        actionType = 'UNBAN_USER';
    }

    await prisma.user.update({
      where: { id },
      data: { status: newStatus },
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: session.adminId,
        actionType,
        targetType: 'USER',
        targetId: id,
        detail: `将用户 ${user.nickname || user.phone} 的状态从 ${user.status} 修改为 ${newStatus}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin user action error:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}
