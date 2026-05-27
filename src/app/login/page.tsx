'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

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
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        {/* Brand Hero */}
        <div className="text-center mb-10">
          <PawPrint className="w-12 h-12 text-coral-500 mx-auto mb-3" />
          <h1 className="text-[28px] font-bold text-ink leading-tight">PetPal</h1>
          <p className="text-[15px] text-ink-faded mt-1">毛孩子的社交乐园</p>
        </div>

        {/* Form Area */}
        <div className="bg-surface-white rounded-[14px] shadow-card p-6 space-y-4">
          {step === 'phone' ? (
            <>
              <div>
                <Input
                  label="手机号"
                  placeholder="请输入11位手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={11}
                  type="tel"
                  inputMode="numeric"
                  error={error.includes('手机') ? error : undefined}
                />
                <p className="mt-1 text-[12px] text-ink-faded">中国大陆手机号（+86）</p>
              </div>
              {error && !error.includes('手机') && (
                <p className="text-[12px] text-danger-500">{error}</p>
              )}
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={sendCode}
                loading={loading}
              >
                获取验证码
              </Button>
            </>
          ) : (
            <>
              <p className="text-[14px] text-ink-muted text-center">
                验证码已发送至{' '}
                <span className="text-ink font-medium">{phone}</span>
              </p>

              <Input
                label="验证码"
                placeholder="请输入 6 位验证码"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                type="text"
                inputMode="numeric"
              />

              {error && (
                <p className="text-[12px] text-danger-500">{error}</p>
              )}

              <label className="flex items-start gap-2 text-[13px] text-ink-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-coral-500"
                />
                <span>
                  已阅读并同意
                  <Link
                    href="/legal/terms"
                    className="text-coral-500 mx-0.5 hover:text-coral-600 transition-colors"
                  >
                    用户协议
                  </Link>
                  和
                  <Link
                    href="/legal/privacy"
                    className="text-coral-500 mx-0.5 hover:text-coral-600 transition-colors"
                  >
                    隐私政策
                  </Link>
                </span>
              </label>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleLogin}
                loading={loading}
              >
                登录
              </Button>

              <button
                type="button"
                disabled={countdown > 0}
                onClick={sendCode}
                className="w-full text-center text-[14px] text-coral-500 hover:text-coral-600
                  disabled:text-ink-faded py-1 transition-colors"
              >
                {countdown > 0 ? `${countdown}s 后重新获取` : '重新获取验证码'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
