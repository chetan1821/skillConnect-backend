import React from 'react';
import { Check, Clock, Play, Wrench, ShieldCheck, AlertTriangle, Key } from 'lucide-react';

const STEPS = [
  { key: 'PENDING', label: 'Booked', desc: 'Awaiting confirmation' },
  { key: 'ACCEPTED', label: 'Accepted', desc: 'Specialist assigned' },
  { key: 'STARTED', label: 'Started', desc: 'Doorstep OTP verified' },
  { key: 'IN_PROGRESS', label: 'In Progress', desc: 'Work underway' },
  { key: 'COMPLETED', label: 'Completed', desc: 'Escrow released' },
];

const STATUS_ORDER = {
  PENDING: 1,
  ACCEPTED: 2,
  STARTED: 3,
  IN_PROGRESS: 4,
  'IN PROGRESS': 4,
  COMPLETED: 5,
  CANCELLED: -1,
  DECLINED: -1,
};

export default function BookingTimeline({ booking, isProvider = false }) {
  if (!booking) return null;

  const rawStatus = (booking.status || 'PENDING').toUpperCase();
  const currentStatus = rawStatus.replace(/[\s_-]+/g, '_');
  const currentStep = STATUS_ORDER[currentStatus] || STATUS_ORDER[rawStatus] || 1;
  const isCancelled = currentStatus === 'CANCELLED' || currentStatus === 'DECLINED';
  const hasDispute = booking.dispute_status && booking.dispute_status !== 'NONE';

  if (isCancelled) {
    return (
      <div className="my-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-semibold">
          <AlertTriangle className="w-4 h-4" />
          <span>Booking {booking.status}</span>
        </div>
        {booking.cancellation_reason && (
          <span className="text-red-600 dark:text-red-400/80 italic">{booking.cancellation_reason}</span>
        )}
      </div>
    );
  }

  return (
    <div className="my-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
      {/* Dispute Alert Banner */}
      {hasDispute && (
        <div className="mb-3 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span>
              <strong>Dispute In Arbitration:</strong> {booking.dispute_reason || 'Under review'}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200">
            {booking.dispute_status}
          </span>
        </div>
      )}

      {/* Stepper Bar */}
      <div className="relative pt-1 pb-1">
        {/* Track Container aligned exactly from center of step 1 (10%) to center of step 5 (90%) */}
        <div className="absolute top-[17px] left-[10%] right-[10%] h-1 -z-0">
          <div className="w-full h-full bg-slate-200 dark:bg-slate-800 rounded-full" />
          <div
            className="absolute top-0 left-0 h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-700 ease-in-out"
            style={{
              width: `${Math.min(100, Math.max(0, ((currentStep - 1) / (STEPS.length - 1)) * 100))}%`
            }}
          />
        </div>

        <div className="relative z-10 flex items-start justify-between">
          {STEPS.map((step, idx) => {
            const stepNum = idx + 1;
            const isCompleted = currentStep > stepNum || currentStatus === 'COMPLETED';
            const isActive = currentStep === stepNum && currentStatus !== 'COMPLETED';

            return (
              <div key={step.key} className="flex flex-col items-center text-center flex-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-100 dark:ring-emerald-950'
                      : isActive
                      ? 'bg-indigo-600 text-white shadow-md ring-4 ring-indigo-100 dark:ring-indigo-950/60 animate-pulse'
                      : 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : stepNum}
                </div>
                <span
                  className={`mt-1.5 text-[11px] font-semibold leading-tight ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                      : isCompleted
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
                <span className="hidden sm:inline-block text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {step.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* OTP Display helper for customer only (hidden from provider) */}
      {!isProvider && (booking.start_otp || booking.completion_otp) && currentStatus !== 'COMPLETED' && (
        <div className="mt-3 pt-2.5 border-t border-slate-200/70 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          {booking.start_otp && (currentStatus === 'PENDING' || currentStatus === 'ACCEPTED') && (
            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 px-2.5 py-1 rounded-lg text-amber-900 dark:text-amber-300">
              <Key className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Share <strong>Start OTP</strong> upon arrival: <strong className="font-mono text-sm tracking-wider text-amber-700 dark:text-amber-200">{booking.start_otp}</strong></span>
            </div>
          )}
          {booking.completion_otp && (currentStatus === 'STARTED' || currentStatus === 'IN_PROGRESS') && (
            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 px-2.5 py-1 rounded-lg text-emerald-900 dark:text-emerald-300">
              <Key className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Share <strong>Completion OTP</strong> only when satisfied: <strong className="font-mono text-sm tracking-wider text-emerald-700 dark:text-emerald-200">{booking.completion_otp}</strong></span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
