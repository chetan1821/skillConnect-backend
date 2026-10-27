import React, { useState } from 'react';
import {
  X,
  Star,
  ShieldCheck,
  MapPin,
  Briefcase,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle2,
  Send,
  Home
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export const ProviderDetailModal = ({ provider, onClose, onBookingSuccess }) => {
  const { user, showToast, setIsAuthModalOpen } = useAuth();
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('Morning (9 AM - 12 PM)');
  const [serviceAddress, setServiceAddress] = useState('');
  const [serviceNote, setServiceNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  if (!provider) return null;

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to confirm your booking appointment', 'info');
      setIsAuthModalOpen(true);
      return;
    }

    if (!bookingDate) {
      showToast('Please select a preferred date', 'error');
      return;
    }

    if (!serviceAddress.trim()) {
      showToast('Please enter your service address', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await api.createBooking({
        provider_id: provider.id,
        category_id: provider.category_id || null,
        scheduled_date: bookingDate,
        time_slot: bookingTime,
        service_address: serviceAddress.trim(),
        service_note: serviceNote.trim() || undefined,
        total_amount: provider.price_range || '$50.00'
      });

      setConfirmedBooking(created);
      showToast(`Appointment booked successfully with ${provider.business_name}!`, 'success');
      if (onBookingSuccess) onBookingSuccess(created);
    } catch (err) {
      showToast(err.message || 'Failed to submit booking', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src={provider.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.full_name)}&background=6366f1&color=fff`}
              alt={provider.full_name}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white/10 shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-bold text-white">{provider.full_name}</h2>
                {provider.is_verified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Pro
                  </span>
                )}
              </div>

              <p className="text-indigo-300 font-semibold text-sm mt-0.5">{provider.business_name}</p>

              <div className="flex items-center gap-3 mt-2 text-xs text-slate-300 flex-wrap">
                <div className="flex items-center text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-current mr-1" />
                  <span>{provider.rating || '4.9'} ({provider.reviews_count || 120} reviews)</span>
                </div>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {provider.city || 'India'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  {provider.experience_years} Years Experience
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* About Provider */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Specialist Profile
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {provider.description}
            </p>
          </div>

          {/* Specialties / Categories */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Assigned Specialties
            </h3>
            <div className="flex flex-wrap gap-2">
              {(provider.categories || ['General Repair']).map((cat) => (
                <span
                  key={cat}
                  className="px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Contact Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2.5 text-xs text-slate-700">
              <Phone className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span className="font-semibold">{provider.phone_number}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-700">
              <Mail className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span className="font-semibold truncate">{provider.email}</span>
            </div>
          </div>

          {/* Booking Section */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Book Appointment & Dispatch Request
            </h3>

            {confirmedBooking ? (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span>Booking Request #{confirmedBooking.id} Confirmed!</span>
                </div>
                <div className="text-xs text-emerald-800 space-y-1 bg-white/70 p-3 rounded-xl border border-emerald-200/60">
                  <div><strong>Specialist:</strong> {confirmedBooking.provider_business_name}</div>
                  <div><strong>Date & Slot:</strong> {confirmedBooking.scheduled_date} ({confirmedBooking.time_slot})</div>
                  <div><strong>Address:</strong> {confirmedBooking.service_address}</div>
                  <div><strong>Status:</strong> <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">{confirmedBooking.status}</span></div>
                </div>
                <p className="text-xs text-emerald-700">
                  The provider has received your job alert. You can manage and track status under <strong>My Bookings</strong> in the navigation bar.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={onClose}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-sm"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Preferred Time Slot *
                    </label>
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option>Morning (9 AM - 12 PM)</option>
                      <option>Afternoon (12 PM - 4 PM)</option>
                      <option>Evening (4 PM - 8 PM)</option>
                      <option>Emergency (Immediate Dispatch)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Service Address / Doorstep Location *
                  </label>
                  <div className="relative">
                    <Home className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Flat 301, Tower B, Silver Springs, Andheri"
                      value={serviceAddress}
                      onChange={(e) => setServiceAddress(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Issue Description / Special Instructions
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Briefly describe what needs fixing (e.g. main breaker tripping, sink drain pipe replacement)..."
                    value={serviceNote}
                    onChange={(e) => setServiceNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-slate-500">
                    Estimated Callout: <span className="font-bold text-slate-900">{provider.price_range || '$50.00'}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all disabled:opacity-50 active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? 'Placing Request...' : 'Confirm Appointment'}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
