'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

const WFD_LOGO = 'https://ejjsahtohaydoogtilgp.supabase.co/storage/v1/object/public/branding/wfd-logo-1848.jpg';

type PageState = 'loading' | 'form' | 'success' | 'expired';

function passwordTips(password: string) {
  return [
    { met: password.length >= 8, label: 'At least 8 characters' },
    { met: /[A-Z]/.test(password), label: 'Include an uppercase letter' },
    { met: /[0-9]/.test(password), label: 'Include a number' },
  ];
}

export default function ResetPasswordPage() {
  const [pageState, setPageState] = useState<PageState>('loading');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setPageState(session ? 'form' : 'expired');
    });
  }, []);

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
      setPageState('success');
    }
    setLoading(false);
  };

  const tips = passwordTips(password);

  if (pageState === 'loading') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-wfd-crimson border-t-transparent rounded-full" />
      </div>
    );
  }

  if (pageState === 'expired') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center">
            <img src={WFD_LOGO} alt="WFD" className="h-16 w-auto mx-auto mb-4 rounded" />
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-wfd-gold/15 text-2xl">&#9888;</div>
            <h1 className="text-xl font-bold text-wfd-charcoal mb-2">Reset Link Expired or Invalid</h1>
            <p className="text-sm text-gray-500 mb-6">
              This password reset link has expired or is no longer valid.
              Reset links are valid for one use and expire after 1 hour.
            </p>
            <Button className="w-full mb-2" onClick={() => { window.location.href = '/login'; }}>
              Request New Link
            </Button>
            <a href="/login" className="text-sm text-gray-400 hover:text-wfd-crimson">
              Return to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (pageState === 'success') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center">
            <img src={WFD_LOGO} alt="WFD" className="h-16 w-auto mx-auto mb-4 rounded" />
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-wfd-sage/15 text-2xl">&#10003;</div>
            <h1 className="text-xl font-bold text-wfd-charcoal mb-2">Password Updated</h1>
            <div className="bg-wfd-sage/10 text-wfd-sage border border-wfd-sage/30 rounded-lg p-3 mb-6 text-sm">
              Your password has been changed successfully.
            </div>
            <a href="/login">
              <Button className="w-full">Return to Login</Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          <img src={WFD_LOGO} alt="WFD" className="h-16 w-auto mx-auto mb-4 rounded" />

          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-wfd-charcoal">Reset Your Password</h1>
            <p className="text-sm text-gray-500 mt-1">Choose a new password for your EMS Student Portal account.</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-6">
            <p className="text-xs font-medium text-gray-500 mb-2">Password Tips</p>
            {tips.map((tip) => (
              <div key={tip.label} className="flex items-center gap-2 text-xs mb-1 last:mb-0">
                <span className={tip.met ? 'text-wfd-sage' : 'text-gray-300'}>
                  {tip.met ? '\u2713' : '\u25FB'}
                </span>
                <span className={tip.met ? 'text-wfd-sage' : 'text-gray-400'}>{tip.label}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full px-4 py-2 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wfd-crimson focus:border-transparent outline-none text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-wfd-charcoal"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                  className="w-full px-4 py-2 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wfd-crimson focus:border-transparent outline-none text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-wfd-charcoal"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-wfd-crimson/10 text-wfd-crimson border border-wfd-crimson/30 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full">
              Update Password
            </Button>

            <div className="text-center">
              <a href="/login" className="text-xs text-gray-400 hover:text-wfd-crimson">
                Return to Login
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
