'use client';

import { useState } from 'react';
import { Modal, Button } from '@/components/ui';

interface FriendRequestModalProps {
  open: boolean;
  onClose: () => void;
  fromPetId: number;
  toPetId: number;
  toPetName: string;
}

export function FriendRequestModal({ open, onClose, fromPetId, toPetId, toPetName }: FriendRequestModalProps) {
  const [message, setMessage] = useState('你好呀，交个朋友吧~');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/social/friend-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromPetId, toPetId, message }),
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
    setMessage('你好呀，交个朋友吧~');
    setDone(false);
    setError('');
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title={done ? '已发送' : `向 ${toPetName} 打招呼`}>
      {done ? (
        <div className="text-center py-4">
          <div className="text-4xl mb-2">🐾</div>
          <p className="text-sm text-ink-muted">打招呼已发送，等待对方回应</p>
          <Button className="mt-4 w-full" onClick={handleClose}>知道了</Button>
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            className="w-full px-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={100}
            placeholder="说点什么吧..."
          />
          <div className="text-xs text-ink-faded text-right">{message.length}/100</div>
          {error && <p className="text-xs text-rose-500">{error}</p>}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleClose}>取消</Button>
            <Button className="flex-1" onClick={handleSubmit} loading={loading}>发送</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
