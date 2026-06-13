'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { HotspotQuiz } from './hotspot-quiz';
import { ImageGridQuiz } from './image-grid-quiz';
import { McqSection } from './mcq-section';

interface KnowledgeGateProps {
  studentId: string;
  onComplete: () => void;
}

type SlideType = 'info' | 'hotspot' | 'grid' | 'mcq' | 'complete';

interface Slide {
  id: number;
  type: SlideType;
  title?: string;
  content?: string;
  quizConfig?: any;
}

const slides: Slide[] = [
  {
    id: 1,
    type: 'info',
    title: 'Station Safety Overview',
    content:
      'Winchester Fire Department operates three stations. Each station has specific safety zones, PPE requirements, and emergency exits. You must know these for your safety and the safety of patients and crew.',
  },
  {
    id: 2,
    type: 'hotspot',
    title: 'Station 1 Bay - Identify Safety Equipment',
    quizConfig: {
      imageUrl: 'https://placehold.co/800x500/333/white?text=Station+Bay+Photograph',
      zones: [
        { id: 'eye_wash', label: 'Eyewash Station', x: 15, y: 40, radius: 8 },
        { id: 'fire_ext', label: 'Fire Extinguisher', x: 75, y: 30, radius: 7 },
        { id: 'first_aid', label: 'First Aid Kit', x: 50, y: 60, radius: 8 },
      ],
    },
  },
  {
    id: 3,
    type: 'info',
    title: 'PPE Requirements',
    content:
      'All students must wear appropriate PPE at all times: N95 mask, safety glasses, turnout gear in bay areas, and nitrile gloves during patient contact. Station officers may require additional PPE for specific situations.',
  },
  {
    id: 4,
    type: 'grid',
    title: 'PPE Compliance - Identify Acceptable Practices',
    quizConfig: {
      images: [
        {
          id: 'img1',
          url: 'https://placehold.co/300x300/22aa55/white?text=Full+PPE+Proper',
          correct: 'acceptable',
        },
        {
          id: 'img2',
          url: 'https://placehold.co/300x300/cc3333/white?text=Missing+Gloves',
          correct: 'unacceptable',
        },
        {
          id: 'img3',
          url: 'https://placehold.co/300x300/22aa55/white?text=Proper+Mask+Use',
          correct: 'acceptable',
        },
        {
          id: 'img4',
          url: 'https://placehold.co/300x300/cc3333/white?text=No+Eye+Protection',
          correct: 'unacceptable',
        },
      ],
    },
  },
  {
    id: 5,
    type: 'mcq',
    title: 'Safety Protocol Questions',
    quizConfig: {
      questions: [
        {
          question: 'What is the first thing you should do upon arriving for your shift?',
          options: [
            'Head straight to the ambulance',
            'Check in with the station officer and review the assignment board',
            'Start checking equipment without notifying anyone',
            'Wait in the parking lot',
          ],
          correctIndex: 1,
        },
        {
          question: 'When are you required to wear an N95 mask?',
          options: [
            'Only during COVID-19 calls',
            'During any patient contact when airborne precautions are indicated',
            'Only when the preceptor tells you to',
            'Never, it is optional',
          ],
          correctIndex: 1,
        },
        {
          question: 'What should you do if you witness a safety violation?',
          options: [
            'Ignore it — it is not your responsibility',
            'Immediately report it to your preceptor or the station officer',
            'Post about it on social media',
            'Wait until the end of your shift to mention it',
          ],
          correctIndex: 1,
        },
      ],
    },
  },
  {
    id: 6,
    type: 'complete',
    title: 'Knowledge Gate Complete',
    content: 'You have passed all sections of the safety knowledge assessment.',
  },
];

export function KnowledgeGate({ studentId, onComplete }: KnowledgeGateProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [certifying, setCertifying] = useState(false);

  const currentSlide = slides[currentIndex];

  const handleFail = useCallback(() => {
    const newStrikes = strikes + 1;
    setStrikes(newStrikes);
    if (newStrikes >= 3) {
      setStrikes(0);
      setCurrentIndex(0);
    }
  }, [strikes]);

  const handlePass = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentIndex]);

  const handleComplete = async () => {
    setCertifying(true);

    try {
      await fetch('/api/notify/onboarding-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      });
    } catch {}

    onComplete();
  };

  const renderSlide = () => {
    switch (currentSlide.type) {
      case 'info':
        return (
          <div className="text-center">
            <h3 className="text-lg font-bold text-wfd-charcoal mb-4">{currentSlide.title}</h3>
            <p className="text-gray-600 max-w-lg mx-auto leading-relaxed">{currentSlide.content}</p>
            <Button onClick={handlePass} className="mt-6">
              Continue
            </Button>
          </div>
        );
      case 'hotspot':
        return (
          <HotspotQuiz
            config={currentSlide.quizConfig}
            onPass={handlePass}
            onFail={handleFail}
          />
        );
      case 'grid':
        return (
          <ImageGridQuiz
            images={currentSlide.quizConfig.images}
            onPass={handlePass}
            onFail={handleFail}
          />
        );
      case 'mcq':
        return (
          <McqSection
            questions={currentSlide.quizConfig.questions}
            onPass={handlePass}
            onFail={handleFail}
          />
        );
      case 'complete':
        return (
          <div className="text-center">
            <div className="text-6xl mb-4">🎓</div>
            <h3 className="text-xl font-bold text-wfd-crimson mb-2">Congratulations!</h3>
            <p className="text-gray-600 mb-6">
              You have completed the knowledge gate. An administrator will review your submission and
              grant you access to the student portal.
            </p>
            <Button onClick={handleComplete} loading={certifying}>
              Finish Onboarding
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-wfd-charcoal">Knowledge Gate</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Slide {currentIndex + 1} of {slides.length}
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < strikes ? 'bg-red-500' : 'bg-gray-300'
                }`}
                title={`Strike ${i + 1}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400">3 strikes resets</span>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-wfd-crimson h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / slides.length) * 100}%` }}
        />
      </div>
      {renderSlide()}
    </div>
  );
}
