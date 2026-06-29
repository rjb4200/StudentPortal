'use client';

import { useState, type ReactNode } from 'react';

interface DisclosureProps {
  title: string;
  summary?: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}

export function Disclosure({
  title,
  summary,
  defaultOpen = false,
  children,
  className = '',
}: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`border border-gray-200 rounded-lg ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors rounded-t-lg"
      >
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-wfd-charcoal">{title}</span>
          {!open && summary && (
            <span className="ml-2 text-xs text-gray-500 truncate">{summary}</span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-3 border-t border-gray-200">{children}</div>
      </div>
    </div>
  );
}
