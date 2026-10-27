import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const bgStyles = {
    success: 'bg-emerald-900/90 text-emerald-100 border-emerald-700/60',
    error: 'bg-rose-900/90 text-rose-100 border-rose-700/60',
    info: 'bg-slate-900/95 text-slate-100 border-slate-700/80',
  }[toast.type || 'info'];

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  }[toast.type || 'info'];

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md ${bgStyles}`}>
        <Icon className="w-5 h-5 flex-shrink-0 text-current" />
        <p className="text-sm font-medium tracking-wide">{toast.message}</p>
        <button
          onClick={onClose}
          className="ml-2 p-1 text-current/70 hover:text-current rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

