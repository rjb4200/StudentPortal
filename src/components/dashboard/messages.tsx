'use client';

import { useState, useEffect, useRef, FormEvent, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { subscribeToStudentMessages } from '@/lib/realtime';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, EmptyState, LoadingState } from '@/components/ui';

interface Message {
  id: string;
  sender: 'student' | 'admin';
  message_text: string;
  created_at: string;
}

interface MessagesProps {
  studentId: string;
  onMessagesRead?: () => void;
}

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  if (isToday) return time;
  if (isYesterday) return `Yesterday ${time}`;

  const daysDiff = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (daysDiff < 7) {
    return `${date.toLocaleDateString('en-US', { weekday: 'short' })} ${time}`;
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + `, ${time}`;
}

export function Messages({ studentId, onMessagesRead }: MessagesProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [failedMessageId, setFailedMessageId] = useState<string | null>(null);
  const [lastReadCursor, setLastReadCursor] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const bottomRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  useEffect(() => {
    loadMessages();
  }, [studentId]);

  useEffect(() => {
    if (!studentId) return;
    setSubscriptionStatus('connecting');
    const unsub = subscribeToStudentMessages(
      studentId,
      (msg) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === (msg.id as string))) return prev;
          return [...prev, msg as unknown as Message];
        });
        scrollToBottom();
        if (msg.sender === 'admin') {
          const createdAt = msg.created_at as string;
          setLastReadCursor((prev) => prev && createdAt > prev ? createdAt : prev);
        }
      },
      () => setSubscriptionStatus('error')
    );
    setSubscriptionStatus('connected');
    return () => {
      unsub();
    };
  }, [studentId]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, []);

  const loadMessages = async () => {
    setInitialLoading(true);
    const [messagesRes, readStateRes] = await Promise.all([
      supabase
        .from('messages')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: true }),
      supabase
        .from('student_message_read_state')
        .select('last_read_admin_message_at')
        .eq('student_id', studentId)
        .maybeSingle(),
    ]);

    if (messagesRes.data) {
      setMessages(messagesRes.data);
      scrollToBottom();
    }

    if (readStateRes.data) {
      setLastReadCursor(readStateRes.data.last_read_admin_message_at);
    }

    setInitialLoading(false);

    // Mark as read
    const response = await fetch('/api/messages/mark-read', { method: 'POST' });
    if (response.ok && onMessagesRead) {
      onMessagesRead();
    }
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: trimmed }),
    });
    const result = await response.json().catch(() => null);
    const msg = result?.message as Message | undefined;

    if (!response.ok || !msg) {
      setError(result?.error || 'Unable to send your message. Please try again.');
      setFailedMessageId(null);
    } else {
      setMessages((prev) => [...prev, msg]);
      setNewMessage('');
      setFailedMessageId(null);
      scrollToBottom();
    }
    setLoading(false);
  };

  const retrySend = async () => {
    if (!newMessage.trim()) return;
    setFailedMessageId(null);
    await handleSend({ preventDefault: () => {} } as FormEvent);
  };

  const isUnreadAdminMessage = (msg: Message) => {
    if (msg.sender !== 'admin') return false;
    if (!lastReadCursor) return true;
    return new Date(msg.created_at) > new Date(lastReadCursor);
  };

  const charCount = newMessage.length;
  const isNearLimit = charCount > 1800;

  return (
    <Card className="p-4 flex flex-col min-h-[60vh] max-h-[calc(100vh-16rem)]">
      <h3 className="font-bold text-wfd-charcoal mb-4">Messages</h3>
      {subscriptionStatus === 'error' && (
        <p className="text-xs text-amber-600 mb-2">Live updates disconnected. New messages will appear when you refresh.</p>
      )}
      {error && <div className="mb-3"><Alert tone="danger">{error}</Alert></div>}

      <div className="flex-1 overflow-y-auto space-y-3 mb-4" role="log" aria-label="Message thread">
        {initialLoading ? (
          <LoadingState label="Loading messages..." />
        ) : messages.length === 0 ? (
          <EmptyState
            title="No messages yet"
            description="Send a message to your administrator."
          />
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-xl text-sm ${
                  msg.sender === 'student'
                    ? 'bg-wfd-crimson text-white rounded-br-sm'
                    : isUnreadAdminMessage(msg)
                      ? 'bg-gray-100 text-gray-800 rounded-bl-sm border-l-[3px] border-l-wfd-crimson pl-1'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}
              >
                {msg.message_text}
                <div
                  className={`text-[10px] mt-1 ${
                    msg.sender === 'student' ? 'text-white/60' : 'text-gray-400'
                  }`}
                  aria-label={`Sent ${formatMessageTime(msg.created_at)}`}
                >
                  {formatMessageTime(msg.created_at)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <p className="text-xs text-gray-400 mb-3">
        Messages are typically answered within 24 hours on business days.
      </p>

      <form onSubmit={handleSend} className="flex gap-2">
        <div className="flex-1 relative">
          <input
            value={newMessage}
            onChange={(e) => { setNewMessage(e.target.value); setFailedMessageId(null); }}
            placeholder="Type a message..."
            maxLength={2000}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wfd-crimson outline-none text-sm text-gray-900"
          />
          {charCount > 0 && (
            <span className={`absolute right-2 -bottom-5 text-[10px] ${isNearLimit ? 'text-wfd-crimson font-semibold' : 'text-gray-400'}`}>
              {charCount}/2000
            </span>
          )}
        </div>
        <Button type="submit" loading={loading} disabled={!newMessage.trim()}>
          Send
        </Button>
      </form>
      {error && newMessage.trim() && (
        <button onClick={retrySend} className="mt-2 text-xs text-wfd-crimson hover:underline self-end">
          Retry send
        </button>
      )}
    </Card>
  );
}
