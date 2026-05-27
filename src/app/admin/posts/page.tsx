'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PostItem {
  id: number;
  content: string;
  status: string;
  createdAt: string;
  author: { id: number; name: string; avatar: string | null } | null;
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('page', String(page));

      const res = await fetch(`/api/admin/posts?${params}`);
      if (!res.ok) {
        setError('获取动态列表失败');
        return;
      }
      const data = await res.json();
      setPosts(data.posts);
      setTotalPages(data.pagination.totalPages);
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleAction = async (id: number, action: string) => {
    try {
      const res = await fetch('/api/admin/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || '操作失败');
        return;
      }
      fetchPosts();
    } catch {
      alert('网络错误');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPosts();
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">正常</span>;
      case 'HIDDEN':
        return <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full">已隐藏</span>;
      default:
        return <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">动态管理</h2>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索动态内容..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <Button type="submit" size="sm">搜索</Button>
      </form>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">加载中...</div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">内容</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">发布者</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">状态</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">发布时间</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {posts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-gray-400">
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    posts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 max-w-xs truncate">
                          {post.content}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {post.author?.name || '未知'}
                        </td>
                        <td className="px-4 py-3">{statusBadge(post.status)}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString('zh-CN')}
                        </td>
                        <td className="px-4 py-3">
                          {post.status !== 'HIDDEN' ? (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleAction(post.id, 'HIDE')}
                            >
                              隐藏
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction(post.id, 'RESTORE')}
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
              <span className="text-sm text-gray-500">
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
