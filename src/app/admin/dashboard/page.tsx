'use client';

import { useEffect, useState } from 'react';
import { Users, PawPrint, MessageSquareText, Flag, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';

interface DashboardData {
  userCount: number;
  petCount: number;
  postCount: number;
  pendingReportCount: number;
  todayPostCount: number;
  recentUsers: { date: string; count: number }[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/admin/dashboard');
        if (!res.ok) {
          setError('获取数据失败');
          return;
        }
        const json = await res.json();
        setData(json);
      } catch {
        setError('网络错误');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-ink-faded text-sm">加载中...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 text-rose-600 text-sm px-4 py-3 rounded-xl">
        {error || '数据加载失败'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">仪表板</h2>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          value={data.userCount}
          label="用户总数"
          color="blue"
        />
        <StatCard
          icon={<PawPrint className="w-5 h-5" />}
          value={data.petCount}
          label="宠物总数"
          color="green"
        />
        <StatCard
          icon={<MessageSquareText className="w-5 h-5" />}
          value={data.postCount}
          label="动态总数"
          color="teal"
        />
        <StatCard
          icon={<Flag className="w-5 h-5" aria-label="举报" />}
          value={data.pendingReportCount}
          label="待处理举报"
          color="rose"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          value={data.todayPostCount}
          label="今日新增动态"
          color="teal"
        />
      </div>

      {/* Recent users chart */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h3 className="text-sm font-semibold text-ink mb-4">近7天新增用户</h3>
        <div className="flex items-end gap-2 h-32">
          {data.recentUsers.map((item) => {
            const maxCount = Math.max(...data.recentUsers.map((d) => d.count), 1);
            const height = (item.count / maxCount) * 100;
            return (
              <div key={item.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-medium text-ink-muted">{item.count}</span>
                <div
                  className="w-full bg-teal-200 rounded-t"
                  style={{ height: `${Math.max(height, 2)}%` }}
                />
                <span className="text-[10px] text-ink-faded">
                  {item.date.slice(5)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
