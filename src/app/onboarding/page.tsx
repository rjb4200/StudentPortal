'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RegistrationForm } from '@/components/onboarding/registration-form';
import { LegalWaiver } from '@/components/onboarding/legal-waiver';
import { ResourceLibrary } from '@/components/onboarding/resource-library';
import { KnowledgeGate } from '@/components/onboarding/knowledge-gate';
import { OnboardingComplete } from '@/components/onboarding/onboarding-complete';

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [studentId, setStudentId] = useState<string | null>(null);
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

  const handleRegistrationComplete = useCallback((id: string) => {
    setStudentId(id);
    setCurrentStep(2);
  }, []);
  const handleLegalComplete = useCallback(() => setCurrentStep(3), []);
  const handleResourcesComplete = useCallback(() => setCurrentStep(4), []);
  const handleQuizComplete = useCallback(
    (password: string | null, email: string, isNewAccount: boolean) => {
      setCredentials({ password, email, isNewAccount });
      setCurrentStep(5);
    },
    []
  );
  const handleBack = useCallback(() => setCurrentStep((s) => Math.max(1, s - 1)), []);

  switch (currentStep) {
    case 1:
      return <RegistrationForm onComplete={handleRegistrationComplete} helpEmail={helpEmail} />;
    case 2:
      return studentId ? <LegalWaiver studentId={studentId} onComplete={handleLegalComplete} onBack={handleBack} helpEmail={helpEmail} /> : null;
    case 3:
      return <ResourceLibrary onComplete={handleResourcesComplete} onBack={handleBack} helpEmail={helpEmail} />;
    case 4:
      return studentId ? <KnowledgeGate studentId={studentId} onComplete={handleQuizComplete} onBack={handleBack} helpEmail={helpEmail} /> : null;
    case 5:
      return credentials && studentId ? (
        <OnboardingComplete
          studentId={studentId}
          password={credentials.password}
          email={credentials.email}
          isNewAccount={credentials.isNewAccount}
          helpEmail={helpEmail}
        />
      ) : null;
    default:
      return null;
  }
}
