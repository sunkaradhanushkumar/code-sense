import React from 'react';
import { ShieldAlert, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export const SeverityBadge = ({ severity = 'medium', className = '' }) => {
  const norm = severity.toLowerCase();

  switch (norm) {
    case 'critical':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-sans font-bold bg-white text-black border border-white uppercase tracking-wider ${className}`}
        >
          <ShieldAlert className="w-3 h-3 text-black" />
          Critical
        </span>
      );
    case 'high':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-sans font-semibold bg-neutral-900 text-white border border-neutral-600 uppercase tracking-wider ${className}`}
        >
          <AlertTriangle className="w-3 h-3 text-neutral-300" />
          High
        </span>
      );
    case 'medium':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-sans font-medium bg-neutral-900 text-neutral-300 border border-neutral-700 capitalize ${className}`}
        >
          <AlertCircle className="w-3 h-3 text-neutral-400" />
          Medium
        </span>
      );
    case 'low':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-sans font-medium bg-black text-neutral-400 border border-neutral-800 capitalize ${className}`}
        >
          <Info className="w-3 h-3 text-neutral-500" />
          Low
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-sans font-medium bg-black text-neutral-500 border border-neutral-800 capitalize ${className}`}
        >
          <Info className="w-3 h-3 text-neutral-600" />
          Info
        </span>
      );
  }
};
