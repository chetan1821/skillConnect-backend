import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { exportToCsv } from '../../utils/csvExport';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  Search,
  Filter,
  RefreshCw,
  Download,
  Play,
  Briefcase,
  User,
  X,
  FileText
} from 'lucide-react';

export const BookingManagement = () => {
  const { showToast } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminBookings({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search.trim() || undefined
      });
      setBookings(data || []);
    } catch (err) {
      showToast(err.message || 'Failed to fetch platform bookings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    setIsUpdating(true);
    try {
      const updated = await api.updateAdminBookingStatus(bookingId, newStatus);
      showToast(`Booking #${bookingId} status changed to ${newStatus}`, 'success');
      setBookings(prev =>
        prev.map(b => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      showToast(err.message || 'Failed to update booking status', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExportCsv = () => {
    const columns = [
      { header: 'Booking ID', accessor: 'id' },
      { header: 'Status', accessor: 'status' },
      { header: 'Payment Escrow Status', accessor: (row) => row.payment_status || 'IN_ESCROW' },
      { header: 'Scheduled Date', accessor: 'scheduled_date' },
      { header: 'Time Slot', accessor: 'time_slot' },
      { header: 'Customer Name', accessor: 'customer_name' },
      { header: 'Customer Email', accessor: 'customer_email' },
      { header: 'Customer Phone', accessor: 'customer_phone' },
      { header: 'Provider Business', accessor: 'provider_business_name' },
      { header: 'Provider Phone', accessor: 'provider_phone' },
      { header: 'Base Service Amount (INR)', accessor: 'base_amount' },
      { header: 'Extra Scope Amount (INR)', accessor: 'extra_amount' },
      { header: 'Platform Fee (INR)', accessor: 'platform_fee' },
      { header: 'Platform Commission (INR)', accessor: 'platform_commission' },
      { header: 'Provider Net Payout (INR)', accessor: 'provider_payout' },
      { header: 'Total Customer Amount', accessor: (row) => row.total_amount || row.total_amount_numeric },
      { header: 'Service Address', accessor: 'service_address' }
    ];
    exportToCsv('SkillConnect_Platform_Bookings.csv', bookings, columns);
  };

  // Status metrics
  const totalCount = bookings.length;
  const pendingCount = bookings.filter(b => b.status === 'Pending').length;
  const activeCount = bookings.filter(b => b.status === 'Accepted' || b.status === 'Started' || b.status === 'In Progress').length;
  const completedCount = bookings.filter(b => b.status === 'Completed').length;
  const cancelledCount = bookings.filter(b => b.status === 'Cancelled' || b.status === 'Declined').length;

  return (
    <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/80 shadow-xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            Platform Bookings & Appointments Hub
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Oversee all client service orders, track active jobs, and resolve scheduling disputes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-750 transition-colors flex items-center gap-1.5 shadow-sm"
            title="Download CSV report"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export CSV</span>
          </button>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses ({totalCount})</option>
            <option value="Pending">Pending Approval ({pendingCount})</option>
            <option value="Accepted">Accepted Jobs</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed ({completedCount})</option>
            <option value="Cancelled">Cancelled ({cancelledCount})</option>
          </select>

          <button
            onClick={fetchBookings}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Refresh Bookings"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Mini Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-900/70 rounded-2xl p-3.5 border border-slate-700/60">
          <div className="text-[11px] font-semibold text-slate-400">Total Orders</div>
          <div className="text-xl font-bold text-white mt-1">{totalCount}</div>
        </div>
        <div className="bg-slate-900/70 rounded-2xl p-3.5 border border-slate-700/60">
          <div className="text-[11px] font-semibold text-amber-400">Pending Review</div>
          <div className="text-xl font-bold text-amber-300 mt-1">{pendingCount}</div>
        </div>
        <div className="bg-slate-900/70 rounded-2xl p-3.5 border border-slate-700/60">
          <div className="text-[11px] font-semibold text-sky-400">In Progress / Active</div>
          <div className="text-xl font-bold text-sky-300 mt-1">{activeCount}</div>
        </div>
        <div className="bg-slate-900/70 rounded-2xl p-3.5 border border-slate-700/60">
          <div className="text-[11px] font-semibold text-emerald-400">Completed</div>
          <div className="text-xl font-bold text-emerald-300 mt-1">{completedCount}</div>
        </div>
        <div className="bg-slate-900/70 rounded-2xl p-3.5 border border-slate-700/60 col-span-2 sm:col-span-1">
          <div className="text-[11px] font-semibold text-rose-400">Cancelled / Declined</div>
          <div className="text-xl font-bold text-rose-300 mt-1">{cancelledCount}</div>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search bookings by customer name, email, specialist, service trade, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm"
        >
          Search
        </button>
      </form>

      {/* Bookings Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-700/60">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-700/80">
              <th className="py-3 px-4 font-semibold">Booking ID</th>
              <th className="py-3 px-4 font-semibold">Customer</th>
              <th className="py-3 px-4 font-semibold">Assigned Specialist</th>
              <th className="py-3 px-4 font-semibold">Service & Schedule</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold">Callout Fee</th>
              <th className="py-3 px-4 font-semibold text-right">Admin Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50 text-slate-300">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="font-semibold">No booking requests found.</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Bookings placed by customers on the marketplace will appear here.
                  </p>
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => setSelectedBooking(b)}
                  className="hover:bg-slate-750/70 transition-colors cursor-pointer group"
                  title="Click to view full booking details"
                >
                  <td className="py-3.5 px-4 font-bold text-white group-hover:text-indigo-400 transition-colors">
                    #{b.id}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white">{b.customer_name}</div>
                    <div className="text-[11px] text-slate-400">{b.customer_email}</div>
                    {b.customer_phone && (
                      <div className="text-[10px] text-slate-500 font-mono">{b.customer_phone}</div>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-indigo-300">{b.provider_business_name}</div>
                    <div className="text-[11px] text-slate-400">
                      {b.provider_name ? `Tech: ${b.provider_name}` : 'Specialist Assigned'}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-200">
                      {b.category_name || 'General Service'}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{b.scheduled_date} ({b.time_slot})</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        b.status === 'Completed'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : b.status === 'Pending'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : b.status === 'Accepted'
                          ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                          : b.status === 'Started'
                          ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                          : b.status === 'In Progress'
                          ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                          : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-200">
                    {b.total_amount || '$50.00'}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div
                      className="flex items-center justify-end gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {b.status === 'Pending' && (
                        <button
                          onClick={() => handleUpdateStatus(b.id, 'Accepted')}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-[11px] font-bold border border-indigo-500/30 transition-all"
                        >
                          Approve
                        </button>
                      )}

                      {b.status !== 'Completed' && b.status !== 'Cancelled' && (
                        <button
                          onClick={() => handleUpdateStatus(b.id, 'Completed')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 transition-all"
                        >
                          Complete
                        </button>
                      )}

                      {b.status !== 'Cancelled' && (
                        <button
                          onClick={() => handleUpdateStatus(b.id, 'Cancelled')}
                          className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-[11px] font-bold border border-rose-500/30 transition-all"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-700 animate-in fade-in zoom-in-95 duration-150 text-slate-100">
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Booking Request #{selectedBooking.id}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedBooking.status === 'Completed'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : selectedBooking.status === 'Pending'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-sky-500/20 text-sky-300'
                      }`}
                    >
                      {selectedBooking.status}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Order and dispatch resolution inspector</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Customer & Specialist Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-300 text-[11px] uppercase tracking-wider">
                    <User className="w-3.5 h-3.5 text-sky-400" />
                    Customer Details
                  </div>
                  <div className="font-bold text-white text-sm">{selectedBooking.customer_name}</div>
                  <div className="text-slate-400">{selectedBooking.customer_email}</div>
                  {selectedBooking.customer_phone && (
                    <div className="text-slate-400 font-mono">{selectedBooking.customer_phone}</div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-300 text-[11px] uppercase tracking-wider">
                    <Briefcase className="w-3.5 h-3.5 text-violet-400" />
                    Assigned Specialist
                  </div>
                  <div className="font-bold text-white text-sm">
                    {selectedBooking.provider_business_name}
                  </div>
                  <div className="text-slate-400">{selectedBooking.provider_name}</div>
                  {selectedBooking.provider_phone && (
                    <div className="text-slate-400 font-mono">{selectedBooking.provider_phone}</div>
                  )}
                </div>
              </div>

              {/* Service & Financial Ledger Details */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Service Category:</span>
                  <span className="font-bold text-white">{selectedBooking.category_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Scheduled Date & Slot:</span>
                  <span className="font-bold text-indigo-300">
                    {selectedBooking.scheduled_date} ({selectedBooking.time_slot})
                  </span>
                </div>

                {/* Financial Ledger Breakdown */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-750 space-y-1.5 text-[11px]">
                  <div className="text-xs font-bold text-slate-300 pb-1 border-b border-slate-800 flex items-center justify-between">
                    <span>Financial Ledger Allocation</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                      {selectedBooking.payment_status || 'IN_ESCROW'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Base Callout Fee:</span>
                    <span className="font-mono text-slate-200">₹{selectedBooking.base_amount || 0}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Extra Materials / Scope:</span>
                    <span className="font-mono text-slate-200">₹{selectedBooking.extra_amount || 0}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Platform Trust Fee:</span>
                    <span className="font-mono text-slate-200">₹{selectedBooking.platform_fee || 29}</span>
                  </div>
                  <div className="flex justify-between text-indigo-400 font-semibold border-t border-slate-800 pt-1">
                    <span>Platform Commission (10%):</span>
                    <span className="font-mono">₹{selectedBooking.platform_commission || 0}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Specialist Net Payout:</span>
                    <span className="font-mono">₹{selectedBooking.provider_payout || 0}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold border-t border-slate-800 pt-1 text-xs">
                    <span>Total Customer Paid:</span>
                    <span className="font-mono text-emerald-300">
                      {selectedBooking.total_amount || `₹${selectedBooking.total_amount_numeric}`}
                    </span>
                  </div>
                </div>

                {/* Dispute Reference OTPs */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-750 text-center">
                    <span className="text-[10px] text-slate-400 block font-semibold">Start OTP</span>
                    <span className="font-mono text-amber-300 font-bold text-sm tracking-widest">{selectedBooking.start_otp || 'N/A'}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-750 text-center">
                    <span className="text-[10px] text-slate-400 block font-semibold">Completion OTP</span>
                    <span className="font-mono text-emerald-300 font-bold text-sm tracking-widest">{selectedBooking.completion_otp || 'N/A'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-750">
                  <span className="text-slate-400 block mb-1">Service Address:</span>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-750 text-slate-200 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <span>{selectedBooking.service_address}</span>
                  </div>
                </div>
                {selectedBooking.service_note && (
                  <div className="pt-2 border-t border-slate-750">
                    <span className="text-slate-400 block mb-1">Client Problem Description:</span>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-750 text-slate-300 leading-relaxed">
                      {selectedBooking.service_note}
                    </div>
                  </div>
                )}
              </div>

              {/* Dispute & Force Status Controls */}
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 space-y-2">
                <div className="font-bold text-white text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-indigo-400" />
                  Admin Dispute & Order Override Controls
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'Accepted')}
                    className="px-3 py-1.5 rounded-xl bg-sky-600/30 hover:bg-sky-600/50 text-sky-200 border border-sky-500/30 font-bold transition-all text-xs"
                  >
                    Set Accepted
                  </button>
                  <button
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'In Progress')}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 font-bold transition-all text-xs"
                  >
                    Set In Progress
                  </button>
                  <button
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'Completed')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/30 font-bold transition-all text-xs"
                  >
                    Force Complete
                  </button>
                  <button
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'Cancelled')}
                    className="px-3 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/30 font-bold transition-all text-xs"
                  >
                    Force Cancel
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 px-6 border-t border-slate-800 bg-slate-950/60 flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-semibold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
