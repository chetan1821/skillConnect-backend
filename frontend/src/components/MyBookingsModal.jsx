import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Phone,
  RefreshCw,
  Key,
  ShieldCheck,
  Lock,
  PlusCircle,
  Check,
  Ban
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const MyBookingsModal = ({ isOpen, onClose }) => {
  const { user, showToast } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [resolvingQuoteId, setResolvingQuoteId] = useState(null);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const data = await api.getMyBookings();
      setBookings(data || []);
    } catch (err) {
      showToast(err.message || 'Failed to fetch bookings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBookings();
    }
  }, [isOpen]);

  const handleCancel = async (bookingId) => {
    setCancellingId(bookingId);
    try {
      await api.cancelBooking(bookingId);
      showToast('Booking cancelled and escrow refunded', 'info');
      fetchBookings();
    } catch (err) {
      showToast(err.message || 'Failed to cancel booking', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const handleResolveQuote = async (quoteId, action) => {
    setResolvingQuoteId(quoteId);
    try {
      await api.resolveExtraQuote(quoteId, action);
      showToast(
        action === 'APPROVE' ? 'Extra quote approved and invoice updated!' : 'Extra quote rejected',
        action === 'APPROVE' ? 'success' : 'info'
      );
      fetchBookings();
    } catch (err) {
      showToast(err.message || 'Failed to resolve quote', 'error');
    } finally {
      setResolvingQuoteId(null);
    }
  };

  if (!isOpen) return null;

  const statusBadge = (status) => {
    const map = {
      Pending: 'bg-amber-100 text-amber-800 border-amber-200',
      Accepted: 'bg-sky-100 text-sky-800 border-sky-200',
      'In Progress': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      Completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      Cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
      Declined: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return map[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Service Appointments</h2>
              <p className="text-xs text-slate-500">Track and manage your scheduled service calls with Escrow security</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchBookings}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bookings List */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No bookings yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Explore our certified providers on the marketplace and book your first home service.
              </p>
            </div>
          ) : (
            bookings.map((b) => {
              const canCancel = b.status === 'Pending' || b.status === 'Accepted';
              const isActive = b.status !== 'Completed' && b.status !== 'Cancelled' && b.status !== 'Declined';
              const pendingQuotes = (b.extra_quotes || []).filter(q => q.status === 'PENDING');

              return (
                <div
                  key={b.id}
                  className="p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-indigo-300 transition-all shadow-sm space-y-3.5"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">
                        Booking #{b.id}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="font-semibold text-indigo-700 text-xs">
                        {b.provider_business_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusBadge(
                          b.status
                        )}`}
                      >
                        {b.status}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200">
                        {b.payment_status || 'IN_ESCROW'}
                      </span>
                      <span className="text-xs font-extrabold text-slate-900">
                        {b.total_amount || `₹${b.total_amount_numeric}`}
                      </span>
                    </div>
                  </div>

                  {/* Core Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                      <span>{b.scheduled_date} ({b.time_slot})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                      <span className="truncate">{b.service_address}</span>
                    </div>

                    {b.provider_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                        <span>Technician: {b.provider_name} ({b.provider_phone})</span>
                      </div>
                    )}
                  </div>

                  {b.service_note && (
                    <div className="p-2.5 rounded-xl bg-slate-50 text-[11px] text-slate-600 border border-slate-100">
                      <strong>Issue:</strong> {b.service_note}
                    </div>
                  )}

                  {/* Security OTP Verification Cards (Active Bookings Only) */}
                  {isActive && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200/90 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-amber-800 flex items-center gap-1">
                            <Key className="w-3 h-3 text-amber-600" />
                            <span>Start Job OTP</span>
                          </div>
                          <div className="text-[11px] text-amber-700">Give on doorstep arrival</div>
                        </div>
                        <span className="text-xl font-mono font-extrabold text-amber-950 tracking-wider bg-white/80 px-2.5 py-1 rounded-lg border border-amber-200">
                          {b.start_otp || '----'}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-50/90 border border-emerald-200/90 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-emerald-800 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Completion OTP</span>
                          </div>
                          <div className="text-[11px] text-emerald-700">Give ONLY when work is finished</div>
                        </div>
                        <span className="text-xl font-mono font-extrabold text-emerald-950 tracking-wider bg-white/80 px-2.5 py-1 rounded-lg border border-emerald-200">
                          {b.completion_otp || '----'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Pending Extra Quotes Action Required */}
                  {pendingQuotes.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-indigo-50/90 border border-indigo-200 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                        <AlertCircle className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                        <span>Action Required: Specialist Submitted Extra Parts/Labor Quote</span>
                      </div>
                      {pendingQuotes.map(q => (
                        <div key={q.id} className="p-3 rounded-xl bg-white border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="text-xs font-bold text-slate-900">{q.title}</div>
                            {q.description && <div className="text-[11px] text-slate-500">{q.description}</div>}
                            <div className="text-xs font-extrabold text-indigo-600 mt-0.5">Amount: ₹{q.amount}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              disabled={resolvingQuoteId === q.id}
                              onClick={() => handleResolveQuote(q.id, 'REJECT')}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors disabled:opacity-50"
                            >
                              Decline
                            </button>
                            <button
                              disabled={resolvingQuoteId === q.id}
                              onClick={() => handleResolveQuote(q.id, 'APPROVE')}
                              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve (₹{q.amount})</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Cancellation */}
                  {canCancel && (
                    <div className="flex justify-end pt-1">
                      <button
                        disabled={cancellingId === b.id}
                        onClick={() => handleCancel(b.id)}
                        className="px-3 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        {cancellingId === b.id ? 'Cancelling...' : 'Cancel Appointment & Refund Escrow'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
