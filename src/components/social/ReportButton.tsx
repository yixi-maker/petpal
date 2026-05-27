'use client';

import { useState } from 'react';
import { Flag, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui';

type TargetType = 'POST' | 'COMMENT' | 'MESSAGE' | 'PET' | 'PLACEREVIEW' | 'PLAYDATE';

interface ReportButtonProps {
  targetType: TargetType;
  targetId: number;
  /** By default shows Flag icon with optional label. Use variant="text" for subtle text link. */
  variant?: 'icon' | 'text';
  className?: string;
}

export function ReportButton({ targetType, targetId, variant = 'icon', className = '' }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const trimmed = reason.trim();
    if (!trimmed || trimmed.length > 500) {
      setError('请填写举报原因（1-500字）');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId, reason: trimmed }),
      });

      if (res.ok) {
        setDone(true);
      } else {
        const data = await res.json();
        setError(data.error || '举报提交失败');
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setReason('');
    setError('');
    setDone(false);
  };

  return (
    <>
      {/* Trigger button */}
      {variant === 'text' ? (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
          className={`text-xs text-gray-400 hover:text-red-500 transition-colors ${className}`}
        >
          举报
        </button>
      ) : (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
          className={`p-1 text-gray-300 hover:text-red-500 transition-colors ${className}`}
          title="举报"
        >
          <Flag className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Modal */}
      <Modal open={open} onClose={handleClose} title={done ? '举报已提交' : '举报'}>
        {done ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600 mb-4">
              感谢您的举报，我们会尽快审核处理。
            </p>
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors"
            >
              关闭
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-3">
              请描述您举报的原因，我们会尽快处理。
            </p>
            <textarea
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition resize-none"
              rows={4}
              maxLength={500}
              placeholder="请填写举报原因（必填，最多500字）"
              value={reason}
              onChange={(e) => { setReason(e.target.value); setError(''); }}
            />
            <div className="flex items-center justify-between mt-2 mb-4">
              {error && <p className="text-xs text-red-500">{error}</p>}
              <span className="text-xs text-gray-400 ml-auto">{reason.length}/500</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleClose}
                className="flex-1 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!reason.trim() || submitting}
                className="flex-1 py-2 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                提交举报
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
