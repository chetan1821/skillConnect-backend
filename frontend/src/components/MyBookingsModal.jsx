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
      Pending: 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      Accepted: 'bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800',
      'In Progress': 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      Completed: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      Cancelled: 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      Declined: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    };
    return map[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">My Service Appointments</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Track scheduled calls & 2-stage verification OTPs</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchBookings}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bookings List */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No bookings yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
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
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all shadow-sm space-y-3.5"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        Booking #{b.id}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500">•</span>
                      <span className="font-semibold text-indigo-700 dark:text-indigo-400 text-xs">
                        {b.provider_business_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold border ${statusBadge(
                          b.status
                        )}`}
                      >
                        {b.status}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] border border-slate-200 dark:border-slate-600">
                        {b.payment_status || 'IN_ESCROW'}
                      </span>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {b.total_amount || `₹${b.total_amount_numeric}`}
                      </span>
                    </div>
                  </div>

                  {/* Core Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                      <span>{b.scheduled_date} ({b.time_slot})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                      <span className="truncate">{b.service_address}</span>
                    </div>

                    {b.service_note && (
                      <div className="sm:col-span-2 text-slate-500 dark:text-slate-400 text-[11px] bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        <strong>Note:</strong> {b.service_note}
                      </div>
                    )}
                  </div>

                  {/* Security OTP Display Panel */}
                  {isActive && (
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700">
                      <div className="p-2 sm:p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-center">
                        <span className="text-[10px] font-bold uppercase text-amber-800 dark:text-amber-300 flex items-center justify-center gap-1">
                          <Key className="w-3 h-3" />
                          <span>Start OTP</span>
                        </span>
                        <div className="text-lg sm:text-xl font-mono font-black text-amber-950 dark:text-amber-200 tracking-widest mt-0.5">
                          {b.start_otp || '----'}
                        </div>
                        <span className="text-[9px] text-amber-700 dark:text-amber-400 block mt-0.5">
                          Give upon arrival
                        </span>
                      </div>

                      <div className="p-2 sm:p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-center">
                        <span className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Completion OTP</span>
                        </span>
                        <div className="text-lg sm:text-xl font-mono font-black text-emerald-950 dark:text-emerald-200 tracking-widest mt-0.5">
                          {b.completion_otp || '----'}
                        </div>
                        <span className="text-[9px] text-emerald-700 dark:text-emerald-400 block mt-0.5">
                          Give when job is done
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Pending Extra Quotes Workflow */}
                  {pendingQuotes.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 space-y-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>Extra Quote Requested by Specialist:</span>
                      </div>
                      {pendingQuotes.map((q) => (
                        <div key={q.id} className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-amber-200/80 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="text-xs">
                            <p className="font-bold text-slate-900 dark:text-white">Amount: ₹{q.amount}</p>
                            <p className="text-slate-600 dark:text-slate-400 text-[11px]">{q.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleResolveQuote(q.id, 'APPROVE')}
                              disabled={resolvingQuoteId === q.id}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleResolveQuote(q.id, 'REJECT')}
                              disabled={resolvingQuoteId === q.id}
                              className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center gap-1 active:scale-95"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Decline</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions Bar */}
                  {canCancel && (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleCancel(b.id)}
                        disabled={cancellingId === b.id}
                        className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-bold transition-all disabled:opacity-50 active:scale-95"
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
