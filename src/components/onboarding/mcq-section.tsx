'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface McqQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

interface McqSectionProps {
  questions: McqQuestion[];
  onPass: () => void;
  onFail: () => void;
}

export function McqSection({ questions, onPass, onFail }: McqSectionProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const selectAnswer = (qIndex: number, optionIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const allCorrect = questions.every((q, i) => answers[i] === q.correctIndex);
    if (allCorrect) {
      onPass();
    } else {
      onFail();
      setTimeout(() => setSubmitted(false), 1500);
    }
  };

  const allAnswered = questions.every((_, i) => answers[i] !== undefined);

  return (
    <div className="space-y-6">
      {questions.map((q, qIndex) => (
        <div key={qIndex}>
          <p className="font-semibold text-wfd-charcoal mb-3">
            {qIndex + 1}. {q.question}
          </p>
          <div className="space-y-2">
            {q.options.map((option, oIndex) => {
              const isSelected = answers[qIndex] === oIndex;
              const isCorrect = submitted && oIndex === q.correctIndex;
              const isWrong = submitted && isSelected && oIndex !== q.correctIndex;

              return (
                <button
                  key={oIndex}
                  onClick={() => selectAnswer(qIndex, oIndex)}
                  disabled={submitted}
                  className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all ${
                    isCorrect
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : isWrong
                      ? 'border-red-500 bg-red-50 text-red-800'
                      : isSelected
                      ? 'border-wfd-crimson bg-red-50 text-wfd-crimson'
                      : 'border-gray-200 hover:border-gray-400 text-gray-700'
                  }`}
                >
                  <span className="font-medium mr-2">{String.fromCharCode(65 + oIndex)}.</span>
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <Button onClick={handleSubmit} disabled={!allAnswered || submitted} className="w-full">
        {submitted ? 'Checking...' : 'Submit Answers'}
      </Button>
    </div>
  );
}
