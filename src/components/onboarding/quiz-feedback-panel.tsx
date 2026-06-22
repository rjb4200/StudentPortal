'use client';

import { QuizPhotoCard } from './quiz-photo-card';
import { Button } from '@/components/ui/button';

export interface CompliancePhoto {
  id: string;
  label: string;
  imageUrl: string | null;
  optionText: string | null;
  nonCompliant: boolean;
  reason: string;
}

export interface ComplianceRule {
  id: string;
  title: string;
  rule: string;
  instruction: string;
  questionType: 'photo_grid' | 'text_choice';
  photos: CompliancePhoto[];
}

export interface FeedbackCategory {
  missed: string[];
  correct: string[];
  incorrect: string[];
}

interface FeedbackPanelProps {
  photos: CompliancePhoto[];
  questionType: ComplianceRule['questionType'];
  categories: FeedbackCategory;
  attempts: number;
  onReviewRule: () => void;
  onRetry: () => void;
}

export function FeedbackPanel({ photos, questionType, categories, attempts, onReviewRule, onRetry }: FeedbackPanelProps) {
  const missedCount = categories.missed.length;
  const correctCount = categories.correct.length;
  const incorrectCount = categories.incorrect.length;
  const isTextChoice = questionType === 'text_choice';
  const optionNoun = isTextChoice ? 'answer option' : 'photo';
  const optionNounPlural = isTextChoice ? 'answer options' : 'photos';

  const findPhoto = (id: string) => photos.find((p) => p.id === id);
  const renderOption = (photo: CompliancePhoto, mode: 'feedback-missed' | 'feedback-correct' | 'feedback-incorrect') => {
    if (!isTextChoice) {
      return (
        <QuizPhotoCard
          key={photo.id}
          imageUrl={photo.imageUrl ?? ''}
          label={photo.label}
          reason={photo.reason}
          mode={mode}
        />
      );
    }

    const borderClasses = mode === 'feedback-correct'
      ? 'border-wfd-sage ring-2 ring-wfd-sage/20'
      : mode === 'feedback-incorrect'
        ? 'border-red-400 ring-2 ring-red-400/20'
        : 'border-amber-400 ring-2 ring-amber-400/20';
    const badge = mode === 'feedback-correct' ? '✓' : mode === 'feedback-incorrect' ? '✗' : '!';
    const badgeClasses = mode === 'feedback-correct'
      ? 'bg-wfd-sage'
      : mode === 'feedback-incorrect'
        ? 'bg-red-500'
        : 'bg-amber-500';

    return (
      <div key={photo.id} className={`relative rounded-xl border-2 bg-white p-4 text-left shadow-sm ${borderClasses}`}>
        <div className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${badgeClasses}`}>
          {badge}
        </div>
        <p className="pr-8 text-sm font-semibold text-wfd-charcoal">{photo.optionText ?? photo.label}</p>
        <p className="mt-2 text-xs leading-relaxed text-gray-500">{photo.reason}</p>
      </div>
    );
  };

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
              ? `You identified ${correctCount} of ${correctCount + missedCount} correct ${optionNounPlural}. ${missedCount} missed, ${incorrectCount} incorrectly selected.`
              : missedCount > 0
                ? `You identified ${correctCount} of ${correctCount + missedCount} correct ${optionNounPlural}. ${missedCount} were missed.`
                : `${incorrectCount} incorrect ${optionNoun}(s) were selected.`}
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
              return photo ? renderOption(photo, 'feedback-missed') : null;
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
              return photo ? renderOption(photo, 'feedback-correct') : null;
            })}
          </div>
        </div>
      )}

      {incorrectCount > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-500 mb-2">
            Incorrectly selected
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.incorrect.map((id) => {
              const photo = findPhoto(id);
              return photo ? renderOption(photo, 'feedback-incorrect') : null;
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
