'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface OnboardingIntroProps {
  onBegin: () => void;
}

export function OnboardingIntro({ onBegin }: OnboardingIntroProps) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-wfd-charcoal via-wfd-charcoal to-wfd-crimson px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center">
        <Card className="w-full overflow-hidden border-white/10 bg-white/95 shadow-2xl">
          <div className="grid gap-0 md:grid-cols-[1.05fr_0.95fr]">
            <section className="p-8 text-wfd-charcoal sm:p-10 lg:p-12">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-wfd-crimson">
                Wayfinders Onboarding
              </p>
              <h1 className="mb-4 text-3xl font-black leading-tight sm:text-5xl">
                Start your student portal setup.
              </h1>
              <p className="mb-8 max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
                Complete registration, review the required documents, study the resources, and submit your policy review in one guided flow.
              </p>
              <Button onClick={onBegin} className="px-6 py-3 text-base">
                Begin Registration
              </Button>
            </section>

            <aside className="bg-wfd-charcoal p-8 text-white sm:p-10 lg:p-12">
              <h2 className="mb-5 text-xl font-bold text-wfd-gold">What to expect</h2>
              <ol className="space-y-4 text-sm text-white/85">
                <li><strong className="text-white">1. Register</strong> with your student details.</li>
                <li><strong className="text-white">2. Review</strong> legal documents and acknowledgements.</li>
                <li><strong className="text-white">3. Study</strong> the resource library.</li>
                <li><strong className="text-white">4. Complete</strong> the policy and protocol review.</li>
                <li><strong className="text-white">5. Submit</strong> your onboarding for approval.</li>
              </ol>
            </aside>
          </div>
        </Card>
      </div>
    </main>
  );
}
