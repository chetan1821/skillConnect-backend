import BookingTimeline from './BookingTimeline';
import BookingChatDrawer from './BookingChatDrawer';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  Briefcase,
  ShieldCheck,
  Clock,
  Calendar,
  CheckCircle2,
  MapPin,
  Phone,
  RefreshCw,
  XCircle,
  Play,
  Wallet,
  ArrowDownCircle,
  DollarSign,
  Key,
  PlusCircle,
  X,
  Send,
  AlertCircle,
  Receipt,
  MessageSquare
} from 'lucide-react';

export const ProviderPortal = ({ onSwitchToCustomer }) => {
  const { user, showToast } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [chatBooking, setChatBooking] = useState(null);

  // OTP Modals
  const [startOtpModalBooking, setStartOtpModalBooking] = useState(null);
  const [startOtpInput, setStartOtpInput] = useState('');

  const [completeOtpModalBooking, setCompleteOtpModalBooking] = useState(null);
  const [completeOtpInput, setCompleteOtpInput] = useState('');

  // Extra Quote Modal
  const [extraQuoteBooking, setExtraQuoteBooking] = useState(null);
  const [quoteTitle, setQuoteTitle] = useState('');
  const [quoteDescription, setQuoteDescription] = useState('');
  const [quoteAmount, setQuoteAmount] = useState('');

  // Withdraw Modal
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankAccountNote, setBankAccountNote] = useState('HDFC Bank A/C ending in 4821');

  const loadPortalData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [bookingsData, walletData] = await Promise.all([
        api.getProviderBookings().catch(() => []),
        api.getProviderWallet().catch(() => null)
      ]);
      setBookings(bookingsData || []);
      if (walletData) setWallet(walletData);
    } catch (err) {
      if (!silent) showToast(err.message || 'Failed to load specialist portal data', 'error');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPortalData(false);
    // Auto-poll every 3.5s so provider sees customer quote approvals and new bookings in real time!
    const interval = setInterval(() => {
      loadPortalData(true);
    }, 3500);

    const handleUpdate = () => loadPortalData(true);
    window.addEventListener('notification-updated', handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('notification-updated', handleUpdate);
    };
  }, []);

  const handleAcceptJob = async (bookingId) => {
    setIsUpdating(true);
    try {
      await api.updateBookingStatus(bookingId, 'Accepted');
      showToast(`Job #${bookingId} accepted! Prepare to visit the client.`, 'success');
      loadPortalData();
    } catch (err) {
      showToast(err.message || 'Failed to accept job', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeclineJob = async (bookingId) => {
    setIsUpdating(true);
    try {
      await api.updateBookingStatus(bookingId, 'Declined');
      showToast(`Job #${bookingId} declined`, 'info');
      loadPortalData();
    } catch (err) {
      showToast(err.message || 'Failed to decline job', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkInProgress = async (bookingId) => {
    setIsUpdating(true);
    try {
      await api.updateBookingStatus(bookingId, 'In Progress');
      showToast(`Job #${bookingId} is now In Progress!`, 'success');
      loadPortalData();
      window.dispatchEvent(new CustomEvent('notification-updated'));
    } catch (err) {
      showToast(err.message || 'Failed to update job status', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVerifyStartOtp = async (e) => {
    e.preventDefault();
    if (!startOtpInput.trim()) return;
    setIsUpdating(true);
    try {
      await api.startBookingJob(startOtpModalBooking.id, startOtpInput.trim());
      showToast('Start OTP verified! Job status is now Started.', 'success');
      setStartOtpModalBooking(null);
      setStartOtpInput('');
      loadPortalData();
    } catch (err) {
      showToast(err.message || 'Invalid Start OTP entered', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVerifyCompletionOtp = async (e) => {
    e.preventDefault();
    if (!completeOtpInput.trim()) return;
    setIsUpdating(true);
    try {
      await api.completeBookingJob(completeOtpModalBooking.id, completeOtpInput.trim());
      showToast('Completion OTP verified! Escrow payout released to your wallet.', 'success');
      setCompleteOtpModalBooking(null);
      setCompleteOtpInput('');
      loadPortalData();
      window.dispatchEvent(new CustomEvent('notification-updated'));
    } catch (err) {
      showToast(err.message || 'Invalid Completion OTP entered', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubmitExtraQuote = async (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(quoteAmount);
    if (!quoteTitle.trim() || !parsedAmount || parsedAmount <= 0) {
      showToast('Please provide a valid material title and amount', 'error');
      return;
    }
    setIsUpdating(true);
    try {
      await api.submitExtraQuote(extraQuoteBooking.id, {
        title: quoteTitle.trim(),
        description: quoteDescription.trim() || undefined,
        amount: parsedAmount
      });
      showToast('Extra quote submitted to customer for live in-app approval!', 'success');
      setExtraQuoteBooking(null);
      setQuoteTitle('');
      setQuoteDescription('');
      setQuoteAmount('');
      loadPortalData();
      window.dispatchEvent(new CustomEvent('notification-updated'));
    } catch (err) {
      showToast(err.message || 'Failed to submit extra quote', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleWithdrawFunds = async (e) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) {
      showToast('Please enter a valid withdrawal amount', 'error');
      return;
    }
    if (wallet && amt > wallet.available_balance) {
      showToast('Amount exceeds your available withdrawable balance', 'error');
      return;
    }
    setIsUpdating(true);
    try {
      const res = await api.requestWalletWithdrawal(amt, bankAccountNote);
      showToast(res.message || 'Payout transfer initiated!', 'success');
      setIsWithdrawModalOpen(false);
      setWithdrawAmount('');
      loadPortalData();
    } catch (err) {
      showToast(err.message || 'Withdrawal request failed', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Provider Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white pt-10 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-xl ring-4 ring-white/10 flex-shrink-0">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'P'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold tracking-tight">{user?.full_name || 'Specialist Desk'}</h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Specialist
                  </span>
                </div>
                <p className="text-indigo-200 text-xs mt-1">
                  Email: {user?.email} • Contact: {user?.phone_number || 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsWithdrawModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95"
              >
                <ArrowDownCircle className="w-4 h-4" />
                <span>Withdraw Payout</span>
              </button>

              <button
                onClick={onSwitchToCustomer}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/20"
              >
                Marketplace View
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 space-y-8">
        {/* Financial Wallet & Earnings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Available Balance */}
          <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-5 border border-emerald-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-emerald-700 text-xs font-bold">
              <span>Available for Withdrawal</span>
              <Wallet className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-950 mt-2">
              ₹{(wallet?.available_balance || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-700 mt-1 font-medium">
              Cleared earnings from finished jobs
            </div>
          </div>

          {/* Pending Escrow */}
          <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl p-5 border border-amber-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-amber-700 text-xs font-bold">
              <span>Pending in Escrow</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-3xl font-extrabold text-amber-950 mt-2">
              ₹{(wallet?.pending_balance || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-amber-700 mt-1 font-medium">
              Locked in active appointments
            </div>
          </div>

          {/* Total Lifetime Withdrawn */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Total Withdrawn to Bank</span>
              <Receipt className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">
              ₹{(wallet?.total_withdrawn || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Transferred to registered bank
            </div>
          </div>

          {/* Assigned Appointments */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Total Assigned Jobs</span>
              <Briefcase className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-3xl font-extrabold text-indigo-700 mt-2">
              {bookings.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Across all customer orders
            </div>
          </div>
        </div>

        {/* Requests Feed */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Assigned Customer Appointments & Live Dispatch</h2>
              <p className="text-xs text-slate-500">Accept bookings, verify Customer OTPs, and submit parts quotes</p>
            </div>
            <button
              onClick={loadPortalData}
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
                New customer bookings placed through the marketplace will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
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
                            : req.status === 'Started'
                            ? 'bg-blue-100 text-blue-800'
                            : req.status === 'In Progress'
                            ? 'bg-indigo-100 text-indigo-800'
                            : req.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {req.status}
                      </span>
                      <span className="text-xs text-slate-400">Order #{req.id}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100/70 text-emerald-800 text-[10px] font-bold">
                        Your Payout: ₹{req.provider_payout}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-indigo-700">
                      Service: {req.service_note || req.category_name || 'General Service'}
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

                    {/* Feature 4: Stepper Timeline */}
                    <BookingTimeline booking={req} />

                    {/* Extra Quotes attached */}
                    {req.extra_quotes && req.extra_quotes.length > 0 && (
                      <div className="pt-1 flex items-center gap-2 flex-wrap">
                        {req.extra_quotes.map(q => (
                          <span key={q.id} className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${q.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : q.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                            Extra: {q.title} (+₹{q.amount}) • {q.status}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions based on status */}
                  <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setChatBooking(req)}
                      className="px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat Customer</span>
                    </button>
                    {req.status === 'Pending' && (
                      <>
                        <button
                          disabled={isUpdating}
                          onClick={() => handleAcceptJob(req.id)}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        >
                          Accept Job
                        </button>
                        <button
                          disabled={isUpdating}
                          onClick={() => handleDeclineJob(req.id)}
                          className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-all disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {req.status === 'Accepted' && (
                      <button
                        onClick={() => {
                          setStartOtpModalBooking(req);
                          setStartOtpInput('');
                        }}
                        className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Start Work (Enter OTP)</span>
                      </button>
                    )}

                    {req.status === 'Started' && (
                      <>
                        <button
                          disabled={isUpdating}
                          onClick={() => handleMarkInProgress(req.id)}
                          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Mark In Progress</span>
                        </button>

                        <button
                          onClick={() => {
                            setExtraQuoteBooking(req);
                            setQuoteTitle('');
                            setQuoteDescription('');
                            setQuoteAmount('');
                          }}
                          className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>+ Extra Quote</span>
                        </button>

                        <button
                          onClick={() => {
                            setCompleteOtpModalBooking(req);
                            setCompleteOtpInput('');
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Complete (Enter OTP)</span>
                        </button>
                      </>
                    )}

                    {req.status === 'In Progress' && (
                      <>
                        <button
                          onClick={() => {
                            setExtraQuoteBooking(req);
                            setQuoteTitle('');
                            setQuoteDescription('');
                            setQuoteAmount('');
                          }}
                          className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>+ Extra Quote</span>
                        </button>

                        <button
                          onClick={() => {
                            setCompleteOtpModalBooking(req);
                            setCompleteOtpInput('');
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Complete (Enter OTP)</span>
                        </button>
                      </>
                    )}

                    {req.status === 'Completed' && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Paid to Wallet</span>
                      </span>
                    )}

                    {req.status === 'Cancelled' && (
                      <span className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 flex items-center gap-1">
                        <XCircle className="w-4 h-4 text-rose-500" />
                        <span>Cancelled</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Start OTP Modal */}
      {startOtpModalBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Key className="w-4 h-4 text-sky-600" />
                <span>Verify Start Job OTP</span>
              </h3>
              <button onClick={() => setStartOtpModalBooking(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Ask the client at the doorstep for their 4-digit <strong>Start OTP</strong> to verify arrival and begin work.
            </p>
            <form onSubmit={handleVerifyStartOtp} className="space-y-3">
              <input
                type="text"
                maxLength={6}
                required
                placeholder="Enter 4-digit Start OTP"
                value={startOtpInput}
                onChange={(e) => setStartOtpInput(e.target.value)}
                className="w-full text-center tracking-widest text-xl font-mono px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStartOtpModalBooking(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  Verify & Start
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete OTP Modal */}
      {completeOtpModalBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verify Completion OTP</span>
              </h3>
              <button onClick={() => setCompleteOtpModalBooking(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Ask the client to test the finished work and provide their 4-digit <strong>Completion OTP</strong> to automatically release your payout.
            </p>
            <form onSubmit={handleVerifyCompletionOtp} className="space-y-3">
              <input
                type="text"
                maxLength={6}
                required
                placeholder="Enter 4-digit Completion OTP"
                value={completeOtpInput}
                onChange={(e) => setCompleteOtpInput(e.target.value)}
                className="w-full text-center tracking-widest text-xl font-mono px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCompleteOtpModalBooking(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  Verify & Claim Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Extra Quote Modal */}
      {extraQuoteBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-indigo-600" />
                <span>Submit Extra Parts/Materials Quote</span>
              </h3>
              <button onClick={() => setExtraQuoteBooking(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Discovered extra parts required during work? Submit an itemized quote for live client approval before installation.
            </p>
            <form onSubmit={handleSubmitExtraQuote} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Item Title / Material *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 63A MCB Switch or 5m Copper Pipe"
                  value={quoteTitle}
                  onChange={(e) => setQuoteTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cost / Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 350.00"
                  value={quoteAmount}
                  onChange={(e) => setQuoteAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Description</label>
                <textarea
                  rows={2}
                  placeholder="Why is this replacement needed?"
                  value={quoteDescription}
                  onChange={(e) => setQuoteDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setExtraQuoteBooking(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  Send to Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feature 3: In-App Chat Drawer */}
      {chatBooking && <BookingChatDrawer booking={chatBooking} onClose={() => setChatBooking(null)} />}

      {/* Withdraw Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <ArrowDownCircle className="w-4 h-4 text-emerald-600" />
                <span>Withdraw Cleared Payout</span>
              </h3>
              <button onClick={() => setIsWithdrawModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
              Available to withdraw: <strong>₹{(wallet?.available_balance || 0).toLocaleString()}</strong>
            </div>
            <form onSubmit={handleWithdrawFunds} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Amount to Withdraw (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 500.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Destination Note</label>
                <input
                  type="text"
                  required
                  value={bankAccountNote}
                  onChange={(e) => setBankAccountNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  Confirm Payout Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
