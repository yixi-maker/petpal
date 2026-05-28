'use client';

import { ReportButton } from '@/components/social/ReportButton';

interface ChatBubbleProps {
  content: string;
  time: string;
  isMine: boolean;
  messageId?: number;
}

export function ChatBubble({ content, time, isMine, messageId }: ChatBubbleProps) {
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[75%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isMine
              ? 'bg-teal-500 text-white rounded-2xl rounded-br-md'
              : 'bg-surface-alt text-ink rounded-2xl rounded-bl-md'
          }`}
        >
          {content}
        </div>
        <div className="flex items-center gap-1 mt-1 px-1">
          <span className="text-[10px] text-ink-faded">{time}</span>
          {messageId && <ReportButton targetType="MESSAGE" targetId={messageId} />}
        </div>
      </div>
    </div>
  );
}
