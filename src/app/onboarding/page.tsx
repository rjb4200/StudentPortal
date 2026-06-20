'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RegistrationForm } from '@/components/onboarding/registration-form';
import { LegalWaiver } from '@/components/onboarding/legal-waiver';
import { ResourceLibrary } from '@/components/onboarding/resource-library';
import { KnowledgeGate } from '@/components/onboarding/knowledge-gate';
import { OnboardingComplete } from '@/components/onboarding/onboarding-complete';
import { OnboardingStepper } from '@/components/onboarding/onboarding-stepper';
import { OnboardingStepperMobile } from '@/components/onboarding/onboarding-stepper-mobile';
import { SaveResumeBanner } from '@/components/onboarding/save-resume-banner';

interface WfdOnboardingSession {
  studentId: string | null;
  currentStep: number;
  timestamp: string;
  email: string;
}

const SAVE_KEY = 'wfd_onboarding_session';

function saveSession(studentId: string | null, currentStep: number, email: string) {
  if (typeof window === 'undefined') return;
  try {
    const session: WfdOnboardingSession = {
      studentId,
      currentStep,
      timestamp: new Date().toISOString(),
      email,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(session));
  } catch {
    // ignore quota / private browsing errors
  }
}

function loadSession(): WfdOnboardingSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const session: WfdOnboardingSession = JSON.parse(raw);
    const age = Date.now() - new Date(session.timestamp).getTime();
    if (age > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(SAVE_KEY);
      return null;
    }
    return session;
  } catch {
    localStorage.removeItem(SAVE_KEY);
    return null;
  }
}

function clearSession() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // ignore
  }
}

export default function OnboardingPage() {
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentEmail, setStudentEmail] = useState('');
  const [credentials, setCredentials] = useState<{
    password: string | null;
    email: string;
    isNewAccount: boolean;
  } | null>(null);
  const [helpEmail, setHelpEmail] = useState<string | undefined>();

  useEffect(() => {
    async function loadHelpEmail() {
      const supabase = createClient();
      const { data } = await supabase
        .from('portal_settings')
        .select('value')
        .eq('key', 'help_email')
        .single();
      if (data?.value) setHelpEmail(data.value);
    }
    loadHelpEmail();
  }, []);

  useEffect(() => {
    const saved = loadSession();
    if (saved) {
      setShowResumeBanner(true);
    }
  }, []);

  const handleResume = useCallback(() => {
    const saved = loadSession();
    if (!saved) return;
    setStudentId(saved.studentId);
    setStudentEmail(saved.email);
    setCurrentStep(saved.currentStep);
    setShowResumeBanner(false);
  }, []);

  const handleStartOver = useCallback(() => {
    clearSession();
    setShowResumeBanner(false);
    setCurrentStep(1);
    setStudentId(null);
    setStudentEmail('');
  }, []);

  const handleRegistrationComplete = useCallback(
    (id: string) => {
      setStudentId(id);
      setCurrentStep(2);
      saveSession(id, 2, studentEmail);
    },
    [studentEmail]
  );
  const handleLegalComplete = useCallback(() => {
    setCurrentStep(3);
    saveSession(studentId, 3, studentEmail);
  }, [studentId, studentEmail]);
  const handleResourcesComplete = useCallback(() => {
    setCurrentStep(4);
    saveSession(studentId, 4, studentEmail);
  }, [studentId, studentEmail]);
  const handleQuizComplete = useCallback(
    (password: string | null, email: string, isNewAccount: boolean) => {
      setCredentials({ password, email, isNewAccount });
      setCurrentStep(5);
      clearSession();
    },
    []
  );
  const handleBack = useCallback(() => setCurrentStep((s) => Math.max(1, s - 1)), []);

  if (showResumeBanner) {
    return <SaveResumeBanner onResume={handleResume} onStartOver={handleStartOver} />;
  }

  let stepContent: React.ReactNode = null;
  switch (currentStep) {
    case 1:
      stepContent = <RegistrationForm onComplete={handleRegistrationComplete} helpEmail={helpEmail} />;
      break;
    case 2:
      stepContent = studentId ? (
        <LegalWaiver studentId={studentId} onComplete={handleLegalComplete} onBack={handleBack} helpEmail={helpEmail} />
      ) : null;
      break;
    case 3:
      stepContent = <ResourceLibrary onComplete={handleResourcesComplete} onBack={handleBack} helpEmail={helpEmail} />;
      break;
    case 4:
      stepContent = studentId ? (
        <KnowledgeGate studentId={studentId} onComplete={handleQuizComplete} onBack={handleBack} helpEmail={helpEmail} />
      ) : null;
      break;
    case 5:
      stepContent = credentials && studentId ? (
        <OnboardingComplete
          studentId={studentId}
          password={credentials.password}
          email={credentials.email}
          isNewAccount={credentials.isNewAccount}
          helpEmail={helpEmail}
        />
      ) : null;
      break;
  }

  return (
    <>
      <OnboardingStepper currentStep={currentStep} />
      <OnboardingStepperMobile currentStep={currentStep} />
      {stepContent}
    </>
  );
}
