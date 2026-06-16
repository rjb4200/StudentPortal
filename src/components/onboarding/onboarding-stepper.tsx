'use client';

interface StepperProps {
  currentStep: number;
}

const steps = [
  { step: 1, label: 'Register', description: 'Your details' },
  { step: 2, label: 'Legal', description: 'Review & sign' },
  { step: 3, label: 'Resources', description: 'Study materials' },
  { step: 4, label: 'Review', description: 'Policy & protocol' },
  { step: 5, label: 'Submitted', description: 'Awaiting approval' },
];

export function OnboardingStepper({ currentStep }: StepperProps) {
  const progressPercent = Math.round(((currentStep - 1) / (steps.length - 1)) * 100);

  return (
    <div className="hidden sm:block">
      <div className="flex items-center justify-between mb-3">
        {steps.map((s, i) => {
          const isCompleted = s.step < currentStep;
          const isActive = s.step === currentStep;
          const isLast = i === steps.length - 1;

          return (
            <div key={s.step} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                    isCompleted
                      ? 'bg-wfd-sage text-white'
                      : isActive
                      ? 'bg-wfd-crimson text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? '✓' : s.step}
                </div>
                <span
                  className={`text-xs mt-1 font-medium ${
                    isActive ? 'text-wfd-crimson' : isCompleted ? 'text-wfd-sage' : 'text-gray-400'
                  }`}
                >
                  {s.label}
                </span>
                <span className="text-[10px] text-gray-400 mt-0.5">{s.description}</span>
              </div>
              {!isLast && (
                <div className="flex-1 mx-1">
                  <div
                    className={`h-1 rounded-full ${
                      s.step < currentStep ? 'bg-wfd-sage' : 'bg-gray-200'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mb-2">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Step {currentStep} of {steps.length}</span>
          <span>{progressPercent}% complete</span>
        </div>
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-wfd-crimson rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
