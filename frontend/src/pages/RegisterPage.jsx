import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, Lock, Mail, User, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [defaultLanguage, setDefaultLanguage] = useState('javascript');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-neutral-800' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score === 1) return { score: 25, label: 'Weak', color: 'bg-neutral-600' };
    if (score === 2) return { score: 50, label: 'Fair', color: 'bg-neutral-500' };
    if (score === 3) return { score: 75, label: 'Good', color: 'bg-neutral-300' };
    return { score: 100, label: 'Strong', color: 'bg-white' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    try {
      setIsLoading(true);
      await register({
        name,
        email,
        password,
        defaultLanguage,
      });
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-black font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-none bg-neutral-900 border border-neutral-800 text-white mb-3">
            <Code2 className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Create Developer Account</h2>
        </div>

        <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-6 sm:p-8">
          {errorMessage && (
            <div className="mb-5 p-3 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-xs">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dhanush kumar"
                  className="w-full bg-black border border-neutral-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-white transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Work or Personal Email
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
                  placeholder="Minimum 6 characters"
                  className="w-full bg-black border border-neutral-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-white transition-colors"
                  required
                />
              </div>

              {password && (
                <div className="mt-2">
                  <div className="h-1 w-full bg-black rounded-full overflow-hidden border border-neutral-800">
                    <div
                      style={{ width: `${strength.score}%` }}
                      className={`h-full ${strength.color} transition-all duration-300`}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-neutral-500 mt-1 font-sans">
                    <span>Password Strength:</span>
                    <span className="font-semibold text-white">{strength.label}</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Primary Programming Language
              </label>
              <select
                value={defaultLanguage}
                onChange={(e) => setDefaultLanguage(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors font-sans"
              >
                <option value="javascript">JavaScript (Node.js, React, TypeScript)</option>
                <option value="python">Python (3.x, FastAPI, Django)</option>
                <option value="java">Java (Spring Boot, Core Java)</option>
                <option value="c">C (C99/C11, Systems)</option>
                <option value="cpp">C++ (C++17/20, Systems)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-all disabled:opacity-50 mt-4"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-black" />
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-neutral-400 font-sans">
            Already registered?{' '}
            <Link to="/login" className="text-white hover:underline font-semibold">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
