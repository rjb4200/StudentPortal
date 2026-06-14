'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
    } else {
      setDone(true);
    }
    setLoading(false);
  };

  if (done) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl">✓</div>
          <h1 className="text-2xl font-bold text-wfd-charcoal mb-2">Password Updated</h1>
          <p className="text-gray-600 mb-4">Your password has been changed.</p>
          <a href="/login" className="text-wfd-crimson hover:underline font-medium">Return to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-wfd-charcoal mb-4">Set New Password</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wfd-crimson outline-none text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wfd-crimson outline-none text-gray-900" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-wfd-crimson text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50">
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
