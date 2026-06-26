'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DailyOps } from '@/components/admin/daily-ops';
import { PreceptorAnalytics } from '@/components/admin/preceptor-analytics';
import { MaintenanceArchive } from '@/components/admin/maintenance-archive';
import { RegistryManagement } from '@/components/admin/registry-management';
import { canAccessAdmin } from '@/lib/roles';
import Link from 'next/link';

type Tab = 'daily' | 'registry' | 'analytics' | 'maintenance';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('daily');
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!canAccessAdmin(data?.user)) {
        window.location.href = '/login';
      }
      setLoading(false);
    });

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
    { key: 'registry', label: 'Registry' },
    { key: 'analytics', label: 'Preceptor Analytics' },
    { key: 'maintenance', label: 'Maintenance & Archive' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-wfd-charcoal">Admin Command Center</h1>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-wfd-charcoal/10 text-gray-600 text-lg leading-none transition-colors"
            aria-label="Menu"
          >
            ≡
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <Link
                href="/admin/setup"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-wfd-charcoal/5"
                onClick={() => setMenuOpen(false)}
              >
                Onboarding Setup
              </Link>
              <Link
                href="/admin/accounts"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-wfd-charcoal/5"
                onClick={() => setMenuOpen(false)}
              >
                Account Management
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? 'border-wfd-crimson text-wfd-crimson'
                : 'border-transparent text-gray-500 hover:text-wfd-charcoal'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'daily' && <DailyOps />}
      {activeTab === 'registry' && <RegistryManagement />}
      {activeTab === 'analytics' && <PreceptorAnalytics />}
      {activeTab === 'maintenance' && <MaintenanceArchive />}
    </div>
  );
}
