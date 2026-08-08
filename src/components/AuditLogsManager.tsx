import React from 'react';
import { useHospital } from '../context/HospitalContext';
import { ShieldCheck, Search, Clock, User, FileText, AlertCircle } from 'lucide-react';

export const AuditLogsManager: React.FC = () => {
  const { auditLogs, searchQuery, setSearchQuery } = useHospital();

  const filteredLogs = auditLogs.filter(log => {
    return log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
           log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           log.details.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            HIPAA Security Audit Logs & System Trail
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Immutable log trail of administrative actions, billing payments, appointment updates, and EHR access.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search audit trail by user, action, or details..."
          className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {/* Mobile Card List */}
      <div className="block sm:hidden space-y-3">
        {filteredLogs.map(log => (
          <div key={log.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-extrabold text-slate-900 dark:text-white">{log.userName}</span>
                <span className="ml-1.5 text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold">({log.userRole})</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{log.timestamp}</span>
            </div>

            <p className="font-bold text-slate-800 dark:text-slate-200">{log.action}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl">{log.details}</p>

            <div className="text-[10px] text-slate-400 text-right font-mono">
              IP: {log.ipAddress}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Audit Logs Table */}
      <div className="hidden sm:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User & Role</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                    {log.timestamp}
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 dark:text-white font-sans">{log.userName}</span>
                    <span className="block text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold">{log.userRole}</span>
                  </td>

                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white font-sans">
                    {log.action}
                  </td>

                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-sans">
                    {log.details}
                  </td>

                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
