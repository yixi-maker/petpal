'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CommentItem {
  id: number;
  content: string;
  status: string;
  createdAt: string;
  postId: number;
  post: { id: number; content: string } | null;
  author: { id: number; name: string; avatar: string | null } | null;
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('page', String(page));

      const res = await fetch(`/api/admin/comments?${params}`);
      if (!res.ok) {
        setError('获取评论列表失败');
        return;
      }
      const data = await res.json();
      setComments(data.comments);
      setTotalPages(data.pagination.totalPages);
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleAction = async (id: number, action: string) => {
    try {
      const res = await fetch('/api/admin/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || '操作失败');
        return;
      }
      fetchComments();
    } catch {
      alert('网络错误');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchComments();
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">正常</span>;
      case 'HIDDEN':
        return <span className="px-2 py-0.5 text-xs bg-teal-100 text-teal-700 rounded-full">已隐藏</span>;
      default:
        return <span className="px-2 py-0.5 text-xs bg-surface-alt text-ink-muted rounded-full">{status}</span>;
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">评论管理</h2>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faded" />
          <input
            type="text"
            placeholder="搜索评论内容..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <Button type="submit" size="sm">搜索</Button>
      </form>

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
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">内容</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">评论者</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">所属动态</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">状态</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">时间</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {comments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-ink-faded">
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    comments.map((comment) => (
                      <tr key={comment.id} className="hover:bg-surface-alt">
                        <td className="px-4 py-3 max-w-xs truncate">
                          {comment.content}
                        </td>
                        <td className="px-4 py-3 text-ink-muted">
                          {comment.author?.name || '未知'}
                        </td>
                        <td className="px-4 py-3 text-ink-muted max-w-[150px] truncate">
                          {comment.post?.content ? comment.post.content.slice(0, 30) + '...' : '动态 #' + comment.postId}
                        </td>
                        <td className="px-4 py-3">{statusBadge(comment.status)}</td>
                        <td className="px-4 py-3 text-ink-muted">
                          {new Date(comment.createdAt).toLocaleDateString('zh-CN')}
                        </td>
                        <td className="px-4 py-3">
                          {comment.status !== 'HIDDEN' ? (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleAction(comment.id, 'HIDE')}
                            >
                              隐藏
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction(comment.id, 'RESTORE')}
                            >
                              恢复
                            </Button>
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
    </div>
  );
}
