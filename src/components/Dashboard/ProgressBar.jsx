import React from 'react';

const ProgressBar = ({ value, maxValue, color, height = 8, label }) => {
  const progress = (value / maxValue) * 100;
  
  return (
    <div className="w-full">
      {label && <p className="text-sm text-gray-600 mb-1">{label}</p>}
      <div className="w-full bg-gray-100 rounded-full overflow-hidden" style={{ height }}>
        <div 
          className="h-full rounded-full" 
          style={{ width: `${progress}%`, backgroundColor: color }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;