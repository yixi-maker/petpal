'use client';

import { useState } from 'react';
import { Modal, Button } from '@/components/ui';
import { Check } from 'lucide-react';

interface IcebreakerModalProps {
  open: boolean;
  onClose: () => void;
  fromPetId: number;
  toPetId: number;
  toPetName: string;
}

const PRESET_MESSAGES = [
  '想和你家毛孩子认识一下',
  '周末要不要一起散步？',
  '我家也喜欢去附近公园',
  '看起来性格很合拍',
  '想了解更多你家宝贝的故事',
  '自定义一句话...',
];

export function IcebreakerModal({ open, onClose, fromPetId, toPetId, toPetName }: IcebreakerModalProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handlePresetClick = (preset: string) => {
    if (preset === '自定义一句话...') {
      setMessage('');
    } else {
      setMessage(preset);
    }
    setError('');
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError('请输入或选择一句打招呼');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/social/friend-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromPetId, toPetId, message: message.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setDone(true);
      } else {
        setError(data.error || '发送失败');
      }
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    setDone(false);
    setError('');
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title={done ? undefined : `向 ${toPetName} 打招呼`}>
      {done ? (
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-teal-500" />
          </div>
          <p className="text-[15px] font-medium text-ink mb-1">已发送，等待对方同意</p>
          <p className="text-[13px] text-ink-muted mb-6">
            对方同意后你们就可以开始聊天了
          </p>
          <Button className="w-full" onClick={handleClose}>关闭</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preset message chips */}
          <div>
            <p className="text-[13px] text-ink-muted mb-3">选择一句开场白</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_MESSAGES.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className={`border rounded-full px-4 py-2 text-[14px] transition-all cursor-pointer
                    ${message === preset || (preset === '自定义一句话...' && message === '')
                      ? 'border-teal-400 text-teal-500 bg-teal-50'
                      : 'border-border text-ink-muted hover:border-teal-400 hover:text-teal-500'
                    }
                    active:bg-teal-50`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Custom input */}
          <div>
            <textarea
              className="w-full px-4 py-2.5 text-sm border border-border rounded-[8px] focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              rows={3}
              value={message}
              onChange={(e) => { setMessage(e.target.value); setError(''); }}
              maxLength={100}
              placeholder="说点什么..."
            />
            <div className="text-xs text-ink-faded text-right mt-1">{message.length}/100</div>
          </div>

          {error && <p className="text-xs text-rose-500">{error}</p>}

          <Button className="w-full" onClick={handleSubmit} loading={loading}>
            发送打招呼
          </Button>
        </div>
      )}
    </Modal>
  );
}
