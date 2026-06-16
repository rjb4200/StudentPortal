'use client';

import { QuizPhotoCard } from './quiz-photo-card';
import { Button } from '@/components/ui/button';

export interface CompliancePhoto {
  id: string;
  label: string;
  imageUrl: string;
  nonCompliant: boolean;
  reason: string;
}

export interface ComplianceRule {
  id: string;
  title: string;
  rule: string;
  instruction: string;
  photos: CompliancePhoto[];
}

export interface FeedbackCategory {
  missed: string[];
  correct: string[];
  incorrect: string[];
}

interface FeedbackPanelProps {
  photos: CompliancePhoto[];
  categories: FeedbackCategory;
  attempts: number;
  onReviewRule: () => void;
  onRetry: () => void;
}

export function FeedbackPanel({ photos, categories, attempts, onReviewRule, onRetry }: FeedbackPanelProps) {
  const missedCount = categories.missed.length;
  const correctCount = categories.correct.length;
  const incorrectCount = categories.incorrect.length;

  const findPhoto = (id: string) => photos.find((p) => p.id === id);

  return (
    <div className="rounded-xl border border-red-200 bg-red-50/50 p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 text-sm font-bold">
          ✕
        </div>
        <div>
          <h3 className="text-lg font-bold text-red-800">Review Needed</h3>
          <p className="text-sm text-red-700 mt-0.5">
            {missedCount > 0 && incorrectCount > 0
              ? `You identified ${correctCount} of ${correctCount + missedCount} non-compliant photos. ${missedCount} missed, ${incorrectCount} incorrectly selected.`
              : missedCount > 0
                ? `You identified ${correctCount} of ${correctCount + missedCount} non-compliant photos. ${missedCount} were missed.`
                : `${incorrectCount} compliant photo(s) were incorrectly selected.`}
          </p>
          {attempts >= 3 && (
            <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 inline-block">
              An instructor has been notified and can provide additional guidance.
            </p>
          )}
        </div>
      </div>

      {missedCount > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-600 mb-2">
            Missed (should have been selected)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.missed.map((id) => {
              const photo = findPhoto(id);
              if (!photo) return null;
              return (
                <QuizPhotoCard
                  key={id}
                  imageUrl={photo.imageUrl}
                  label={photo.label}
                  reason={photo.reason}
                  mode="feedback-missed"
                />
              );
            })}
          </div>
        </div>
      )}

      {correctCount > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-wfd-sage mb-2">
            Correctly identified
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.correct.map((id) => {
              const photo = findPhoto(id);
              if (!photo) return null;
              return (
                <QuizPhotoCard
                  key={id}
                  imageUrl={photo.imageUrl}
                  label={photo.label}
                  reason={photo.reason}
                  mode="feedback-correct"
                />
              );
            })}
          </div>
        </div>
      )}

      {incorrectCount > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-500 mb-2">
            Incorrectly selected (these ARE compliant)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.incorrect.map((id) => {
              const photo = findPhoto(id);
              if (!photo) return null;
              return (
                <QuizPhotoCard
                  key={id}
                  imageUrl={photo.imageUrl}
                  label={photo.label}
                  reason={photo.reason}
                  mode="feedback-incorrect"
                />
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-4">
        <Button variant="secondary" onClick={onReviewRule} className="flex-1">
          Review Rule
        </Button>
        <Button onClick={onRetry} className="flex-1">
          Try Again
        </Button>
      </div>
    </div>
  );
}
