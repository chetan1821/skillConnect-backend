import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert, CheckCircle2, Lock } from 'lucide-react';
import { api } from '../api/client';

const DISPUTE_REASONS = [
  "Incomplete Work / Substandard Quality",
  "Provider No-Show or Excessive Delay",
  "Unauthorized Extra Charges / Pricing Dispute",
  "Property Damage or Careless Behavior",
  "Specialist Unresponsive / Left Before Finishing",
  "Other Quality or Safety Concern"
];

export default function DisputeModal({ booking, onClose, onSuccess }) {
  const [reason, setReason] = useState(DISPUTE_REASONS[0]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      setError('Please select a reason for the dispute.');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      await api.raiseBookingDispute(booking.id, {
        reason,
        notes: notes.trim() || undefined
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to raise dispute');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-red-500/10 via-amber-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Raise Dispute & Freeze Escrow</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Booking #{booking.id} • Specialist: {booking.provider_business_name || 'Specialist'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Escrow Lock Notice */}
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Instant Escrow Protection:</strong> Raising a dispute immediately freezes all payout funds. The specialist cannot withdraw funds until our Admin Arbitration team resolves the case.
            </div>
          </div>

          {/* Reason Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Primary Reason for Dispute
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {DISPUTE_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Notes & Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Explanation & Evidence Notes
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Please describe specifically what went wrong (e.g. leaking continued, specialist left without cleaning, extra unapproved charges requested)..."
              maxLength={1000}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>

          {/* Notice: Do not share OTP */}
          <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
            * <strong>Important:</strong> Do NOT share your Completion OTP with the specialist if you are raising a dispute.
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 shadow-lg shadow-red-500/25 transition-all disabled:opacity-50"
            >
              {submitting ? 'Submitting to Arbitration...' : 'Submit Formal Dispute'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
