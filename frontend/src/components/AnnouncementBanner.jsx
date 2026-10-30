import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  Megaphone,
  X,
  AlertTriangle,
  Info,
  CheckCircle2,
  AlertOctagon
} from 'lucide-react';

export const AnnouncementBanner = () => {
  const [announcement, setAnnouncement] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);

  const fetchAnnouncement = async () => {
    try {
      const data = await api.getPublicAnnouncement();
      if (data && data.is_active && data.message) {
        setAnnouncement(data);
      } else {
        setAnnouncement(null);
      }
    } catch (err) {
      // Quiet fail for banner
    }
  };

  useEffect(() => {
    fetchAnnouncement();
    // Also listen for custom refresh events from Admin updates
    const handleRefresh = () => fetchAnnouncement();
    window.addEventListener('announcement-updated', handleRefresh);
    return () => window.removeEventListener('announcement-updated', handleRefresh);
  }, []);

  if (!announcement || isDismissed) return null;

  const bannerStyles = {
    info: {
      bg: 'bg-indigo-600 text-white',
      border: 'border-indigo-500',
      icon: <Info className="w-4 h-4 text-indigo-200 flex-shrink-0" />
    },
    warning: {
      bg: 'bg-amber-500 text-slate-950 font-medium',
      border: 'border-amber-400',
      icon: <AlertTriangle className="w-4 h-4 text-slate-900 flex-shrink-0" />
    },
    success: {
      bg: 'bg-emerald-600 text-white',
      border: 'border-emerald-500',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-200 flex-shrink-0" />
    },
    emergency: {
      bg: 'bg-rose-600 text-white font-medium',
      border: 'border-rose-500',
      icon: <AlertOctagon className="w-4 h-4 text-rose-200 flex-shrink-0" />
    }
  };

  const style = bannerStyles[announcement.banner_type] || bannerStyles.info;

  return (
    <div className={`w-full py-2.5 px-4 text-xs shadow-inner flex items-center justify-between transition-all ${style.bg} border-b ${style.border}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2.5 flex-1 px-4 text-center">
        {style.icon}
        <span className="font-semibold tracking-wide">
          {announcement.message}
        </span>
      </div>
      <button
        onClick={() => setIsDismissed(true)}
        className="p-1 rounded-md opacity-75 hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
        title="Dismiss announcement"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

