'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { subscribeToAdminInbox, subscribeToAdminConversation } from '@/lib/realtime';
import { useTypingIndicator } from '@/lib/use-typing-indicator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, EmptyState } from '@/components/ui';
import { orderMessageThreads, type MessageThread } from '@/lib/message-inbox';

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

export function MessagesPage() {
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageThreads, setMessageThreads] = useState<MessageThread[]>([]);
  const [messageInboxError, setMessageInboxError] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyError, setReplyError] = useState<string | null>(null);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastSendEmail, setBroadcastSendEmail] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const unsubConversationRef = useRef<(() => void) | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { isTyping, typingSender, notifyTyping } = useTypingIndicator(
    activeStudentId ?? undefined,
    'admin'
  );

  const supabase = createClient() as any;
  const unreadCount = messageThreads.filter((t) => t.is_unread).length;
  const orderedThreads = orderMessageThreads(messageThreads);

  useEffect(() => {
    loadInbox();
  }, []);

  useEffect(() => {
    setSubscriptionStatus('connecting');
    const unsub = subscribeToAdminInbox(
      () => {
        loadInbox();
      },
      () => setSubscriptionStatus('error')
    );
    setSubscriptionStatus('connected');
    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    if (unsubConversationRef.current) {
      unsubConversationRef.current();
      unsubConversationRef.current = null;
    }
    if (activeStudentId) {
      setSubscriptionStatus('connecting');
      const unsub = subscribeToAdminConversation(
        activeStudentId,
        (msg) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        },
        () => setSubscriptionStatus('error')
      );
      setSubscriptionStatus('connected');
      unsubConversationRef.current = () => { unsub(); };
    }
    return () => {
      if (unsubConversationRef.current) {
        unsubConversationRef.current();
        unsubConversationRef.current = null;
      }
    };
  }, [activeStudentId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [messages]);

  const loadInbox = async () => {
    const response = await fetch('/api/admin/message-inbox');
    const inbox = await response.json().catch(() => null);
    if (!response.ok) {
      setMessageInboxError(inbox?.error || 'Unable to load student message status.');
      return;
    }
    setMessageThreads(inbox?.threads ?? []);
    setMessageInboxError(null);
  };

  const loadMessages = async (studentId: string) => {
    setActiveStudentId(studentId);
    setReplyError(null);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: true });
    setMessages(data ?? []);

    const thread = messageThreads.find((item) => item.student_id === studentId);
    if (!thread?.is_unread) return;

    const response = await fetch('/api/admin/message-inbox', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId }),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      setReplyError(result?.error || 'Unable to mark this conversation as read.');
      return;
    }
    await loadInbox();
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !activeStudentId) return;
    setReplyError(null);
    const response = await fetch('/api/admin/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: activeStudentId, message: replyText.trim() }),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.message) {
      setReplyError(result?.error || 'Unable to send the reply.');
      return;
    }
    setMessages((prev) => [...prev, result.message]);
    setReplyText('');
  };

  const handleSendBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastBody.trim()) return;
    setBroadcasting(true);
    const { data: students } = await supabase.from('students').select('id').eq('status', 'certified').eq('is_blacklisted', false);
    if (!students || students.length === 0) {
      alert('No certified students to broadcast to.');
      setBroadcasting(false);
      return;
    }
    const { data: broadcast } = await supabase.from('broadcasts').insert({
      title: broadcastTitle.trim(),
      body: broadcastBody.trim(),
      sent_by: 'admin',
    }).select('id').single();
    if (broadcast) {
      await supabase.from('messages').insert(
        students.map((s: any) => ({
          student_id: s.id,
          sender: 'admin' as const,
          message_text: broadcastTitle.trim() + '\n\n' + broadcastBody.trim(),
          broadcast_id: broadcast.id,
        }))
      );
      await supabase.from('broadcasts').update({ recipient_count: students.length }).eq('id', broadcast.id);
      if (broadcastSendEmail) {
        fetch('/api/admin/broadcast-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentIds: students.map((s: any) => s.id), title: broadcastTitle.trim(), body: broadcastBody.trim() }),
        }).catch(() => {});
      }
    }
    setBroadcastTitle(''); setBroadcastBody(''); setBroadcastSendEmail(false); setShowBroadcast(false); setBroadcasting(false);
    await loadInbox();
  };

  return (
    <div>
      <section className="overflow-hidden rounded-2xl border border-wfd-charcoal/15 bg-white shadow-lg">
        <div className="border-b-4 border-wfd-sage bg-wfd-charcoal px-5 py-5 text-white sm:px-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/60">Messages</p>
              <h2 className="mt-1 text-2xl font-black">Student Conversations</h2>
              <p className="mt-1 text-sm text-white/75">
                {unreadCount > 0
                  ? `${unreadCount} conversation${unreadCount === 1 ? '' : 's'} with unread messages`
                  : 'No unread student messages'}
                {subscriptionStatus === 'error' && ' · Live updates disconnected'}
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setShowBroadcast(true)}>
              Broadcast
            </Button>
          </div>
        </div>

        <div className="p-5">
          {messageInboxError ? (
            <Alert tone="danger">{messageInboxError}</Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="md:col-span-1 border-r border-gray-200 pr-3 max-h-[60vh] overflow-y-auto">
                {orderedThreads.length === 0 ? (
                  <EmptyState title="No student messages yet" description="Student conversations will appear here when a message is received." />
                ) : orderedThreads.map((thread) => (
                  <button
                    key={thread.student_id}
                    onClick={() => loadMessages(thread.student_id)}
                    aria-label={`${thread.student_name}${thread.is_unread ? ', unread message' : ''}${thread.needs_reply ? ', needs reply' : ''}`}
                    className={`mb-1 w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      activeStudentId === thread.student_id
                        ? 'bg-wfd-crimson text-white'
                        : thread.is_unread
                          ? 'bg-wfd-crimson/5 font-semibold text-wfd-charcoal hover:bg-wfd-crimson/10'
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate">{thread.student_name}</span>
                      <time className="shrink-0 text-[10px] font-normal opacity-70" dateTime={thread.latest_message_at}>
                        {formatMessageTime(thread.latest_message_at)}
                      </time>
                    </div>
                    <p className="mt-0.5 truncate text-xs font-normal opacity-75">{thread.latest_message_text}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {thread.is_unread && <span className="rounded-full bg-wfd-crimson px-1.5 py-0.5 text-[10px] font-semibold text-white">Unread</span>}
                      {thread.needs_reply && <span className="rounded-full bg-wfd-gold/20 px-1.5 py-0.5 text-[10px] font-semibold text-wfd-charcoal">Needs reply</span>}
                    </div>
                  </button>
                        ))}
                        <div ref={bottomRef} />
                      </div>

              <div className="md:col-span-3">
                {!activeStudentId ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <p className="text-sm">Select a conversation to view messages</p>
                  </div>
                ) : (
                  <div className="flex flex-col h-[60vh]">
                    <div className="flex-1 overflow-y-auto space-y-2 mb-3">
                      {messages.length === 0 ? (
                        <EmptyState title="No messages" description="This conversation has no messages yet." />
                      ) : messages.map((m) => (
                        <div
                          key={m.id}
                          className={`text-sm px-3 py-1.5 rounded-lg max-w-[80%] ${
                            m.sender === 'admin'
                              ? 'bg-wfd-charcoal text-white ml-auto'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {m.message_text}
                          <div className={`text-[10px] mt-1 ${m.sender === 'admin' ? 'text-white/60' : 'text-gray-400'}`}>
                            {formatMessageTime(m.created_at)}
                          </div>
                        </div>
                      ))}
                    </div>
                    {isTyping && typingSender === 'student' && (
                      <p className="text-xs italic text-gray-400 mb-1">
                        {messageThreads.find((t) => t.student_id === activeStudentId)?.student_name ?? 'Student'} is typing...
                      </p>
                    )}
                    {replyError && <div className="mb-2"><Alert tone="danger">{replyError}</Alert></div>}
                    <div className="flex gap-2">
                      <input
                        value={replyText}
                        onChange={(e) => { setReplyText(e.target.value); notifyTyping(); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                        placeholder="Reply..."
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-wfd-charcoal outline-none text-gray-900"
                      />
                      <Button onClick={handleSendReply} disabled={!replyText.trim()}>
                        Send
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {showBroadcast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowBroadcast(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-wfd-charcoal mb-4">Send Broadcast to All Students</h3>
            <div className="space-y-3">
              <Input label="Title" value={broadcastTitle} onChange={(e) => setBroadcastTitle(e.target.value)} />
              <label className="block text-sm font-medium text-gray-700">
                Message
                <textarea value={broadcastBody} onChange={(e) => setBroadcastBody(e.target.value)} className="mt-1 min-h-32 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-wfd-crimson" />
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={broadcastSendEmail}
                  onChange={(e) => setBroadcastSendEmail(e.target.checked)}
                  className="rounded border-gray-300 text-wfd-crimson focus:ring-wfd-crimson"
                />
                Also send by email
              </label>
              <div className="flex gap-2">
                <Button type="button" onClick={handleSendBroadcast} loading={broadcasting}>
                  Send Broadcast
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowBroadcast(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
