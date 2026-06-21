'use client';

import { useState } from 'react';

export type PhotoCardMode = 'selection' | 'feedback-correct' | 'feedback-incorrect' | 'feedback-missed';

interface QuizPhotoCardProps {
  imageUrl: string;
  label: string;
  reason: string;
  isSelected?: boolean;
  disabled?: boolean;
  mode: PhotoCardMode;
  onToggle?: () => void;
  onImageError?: () => void;
}

export function QuizPhotoCard({ imageUrl, label, reason, isSelected, disabled, mode, onToggle, onImageError }: QuizPhotoCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const isSelection = mode === 'selection';
  const canSelect = isSelection && !disabled && !imageError;

  const borderClasses = isSelection
    ? disabled || imageError
      ? 'border-red-200 bg-red-50 cursor-not-allowed opacity-90'
      : isSelected
      ? 'border-wfd-crimson ring-2 ring-wfd-crimson/20 cursor-pointer'
      : 'border-gray-200 hover:border-gray-300 cursor-pointer'
    : mode === 'feedback-correct'
      ? 'border-wfd-sage ring-2 ring-wfd-sage/20'
      : mode === 'feedback-incorrect'
        ? 'border-red-400 ring-2 ring-red-400/20'
        : 'border-amber-400 ring-2 ring-amber-400/20';

  return (
    <div
      onClick={canSelect ? onToggle : undefined}
      className={`overflow-hidden rounded-xl border-2 bg-white text-left shadow-sm transition-all ${borderClasses}`}
      aria-disabled={isSelection && !canSelect ? true : undefined}
    >
      <div className="aspect-[4/3] relative bg-gray-100">
        {!imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-gray-200" />
            )}
            <img
              src={imageUrl}
              alt={label}
              className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                onImageError?.();
              }}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3">
            <svg className="h-8 w-8 text-wfd-crimson/40 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
            <span className="text-xs font-semibold text-red-700">Image unavailable</span>
            {isSelection && <span className="mt-1 text-[11px] text-red-600">This photo cannot be answered.</span>}
          </div>
        )}

        {isSelection && isSelected && (
          <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-wfd-crimson text-white text-xs font-bold">
            ✓
          </div>
        )}
        {mode === 'feedback-correct' && (
          <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-wfd-sage text-white text-xs font-bold">
            ✓
          </div>
        )}
        {mode === 'feedback-incorrect' && (
          <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
            ✗
          </div>
        )}
        {mode === 'feedback-missed' && (
          <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold">
            !
          </div>
        )}
      </div>

      {!isSelection && (
        <div className="p-3">
          <p className="text-sm font-semibold text-wfd-charcoal">{label}</p>
          <p className="mt-1 text-xs text-gray-500 leading-relaxed">{reason}</p>
        </div>
      )}
    </div>
  );
}
