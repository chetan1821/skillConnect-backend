import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  Briefcase,
  ShieldCheck,
  Star,
  Clock,
  Calendar,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  MapPin,
  Settings,
  Phone,
  Mail,
  Award,
  RefreshCw,
  XCircle,
  Play
} from 'lucide-react';

export const ProviderPortal = ({ onSwitchToCustomer }) => {
  const { user, showToast } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProviderBookings();
      setBookings(data || []);
    } catch (err) {
      showToast(err.message || 'Failed to fetch provider bookings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      await api.updateBookingStatus(bookingId, newStatus);
      showToast(`Booking #${bookingId} marked as ${newStatus}`, 'success');
      setBookings(prev =>
        prev.map(b => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // Metrics
  const pendingCount = bookings.filter(b => b.status === 'Pending').length;
  const completedCount = bookings.filter(b => b.status === 'Completed').length;
  const activeCount = bookings.filter(b => b.status === 'Accepted' || b.status === 'In Progress').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Provider Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white pt-10 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-xl ring-4 ring-white/10">
                {user?.full_name?.charAt(0) || 'P'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">{user?.full_name || 'Apex Precision Electricals'}</h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Provider
                  </span>
                </div>
                <p className="text-indigo-200 text-xs mt-1">
                  Master Electrician • 12 Years Experience • Active Service Dispatch
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-300">
                  <span className="flex items-center gap-1 text-amber-300 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    4.9 (148 Reviews)
                  </span>
                  <span>•</span>
                  <span>Registered Account: {user?.email}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onSwitchToCustomer}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/20"
              >
                View Marketplace
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Pending Requests</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-extrabold text-amber-600 mt-2">{pendingCount} Requests</div>
            <div className="text-[11px] text-amber-600/80 mt-1">Requires your confirmation</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Active Scheduled Jobs</span>
              <Calendar className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-extrabold text-sky-600 mt-2">{activeCount} Jobs</div>
            <div className="text-[11px] text-slate-500 mt-1">Accepted & in-progress</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Completed Jobs</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">{completedCount} Jobs</div>
            <div className="text-[11px] text-emerald-600 mt-1 font-semibold">100% resolution rate</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Est. Revenue</span>
              <DollarSign className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-extrabold text-indigo-700 mt-2">
              ${completedCount * 65 + activeCount * 65}
            </div>
            <div className="text-[11px] text-indigo-600 mt-1 font-semibold">Based on active bookings</div>
          </div>
        </div>

        {/* Requests Feed */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Incoming Job Requests & Appointments</h2>
              <p className="text-xs text-slate-500">Accept, reschedule, or complete assigned service jobs</p>
            </div>
            <button
              onClick={fetchBookings}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">No booking requests assigned yet.</p>
              <p className="text-xs text-slate-400 mt-1">
                New appointments booked by customers on the marketplace will appear here in real time.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((req) => (
                <div
                  key={req.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900">
                        {req.customer_name}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          req.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800'
                            : req.status === 'Accepted'
                            ? 'bg-sky-100 text-sky-800'
                            : req.status === 'In Progress'
                            ? 'bg-indigo-100 text-indigo-800'
                            : req.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {req.status}
                      </span>
                      <span className="text-xs text-slate-400">Booking #{req.id}</span>
                    </div>

                    <p className="text-xs font-semibold text-indigo-700">
                      Service: {req.service_note || req.category_name || 'General Electrical'}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {req.scheduled_date} ({req.time_slot})
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {req.service_address}
                      </span>
                      {req.customer_phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {req.customer_phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions based on status */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-extrabold text-slate-900 mr-2">
                      {req.total_amount || '$65.00'}
                    </span>

                    {req.status === 'Pending' && (
                      <>
                        <button
                          disabled={updatingId === req.id}
                          onClick={() => handleUpdateStatus(req.id, 'Accepted')}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        >
                          Accept Job
                        </button>
                        <button
                          disabled={updatingId === req.id}
                          onClick={() => handleUpdateStatus(req.id, 'Declined')}
                          className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-all disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {req.status === 'Accepted' && (
                      <button
                        disabled={updatingId === req.id}
                        onClick={() => handleUpdateStatus(req.id, 'In Progress')}
                        className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Start Work</span>
                      </button>
                    )}

                    {req.status === 'In Progress' && (
                      <button
                        disabled={updatingId === req.id}
                        onClick={() => handleUpdateStatus(req.id, 'Completed')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Complete Job</span>
                      </button>
                    )}

                    {req.status === 'Completed' && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Job Finished
                      </span>
                    )}

                    {req.status === 'Cancelled' && (
                      <span className="text-xs font-bold text-rose-500 flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                        Cancelled
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
