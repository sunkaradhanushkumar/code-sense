import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { SeverityBadge } from '../common/SeverityBadge';

export const IssueCard = ({ issue, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);

  const handleCopyFix = () => {
    if (issue.fixedSnippet) {
      navigator.clipboard.writeText(issue.fixedSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden transition-all duration-200 hover:border-neutral-700">
      {/* Card Header / Summary */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-4 cursor-pointer select-none hover:bg-neutral-900/50 transition-colors"
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 font-sans">
            <span className="capitalize">{issue.type}</span>
          </div>

          <SeverityBadge severity={issue.severity} />

          {issue.line > 0 && (
            <span className="font-sans text-[11px] text-neutral-300 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
              Line {issue.line}
            </span>
          )}

          <h4 className="font-semibold text-white text-xs">{issue.title}</h4>
        </div>

        <button className="text-neutral-400 hover:text-white p-1">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expandable Body */}
      {isOpen && (
        <div className="p-4 pt-0 space-y-3.5 border-t border-neutral-800/80 mt-1">
          {/* Technical Description */}
          <div className="text-xs text-neutral-300 leading-relaxed pt-3 font-sans">
            {issue.description}
          </div>

          {/* Explanation Card */}
          {issue.beginnerExplanation && (
            <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-3">
              <div className="text-[11px] font-sans font-semibold uppercase tracking-wider text-neutral-200 mb-1">
                Why this matters:
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {issue.beginnerExplanation}
              </p>
            </div>
          )}

          {/* Code Snippets (Problem vs Solution) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-sans">
            {issue.codeSnippet && (
              <div className="rounded-lg bg-black border border-neutral-800 overflow-hidden">
                <div className="px-3 py-1.5 bg-neutral-900 text-neutral-300 border-b border-neutral-800 flex items-center justify-between text-[11px] font-sans font-semibold">
                  <span>Problematic Code</span>
                  <span className="text-[10px] text-neutral-500">Line {issue.line}</span>
                </div>
                <pre className="p-3 overflow-x-auto text-neutral-300 whitespace-pre-wrap leading-relaxed">
                  {issue.codeSnippet}
                </pre>
              </div>
            )}

            {issue.fixedSnippet && (
              <div className="rounded-lg bg-black border border-neutral-800 overflow-hidden">
                <div className="px-3 py-1.5 bg-neutral-900 text-white border-b border-neutral-800 flex items-center justify-between text-[11px] font-sans font-semibold">
                  <span>Recommended Fix</span>
                  <button
                    onClick={handleCopyFix}
                    className="text-[11px] text-neutral-400 hover:text-white font-sans"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="p-3 overflow-x-auto text-neutral-200 whitespace-pre-wrap leading-relaxed">
                  {issue.fixedSnippet}
                </pre>
              </div>
            )}
          </div>

          {/* Actionable Suggestion */}
          {issue.suggestion && (
            <div className="text-xs font-sans text-neutral-400 bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-800 flex items-start gap-2">
              <span className="font-semibold text-white">Action:</span>
              <span className="text-neutral-300">{issue.suggestion}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
