'use client';

import { Button } from '@/components/ui/button';

interface ReorderButtonsProps {
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function ReorderButtons({ onMoveUp, onMoveDown, canMoveUp, canMoveDown }: ReorderButtonsProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        onClick={onMoveUp}
        disabled={!canMoveUp}
        className="flex items-center justify-center w-6 h-5 rounded text-xs leading-none border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Move up"
      >
        ▲
      </button>
      <button
        type="button"
        onClick={onMoveDown}
        disabled={!canMoveDown}
        className="flex items-center justify-center w-6 h-5 rounded text-xs leading-none border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Move down"
      >
        ▼
      </button>
    </div>
  );
}
