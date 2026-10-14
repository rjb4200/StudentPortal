'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { subscribeToAdminInbox } from '@/lib/realtime';
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

function getStateFromLocation(): { tab: Tab; student: string | null } {
  if (typeof window === 'undefined') return { tab: 'daily', student: null };
  const params = new URLSearchParams(window.location.search);
  const tab = params.get('tab');
  const student = params.get('student');
  return {
    tab: tabs.includes(tab as Tab) ? (tab as Tab) : 'daily',
    student: student || null,
  };
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('daily');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!canAccessAdmin(data?.user)) {
        window.location.href = '/login';
      }
      setLoading(false);
    });

    const applyLocation = () => {
      const state = getStateFromLocation();
      setActiveTab(state.tab);
      setSelectedStudentId(state.student);
    };

    applyLocation();

    function handlePopState() {
      applyLocation();
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const refreshUnreadCount = () => {
    fetch('/api/admin/message-inbox')
      .then((res) => res.json())
      .then((inbox) => {
        const threads = inbox?.threads ?? [];
        setUnreadMessageCount(threads.filter((t: any) => t.is_unread).length);
      })
      .catch(() => {});
  };

  useEffect(() => {
    refreshUnreadCount();
  }, [activeTab]);

  useEffect(() => {
    const unsub = subscribeToAdminInbox(() => {
      refreshUnreadCount();
    });
    return () => { unsub(); };
  }, []);

  const navigateToMessages = (studentId?: string) => {
    setActiveTab('messages');
    setSelectedStudentId(studentId ?? null);
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    params.set('tab', 'messages');
    if (studentId) params.set('student', studentId);
    else params.delete('student');
    window.history.pushState({}, '', `/admin?${params.toString()}`);
  };

  const handleSelectTab = (tab: Tab) => {
    setActiveTab(tab);
    setSelectedStudentId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wfd-crimson" />
      </div>
    );
  }

  return (
    <div>
      <AdminNavigation activeSection={activeTab} onSectionSelect={handleSelectTab} unreadMessageCount={unreadMessageCount} />

      {activeTab === 'daily' && <DailyOps onNavigateMessages={navigateToMessages} />}
      {activeTab === 'calendar' && <ScheduleCalendar />}
      {activeTab === 'messages' && <MessagesPage selectedStudentId={selectedStudentId} />}
      {activeTab === 'registry' && <RegistryManagement />}
      {activeTab === 'analytics' && <PreceptorAnalytics />}
      {activeTab === 'maintenance' && <MaintenanceArchive />}
    </div>
  );
}
