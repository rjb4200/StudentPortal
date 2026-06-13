'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

interface KnowledgeGateProps {
  studentId: string;
  onComplete: () => void;
}

interface CompliancePhoto {
  id: string;
  label: string;
  imageUrl: string;
  nonCompliant: boolean;
  reason: string;
}

interface ComplianceRule {
  id: string;
  title: string;
  rule: string;
  instruction: string;
  photos: CompliancePhoto[];
}

export function KnowledgeGate({ studentId, onComplete }: KnowledgeGateProps) {
  const [rules, setRules] = useState<ComplianceRule[]>([]);
  const [loadingRules, setLoadingRules] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [ruleIndex, setRuleIndex] = useState(0);
  const [mode, setMode] = useState<'rule' | 'question' | 'complete'>('rule');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [certifying, setCertifying] = useState(false);

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
      setLoadingRules(false);
    }

    loadRules();
  }, []);

  const currentRule = rules[ruleIndex];
  const progressStep = mode === 'complete' ? rules.length : Math.min(ruleIndex + 1, rules.length);

  const togglePhoto = (photoId: string) => {
    if (feedback) return;
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
      setAttempts((value) => value + 1);
      setFeedback('Not quite. Review the rule again, then retry this question.');
      window.setTimeout(() => {
        setSelected(new Set());
        setFeedback(null);
        setMode('rule');
      }, 1800);
      return;
    }

    setSelected(new Set());
    setFeedback(null);
    if (ruleIndex === rules.length - 1) {
      setMode('complete');
    } else {
      setRuleIndex((value) => value + 1);
      setMode('rule');
    }
  };

  const handleComplete = async () => {
    setCertifying(true);

    try {
      await fetch('/api/notify/onboarding-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      });
    } catch {}

    onComplete();
  };

  if (loadingRules) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-center">
        <h2 className="mb-2 text-xl font-bold text-wfd-charcoal">Knowledge Gate</h2>
        <p className="text-sm text-gray-600">Loading onboarding quiz...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <h2 className="mb-2 text-xl font-bold text-red-800">Knowledge Gate Unavailable</h2>
        <p className="text-sm text-red-700">{loadError}</p>
      </div>
    );
  }

  if (rules.length === 0 || !currentRule) {
    return (
      <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">
        <h2 className="mb-2 text-xl font-bold text-orange-800">Knowledge Gate Not Configured</h2>
        <p className="text-sm text-orange-700">
          No active onboarding quiz rules are available. Please contact EMS administration.
        </p>
      </div>
    );
  }

  if (mode === 'complete') {
    return (
      <div>
        <Header progressStep={progressStep} attempts={attempts} totalRules={rules.length} />
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl font-bold text-green-700">
            OK
          </div>
          <h3 className="mb-2 text-xl font-bold text-wfd-crimson">Knowledge Gate Complete</h3>
          <p className="mb-6 text-gray-600">
            You have passed each compliance rule. An administrator will review your onboarding
            record and grant portal access after approval.
          </p>
          <Button onClick={handleComplete} loading={certifying}>
            Finish Onboarding
          </Button>
        </div>
      </div>
    );
  }

  if (mode === 'rule') {
    return (
      <div>
        <Header progressStep={progressStep} attempts={attempts} totalRules={rules.length} />
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-wfd-crimson">
            Rule {ruleIndex + 1} of {rules.length}
          </p>
          <h3 className="mb-3 text-xl font-bold text-wfd-charcoal">{currentRule.title}</h3>
          <p className="leading-relaxed text-gray-700">{currentRule.rule}</p>
        </div>
        <Button onClick={() => setMode('question')} className="mt-6 w-full">
          Continue to Photo Question
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Header progressStep={progressStep} attempts={attempts} totalRules={rules.length} />
      <div className="mb-5">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-wfd-crimson">
          {currentRule.title}
        </p>
        <h3 className="text-lg font-bold text-wfd-charcoal">{currentRule.instruction}</h3>
        <p className="mt-1 text-sm text-gray-500">
          Tap every non-compliant photo. Leave compliant photos unselected.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {currentRule.photos.map((photo) => {
          const isSelected = selected.has(photo.id);
          return (
            <button
              key={photo.id}
              type="button"
              onClick={() => togglePhoto(photo.id)}
              className={`overflow-hidden rounded-xl border-2 bg-white text-left shadow-sm transition-all ${
                isSelected
                  ? 'border-wfd-crimson ring-2 ring-wfd-crimson/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img src={photo.imageUrl} alt={photo.label} className="h-36 w-full object-cover" />
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-wfd-charcoal">{photo.label}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      isSelected ? 'bg-wfd-crimson text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Tap'}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {feedback && (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
          {feedback}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button variant="secondary" onClick={() => setMode('rule')} className="flex-1">
          Review Rule
        </Button>
        <Button onClick={submitAnswer} className="flex-1">
          Submit Selection
        </Button>
      </div>
    </div>
  );
}

function Header({
  progressStep,
  attempts,
  totalRules,
}: {
  progressStep: number;
  attempts: number;
  totalRules: number;
}) {
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-wfd-charcoal">Knowledge Gate</h2>
        <div className="text-right text-sm text-gray-500">
          <div>
            Rule {progressStep} of {totalRules}
          </div>
          <div className="text-xs">Attempts: {attempts}</div>
        </div>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-wfd-crimson transition-all duration-300"
          style={{ width: `${(progressStep / totalRules) * 100}%` }}
        />
      </div>
    </div>
  );
}
