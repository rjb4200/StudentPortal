'use client';

interface StepperProps {
  currentStep: number;
}

const steps = [
  { step: 1, label: 'Register', description: 'Your details' },
  { step: 2, label: 'Legal', description: 'Review & sign' },
  { step: 3, label: 'Resources', description: 'Study materials' },
  { step: 4, label: 'Review', description: 'Policy & protocol' },
  { step: 5, label: 'Complete', description: 'Awaiting approval' },
];

export function OnboardingStepper({ currentStep }: StepperProps) {
  const progressPercent = Math.round(((currentStep - 1) / (steps.length - 1)) * 100);

  return (
    <div className="hidden sm:block w-full">
      <div className="relative px-2 pb-1">
        <div className="absolute left-[10%] right-[10%] top-5 h-1 rounded-full bg-gray-200" />
        <div
          className="absolute left-[10%] top-5 h-1 rounded-full bg-wfd-sage transition-all duration-500 ease-out"
          style={{ width: `${progressPercent * 0.8}%` }}
        />

        <div className="relative grid grid-cols-5 items-start">
          {steps.map((s) => {
            const isCompleted = s.step < currentStep;
            const isActive = s.step === currentStep;

            return (
              <div key={s.step} className="flex flex-col items-center text-center">
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
                <span className="text-[10px] text-gray-400 mt-0.5 leading-tight">{s.description}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mt-3">
        <div
          className="h-full bg-wfd-crimson rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
