export type UserRole = 'admin' | 'user' | 'security_officer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
  createdAt: string;
  status: 'active' | 'suspended';
  badgeId: string;
}

export interface DlpFinding {
  type: 'SSN' | 'CREDIT_CARD' | 'PHONE' | 'EMAIL' | 'CONFIDENTIAL_KEYWORD' | 'BANK_ACCOUNT' | 'PASSPORT' | 'HEALTH_RECORD';
  snippet: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
}

export interface DlpScanResult {
  isSensitive: boolean;
  sensitivityScore: number; // 0 to 100
  summary: string;
  findings: DlpFinding[];
  recommendedTier: 'STANDARD' | 'CONFIDENTIAL' | 'RESTRICTED';
}

export interface DocumentItem {
  id: string;
  userId: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'image' | 'txt';
  fileSize: number; // bytes
  pageCount: number;
  textContent?: string;
  previewUrl?: string;
  uploadedAt: string;
  checksumSha256: string;
  dlpResult?: DlpScanResult;
}

export type JobStatus = 
  | 'QUEUED' 
  | 'AUTHENTICATED' 
  | 'PRINTING' 
  | 'COMPLETED' 
  | 'EXPIRED' 
  | 'CANCELLED' 
  | 'REJECTED_DLP';

export interface PrintJob {
  id: string; // e.g. "JOB-8942-A"
  userId: string;
  userName: string;
  userEmail: string;
  documentId: string;
  documentName: string;
  fileType: 'pdf' | 'docx' | 'image' | 'txt';
  fileSize: number;
  pageCount: number;
  copies: number;
  colorMode: 'color' | 'monochrome';
  duplex: 'simplex' | 'duplex';
  selectedPrinterId: string;
  selectedPrinterName: string;
  status: JobStatus;
  pinCode: string; // 6-digit OTP
  qrToken: string;
  createdAt: string;
  expiresAt: string; // ISO string
  printCompletedAt?: string;
  securityTier: 'STANDARD' | 'CONFIDENTIAL' | 'RESTRICTED';
  aiSensitiveDetected: boolean;
  dlpFindingsSummary?: string;
  authAttempts: number;
  maxAuthAttempts: number;
  printProgress?: number; // 0 to 100
}

export interface Printer {
  id: string;
  name: string;
  location: string;
  ipAddress: string;
  model: string;
  isOnline: boolean;
  status: 'IDLE' | 'PRINTING' | 'PAPER_JAM' | 'OUT_OF_PAPER' | 'OFFLINE';
  paperLevel: number; // 0 - 100
  tonerLevel: number; // 0 - 100
  supportedFormats: string[];
  totalPagesPrinted: number;
  activeJobId?: string;
}

export type LogSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  action: string;
  details: string;
  ipAddress: string;
  printerId?: string;
  jobId?: string;
  severity: LogSeverity;
}

export interface SystemStats {
  activeQueuedJobs: number;
  completedJobsTotal: number;
  totalPagesPrinted: number;
  activePrintersCount: number;
  totalPrintersCount: number;
  flaggedSensitiveJobs: number;
  expiredPurgedJobs: number;
  securityThreatsBlocked: number;
}
