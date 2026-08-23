import { 
  User, 
  PrintJob, 
  Printer, 
  ActivityLog, 
  DocumentItem, 
  DlpScanResult, 
  SystemStats 
} from '../types/index.js';

export const api = {
  // Auth
  async login(email?: string, role?: string): Promise<{ user: User }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Authentication failed');
    }
    return res.json();
  },

  async getUsers(): Promise<{ users: User[] }> {
    const res = await fetch('/api/auth/users');
    return res.json();
  },

  // AI Sensitive Document DLP Scanner
  async scanDocument(textContent: string, fileName: string): Promise<{ result: DlpScanResult }> {
    const res = await fetch('/api/ai/scan-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ textContent, fileName }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'DLP scan failed');
    }
    return res.json();
  },

  // Documents
  async uploadDocument(data: {
    userId: string;
    fileName: string;
    fileType: 'pdf' | 'docx' | 'image' | 'txt';
    fileSize: number;
    pageCount: number;
    textContent?: string;
    previewUrl?: string;
    dlpResult?: DlpScanResult;
  }): Promise<{ document: DocumentItem }> {
    const res = await fetch('/api/documents/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Document upload failed');
    }
    return res.json();
  },

  async getDocuments(userId?: string): Promise<{ documents: DocumentItem[] }> {
    const url = userId ? `/api/documents?userId=${encodeURIComponent(userId)}` : '/api/documents';
    const res = await fetch(url);
    return res.json();
  },

  // Print Jobs
  async createPrintJob(data: {
    userId: string;
    documentId: string;
    documentName: string;
    fileType: 'pdf' | 'docx' | 'image' | 'txt';
    fileSize: number;
    pageCount: number;
    copies: number;
    colorMode: 'color' | 'monochrome';
    duplex: 'simplex' | 'duplex';
    selectedPrinterId: string;
    securityTier: 'STANDARD' | 'CONFIDENTIAL' | 'RESTRICTED';
    aiSensitiveDetected: boolean;
    dlpFindingsSummary?: string;
    expiryMinutes?: number;
  }): Promise<{ job: PrintJob }> {
    const res = await fetch('/api/print-jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Print job submission failed');
    }
    return res.json();
  },

  async getPrintJobs(userId?: string, role?: string): Promise<{ jobs: PrintJob[] }> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (role) params.append('role', role);
    const res = await fetch(`/api/print-jobs?${params.toString()}`);
    return res.json();
  },

  async cancelPrintJob(id: string, userId?: string): Promise<{ job: PrintJob }> {
    const res = await fetch(`/api/print-jobs/${encodeURIComponent(id)}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to cancel job');
    }
    return res.json();
  },

  // Printer Terminal IoT
  async verifyOtpAtPrinter(printerId: string, pinCode: string): Promise<{ success: boolean; job: PrintJob; message: string }> {
    const res = await fetch('/api/printer-terminal/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ printerId, pinCode }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'PIN authentication failed');
    }
    return data;
  },

  async verifyQrAtPrinter(printerId: string, qrToken: string): Promise<{ success: boolean; job: PrintJob; message: string }> {
    const res = await fetch('/api/printer-terminal/verify-qr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ printerId, qrToken }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'QR authentication failed');
    }
    return data;
  },

  async executePrint(jobId: string, printerId?: string): Promise<{ success: boolean; message: string; job: PrintJob; printer: Printer }> {
    const res = await fetch('/api/printer-terminal/execute-print', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, printerId }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Print execution failed');
    }
    return data;
  },

  // Printers
  async getPrinters(): Promise<{ printers: Printer[] }> {
    const res = await fetch('/api/printers');
    return res.json();
  },

  async printerAction(id: string, action: string, value?: any): Promise<{ printer: Printer }> {
    const res = await fetch(`/api/printers/${encodeURIComponent(id)}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, value }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Printer action failed');
    }
    return res.json();
  },

  async updatePrinter(id: string, action: string, value?: any): Promise<{ printer: Printer }> {
    return this.printerAction(id, action, value);
  },

  // Admin & Auditing
  async getAdminLogs(severity?: string, action?: string): Promise<{ logs: ActivityLog[] }> {
    const params = new URLSearchParams();
    if (severity) params.append('severity', severity);
    if (action) params.append('action', action);
    const res = await fetch(`/api/admin/logs?${params.toString()}`);
    return res.json();
  },

  async getAuditLogs(severity?: string, action?: string): Promise<{ logs: ActivityLog[] }> {
    return this.getAdminLogs(severity, action);
  },

  async getAdminStats(): Promise<{ stats: SystemStats }> {
    const res = await fetch('/api/admin/stats');
    return res.json();
  },

  async getStats(): Promise<{ stats: SystemStats }> {
    return this.getAdminStats();
  },

  async toggleUserStatus(userId: string): Promise<{ user: User }> {
    const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/toggle-status`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Status toggle failed');
    }
    return res.json();
  },

  async updateUserStatus(userId: string, status?: string): Promise<{ user: User }> {
    return this.toggleUserStatus(userId);
  },

  async resetDemo(): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/system/reset-demo', {
      method: 'POST',
    });
    return res.json();
  },
};
