import React from 'react';
import { Link } from 'react-router-dom';
import { FileCode, ArrowRight } from 'lucide-react';
import { SeverityBadge } from '../common/SeverityBadge';

export const RecentReviewsList = ({ reviews = [] }) => {
  if (reviews.length === 0) {
    return (
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-8 text-center font-sans">
        <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center mx-auto mb-3">
          <FileCode className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-white">No Code Reviews Yet</h3>
        <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
          Start by pasting code or uploading a source file to audit your code.
        </p>
        <Link
          to="/workspace"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs font-semibold transition-all"
        >
          Create First Review
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden font-sans">
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Recent Code Reviews</h3>
          <p className="text-[11px] text-neutral-500 mt-0.5">Recently analyzed source code snippets and files</p>
        </div>
        <Link
          to="/history"
          className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          View All History
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-neutral-800">
        {reviews.map((rev) => {
          const id = rev._id || rev.id;
          const score = rev.qualityScore || 0;

          return (
            <div
              key={id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-900/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <FileCode className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-semibold text-white">{rev.title}</h4>
                    <span className="text-[10px] uppercase text-neutral-400 font-medium">
                      ({rev.language === 'cpp' ? 'C++' : rev.language === 'c' ? 'C' : rev.language})
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    {rev.summary?.totalIssues || 0} issues • {rev.metrics?.linesOfCode || 0} lines
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-neutral-900 text-white border border-neutral-700">
                    {score}/100
                  </span>
                </div>

                <Link
                  to={`/review/${id}`}
                  className="px-3 py-1 text-xs rounded-lg bg-white hover:bg-neutral-200 text-black font-semibold transition-colors"
                >
                  View
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
