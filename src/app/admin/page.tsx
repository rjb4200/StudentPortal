'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DailyOps } from '@/components/admin/daily-ops';
import { PreceptorAnalytics } from '@/components/admin/preceptor-analytics';
import { MaintenanceArchive } from '@/components/admin/maintenance-archive';

type Tab = 'daily' | 'analytics' | 'maintenance';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('daily');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.user_metadata?.role !== 'admin') {
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

  const tabs: { key: Tab; label: string }[] = [
    { key: 'daily', label: 'Daily Operations' },
    { key: 'analytics', label: 'Preceptor Analytics' },
    { key: 'maintenance', label: 'Maintenance & Archive' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-wfd-charcoal mb-6">Admin Command Center</h1>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? 'border-wfd-crimson text-wfd-crimson'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'daily' && <DailyOps />}
      {activeTab === 'analytics' && <PreceptorAnalytics />}
      {activeTab === 'maintenance' && <MaintenanceArchive />}
    </div>
  );
}
