'use client';

interface QuizHeaderProps {
  progressStep: number;
  attempts: number;
  totalRules: number;
  ruleTitle?: string;
  mode: string;
}

export function QuizHeader({ progressStep, attempts, totalRules, ruleTitle, mode }: QuizHeaderProps) {
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-wfd-charcoal pb-2 border-b-2 border-wfd-crimson">
          Policy and Protocol Review
        </h2>
        <div className="text-right text-sm text-gray-500 shrink-0">
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
