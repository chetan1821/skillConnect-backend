import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { exportToCsv } from '../../utils/csvExport';
import { UserProfileModal } from './UserProfileModal';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Shield,
  Briefcase,
  User,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download
} from 'lucide-react';

export const UserManagement = () => {
  const { user: currentAdmin, showToast } = useAuth();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Profile Modal State
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.getUsers({
        page,
        limit,
        search: search || undefined,
        role: roleFilter || undefined,
        is_active: statusFilter !== '' ? statusFilter : undefined
      });
      setUsers(res.users || []);
      setTotal(res.total || 0);
    } catch (err) {
      showToast(err.message || 'Failed to fetch users', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleToggleStatus = async (targetUser) => {
    if (targetUser.id === currentAdmin?.id) {
      showToast('Admin cannot deactivate their own account', 'error');
      return;
    }

    const newStatus = !targetUser.is_active;
    try {
      await api.toggleUserStatus(targetUser.id, newStatus);
      showToast(
        `User ${targetUser.full_name} is now ${newStatus ? 'Active' : 'Inactive'}`,
        'success'
      );
      setUsers(prev =>
        prev.map(u => (u.id === targetUser.id ? { ...u, is_active: newStatus } : u))
      );
      if (selectedUser?.id === targetUser.id) {
        setSelectedUser(prev => ({ ...prev, is_active: newStatus }));
      }
    } catch (err) {
      showToast(err.message || 'Failed to update user status', 'error');
    }
  };

  const handleUserUpdatedFromModal = (updatedUser) => {
    setUsers(prev =>
      prev.map(u => (u.id === updatedUser.id ? { ...u, is_active: updatedUser.is_active } : u))
    );
  };

  const handleExportCsv = () => {
    if (!users || users.length === 0) {
      showToast('No user records available to export', 'error');
      return;
    }
    const columns = [
      { header: 'User ID', accessor: 'id' },
      { header: 'Full Name', accessor: 'full_name' },
      { header: 'Email Address', accessor: 'email' },
      { header: 'Phone Number', accessor: (row) => row.phone_number || 'N/A' },
      { header: 'Role', accessor: 'role' },
      { header: 'Status', accessor: (row) => (row.is_active ? 'Active' : 'Inactive') },
      { header: 'Created Date', accessor: (row) => row.created_at ? new Date(row.created_at).toLocaleString() : '' }
    ];
    exportToCsv('skillconnect_users_directory.csv', users, columns);
    showToast(`Exported ${users.length} user records to CSV!`, 'success');
  };

  return (
    <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/80 shadow-xl space-y-6">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Registered Users Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Click on any user row to inspect their full profile, bookings, or trade history.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Provider">Provider</option>
            <option value="Customer">Customer</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>

          {/* Export CSV button */}
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-750 transition-colors flex items-center gap-1.5"
            title="Export Users to CSV"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export CSV</span>
          </button>

          {/* Refresh button */}
          <button
            onClick={fetchUsers}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by full name, email, or phone number..."
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

      {/* Users Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-700/60">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-700/80">
              <th className="py-3 px-4 font-semibold">User</th>
              <th className="py-3 px-4 font-semibold">Role</th>
              <th className="py-3 px-4 font-semibold">Contact</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50 text-slate-300">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  No users found matching current filters.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isCurrent = u.id === currentAdmin?.id;
                return (
                  <tr
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    className="hover:bg-slate-750/70 transition-colors cursor-pointer group"
                    title="Click to view full user profile"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-sm ring-1 ring-slate-700 ${
                            u.role === 'Admin'
                              ? 'bg-gradient-to-tr from-amber-500 to-orange-600'
                              : u.role === 'Provider'
                              ? 'bg-gradient-to-tr from-indigo-600 to-violet-600'
                              : 'bg-gradient-to-tr from-sky-500 to-blue-600'
                          }`}
                        >
                          {u.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                            {u.full_name}
                            {isCurrent && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-normal">
                                (You)
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          u.role === 'Admin'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : u.role === 'Provider'
                            ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30'
                            : 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                        }`}
                      >
                        {u.role === 'Admin' ? (
                          <Shield className="w-3 h-3" />
                        ) : u.role === 'Provider' ? (
                          <Briefcase className="w-3 h-3" />
                        ) : (
                          <User className="w-3 h-3" />
                        )}
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {u.phone_number}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          u.is_active
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : 'text-rose-400 bg-rose-500/10'
                        }`}
                      >
                        {u.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {u.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div
                        className="flex items-center justify-end gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1 shadow-sm"
                          title="View Profile Details"
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-400" />
                          <span>View Profile</span>
                        </button>

                        <button
                          disabled={isCurrent}
                          onClick={() => handleToggleStatus(u)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            isCurrent
                              ? 'opacity-40 cursor-not-allowed text-slate-500'
                              : u.is_active
                              ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                          }`}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
        <div>
          Showing {users.length} of {total} registered users
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-slate-200">Page {page}</span>
          <button
            disabled={users.length < limit || page * limit >= total}
            onClick={() => setPage(p => p + 1)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Profile Details Modal */}
      {selectedUser && (
        <UserProfileModal
          userId={selectedUser.id}
          initialUser={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUserUpdated={handleUserUpdatedFromModal}
        />
      )}
    </div>
  );
};
