'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { canAccessPreceptor } from '@/lib/roles';

export default function PreceptorPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!canAccessPreceptor(data?.user)) {
        window.location.href = '/login';
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wfd-crimson" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto text-center py-16">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-wfd-charcoal/10 text-3xl">
        🚧
      </div>
      <h1 className="text-2xl font-bold text-wfd-charcoal mb-3">Preceptor Dashboard</h1>
      <p className="text-gray-600 mb-4">
        Coming soon. This page will allow you to view your assigned students, evaluations, and schedule.
      </p>
      <p className="text-sm text-gray-400">
        Your account is active and ready. Features are being built.
      </p>
    </div>
  );
}
