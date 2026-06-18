'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { QuizHeader } from './quiz-header';
import { QuizPhotoCard } from './quiz-photo-card';
import { FeedbackPanel } from './quiz-feedback-panel';
import type { CompliancePhoto, ComplianceRule, FeedbackCategory } from './quiz-feedback-panel';

type Mode = 'rule' | 'question' | 'feedback' | 'success' | 'complete';

interface KnowledgeGateProps {
  studentId: string;
  onComplete: (password: string | null, email: string, isNewAccount: boolean) => void;
  onBack?: () => void;
  helpEmail?: string;
}

export function KnowledgeGate({ studentId, onComplete, onBack, helpEmail }: KnowledgeGateProps) {
  const [rules, setRules] = useState<ComplianceRule[]>([]);
  const [loadingRules, setLoadingRules] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [ruleIndex, setRuleIndex] = useState(0);
  const [mode, setMode] = useState<Mode>('rule');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [ruleAttempts, setRuleAttempts] = useState(0);
  const [certifying, setCertifying] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [slideDir, setSlideDir] = useState<'left' | 'right' | 'up'>('right');

  useEffect(() => {
    async function loadRules() {
      setLoadingRules(true);
      setLoadError(null);

      const supabase = createClient();
      const { data: ruleData, error: ruleError } = await supabase
        .from('quiz_rules')
        .select('id, title, rule_text, instruction, sort_order')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (ruleError) {
        setLoadError(ruleError.message);
        setLoadingRules(false);
        return;
      }

      const ruleIds = (ruleData ?? []).map((rule) => rule.id);
      if (ruleIds.length === 0) {
        setRules([]);
        setLoadingRules(false);
        return;
      }

      const { data: photoData, error: photoError } = await supabase
        .from('quiz_photos')
        .select('id, rule_id, label, image_url, is_non_compliant, reason, sort_order')
        .in('rule_id', ruleIds)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (photoError) {
        setLoadError(photoError.message);
        setLoadingRules(false);
        return;
      }

      const loadedRules = (ruleData ?? [])
        .map((rule) => ({
          id: rule.id,
          title: rule.title,
          rule: rule.rule_text,
          instruction: rule.instruction,
          photos: (photoData ?? [])
            .filter((photo) => photo.rule_id === rule.id)
            .sort((a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label))
            .map((photo) => ({
              id: photo.id,
              label: photo.label,
              imageUrl: photo.image_url,
              nonCompliant: photo.is_non_compliant,
              reason: photo.reason,
            })),
        }))
        .filter((rule) => rule.photos.length >= 4 && rule.photos.length <= 6);

      setRules(loadedRules);
      setRuleIndex(0);
      setMode('rule');
      setSelected(new Set());
      setRuleAttempts(0);
      setLoadingRules(false);
    }

    loadRules();
  }, []);

  const currentRule = rules[ruleIndex];
  const progressStep = mode === 'complete' ? rules.length : ruleIndex + 1;

  const changeMode = useCallback((newMode: Mode, dir: 'left' | 'right' | 'up' = 'right') => {
    setSlideDir(dir);
    setTransitioning(true);
    setTimeout(() => {
      setMode(newMode);
      setTransitioning(false);
    }, 150);
  }, []);

  const togglePhoto = (photoId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      return next;
    });
  };

  const submitAnswer = () => {
    if (!currentRule) return;

    const correctIds = currentRule.photos
      .filter((photo) => photo.nonCompliant)
      .map((photo) => photo.id)
      .sort();
    const selectedIds = Array.from(selected).sort();
    const passed =
      correctIds.length === selectedIds.length &&
      correctIds.every((id, index) => id === selectedIds[index]);

    if (!passed) {
      setRuleAttempts((value) => value + 1);
      changeMode('feedback', 'up');
      return;
    }

    const attempts = ruleAttempts;
    setSelected(new Set());

    if (attempts >= 3) {
      fetch('/api/quiz/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, ruleId: currentRule.id }),
      }).catch(() => {});
    }

    setMode('success');
    setTimeout(() => {
      if (ruleIndex === rules.length - 1) {
        setMode('complete');
      } else {
        setRuleIndex((value) => value + 1);
        setRuleAttempts(0);
        changeMode('rule', 'right');
      }
    }, 1500);
  };

  const handleComplete = async () => {
    setCertifying(true);
    setCompleteError(null);

    let password: string | null = null;
    let email = '';
    let isNew = false;
    try {
      const res = await fetch('/api/notify/onboarding-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Onboarding completion failed. Please try again.');
      }
      password = data.password ?? null;
      email = data.email ?? '';
      isNew = data.isNewAccount ?? false;
    } catch (e) {
      setCompleteError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
      setCertifying(false);
      return;
    }

    setCertifying(false);
    onComplete(password, email, isNew);
  };

  const getFeedbackCategories = (): FeedbackCategory => {
    if (!currentRule) return { missed: [], correct: [], incorrect: [] };

    const nonCompliantIds = currentRule.photos
      .filter((p) => p.nonCompliant)
      .map((p) => p.id);

    const correct = nonCompliantIds.filter((id) => selected.has(id));
    const missed = nonCompliantIds.filter((id) => !selected.has(id));
    const incorrect = Array.from(selected).filter((id) => !nonCompliantIds.includes(id));

    return { missed, correct, incorrect };
  };

  const slideClasses = transitioning
    ? 'opacity-0 ' + (slideDir === 'left' ? '-translate-x-4' : slideDir === 'right' ? 'translate-x-4' : 'translate-y-4')
    : 'opacity-100 translate-x-0 translate-y-0';

  if (loadingRules) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-center">
        <h2 className="mb-2 text-xl font-bold text-wfd-charcoal pb-2 border-b-2 border-wfd-crimson">Policy and Protocol Review</h2>
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-wfd-crimson" />
          <p className="text-sm text-gray-600">Loading onboarding quiz...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <h2 className="mb-2 text-xl font-bold text-red-800 pb-2 border-b-2 border-red-300">Policy and Protocol Review Unavailable</h2>
        <p className="text-sm text-red-700">{loadError}</p>
      </div>
    );
  }

  if (rules.length === 0 || !currentRule) {
    return (
      <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">
        <h2 className="mb-2 text-xl font-bold text-orange-800 pb-2 border-b-2 border-orange-300">Policy and Protocol Review Not Configured</h2>
        <p className="text-sm text-orange-700">
          No active onboarding quiz rules are available. Please contact EMS administration.
        </p>
      </div>
    );
  }

  if (mode === 'complete') {
    return (
      <div className={slideClasses + ' transition-all duration-300'}>
        <QuizHeader progressStep={progressStep} attempts={ruleAttempts} totalRules={rules.length} ruleTitle={currentRule.title} mode="complete" />
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-wfd-crimson/10">
            <svg className="h-10 w-10 text-wfd-crimson" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="mb-2 text-2xl font-bold text-wfd-charcoal">Policy and Protocol Review Complete</h3>
          <p className="mb-6 text-gray-600 max-w-md mx-auto">
            You have passed each compliance rule. An administrator will review your onboarding
            record and grant portal access after approval.
          </p>
          {completeError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {completeError}
            </div>
          )}
          <Button onClick={handleComplete} loading={certifying}>
            Finish Onboarding
          </Button>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Need help? Contact your instructor or email{' '}
            <a href={`mailto:${helpEmail ?? 'jbrown@winchesterky.com'}`} className="text-wfd-crimson hover:underline">
              {helpEmail ?? 'jbrown@winchesterky.com'}
            </a>
          </p>
        </div>
      </div>
    );
  }

  if (mode === 'success') {
    return (
      <div className={slideClasses + ' transition-all duration-300 text-center py-8'}>
        <QuizHeader progressStep={progressStep} attempts={ruleAttempts} totalRules={rules.length} ruleTitle={currentRule.title} mode="success" />
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-wfd-sage/10 animate-bounce">
          <svg className="h-10 w-10 text-wfd-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-wfd-sage mb-2">Correct!</h3>
        <p className="text-gray-500 text-sm">All non-compliant photos identified.</p>
      </div>
    );
  }

  if (mode === 'rule') {
    return (
      <div className={slideClasses + ' transition-all duration-300'}>
        <QuizHeader progressStep={progressStep} attempts={ruleAttempts} totalRules={rules.length} ruleTitle={currentRule.title} mode="rule" />
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-wfd-crimson">
            Rule {ruleIndex + 1} of {rules.length}
          </p>
          <h3 className="mb-3 text-xl font-bold text-wfd-charcoal">{currentRule.title}</h3>
          <p className="leading-relaxed text-gray-700">{currentRule.rule}</p>
        </div>
        <div className="flex gap-3 mt-6">
          {onBack && (
            <Button type="button" variant="secondary" onClick={onBack} className="flex-1">
              Previous Step
            </Button>
          )}
          <Button onClick={() => changeMode('question', 'left')} className="flex-1">
            Next Question
          </Button>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Need help? Contact your instructor or email{' '}
            <a href={`mailto:${helpEmail ?? 'jbrown@winchesterky.com'}`} className="text-wfd-crimson hover:underline">
              {helpEmail ?? 'jbrown@winchesterky.com'}
            </a>
          </p>
        </div>
      </div>
    );
  }

  if (mode === 'feedback') {
    return (
      <div className={slideClasses + ' transition-all duration-300'}>
        <QuizHeader progressStep={progressStep} attempts={ruleAttempts} totalRules={rules.length} ruleTitle={currentRule.title} mode="feedback" />
        <FeedbackPanel
          photos={currentRule.photos}
          categories={getFeedbackCategories()}
          attempts={ruleAttempts}
          onReviewRule={() => {
            setSelected(new Set());
            changeMode('rule', 'right');
          }}
          onRetry={() => {
            setSelected(new Set());
            setMode('question');
          }}
        />

        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Need help? Contact your instructor or email{' '}
            <a href={`mailto:${helpEmail ?? 'jbrown@winchesterky.com'}`} className="text-wfd-crimson hover:underline">
              {helpEmail ?? 'jbrown@winchesterky.com'}
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={slideClasses + ' transition-all duration-300'}>
      <QuizHeader progressStep={progressStep} attempts={ruleAttempts} totalRules={rules.length} ruleTitle={currentRule.title} mode="question" />
      <div className="mb-5">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-wfd-crimson">
          {currentRule.title}
        </p>
        <h3 className="text-lg font-bold text-wfd-charcoal">{currentRule.instruction}</h3>
        <p className="mt-1 text-sm text-gray-500">
          Visually inspect each photo. Tap every photo that shows a policy violation.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {currentRule.photos.map((photo) => (
          <QuizPhotoCard
            key={photo.id}
            imageUrl={photo.imageUrl}
            label={photo.label}
            reason={photo.reason}
            isSelected={selected.has(photo.id)}
            mode="selection"
            onToggle={() => togglePhoto(photo.id)}
          />
        ))}
      </div>

      <div className="sticky bottom-0 mt-6 flex flex-col gap-3 sm:flex-row bg-white/90 backdrop-blur-sm -mx-1 px-1 py-3 sm:static sm:bg-transparent sm:backdrop-blur-none sm:-mx-0 sm:px-0 sm:py-0">
        <Button variant="secondary" onClick={() => changeMode('rule', 'right')} className="flex-1">
          Review Rule
        </Button>
        <Button onClick={submitAnswer} className="flex-1">
          Submit Selection
        </Button>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 hidden sm:block">
        <p className="text-xs text-gray-400">
          Need help? Contact your instructor or email{' '}
          <a href="mailto:jbrown@winchesterky.com" className="text-wfd-crimson hover:underline">
            jbrown@winchesterky.com
          </a>
        </p>
      </div>
    </div>
  );
}
