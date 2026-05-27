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
    const status = searchParams.get('status') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = 20;

    const where: Record<string, unknown> = {};
    if (status && ['PENDING', 'RESOLVED', 'DISMISSED'].includes(status)) {
      where.status = status;
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        select: {
          id: true,
          targetType: true,
          targetId: true,
          reason: true,
          status: true,
          resolution: true,
          createdAt: true,
          reporter: {
            select: { id: true, phone: true, nickname: true },
          },
          handler: {
            select: { id: true, username: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.report.count({ where }),
    ]);

    return NextResponse.json({
      reports,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Admin reports list error:', error);
    return NextResponse.json({ error: '获取举报列表失败' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session.adminId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { id, action, resolution } = await req.json();

    if (!id || !action) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const validActions = ['RESOLVE', 'DISMISS'];
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: '无效的操作' }, { status: 400 });
    }

    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) {
      return NextResponse.json({ error: '举报不存在' }, { status: 404 });
    }

    if (report.status !== 'PENDING') {
      return NextResponse.json({ error: '该举报已处理' }, { status: 400 });
    }

    let newStatus: string;
    let actionType: string;

    if (action === 'RESOLVE') {
      newStatus = 'RESOLVED';
      actionType = 'RESOLVE_REPORT';
    } else {
      newStatus = 'DISMISSED';
      actionType = 'DISMISS_REPORT';
    }

    await prisma.report.update({
      where: { id },
      data: {
        status: newStatus,
        handlerAdminId: session.adminId,
        resolution: resolution || null,
      },
    });

    await prisma.adminAction.create({
      data: {
        adminId: session.adminId,
        actionType,
        targetType: 'REPORT',
        targetId: id,
        detail: `将举报 #${id} (${report.targetType} #${report.targetId}) 处理为 ${newStatus}${resolution ? `，处理意见：${resolution}` : ''}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin report action error:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}
