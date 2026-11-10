import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Code2,
  LayoutDashboard,
  Terminal,
  History,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, protected: true },
    { name: 'Workspace', path: '/workspace', icon: Terminal, protected: false },
    { name: 'History', path: '/history', icon: History, protected: true },
    { name: 'Settings', path: '/settings', icon: Settings, protected: true },
  ];

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-white" />
            <span className="text-base font-bold tracking-tight text-white">
              Code Sense
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              if (link.protected && !isAuthenticated) return null;
              const Icon = link.icon;
              const active = isActive(link.path);

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-colors ${active
                      ? 'text-white'
                      : 'text-neutral-400 hover:text-white'
                    }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-neutral-400'}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1 text-neutral-300 hover:text-white transition-colors"
                >
                  <img
                    src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name || 'Dev'}`}
                    alt="avatar"
                    className="w-7 h-7 object-cover"
                  />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-neutral-200 group-hover:text-white truncate max-w-[120px] transition-colors">
                      {user?.name}
                    </p>
                    <p className="text-[10px] text-neutral-400 capitalize">{user?.role || 'Dev'}</p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-neutral-950 border border-neutral-800 shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-neutral-800">
                      <p className="text-xs text-neutral-400">Signed in as</p>
                      <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-300 hover:text-white hover:bg-neutral-900"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-neutral-400" />
                      Dashboard
                    </Link>

                    <Link
                      to="/workspace"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-300 hover:text-white hover:bg-neutral-900"
                    >
                      <Terminal className="w-3.5 h-3.5 text-neutral-400" />
                      Code Workspace
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-300 hover:text-white hover:bg-neutral-900"
                    >
                      <Settings className="w-3.5 h-3.5 text-neutral-400" />
                      Settings
                    </Link>

                    <div className="border-t border-neutral-800 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-400 hover:bg-neutral-900 hover:text-white text-left transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-800 bg-black px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            if (link.protected && !isAuthenticated) return null;
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 text-xs font-medium transition-colors ${active ? 'text-white' : 'text-neutral-400 hover:text-white'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {link.name}
              </Link>
            );
          })}

          <div className="border-t border-neutral-800 pt-2 mt-2">
            {isAuthenticated ? (
              <div className="space-y-1">
                <div className="px-3 py-2 text-xs text-neutral-400">
                  Signed in as <span className="text-white font-semibold">{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-neutral-400 rounded-lg hover:bg-neutral-900 hover:text-white"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-1 space-y-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2 text-xs font-medium text-neutral-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2 text-xs font-medium text-neutral-300 hover:text-white transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
