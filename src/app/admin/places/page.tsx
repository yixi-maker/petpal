'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PlaceItem {
  id: number;
  name: string;
  type: string;
  city: string;
  district: string | null;
  status: string;
  rating: number | null;
  createdAt: string;
}

export default function AdminPlacesPage() {
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPlaces = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('page', String(page));

      const res = await fetch(`/api/admin/places?${params}`);
      if (!res.ok) {
        setError('获取地点列表失败');
        return;
      }
      const data = await res.json();
      setPlaces(data.places);
      setTotalPages(data.pagination.totalPages);
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  const handleAction = async (id: number, action: string) => {
    try {
      const res = await fetch('/api/admin/places', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || '操作失败');
        return;
      }
      fetchPlaces();
    } catch {
      alert('网络错误');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPlaces();
  };

  const typeLabel = (type: string) => {
    const map: Record<string, string> = {
      PET_STORE: '宠物店',
      VET: '宠物医院',
      PARK: '公园',
      CAFE: '宠物咖啡',
      GROOMING: '美容店',
      HOTEL: '宠物酒店',
    };
    return map[type] || type;
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
      <h2 className="text-lg font-semibold">地点管理</h2>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faded" />
          <input
            type="text"
            placeholder="搜索地点名称..."
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
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">名称</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">类型</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">城市</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">评分</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">状态</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">创建时间</th>
                    <th className="text-left px-4 py-3 font-medium text-ink-muted">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {places.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-ink-faded">
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    places.map((place) => (
                      <tr key={place.id} className="hover:bg-surface-alt">
                        <td className="px-4 py-3 font-medium">{place.name}</td>
                        <td className="px-4 py-3 text-ink-muted">{typeLabel(place.type)}</td>
                        <td className="px-4 py-3 text-ink-muted">
                          {place.city}{place.district ? ` ${place.district}` : ''}
                        </td>
                        <td className="px-4 py-3 text-ink-muted">
                          {place.rating !== null ? place.rating.toFixed(1) : '-'}
                        </td>
                        <td className="px-4 py-3">{statusBadge(place.status)}</td>
                        <td className="px-4 py-3 text-ink-muted">
                          {new Date(place.createdAt).toLocaleDateString('zh-CN')}
                        </td>
                        <td className="px-4 py-3">
                          {place.status !== 'HIDDEN' ? (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleAction(place.id, 'HIDE')}
                            >
                              隐藏
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction(place.id, 'RESTORE')}
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
