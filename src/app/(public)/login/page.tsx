'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { canAccessAdmin, canAccessPreceptor } from '@/lib/roles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type LoginMessage = {
  type: 'error' | 'warning' | 'success';
  text: string;
  actionLabel?: string;
  actionHref?: string;
};

const REASON_MESSAGES: Record<string, LoginMessage> = {
  expired: {
    type: 'warning',
    text: 'Your access has expired. Please re-register to continue.',
    actionLabel: 'Re-register',
    actionHref: '/onboarding',
  },
  blacklisted: {
    type: 'error',
    text: 'This account has been removed from the WFD EMS Student Portal. If you believe this is an error, contact your class instructor or the WFD EMS Training Division.',
  },
  archived: {
    type: 'warning',
    text: 'Your previous registration has been archived. Please re-register to access the portal.',
    actionLabel: 'Re-register',
    actionHref: '/onboarding?status=archived',
  },
  'account-no-link': {
    type: 'warning',
    text: 'Your login account exists but no student registration is linked. Please complete onboarding.',
    actionLabel: 'Start Onboarding',
    actionHref: '/onboarding',
  },
  'not-registered': {
    type: 'warning',
    text: 'No student registration was found. Please complete onboarding before signing in.',
    actionLabel: 'Start Onboarding',
    actionHref: '/onboarding',
  },
};

export default function LoginPage() {
  const [mode, setMode] = useState<'student' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<LoginMessage | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reason = params.get('reason');
    if (reason && REASON_MESSAGES[reason]) {
      setMessage(REASON_MESSAGES[reason]);
    }
  }, []);

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = createClient();
    const normalizedEmail = email.toLowerCase().trim();

    const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });

    if (error || !data?.user) {
      setMessage({
        type: 'error',
        text: 'Invalid email or password.',
        actionLabel: "Don't have an account? Start Onboarding",
        actionHref: '/onboarding',
      });
      setLoading(false);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    console.log('Auth session before student query:', { hasSession: !!sessionData.session, userId: data.user.id });

    const { data: allStudents } = await supabase
      .from('students')
      .select('id, status, auth_user_id')
      .limit(5);
    console.log('Any students visible to this user:', allStudents);

    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('status, is_blacklisted, auth_user_id')
      .eq('auth_user_id', data.user.id)
      .single();

    console.log('Login student query:', { userId: data.user.id, student: student ? { status: student.status, is_blacklisted: student.is_blacklisted, auth_user_id: student.auth_user_id } : null, error: studentError?.message });

    if (studentError || !student) {
      setMessage(REASON_MESSAGES['account-no-link']);
      setLoading(false);
      return;
    }

    if (student.is_blacklisted) {
      setMessage(REASON_MESSAGES['blacklisted']);
      setLoading(false);
      return;
    }

    if (student.status === 'archived') {
      setMessage(REASON_MESSAGES['archived']);
      setLoading(false);
      return;
    }

    if (student.status === 'expired') {
      setMessage(REASON_MESSAGES['expired']);
      setLoading(false);
      return;
    }

    if (student.status === 'certified' || student.status === 'pending') {
      window.location.href = '/dashboard';
      return;
    }

    setMessage(REASON_MESSAGES['not-registered']);
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Enter your email address to reset your password.' });
      return;
    }
    setLoading(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Check your email for the password reset link.' });
    }
    setLoading(false);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.toLowerCase().trim(), password });

    if (error) {
      setMessage({ type: 'error', text: 'Invalid email or password.' });
      setLoading(false);
      return;
    }

    if (canAccessAdmin(data?.user)) {
      window.location.href = '/admin';
    } else if (canAccessPreceptor(data?.user)) {
      window.location.href = '/preceptor';
    } else {
      await supabase.auth.signOut();
      setMessage({ type: 'error', text: 'This login area is only for admin and preceptor accounts.' });
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-wfd-charcoal font-serif mb-1">Welcome back</h2>
      <p className="text-gray-500 text-sm mb-6">
        Sign in to view your EMS student dashboard and training materials.
      </p>

      <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
        <button
          onClick={() => setMode('student')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            mode === 'student'
              ? 'bg-wfd-crimson text-white shadow'
              : 'text-gray-600 hover:text-wfd-charcoal'
          }`}
        >
          Student
        </button>
        <button
          onClick={() => setMode('admin')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            mode === 'admin'
              ? 'bg-wfd-charcoal text-white shadow'
              : 'text-gray-600 hover:text-wfd-charcoal'
          }`}
        >
          Admin
        </button>
      </div>

      {mode === 'student' ? (
        <form onSubmit={handleStudentLogin}>
          <Input label="Student email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" />
          <div className="mt-4">
            <Input label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="flex items-center justify-end mt-2">
            <button type="button" onClick={handleForgotPassword} className="text-xs text-gray-400 hover:text-wfd-crimson">
              Forgot password?
            </button>
          </div>
          <Button type="submit" loading={loading} className="w-full mt-4">
            Sign In
          </Button>
        </form>
      ) : (
        <form onSubmit={handleAdminLogin}>
          <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@wfd.gov" />
          <div className="mt-4">
            <Input label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="flex items-center justify-end mt-2">
            <button type="button" onClick={handleForgotPassword} className="text-xs text-gray-400 hover:text-wfd-crimson">
              Forgot password?
            </button>
          </div>
          <Button type="submit" variant="secondary" loading={loading} className="w-full mt-4">
            Sign In
          </Button>
        </form>
      )}

      {message && (
        <div
          className={`mt-4 p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-wfd-sage/10 text-wfd-sage border border-wfd-sage/30'
              : message.type === 'warning'
              ? 'bg-wfd-gold/10 text-wfd-gold border border-wfd-gold/30'
              : 'bg-wfd-crimson/10 text-wfd-crimson border border-wfd-crimson/30'
          }`}
        >
          {message.text}
          {message.actionLabel && message.actionHref && (
            <a
              href={message.actionHref}
              className="inline-block mt-2 rounded-lg bg-wfd-crimson text-white px-3 py-1 text-xs font-semibold hover:brightness-90 transition-all"
            >
              {message.actionLabel}
            </a>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mt-6">
        <a
          href="/onboarding"
          className="rounded-lg border border-gray-200 p-3 text-center text-sm hover:border-wfd-crimson/30 transition-colors"
        >
          <span className="block font-semibold text-wfd-charcoal">New student?</span>
          <span className="block text-xs text-gray-500">Request portal access</span>
        </a>
        <a
          href="mailto:jbrown@winchesterky.com"
          className="rounded-lg border border-gray-200 p-3 text-center text-sm hover:border-wfd-crimson/30 transition-colors"
        >
          <span className="block font-semibold text-wfd-charcoal">Need help?</span>
          <span className="block text-xs text-gray-500">Contact EMS staff</span>
        </a>
      </div>
    </div>
  );
}
