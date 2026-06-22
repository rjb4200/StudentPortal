'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { canAccessAdmin } from '@/lib/roles';
import Link from 'next/link';

const pageLinks: { href: string; label: string; note?: string }[] = [
  { href: '/', label: 'Home', note: 'landing page' },
  { href: '/login', label: 'Login' },
  { href: '/onboarding', label: 'Onboarding', note: 'student registration flow' },
  { href: '/dashboard', label: 'Dashboard', note: 'student view (requires auth)' },
  { href: '/admin', label: 'Admin Command Center', note: 'daily ops, analytics, maintenance' },
  { href: '/admin/setup', label: 'Onboarding Setup', note: 'quiz, fields, legal, resources, welcome' },
  { href: '/admin/accounts', label: 'Account Management', note: 'admin, preceptor, student accounts' },
  { href: '/preceptor', label: 'Preceptor Dashboard', note: 'coming soon' },
  { href: '/login?reason=blacklisted', label: 'Login (blacklisted)', note: 'inline message test' },
  { href: '/login?reason=expired', label: 'Login (expired)', note: 'inline message test' },
  { href: '/privacy-policy', label: 'Privacy Policy', note: 'SMS compliance' },
  { href: '/terms-and-conditions', label: 'Terms & Conditions', note: 'SMS compliance' },
  { href: '/reset-password', label: 'Reset Password' },
  { href: '/api/health', label: 'API: Health Check' },
  { href: '/api/cron/sweep', label: 'API: Cron Sweep', note: 'daily 00:00 UTC' },
];

export default function DevPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!canAccessAdmin(data?.user)) {
        window.location.href = '/login';
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wfd-crimson" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin" className="text-sm text-wfd-crimson hover:underline">
          ← Admin Command Center
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-wfd-charcoal mb-1">Dev Navigation</h1>
      <p className="text-sm text-gray-500 mb-6">Temporary page for browsing all routes during development.</p>

      <div className="space-y-2">
        {pageLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:border-wfd-crimson hover:bg-red-50 transition-colors"
          >
            <div>
              <p className="font-semibold text-wfd-charcoal">{link.label}</p>
              <p className="text-xs text-gray-500 font-mono">{link.href}</p>
            </div>
            {link.note && (
              <span className="text-xs text-gray-400 shrink-0 ml-4">{link.note}</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
