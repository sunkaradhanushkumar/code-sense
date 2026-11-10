import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Trash2,
  FileCode,
  AlertTriangle,
} from 'lucide-react';
import { reviewApi } from '../api/reviewApi';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const ReviewHistoryPage = () => {
  const toast = useToast();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [deleteModalId, setDeleteModalId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const res = await reviewApi.getReviews({
        language: selectedLanguage !== 'all' ? selectedLanguage : undefined,
        search: searchTerm || undefined,
      });
      if (res && res.data) {
        setReviews(res.data);
      }
    } catch (err) {
      toast.error('Failed to load review history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [selectedLanguage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReviews();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalId) return;

    try {
      setIsDeleting(true);
      await reviewApi.deleteReview(deleteModalId);
      setReviews((prev) => prev.filter((r) => (r._id || r.id) !== deleteModalId));
      toast.success('Review record deleted.');
      setDeleteModalId(null);
    } catch (err) {
      toast.error('Failed to delete review.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reviews by title"
            className="w-full bg-black border border-neutral-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-white transition-colors"
          />
        </form>

        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
          {['all', 'javascript', 'python', 'java', 'c', 'cpp'].map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-3 py-1 rounded-lg text-xs transition-colors ${selectedLanguage === lang
                  ? 'bg-white text-black font-semibold'
                  : 'bg-black text-neutral-400 hover:text-white border border-neutral-800'
                }`}
            >
              {lang === 'all' ? 'All Languages' : lang === 'cpp' ? 'C++' : lang === 'c' ? 'C' : lang.charAt(0).toUpperCase() + lang.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Review Cards Grid */}
      {isLoading ? (
        <div className="py-16">
          <LoadingSpinner text="Fetching review audit records..." />
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-12 text-center space-y-3">
          <FileCode className="w-10 h-10 text-neutral-500 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No Review Records Found</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto font-sans">
            {searchTerm || selectedLanguage !== 'all'
              ? 'No reviews match your current filters. Try resetting search or language.'
              : 'You have not performed any code reviews yet. Start by analyzing code in the workspace!'}
          </p>
          <Link
            to="/workspace"
            className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-lg bg-white text-black text-xs font-semibold"
          >
            Go to Workspace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((rev) => {
            const id = rev._id || rev.id;
            const score = rev.qualityScore || 0;

            return (
              <div
                key={id}
                className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 flex flex-col justify-between hover:border-neutral-700 transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[11px] uppercase font-sans font-semibold tracking-wider text-neutral-400">
                      {rev.language === 'cpp' ? 'C++' : rev.language === 'c' ? 'C' : rev.language}
                    </span>

                    <span className="text-xs font-sans font-bold px-2 py-0.5 rounded border border-neutral-700 bg-neutral-900 text-white">
                      {score}/100
                    </span>
                  </div>

                  <h3 className="font-semibold text-white text-xs tracking-tight line-clamp-1 group-hover:underline transition-colors">
                    {rev.title || 'Untitled Review'}
                  </h3>

                  <p className="text-xs text-neutral-400 mt-2 line-clamp-2 leading-relaxed font-sans">
                    {rev.summary?.executiveSummary || 'No executive summary available.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 text-neutral-500 text-[11px]">
                    <span>
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                    {(rev.summary?.bugsCount > 0 || rev.summary?.securityCount > 0) && (
                      <span className="text-neutral-300">
                        {(rev.summary?.bugsCount || 0) + (rev.summary?.securityCount || 0)} issues
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setDeleteModalId(id)}
                      className="p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors"
                      title="Delete review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <Link
                      to={`/review/${id}`}
                      className="px-2.5 py-1 text-neutral-300 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors text-xs font-semibold"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-xl bg-neutral-950 border border-neutral-700 p-6 space-y-4">
            <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-700 text-white flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">Delete Code Review?</h3>
              <p className="text-xs text-neutral-400 mt-1 font-sans">
                Are you sure you want to delete this review? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteModalId(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-300 hover:text-white bg-black border border-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-black bg-white hover:bg-neutral-200 transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
