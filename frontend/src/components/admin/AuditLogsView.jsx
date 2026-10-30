import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { exportToCsv } from '../../utils/csvExport';
import { Shield, Clock, RefreshCw, Download, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export const AuditLogsView = () => {
  const { showToast } = useAuth();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminAuditLogs(100);
      setLogs(data || []);
    } catch (err) {
      showToast(err.message || 'Failed to fetch audit logs', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExportCsv = () => {
    const columns = [
      { header: 'Log ID', key: 'id' },
      { header: 'Timestamp', key: 'created_at' },
      { header: 'Admin Email', key: 'admin_email' },
      { header: 'Action', key: 'action' },
      { header: 'Target Type', key: 'target_type' },
      { header: 'Target ID', key: 'target_id' },
      { header: 'Details', key: 'details' }
    ];
    exportToCsv('SkillConnect_Audit_Logs', logs, columns);
  };

  const getActionBadge = (action) => {
    if (action.includes('VERIFY') || action.includes('ACTIVATE') || action.includes('COMPLETE')) {
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
    if (action.includes('CANCEL') || action.includes('DEACTIVATE') || action.includes('REVOKE')) {
      return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    }
    if (action.includes('ANNOUNCEMENT') || action.includes('STATUS')) {
      return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
    }
    return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
  };

  return (
    <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/80 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            Administrative Activity & Audit Trail
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable log of all administrative interventions, provider audits, and system status overrides.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export Audit Log</span>
          </button>

          <button
            onClick={fetchLogs}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Refresh Audit Trail"
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
              <th className="py-3 px-4 font-semibold">Timestamp</th>
              <th className="py-3 px-4 font-semibold">Admin Account</th>
              <th className="py-3 px-4 font-semibold">Action Executed</th>
              <th className="py-3 px-4 font-semibold">Scope & Entity</th>
              <th className="py-3 px-4 font-semibold">Activity Summary</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50 text-slate-300">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="font-semibold">No administrative actions logged yet.</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Future actions (updating bookings, verifying providers, toggling announcements) will appear here.
                  </p>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-750/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                    {log.created_at || 'Just now'}
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-white">
                    {log.admin_email}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getActionBadge(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-300">
                      {log.target_type}
                    </span>
                    {log.target_id && (
                      <span className="text-slate-500 text-[11px] ml-1">
                        (#{log.target_id})
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-slate-300 max-w-sm">
                    {log.details || 'Administrative record registered'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

