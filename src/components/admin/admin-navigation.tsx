'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export type AdminSection = 'daily' | 'calendar' | 'messages' | 'registry' | 'analytics' | 'maintenance';

const primaryItems: { key: AdminSection; label: string; href: string }[] = [
  { key: 'daily', label: 'Daily Operations', href: '/admin?tab=daily' },
  { key: 'calendar', label: 'Calendar', href: '/admin?tab=calendar' },
  { key: 'messages', label: 'Messages', href: '/admin?tab=messages' },
  { key: 'registry', label: 'Registry', href: '/admin?tab=registry' },
  { key: 'maintenance', label: 'Maintenance & Archive', href: '/admin?tab=maintenance' },
];

const secondaryItems = [
  { href: '/admin/setup', label: 'Onboarding Setup', muted: false },
  { href: '/admin/accounts', label: 'Account Management', muted: false },
  { href: '/admin/system', label: 'System Health', muted: false },
  { href: '/admin?tab=analytics', label: 'Preceptor Analytics', muted: false },
  { href: '/admin/dev', label: 'Dev Nav', muted: true },
];

type AdminNavigationProps = {
  activeSection?: AdminSection;
  onSectionSelect?: (section: AdminSection) => void;
  unreadMessageCount?: number;
  printHidden?: boolean;
};

export function AdminNavigation({ activeSection, onSectionSelect, unreadMessageCount, printHidden = false }: AdminNavigationProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSectionSelect(section: AdminSection, href: string) {
    if (!onSectionSelect) return;
    window.history.pushState(null, '', href);
    onSectionSelect(section);
  }

  return (
    <nav className={`mb-6 ${printHidden ? 'print:hidden' : ''}`} aria-label="Admin navigation">
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin" className="text-2xl font-bold text-wfd-charcoal hover:text-wfd-crimson transition-colors">
          Admin Command Center
        </Link>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-wfd-charcoal/10 text-gray-600 text-lg leading-none transition-colors"
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            ≡
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              {secondaryItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-2 text-sm hover:bg-wfd-charcoal/5 ${item.muted ? 'text-gray-400 hover:bg-gray-50' : 'text-gray-700'}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {primaryItems.map((item) => {
          const active = activeSection === item.key;
          const className = `whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
            active
              ? 'border-wfd-crimson text-wfd-crimson'
              : 'border-transparent text-gray-500 hover:text-wfd-charcoal'
          }`;

          if (onSectionSelect) {
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleSectionSelect(item.key, item.href)}
                className={className}
              >
                {item.label}
                {item.key === 'messages' && unreadMessageCount !== undefined && unreadMessageCount > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 rounded-full bg-wfd-crimson px-1.5 text-[11px] font-bold text-white">
                    {unreadMessageCount}
                  </span>
                )}
              </button>
            );
          }

          return (
            <Link key={item.key} href={item.href} className={className}>
              {item.label}
              {item.key === 'messages' && unreadMessageCount !== undefined && unreadMessageCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 rounded-full bg-wfd-crimson px-1.5 text-[11px] font-bold text-white">
                  {unreadMessageCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
