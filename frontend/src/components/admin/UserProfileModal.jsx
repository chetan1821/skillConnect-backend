import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Shield,
  Briefcase,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Award,
  Building,
  RefreshCw,
  FileText,
  Activity
} from 'lucide-react';

export const UserProfileModal = ({ userId, initialUser, onClose, onUserUpdated }) => {
  const { user: currentAdmin, showToast } = useAuth();
  const [profile, setProfile] = useState(initialUser || null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingVerification, setIsUpdatingVerification] = useState(false);

  const fetchProfile = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const data = await api.getUserProfile(userId);
      setProfile(data);
    } catch (err) {
      showToast(err.message || 'Failed to load user profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  if (!userId) return null;

  const isCurrentAdmin = currentAdmin?.id === profile?.id;

  const handleToggleStatus = async () => {
    if (isCurrentAdmin) {
      showToast('You cannot deactivate your own admin account', 'error');
      return;
    }
    const newStatus = !profile.is_active;
    setIsUpdatingStatus(true);
    try {
      await api.toggleUserStatus(profile.id, newStatus);
      showToast(
        `User ${profile.full_name} is now ${newStatus ? 'Active' : 'Suspended'}`,
        'success'
      );
      setProfile(prev => ({ ...prev, is_active: newStatus }));
      if (onUserUpdated) onUserUpdated({ ...profile, is_active: newStatus });
    } catch (err) {
      showToast(err.message || 'Failed to update user status', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleToggleVerification = async () => {
    if (!profile.provider_id) return;
    const nextStatus = !profile.is_verified;
    setIsUpdatingVerification(true);
    try {
      await api.toggleProviderVerification(profile.provider_id, nextStatus);
      showToast(
        `Provider verification status: ${nextStatus ? 'Verified' : 'Unverified'}`,
        'success'
      );
      setProfile(prev => ({ ...prev, is_verified: nextStatus }));
      if (onUserUpdated) onUserUpdated({ ...profile, is_verified: nextStatus });
    } catch (err) {
      showToast(err.message || 'Failed to update verification', 'error');
    } finally {
      setIsUpdatingVerification(false);
    }
  };

  const getRoleGradient = (role) => {
    if (role === 'Admin') return 'from-amber-500 to-orange-600';
    if (role === 'Provider') return 'from-indigo-600 to-violet-600';
    return 'from-sky-500 to-blue-600';
  };

  const getRoleIcon = (role) => {
    if (role === 'Admin') return <Shield className="w-4 h-4" />;
    if (role === 'Provider') return <Briefcase className="w-4 h-4" />;
    return <User className="w-4 h-4" />;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-700/80 animate-in fade-in zoom-in-95 duration-150 text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header Strip */}
        <div className="relative bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${getRoleGradient(
                profile?.role
              )} text-white flex items-center justify-center font-extrabold text-2xl shadow-lg ring-4 ring-slate-800`}
            >
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {profile?.full_name || 'Loading profile...'}
                </h2>
                {isCurrentAdmin && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                    You
                  </span>
                )}
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    profile?.is_active
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {profile?.is_active ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Active Account
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      Suspended
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                    profile?.role === 'Admin'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : profile?.role === 'Provider'
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                      : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  }`}
                >
                  {getRoleIcon(profile?.role)}
                  <span>{profile?.role} Profile</span>
                </span>
                <span className="text-xs text-slate-400">User ID #{profile?.id}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {isLoading && !profile ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
              <span>Fetching user details...</span>
            </div>
          ) : (
            <>
              {/* Contact & Account Credentials Strip */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Account & Contact Credentials
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/70">
                    <div className="flex items-center gap-2 text-slate-400 text-[11px] mb-1">
                      <Mail className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Email Address</span>
                    </div>
                    <div className="font-semibold text-xs text-white truncate" title={profile.email}>
                      {profile.email}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/70">
                    <div className="flex items-center gap-2 text-slate-400 text-[11px] mb-1">
                      <Phone className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Contact Phone</span>
                    </div>
                    <div className="font-semibold text-xs text-white">
                      {profile.phone_number || 'Not provided'}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/70">
                    <div className="flex items-center gap-2 text-slate-400 text-[11px] mb-1">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Member Since</span>
                    </div>
                    <div className="font-semibold text-xs text-white">
                      {profile.created_at || 'Registered member'}
                    </div>
                  </div>
                </div>
              </div>

              {/* ROLE SPECIFIC: PROVIDER PROFILE */}
              {profile.role === 'Provider' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-violet-400" />
                      Specialist Business Details
                    </h3>

                    {profile.provider_id && (
                      <button
                        disabled={isUpdatingVerification}
                        onClick={handleToggleVerification}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                          profile.is_verified
                            ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                        }`}
                      >
                        {profile.is_verified ? (
                          <>
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Revoke Verification
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Verify Specialist
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="text-base font-bold text-white flex items-center gap-2">
                          {profile.business_name || 'Independent Specialist'}
                          {profile.is_verified ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                              <ShieldCheck className="w-3 h-3" />
                              Verified Pro
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                              <ShieldAlert className="w-3 h-3" />
                              Pending Verification
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-violet-400" />
                          <span>{profile.experience_years ?? 0} Years Trade Experience</span>
                        </div>
                      </div>
                    </div>

                    {profile.description && (
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                        {profile.description}
                      </p>
                    )}

                    {/* Assigned Categories */}
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 mb-1.5">
                        Assigned Trades & Categories
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.categories && profile.categories.length > 0 ? (
                          profile.categories.map((cat) => (
                            <span
                              key={cat}
                              className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30"
                            >
                              {cat}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 italic">
                            No trade categories assigned yet
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Provider Job Metrics */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
                      <div className="text-slate-400 text-[11px]">Total Jobs</div>
                      <div className="text-lg font-bold text-white mt-1">
                        {profile.total_bookings}
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
                      <div className="text-slate-400 text-[11px]">Completed</div>
                      <div className="text-lg font-bold text-emerald-400 mt-1">
                        {profile.completed_bookings}
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
                      <div className="text-slate-400 text-[11px]">Pending</div>
                      <div className="text-lg font-bold text-amber-400 mt-1">
                        {profile.pending_bookings}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ROLE SPECIFIC: CUSTOMER PROFILE */}
              {profile.role === 'Customer' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-sky-400" />
                      Client Booking Activity
                    </h3>
                  </div>

                  {/* Customer Booking KPIs */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
                      <div className="text-slate-400 text-[11px]">Appointments</div>
                      <div className="text-xl font-bold text-sky-300 mt-1">
                        {profile.total_bookings}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
                      <div className="text-slate-400 text-[11px]">Completed</div>
                      <div className="text-xl font-bold text-emerald-400 mt-1">
                        {profile.completed_bookings}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center">
                      <div className="text-slate-400 text-[11px]">In Progress / Pending</div>
                      <div className="text-xl font-bold text-amber-400 mt-1">
                        {profile.pending_bookings}
                      </div>
                    </div>
                  </div>

                  {/* Recent Bookings List */}
                  <div>
                    <div className="text-xs font-semibold text-slate-300 mb-2">
                      Recent Service Orders
                    </div>
                    {profile.recent_bookings && profile.recent_bookings.length > 0 ? (
                      <div className="space-y-2">
                        {profile.recent_bookings.map((b) => (
                          <div
                            key={b.id}
                            className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                          >
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>Booking #{b.id}</span>
                                {b.provider_business_name && (
                                  <span className="text-indigo-300 font-semibold">
                                    • {b.provider_business_name}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-slate-500" />
                                  {b.scheduled_date} ({b.time_slot})
                                </span>
                                <span className="flex items-center gap-1 truncate max-w-xs">
                                  <MapPin className="w-3 h-3 text-slate-500" />
                                  {b.service_address}
                                </span>
                              </div>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold self-start sm:self-center ${
                                b.status === 'Completed'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : b.status === 'Pending'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-sky-500/20 text-sky-300'
                              }`}
                            >
                              {b.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-center text-xs text-slate-500">
                        This customer has not placed any booking requests yet.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ROLE SPECIFIC: ADMIN PROFILE */}
              {profile.role === 'Admin' && (
                <div className="space-y-3">
                  <div className="border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-amber-400" />
                      Administrative Privileges
                    </h3>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                      <CheckCircle className="w-4 h-4" />
                      <span>Full System Administrator Authorization</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      This user has root administrative access to manage platform users, activate/deactivate accounts, audit provider certificates, and manage service categories.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          {profile && !isCurrentAdmin ? (
            <button
              disabled={isUpdatingStatus}
              onClick={handleToggleStatus}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                profile.is_active
                  ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
              }`}
            >
              {profile.is_active ? (
                <>
                  <XCircle className="w-4 h-4" />
                  <span>{isUpdatingStatus ? 'Updating...' : 'Deactivate Account'}</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>{isUpdatingStatus ? 'Updating...' : 'Activate Account'}</span>
                </>
              )}
            </button>
          ) : (
            <span className="text-xs text-slate-500 italic">
              {isCurrentAdmin ? 'Admin self-management restricted' : ''}
            </span>
          )}

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all border border-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

