import React, { useState, useEffect } from 'react';
import { reviewApi } from '../api/reviewApi';
import { useToast } from '../context/ToastContext';
import { StatCard } from '../components/dashboard/StatCard';
import { QualityChart } from '../components/dashboard/QualityChart';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const DashboardPage = () => {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await reviewApi.getStats();
      if (response && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      toast.error('Failed to load dashboard statistics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Loading developer dashboard..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Reviews"
          value={stats?.totalReviews || 0}
          subtitle="Analyzed code snippets"
        />

        <StatCard
          title="Bugs Detected"
          value={stats?.totalBugs || 0}
          subtitle="Logical errors & syntax edge cases"
          tag={stats?.totalBugs > 0 ? 'Action Needed' : 'Clean'}
        />

        <StatCard
          title="Security Issues"
          value={stats?.totalSecurity || 0}
          subtitle="OWASP vulnerabilities"
          tag={stats?.totalSecurity > 0 ? 'High Risk' : 'Protected'}
        />

        <StatCard
          title="Avg Quality Score"
          value={`${stats?.averageQualityScore || 0}/100`}
          subtitle={
            (stats?.averageQualityScore || 0) >= 80
              ? 'Healthy code health'
              : 'Requires attention'
          }
        />
      </div>

      {/* Charts & Visual Analytics */}
      <QualityChart
        languageCounts={stats?.languageCounts || {}}
        scoreTrend={stats?.scoreTrend || []}
      />
    </div>
  );
};
