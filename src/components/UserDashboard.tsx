import React, { useState } from 'react';
import { 
  FileText, 
  Clock, 
  KeyRound, 
  QrCode, 
  Printer as PrinterIcon, 
  Trash2, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Layers, 
  Search, 
  Filter, 
  Plus, 
  Sparkles,
  RefreshCw,
  Eye,
  AlertCircle
} from 'lucide-react';
import { PrintJob, DocumentItem, User } from '../types/index.js';

interface UserDashboardProps {
  currentUser: User | null;
  jobs: PrintJob[];
  documents: DocumentItem[];
  onOpenUpload: () => void;
  onOpenJobTicket: (job: PrintJob) => void;
  onOpenKioskWithJob: (job: PrintJob) => void;
  onCancelJob: (jobId: string) => void;
  onRefresh: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  jobs,
  documents,
  onOpenUpload,
  onOpenJobTicket,
  onOpenKioskWithJob,
  onCancelJob,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'history' | 'documents'>('queue');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<string>('ALL');

  const activeQueuedJobs = jobs.filter((j) => j.status === 'QUEUED' || j.status === 'AUTHENTICATED');
  const historicalJobs = jobs.filter((j) => j.status === 'COMPLETED' || j.status === 'EXPIRED' || j.status === 'CANCELLED');
  const dlpFlaggedCount = jobs.filter((j) => j.aiSensitiveDetected).length;
  const completedCount = jobs.filter((j) => j.status === 'COMPLETED').length;

  const filteredActiveJobs = activeQueuedJobs.filter((j) => {
    const matchesSearch = j.documentName.toLowerCase().includes(searchQuery.toLowerCase()) || j.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = filterTier === 'ALL' || j.securityTier === filterTier;
    return matchesSearch && matchesTier;
  });

  const filteredHistoryJobs = historicalJobs.filter((j) => {
    const matchesSearch = j.documentName.toLowerCase().includes(searchQuery.toLowerCase()) || j.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = filterTier === 'ALL' || j.securityTier === filterTier;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-xl bg-[#161B22] border border-[#30363D] shadow-sm relative overflow-hidden group hover:border-[#58A6FF]/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider">Active in Secure Queue</span>
            <div className="w-8 h-8 rounded-lg bg-[rgba(88,166,255,0.15)] text-[#58A6FF] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">{activeQueuedJobs.length}</span>
            <span className="text-xs text-[#58A6FF] font-medium">Pending Physical Release</span>
          </div>
          <p className="text-[11px] text-[#8B949E] mt-2">Protected by 6-digit OTP & optical QR</p>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-xl bg-[#161B22] border border-[#30363D] shadow-sm relative overflow-hidden group hover:border-[#3fb950]/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider">Completed Prints</span>
            <div className="w-8 h-8 rounded-lg bg-[rgba(35,134,54,0.2)] text-[#3fb950] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">{completedCount}</span>
            <span className="text-xs text-[#3fb950] font-medium">Documents Released</span>
          </div>
          <p className="text-[11px] text-[#8B949E] mt-2">Temporary cache zeroized upon completion</p>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-xl bg-[#161B22] border border-[#30363D] shadow-sm relative overflow-hidden group hover:border-[#D29922]/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider">AI DLP Flagged</span>
            <div className="w-8 h-8 rounded-lg bg-[rgba(210,153,34,0.2)] text-[#D29922] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">{dlpFlaggedCount}</span>
            <span className="text-xs text-[#D29922] font-medium">PII & Confidential</span>
          </div>
          <p className="text-[11px] text-[#8B949E] mt-2">Scanned via Gemini AI Engine</p>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-xl bg-[#161B22] border border-[#30363D] shadow-sm relative overflow-hidden group hover:border-[#58A6FF]/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider">Security Compliance</span>
            <div className="w-8 h-8 rounded-lg bg-[rgba(88,166,255,0.15)] text-[#58A6FF] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#3fb950] font-mono">100%</span>
            <span className="text-xs text-[#C9D1D9] font-medium">Zero-Retention</span>
          </div>
          <p className="text-[11px] text-[#8B949E] mt-2">DoD 5220.22-M buffer sanitization</p>
        </div>
      </div>

      {/* Main Workspace Tabs & Filter Header */}
      <div className="p-6 rounded-2xl bg-[#161B22] border border-[#30363D] shadow-lg space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#30363D]">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('queue')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'queue'
                  ? 'bg-[rgba(88,166,255,0.15)] text-[#58A6FF] border border-[#58A6FF]/40 shadow-sm'
                  : 'text-[#8B949E] hover:bg-[#1C2128] hover:text-[#C9D1D9]'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Active Print Queue ({activeQueuedJobs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-[rgba(88,166,255,0.15)] text-[#58A6FF] border border-[#58A6FF]/40 shadow-sm'
                  : 'text-[#8B949E] hover:bg-[#1C2128] hover:text-[#C9D1D9]'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Print History ({historicalJobs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('documents')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'documents'
                  ? 'bg-[rgba(88,166,255,0.15)] text-[#58A6FF] border border-[#58A6FF]/40 shadow-sm'
                  : 'text-[#8B949E] hover:bg-[#1C2128] hover:text-[#C9D1D9]'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Uploaded Files ({documents.length})</span>
            </button>
          </div>

          {/* Action & Filter Controls */}
          <div className="flex items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8B949E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search job or file..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#0B0E14] border border-[#30363D] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#C9D1D9] placeholder-[#8B949E] focus:outline-none focus:border-[#58A6FF] w-40 sm:w-48"
              />
            </div>

            {/* Refresh */}
            <button
              onClick={onRefresh}
              className="p-2 rounded-lg bg-[#1C2128] hover:bg-[#30363D] text-[#8B949E] hover:text-white border border-[#30363D] transition-colors cursor-pointer"
              title="Refresh queue"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Upload Button */}
            <button
              onClick={onOpenUpload}
              className="px-3.5 py-1.5 rounded-lg bg-[#58A6FF] hover:bg-[#79B8FF] text-[#0B0E14] font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#58A6FF]/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Print Job</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Active Print Queue */}
        {activeTab === 'queue' && (
          <div className="space-y-3">
            {filteredActiveJobs.length === 0 ? (
              <div className="py-12 text-center space-y-3 rounded-xl bg-[#0B0E14]/60 border border-dashed border-[#30363D]">
                <FileText className="w-12 h-12 text-[#8B949E]/50 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-[#C9D1D9]">No active documents in secure print queue</h4>
                  <p className="text-xs text-[#8B949E] max-w-sm mx-auto">
                    Upload a confidential or standard document to generate an encrypted PIN and place it in the secure release queue.
                  </p>
                </div>
                <button
                  onClick={onOpenUpload}
                  className="px-4 py-2 rounded-lg bg-[#58A6FF] hover:bg-[#79B8FF] text-[#0B0E14] font-bold text-xs cursor-pointer shadow-md"
                >
                  Upload First Document
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0B0E14] text-[#8B949E] uppercase tracking-wider font-mono text-[10px] border-b border-[#30363D]">
                    <tr>
                      <th className="py-3 px-4 rounded-l-lg">Job Ticket</th>
                      <th className="py-3 px-4">Document Details</th>
                      <th className="py-3 px-4">Printer Station</th>
                      <th className="py-3 px-4">6-Digit OTP / QR</th>
                      <th className="py-3 px-4">Security Tier</th>
                      <th className="py-3 px-4">Time Left</th>
                      <th className="py-3 px-4 text-right rounded-r-lg">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#30363D]">
                    {filteredActiveJobs.map((job) => {
                      const expDiff = new Date(job.expiresAt).getTime() - new Date().getTime();
                      const expMins = Math.max(0, Math.floor(expDiff / (1000 * 60)));

                      return (
                        <tr key={job.id} className="hover:bg-[#1C2128] transition-colors group">
                          {/* Job Ticket */}
                          <td className="py-3.5 px-4 font-mono">
                            <span className="font-bold text-[#58A6FF]">{job.id}</span>
                            <p className="text-[10px] text-[#8B949E]">By: {job.userName}</p>
                          </td>

                          {/* Document Name */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-white truncate max-w-xs flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-[#58A6FF] shrink-0" />
                              <span title={job.documentName}>{job.documentName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-[#8B949E] mt-0.5">
                              <span>{job.pageCount} Pages</span>
                              <span>•</span>
                              <span>{job.copies} {job.copies === 1 ? 'Copy' : 'Copies'}</span>
                              <span>•</span>
                              <span className="capitalize">{job.colorMode}</span>
                            </div>
                          </td>

                          {/* Printer */}
                          <td className="py-3.5 px-4">
                            <div className="text-[#C9D1D9] font-medium truncate max-w-[160px]" title={job.selectedPrinterName}>
                              {job.selectedPrinterName}
                            </div>
                            <p className="text-[10px] text-[#8B949E] font-mono">ID: {job.selectedPrinterId}</p>
                          </td>

                          {/* OTP & QR Code Badge */}
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => onOpenJobTicket(job)}
                              className="px-2.5 py-1 rounded-md bg-[#0B0E14] hover:bg-[#1C2128] border border-[#58A6FF]/40 text-[#58A6FF] font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm group-hover:border-[#58A6FF] transition-colors"
                              title="Click to view full QR and PIN release pass"
                            >
                              <KeyRound className="w-3.5 h-3.5 text-[#58A6FF]" />
                              <span>{job.pinCode}</span>
                              <QrCode className="w-3.5 h-3.5 text-[#8B949E] ml-1" />
                            </button>
                          </td>

                          {/* Security Tier */}
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                              job.securityTier === 'RESTRICTED' ? 'bg-[rgba(248,81,73,0.15)] text-[#F85149] border border-[#F85149]/30' :
                              job.securityTier === 'CONFIDENTIAL' ? 'bg-[rgba(210,153,34,0.15)] text-[#D29922] border border-[#D29922]/30' :
                              'bg-[rgba(35,134,54,0.15)] text-[#3fb950] border border-[#3fb950]/30'
                            }`}>
                              {job.securityTier}
                            </span>
                            {job.aiSensitiveDetected && (
                              <p className="text-[10px] text-[#D29922] flex items-center gap-1 mt-1 font-medium">
                                <Sparkles className="w-3 h-3" /> DLP Flagged
                              </p>
                            )}
                          </td>

                          {/* TTL Time Left */}
                          <td className="py-3.5 px-4 font-mono">
                            <span className="text-[#C9D1D9]">{expMins}m remaining</span>
                            <div className="w-16 bg-[#0B0E14] h-1.5 rounded-full overflow-hidden mt-1 border border-[#30363D]">
                              <div
                                className="bg-[#58A6FF] h-full rounded-full"
                                style={{ width: `${Math.min(100, (expMins / 20) * 100)}%` }}
                              ></div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Open in Kiosk */}
                              <button
                                onClick={() => onOpenKioskWithJob(job)}
                                className="p-1.5 rounded-md bg-[rgba(88,166,255,0.15)] hover:bg-[rgba(88,166,255,0.25)] text-[#58A6FF] border border-[#58A6FF]/30 cursor-pointer transition-colors"
                                title="Release directly at virtual printer kiosk"
                              >
                                <Play className="w-3.5 h-3.5" />
                              </button>

                              {/* View Ticket */}
                              <button
                                onClick={() => onOpenJobTicket(job)}
                                className="p-1.5 rounded-md bg-[#1C2128] hover:bg-[#30363D] text-[#C9D1D9] cursor-pointer transition-colors"
                                title="View PIN/QR Pass"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Cancel */}
                              <button
                                onClick={() => onCancelJob(job.id)}
                                className="p-1.5 rounded-md bg-[#1C2128] hover:bg-[rgba(248,81,73,0.2)] text-[#8B949E] hover:text-[#F85149] cursor-pointer transition-colors"
                                title="Cancel Print Job"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Print History */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {filteredHistoryJobs.length === 0 ? (
              <div className="py-12 text-center space-y-2 rounded-xl bg-[#0B0E14]/60 border border-dashed border-[#30363D]">
                <FileText className="w-10 h-10 text-[#8B949E]/50 mx-auto" />
                <p className="text-xs text-[#8B949E]">No print history entries logged yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0B0E14] text-[#8B949E] uppercase tracking-wider font-mono text-[10px] border-b border-[#30363D]">
                    <tr>
                      <th className="py-3 px-4 rounded-l-lg">Job Ticket</th>
                      <th className="py-3 px-4">Document</th>
                      <th className="py-3 px-4">Printer</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Date / Time</th>
                      <th className="py-3 px-4 text-right rounded-r-lg">Audit Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#30363D]">
                    {filteredHistoryJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-[#1C2128] transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#C9D1D9]">{job.id}</td>
                        <td className="py-3 px-4 font-medium text-white truncate max-w-xs">{job.documentName}</td>
                        <td className="py-3 px-4 text-[#8B949E]">{job.selectedPrinterName}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            job.status === 'COMPLETED' ? 'bg-[rgba(35,134,54,0.15)] text-[#3fb950] border border-[#3fb950]/30' :
                            job.status === 'EXPIRED' ? 'bg-[rgba(210,153,34,0.15)] text-[#D29922] border border-[#D29922]/30' :
                            'bg-[rgba(248,81,73,0.15)] text-[#F85149] border border-[#F85149]/30'
                          }`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#8B949E] font-mono text-[11px]">
                          {new Date(job.printCompletedAt || job.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-[#3fb950] font-mono text-[11px]">
                          {job.status === 'COMPLETED' ? 'Buffer Zeroized' : job.status === 'EXPIRED' ? 'Memory Purged' : 'Cancelled'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Uploaded Files */}
        {activeTab === 'documents' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {documents.length === 0 ? (
              <div className="col-span-full py-12 text-center space-y-2 rounded-xl bg-[#0B0E14]/60 border border-dashed border-[#30363D]">
                <FileText className="w-10 h-10 text-[#8B949E]/50 mx-auto" />
                <p className="text-xs text-[#8B949E]">No documents uploaded.</p>
              </div>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} className="p-4 rounded-xl bg-[#0B0E14] border border-[#30363D] space-y-2 hover:border-[#58A6FF]/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs truncate max-w-[180px]">{doc.fileName}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1C2128] text-[#8B949E] uppercase border border-[#30363D]">
                      {doc.fileType}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8B949E] font-mono">
                    {(doc.fileSize / 1024).toFixed(1)} KB • {doc.pageCount} Pages
                  </p>
                  <p className="text-[10px] text-[#8B949E] font-mono truncate">
                    SHA-256: {doc.checksumSha256.substring(0, 16)}...
                  </p>
                  {doc.dlpResult?.isSensitive && (
                    <div className="p-1.5 rounded bg-[rgba(210,153,34,0.15)] border border-[#D29922]/30 text-[10px] text-[#D29922]">
                      DLP Risk Score: {doc.dlpResult.sensitivityScore}/100
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
