import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { ReviewResultsPage } from './pages/ReviewResultsPage';
import { ReviewHistoryPage } from './pages/ReviewHistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App = () => {
  const location = useLocation();
  const { isAuthenticated, token } = useAuth();
  const isNotLoggedIn = !isAuthenticated && !token;
  const showFooter = location.pathname === '/' && isNotLoggedIn;

  return (
    <div className="flex flex-col min-h-screen bg-black text-neutral-100">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/workspace" element={<WorkspacePage />} />
          <Route path="/review/:id" element={<ReviewResultsPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <ReviewHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default App;
