import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const SettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [defaultLanguage, setDefaultLanguage] = useState(user?.preferences?.defaultLanguage || 'javascript');
  const [strictness, setStrictness] = useState(user?.preferences?.strictness || 'standard');
  const [showBeginnerExplanations, setShowBeginnerExplanations] = useState(
    user?.preferences?.showBeginnerExplanations !== false
  );
  const [customApiKey, setCustomApiKey] = useState(user?.preferences?.customApiKey || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    if (password && password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    try {
      setIsSaving(true);
      await updateProfile({
        name,
        email,
        defaultLanguage,
        strictness,
        showBeginnerExplanations,
        customApiKey,
        ...(password && { password }),
      });
      setPassword('');
      setConfirmPassword('');
      toast.success('Settings updated successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to update settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Profile Details Card */}
        <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-5 space-y-4">
          <div className="text-xs font-semibold text-white border-b border-neutral-800 pb-3 uppercase tracking-wider">
            <span>Profile Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
                required
              />
            </div>
          </div>
        </div>

        {/* AI Review Preferences */}
        <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-5 space-y-4">
          <div className="text-xs font-semibold text-white border-b border-neutral-800 pb-3 uppercase tracking-wider">
            <span>AI Review Engine Customization</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Default Workspace Language
              </label>
              <select
                value={defaultLanguage}
                onChange={(e) => setDefaultLanguage(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors capitalize"
              >
                <option value="javascript">JavaScript (ES6+, React, Node)</option>
                <option value="python">Python (3.x, PEP 8)</option>
                <option value="java">Java (JDK 8-21)</option>
                <option value="c">C (C99/C11)</option>
                <option value="cpp">C++ (C++17/20)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Default Strictness
              </label>
              <select
                value={strictness}
                onChange={(e) => setStrictness(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
              >
                <option value="standard">Standard (Bugs, Security, Style)</option>
                <option value="strict">Strict (Zero tolerance for smells)</option>
                <option value="lenient">Lenient (Critical vulnerabilities only)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showBeginnerExplanations}
                onChange={(e) => setShowBeginnerExplanations(e.target.checked)}
                className="w-4 h-4 rounded bg-black border-neutral-800 accent-white cursor-pointer"
              />
              <span className="text-xs text-neutral-300 font-sans">
                Display beginner-friendly breakdown cards on code issue cards
              </span>
            </label>
          </div>
        </div>

        {/* Custom API Key Integration Card */}
        <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="text-xs font-semibold text-white uppercase tracking-wider">
              <span>GEMINI API KEY</span>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-neutral-400 hover:text-white font-semibold underline"
            >
              Get Gemini Key
            </a>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed font-sans">
            Optionally provide your personal Gemini API key to run reviews with your own quota.
          </p>

          <div>
            <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
              Personal Gemini API Key
            </label>
            <input
              type="password"
              value={customApiKey}
              onChange={(e) => setCustomApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-black border border-neutral-800 rounded-lg px-3.5 py-2 text-xs font-sans text-white placeholder:text-neutral-600 focus:outline-none focus:border-white transition-colors"
            />
          </div>
        </div>

        {/* Change Password Card */}
        <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-5 space-y-4">
          <div className="text-xs font-semibold text-white border-b border-neutral-800 pb-3 uppercase tracking-wider">
            <span>Update Password</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep unchanged"
                className="w-full bg-black border border-neutral-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full bg-black border border-neutral-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 rounded-lg bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin text-black" />
            ) : (
              <span>Save Settings</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
