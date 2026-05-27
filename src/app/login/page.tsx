'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { PawPrint } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  if (user) {
    router.replace('/');
    return null;
  }

  const sendCode = async () => {
    if (!/^1\d{10}$/.test(phone)) {
      setError('请输入正确的手机号');
      return;
    }
    setError('');
    setLoading(true);
    const res = await fetch('/api/auth/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    if (res.ok) {
      setStep('code');
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) { clearInterval(timer); return 0; }
          return c - 1;
        });
      }, 1000);
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    if (!agreed) { setError('请同意用户协议和隐私政策'); return; }
    setError('');
    setLoading(true);
    const result = await login(phone, code, agreed);
    if (result.error) {
      setError(result.error);
    } else {
      router.push('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-cream">
      <div className="mb-10 text-center">
        <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <PawPrint className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">欢迎来到 PetPal</h1>
        <p className="text-gray-400 text-sm mt-1">毛孩子的社交乐园</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        {step === 'phone' ? (
          <>
            <Input
              label="手机号"
              placeholder="请输入手机号"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={11}
              type="tel"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <Button className="w-full" onClick={sendCode} loading={loading}>
              获取验证码
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500">验证码已发送至 {phone}</p>
            <Input
              label="验证码"
              placeholder="请输入 6 位验证码"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              type="text"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}

            <label className="flex items-start gap-2 text-xs text-gray-500 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 accent-brand-500"
              />
              <span>
                已阅读并同意
                <Link href="/legal/terms" className="text-brand-500 mx-0.5">用户协议</Link>
                和
                <Link href="/legal/privacy" className="text-brand-500 mx-0.5">隐私政策</Link>
              </span>
            </label>

            <Button className="w-full" onClick={handleLogin} loading={loading}>
              登录
            </Button>
            <button
              disabled={countdown > 0}
              onClick={sendCode}
              className="w-full text-center text-sm text-brand-500 disabled:text-gray-300 py-1"
            >
              {countdown > 0 ? `${countdown}s 后重新获取` : '重新获取验证码'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
