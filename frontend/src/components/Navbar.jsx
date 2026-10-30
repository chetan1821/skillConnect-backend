import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
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
  Calendar
} from 'lucide-react';

export const Navbar = ({ onOpenAuth, onSelectCategory, onOpenMyBookings }) => {
  const {
    user,
    logout,
    activeRoleView,
    setViewMode
  } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
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
            {user && (
              <button
                onClick={onOpenMyBookings}
                className="hover:text-indigo-600 transition-colors flex items-center gap-1.5 text-indigo-700 font-semibold"
              >
                <Calendar className="w-4 h-4 text-indigo-600" />
                My Bookings
              </button>
            )}
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Portal Switcher Pills for logged-in staff/customers */}
          {user && user.role === 'Admin' && (
            <button
              onClick={() => setViewMode(activeRoleView === 'admin' ? 'customer' : 'admin')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{activeRoleView === 'admin' ? 'Marketplace View' : 'Admin Suite'}</span>
            </button>
          )}

          {user && user.role === 'Provider' && (
            <button
              onClick={() => setViewMode(activeRoleView === 'provider' ? 'customer' : 'provider')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{activeRoleView === 'provider' ? 'Marketplace View' : 'Provider Portal'}</span>
            </button>
          )}

          {user && user.role === 'Customer' && (
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

                    {user.role === 'Admin' && (
                      <button
                        onClick={() => {
                          setViewMode(activeRoleView === 'admin' ? 'customer' : 'admin');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                      >
                        <Layers className="w-3.5 h-3.5 text-indigo-600" />
                        {activeRoleView === 'admin' ? 'Switch to Marketplace' : 'Admin Operations Suite'}
                      </button>
                    )}

                    {user.role === 'Provider' && (
                      <button
                        onClick={() => {
                          setViewMode(activeRoleView === 'provider' ? 'customer' : 'provider');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                      >
                        <Layers className="w-3.5 h-3.5 text-indigo-600" />
                        {activeRoleView === 'provider' ? 'Switch to Marketplace' : 'Provider Portal'}
                      </button>
                    )}
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
          {user && (
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
          )}
          {user && user.role === 'Admin' && (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setViewMode(activeRoleView === 'admin' ? 'customer' : 'admin');
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-indigo-700 bg-indigo-50 font-bold text-sm flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>{activeRoleView === 'admin' ? 'Marketplace View' : 'Admin Operations Suite'}</span>
            </button>
          )}
          {user && user.role === 'Provider' && (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setViewMode(activeRoleView === 'provider' ? 'customer' : 'provider');
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-indigo-700 bg-indigo-50 font-bold text-sm flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>{activeRoleView === 'provider' ? 'Marketplace View' : 'Provider Portal'}</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
