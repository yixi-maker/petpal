import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';

const VALID_TARGET_TYPES = ['POST', 'COMMENT', 'MESSAGE', 'PET', 'PLACEREVIEW', 'PLAYDATE'];

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const { targetType, targetId, reason } = body;

    // Validate targetType
    if (!targetType || !VALID_TARGET_TYPES.includes(targetType)) {
      return NextResponse.json({ error: '无效的举报类型' }, { status: 400 });
    }

    // Validate targetId
    if (!targetId || typeof targetId !== 'number') {
      return NextResponse.json({ error: '无效的举报目标' }, { status: 400 });
    }

    // Validate reason
    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      return NextResponse.json({ error: '请填写举报原因' }, { status: 400 });
    }
    if (reason.length > 500) {
      return NextResponse.json({ error: '举报原因不能超过500字' }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        reporterId: session.userId,
        targetType,
        targetId,
        reason: reason.trim(),
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json({ error: '举报提交失败，请重试' }, { status: 500 });
  }
}
