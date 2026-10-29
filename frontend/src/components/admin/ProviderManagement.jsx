import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { exportToCsv } from '../../utils/csvExport';
import { UserProfileModal } from './UserProfileModal';
import { ManageProviderCategoriesModal } from './ManageProviderCategoriesModal';
import {
  Briefcase,
  ShieldCheck,
  ShieldAlert,
  Star,
  MapPin,
  RefreshCw,
  Tag,
  CheckCircle,
  XCircle,
  Plus,
  X,
  User,
  Mail,
  Phone,
  Lock,
  Building,
  Award,
  Eye,
  Download,
  Layers
} from 'lucide-react';

export const ProviderManagement = () => {
  const { showToast } = useAuth();
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterVerified, setFilterVerified] = useState('all'); // 'all' | 'verified' | 'unverified'

  // Profile Modal State
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Category & Skills Management Modal State
  const [managingCategoryProvider, setManagingCategoryProvider] = useState(null);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('Provider@123');
  const [businessName, setBusinessName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [experienceYears, setExperienceYears] = useState(3);
  const [description, setDescription] = useState('');
  const [isVerified, setIsVerified] = useState(true);

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProviders(true);
      setProviders(data || []);
    } catch (err) {
      showToast(err.message || 'Failed to fetch providers', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await api.getCategories(true);
      setCategories(data || []);
      if (data && data.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load categories for provider onboarding', err);
    }
  };

  useEffect(() => {
    fetchProviders();
    fetchCategories();
  }, []);

  const handleToggleVerification = async (provider) => {
    const nextStatus = !provider.is_verified;
    try {
      await api.toggleProviderVerification(provider.id, nextStatus);
      showToast(
        `Provider ${provider.business_name} verification status: ${nextStatus ? 'Verified' : 'Unverified'}`,
        'success'
      );
      setProviders(prev =>
        prev.map(p => (p.id === provider.id ? { ...p, is_verified: nextStatus } : p))
      );
    } catch (err) {
      showToast(err.message || 'Failed to update verification', 'error');
    }
  };

  const handleOpenAddModal = () => {
    setFullName('');
    setEmail('');
    setPhoneNumber('');
    setPassword('Provider@123');
    setBusinessName('');
    if (categories.length > 0) setSelectedCategoryId(categories[0].id);
    setExperienceYears(3);
    setDescription('');
    setIsVerified(true);
    setIsAddModalOpen(true);
  };

  const handleCreateProvider = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phoneNumber.trim() || !businessName.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createProvider({
        full_name: fullName.trim(),
        email: email.trim(),
        phone_number: phoneNumber.trim(),
        password: password,
        business_name: businessName.trim(),
        description: description.trim() || undefined,
        experience_years: parseInt(experienceYears) || 0,
        category_id: selectedCategoryId ? parseInt(selectedCategoryId) : undefined,
        is_verified: isVerified
      });

      showToast(`Provider "${businessName.trim()}" onboarded successfully!`, 'success');
      setIsAddModalOpen(false);
      fetchProviders();
    } catch (err) {
      showToast(err.message || 'Failed to onboard provider', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCsv = () => {
    if (!providers || providers.length === 0) {
      showToast('No provider records available to export', 'error');
      return;
    }
    const columns = [
      { header: 'Provider ID', accessor: 'id' },
      { header: 'User ID', accessor: 'user_id' },
      { header: 'Business / Trade Name', accessor: 'business_name' },
      { header: 'Contact Person', accessor: (row) => row.full_name || 'N/A' },
      { header: 'Email Address', accessor: (row) => row.email || 'N/A' },
      { header: 'Phone Number', accessor: (row) => row.phone_number || 'N/A' },
      { header: 'Assigned Categories', accessor: (row) => (row.categories || []).join('; ') },
      { header: 'Years Experience', accessor: 'experience_years' },
      { header: 'Verified Status', accessor: (row) => (row.is_verified ? 'Verified' : 'Pending Audit') }
    ];
    exportToCsv('skillconnect_providers_directory.csv', providers, columns);
    showToast(`Exported ${providers.length} provider records to CSV!`, 'success');
  };

  const filteredProviders = providers.filter(p => {
    if (filterVerified === 'verified') return p.is_verified;
    if (filterVerified === 'unverified') return !p.is_verified;
    return true;
  });

  return (
    <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/80 shadow-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Provider Verification & Directory</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Onboard new specialists, audit trade licenses, and manage verified platform badges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-750 transition-colors flex items-center gap-1.5"
            title="Export Providers to CSV"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Provider</span>
          </button>

          <select
            value={filterVerified}
            onChange={(e) => setFilterVerified(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Verification States</option>
            <option value="verified">Verified Only</option>
            <option value="unverified">Pending Audit</option>
          </select>

          <button
            onClick={fetchProviders}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-700/60">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-700/80">
              <th className="py-3 px-4 font-semibold">Business / Specialist</th>
              <th className="py-3 px-4 font-semibold">Assigned Skills</th>
              <th className="py-3 px-4 font-semibold">Experience</th>
              <th className="py-3 px-4 font-semibold">Verification Badge</th>
              <th className="py-3 px-4 font-semibold text-right">Audit Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50 text-slate-300">
            {filteredProviders.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  <Briefcase className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="font-semibold">No service providers found.</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Click the <strong>"+ Add Provider"</strong> button above to onboard your first specialist.
                  </p>
                </td>
              </tr>
            ) : (
              filteredProviders.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setSelectedUserId(p.user_id)}
                  className="hover:bg-slate-750/70 transition-colors cursor-pointer group"
                  title="Click to view specialist profile"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-sm ring-1 ring-slate-700 flex-shrink-0">
                        {p.full_name ? p.full_name.charAt(0).toUpperCase() : (p.business_name ? p.business_name.charAt(0).toUpperCase() : 'P')}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm flex items-center gap-1.5 group-hover:text-indigo-400 transition-colors">
                          {p.business_name}
                          {p.is_verified && (
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Contact: {p.full_name || 'Specialist'} • {p.phone_number || p.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {p.categories && p.categories.length > 0 ? (
                        p.categories.map((cat) => (
                          <span
                            key={cat}
                            className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 text-[10px] font-semibold border border-indigo-500/20"
                          >
                            {cat}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">Unassigned</span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-200">
                    {p.experience_years} Years
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        p.is_verified
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {p.is_verified ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                      {p.is_verified ? 'Verified Active' : 'Pending Audit'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div
                      className="flex items-center justify-end gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setSelectedUserId(p.user_id)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1 shadow-sm"
                        title="View Full Specialist Profile"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Profile</span>
                      </button>

                      <button
                        onClick={() => setManagingCategoryProvider(p)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-white border border-indigo-500/30 transition-colors flex items-center gap-1 shadow-sm"
                        title="Manage Skills & Categories for this Specialist"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Skills</span>
                      </button>

                      <button
                        onClick={() => handleToggleVerification(p)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          p.is_verified
                            ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                        }`}
                      >
                        {p.is_verified ? 'Revoke Badge' : 'Verify & Approve'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Onboard Provider Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-700 animate-in fade-in zoom-in-95 duration-150 text-slate-100">
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Onboard New Provider</h3>
                  <p className="text-xs text-slate-400">Register specialist credentials & assign primary skill</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProvider} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Specialist Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Patel"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Business / Trading Name *
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Patel Power Solutions"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="provider@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Initial Login Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Years of Experience
                  </label>
                  <div className="relative">
                    <Award className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Primary Service Category / Trade *
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {categories.length === 0 ? (
                    <option value="">No categories created yet (Create one under Categories tab first)</option>
                  ) : (
                    categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Specialist Bio & Certifications
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Certified master electrician with high-voltage and industrial certification."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="verifyBadge"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-950 border-slate-700"
                />
                <label htmlFor="verifyBadge" className="text-xs text-slate-300 cursor-pointer">
                  Grant <strong>Verified Pro Badge</strong> immediately
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Creating Specialist...' : 'Onboard Provider'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Specialist Profile Details Modal */}
      {selectedUserId && (
        <UserProfileModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onUserUpdated={() => fetchProviders()}
        />
      )}

      {/* Multi-Skill Category Manager Modal */}
      {managingCategoryProvider && (
        <ManageProviderCategoriesModal
          isOpen={Boolean(managingCategoryProvider)}
          provider={managingCategoryProvider}
          onClose={() => setManagingCategoryProvider(null)}
          onUpdated={() => {
            fetchProviders();
          }}
        />
      )}
    </div>
  );
};
