import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ShieldCheck,
  User,
  LogOut,
  ChevronDown,
  Layers,
  Search,
  CheckCircle2,
  Server,
  Zap,
  Menu,
  X,
  Calendar
} from 'lucide-react';

export const Navbar = ({ onOpenAuth, onSelectCategory, onOpenMyBookings }) => {
  const {
    user,
    logout,
    activeRoleView,
    setViewMode,
    backendOnline,
    isDemoMode,
    toggleDemoMode,
    quickLoginAs
  } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      {/* Top Bar for System Status & Fast Role Switcher */}
      <div className="bg-slate-900 text-slate-300 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="font-medium text-slate-200">
              FastAPI: {backendOnline ? 'Online (localhost:8000)' : 'Not Connected'}
            </span>
          </div>

          <span className="text-slate-600">|</span>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={isDemoMode}
              onChange={(e) => toggleDemoMode(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
            />
            <span>Mock Fallback Mode</span>
          </label>
        </div>

        {/* Rapid Testing Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 hidden sm:inline">Simulate Portal:</span>
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setViewMode('customer')}
              className={`px-2.5 py-0.5 rounded-md font-medium text-[11px] transition-all ${
                activeRoleView === 'customer'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Consumer
            </button>
            <button
              onClick={() => {
                setViewMode('admin');
                if (!user || user.role !== 'Admin') {
                  quickLoginAs('admin');
                }
              }}
              className={`px-2.5 py-0.5 rounded-md font-medium text-[11px] transition-all ${
                activeRoleView === 'admin'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Admin Suite
            </button>
            <button
              onClick={() => {
                setViewMode('provider');
                if (!user || user.role !== 'Provider') {
                  quickLoginAs('provider');
                }
              }}
              className={`px-2.5 py-0.5 rounded-md font-medium text-[11px] transition-all ${
                activeRoleView === 'provider'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Provider Portal
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode('customer')}
            className="flex items-center gap-2 group text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent">
                SkillConnect
              </span>
              <span className="hidden sm:block text-[10px] tracking-widest text-indigo-600 font-semibold uppercase">
                Expert Services Hub
              </span>
            </div>
          </button>
        </div>

        {/* Center Links (Customer View) */}
        {activeRoleView === 'customer' && (
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#categories" className="hover:text-indigo-600 transition-colors">
              Services
            </a>
            <a href="#providers" className="hover:text-indigo-600 transition-colors">
              Find Professionals
            </a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">
              How it Works
            </a>
            <button
              onClick={onOpenMyBookings}
              className="hover:text-indigo-600 transition-colors flex items-center gap-1.5 text-indigo-700 font-semibold"
            >
              <Calendar className="w-4 h-4 text-indigo-600" />
              My Bookings
            </button>
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={onOpenMyBookings}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Appointments</span>
            </button>
          )}

          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all text-slate-700 text-sm font-medium"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  {user.full_name?.charAt(0) || 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="leading-tight text-xs font-bold text-slate-900">{user.full_name}</div>
                  <div className="leading-tight text-[10px] text-indigo-600 uppercase font-semibold">{user.role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-semibold text-slate-800 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold">
                      {user.role} Account
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        onOpenMyBookings();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      My Appointments
                    </button>
                    <button
                      onClick={() => {
                        setViewMode(user.role === 'Admin' ? 'admin' : user.role === 'Provider' ? 'provider' : 'customer');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      Switch to Dashboard
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20 transition-all hover:shadow-indigo-500/30 active:scale-95"
              >
                Join as Customer
              </button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3">
          <a
            href="#categories"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 font-medium text-sm"
          >
            Browse Services
          </a>
          <a
            href="#providers"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 font-medium text-sm"
          >
            Find Professionals
          </a>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              onOpenMyBookings();
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 font-medium text-sm flex items-center gap-2"
          >
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>My Bookings</span>
          </button>
        </div>
      )}
    </header>
  );
};
