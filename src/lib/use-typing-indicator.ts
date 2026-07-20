'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

type TypingSender = 'student' | 'admin';

interface TypingEvent {
  type: 'typing' | 'idle';
  sender: TypingSender;
  studentId: string;
}

const EMIT_DEBOUNCE_MS = 500;
const IDLE_TIMEOUT_MS = 3000;
const RECEIVE_TIMEOUT_MS = 4000;

export function useTypingIndicator(
  studentId: string | undefined,
  sender: TypingSender
): {
  isTyping: boolean;
  typingSender: TypingSender | null;
  notifyTyping: () => void;
} {
  const [typingState, setTypingState] = useState<{
    isTyping: boolean;
    sender: TypingSender | null;
  }>({ isTyping: false, sender: null });

  const lastEmitRef = useRef(0);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const receiveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notifyTyping = useCallback(() => {
    if (!studentId) return;
    const now = Date.now();
    if (now - lastEmitRef.current < EMIT_DEBOUNCE_MS) return;
    lastEmitRef.current = now;

    const supabase = createClient();
    const channel = supabase.channel(`typing:${studentId}`);
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'typing',
          payload: { type: 'typing', sender, studentId } as TypingEvent,
        });
        supabase.removeChannel(channel);
      }
    });

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      const idleSupabase = createClient();
      const idleChannel = idleSupabase.channel(`typing:${studentId}`);
      idleChannel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          idleChannel.send({
            type: 'broadcast',
            event: 'typing',
            payload: { type: 'idle', sender, studentId } as TypingEvent,
          });
          idleSupabase.removeChannel(idleChannel);
        }
      });
    }, IDLE_TIMEOUT_MS);
  }, [studentId, sender]);

  useEffect(() => {
    if (!studentId) return;

    const supabase = createClient();
    const channel = supabase.channel(`typing:${studentId}`);

    channel.on('broadcast', { event: 'typing' }, (payload) => {
      const event = payload.payload as TypingEvent;
      if (event.sender === sender) return;

      if (event.type === 'idle') {
        setTypingState({ isTyping: false, sender: null });
        if (receiveTimerRef.current) clearTimeout(receiveTimerRef.current);
        return;
      }

      setTypingState({ isTyping: true, sender: event.sender });

      if (receiveTimerRef.current) clearTimeout(receiveTimerRef.current);
      receiveTimerRef.current = setTimeout(() => {
        setTypingState({ isTyping: false, sender: null });
      }, RECEIVE_TIMEOUT_MS);
    });

    channel.subscribe();

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (receiveTimerRef.current) clearTimeout(receiveTimerRef.current);
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [studentId, sender]);

  return {
    isTyping: typingState.isTyping,
    typingSender: typingState.sender,
    notifyTyping,
  };
}
