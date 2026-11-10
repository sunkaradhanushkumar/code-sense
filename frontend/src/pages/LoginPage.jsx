import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Code2, Lock, Mail, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-black font-sans">
      <div className="w-full max-w-md">
        {/* Card Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-none bg-neutral-900 border border-neutral-800 text-white mb-3">
            <Code2 className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Sign In to Code Sense</h2>
        </div>

        {/* Login Form Container */}
        <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-6 sm:p-8">
          {errorMessage && (
            <div className="mb-5 p-3 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-xs">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sunkaradhanushkumar@gmail.com"
                  className="w-full bg-black border border-neutral-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-white transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black border border-neutral-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-white transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-all disabled:opacity-50 mt-3"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-black" />
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-neutral-400 font-sans">
            Don't have an account?{' '}
            <Link to="/register" className="text-white hover:underline font-semibold">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
