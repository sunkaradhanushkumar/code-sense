import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { reviewApi } from '../api/reviewApi';
import { useToast } from '../context/ToastContext';
import { ScoreGauge } from '../components/common/ScoreGauge';
import { IssueCard } from '../components/review/IssueCard';
import { CategoryFilter } from '../components/review/CategoryFilter';
import { CodeDiffViewer } from '../components/review/CodeDiffViewer';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const ReviewResultsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const [review, setReview] = useState(location.state?.reviewData || null);
  const [isLoading, setIsLoading] = useState(!review);
  const [activeTab, setActiveTab] = useState('issues');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedSummary, setCopiedSummary] = useState(false);

  useEffect(() => {
    if (!review && id) {
      const loadReview = async () => {
        try {
          const res = await reviewApi.getReviewById(id);
          if (res && res.data) {
            setReview(res.data);
          }
        } catch (err) {
          const cached = sessionStorage.getItem('current_review');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed._id === id || parsed.id === id) {
              setReview(parsed);
              setIsLoading(false);
              return;
            }
          }
          toast.error('Could not find review record.');
        } finally {
          setIsLoading(false);
        }
      };

      loadReview();
    }
  }, [id, review]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Retrieving code audit results..." />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center bg-neutral-950 border border-neutral-800 rounded-xl">
        <h3 className="text-base font-bold text-white">Review Not Found</h3>
        <p className="text-xs text-neutral-400 mt-2">
          This review might have been removed or you may need to run a new analysis.
        </p>
        <Link
          to="/workspace"
          className="inline-block mt-4 px-4 py-2 rounded-lg bg-white text-black text-xs font-semibold"
        >
          Go to Workspace
        </Link>
      </div>
    );
  }

  const filteredIssues = (review.issues || []).filter((issue) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'style') {
      return issue.type === 'style' || issue.type === 'best-practice';
    }
    return issue.type === selectedCategory;
  });

  const handleExportMarkdown = () => {
    const md = `# Code Sense - Code Review Report
**Date:** ${new Date(review.createdAt || Date.now()).toLocaleDateString()}
**Language:** ${review.language === 'cpp' ? 'C++' : review.language === 'c' ? 'C' : review.language.toUpperCase()}
**Quality Score:** ${review.qualityScore}/100 (${review.summary?.scoreVerdict || 'Evaluated'})
**Lines of Code:** ${review.metrics?.linesOfCode || 'N/A'}

## Executive Summary
${review.summary?.executiveSummary || 'No executive summary provided.'}

## Detected Issues (${review.issues?.length || 0})
${(review.issues || [])
  .map(
    (iss, idx) => `
### ${idx + 1}. [${iss.severity.toUpperCase()}] ${iss.title} (Line ${iss.line})
- **Type:** ${iss.type}
- **Description:** ${iss.description}
- **Beginner Explanation:** ${iss.beginnerExplanation}
- **Action:** ${iss.suggestion}
\`\`\`
${iss.codeSnippet}
\`\`\`
`
  )
  .join('\n')}

## Optimized Code
\`\`\`${review.language}
${review.optimizedCode || review.sourceCode}
\`\`\`
`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CodeSense_Report_${review.language}_${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Downloaded Markdown review report.');
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(review, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CodeSense_Review_${review.language}_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Downloaded JSON review report.');
  };

  const handleCopySummary = () => {
    const text = `Code Sense Review: ${review.title} | Score: ${review.qualityScore}/100 (${review.summary?.scoreVerdict}) | ${review.summary?.totalIssues} issues found.`;
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
    toast.info('Copied review summary to clipboard.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/workspace"
          className="inline-flex items-center text-xs font-sans font-medium text-neutral-400 hover:text-white transition-colors"
        >
          Back to Workspace
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopySummary}
            className="px-3 py-1.5 rounded-lg text-xs font-sans bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors"
          >
            {copiedSummary ? 'Copied' : 'Copy Summary'}
          </button>

          <button
            onClick={handleExportMarkdown}
            className="px-3 py-1.5 rounded-lg text-xs font-sans bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors"
          >
            Export Markdown
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 rounded-lg text-xs font-sans bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors"
          >
            Export JSON
          </button>

          <Link
            to="/workspace"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-black hover:bg-neutral-200 transition-all"
          >
            Analyze Another
          </Link>
        </div>
      </div>

      {/* Hero Score & Executive Summary Card */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Circular Score Gauge */}
          <div className="lg:col-span-3 flex flex-col items-center justify-center p-4 bg-black rounded-xl border border-neutral-800">
            <ScoreGauge score={review.qualityScore} size={130} strokeWidth={9} showLabel={true} />
            <div className="mt-3 text-center">
              <span className="text-[10px] font-sans uppercase tracking-wider text-neutral-500">
                Code Health Index
              </span>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-white tracking-tight">
                {review.title || 'Code Review Report'}
              </h1>
              <span className="text-xs font-sans font-semibold text-neutral-400">
                {review.language === 'cpp' ? 'C++' : review.language === 'c' ? 'C' : review.language.toUpperCase()}
              </span>
              {review.metrics?.engine && (
                <span className="text-[10px] font-sans text-neutral-500">
                  • {review.metrics.engine}
                </span>
              )}
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed font-sans">
              {review.summary?.executiveSummary}
            </p>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-neutral-400 font-sans">
              <span>
                {review.metrics?.linesOfCode || review.sourceCode?.split('\n').length || 0} lines
              </span>
              <span>
                {review.metrics?.executionTimeMs || 320} ms latency
              </span>
              <span>
                Maintainability: {review.metrics?.maintainabilityIndex || 85}%
              </span>
            </div>
          </div>

          {/* Issues Breakdown Counter */}
          <div className="lg:col-span-3 grid grid-cols-2 gap-2.5 font-sans">
            <div className="p-3 rounded-lg bg-black border border-neutral-800">
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">
                Security
              </span>
              <p className="text-xl font-bold text-white mt-1">
                {review.summary?.securityCount || 0}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-black border border-neutral-800">
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">
                Bugs
              </span>
              <p className="text-xl font-bold text-white mt-1">
                {review.summary?.bugsCount || 0}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-black border border-neutral-800">
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">
                Perf
              </span>
              <p className="text-xl font-bold text-white mt-1">
                {review.summary?.performanceCount || 0}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-black border border-neutral-800">
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">
                Quality
              </span>
              <p className="text-xl font-bold text-white mt-1">
                {review.summary?.styleCount || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
        <button
          onClick={() => setActiveTab('issues')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-sans font-medium transition-all ${
            activeTab === 'issues'
              ? 'bg-white text-black font-semibold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          Detected Issues ({review.issues?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('diff')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-sans font-medium transition-all ${
            activeTab === 'diff'
              ? 'bg-white text-black font-semibold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          Refactored Code & Diff
        </button>

        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-sans font-medium transition-all ${
            activeTab === 'recommendations'
              ? 'bg-white text-black font-semibold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          Recommendations
        </button>
      </div>

      {/* Tab 1: Issues View */}
      {activeTab === 'issues' && (
        <div className="space-y-4">
          <CategoryFilter
            activeCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            counts={review.summary || {}}
          />

          {filteredIssues.length === 0 ? (
            <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-8 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-white mx-auto" />
              <h3 className="text-sm font-bold text-white">No Issues in this Category</h3>
              <p className="text-xs text-neutral-400">
                The code passed all checks in this category.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Code Diff & Optimized Code */}
      {activeTab === 'diff' && (
        <CodeDiffViewer
          originalCode={review.sourceCode}
          optimizedCode={review.optimizedCode || review.sourceCode}
          language={review.language}
          filename={review.filename}
        />
      )}

      {/* Tab 3: Key Recommendations */}
      {activeTab === 'recommendations' && (
        <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Strategic Architectural Recommendations</h3>
          </div>
          <p className="text-xs text-neutral-400">
            Recommended action items formulated by the code reviewer to elevate maintainability and security.
          </p>

          <div className="space-y-2.5 pt-2 font-sans">
            {(review.keyRecommendations && review.keyRecommendations.length > 0
              ? review.keyRecommendations
              : [
                  'Implement strict input validation on all external parameters and request bodies.',
                  'Maintain automated linting and unit tests in your continuous integration pipeline.',
                  'Refactor legacy syntax to modern idiom specifications.',
                ]
            ).map((rec, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3.5 rounded-lg bg-black border border-neutral-800 text-xs text-neutral-200"
              >
                <div className="w-5 h-5 rounded bg-neutral-900 border border-neutral-700 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div className="leading-relaxed">{rec}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
