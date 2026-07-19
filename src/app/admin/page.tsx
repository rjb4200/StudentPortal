'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DailyOps } from '@/components/admin/daily-ops';
import { PreceptorAnalytics } from '@/components/admin/preceptor-analytics';
import { MaintenanceArchive } from '@/components/admin/maintenance-archive';
import { RegistryManagement } from '@/components/admin/registry-management';
import { ScheduleCalendar } from '@/components/admin/schedule-calendar';
import { MessagesPage } from '@/components/admin/messages-page';
import { AdminNavigation, type AdminSection } from '@/components/admin/admin-navigation';
import { canAccessAdmin } from '@/lib/roles';

type Tab = AdminSection;

const tabs: Tab[] = ['daily', 'calendar', 'messages', 'registry', 'analytics', 'maintenance'];

function getTabFromLocation() {
  if (typeof window === 'undefined') return 'daily';
  const tab = new URLSearchParams(window.location.search).get('tab');
  return tabs.includes(tab as Tab) ? (tab as Tab) : 'daily';
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('daily');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!canAccessAdmin(data?.user)) {
        window.location.href = '/login';
      }
      setLoading(false);
    });

    setActiveTab(getTabFromLocation());

    function handlePopState() {
      setActiveTab(getTabFromLocation());
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wfd-crimson" />
      </div>
    );
  }

  return (
    <div>
      <AdminNavigation activeSection={activeTab} onSectionSelect={setActiveTab} />

      {activeTab === 'daily' && <DailyOps onNavigateMessages={() => setActiveTab('messages')} />}
      {activeTab === 'calendar' && <ScheduleCalendar />}
      {activeTab === 'messages' && <MessagesPage />}
      {activeTab === 'registry' && <RegistryManagement />}
      {activeTab === 'analytics' && <PreceptorAnalytics />}
      {activeTab === 'maintenance' && <MaintenanceArchive />}
    </div>
  );
}
