import React, { useState } from 'react';
import {
  X,
  Star,
  ShieldCheck,
  Shield,
  MapPin,
  Briefcase,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle2,
  Send,
  Home,
  Lock,
  Key,
  DollarSign
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

  const visitingFee = Number(provider.visiting_fee) || 199.00;
  const platformFee = 29.00;
  const totalEstimate = visitingFee + platformFee;

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
        base_amount: visitingFee
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
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center font-extrabold text-2xl ring-4 ring-white/10 shadow-lg flex-shrink-0">
              {provider.full_name ? provider.full_name.charAt(0).toUpperCase() : 'P'}
            </div>
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
                {provider.rating ? (
                  <div className="flex items-center text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current mr-1" />
                    <span>{provider.rating} {provider.reviews_count ? `(${provider.reviews_count} reviews)` : ''}</span>
                  </div>
                ) : (
                  <span className="text-indigo-200 font-medium">New Specialist</span>
                )}

                <span className="flex items-center gap-1 text-slate-300">
                  <Briefcase className="w-3.5 h-3.5" />
                  {provider.experience_years} Years Experience
                </span>

                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 font-semibold">
                  Callout: ₹{visitingFee}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Bio / Description */}
          {provider.description && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                About this Specialist
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                {provider.description}
              </p>
            </div>
          )}

          {/* Assigned Categories */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Verified Trade Specialties
            </h4>
            {provider.categories && provider.categories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {provider.categories.map((cat) => (
                  <span
                    key={cat}
                    className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No specific trades assigned yet.</p>
            )}
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
              Book Appointment & Escrow Dispatch
            </h3>

            {confirmedBooking ? (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-4">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span>Booking Request #{confirmedBooking.id} Confirmed!</span>
                </div>

                <div className="text-xs text-emerald-800 space-y-1.5 bg-white/80 p-3.5 rounded-xl border border-emerald-200/60 shadow-sm">
                  <div><strong>Specialist:</strong> {confirmedBooking.provider_business_name}</div>
                  <div><strong>Date & Slot:</strong> {confirmedBooking.scheduled_date} ({confirmedBooking.time_slot})</div>
                  <div><strong>Address:</strong> {confirmedBooking.service_address}</div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      Escrow: {confirmedBooking.payment_status || 'IN_ESCROW'}
                    </span>
                    <span className="font-bold text-indigo-700">Total: {confirmedBooking.total_amount || `₹${confirmedBooking.total_amount_numeric}`}</span>
                  </div>
                </div>

                {/* Secret Security OTPs for Customer */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-center shadow-sm">
                    <div className="text-[10px] uppercase font-bold text-amber-800 flex items-center justify-center gap-1">
                      <Key className="w-3 h-3 text-amber-600" />
                      <span>Start OTP</span>
                    </div>
                    <div className="text-2xl font-mono font-extrabold text-amber-950 tracking-widest mt-1">
                      {confirmedBooking.start_otp || '----'}
                    </div>
                    <div className="text-[10px] text-amber-800 mt-1 font-medium">Give on doorstep arrival</div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-100/70 border border-emerald-300 text-center shadow-sm">
                    <div className="text-[10px] uppercase font-bold text-emerald-800 flex items-center justify-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Completion OTP</span>
                    </div>
                    <div className="text-2xl font-mono font-extrabold text-emerald-950 tracking-widest mt-1">
                      {confirmedBooking.completion_otp || '----'}
                    </div>
                    <div className="text-[10px] text-emerald-800 mt-1 font-medium">Give ONLY when job is done</div>
                  </div>
                </div>

                <p className="text-xs text-emerald-800 bg-emerald-100/50 p-2.5 rounded-xl border border-emerald-200">
                  Your payment is safely held in escrow. You can manage and track this appointment anytime under <strong>My Bookings</strong>.
                </p>

                <div className="flex items-center gap-3 pt-1">
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

                {/* Transparent Price & Escrow Breakdown Card */}
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-700">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                      Specialist Visiting & Diagnostic Fee
                    </span>
                    <span className="font-bold text-slate-900">₹{visitingFee.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-700">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Shield className="w-3.5 h-3.5 text-indigo-600" />
                      Platform Trust & Safety Fee
                    </span>
                    <span className="font-bold text-slate-900">₹{platformFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-indigo-200/60 pt-2 flex items-center justify-between text-xs font-bold text-indigo-950">
                    <span>Total Estimated Escrow Hold</span>
                    <span className="text-sm text-indigo-600 font-extrabold">₹{totalEstimate.toFixed(2)}</span>
                  </div>
                  <p className="text-[11px] text-indigo-700/80 flex items-center gap-1 pt-0.5 font-medium">
                    <Lock className="w-3 h-3 text-indigo-500 flex-shrink-0" />
                    <span>Protected by SkillConnect Escrow: Payment is held safely until you verify completion.</span>
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
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
                    <span>{isSubmitting ? 'Placing Request...' : `Book & Hold ₹${totalEstimate.toFixed(2)}`}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
