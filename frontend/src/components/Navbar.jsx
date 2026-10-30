import NotificationDropdown from './NotificationDropdown';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Sparkles,
  ShieldCheck,
  User,
  LogOut,
  ChevronDown,
  Layers,
  Zap,
  Menu,
  X,
  Calendar,
  Sun,
  Moon
} from 'lucide-react';

export const Navbar = ({ onOpenAuth, onSelectCategory, onOpenMyBookings }) => {
  const {
    user,
    logout,
    activeRoleView,
    setViewMode
  } = useAuth();

  const { theme, toggleTheme, isDark } = useTheme();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => {
      if (onOpenMyBookings) onOpenMyBookings();
    };
    window.addEventListener('open-appointments', handleOpen);
    return () => window.removeEventListener('open-appointments', handleOpen);
  }, [onOpenMyBookings]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setViewMode('customer');
              closeMobileMenu();
            }}
            className="flex items-center gap-2.5 group text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 dark:from-white dark:via-indigo-200 dark:to-indigo-400 bg-clip-text text-transparent">
                SkillConnect
              </span>
              <span className="hidden sm:block text-[10px] tracking-widest text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                Expert Services Hub
              </span>
            </div>
          </button>
        </div>

        {/* Center Links (Customer View - Desktop) */}
        {activeRoleView === 'customer' && (
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#categories" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Services
            </a>
            <a href="#providers" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Find Professionals
            </a>
            <a href="#how-it-works" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              How it Works
            </a>
            {user && (
              <button
                onClick={onOpenMyBookings}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold"
              >
                <Calendar className="w-4 h-4" />
                <span>My Appointments</span>
              </button>
            )}
          </nav>
        )}

        {/* Right Actions (Desktop) */}
        <div className="flex items-center gap-2.5">
          {/* Theme Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:text-indigo-600 dark:hover:text-amber-300 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <Sun className="w-4 h-4 transition-transform rotate-0 scale-100" />
            ) : (
              <Moon className="w-4 h-4 transition-transform rotate-0 scale-100 text-slate-700" />
            )}
          </button>

          {/* Notifications Center */}
          {user && <NotificationDropdown />}

          {/* Quick Portal Switcher Pills for logged-in staff/customers */}
          {user && user.role === 'Admin' && (
            <button
              onClick={() => setViewMode(activeRoleView === 'admin' ? 'customer' : 'admin')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors shadow-sm"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{activeRoleView === 'admin' ? 'Marketplace' : 'Admin Operations'}</span>
            </button>
          )}

          {user && user.role === 'Provider' && (
            <button
              onClick={() => setViewMode(activeRoleView === 'provider' ? 'customer' : 'provider')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors shadow-sm"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{activeRoleView === 'provider' ? 'Marketplace' : 'Provider Portal'}</span>
            </button>
          )}

          {user && user.role === 'Customer' && (
            <button
              onClick={onOpenMyBookings}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Appointments</span>
            </button>
          )}

          {/* User Profile Dropdown (Desktop) */}
          {user ? (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all text-slate-700 dark:text-slate-200 text-sm font-medium shadow-sm"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {user.full_name?.charAt(0) || 'U'}
                </div>
                <div className="text-left">
                  <div className="leading-tight text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                    {user.full_name}
                  </div>
                  <div className="leading-tight text-[10px] text-indigo-600 dark:text-indigo-400 uppercase font-bold">
                    {user.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Signed in as</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold border border-indigo-100 dark:border-indigo-900">
                      {user.role} Account
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        onOpenMyBookings();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 font-medium transition-colors"
                    >
                      <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <span>My Appointments</span>
                    </button>

                    {user.role === 'Admin' && (
                      <button
                        onClick={() => {
                          setViewMode(activeRoleView === 'admin' ? 'customer' : 'admin');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 font-medium transition-colors"
                      >
                        <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>{activeRoleView === 'admin' ? 'Switch to Marketplace' : 'Admin Operations Suite'}</span>
                      </button>
                    )}

                    {user.role === 'Provider' && (
                      <button
                        onClick={() => {
                          setViewMode(activeRoleView === 'provider' ? 'customer' : 'provider');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 font-medium transition-colors"
                      >
                        <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>{activeRoleView === 'provider' ? 'Switch to Marketplace' : 'Provider Portal'}</span>
                      </button>
                    )}
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 font-bold transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md shadow-indigo-600/25 transition-all active:scale-95"
              >
                Get Started
              </button>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors shadow-sm"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation (Slide-Down / Sheet) */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-4 duration-200 shadow-xl">
          {/* User Info on Mobile if logged in */}
          {user ? (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {user.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{user.full_name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[170px]">{user.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold border border-indigo-200 dark:border-indigo-800">
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Theme toggle in mobile profile card */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-amber-400 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                <span className="text-[11px] font-bold">{isDark ? 'Light' : 'Dark'}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Theme Mode:</span>
              <button
                onClick={toggleTheme}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-2 shadow-sm"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                <span>{isDark ? 'Switch to Light' : 'Switch to Dark'}</span>
              </button>
            </div>
          )}

          {/* Mobile Links */}
          <div className="space-y-1">
            <a
              href="#categories"
              onClick={closeMobileMenu}
              className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Browse Services & Trades
            </a>
            <a
              href="#providers"
              onClick={closeMobileMenu}
              className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Verified Specialists
            </a>
            <a
              href="#how-it-works"
              onClick={closeMobileMenu}
              className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              How It Works
            </a>

            {user && (
              <button
                onClick={() => {
                  onOpenMyBookings();
                  closeMobileMenu();
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 flex items-center gap-2 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>My Appointments & OTPs</span>
              </button>
            )}
          </div>

          {/* Switch Roles / Quick actions on mobile */}
          {user && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
              {user.role === 'Admin' && (
                <button
                  onClick={() => {
                    setViewMode(activeRoleView === 'admin' ? 'customer' : 'admin');
                    closeMobileMenu();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Layers className="w-4 h-4" />
                  <span>{activeRoleView === 'admin' ? 'Switch to Marketplace' : 'Open Admin Operations Suite'}</span>
                </button>
              )}

              {user.role === 'Provider' && (
                <button
                  onClick={() => {
                    setViewMode(activeRoleView === 'provider' ? 'customer' : 'provider');
                    closeMobileMenu();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Layers className="w-4 h-4" />
                  <span>{activeRoleView === 'provider' ? 'Switch to Marketplace' : 'Open Provider Portal'}</span>
                </button>
              )}

              <button
                onClick={() => {
                  logout();
                  closeMobileMenu();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {/* Guest Sign In / Register Buttons on Mobile */}
          {!user && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex gap-2">
              <button
                onClick={() => {
                  onOpenAuth('login');
                  closeMobileMenu();
                }}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-sm shadow-sm"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  onOpenAuth('register');
                  closeMobileMenu();
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm shadow-md shadow-indigo-600/25"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
