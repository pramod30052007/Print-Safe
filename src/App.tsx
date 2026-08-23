import React, { useState, useEffect, useCallback } from 'react';
import { 
  Printer as PrinterIcon, 
  Plus, 
  ShieldCheck, 
  Terminal, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  FileText,
  Clock,
  Layers,
  BarChart3,
  ScrollText,
  HelpCircle,
  Zap,
  Info
} from 'lucide-react';
import { User, Printer, PrintJob, DocumentItem, ActivityLog, SystemStats, DlpScanResult } from './types/index.js';
import { api } from './services/api.js';

// Components
import { Navbar } from './components/Navbar.js';
import { UserDashboard } from './components/UserDashboard.js';
import { PrinterManagement } from './components/PrinterManagement.js';
import { AdminDashboard } from './components/AdminDashboard.js';
import { AuditLogsView } from './components/AuditLogsView.js';
import { ReportsView } from './components/ReportsView.js';
import { JobTicketModal } from './components/JobTicketModal.js';
import { DlpWarningModal } from './components/DlpWarningModal.js';
import { UploadModal } from './components/UploadModal.js';
import { PrinterKioskSimulator } from './components/PrinterKioskSimulator.js';
import { SecurityArchitectureModal } from './components/SecurityArchitectureModal.js';

export function App() {
  // Navigation & User State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  
  // Data State
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals & Active Selections
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isKioskOpen, setIsKioskOpen] = useState(false);
  const [selectedKioskJob, setSelectedKioskJob] = useState<PrintJob | null>(null);
  const [ticketModalJob, setTicketModalJob] = useState<PrintJob | null>(null);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);

  // DLP Warning Flow State
  const [pendingDlpResult, setPendingDlpResult] = useState<DlpScanResult | null>(null);
  const [pendingFileName, setPendingFileName] = useState('');
  const [pendingUploadPayload, setPendingUploadPayload] = useState<any>(null);

  // Notification Toast
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'warning' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Initial Fetch & Sync
  const fetchAllData = useCallback(async () => {
    try {
      const [usersRes, printersRes, jobsRes, docsRes, logsRes, statsRes] = await Promise.all([
        api.getUsers(),
        api.getPrinters(),
        api.getPrintJobs(),
        api.getDocuments(),
        api.getAuditLogs(),
        api.getStats(),
      ]);

      setUsers(usersRes.users);
      if (!currentUser && usersRes.users.length > 0) {
        setCurrentUser(usersRes.users[0]); // Default to first user (Sarah Jenkins)
      }
      setPrinters(printersRes.printers);
      setJobs(jobsRes.jobs);
      setDocuments(docsRes.documents);
      setLogs(logsRes.logs);
      setStats(statsRes.stats);
    } catch (err) {
      console.error('Failed to sync data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchAllData();
    // Auto-refresh every 8 seconds to reflect expiring jobs & logs
    const interval = setInterval(fetchAllData, 8000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // Handle Switch Role
  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    showToast(`Switched active profile to ${user.name} (${user.role.replace('_', ' ').toUpperCase()})`, 'info');
  };

  // Handlers for Print Job
  const handleJobCreated = (newJob: PrintJob) => {
    fetchAllData();
    setTicketModalJob(newJob);
    showToast(`Print Job #${newJob.id} queued securely! OTP: ${newJob.pinCode}`, 'success');
  };

  const handleCancelJob = async (jobId: string) => {
    try {
      await api.cancelPrintJob(jobId);
      fetchAllData();
      showToast(`Print Job #${jobId} cancelled and purged.`, 'warning');
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel job', 'warning');
    }
  };

  const handlePrintCompleted = (job: PrintJob) => {
    fetchAllData();
    showToast(`Job #${job.id} printed at ${job.selectedPrinterName}. Print buffer shredded!`, 'success');
  };

  // DLP Modal Handlers
  const handleTriggerDlpWarning = (dlpResult: DlpScanResult, fileName: string, uploadPayload: any) => {
    setIsUploadOpen(false);
    setPendingDlpResult(dlpResult);
    setPendingFileName(fileName);
    setPendingUploadPayload(uploadPayload);
  };

  const handleDlpConfirm = async (securityTier: 'CONFIDENTIAL' | 'RESTRICTED') => {
    if (!pendingUploadPayload || !currentUser) return;
    try {
      const docRes = await api.uploadDocument({
        userId: currentUser.id,
        fileName: pendingUploadPayload.documentName,
        fileType: pendingUploadPayload.fileType,
        fileSize: pendingUploadPayload.fileSize,
        pageCount: pendingUploadPayload.pageCount,
        textContent: pendingUploadPayload.textContent,
        dlpResult: pendingDlpResult || undefined,
      });

      const jobRes = await api.createPrintJob({
        userId: currentUser.id,
        documentId: docRes.document.id,
        documentName: pendingUploadPayload.documentName,
        fileType: pendingUploadPayload.fileType,
        fileSize: pendingUploadPayload.fileSize,
        pageCount: pendingUploadPayload.pageCount,
        copies: pendingUploadPayload.copies,
        colorMode: pendingUploadPayload.colorMode,
        duplex: pendingUploadPayload.duplex,
        selectedPrinterId: pendingUploadPayload.selectedPrinterId,
        securityTier,
        aiSensitiveDetected: true,
        expiryMinutes: pendingUploadPayload.expiryMinutes || 15,
      });

      setPendingDlpResult(null);
      setPendingUploadPayload(null);
      handleJobCreated(jobRes.job);
    } catch (err: any) {
      showToast(err.message || 'Failed to queue sensitive document.', 'warning');
    }
  };

  // Printer Management Actions
  const handlePrinterAction = async (printerId: string, action: string, value?: any) => {
    try {
      await api.updatePrinter(printerId, action, value);
      fetchAllData();
      showToast(`Printer station ${printerId} updated successfully.`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to update printer', 'warning');
    }
  };

  // Toggle User Status
  const handleToggleUserStatus = async (userId: string) => {
    try {
      const user = users.find((u) => u.id === userId);
      const newStatus = user?.status === 'active' ? 'suspended' : 'active';
      await api.updateUserStatus(userId, newStatus);
      fetchAllData();
      showToast(`User account status set to ${newStatus}.`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to update user status', 'warning');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#C9D1D9] flex flex-col selection:bg-[#58A6FF] selection:text-[#0B0E14]">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
          <div className={`p-4 rounded-xl shadow-2xl border flex items-center gap-3 text-xs font-semibold ${
            toastMsg.type === 'success' ? 'bg-[#161B22] border-[#238636] text-[#3fb950]' :
            toastMsg.type === 'warning' ? 'bg-[#161B22] border-[#D29922] text-[#D29922]' :
            'bg-[#161B22] border-[#58A6FF] text-[#58A6FF]'
          }`}>
            {toastMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-[#3fb950] shrink-0" /> :
             toastMsg.type === 'warning' ? <AlertCircle className="w-4 h-4 text-[#D29922] shrink-0" /> :
             <Info className="w-4 h-4 text-[#58A6FF] shrink-0" />}
            <span>{toastMsg.text}</span>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        currentUser={currentUser}
        allUsers={users}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectUser={handleSelectUser}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenKiosk={() => {
          setSelectedKioskJob(null);
          setIsKioskOpen(true);
        }}
        onOpenArchInfo={() => setIsArchModalOpen(true)}
        onResetDemo={fetchAllData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Quick Operational Sub-Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#8B949E] bg-[#161B22] p-3.5 rounded-xl border border-[#30363D]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3fb950] animate-pulse"></span>
            <span className="text-[#C9D1D9] font-medium">PrintSafe Zero-Trust Protection Active</span>
            <span className="text-[#30363D]">•</span>
            <span>Gemini AI DLP</span>
            <span className="text-[#30363D]">•</span>
            <span>Hardware PIN/QR Pull-Printing</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsArchModalOpen(true)}
              className="text-[#58A6FF] hover:text-[#79B8FF] hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>View Security Architecture Specification</span>
            </button>
          </div>
        </div>

        {/* Tab Views */}
        {activeTab === 'dashboard' && (
          <UserDashboard
            currentUser={currentUser}
            jobs={jobs}
            documents={documents}
            onOpenUpload={() => setIsUploadOpen(true)}
            onOpenJobTicket={(job) => setTicketModalJob(job)}
            onOpenKioskWithJob={(job) => {
              setSelectedKioskJob(job);
              setIsKioskOpen(true);
            }}
            onCancelJob={handleCancelJob}
            onRefresh={fetchAllData}
          />
        )}

        {activeTab === 'printers' && (
          <PrinterManagement
            printers={printers}
            onPrinterAction={handlePrinterAction}
            onOpenKioskForPrinter={(p) => {
              setSelectedKioskJob(null);
              setIsKioskOpen(true);
            }}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            stats={stats}
            users={users}
            allJobs={jobs}
            printers={printers}
            recentLogs={logs}
            onToggleUserStatus={handleToggleUserStatus}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'logs' && (
          <AuditLogsView logs={logs} onRefresh={fetchAllData} />
        )}

        {activeTab === 'reports' && (
          <ReportsView stats={stats} jobs={jobs} printers={printers} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#30363D] bg-[#0B0E14] py-6 text-center text-xs text-[#8B949E]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#58A6FF]" />
            <span className="font-semibold text-[#C9D1D9]">PrintSafe™ Enterprise Document Security</span>
          </div>
          <p className="font-mono text-[11px] text-[#8B949E]">
            Compliant with DoD 5220.22-M Zero-Retention Standard & NIST SP 800-88
          </p>
        </div>
      </footer>

      {/* Modal Dialogs */}
      {isUploadOpen && (
        <UploadModal
          currentUser={currentUser}
          printers={printers}
          onClose={() => setIsUploadOpen(false)}
          onJobCreated={handleJobCreated}
          onTriggerDlpWarning={handleTriggerDlpWarning}
        />
      )}

      {isKioskOpen && (
        <PrinterKioskSimulator
          printers={printers}
          initialJob={selectedKioskJob}
          currentUser={currentUser}
          onClose={() => setIsKioskOpen(false)}
          onPrintCompleted={handlePrintCompleted}
        />
      )}

      {ticketModalJob && (
        <JobTicketModal
          job={ticketModalJob}
          onClose={() => setTicketModalJob(null)}
          onOpenKiosk={() => {
            setSelectedKioskJob(ticketModalJob);
            setTicketModalJob(null);
            setIsKioskOpen(true);
          }}
        />
      )}

      {pendingDlpResult && (
        <DlpWarningModal
          dlpResult={pendingDlpResult}
          fileName={pendingFileName}
          onConfirmProceed={handleDlpConfirm}
          onCancel={() => {
            setPendingDlpResult(null);
            setPendingUploadPayload(null);
          }}
        />
      )}

      {isArchModalOpen && (
        <SecurityArchitectureModal onClose={() => setIsArchModalOpen(false)} />
      )}
    </div>
  );
}

export default App;

