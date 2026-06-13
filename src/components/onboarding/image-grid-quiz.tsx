'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface GridImage {
  id: string;
  url: string;
  correct: 'acceptable' | 'unacceptable';
}

interface ImageGridQuizProps {
  images: GridImage[];
  onPass: () => void;
  onFail: () => void;
}

export function ImageGridQuiz({ images, onPass, onFail }: ImageGridQuizProps) {
  const [classifications, setClassifications] = useState<Record<string, 'acceptable' | 'unacceptable'>>(
    {}
  );
  const [submitted, setSubmitted] = useState(false);

  const toggleClassify = (id: string) => {
    if (submitted) return;
    setClassifications((prev) => ({
      ...prev,
      [id]: prev[id] === 'acceptable' ? 'unacceptable' : 'acceptable',
    }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const allCorrect = images.every((img) => classifications[img.id] === img.correct);
    if (allCorrect) {
      onPass();
    } else {
      onFail();
      setTimeout(() => setSubmitted(false), 1500);
    }
  };

  const allClassified = images.every((img) => classifications[img.id]);

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        Click each image to toggle between Acceptable and Unacceptable. Classify all images, then
        submit.
      </p>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {images.map((img) => {
          const userClassify = classifications[img.id];
          const isCorrect = submitted && userClassify === img.correct;
          const isWrong = submitted && userClassify && userClassify !== img.correct;

          return (
            <button
              key={img.id}
              onClick={() => toggleClassify(img.id)}
              disabled={submitted}
              className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                isCorrect
                  ? 'border-green-500'
                  : isWrong
                  ? 'border-red-500'
                  : userClassify
                  ? 'border-yellow-500'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <img src={img.url} alt={`Safety image ${img.id}`} className="w-full h-40 object-cover" />
              <div
                className={`absolute bottom-0 left-0 right-0 px-2 py-1 text-xs font-semibold text-center ${
                  userClassify === 'acceptable'
                    ? 'bg-green-500 text-white'
                    : userClassify === 'unacceptable'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-800/60 text-white'
                }`}
              >
                {userClassify === 'acceptable'
                  ? '✓ Acceptable'
                  : userClassify === 'unacceptable'
                  ? '✗ Unacceptable'
                  : 'Tap to classify'}
              </div>
              {submitted && isWrong && (
                <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded">
                  Should be {img.correct}
                </div>
              )}
            </button>
          );
        })}
      </div>
      <Button onClick={handleSubmit} disabled={!allClassified || submitted} className="w-full">
        {submitted ? 'Checking...' : 'Submit Classifications'}
      </Button>
    </div>
  );
}
