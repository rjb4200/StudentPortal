'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { canAccessAdmin, canAccessPreceptor } from '@/lib/roles';

export default function LoginPage() {
  const [mode, setMode] = useState<'student' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = createClient();
    const normalizedEmail = email.toLowerCase().trim();
    const { data: students, error: lookupError } = await supabase
      .from('students')
      .select('status, is_blacklisted')
      .ilike('email', normalizedEmail)
      .order('created_at', { ascending: false });

    if (lookupError) {
      setMessage({ type: 'error', text: lookupError.message });
      setLoading(false);
      return;
    }

    if (!students?.length) {
      window.location.href = '/onboarding';
      return;
    }

    if (students.some((student) => student.is_blacklisted)) {
      window.location.href = '/blacklisted';
      return;
    }

    const activeStudent = students.find((student) => student.status === 'pending' || student.status === 'certified');
    if (!activeStudent) {
      const latest = students[0];
      window.location.href = latest.status === 'archived' ? '/onboarding?status=archived' : '/expired';
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });

    if (error) {
      setMessage({ type: 'error', text: 'Invalid email or password.' });
    } else {
      window.location.href = '/dashboard';
    }
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
            <form onSubmit={handleStudentLogin}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wfd-crimson outline-none text-gray-900"
              />
              <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">Password</label>
              <input
                type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wfd-crimson outline-none text-gray-900"
              />
              <button
                type="submit" disabled={loading}
                className="w-full mt-4 bg-wfd-crimson text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              <button
                type="button" onClick={handleForgotPassword}
                className="w-full mt-2 text-xs text-gray-400 hover:text-wfd-crimson"
              >
                Forgot password?
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@wfd.gov"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wfd-charcoal outline-none text-gray-900 mb-4"
              />
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wfd-charcoal outline-none text-gray-900"
              />
              <button
                type="submit" disabled={loading}
                className="w-full mt-4 bg-wfd-charcoal text-white py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              <button
                type="button" onClick={handleForgotPassword}
                className="w-full mt-2 text-xs text-gray-400 hover:text-wfd-crimson"
              >
                Forgot password?
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
