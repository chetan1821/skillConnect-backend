import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Scale,
  DollarSign,
  User,
  Briefcase,
  FileText,
  ArrowRight,
  Clock
} from 'lucide-react';
import { api } from '../../api/client';

export default function AdminDisputeManagement() {
  const [disputes, setDisputes] = useState([]);
  const [filter, setFilter] = useState('ALL'); // ALL, OPEN, RESOLVED
  const [loading, setLoading] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolutionAction, setResolutionAction] = useState('REFUND');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolving, setResolving] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminDisputes();
      setDisputes(data || []);
    } catch (err) {
      console.error('Failed to fetch disputes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!selectedDispute) return;
    setResolving(true);

    try {
      await api.resolveAdminDispute(selectedDispute.id, {
        action: resolutionAction,
        resolution_notes: resolutionNotes.trim() || undefined
      });
      setToastMsg({ type: 'success', text: `Dispute on Booking #${selectedDispute.id} resolved successfully!` });
      setSelectedDispute(null);
      setResolutionNotes('');
      fetchDisputes();
    } catch (err) {
      setToastMsg({ type: 'error', text: err.message || 'Failed to resolve dispute' });
    } finally {
      setResolving(false);
    }
  };

  const filteredDisputes = disputes.filter((d) => {
    if (filter === 'OPEN') return d.dispute_status === 'OPEN';
    if (filter === 'RESOLVED') return d.dispute_status && d.dispute_status.startsWith('RESOLVED');
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center font-bold shadow-sm">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Dispute & Arbitration Center</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Arbitrate between customers and specialists, inspect claims, and decide escrow payout, refund, or split settlements.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold">
            {['ALL', 'OPEN', 'RESOLVED'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filter === f
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={fetchDisputes}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {toastMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium flex items-center justify-between border ${
            toastMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900'
              : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900'
          }`}
        >
          <span>{toastMsg.text}</span>
          <button onClick={() => setToastMsg(null)} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* Disputes List */}
      {loading && disputes.length === 0 ? (
        <div className="p-12 text-center text-slate-400 space-y-2">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">Loading arbitration cases...</p>
        </div>
      ) : filteredDisputes.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">All Clear! No Active Disputes</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are currently no disputed bookings under this filter. Escrows are functioning smoothly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredDisputes.map((d) => {
            const isOpen = d.dispute_status === 'OPEN';
            return (
              <div
                key={d.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      Dispute on Booking #{d.id}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {d.scheduled_date} ({d.time_slot})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isOpen
                          ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {d.dispute_status}
                    </span>
                    <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                      Escrow: ₹{d.total_amount_numeric || d.base_amount}
                    </span>
                  </div>
                </div>

                {/* Parties Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                      <User className="w-3 h-3 text-indigo-500" />
                      Customer (Complainant)
                    </span>
                    <p className="font-bold text-slate-900 dark:text-white">{d.customer_name || `User #${d.customer_id}`}</p>
                    <p className="text-slate-500 truncate">{d.service_address}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-indigo-500" />
                      Specialist Provider
                    </span>
                    <p className="font-bold text-slate-900 dark:text-white">{d.provider_business_name || 'Specialist'}</p>
                    <p className="text-slate-500">Service: {d.category_name || 'General'}</p>
                  </div>
                </div>

                {/* Dispute Reason & Notes */}
                <div className="p-3.5 rounded-xl bg-red-50/60 dark:bg-red-950/30 border border-red-200/80 dark:border-red-900/60 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-900 dark:text-red-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    <span>Customer Issue: {d.dispute_reason || 'Quality or Service Dispute'}</span>
                  </div>
                  {d.dispute_notes && (
                    <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                      "{d.dispute_notes}"
                    </p>
                  )}
                </div>

                {/* Prior Resolution Note if resolved */}
                {d.dispute_resolution && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300">
                    <strong>Admin Ruling:</strong> {d.dispute_resolution}
                  </div>
                )}

                {/* Action button to open arbitrator prompt if open */}
                {isOpen && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDispute(d);
                        setResolutionAction('REFUND');
                        setResolutionNotes('');
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-indigo-600 hover:from-red-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-red-500/20 transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>Arbitrate & Release Funds</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Arbitration Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Arbitrate Booking #{selectedDispute.id}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Locked Escrow: ₹{selectedDispute.total_amount_numeric || selectedDispute.base_amount}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDispute(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResolve} className="p-6 space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Choose Settlement Ruling
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setResolutionAction('REFUND')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    resolutionAction === 'REFUND'
                      ? 'border-red-600 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-bold ring-2 ring-red-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="block text-xs font-bold">Full Refund</span>
                  <span className="text-[10px] opacity-80">100% to Customer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setResolutionAction('PAYOUT')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    resolutionAction === 'PAYOUT'
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold ring-2 ring-emerald-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="block text-xs font-bold">Full Payout</span>
                  <span className="text-[10px] opacity-80">100% to Provider</span>
                </button>

                <button
                  type="button"
                  onClick={() => setResolutionAction('SPLIT')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    resolutionAction === 'SPLIT'
                      ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold ring-2 ring-amber-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="block text-xs font-bold">50/50 Split</span>
                  <span className="text-[10px] opacity-80">Compromise</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Arbitration Notes / Justification
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Record why this decision was reached (will be recorded in audit log and sent to parties)..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDispute(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {resolving ? 'Executing Settlement...' : 'Enforce Ruling'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
