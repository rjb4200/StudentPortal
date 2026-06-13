'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

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

const rules: ComplianceRule[] = [
  {
    id: 'hair-grooming',
    title: 'Hair and Grooming Standards',
    rule:
      'Hair must be clean, controlled, and secured so it does not interfere with PPE, patient care, or scene safety. Facial hair must not prevent an N95 or respirator seal. Students must present a professional appearance while operating in WFD spaces.',
    instruction: 'Select every photo that is not in compliance with the hair and grooming standard.',
    photos: [
      {
        id: 'hair-1',
        label: 'Loose long hair near patient care area',
        imageUrl: 'https://placehold.co/420x320/9b1c1f/white?text=Loose+Hair',
        nonCompliant: true,
        reason: 'Long hair is unsecured and could interfere with PPE or patient care.',
      },
      {
        id: 'hair-2',
        label: 'Hair secured above collar',
        imageUrl: 'https://placehold.co/420x320/1f7a3f/white?text=Hair+Secured',
        nonCompliant: false,
        reason: 'Hair is secured and does not interfere with PPE.',
      },
      {
        id: 'hair-3',
        label: 'Beard interfering with respirator seal',
        imageUrl: 'https://placehold.co/420x320/9b1c1f/white?text=Seal+Obstruction',
        nonCompliant: true,
        reason: 'Facial hair prevents a proper respirator seal.',
      },
      {
        id: 'hair-4',
        label: 'Clean-shaven respirator seal area',
        imageUrl: 'https://placehold.co/420x320/1f7a3f/white?text=Seal+Clear',
        nonCompliant: false,
        reason: 'The respirator seal area is clear.',
      },
      {
        id: 'hair-5',
        label: 'Distracting loose accessories',
        imageUrl: 'https://placehold.co/420x320/9b1c1f/white?text=Loose+Accessories',
        nonCompliant: true,
        reason: 'Loose accessories create a snag and contamination risk.',
      },
    ],
  },
  {
    id: 'ppe-readiness',
    title: 'PPE Readiness',
    rule:
      'Students must use the PPE required for the environment and task. Gloves are required for patient contact, eye protection is required when splash risk exists, and respiratory protection must be worn when airborne precautions are indicated.',
    instruction: 'Select every photo that is not in compliance with the PPE readiness rule.',
    photos: [
      {
        id: 'ppe-1',
        label: 'Patient contact without gloves',
        imageUrl: 'https://placehold.co/420x320/9b1c1f/white?text=No+Gloves',
        nonCompliant: true,
        reason: 'Gloves are required during patient contact.',
      },
      {
        id: 'ppe-2',
        label: 'Gloves and eye protection in place',
        imageUrl: 'https://placehold.co/420x320/1f7a3f/white?text=Proper+PPE',
        nonCompliant: false,
        reason: 'Required PPE is in use.',
      },
      {
        id: 'ppe-3',
        label: 'Mask below nose',
        imageUrl: 'https://placehold.co/420x320/9b1c1f/white?text=Mask+Below+Nose',
        nonCompliant: true,
        reason: 'Respiratory protection must cover both mouth and nose.',
      },
      {
        id: 'ppe-4',
        label: 'Splash task without eye protection',
        imageUrl: 'https://placehold.co/420x320/9b1c1f/white?text=No+Eye+Protection',
        nonCompliant: true,
        reason: 'Eye protection is required when splash risk exists.',
      },
      {
        id: 'ppe-5',
        label: 'Respirator sealed correctly',
        imageUrl: 'https://placehold.co/420x320/1f7a3f/white?text=Respirator+Sealed',
        nonCompliant: false,
        reason: 'Respiratory protection is worn correctly.',
      },
    ],
  },
  {
    id: 'station-conduct',
    title: 'Station Conduct and Scene Awareness',
    rule:
      'Students must keep station and scene areas clear, professional, and ready for response. Personal items may not block walkways, bay paths, equipment access, or emergency exits. Students must remain alert and follow preceptor direction.',
    instruction: 'Select every photo that is not in compliance with station conduct expectations.',
    photos: [
      {
        id: 'station-1',
        label: 'Bag blocking bay walkway',
        imageUrl: 'https://placehold.co/420x320/9b1c1f/white?text=Blocked+Walkway',
        nonCompliant: true,
        reason: 'Personal items cannot block walkways or response paths.',
      },
      {
        id: 'station-2',
        label: 'Gear staged in assigned area',
        imageUrl: 'https://placehold.co/420x320/1f7a3f/white?text=Gear+Staged',
        nonCompliant: false,
        reason: 'Gear is staged without blocking access.',
      },
      {
        id: 'station-3',
        label: 'Exit partially blocked',
        imageUrl: 'https://placehold.co/420x320/9b1c1f/white?text=Blocked+Exit',
        nonCompliant: true,
        reason: 'Emergency exits must remain unobstructed.',
      },
      {
        id: 'station-4',
        label: 'Equipment cabinet clear',
        imageUrl: 'https://placehold.co/420x320/1f7a3f/white?text=Access+Clear',
        nonCompliant: false,
        reason: 'Equipment access remains clear.',
      },
      {
        id: 'station-5',
        label: 'Student distracted during patient movement',
        imageUrl: 'https://placehold.co/420x320/9b1c1f/white?text=Distracted+Student',
        nonCompliant: true,
        reason: 'Students must remain alert during patient movement and scene activity.',
      },
      {
        id: 'station-6',
        label: 'Student following preceptor direction',
        imageUrl: 'https://placehold.co/420x320/1f7a3f/white?text=Following+Direction',
        nonCompliant: false,
        reason: 'Student is attentive and following direction.',
      },
    ],
  },
];

export function KnowledgeGate({ studentId, onComplete }: KnowledgeGateProps) {
  const [ruleIndex, setRuleIndex] = useState(0);
  const [mode, setMode] = useState<'rule' | 'question' | 'complete'>('rule');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [certifying, setCertifying] = useState(false);

  const currentRule = rules[ruleIndex];
  const progressStep = mode === 'complete' ? rules.length : ruleIndex + 1;

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

  if (mode === 'complete') {
    return (
      <div>
        <Header progressStep={progressStep} attempts={attempts} />
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
        <Header progressStep={progressStep} attempts={attempts} />
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
      <Header progressStep={progressStep} attempts={attempts} />
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

function Header({ progressStep, attempts }: { progressStep: number; attempts: number }) {
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-wfd-charcoal">Knowledge Gate</h2>
        <div className="text-right text-sm text-gray-500">
          <div>
            Rule {progressStep} of {rules.length}
          </div>
          <div className="text-xs">Attempts: {attempts}</div>
        </div>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-wfd-crimson transition-all duration-300"
          style={{ width: `${(progressStep / rules.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
