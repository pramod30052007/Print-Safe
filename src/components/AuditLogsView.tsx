import React, { useState } from 'react';
import { 
  ScrollText, 
  Search, 
  Filter, 
  Download, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Trash2,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { ActivityLog, LogSeverity } from '../types/index.js';

interface AuditLogsViewProps {
  logs: ActivityLog[];
  onRefresh: () => void;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs, onRefresh }) => {
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter((log) => {
    const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.userName && log.userName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.jobId && log.jobId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.printerId && log.printerId.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSeverity && matchesSearch;
  });

  const exportCSV = () => {
    const headers = ['Log ID', 'Timestamp', 'Severity', 'Action', 'User', 'Details', 'Job ID', 'Printer ID', 'IP Address'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      l.severity,
      l.action,
      l.userName || 'SYSTEM',
      `"${l.details.replace(/"/g, '""')}"`,
      l.jobId || 'N/A',
      l.printerId || 'N/A',
      l.ipAddress,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PrintSafe_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#161B22] border border-[#30363D] shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ScrollText className="w-6 h-6 text-[#58A6FF]" />
            <span>Cryptographic Security & System Audit Logs</span>
          </h2>
          <p className="text-xs text-[#8B949E] mt-1">
            Immutable SIEM audit trail of all authentication events, OTP attempts, AI DLP scans, and document purges
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg bg-[#1C2128] hover:bg-[#30363D] text-[#C9D1D9] border border-[#30363D] transition-colors cursor-pointer"
            title="Refresh Logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-lg bg-[#1C2128] hover:bg-[#30363D] text-[#C9D1D9] text-xs font-semibold flex items-center gap-2 border border-[#30363D] transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#3fb950]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-[#161B22] border border-[#30363D] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Severity Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {['ALL', 'CRITICAL', 'WARNING', 'SUCCESS', 'INFO'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-lg font-mono font-semibold transition-colors cursor-pointer ${
                severityFilter === sev
                  ? sev === 'CRITICAL' ? 'bg-[rgba(248,81,73,0.15)] text-[#F85149] border border-[#F85149]/40' :
                    sev === 'WARNING' ? 'bg-[rgba(210,153,34,0.15)] text-[#D29922] border border-[#D29922]/40' :
                    sev === 'SUCCESS' ? 'bg-[rgba(35,134,54,0.15)] text-[#3fb950] border border-[#3fb950]/40' :
                    'bg-[rgba(88,166,255,0.15)] text-[#58A6FF] border border-[#58A6FF]/40'
                  : 'text-[#8B949E] hover:bg-[#1C2128] hover:text-[#C9D1D9]'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#8B949E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, user, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 bg-[#0B0E14] border border-[#30363D] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#C9D1D9] placeholder-[#8B949E] focus:outline-none focus:border-[#58A6FF]"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="p-6 rounded-2xl bg-[#161B22] border border-[#30363D] shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B0E14] text-[#8B949E] uppercase tracking-wider font-mono text-[10px] border-b border-[#30363D]">
              <tr>
                <th className="py-3 px-4 rounded-l-lg">Timestamp</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Security Action</th>
                <th className="py-3 px-4">User / Agent</th>
                <th className="py-3 px-4">Audit Details</th>
                <th className="py-3 px-4 text-right rounded-r-lg">Entities</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363D] font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-[#8B949E]">
                    No logs found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#1C2128] transition-colors">
                    <td className="py-3 px-4 text-[#8B949E] text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        log.severity === 'CRITICAL' ? 'bg-[rgba(248,81,73,0.15)] text-[#F85149] border border-[#F85149]/30' :
                        log.severity === 'WARNING' ? 'bg-[rgba(210,153,34,0.15)] text-[#D29922] border border-[#D29922]/30' :
                        log.severity === 'SUCCESS' ? 'bg-[rgba(35,134,54,0.15)] text-[#3fb950] border border-[#3fb950]/30' :
                        'bg-[#1C2128] text-[#8B949E] border border-[#30363D]'
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-[#C9D1D9] whitespace-nowrap font-sans">
                      {log.userName ? (
                        <span>{log.userName}</span>
                      ) : (
                        <span className="text-[#8B949E] font-mono">SYSTEM_DAEMON</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-sans text-[#C9D1D9] text-xs max-w-md">
                      {log.details}
                    </td>
                    <td className="py-3 px-4 text-right text-[10px] text-[#8B949E] space-x-2 whitespace-nowrap">
                      {log.jobId && <span className="bg-[#0B0E14] border border-[#30363D] px-1.5 py-0.5 rounded text-[#58A6FF]">{log.jobId}</span>}
                      {log.printerId && <span className="bg-[#0B0E14] border border-[#30363D] px-1.5 py-0.5 rounded text-[#3fb950]">{log.printerId}</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
