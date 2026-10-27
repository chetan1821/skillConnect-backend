import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { UserManagement } from './UserManagement';
import { CategoryManagement } from './CategoryManagement';
import { ProviderManagement } from './ProviderManagement';
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
  RefreshCw
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'categories' | 'providers'
  const [stats, setStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      showToast('Failed to load dashboard metrics', 'error');
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-16">
      {/* Admin Top Header */}
      <div className="bg-slate-950/80 border-b border-slate-800 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
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
                Connected to FastAPI backend endpoints (/admin/*)
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
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
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'users'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Users Management
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
              Categories & Skills
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
              Providers & Verification
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Metrics */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                Live Platform Metrics
              </h2>
              <button
                onClick={fetchStats}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStats ? 'animate-spin' : ''}`} />
                Refresh Data
              </button>
            </div>

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
                <div className="text-[11px] text-emerald-400 mt-2 font-medium flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  +12% this month
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
                <div className="text-[11px] text-slate-400 mt-2">Consumers ordering jobs</div>
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
                <div className="text-[11px] text-slate-400 mt-2">Specialist accounts</div>
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
                <div className="text-[11px] text-emerald-400/80 mt-2 font-medium">96% healthy status</div>
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
                <div className="text-[11px] text-rose-400/80 mt-2">Requires admin review</div>
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div
                onClick={() => setActiveTab('users')}
                className="bg-gradient-to-br from-indigo-950/60 to-slate-800/80 rounded-3xl p-6 border border-indigo-500/20 hover:border-indigo-500/50 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Manage Users & Roles</h3>
                <p className="text-xs text-slate-400">
                  Search user records, toggle activation states, and inspect registered emails & phone contacts.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('categories')}
                className="bg-gradient-to-br from-violet-950/60 to-slate-800/80 rounded-3xl p-6 border border-violet-500/20 hover:border-violet-500/50 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <div className="w-12 h-12 rounded-2xl bg-violet-600/20 text-violet-400 flex items-center justify-center mb-4">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Service Categories Directory</h3>
                <p className="text-xs text-slate-400">
                  Add new trades (e.g., Solar Installation, EV Charger Setup), edit descriptions, and manage visibility.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('providers')}
                className="bg-gradient-to-br from-emerald-950/60 to-slate-800/80 rounded-3xl p-6 border border-emerald-500/20 hover:border-emerald-500/50 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Provider Verification Desk</h3>
                <p className="text-xs text-slate-400">
                  Approve provider credentials, assign trade categories, and verify trade certificates.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'categories' && <CategoryManagement />}
        {activeTab === 'providers' && <ProviderManagement />}
      </div>
    </div>
  );
};

