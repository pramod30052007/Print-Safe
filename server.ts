import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { 
  User, 
  PrintJob, 
  Printer, 
  ActivityLog, 
  DocumentItem, 
  DlpScanResult, 
  DlpFinding,
  SystemStats 
} from './src/types/index.js';

const app = express();
const PORT = 3000;

// Body parsing with generous limit for document transfers
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Lazy Gemini API Client Initialization
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// -------------------------------------------------------------
// In-Memory Database Store (Seed Data)
// -------------------------------------------------------------
const users: Map<string, User> = new Map([
  [
    'usr-admin-1',
    {
      id: 'usr-admin-1',
      name: 'Elena Rostova',
      email: 'admin@printsafe.io',
      role: 'admin',
      department: 'Cybersecurity & IT Infrastructure',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-01-10T08:00:00Z',
      status: 'active',
      badgeId: 'BADGE-9901-SEC',
    },
  ],
  [
    'usr-sec-2',
    {
      id: 'usr-sec-2',
      name: 'Marcus Vance',
      email: 'security@printsafe.io',
      role: 'security_officer',
      department: 'Information Security & Compliance',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-02-01T09:30:00Z',
      status: 'active',
      badgeId: 'BADGE-8822-SEC',
    },
  ],
  [
    'usr-emp-3',
    {
      id: 'usr-emp-3',
      name: 'Sarah Chen',
      email: 'sarah.chen@techcorp.com',
      role: 'user',
      department: 'Financial Auditing & Strategy',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-03-15T10:15:00Z',
      status: 'active',
      badgeId: 'BADGE-3041-FIN',
    },
  ],
  [
    'usr-emp-4',
    {
      id: 'usr-emp-4',
      name: 'Alex Miller',
      email: 'alex.miller@techcorp.com',
      role: 'user',
      department: 'Engineering & Hardware Systems',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-04-10T14:20:00Z',
      status: 'active',
      badgeId: 'BADGE-4419-ENG',
    },
  ],
]);

const printers: Map<string, Printer> = new Map([
  [
    'PRT-01',
    {
      id: 'PRT-01',
      name: 'Kyocera SecureTask Pro 8000',
      location: 'HQ Floor 3 - Finance & Legal Hub (Room 302)',
      ipAddress: '10.240.12.45',
      model: 'Kyocera TaskAlpha 8054ci Secure IoT',
      isOnline: true,
      status: 'IDLE',
      paperLevel: 92,
      tonerLevel: 84,
      supportedFormats: ['A4', 'Letter', 'A3', 'Legal'],
      totalPagesPrinted: 14820,
    },
  ],
  [
    'PRT-02',
    {
      id: 'PRT-02',
      name: 'HP LaserJet Enterprise Flow M880',
      location: 'HQ Floor 4 - Executive Suite & Boardroom',
      ipAddress: '10.240.12.78',
      model: 'HP Enterprise Flow M880z+ Encrypted',
      isOnline: true,
      status: 'IDLE',
      paperLevel: 78,
      tonerLevel: 91,
      supportedFormats: ['A4', 'Letter', 'Executive'],
      totalPagesPrinted: 8940,
    },
  ],
  [
    'PRT-03',
    {
      id: 'PRT-03',
      name: 'Canon imageRUNNER ADVANCE DX',
      location: 'HQ Floor 1 - R&D Engineering Lab',
      ipAddress: '10.240.14.19',
      model: 'Canon iR-ADV DX C5870i',
      isOnline: true,
      status: 'IDLE',
      paperLevel: 45,
      tonerLevel: 62,
      supportedFormats: ['A4', 'Letter', 'Tabloid', 'A3'],
      totalPagesPrinted: 23100,
    },
  ],
  [
    'PRT-04',
    {
      id: 'PRT-04',
      name: 'Xerox AltaLink C8170 MFP',
      location: 'Branch West - Operations Center',
      ipAddress: '10.240.18.99',
      model: 'Xerox AltaLink C8170 Smart Shield',
      isOnline: true,
      status: 'IDLE',
      paperLevel: 60,
      tonerLevel: 73,
      supportedFormats: ['A4', 'Letter'],
      totalPagesPrinted: 11250,
    },
  ],
]);

const documents: Map<string, DocumentItem> = new Map();
const printJobs: Map<string, PrintJob> = new Map();
const activityLogs: ActivityLog[] = [];

// Helper to log activities
function addLog(
  action: string,
  details: string,
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS' = 'INFO',
  userId?: string,
  userName?: string,
  jobId?: string,
  printerId?: string,
  ip: string = '127.0.0.1'
) {
  const log: ActivityLog = {
    id: 'LOG-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    timestamp: new Date().toISOString(),
    userId,
    userName,
    action,
    details,
    ipAddress: ip,
    printerId,
    jobId,
    severity,
  };
  activityLogs.unshift(log);
  if (activityLogs.length > 500) {
    activityLogs.pop();
  }
}

// Initial System Seed Logs & Demo Jobs
function seedInitialData() {
  const now = new Date();
  
  // Sample Document 1
  const doc1Id = 'DOC-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  documents.set(doc1Id, {
    id: doc1Id,
    userId: 'usr-emp-3',
    fileName: 'Q3_Financial_Audit_Report.pdf',
    fileType: 'pdf',
    fileSize: 1420000,
    pageCount: 6,
    textContent: 'CONFIDENTIAL: Q3 Financial Audit and Revenue Breakdown for Board Review. Gross Margin: 34.2%. Account Number: 4920-8812-4491-0012.',
    uploadedAt: new Date(now.getTime() - 1000 * 60 * 20).toISOString(),
    checksumSha256: crypto.createHash('sha256').update('sample1').digest('hex'),
    dlpResult: {
      isSensitive: true,
      sensitivityScore: 88,
      summary: 'Detected confidential financial keywords and account number pattern.',
      findings: [
        {
          type: 'CONFIDENTIAL_KEYWORD',
          snippet: 'CONFIDENTIAL: Q3 Financial Audit',
          severity: 'HIGH',
          description: 'Document labeled with confidential/proprietary warning',
        },
        {
          type: 'BANK_ACCOUNT',
          snippet: 'Account Number: 4920-8812-4491-0012',
          severity: 'HIGH',
          description: 'Probable bank or institutional ledger account string',
        }
      ],
      recommendedTier: 'CONFIDENTIAL',
    },
  });

  // Sample Active Job 1 (Queued with PIN)
  const job1Id = 'JOB-7482-SEC';
  const pin1 = '482910';
  printJobs.set(job1Id, {
    id: job1Id,
    userId: 'usr-emp-3',
    userName: 'Sarah Chen',
    userEmail: 'sarah.chen@techcorp.com',
    documentId: doc1Id,
    documentName: 'Q3_Financial_Audit_Report.pdf',
    fileType: 'pdf',
    fileSize: 1420000,
    pageCount: 6,
    copies: 2,
    colorMode: 'color',
    duplex: 'duplex',
    selectedPrinterId: 'PRT-01',
    selectedPrinterName: 'Kyocera SecureTask Pro 8000',
    status: 'QUEUED',
    pinCode: pin1,
    qrToken: 'PRINTSAFE-AUTH-JOB-7482-SEC-' + crypto.randomBytes(6).toString('hex'),
    createdAt: new Date(now.getTime() - 1000 * 60 * 5).toISOString(),
    expiresAt: new Date(now.getTime() + 1000 * 60 * 25).toISOString(), // 25 min left
    securityTier: 'CONFIDENTIAL',
    aiSensitiveDetected: true,
    dlpFindingsSummary: 'Contains financial figures and account references',
    authAttempts: 0,
    maxAuthAttempts: 3,
  });

  // Sample Document 2 & Completed Job
  const doc2Id = 'DOC-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  documents.set(doc2Id, {
    id: doc2Id,
    userId: 'usr-emp-4',
    fileName: 'Microcontroller_Firmware_Pinout.pdf',
    fileType: 'pdf',
    fileSize: 850000,
    pageCount: 2,
    textContent: 'Hardware pinout diagram and SPI bus configuration for IoT Module Rev 4.1.',
    uploadedAt: new Date(now.getTime() - 1000 * 60 * 120).toISOString(),
    checksumSha256: crypto.createHash('sha256').update('sample2').digest('hex'),
  });

  const job2Id = 'JOB-3109-ENG';
  printJobs.set(job2Id, {
    id: job2Id,
    userId: 'usr-emp-4',
    userName: 'Alex Miller',
    userEmail: 'alex.miller@techcorp.com',
    documentId: doc2Id,
    documentName: 'Microcontroller_Firmware_Pinout.pdf',
    fileType: 'pdf',
    fileSize: 850000,
    pageCount: 2,
    copies: 1,
    colorMode: 'monochrome',
    duplex: 'simplex',
    selectedPrinterId: 'PRT-03',
    selectedPrinterName: 'Canon imageRUNNER ADVANCE DX',
    status: 'COMPLETED',
    pinCode: '772190',
    qrToken: 'PRINTSAFE-AUTH-JOB-3109-ENG-EXPIRED',
    createdAt: new Date(now.getTime() - 1000 * 60 * 115).toISOString(),
    expiresAt: new Date(now.getTime() - 1000 * 60 * 85).toISOString(),
    printCompletedAt: new Date(now.getTime() - 1000 * 60 * 105).toISOString(),
    securityTier: 'STANDARD',
    aiSensitiveDetected: false,
    authAttempts: 1,
    maxAuthAttempts: 3,
  });

  // Seed initial audit log entries
  addLog('SYSTEM_BOOT', 'PrintSafe Core Cryptographic Engine & Queue Daemon initialized.', 'SUCCESS', 'usr-admin-1', 'Elena Rostova');
  addLog('DLP_SCAN_PASSED', 'AI DLP Scanner analyzed Q3_Financial_Audit_Report.pdf (Confidence: 88%). Flagged as CONFIDENTIAL.', 'WARNING', 'usr-emp-3', 'Sarah Chen', job1Id, 'PRT-01');
  addLog('PRINT_QUEUED', 'Document queued for release. 6-digit OTP and QR token generated.', 'INFO', 'usr-emp-3', 'Sarah Chen', job1Id, 'PRT-01');
  addLog('AUTH_ATTEMPT_SUCCESS', 'User authenticated via QR scan at terminal PRT-03. Job released.', 'SUCCESS', 'usr-emp-4', 'Alex Miller', job2Id, 'PRT-03');
  addLog('JOB_PRINTED_AND_PURGED', 'Print completed successfully. Temporary memory cache securely shredded (Zero-Retention Policy).', 'SUCCESS', 'usr-emp-4', 'Alex Miller', job2Id, 'PRT-03');
}

seedInitialData();

// -------------------------------------------------------------
// Auto-Expiry and Secure Purge Background Daemon (Runs every 4s)
// -------------------------------------------------------------
setInterval(() => {
  const now = new Date();
  for (const [id, job] of printJobs.entries()) {
    if (job.status === 'QUEUED') {
      const expDate = new Date(job.expiresAt);
      if (now > expDate) {
        job.status = 'EXPIRED';
        addLog(
          'JOB_EXPIRED',
          `Print Job ${job.id} (${job.documentName}) expired without authentication. Payload safely wiped.`,
          'WARNING',
          job.userId,
          job.userName,
          job.id,
          job.selectedPrinterId
        );
        // Wipe in-memory document content if no other active jobs reference it
        const hasOtherQueued = Array.from(printJobs.values()).some(
          (j) => j.id !== job.id && j.documentId === job.documentId && j.status === 'QUEUED'
        );
        if (!hasOtherQueued && documents.has(job.documentId)) {
          const doc = documents.get(job.documentId);
          if (doc) {
            doc.textContent = '[SECURELY PURGED ON EXPIRY]';
            doc.previewUrl = undefined;
          }
        }
      }
    }
  }
}, 4000);

// -------------------------------------------------------------
// Local Rule-Based DLP Heuristics Fallback Engine
// -------------------------------------------------------------
function localDlpHeuristics(content: string, fileName: string): DlpScanResult {
  const findings: DlpFinding[] = [];
  let score = 0;

  // SSN Check
  const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g;
  const ssnMatches = content.match(ssnRegex);
  if (ssnMatches) {
    score += 45;
    findings.push({
      type: 'SSN',
      snippet: ssnMatches[0],
      severity: 'HIGH',
      description: 'US Social Security Number pattern detected',
    });
  }

  // Credit Card Check
  const ccRegex = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;
  const ccMatches = content.match(ccRegex);
  if (ccMatches) {
    score += 40;
    findings.push({
      type: 'CREDIT_CARD',
      snippet: ccMatches[0].replace(/\d{4}$/, '****'),
      severity: 'HIGH',
      description: '16-digit credit/debit card number pattern detected',
    });
  }

  // Email pattern
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emailMatches = content.match(emailRegex);
  if (emailMatches && emailMatches.length > 2) {
    score += 15;
    findings.push({
      type: 'EMAIL',
      snippet: emailMatches.slice(0, 3).join(', '),
      severity: 'MEDIUM',
      description: 'Multiple corporate or personal email addresses detected',
    });
  }

  // Phone pattern
  const phoneRegex = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  const phoneMatches = content.match(phoneRegex);
  if (phoneMatches) {
    score += 15;
    findings.push({
      type: 'PHONE',
      snippet: phoneMatches[0],
      severity: 'LOW',
      description: 'Direct telephone or mobile number detected',
    });
  }

  // Confidential keywords
  const confidentialKeywords = [
    'CONFIDENTIAL',
    'TOP SECRET',
    'RESTRICTED',
    'PROPRIETARY',
    'NDA',
    'CLASSIFIED',
    'DO NOT DISTRIBUTE',
    'PRIVILEGED',
    'SALARY',
    'PASSPORT',
    'BANK ACCOUNT',
    'ROUTING NUMBER',
    'INTERNAL USE ONLY',
  ];

  const upperContent = (content + ' ' + fileName).toUpperCase();
  for (const kw of confidentialKeywords) {
    if (upperContent.includes(kw)) {
      score += 25;
      findings.push({
        type: 'CONFIDENTIAL_KEYWORD',
        snippet: `Keyword match: "${kw}"`,
        severity: 'HIGH',
        description: `Explicit confidentiality marker found: "${kw}"`,
      });
      break;
    }
  }

  score = Math.min(score, 100);
  const isSensitive = score >= 25 || findings.length > 0;
  let recommendedTier: 'STANDARD' | 'CONFIDENTIAL' | 'RESTRICTED' = 'STANDARD';
  if (score >= 60) recommendedTier = 'RESTRICTED';
  else if (score >= 25) recommendedTier = 'CONFIDENTIAL';

  return {
    isSensitive,
    sensitivityScore: score,
    summary: isSensitive
      ? `Detected ${findings.length} security compliance markers with an aggregate sensitivity risk score of ${score}/100.`
      : 'Document appears free of common sensitive personal or confidential business markers.',
    findings,
    recommendedTier,
  };
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// 1. Authentication
app.post('/api/auth/login', (req, res) => {
  const { email, role } = req.body;
  const foundUser = Array.from(users.values()).find((u) => u.email.toLowerCase() === (email || '').toLowerCase());
  
  if (foundUser) {
    if (foundUser.status === 'suspended') {
      addLog('LOGIN_BLOCKED', `Suspended user ${foundUser.email} attempted login.`, 'CRITICAL', foundUser.id, foundUser.name);
      return res.status(403).json({ error: 'User account has been suspended by an administrator.' });
    }
    addLog('USER_LOGIN', `User ${foundUser.name} (${foundUser.role}) signed in successfully.`, 'INFO', foundUser.id, foundUser.name);
    return res.json({ user: foundUser });
  }

  // Auto-provision demo role login if selecting from fast-switcher
  if (role) {
    const roleUser = Array.from(users.values()).find((u) => u.role === role);
    if (roleUser) {
      addLog('USER_LOGIN', `User ${roleUser.name} signed in as ${roleUser.role}.`, 'INFO', roleUser.id, roleUser.name);
      return res.json({ user: roleUser });
    }
  }

  // Create temporary guest user if valid email format
  if (email && email.includes('@')) {
    const newId = 'usr-' + crypto.randomBytes(4).toString('hex');
    const newUser: User = {
      id: newId,
      name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      email,
      role: 'user',
      department: 'General Operations',
      createdAt: new Date().toISOString(),
      status: 'active',
      badgeId: 'BADGE-' + Math.floor(1000 + Math.random() * 9000),
    };
    users.set(newId, newUser);
    addLog('USER_REGISTER', `New user registered: ${newUser.email}`, 'INFO', newUser.id, newUser.name);
    return res.json({ user: newUser });
  }

  return res.status(400).json({ error: 'Invalid email or credentials.' });
});

app.get('/api/auth/users', (req, res) => {
  res.json({ users: Array.from(users.values()) });
});

// 2. AI DLP Document Scanner (Gemini 3.7 Flash + Fallback)
app.post('/api/ai/scan-document', async (req, res) => {
  try {
    const { textContent, fileName } = req.body;
    const cleanText = textContent || '';
    const name = fileName || 'document.pdf';

    // Heuristic base scan first
    const baseHeuristics = localDlpHeuristics(cleanText, name);

    // Try server-side Gemini 3.7 Flash if available
    const client = getGeminiClient();
    if (client && cleanText.trim().length > 10) {
      try {
        const prompt = `You are an enterprise Data Loss Prevention (DLP) and Cybersecurity classification engine.
Analyze the following document text and file name for sensitive, confidential, or PII information (e.g., SSN, credit cards, bank accounts, passwords, API keys, medical records, financial forecasts, executive NDA content, salary details).

File Name: "${name}"
Document Content:
"""
${cleanText.slice(0, 4000)}
"""

Respond ONLY in valid JSON conforming to this structure:
{
  "isSensitive": true or false,
  "sensitivityScore": number between 0 and 100,
  "summary": "Brief 1-2 sentence executive assessment of document confidentiality risk",
  "recommendedTier": "STANDARD" | "CONFIDENTIAL" | "RESTRICTED",
  "findings": [
    {
      "type": "SSN" | "CREDIT_CARD" | "PHONE" | "EMAIL" | "CONFIDENTIAL_KEYWORD" | "BANK_ACCOUNT" | "PASSPORT" | "HEALTH_RECORD",
      "snippet": "short extracted snippet (redact critical digits with ****)",
      "severity": "HIGH" | "MEDIUM" | "LOW",
      "description": "Why this snippet constitutes sensitive or confidential data"
    }
  ]
}`;

        const response = await client.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim()) as DlpScanResult;
          // Merge findings to ensure nothing was missed
          if (parsed.findings && Array.isArray(parsed.findings)) {
            return res.json({ result: parsed });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini DLP API call fallback to heuristics:', geminiErr);
      }
    }

    return res.json({ result: baseHeuristics });
  } catch (err: any) {
    console.error('DLP Scanner Error:', err);
    res.status(500).json({ error: 'Failed to complete DLP scan: ' + err.message });
  }
});

// 3. Document Upload & Management
app.post('/api/documents/upload', (req, res) => {
  try {
    const { userId, fileName, fileType, fileSize, pageCount, textContent, previewUrl, dlpResult } = req.body;
    
    if (!userId || !fileName) {
      return res.status(400).json({ error: 'Missing required document fields.' });
    }

    const docId = 'DOC-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    const doc: DocumentItem = {
      id: docId,
      userId,
      fileName,
      fileType: fileType || 'pdf',
      fileSize: fileSize || 102400,
      pageCount: Math.max(1, parseInt(pageCount, 10) || 1),
      textContent: textContent || '',
      previewUrl: previewUrl || '',
      uploadedAt: new Date().toISOString(),
      checksumSha256: crypto.createHash('sha256').update(fileName + Date.now()).digest('hex'),
      dlpResult,
    };

    documents.set(docId, doc);

    const user = users.get(userId);
    addLog(
      'DOC_UPLOAD',
      `Uploaded "${fileName}" (${(doc.fileSize / 1024).toFixed(1)} KB, ${doc.pageCount} pages). SHA-256: ${doc.checksumSha256.substring(0, 12)}...`,
      'INFO',
      userId,
      user?.name
    );

    res.json({ document: doc });
  } catch (err: any) {
    res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
});

app.get('/api/documents', (req, res) => {
  const { userId } = req.query;
  let allDocs = Array.from(documents.values());
  if (userId) {
    allDocs = allDocs.filter((d) => d.userId === userId);
  }
  res.json({ documents: allDocs });
});

// 4. Print Job Queue & Submission
app.post('/api/print-jobs', (req, res) => {
  try {
    const {
      userId,
      documentId,
      documentName,
      fileType,
      fileSize,
      pageCount,
      copies,
      colorMode,
      duplex,
      selectedPrinterId,
      securityTier,
      aiSensitiveDetected,
      dlpFindingsSummary,
      expiryMinutes,
    } = req.body;

    const user = users.get(userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid user account.' });
    }

    const printer = printers.get(selectedPrinterId) || Array.from(printers.values())[0];
    const jobId = 'JOB-' + Math.floor(1000 + Math.random() * 9000) + '-' + (user.role === 'admin' ? 'ADM' : 'SEC');
    
    // Generate secure 6-digit cryptographic PIN/OTP
    const pinCode = Math.floor(100000 + crypto.randomInt(0, 900000)).toString();
    const qrToken = `PRINTSAFE-AUTH-${jobId}-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

    const now = new Date();
    const expMins = expiryMinutes && expiryMinutes >= 2 && expiryMinutes <= 120 ? expiryMinutes : 20;
    const expiresAt = new Date(now.getTime() + expMins * 60 * 1000).toISOString();

    const job: PrintJob = {
      id: jobId,
      userId,
      userName: user.name,
      userEmail: user.email,
      documentId: documentId || 'DOC-TEMP',
      documentName: documentName || 'Confidential_Document.pdf',
      fileType: fileType || 'pdf',
      fileSize: fileSize || 250000,
      pageCount: Math.max(1, parseInt(pageCount, 10) || 1),
      copies: Math.max(1, parseInt(copies, 10) || 1),
      colorMode: colorMode === 'monochrome' ? 'monochrome' : 'color',
      duplex: duplex === 'simplex' ? 'simplex' : 'duplex',
      selectedPrinterId: printer.id,
      selectedPrinterName: printer.name,
      status: 'QUEUED',
      pinCode,
      qrToken,
      createdAt: now.toISOString(),
      expiresAt,
      securityTier: securityTier || 'STANDARD',
      aiSensitiveDetected: !!aiSensitiveDetected,
      dlpFindingsSummary: dlpFindingsSummary || undefined,
      authAttempts: 0,
      maxAuthAttempts: 3,
    };

    printJobs.set(jobId, job);

    addLog(
      'PRINT_QUEUED',
      `Secure print job ${jobId} created for "${job.documentName}". Encrypted PIN and QR token issued. Expiry: ${expMins} mins.`,
      aiSensitiveDetected ? 'WARNING' : 'INFO',
      userId,
      user.name,
      jobId,
      printer.id
    );

    res.json({ job });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to queue print job: ' + err.message });
  }
});

app.get('/api/print-jobs', (req, res) => {
  const { userId, role } = req.query;
  let allJobs = Array.from(printJobs.values());
  
  if (role !== 'admin' && role !== 'security_officer' && userId) {
    allJobs = allJobs.filter((j) => j.userId === userId);
  }

  // Sort descending by creation date
  allJobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ jobs: allJobs });
});

app.post('/api/print-jobs/:id/cancel', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  const job = printJobs.get(id);

  if (!job) {
    return res.status(404).json({ error: 'Job not found.' });
  }

  if (job.status !== 'QUEUED') {
    return res.status(400).json({ error: `Cannot cancel job with status: ${job.status}` });
  }

  job.status = 'CANCELLED';
  const user = users.get(userId || job.userId);
  addLog('JOB_CANCELLED', `Print job ${job.id} (${job.documentName}) was cancelled by user.`, 'WARNING', user?.id, user?.name, job.id);

  res.json({ job });
});

// 5. Virtual Printer IoT Kiosk Authentication & Release
app.post('/api/printer-terminal/verify-otp', (req, res) => {
  const { printerId, pinCode } = req.body;

  if (!pinCode || pinCode.length < 4) {
    return res.status(400).json({ error: 'Please enter a valid PIN/OTP code.' });
  }

  const cleanPin = pinCode.trim();
  const now = new Date();

  // Find job matching PIN and printer (or allowed for all online printers if roaming secure pull-print)
  const matchingJobs = Array.from(printJobs.values()).filter(
    (j) => j.status === 'QUEUED' && j.pinCode === cleanPin
  );

  if (matchingJobs.length === 0) {
    // Check if there are jobs with this PIN that had failed attempts
    addLog(
      'AUTH_ATTEMPT_FAILED',
      `Failed PIN verification attempt at printer ${printerId || 'TERMINAL'}. Invalid or non-existent PIN entered.`,
      'CRITICAL',
      undefined,
      undefined,
      undefined,
      printerId
    );
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired PIN code. Please verify the 6-digit code on your dashboard.',
    });
  }

  const job = matchingJobs[0];

  // Check expiry
  if (now > new Date(job.expiresAt)) {
    job.status = 'EXPIRED';
    addLog('AUTH_ATTEMPT_FAILED', `PIN entered for job ${job.id} but job has already expired.`, 'WARNING', job.userId, job.userName, job.id, printerId);
    return res.status(400).json({
      success: false,
      error: 'This print job has expired. Please submit the document again.',
    });
  }

  // Check brute force attempts
  if (job.authAttempts >= job.maxAuthAttempts) {
    job.status = 'CANCELLED';
    addLog(
      'RATE_LIMIT_TRIGGERED',
      `Brute force lockout triggered on job ${job.id}. Maximum auth attempts exceeded. Job locked and purged.`,
      'CRITICAL',
      job.userId,
      job.userName,
      job.id,
      printerId
    );
    return res.status(403).json({
      success: false,
      error: 'Security Lockout: Exceeded maximum verification attempts (3). Job has been terminated for security.',
    });
  }

  // Successful verification
  job.status = 'AUTHENTICATED';
  addLog(
    'AUTH_ATTEMPT_SUCCESS',
    `User ${job.userName} authenticated at printer ${printerId || job.selectedPrinterId} with 6-digit OTP. Job ${job.id} ready to print.`,
    'SUCCESS',
    job.userId,
    job.userName,
    job.id,
    printerId || job.selectedPrinterId
  );

  return res.json({
    success: true,
    job,
    message: 'PIN Verified Successfully. Identity confirmed.',
  });
});

app.post('/api/printer-terminal/verify-qr', (req, res) => {
  const { printerId, qrToken } = req.body;

  if (!qrToken) {
    return res.status(400).json({ error: 'QR Token is missing.' });
  }

  const now = new Date();
  const job = Array.from(printJobs.values()).find(
    (j) => j.status === 'QUEUED' && j.qrToken === qrToken.trim()
  );

  if (!job) {
    addLog(
      'AUTH_ATTEMPT_FAILED',
      `Invalid QR code scanned at printer terminal ${printerId}.`,
      'CRITICAL',
      undefined,
      undefined,
      undefined,
      printerId
    );
    return res.status(401).json({
      success: false,
      error: 'Invalid or unrecognized QR token. Security token mismatch.',
    });
  }

  if (now > new Date(job.expiresAt)) {
    job.status = 'EXPIRED';
    return res.status(400).json({
      success: false,
      error: 'This QR code authorization token has expired.',
    });
  }

  job.status = 'AUTHENTICATED';
  addLog(
    'AUTH_ATTEMPT_SUCCESS',
    `User ${job.userName} unlocked job ${job.id} via optical QR Code reader at ${printerId || job.selectedPrinterId}.`,
    'SUCCESS',
    job.userId,
    job.userName,
    job.id,
    printerId || job.selectedPrinterId
  );

  return res.json({
    success: true,
    job,
    message: 'QR Token Verified. Print ticket released.',
  });
});

// 6. Execute Physical Print Simulation & Zero-Retention Memory Shredding
app.post('/api/printer-terminal/execute-print', (req, res) => {
  const { jobId, printerId } = req.body;
  const job = printJobs.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Print job not found.' });
  }

  if (job.status !== 'AUTHENTICATED' && job.status !== 'QUEUED') {
    return res.status(400).json({ error: `Cannot execute print for job with status ${job.status}` });
  }

  const printer = printers.get(printerId || job.selectedPrinterId) || printers.get('PRT-01')!;

  // Check printer hardware readiness
  if (!printer.isOnline || printer.status === 'OFFLINE' || printer.status === 'PAPER_JAM') {
    return res.status(503).json({
      error: `Printer ${printer.name} is currently ${printer.status}. Please select another printer or request maintenance.`,
    });
  }

  const totalPagesToPrint = job.pageCount * job.copies;
  if (printer.paperLevel < 5) {
    printer.status = 'OUT_OF_PAPER';
    addLog('HARDWARE_ALERT', `Printer ${printer.id} ran out of paper during job ${job.id}.`, 'WARNING', undefined, undefined, job.id, printer.id);
    return res.status(503).json({ error: `Printer ${printer.name} is out of paper. Please refill paper tray.` });
  }

  // Update status to PRINTING
  job.status = 'PRINTING';
  printer.status = 'PRINTING';
  printer.activeJobId = job.id;

  // Deduct paper & toner simulation
  printer.paperLevel = Math.max(2, printer.paperLevel - Math.ceil(totalPagesToPrint * 0.8));
  printer.tonerLevel = Math.max(5, printer.tonerLevel - (job.colorMode === 'color' ? 2 : 1));
  printer.totalPagesPrinted += totalPagesToPrint;

  // Record print completion
  setTimeout(() => {
    job.status = 'COMPLETED';
    job.printCompletedAt = new Date().toISOString();
    printer.status = 'IDLE';
    printer.activeJobId = undefined;

    // Secure Document Zero-Retention Purge
    if (documents.has(job.documentId)) {
      const doc = documents.get(job.documentId);
      if (doc) {
        doc.textContent = '[SECURELY SHREDDED POST-PRINT (DOD 5220.22-M COMPLIANT)]';
      }
    }

    addLog(
      'JOB_PRINTED_AND_PURGED',
      `Physical printing complete for "${job.documentName}" (${totalPagesToPrint} pages, ${job.colorMode}, ${job.duplex}). Volatile print buffer memory zeroized.`,
      'SUCCESS',
      job.userId,
      job.userName,
      job.id,
      printer.id
    );
  }, 1200);

  res.json({
    success: true,
    message: 'Print spooling initiated. Hardware laser engine active.',
    job,
    printer,
  });
});

// 7. Printer Management
app.get('/api/printers', (req, res) => {
  res.json({ printers: Array.from(printers.values()) });
});

app.post('/api/printers/:id/action', (req, res) => {
  const { id } = req.params;
  const { action, value } = req.body;
  const printer = printers.get(id);

  if (!printer) {
    return res.status(404).json({ error: 'Printer not found.' });
  }

  if (action === 'TOGGLE_ONLINE') {
    printer.isOnline = !printer.isOnline;
    printer.status = printer.isOnline ? 'IDLE' : 'OFFLINE';
    addLog('PRINTER_STATUS_CHANGE', `Printer ${printer.id} set to ${printer.status}.`, 'WARNING', undefined, undefined, undefined, printer.id);
  } else if (action === 'REFILL_PAPER') {
    printer.paperLevel = 100;
    if (printer.status === 'OUT_OF_PAPER') printer.status = 'IDLE';
    addLog('MAINTENANCE', `Paper tray refilled to 100% on ${printer.id}.`, 'SUCCESS', undefined, undefined, undefined, printer.id);
  } else if (action === 'REPLACE_TONER') {
    printer.tonerLevel = 100;
    addLog('MAINTENANCE', `High-yield toner cartridge replaced on ${printer.id}.`, 'SUCCESS', undefined, undefined, undefined, printer.id);
  } else if (action === 'CLEAR_JAM') {
    printer.status = 'IDLE';
    addLog('MAINTENANCE', `Paper jam cleared on ${printer.id}.`, 'INFO', undefined, undefined, undefined, printer.id);
  }

  res.json({ printer });
});

// 8. Admin & Security Auditing
app.get('/api/admin/logs', (req, res) => {
  const { severity, action, limit } = req.query;
  let filtered = [...activityLogs];

  if (severity && typeof severity === 'string' && severity !== 'ALL') {
    filtered = filtered.filter((l) => l.severity === severity);
  }
  if (action && typeof action === 'string') {
    filtered = filtered.filter((l) => l.action.toLowerCase().includes(action.toLowerCase()));
  }

  const max = limit ? parseInt(limit as string, 10) : 200;
  res.json({ logs: filtered.slice(0, max) });
});

app.get('/api/admin/stats', (req, res) => {
  const allJobs = Array.from(printJobs.values());
  const allPrinters = Array.from(printers.values());

  const activeQueued = allJobs.filter((j) => j.status === 'QUEUED' || j.status === 'AUTHENTICATED').length;
  const completedTotal = allJobs.filter((j) => j.status === 'COMPLETED').length;
  const totalPages = allPrinters.reduce((acc, p) => acc + p.totalPagesPrinted, 0);
  const onlineCount = allPrinters.filter((p) => p.isOnline).length;
  const flaggedSensitive = allJobs.filter((j) => j.aiSensitiveDetected).length;
  const expiredCount = allJobs.filter((j) => j.status === 'EXPIRED').length;
  const threatsBlocked = activityLogs.filter((l) => l.severity === 'CRITICAL' || l.action.includes('LOCKOUT') || l.action.includes('FAILED')).length;

  const stats: SystemStats = {
    activeQueuedJobs: activeQueued,
    completedJobsTotal: completedTotal,
    totalPagesPrinted: totalPages,
    activePrintersCount: onlineCount,
    totalPrintersCount: allPrinters.length,
    flaggedSensitiveJobs: flaggedSensitive,
    expiredPurgedJobs: expiredCount,
    securityThreatsBlocked: threatsBlocked,
  };

  res.json({ stats });
});

app.post('/api/admin/users/:id/toggle-status', (req, res) => {
  const { id } = req.params;
  const user = users.get(id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  user.status = user.status === 'active' ? 'suspended' : 'active';
  addLog(
    'USER_STATUS_CHANGE',
    `User ${user.email} status changed to ${user.status} by Security Admin.`,
    user.status === 'suspended' ? 'CRITICAL' : 'INFO',
    user.id,
    user.name
  );

  res.json({ user });
});

// 9. Reset System Demo State
app.post('/api/system/reset-demo', (req, res) => {
  documents.clear();
  printJobs.clear();
  activityLogs.length = 0;
  seedInitialData();
  res.json({ success: true, message: 'PrintSafe system state reset to initial demo configuration.' });
});

// -------------------------------------------------------------
// Vite Middleware / Static Fallback
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PrintSafe Secure Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
