import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6">
      <Loader2 className={`${sizeClasses[size] || sizeClasses.md} text-white animate-spin`} />
      {text && <p className="text-xs text-neutral-400 font-sans tracking-wide">{text}</p>}
    </div>
  );
};
