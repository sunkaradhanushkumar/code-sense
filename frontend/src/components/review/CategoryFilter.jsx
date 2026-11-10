import React from 'react';

export const CategoryFilter = ({ activeCategory, onSelectCategory, counts = {} }) => {
  const categories = [
    { id: 'all', label: 'All Issues', count: counts.totalIssues || 0 },
    { id: 'bug', label: 'Bugs & Errors', count: counts.bugsCount || 0 },
    { id: 'security', label: 'Security Flaws', count: counts.securityCount || 0 },
    { id: 'performance', label: 'Performance', count: counts.performanceCount || 0 },
    { id: 'style', label: 'Code Quality', count: counts.styleCount || 0 },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 font-sans">
      {categories.map((cat) => {
        const isActive = activeCategory === cat.id;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all ${
              isActive
                ? 'bg-white text-black font-semibold'
                : 'bg-neutral-950 text-neutral-400 hover:bg-neutral-900 hover:text-white border border-neutral-800'
            }`}
          >
            <span>{cat.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] ${
                isActive ? 'bg-neutral-200 text-black' : 'bg-neutral-900 text-neutral-400'
              }`}
            >
              {cat.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
