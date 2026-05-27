'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui';
import { ChatBubble } from '@/components/social/ChatBubble';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';

interface OtherPet {
  id: number;
  name: string;
  type: string;
  avatar: string | null;
}

interface MessageData {
  id: number;
  content: string;
  createdAt: string;
  senderPetId: number;
  sender: {
    id: number;
    name: string;
    avatar: string | null;
  };
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export default function ChatPage() {
  const params = useParams<{ threadId: string }>();
  const threadId = params.threadId;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [otherPet, setOtherPet] = useState<OtherPet | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userPetId, setUserPetId] = useState<number>(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages/${threadId}`);
      if (res.ok) {
        const data = await res.json();
        setOtherPet(data.otherPet);
        setUserPetId(data.userPetId);
        setMessages(data.messages || []);
      } else if (res.status === 403 || res.status === 404) {
        router.replace('/messages');
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [threadId, router]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchMessages();
    }
  }, [authLoading, user, fetchMessages]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/messages/' + threadId)
        .then((res) => res.json())
        .then((data) => {
          if (data.messages) {
            setMessages(data.messages);
            if (data.otherPet) setOtherPet(data.otherPet);
            if (data.userPetId) setUserPetId(data.userPetId);
          }
        })
        .catch(() => {});
    }, 3000);

    return () => clearInterval(interval);
  }, [threadId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !userPetId) return;

    setSending(true);
    try {
      const res = await fetch(`/api/messages/${threadId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderPetId: userPetId,
          content: inputValue.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setInputValue('');
        setError('');
      } else {
        const data = await res.json();
        setError(data.error || '发送失败');
      }
    } catch {
      setError('网络错误');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-6 h-6 text-brand-300 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-1 -ml-1">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        {otherPet && (
          <Link href={`/pets/${otherPet.id}`} className="flex items-center gap-2 flex-1">
            <Avatar src={otherPet.avatar} size="sm" />
            <span className="font-medium text-sm">{otherPet.name}</span>
          </Link>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm mt-20">暂无消息，发送第一条私信吧</div>
        ) : (
          messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              content={msg.content}
              time={formatTime(msg.createdAt)}
              isMine={msg.senderPetId === userPetId}
              messageId={msg.id}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-gray-100 bg-white px-3 py-2">
        {error && (
          <p className="text-xs text-red-500 mb-1 px-1">{error}</p>
        )}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            className="flex-1 px-4 py-2.5 text-sm bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500"
            disabled={sending}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || sending}
            className="w-10 h-10 flex items-center justify-center bg-brand-500 text-white rounded-full hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
