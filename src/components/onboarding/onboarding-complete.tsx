'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const DEFAULT_TITLE = 'Onboarding Submitted!';
const DEFAULT_BODY_NO_PASSWORD = `Your onboarding has been received.

Use your existing WFD credentials to log in once an administrator approves your account.

If you have questions, contact your instructor.`;

const DEFAULT_BODY_WITH_PASSWORD = (email: string, password: string) => `Welcome to the Winchester Fire Department EMS Student Portal!

We're excited to have you join us and are looking forward to you scheduling ride time with our preceptors.

Your login credentials:
  Username: ${email}
  Password: ${password}

Save these credentials — you will need them to log in once an administrator approves your account.

If you have questions, contact your instructor.`;

interface OnboardingCompleteProps {
  studentId: string;
  password: string | null;
}

export function OnboardingComplete({ studentId, password }: OnboardingCompleteProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const [{ data: student }, { data: template }] = await Promise.all([
        supabase.from('students').select('email').eq('id', studentId).single(),
        supabase.from('message_templates').select('title, body').eq('template_type', 'completion').eq('is_active', true).limit(1),
      ]);

      if (student?.email) setEmail(student.email);
      if (template?.[0]) {
        setTitle(template[0].title);
        setBody(template[0].body);
      } else {
        setTitle(DEFAULT_TITLE);
        setBody(
          password
            ? DEFAULT_BODY_WITH_PASSWORD(student?.email || '', password)
            : DEFAULT_BODY_NO_PASSWORD
        );
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
      <div className="text-gray-700 whitespace-pre-line leading-relaxed mb-4">{body}</div>

      <div className="inline-block p-4 bg-amber-50 border border-amber-200 rounded-lg text-left">
        {password ? (
          <>
            <p className="text-sm font-bold text-amber-900 mb-2">Save your login credentials:</p>
            <p className="text-sm text-amber-800"><strong>Username:</strong> {email}</p>
            <p className="text-sm text-amber-800"><strong>Password:</strong> {password}</p>
            <p className="text-xs text-amber-700 mt-2">You will need these to log in once an administrator approves your account.</p>
          </>
        ) : (
          <>
            <p className="text-sm font-bold text-amber-900 mb-2">Use your existing WFD credentials</p>
            <p className="text-sm text-amber-800">Your account has been linked to your existing WFD login.</p>
            <p className="text-xs text-amber-700 mt-2">Log in with your usual password once an administrator approves your account.</p>
          </>
        )}
      </div>
    </div>
  );
}
