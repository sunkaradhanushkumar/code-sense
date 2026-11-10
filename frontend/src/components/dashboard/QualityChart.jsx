import React from 'react';

export const QualityChart = ({ languageCounts = {}, scoreTrend = [] }) => {
  const totalByLang = Object.values(languageCounts).reduce((a, b) => a + b, 0) || 1;

  const languages = [
    { key: 'javascript', label: 'JavaScript', color: '#ffffff', count: languageCounts.javascript || 0 },
    { key: 'python', label: 'Python', color: '#d4d4d8', count: languageCounts.python || 0 },
    { key: 'java', label: 'Java', color: '#a1a1aa', count: languageCounts.java || 0 },
    { key: 'c', label: 'C', color: '#8b8b93', count: languageCounts.c || 0 },
    { key: 'cpp', label: 'C++', color: '#71717a', count: languageCounts.cpp || 0 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
      {/* Language Distribution Card */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              Languages Breakdown
            </h3>
          </div>
          <span className="text-xs text-neutral-500">{totalByLang} audits</span>
        </div>

        {/* Stacked Percentage Bar */}
        <div className="h-2 w-full bg-black rounded-full overflow-hidden flex mb-5 border border-neutral-800">
          {languages.map((l) => {
            const pct = (l.count / totalByLang) * 100;
            if (pct === 0) return null;
            return (
              <div
                key={l.key}
                style={{ width: `${pct}%`, backgroundColor: l.color }}
                className="h-full transition-all duration-500"
                title={`${l.label}: ${l.count} (${pct.toFixed(0)}%)`}
              />
            );
          })}
        </div>

        {/* Breakdown Items */}
        <div className="space-y-2.5">
          {languages.map((lang) => {
            const percentage = Math.round((lang.count / totalByLang) * 100);
            return (
              <div key={lang.key} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lang.color }} />
                  <span className="text-neutral-300 font-medium">{lang.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-neutral-500">{lang.count} reviews</span>
                  <span className="font-semibold text-white w-8 text-right">
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Score Progression Chart */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              Quality Score Trend
            </h3>
          </div>
          <span className="text-xs text-neutral-400">Recent Analyses</span>
        </div>

        {scoreTrend.length === 0 ? (
          <div className="h-44 flex items-center justify-center text-xs text-neutral-500">
            No reviews analyzed yet. Run a review to view trend.
          </div>
        ) : (
          <div className="h-44 flex items-end gap-2 pt-6 pb-2 px-2 border-b border-neutral-800">
            {scoreTrend.map((item, idx) => {
              const heightPct = Math.max(15, item.score);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-black border border-neutral-700 text-white text-[10px] px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-20">
                    {item.title || 'Review'}: <span className="font-bold">{item.score}/100</span>
                  </div>

                  <span className="text-[10px] text-neutral-400">{item.score}</span>
                  <div className="w-full bg-black rounded-t h-28 flex items-end p-0.5 border-t border-neutral-800">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-white group-hover:bg-neutral-300 rounded-t transition-all duration-700"
                    />
                  </div>
                  <span className="text-[9px] text-neutral-500 truncate max-w-[40px]">
                    #{idx + 1}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between mt-3 text-[10px] text-neutral-500">
          <span>0 (Critical)</span>
          <span>Target: 85+ (Clean)</span>
          <span>100</span>
        </div>
      </div>
    </div>
  );
};
