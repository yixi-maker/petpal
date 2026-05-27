'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-surface-white rounded-t-[16px] sm:rounded-[14px] w-full sm:max-w-md
        max-h-[85vh] overflow-y-auto p-5 animate-slide-up shadow-modal">
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[17px] font-semibold text-ink">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 -mr-1 hover:bg-surface-alt rounded-[6px] transition-colors"
              aria-label="关闭"
            >
              <X className="w-[18px] h-[18px] text-ink-faded" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
