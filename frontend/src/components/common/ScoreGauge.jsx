import React from 'react';

export const ScoreGauge = ({ score = 85, size = 120, strokeWidth = 10, showLabel = true }) => {
  const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let verdict = 'Clean';
  if (normalizedScore < 50) {
    verdict = 'Critical Attention';
  } else if (normalizedScore < 70) {
    verdict = 'Needs Refactor';
  } else if (normalizedScore < 85) {
    verdict = 'Good Quality';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#27272a"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#ffffff"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold font-sans tracking-tight text-white">
            {normalizedScore}
          </span>
          <span className="text-[10px] uppercase font-sans font-medium text-neutral-500 -mt-0.5">
            / 100
          </span>
        </div>
      </div>

      {showLabel && (
        <span className="mt-2 text-xs font-sans font-medium text-neutral-300">
          {verdict}
        </span>
      )}
    </div>
  );
};
