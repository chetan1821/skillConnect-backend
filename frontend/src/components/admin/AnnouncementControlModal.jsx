import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Megaphone,
  X,
  AlertTriangle,
  Info,
  CheckCircle2,
  AlertOctagon,
  Save,
  Radio,
  Eye,
  RefreshCw
} from 'lucide-react';

export const AnnouncementControlModal = ({ isOpen, onClose, onSuccess }) => {
  const { showToast } = useAuth();
  const [message, setMessage] = useState('');
  const [bannerType, setBannerType] = useState('info');
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAnnouncement();
    }
  }, [isOpen]);

  const loadAnnouncement = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminAnnouncement();
      if (data) {
        setMessage(data.message || '');
        setBannerType(data.banner_type || 'info');
        setIsActive(Boolean(data.is_active));
      }
    } catch (err) {
      showToast('Failed to load current announcement', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isActive && !message.trim()) {
      showToast('Please provide an announcement message before activating', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await api.updateAdminAnnouncement({
        message: message.trim(),
        banner_type: bannerType,
        is_active: isActive
      });
      showToast('Platform announcement updated successfully!', 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to update announcement', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const bannerThemes = {
    info: {
      label: 'Informational (Blue/Indigo)',
      border: 'border-blue-500/30',
      bg: 'bg-blue-950/40 text-blue-200',
      icon: <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
    },
    warning: {
      label: 'Warning / Notice (Amber)',
      border: 'border-amber-500/30',
      bg: 'bg-amber-950/40 text-amber-200',
      icon: <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
    },
    success: {
      label: 'Success / Promo (Emerald)',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-950/40 text-emerald-200',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
    },
    emergency: {
      label: 'Urgent / Downtime (Rose)',
      border: 'border-rose-500/30',
      bg: 'bg-rose-950/40 text-rose-200',
      icon: <AlertOctagon className="w-4 h-4 text-rose-400 flex-shrink-0" />
    }
  };

  const activeTheme = bannerThemes[bannerType] || bannerThemes.info;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Global Marketplace Announcement</h3>
              <p className="text-xs text-slate-400">
                Broadcast live notifications to all visiting customers & service providers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
            <p className="text-xs">Fetching announcement state...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto">
            {/* Active Switch */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
              <div>
                <label className="text-sm font-bold text-white block">
                  Broadcast Banner Status
                </label>
                <p className="text-xs text-slate-400 mt-0.5">
                  When enabled, this banner appears at the very top of the SkillConnect marketplace.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Banner Style */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Banner Urgency / Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(bannerThemes).map(([type, theme]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setBannerType(type)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2 ${
                      bannerType === type
                        ? 'border-indigo-500 bg-indigo-950/40 text-white font-semibold'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {theme.icon}
                    <span className="text-xs capitalize">{type}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Message Area */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Announcement Message
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g., Scheduled maintenance tonight at 11:00 PM EST. Bookings remain fully protected."
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                maxLength={250}
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>Markdown & emojis supported</span>
                <span>{message.length} / 250</span>
              </div>
            </div>

            {/* Live Preview Box */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-2">
                <Eye className="w-3.5 h-3.5" />
                <span>Live Marketplace Preview</span>
              </div>
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${activeTheme.bg} ${activeTheme.border}`}
              >
                <div className="flex items-center gap-2.5">
                  {activeTheme.icon}
                  <span className="font-medium">
                    {message.trim() || 'No message entered yet. Type above to preview...'}
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-black/20">
                  {bannerType}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Publishing...' : 'Save & Publish Banner'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

