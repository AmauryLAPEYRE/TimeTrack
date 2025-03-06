import React from 'react';

const CircleProgress = ({ value, maxValue, color, size = 120, lineWidth = 8, label, subLabel }) => {
  const radius = (size - lineWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(1, value / maxValue);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={lineWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={lineWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{value}</span>
          {subLabel && <span className="text-xs text-gray-500">{subLabel}</span>}
        </div>
      </div>
      {label && <p className="mt-2 text-sm text-gray-600">{label}</p>}
    </div>
  );
};

export default CircleProgress;