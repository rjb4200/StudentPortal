'use client';

interface StepperMobileProps {
  currentStep: number;
}

const steps = [
  { step: 1, label: 'Register' },
  { step: 2, label: 'Legal' },
  { step: 3, label: 'Review' },
  { step: 4, label: 'Submitted' },
];

export function OnboardingStepperMobile({ currentStep }: StepperMobileProps) {
  const progressPercent = Math.round(((currentStep - 1) / (steps.length - 1)) * 100);
  const currentLabel = steps.find((s) => s.step === currentStep)?.label ?? '';

  return (
    <div className="block sm:hidden mb-4">
      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
        <span className="font-semibold text-wfd-crimson">
          Step {currentStep} of {steps.length}
        </span>
        <span>{progressPercent}% complete</span>
      </div>
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1.5">
        <div
          className="h-full bg-wfd-crimson rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <p className="text-xs font-medium text-gray-600">{currentLabel}</p>
    </div>
  );
}
