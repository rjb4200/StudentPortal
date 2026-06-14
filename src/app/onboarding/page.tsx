'use client';

import { useState, useCallback } from 'react';
import { RegistrationForm } from '@/components/onboarding/registration-form';
import { LegalWaiver } from '@/components/onboarding/legal-waiver';
import { ResourceLibrary } from '@/components/onboarding/resource-library';
import { KnowledgeGate } from '@/components/onboarding/knowledge-gate';
import { OnboardingComplete } from '@/components/onboarding/onboarding-complete';

type Step = 1 | 2 | 3 | 4 | 5;

const steps = [
  { step: 1 as Step, label: 'Register' },
  { step: 2 as Step, label: 'Legal' },
  { step: 3 as Step, label: 'Resources' },
  { step: 4 as Step, label: 'Review' },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentPassword, setStudentPassword] = useState<string | null>(null);

  const handleRegistrationComplete = useCallback((id: string) => {
    setStudentId(id);
    setCurrentStep(2);
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s.step} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    s.step < currentStep
                      ? 'bg-green-500 text-white'
                      : s.step === currentStep
                      ? 'bg-wfd-crimson text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s.step < currentStep ? '✓' : s.step}
                </div>
                <span
                  className={`text-xs mt-1 ${
                    s.step === currentStep ? 'text-wfd-crimson font-semibold' : 'text-gray-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded ${
                    s.step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8">
        {currentStep === 1 && <RegistrationForm onComplete={handleRegistrationComplete} />}
        {currentStep === 2 && studentId && (
          <LegalWaiver studentId={studentId} onComplete={() => setCurrentStep(3)} />
        )}
        {currentStep === 3 && <ResourceLibrary onComplete={() => setCurrentStep(4)} />}
        {currentStep === 4 && studentId && (
          <KnowledgeGate studentId={studentId} onComplete={(password) => { setStudentPassword(password); setCurrentStep(5); }} />
        )}
        {currentStep === 5 && studentId && <OnboardingComplete studentId={studentId} password={studentPassword} />}
      </div>
    </div>
  );
}
