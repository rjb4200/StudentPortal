'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const DEFAULT_TITLE = 'Onboarding Submitted!';
const DEFAULT_BODY = `Welcome to the Winchester Fire Department EMS Student Portal!

We're excited to have you join us and are looking forward to you scheduling ride time with our preceptors.

📧 Check your email for a magic link to log in. Once an administrator reviews and approves your onboarding, you'll be able to request shifts, subscribe to your calendar, and more.

If you have questions, contact your instructor.`;

export function OnboardingComplete() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from('message_templates')
        .select('title, body')
        .eq('template_type', 'completion')
        .eq('is_active', true)
        .limit(1);

      if (data?.[0]) {
        setTitle(data[0].title);
        setBody(data[0].body);
      } else {
        setTitle(DEFAULT_TITLE);
        setBody(DEFAULT_BODY);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl">
        ✓
      </div>
      <h2 className="mb-2 text-xl font-bold text-wfd-crimson">{title}</h2>
      <div className="text-gray-700 whitespace-pre-line leading-relaxed">{body}</div>
    </div>
  );
}
