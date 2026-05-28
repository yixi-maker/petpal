'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { PawPrint } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '登录失败');
        return;
      }

      router.push('/admin/dashboard');
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-alt flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <PawPrint className="w-8 h-8 text-teal-500" />
            <h1 className="text-xl font-bold">PetPal 管理</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="用户名"
              placeholder="请输入管理员用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
            <Input
              label="密码"
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            {error && (
              <div className="bg-rose-50 text-rose-600 text-sm px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              登录
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
