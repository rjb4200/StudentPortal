'use client';

import { useState, useEffect, useCallback } from 'react';
import { RegistrationForm } from '@/components/onboarding/registration-form';
import { LegalWaiver } from '@/components/onboarding/legal-waiver';
import { ResourceLibrary } from '@/components/onboarding/resource-library';
import { KnowledgeGate } from '@/components/onboarding/knowledge-gate';
import { OnboardingComplete } from '@/components/onboarding/onboarding-complete';
import { OnboardingStepper } from '@/components/onboarding/onboarding-stepper';
import { OnboardingStepperMobile } from '@/components/onboarding/onboarding-stepper-mobile';
import { OnboardingIntro } from '@/components/onboarding/onboarding-intro';
import { SaveResumeBanner } from '@/components/onboarding/save-resume-banner';

type Step = 1 | 2 | 3 | 4 | 5;

const STORAGE_KEY = 'wfd_onboarding_session';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

interface SavedSession {
  studentId: string | null;
  currentStep: Step;
  timestamp: string;
  email: string;
}

function loadSession(): SavedSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session: SavedSession = JSON.parse(raw);
    const age = Date.now() - new Date(session.timestamp).getTime();
    if (age > SESSION_TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    if (session.currentStep < 1 || session.currentStep > 5) return null;
    return session;
  } catch {
    return null;
  }
}

function saveSession(session: SavedSession) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...session, timestamp: new Date().toISOString() }));
}

function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentPassword, setStudentPassword] = useState<string | null>(null);
  const [studentEmail, setStudentEmail] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  const [showResume, setShowResume] = useState(false);
  const [pendingSession, setPendingSession] = useState<SavedSession | null>(null);
  const [initialized, setInitialized] = useState(false);

  const advanceStep = useCallback((step: Step, id: string | null, email: string) => {
    setCurrentStep(step);
    if (id) setStudentId(id);
    if (email) setStudentEmail(email);
    if (step === 5) {
      clearSession();
    } else {
      saveSession({ studentId: id, currentStep: step, timestamp: new Date().toISOString(), email: email || studentEmail });
    }
  }, [studentEmail]);

  const goBack = useCallback(() => {
    const prev = (currentStep - 1) as Step;
    if (prev >= 1) {
      setCurrentStep(prev);
      saveSession({ studentId, currentStep: prev, timestamp: new Date().toISOString(), email: studentEmail });
    }
  }, [currentStep, studentId, studentEmail]);

  useEffect(() => {
    const session = loadSession();
    if (session) {
      setPendingSession(session);
      setShowResume(true);
      setShowIntro(false);
    }
    setInitialized(true);
  }, []);

  const handleBegin = useCallback(() => {
    setShowIntro(false);
  }, []);

  const handleResume = useCallback(() => {
    if (!pendingSession) return;
    setCurrentStep(pendingSession.currentStep);
    if (pendingSession.studentId) setStudentId(pendingSession.studentId);
    if (pendingSession.email) setStudentEmail(pendingSession.email);
    setShowResume(false);
  }, [pendingSession]);

  const handleStartOver = useCallback(() => {
    clearSession();
    setPendingSession(null);
    setShowResume(false);
    setShowIntro(true);
    setCurrentStep(1);
    setStudentId(null);
    setStudentEmail('');
  }, []);

  const handleRegistrationComplete = useCallback((id: string) => {
    setStudentId(id);
    const next = 2 as Step;
    setCurrentStep(next);
    saveSession({ studentId: id, currentStep: next, timestamp: new Date().toISOString(), email: studentEmail });
  }, [studentEmail]);

  const handleLegalComplete = useCallback(() => {
    const next = 3 as Step;
    advanceStep(next, studentId, studentEmail);
  }, [advanceStep, studentId, studentEmail]);

  const handleResourcesComplete = useCallback(() => {
    const next = 4 as Step;
    advanceStep(next, studentId, studentEmail);
  }, [advanceStep, studentId, studentEmail]);

  const handleQuizComplete = useCallback((password: string | null, email: string) => {
    setStudentPassword(password);
    setStudentEmail(email);
    const next = 5 as Step;
    advanceStep(next, studentId, email);
  }, [advanceStep, studentId]);

  if (!initialized) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (showResume && pendingSession) {
    return (
      <div className="max-w-3xl mx-auto">
        <SaveResumeBanner onResume={handleResume} onStartOver={handleStartOver} />
      </div>
    );
  }

  if (showIntro) {
    return (
      <div className="max-w-3xl mx-auto">
        <OnboardingIntro onBegin={handleBegin} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <OnboardingStepper currentStep={currentStep} />
      <OnboardingStepperMobile currentStep={currentStep} />

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8">
        {currentStep === 1 && <RegistrationForm onComplete={handleRegistrationComplete} />}
        {currentStep === 2 && studentId && (
          <LegalWaiver studentId={studentId} onComplete={handleLegalComplete} onBack={goBack} />
        )}
        {currentStep === 3 && (
          <ResourceLibrary onComplete={handleResourcesComplete} onBack={goBack} />
        )}
        {currentStep === 4 && studentId && (
          <KnowledgeGate studentId={studentId} onComplete={handleQuizComplete} onBack={goBack} />
        )}
        {currentStep === 5 && studentId && (
          <OnboardingComplete studentId={studentId} password={studentPassword} email={studentEmail} />
        )}
      </div>
    </div>
  );
}
