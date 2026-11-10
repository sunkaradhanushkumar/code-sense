import React from 'react';

export const StatCard = ({ title, value, subtitle, tag }) => {
  return (
    <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-5 transition-all duration-200 hover:border-neutral-700">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-neutral-400">
          {title}
        </span>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl font-bold font-sans tracking-tight text-white">{value}</span>
        {tag && (
          <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800">
            {tag}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-1.5 text-xs text-neutral-500 font-sans">{subtitle}</p>}
    </div>
  );
};
