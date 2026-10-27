import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import {
  Briefcase,
  ShieldCheck,
  ShieldAlert,
  Star,
  MapPin,
  RefreshCw,
  Tag,
  CheckCircle,
  XCircle
} from 'lucide-react';

export const ProviderManagement = () => {
  const { showToast } = useAuth();
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterVerified, setFilterVerified] = useState('all'); // 'all' | 'verified' | 'unverified'

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProviders(true);
      setProviders(data || []);
    } catch (err) {
      showToast(err.message || 'Failed to fetch providers', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleToggleVerification = async (provider) => {
    const nextStatus = !provider.is_verified;
    try {
      await api.toggleProviderVerification(provider.id, nextStatus);
      showToast(
        `Provider ${provider.business_name} verification status: ${nextStatus ? 'Verified' : 'Unverified'}`,
        'success'
      );
      setProviders(prev =>
        prev.map(p => (p.id === provider.id ? { ...p, is_verified: nextStatus } : p))
      );
    } catch (err) {
      showToast(err.message || 'Failed to update verification', 'error');
    }
  };

  const filteredProviders = providers.filter(p => {
    if (filterVerified === 'verified') return p.is_verified;
    if (filterVerified === 'unverified') return !p.is_verified;
    return true;
  });

  return (
    <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/80 shadow-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Provider Verification & Audits</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit trade licenses, experience validation, and toggle verified platform badges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterVerified}
            onChange={(e) => setFilterVerified(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Verification States</option>
            <option value="verified">Verified Only</option>
            <option value="unverified">Pending Audit</option>
          </select>

          <button
            onClick={fetchProviders}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-700/60">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-700/80">
              <th className="py-3 px-4 font-semibold">Business / Specialist</th>
              <th className="py-3 px-4 font-semibold">Assigned Skills</th>
              <th className="py-3 px-4 font-semibold">Experience</th>
              <th className="py-3 px-4 font-semibold">Verification Badge</th>
              <th className="py-3 px-4 font-semibold text-right">Audit Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50 text-slate-300">
            {filteredProviders.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  No providers found matching current filter.
                </td>
              </tr>
            ) : (
              filteredProviders.map((p) => (
                <tr key={p.id} className="hover:bg-slate-750/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.full_name)}&background=6366f1&color=fff`}
                        alt={p.full_name}
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700 flex-shrink-0"
                      />
                      <div>
                        <div className="font-bold text-white text-sm flex items-center gap-1.5">
                          {p.business_name}
                          {p.is_verified && (
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Contact: {p.full_name} • {p.phone_number}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {(p.categories || ['General']).map((cat) => (
                        <span
                          key={cat}
                          className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 text-[10px] font-semibold border border-indigo-500/20"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-200">
                    {p.experience_years} Years
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        p.is_verified
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {p.is_verified ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                      {p.is_verified ? 'Verified Active' : 'Pending Audit'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleToggleVerification(p)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        p.is_verified
                          ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                      }`}
                    >
                      {p.is_verified ? 'Revoke Badge' : 'Verify & Approve'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

