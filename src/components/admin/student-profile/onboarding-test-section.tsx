'use client';

import { Badge } from '@/components/ui/badge';

interface QuizFlag {
  id: string;
  rule_title: string;
  attempt_count: number;
  acknowledged: boolean;
  created_at: string;
}

interface OnboardingTestSectionProps {
  onboardingCompletedAt: string | null;
  quizFlags: QuizFlag[];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function OnboardingTestSection({
  onboardingCompletedAt,
  quizFlags,
}: OnboardingTestSectionProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 print:border-none print:p-0">
      <h3 className="font-semibold text-wfd-charcoal mb-3">Onboarding Test</h3>

      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm text-gray-500">Status:</span>
        {onboardingCompletedAt ? (
          <div className="flex items-center gap-2">
            <Badge variant="green">Completed</Badge>
            <span className="text-xs text-gray-400">{formatDate(onboardingCompletedAt)}</span>
          </div>
        ) : (
          <Badge variant="gray">Not completed</Badge>
        )}
      </div>

      {quizFlags.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-wfd-charcoal mb-2">Quiz Flags</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="py-2 px-3 font-medium text-gray-500">Rule</th>
                  <th className="py-2 px-3 font-medium text-gray-500">Attempts</th>
                  <th className="py-2 px-3 font-medium text-gray-500">Status</th>
                  <th className="py-2 px-3 font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {quizFlags.map((flag) => (
                  <tr key={flag.id} className="border-b border-gray-100">
                    <td className="py-2 px-3 font-medium text-wfd-charcoal">{flag.rule_title}</td>
                    <td className="py-2 px-3">{flag.attempt_count}</td>
                    <td className="py-2 px-3">
                      <Badge variant={flag.acknowledged ? 'green' : 'gold'}>
                        {flag.acknowledged ? 'Acknowledged' : 'Pending'}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-500">{formatDate(flag.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!onboardingCompletedAt && quizFlags.length === 0 && (
        <p className="text-sm text-gray-400">No test data available</p>
      )}
    </div>
  );
}
