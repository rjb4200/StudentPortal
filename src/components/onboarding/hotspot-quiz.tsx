'use client';

import { useState, useRef, useCallback } from 'react';

interface HotspotZone {
  id: string;
  label: string;
  x: number;
  y: number;
  radius: number;
}

interface HotspotQuizProps {
  config: {
    imageUrl: string;
    zones: HotspotZone[];
  };
  onPass: () => void;
  onFail: () => void;
}

export function HotspotQuiz({ config, onPass, onFail }: HotspotQuizProps) {
  const [foundZones, setFoundZones] = useState<Set<string>>(new Set());
  const [clickResult, setClickResult] = useState<{ x: number; y: number; correct: boolean } | null>(
    null
  );
  const imgRef = useRef<HTMLImageElement>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const img = imgRef.current;
      if (!img) return;

      const rect = img.getBoundingClientRect();
      const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
      const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

      setClickResult({ x: xPercent, y: yPercent, correct: false });

      for (const zone of config.zones) {
        if (foundZones.has(zone.id)) continue;
        const dist = Math.sqrt((xPercent - zone.x) ** 2 + (yPercent - zone.y) ** 2);
        if (dist < zone.radius) {
          const newFound = new Set(foundZones);
          newFound.add(zone.id);
          setFoundZones(newFound);
          setClickResult({ x: xPercent, y: yPercent, correct: true });

          if (newFound.size === config.zones.length) {
            setTimeout(onPass, 800);
          }
          setTimeout(() => setClickResult(null), 1200);
          return;
        }
      }

      onFail();
      setTimeout(() => setClickResult(null), 1200);
    },
    [config.zones, foundZones, onPass, onFail]
  );

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        Click on each safety item in the image. Found: {foundZones.size}/{config.zones.length}
      </p>
      <div className="relative inline-block cursor-crosshair" onClick={handleClick}>
        <img
          ref={imgRef}
          src={config.imageUrl}
          alt="Click to identify safety equipment"
          className="max-w-full rounded-lg border border-gray-200"
        />
        {clickResult && (
          <div
            className={`absolute w-6 h-6 rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2 animate-ping ${
              clickResult.correct ? 'border-green-500 bg-green-500/30' : 'border-red-500 bg-red-500/30'
            }`}
            style={{ left: `${clickResult.x}%`, top: `${clickResult.y}%` }}
          />
        )}
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        {config.zones.map((zone) => (
          <span
            key={zone.id}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              foundZones.has(zone.id)
                ? 'bg-green-100 text-green-800 line-through'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {zone.label}
          </span>
        ))}
      </div>
    </div>
  );
}
