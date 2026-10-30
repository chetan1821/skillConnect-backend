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
  Ban,
  MessageSquare,
  CreditCard,
  FileText,
  Star,
  AlertTriangle
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import BookingTimeline from './BookingTimeline';
import BookingChatDrawer from './BookingChatDrawer';
import PaymentModal from './PaymentModal';
import ReviewModal from './ReviewModal';
import DisputeModal from './DisputeModal';

export const MyBookingsModal = ({ isOpen, onClose }) => {
  const { user, showToast } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [resolvingQuoteId, setResolvingQuoteId] = useState(null);

  // Sub-modal states
  const [chatBooking, setChatBooking] = useState(null);
  const [paymentBooking, setPaymentBooking] = useState(null);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [disputeBooking, setDisputeBooking] = useState(null);

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
      window.dispatchEvent(new CustomEvent('notification-updated'));
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
      window.dispatchEvent(new CustomEvent('notification-updated'));
    } catch (err) {
      showToast(err.message || 'Failed to resolve quote', 'error');
    } finally {
      setResolvingQuoteId(null);
    }
  };

  const handleOpenInvoice = (bookingId) => {
    const url = api.getBookingInvoiceUrl(bookingId);
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  const statusBadge = (status) => {
    const map = {
      Pending: 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      Accepted: 'bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800',
      'In Progress': 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      Started: 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
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
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                My Service Appointments
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track status timeline, chat with specialist, manage escrow and download tax invoices
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchBookings}
              disabled={isLoading}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Refresh Appointments"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {isLoading && bookings.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading appointments...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                <Briefcase className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">No appointments booked yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Explore our catalog of certified specialists and book your first home or business service with 100% escrow protection.
              </p>
            </div>
          ) : (
            bookings.map((b) => {
              const pendingQuotes = b.extra_quotes?.filter((q) => (q.status || '').toUpperCase() === 'PENDING') || [];
              const isActive = ['Pending', 'Accepted', 'In Progress', 'Started'].includes(b.status);
              const isCompleted = b.status === 'Completed';
              const isCancelled = b.status === 'Cancelled' || b.status === 'Declined';
              const canCancel = ['Pending', 'Accepted'].includes(b.status);
              const hasDispute = b.dispute_status && b.dispute_status !== 'NONE';

              return (
                <div
                  key={b.id}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-sm space-y-3.5 hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors"
                >
                  {/* Booking Header */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        Booking #{b.id}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500">•</span>
                      <span className="font-semibold text-indigo-700 dark:text-indigo-400 text-xs">
                        {b.provider_business_name}
                      </span>
                      {b.category_name && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          ({b.category_name})
                        </span>
                      )}
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

                  {/* Feature 4: Live Order Progress Stepper */}
                  <BookingTimeline booking={b} />

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

                  {/* 6 Feature Action Bar */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Feature 3: In-App Chat Specialist */}
                      {!isCancelled && (
                        <button
                          type="button"
                          onClick={() => setChatBooking(b)}
                          className="px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat Specialist</span>
                        </button>
                      )}

                      {/* Feature 2: Escrow Pay Checkout (if unpaid) */}
                      {b.payment_status === 'UNPAID' && !isCancelled && (
                        <button
                          type="button"
                          onClick={() => setPaymentBooking(b)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay Securely (Escrow)</span>
                        </button>
                      )}

                      {/* Feature 2: View / Print Tax Invoice */}
                      {b.payment_status !== 'UNPAID' && (
                        <button
                          type="button"
                          onClick={() => handleOpenInvoice(b.id)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
                          title="Download & Print Tax Invoice"
                        >
                          <FileText className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Tax Invoice</span>
                        </button>
                      )}

                      {/* Feature 1: Customer Review & Rating */}
                      {isCompleted && !b.review && (
                        <button
                          type="button"
                          onClick={() => setReviewBooking(b)}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-amber-500/20 active:scale-95"
                        >
                          <Star className="w-3.5 h-3.5 fill-white" />
                          <span>Rate Specialist</span>
                        </button>
                      )}

                      {/* Feature 6: Raise Dispute (Active bookings only) */}
                      {isActive && !hasDispute && (
                        <button
                          type="button"
                          onClick={() => setDisputeBooking(b)}
                          className="px-2.5 py-1.5 rounded-xl text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs font-semibold transition-all flex items-center gap-1"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          <span>Dispute</span>
                        </button>
                      )}
                    </div>

                    {/* Cancel Booking */}
                    {canCancel && (
                      <button
                        onClick={() => handleCancel(b.id)}
                        disabled={cancellingId === b.id}
                        className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-bold transition-all disabled:opacity-50 active:scale-95"
                      >
                        {cancellingId === b.id ? 'Cancelling...' : 'Cancel Appointment'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Sub-modals mounted seamlessly */}
      {chatBooking && (
        <BookingChatDrawer
          booking={chatBooking}
          onClose={() => setChatBooking(null)}
        />
      )}

      {paymentBooking && (
        <PaymentModal
          booking={paymentBooking}
          onClose={() => setPaymentBooking(null)}
          onSuccess={fetchBookings}
        />
      )}

      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSuccess={fetchBookings}
        />
      )}

      {disputeBooking && (
        <DisputeModal
          booking={disputeBooking}
          onClose={() => setDisputeBooking(null)}
          onSuccess={fetchBookings}
        />
      )}
    </div>
  );
};
export default MyBookingsModal;
