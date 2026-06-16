'use client';

import { Button } from '@/components/ui/button';

interface SaveResumeBannerProps {
  onResume: () => void;
  onStartOver: () => void;
}

export function SaveResumeBanner({ onResume, onStartOver }: SaveResumeBannerProps) {
  return (
    <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
      <p className="text-sm font-semibold text-amber-900 mb-2">
        You have an incomplete onboarding session.
      </p>
      <p className="text-xs text-amber-700 mb-3">
        Would you like to resume where you left off, or start over?
      </p>
      <div className="flex gap-3">
        <Button size="sm" onClick={onResume}>
          Resume
        </Button>
        <Button size="sm" variant="secondary" onClick={onStartOver}>
          Start Over
        </Button>
      </div>
    </div>
  );
}
