'use client';

import { Button } from '@/components/ui/button';

interface ResourceLibraryProps {
  onComplete: () => void;
}

const resources = [
  {
    category: 'Station Maps',
    items: [
      { name: 'Station 1 - Downtown HQ Map', file: '/resources/station-1-map.pdf' },
      { name: 'Station 2 - West Side Map', file: '/resources/station-2-map.pdf' },
      { name: 'Station 3 - Industrial Map', file: '/resources/station-3-map.pdf' },
    ],
  },
  {
    category: 'Departmental SOGs',
    items: [
      { name: 'EMS Operations SOG', file: '/resources/ems-operations-sog.pdf' },
      { name: 'Infection Control SOG', file: '/resources/infection-control-sog.pdf' },
      { name: 'Patient Care Reporting SOG', file: '/resources/patient-care-sog.pdf' },
      { name: 'Safety & PPE SOG', file: '/resources/safety-ppe-sog.pdf' },
    ],
  },
];

export function ResourceLibrary({ onComplete }: ResourceLibraryProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-wfd-charcoal mb-2">Resource Library</h2>
      <p className="text-gray-500 mb-6">
        Download and review these essential documents before your rotation. You&apos;ll be tested on
        this material in the knowledge gate.
      </p>

      <div className="space-y-6 mb-8">
        {resources.map((section) => (
          <div key={section.category}>
            <h3 className="text-sm font-semibold text-wfd-crimson uppercase tracking-wide mb-3">
              {section.category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {section.items.map((item) => (
                <a
                  key={item.file}
                  href={item.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-wfd-crimson hover:bg-red-50 transition-colors group"
                >
                  <svg
                    className="w-8 h-8 text-wfd-crimson group-hover:scale-110 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div>
                    <div className="text-sm font-medium text-wfd-charcoal group-hover:text-wfd-crimson">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-400">PDF Document</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-600">
          <strong className="text-wfd-charcoal">Important:</strong> The knowledge gate quiz will test
          your understanding of station layouts, safety protocols, and department SOGs. Make sure you
          review all documents before proceeding.
        </p>
      </div>

      <Button onClick={onComplete} className="w-full">
        I&apos;ve Reviewed All Documents — Take the Knowledge Gate
      </Button>
    </div>
  );
}
