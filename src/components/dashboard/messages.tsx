'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Message {
  id: string;
  sender: 'student' | 'admin';
  message_text: string;
  created_at: string;
}

interface MessagesProps {
  studentId: string;
}

export function Messages({ studentId }: MessagesProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  useEffect(() => {
    loadMessages();
  }, [studentId]);

  const loadMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    const { data: msg } = await supabase
      .from('messages')
      .insert({
        student_id: studentId,
        sender: 'student',
        message_text: newMessage.trim(),
      })
      .select()
      .single();

    if (msg) {
      setMessages((prev) => [...prev, msg]);
      setNewMessage('');
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
    setLoading(false);
  };

  return (
    <Card className="p-4 flex flex-col h-[500px]">
      <h3 className="font-bold text-wfd-charcoal mb-4">Messages</h3>
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-8">
            No messages yet. Send a message to your administrator.
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-xl text-sm ${
                msg.sender === 'student'
                  ? 'bg-wfd-crimson text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}
            >
              {msg.message_text}
              <div
                className={`text-[10px] mt-1 ${
                  msg.sender === 'student' ? 'text-red-200' : 'text-gray-400'
                }`}
              >
                {new Date(msg.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wfd-crimson outline-none text-sm text-gray-900"
        />
        <Button type="submit" loading={loading} disabled={!newMessage.trim()}>
          Send
        </Button>
      </form>
    </Card>
  );
}
