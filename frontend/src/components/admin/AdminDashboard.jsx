import AdminDisputeManagement from './AdminDisputeManagement';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { UserManagement } from './UserManagement';
import { CategoryManagement } from './CategoryManagement';
import { ProviderManagement } from './ProviderManagement';
import { BookingManagement } from './BookingManagement';
import { AuditLogsView } from './AuditLogsView';
import { AnnouncementControlModal } from './AnnouncementControlModal';
import {
  Users,
  Briefcase,
  Layers,
  CheckCircle,
  XCircle,
  TrendingUp,
  Shield,
  Activity,
  ArrowUpRight,
  RefreshCw,
  Calendar,
  History,
  Megaphone,
  DollarSign,
  Receipt,
  Percent,
  Wallet,
  Scale
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'bookings' | 'users' | 'categories' | 'providers' | 'audit'
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    setIsLoadingStats(true);
    try {
      const [statsData, analyticsData] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getAdminAnalytics().catch(() => null)
      ]);
      if (statsData) setStats(statsData);
      if (analyticsData) setAnalytics(analyticsData);
    } catch (err) {
      showToast('Failed to load dashboard metrics', 'error');
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-16">
      {/* Admin Top Header */}
      <div className="bg-slate-950/80 border-b border-slate-800 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400 flex-shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Admin Operations Suite</h1>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                  Role: {user?.role || 'Admin'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Connected to live FastAPI backend endpoints (/admin/*)
              </p>
            </div>
          </div>

          {/* Action & Tab Navigation */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Announcement Banner Trigger */}
            <button
              onClick={() => setIsAnnouncementModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Broadcast marketplace announcement banner"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Announcement</span>
            </button>

            {/* Tab navigation pills */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'overview'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                Overview
              </button>

              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'bookings'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Bookings Hub
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'users'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Users
              </button>

              <button
                onClick={() => setActiveTab('categories')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'categories'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Categories
              </button>

              <button
                onClick={() => setActiveTab('providers')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'providers'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                Providers
              </button>

              <button
                onClick={() => setActiveTab('disputes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'disputes'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                Disputes
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'audit'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                Audit Trail
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Header / Refresh Toolbar */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  Financial & Platform Analytics
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time GMV calculations, completed order revenues, and platform commission breakdown.
                </p>
              </div>
              <button
                onClick={fetchDashboardData}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors border border-slate-700 shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStats ? 'animate-spin' : ''}`} />
                Refresh Data
              </button>
            </div>

            {/* Financial Revenue Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Gross Merchandise Value (GMV) */}
              <div className="bg-gradient-to-br from-indigo-950/80 to-slate-800/90 rounded-2xl p-5 border border-indigo-500/30 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between text-indigo-300 text-xs font-semibold">
                  <span>Gross Platform GMV</span>
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white mt-2">
                  ₹{(analytics?.total_gmv || 0).toLocaleString()}
                </div>
                <div className="text-[11px] text-indigo-300/80 mt-2 font-medium flex items-center gap-1">
                  <span>Total value across all appointments</span>
                </div>
              </div>

              {/* Completed Revenue */}
              <div className="bg-gradient-to-br from-emerald-950/80 to-slate-800/90 rounded-2xl p-5 border border-emerald-500/30 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between text-emerald-300 text-xs font-semibold">
                  <span>Completed Revenue</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-emerald-300 mt-2">
                  ₹{(analytics?.completed_revenue || 0).toLocaleString()}
                </div>
                <div className="text-[11px] text-emerald-400/80 mt-2 font-medium">
                  {analytics?.completed_bookings || 0} successfully delivered jobs
                </div>
              </div>

              {/* Platform Commission (10%) */}
              <div className="bg-gradient-to-br from-violet-950/80 to-slate-800/90 rounded-2xl p-5 border border-violet-500/30 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between text-violet-300 text-xs font-semibold">
                  <span>Platform Commission (10%)</span>
                  <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400">
                    <Percent className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-violet-300 mt-2">
                  ₹{(analytics?.platform_commission || 0).toLocaleString()}
                </div>
                <div className="text-[11px] text-violet-400/80 mt-2 font-medium">
                  Net platform fee retained
                </div>
              </div>

              {/* Average Booking Size */}
              <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Avg. Booking Value</span>
                  <div className="w-7 h-7 rounded-lg bg-slate-700/50 flex items-center justify-center text-sky-400">
                    <Receipt className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-sky-300 mt-2">
                  ₹{(analytics?.average_booking_value || 0).toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-2">
                  Across {analytics?.total_bookings || 0} platform orders
                </div>
              </div>
            </div>

            {/* Platform Bookings & User Counts Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Total Users */}
              <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Total Users</span>
                  <Users className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-3xl font-extrabold text-white mt-2">
                  {stats?.total_users ?? 0}
                </div>
                <div className="text-[11px] text-indigo-400/90 mt-2 font-medium">
                  Total system members
                </div>
              </div>

              {/* Total Customers */}
              <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Customers</span>
                  <Users className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-3xl font-extrabold text-sky-300 mt-2">
                  {stats?.total_customers ?? 0}
                </div>
                <div className="text-[11px] text-slate-400 mt-2">
                  {analytics?.active_customers || 0} active consumers
                </div>
              </div>

              {/* Total Providers */}
              <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Service Providers</span>
                  <Briefcase className="w-4 h-4 text-violet-400" />
                </div>
                <div className="text-3xl font-extrabold text-violet-300 mt-2">
                  {stats?.total_providers ?? 0}
                </div>
                <div className="text-[11px] text-slate-400 mt-2">
                  {analytics?.active_providers || 0} verified & active
                </div>
              </div>

              {/* Active Accounts */}
              <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Active Accounts</span>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-extrabold text-emerald-400 mt-2">
                  {stats?.active_users ?? 0}
                </div>
                <div className="text-[11px] text-emerald-400/80 mt-2 font-medium">
                  {stats?.total_users ? Math.round((stats.active_users / stats.total_users) * 100) : 0}% health rate
                </div>
              </div>

              {/* Inactive Accounts */}
              <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Suspended / Inactive</span>
                  <XCircle className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-3xl font-extrabold text-rose-400 mt-2">
                  {stats?.inactive_users ?? 0}
                </div>
                <div className="text-[11px] text-rose-400/80 mt-2">Review pending</div>
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 pt-2">
              <div
                onClick={() => setActiveTab('bookings')}
                className="bg-gradient-to-br from-indigo-950/60 to-slate-800/80 rounded-3xl p-6 border border-indigo-500/20 hover:border-indigo-500/50 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Bookings & Disputes</h3>
                <p className="text-xs text-slate-400">
                  Inspect {analytics?.total_bookings || 0} platform bookings, resolve conflicts, and force status overrides.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('users')}
                className="bg-gradient-to-br from-sky-950/60 to-slate-800/80 rounded-3xl p-6 border border-sky-500/20 hover:border-sky-500/50 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <div className="w-12 h-12 rounded-2xl bg-sky-600/20 text-sky-400 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Users Directory</h3>
                <p className="text-xs text-slate-400">
                  Inspect user profiles, suspend abusive accounts, and export full member lists to CSV.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('providers')}
                className="bg-gradient-to-br from-emerald-950/60 to-slate-800/80 rounded-3xl p-6 border border-emerald-500/20 hover:border-emerald-500/50 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Specialist Multi-Skills</h3>
                <p className="text-xs text-slate-400">
                  Onboard tradespeople, attach multiple trade categories, and issue verification badges.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('audit')}
                className="bg-gradient-to-br from-violet-950/60 to-slate-800/80 rounded-3xl p-6 border border-violet-500/20 hover:border-violet-500/50 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <div className="w-12 h-12 rounded-2xl bg-violet-600/20 text-violet-400 flex items-center justify-center mb-4">
                  <History className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Activity Audit Trail</h3>
                <p className="text-xs text-slate-400">
                  Real-time timeline of administrative actions, disputes handled, and banner updates.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Sub-views */}
        {activeTab === 'bookings' && <BookingManagement />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'categories' && <CategoryManagement />}
        {activeTab === 'providers' && <ProviderManagement />}
        {activeTab === 'disputes' && <AdminDisputeManagement />}
        {activeTab === 'audit' && <AuditLogsView />}
      </div>

      {/* Global Marketplace Announcement Control Modal */}
      <AnnouncementControlModal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        onSuccess={() => {
          window.dispatchEvent(new CustomEvent('announcement-updated'));
        }}
      />
    </div>
  );
};
