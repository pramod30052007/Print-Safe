import React from 'react';
import { 
  Sliders, 
  ShieldAlert, 
  Users, 
  Printer as PrinterIcon, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  UserCheck, 
  UserX, 
  ArrowUpRight, 
  ScrollText, 
  BarChart3,
  Lock,
  Zap,
  Activity
} from 'lucide-react';
import { User, PrintJob, Printer, ActivityLog, SystemStats } from '../types/index.js';

interface AdminDashboardProps {
  stats: SystemStats | null;
  users: User[];
  allJobs: PrintJob[];
  printers: Printer[];
  recentLogs: ActivityLog[];
  onToggleUserStatus: (userId: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  users,
  allJobs,
  printers,
  recentLogs,
  onToggleUserStatus,
  onNavigateToTab,
}) => {
  const queuedJobs = allJobs.filter((j) => j.status === 'QUEUED' || j.status === 'AUTHENTICATED');
  const dlpSensitiveJobs = allJobs.filter((j) => j.aiSensitiveDetected);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-[#161B22] border border-[#30363D] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-[rgba(88,166,255,0.15)] text-[#58A6FF] border border-[#58A6FF]/30 text-[10px] font-mono font-bold uppercase">
              Admin & SOC Control
            </span>
            <span className="text-xs text-[#8B949E] font-mono">Zero-Trust Policy Enforcement</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Print Security Governance & Auditing</h2>
          <p className="text-xs text-[#8B949E] mt-1 max-w-xl">
            Real-time telemetry across physical printer endpoints, cryptographic access controls, and AI Data Loss Prevention (DLP) filters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateToTab('logs')}
            className="px-3.5 py-2 rounded-lg bg-[#1C2128] hover:bg-[#30363D] text-[#C9D1D9] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#30363D]"
          >
            <ScrollText className="w-4 h-4 text-[#58A6FF]" />
            <span>View Full Audit Trail</span>
          </button>
          <button
            onClick={() => onNavigateToTab('reports')}
            className="px-4 py-2 rounded-lg bg-[#58A6FF] hover:bg-[#79B8FF] text-[#0B0E14] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-[#58A6FF]/20"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Generate Executive Report</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-xl bg-[#161B22] border border-[#30363D] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider">Enterprise Queue</span>
            <div className="w-8 h-8 rounded-lg bg-[rgba(88,166,255,0.15)] text-[#58A6FF] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">{stats?.activeQueuedJobs ?? queuedJobs.length}</span>
            <span className="text-xs text-[#58A6FF] font-medium">Pending Release</span>
          </div>
          <p className="text-[11px] text-[#8B949E]">Auto-expires after configured TTL</p>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-xl bg-[#161B22] border border-[#30363D] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider">AI DLP Interceptions</span>
            <div className="w-8 h-8 rounded-lg bg-[rgba(210,153,34,0.15)] text-[#D29922] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#D29922] font-mono">{stats?.flaggedSensitiveJobs ?? dlpSensitiveJobs.length}</span>
            <span className="text-xs text-[#D29922] font-medium">Flagged & Confirmed</span>
          </div>
          <p className="text-[11px] text-[#8B949E]">SSN, bank cards, PII intercepted</p>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-xl bg-[#161B22] border border-[#30363D] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider">Hardware Fleet</span>
            <div className="w-8 h-8 rounded-lg bg-[rgba(88,166,255,0.15)] text-[#58A6FF] flex items-center justify-center">
              <PrinterIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {stats?.activePrintersCount ?? printers.filter((p) => p.isOnline).length} / {printers.length}
            </span>
            <span className="text-xs text-[#58A6FF] font-medium">Terminals Online</span>
          </div>
          <p className="text-[11px] text-[#8B949E]">Encrypted pull-print enabled</p>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-xl bg-[#161B22] border border-[#30363D] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider">Brute-Force Lockouts</span>
            <div className="w-8 h-8 rounded-lg bg-[rgba(248,81,73,0.15)] text-[#F85149] flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#F85149] font-mono">{stats?.securityThreatsBlocked ?? 0}</span>
            <span className="text-xs text-[#8B949E] font-medium">Violations Blocked</span>
          </div>
          <p className="text-[11px] text-[#8B949E]">3-attempt lockout policy active</p>
        </div>
      </div>

      {/* Split Section: User Role Management & Recent Audit Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User Account Access Controls (7 Cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#161B22] border border-[#30363D] shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#30363D]">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#58A6FF]" />
              <h3 className="font-bold text-white text-base">Authorized Personnel & Role Access</h3>
            </div>
            <span className="text-xs text-[#8B949E] font-mono">{users.length} Active Accounts</span>
          </div>

          <div className="space-y-2.5">
            {users.map((u) => (
              <div
                key={u.id}
                className="p-3.5 rounded-xl bg-[#0B0E14] border border-[#30363D] flex items-center justify-between gap-3 hover:border-[#58A6FF]/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover border border-[#30363D] shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white text-xs truncate">{u.name}</p>
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                        u.role === 'admin' ? 'bg-[rgba(88,166,255,0.15)] text-[#58A6FF] border border-[#58A6FF]/30' :
                        u.role === 'security_officer' ? 'bg-[rgba(210,153,34,0.15)] text-[#D29922] border border-[#D29922]/30' :
                        'bg-[#1C2128] text-[#8B949E] border border-[#30363D]'
                      }`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8B949E] truncate">{u.email} • {u.department}</p>
                    <p className="text-[10px] text-[#8B949E] font-mono">Badge: {u.badgeId}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleUserStatus(u.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                      u.status === 'active'
                        ? 'bg-[#1C2128] hover:bg-[rgba(248,81,73,0.15)] text-[#C9D1D9] hover:text-[#F85149] border border-[#30363D] hover:border-[#F85149]/40'
                        : 'bg-[rgba(248,81,73,0.15)] text-[#F85149] border border-[#F85149]/30 hover:bg-[rgba(35,134,54,0.15)] hover:text-[#3fb950]'
                    }`}
                  >
                    {u.status === 'active' ? (
                      <>
                        <UserX className="w-3.5 h-3.5 text-[#8B949E]" />
                        <span>Suspend</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3.5 h-3.5 text-[#3fb950]" />
                        <span>Reactivate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Security Audit Feed Preview (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#161B22] border border-[#30363D] shadow-lg space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#30363D] mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#58A6FF]" />
                <h3 className="font-bold text-white text-base">Live SIEM Activity Feed</h3>
              </div>
              <button
                onClick={() => onNavigateToTab('logs')}
                className="text-xs text-[#58A6FF] hover:text-[#79B8FF] flex items-center gap-1 cursor-pointer font-medium"
              >
                <span>Full Logs</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {recentLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-[#0B0E14] border border-[#30363D] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                      log.severity === 'CRITICAL' ? 'bg-[rgba(248,81,73,0.15)] text-[#F85149] border border-[#F85149]/30' :
                      log.severity === 'WARNING' ? 'bg-[rgba(210,153,34,0.15)] text-[#D29922] border border-[#D29922]/30' :
                      log.severity === 'SUCCESS' ? 'bg-[rgba(35,134,54,0.15)] text-[#3fb950] border border-[#3fb950]/30' :
                      'bg-[#1C2128] text-[#8B949E] border border-[#30363D]'
                    }`}>
                      {log.action}
                    </span>
                    <span className="text-[10px] font-mono text-[#8B949E]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-[#C9D1D9] text-[11px] leading-relaxed truncate" title={log.details}>
                    {log.details}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0B0E14] border border-[#30363D] text-xs text-[#8B949E] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#58A6FF] shrink-0" />
            <span>Zero-Retention Cryptographic Shredding verified on all endpoints.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
