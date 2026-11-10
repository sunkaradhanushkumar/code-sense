import React from 'react';
import { ArrowUpLeft } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-black text-white pt-12 sm:pt-16 pb-8 sm:pb-12 border-t border-neutral-800 overflow-hidden mt-auto select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="select-none">
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[10vw] font-bold tracking-tighter leading-[0.85] text-white text-left -ml-1 sm:-ml-2">
            Code Sens<span className="inline-block translate-y-[0.12em]">e</span>
          </h1>
        </div>

        <div className="pb-1 sm:pb-3 shrink-0">
          <a
            href="https://github.com/sunkaradhanushkumar"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm sm:text-base font-sans text-neutral-400 hover:text-white transition-colors group"
          >
            <span>GitHub</span>
            <ArrowUpLeft className="w-4 h-4 text-neutral-400 group-hover:text-white transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </footer>
  );
};
