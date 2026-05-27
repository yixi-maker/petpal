import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session.adminId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(todayStart);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const [
      userCount,
      petCount,
      postCount,
      pendingReportCount,
      todayPostCount,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.pet.count(),
      prisma.post.count({ where: { status: 'ACTIVE' } }),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.post.count({
        where: { createdAt: { gte: todayStart } },
      }),
    ]);

    // Get new users for the last 7 days (fetch and group in memory)
    const recentUsersRaw = await prisma.user.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        deletedAt: null,
      },
      select: { createdAt: true },
    });

    // Build a map of date string -> count
    const dayMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayStart);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dayMap[key] = 0;
    }

    for (const row of recentUsersRaw) {
      const key = row.createdAt.toISOString().slice(0, 10);
      if (dayMap[key] !== undefined) {
        dayMap[key]++;
      }
    }

    const recentUsers = Object.entries(dayMap).map(([date, count]) => ({
      date,
      count,
    }));

    return NextResponse.json({
      userCount,
      petCount,
      postCount,
      pendingReportCount,
      todayPostCount,
      recentUsers,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json({ error: '获取数据失败' }, { status: 500 });
  }
}
