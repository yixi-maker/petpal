'use client';

interface ChatBubbleProps {
  content: string;
  time: string;
  isMine: boolean;
}

export function ChatBubble({ content, time, isMine }: ChatBubbleProps) {
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[75%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isMine
              ? 'bg-brand-500 text-white rounded-2xl rounded-br-md'
              : 'bg-gray-100 text-gray-800 rounded-2xl rounded-bl-md'
          }`}
        >
          {content}
        </div>
        <span className="text-[10px] text-gray-400 mt-1 px-1">{time}</span>
      </div>
    </div>
  );
}
