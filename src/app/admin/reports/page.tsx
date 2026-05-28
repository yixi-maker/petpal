'use client';

import { useEffect, useState, useCallback } from 'react';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface ReportItem {
  id: number;
  targetType: string;
  targetId: number;
  reason: string;
  status: string;
  resolution: string | null;
  createdAt: string;
  reporter: { id: number; phone: string; nickname: string | null } | null;
  handler: { id: number; username: string } | null;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [currentReport, setCurrentReport] = useState<ReportItem | null>(null);
  const [currentAction, setCurrentAction] = useState<'RESOLVE' | 'DISMISS' | null>(null);
  const [resolution, setResolution] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      params.set('page', String(page));

      const res = await fetch(`/api/admin/reports?${params}`);
      if (!res.ok) {
        setError('获取举报列表失败');
        return;
      }
      const data = await res.json();
      setReports(data.reports);
      setTotalPages(data.pagination.totalPages);
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const openActionModal = (report: ReportItem, action: 'RESOLVE' | 'DISMISS') => {
    setCurrentReport(report);
    setCurrentAction(action);
    setResolution('');
    setModalOpen(true);
  };

  const handleAction = async () => {
    if (!currentReport || !currentAction) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentReport.id, action: currentAction, resolution }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || '操作失败');
        return;
      }
      setModalOpen(false);
      fetchReports();
    } catch {
      alert('网络错误');
    } finally {
      setActionLoading(false);
    }
  };

  const targetTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      POST: '动态',
      COMMENT: '评论',
      USER: '用户',
      PET: '宠物',
      PLACE: '地点',
    };
    return map[type] || type;
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-0.5 text-xs bg-teal-100 text-teal-700 rounded-full">待处理</span>;
      case 'RESOLVED':
        return <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">已处理</span>;
      case 'DISMISSED':
        return <span className="px-2 py-0.5 text-xs bg-surface-alt text-ink-muted rounded-full">已驳回</span>;
      default:
        return <span className="px-2 py-0.5 text-xs bg-surface-alt text-ink-muted rounded-full">{status}</span>;
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">举报管理</h2>

      {/* Status filter */}
      <div className="flex gap-2">
        {['', 'PENDING', 'RESOLVED', 'DISMISSED'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
              statusFilter === s
                ? 'bg-teal-500 text-white'
                : 'bg-surface-alt text-ink-muted hover:bg-surface-alt'
            }`}
          >
            {s === '' ? '全部' : s === 'PENDING' ? '待处理' : s === 'RESOLVED' ? '已处理' : '已驳回'}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-600 text-sm px-3 py-2 rounded-lg">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-10 text-ink-faded text-sm">加载中...</div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-alt border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">举报人</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">目标类型</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">目标ID</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">原因</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">状态</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">处理人</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">时间</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-ink-faded">
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    reports.map((report) => (
                      <tr key={report.id} className="hover:bg-surface-alt">
                        <td className="px-4 py-3 text-ink-muted">
                          {report.reporter?.nickname || report.reporter?.phone || '未知'}
                        </td>
                        <td className="px-4 py-3">{targetTypeLabel(report.targetType)}</td>
                        <td className="px-4 py-3 text-ink-muted">#{report.targetId}</td>
                        <td className="px-4 py-3 max-w-[150px] truncate text-ink-muted">
                          {report.reason}
                        </td>
                        <td className="px-4 py-3">{statusBadge(report.status)}</td>
                        <td className="px-4 py-3 text-ink-muted">
                          {report.handler?.username || '-'}
                        </td>
                        <td className="px-4 py-3 text-ink-muted">
                          {new Date(report.createdAt).toLocaleDateString('zh-CN')}
                        </td>
                        <td className="px-4 py-3">
                          {report.status === 'PENDING' ? (
                            <div className="flex gap-1">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => openActionModal(report, 'RESOLVE')}
                              >
                                处理
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openActionModal(report, 'DISMISS')}
                              >
                                驳回
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-ink-faded">
                              {report.resolution ? report.resolution.slice(0, 20) : '无'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                上一页
              </Button>
              <span className="text-sm text-ink-muted">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                下一页
              </Button>
            </div>
          )}
        </>
      )}

      {/* Action Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={currentAction === 'RESOLVE' ? '处理举报' : '驳回举报'}
      >
        <div className="space-y-4">
          {currentReport && (
            <div className="text-sm space-y-2">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-teal-500" aria-label="举报" />
                <span>举报 #{currentReport.id}</span>
              </div>
              <p className="text-ink-muted bg-surface-alt p-2 rounded-lg">
                {currentReport.reason}
              </p>
            </div>
          )}

          {currentAction === 'RESOLVE' && (
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                处理意见
              </label>
              <textarea
                className="w-full px-3 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                rows={3}
                placeholder="请输入处理意见（选填）"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
              />
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
              取消
            </Button>
            <Button
              variant={currentAction === 'RESOLVE' ? 'primary' : 'danger'}
              size="sm"
              loading={actionLoading}
              onClick={handleAction}
            >
              {currentAction === 'RESOLVE' ? '确认处理' : '确认驳回'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
