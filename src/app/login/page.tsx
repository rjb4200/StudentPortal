'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [mode, setMode] = useState<'student' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = createClient();

    const { data: student } = await supabase
      .from('students')
      .select('status, is_blacklisted')
      .eq('email', email)
      .single();

    if (!student || student.is_blacklisted || student.status === 'expired') {
      window.location.href = '/onboarding?token=WFD_TRAINING_2026';
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Check your email for the magic link!' });
    }
    setLoading(false);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
      setLoading(false);
      return;
    }

    const role = data?.user?.user_metadata?.role;
    if (role === 'preceptor') {
      window.location.href = '/preceptor';
    } else {
      window.location.href = '/admin';
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-wfd-charcoal">Welcome Back</h2>
            <p className="text-gray-500 mt-1">Sign in to your account</p>
          </div>

          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            <button
              onClick={() => setMode('student')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === 'student'
                  ? 'bg-wfd-crimson text-white shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => setMode('admin')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === 'admin'
                  ? 'bg-wfd-charcoal text-white shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Admin
            </button>
          </div>

          {mode === 'student' ? (
            <form onSubmit={handleMagicLink}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wfd-crimson focus:border-transparent outline-none text-gray-900"
              />
              <p className="text-xs text-gray-400 mt-2">
                We&apos;ll send a magic link to your email — no password needed.
              </p>
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-wfd-crimson text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending link...' : 'Send Magic Link'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@wfd.gov"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wfd-charcoal focus:border-transparent outline-none text-gray-900 mb-4"
              />
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wfd-charcoal focus:border-transparent outline-none text-gray-900"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-wfd-charcoal text-white py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {message && (
            <div
              className={`mt-4 p-3 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
