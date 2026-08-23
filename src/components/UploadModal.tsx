import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  Sliders, 
  Printer as PrinterIcon, 
  Clock, 
  Check, 
  X, 
  AlertCircle, 
  ShieldCheck,
  Zap,
  Layers,
  FileCheck
} from 'lucide-react';
import { Printer, User, DlpScanResult } from '../types/index.js';
import { api } from '../services/api.js';

interface UploadModalProps {
  currentUser: User | null;
  printers: Printer[];
  onClose: () => void;
  onJobCreated: (job: any) => void;
  onTriggerDlpWarning: (dlpResult: DlpScanResult, fileName: string, uploadPayload: any) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  currentUser,
  printers,
  onClose,
  onJobCreated,
  onTriggerDlpWarning,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<'pdf' | 'docx' | 'image' | 'txt'>('pdf');
  const [fileSize, setFileSize] = useState(250000);
  const [pageCount, setPageCount] = useState(3);
  const [textContent, setTextContent] = useState('');
  
  // Print options
  const [copies, setCopies] = useState(1);
  const [colorMode, setColorMode] = useState<'color' | 'monochrome'>('color');
  const [duplex, setDuplex] = useState<'simplex' | 'duplex'>('duplex');
  const [selectedPrinterId, setSelectedPrinterId] = useState(printers[0]?.id || 'PRT-01');
  const [expiryMinutes, setExpiryMinutes] = useState(20);

  // States
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Demo Document Presets
  const samplePresets = [
    {
      title: 'Confidential Financial Audit & Bank Data',
      tag: 'High Risk PII',
      type: 'pdf' as const,
      pages: 5,
      size: 1450000,
      fileName: 'Q3_Executive_Audit_and_Banking_Ledger.pdf',
      text: 'TOP SECRET & STRICTLY CONFIDENTIAL: Corporate Revenue Audit for Board Review. Account Routing: 021000021, Wire Account: 8812-4912-3301. Employee SSN: 042-89-3312. Salary Bonus Pool: $4.2M. Unauthorized duplication prohibited.',
    },
    {
      title: 'Hardware Schematic & Firmware Spec',
      tag: 'Engineering',
      type: 'pdf' as const,
      pages: 3,
      size: 890000,
      fileName: 'IoT_Microcontroller_Pinout_v4.pdf',
      text: 'Engineering Technical Specification for PrintSafe Secure Module v4.1. SPI Bus Clock at 50MHz, UART baud rate 115200. Security chip ATSHA204A crypto-element configuration.',
    },
    {
      title: 'Patient Medical Records & Intake',
      tag: 'HIPAA Sensitive',
      type: 'pdf' as const,
      pages: 4,
      size: 1100000,
      fileName: 'Medical_Intake_Patient_Records.pdf',
      text: 'CONFIDENTIAL MEDICAL RECORD: Patient ID: MED-9912. Diagnosis: Cardiothoracic consultation. Prescribed medications, insurance claim ID: 9481-9921-12. Date of birth: 1984-11-20. Contact: dr.smith@stmarys-health.org.',
    },
    {
      title: 'Standard Weekly Team Meeting Minutes',
      tag: 'General / Clean',
      type: 'pdf' as const,
      pages: 2,
      size: 320000,
      fileName: 'Weekly_Operations_Sync_Agenda.pdf',
      text: 'General weekly sprint standup agenda. Reviewing frontend milestones, printer fleet maintenance schedule, and conference room reservations for Q4 planning.',
    },
  ];

  const handleApplyPreset = (preset: typeof samplePresets[0]) => {
    setFileName(preset.fileName);
    setFileType(preset.type);
    setFileSize(preset.size);
    setPageCount(preset.pages);
    setTextContent(preset.text);
    setFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      processSelectedFile(selected);
    }
  };

  const processSelectedFile = (selected: File) => {
    setFile(selected);
    setFileName(selected.name);
    setFileSize(selected.size);
    
    // Estimate type & pages
    const ext = selected.name.split('.').pop()?.toLowerCase() || '';
    if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
      setFileType('image');
      setPageCount(1);
    } else if (ext === 'docx') {
      setFileType('docx');
      setPageCount(Math.max(1, Math.ceil(selected.size / 60000)));
    } else if (ext === 'txt') {
      setFileType('txt');
      setPageCount(Math.max(1, Math.ceil(selected.size / 3000)));
    } else {
      setFileType('pdf');
      setPageCount(Math.max(1, Math.ceil(selected.size / 200000)));
    }

    // Read content if text or read preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = event.target?.result;
      if (typeof res === 'string') {
        setTextContent(res.slice(0, 10000));
      }
    };
    if (selected.type.includes('text') || selected.name.endsWith('.txt')) {
      reader.readAsText(selected);
    } else {
      // Set representative name text
      setTextContent(`Document payload: ${selected.name} (${(selected.size / 1024).toFixed(1)} KB)`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!fileName) {
      setErrorMsg('Please select a file or load a sample preset.');
      return;
    }

    setErrorMsg('');
    setIsScanning(true);

    try {
      // 1. Run AI DLP Scan first
      const scanRes = await api.scanDocument(textContent, fileName);
      const dlpResult = scanRes.result;

      const payload = {
        userId: currentUser.id,
        documentName: fileName,
        fileType,
        fileSize,
        pageCount,
        copies,
        colorMode,
        duplex,
        selectedPrinterId,
        expiryMinutes,
        textContent,
      };

      // 2. If sensitive findings detected -> prompt user confirmation modal
      if (dlpResult.isSensitive) {
        setIsScanning(false);
        onTriggerDlpWarning(dlpResult, fileName, payload);
        return;
      }

      // 3. If clean -> Upload document and queue print job directly
      setIsSubmitting(true);
      const docRes = await api.uploadDocument({
        userId: currentUser.id,
        fileName,
        fileType,
        fileSize,
        pageCount,
        textContent,
        dlpResult,
      });

      const jobRes = await api.createPrintJob({
        userId: currentUser.id,
        documentId: docRes.document.id,
        documentName: fileName,
        fileType,
        fileSize,
        pageCount,
        copies,
        colorMode,
        duplex,
        selectedPrinterId,
        securityTier: 'STANDARD',
        aiSensitiveDetected: false,
        expiryMinutes,
      });

      onJobCreated(jobRes.job);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to submit print job.');
    } finally {
      setIsScanning(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 rounded-2xl bg-[#161B22] border border-[#30363D] shadow-2xl overflow-hidden text-[#C9D1D9] animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-[#0B0E14] p-4 border-b border-[#30363D] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[rgba(88,166,255,0.15)] border border-[#58A6FF]/30 flex items-center justify-center text-[#58A6FF]">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Upload & Secure Print Queue</h3>
              <p className="text-xs text-[#8B949E]">Zero-Trust document verification with AI DLP inspection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1C2128] hover:bg-[#30363D] text-[#8B949E] hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-[#30363D]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-[rgba(248,81,73,0.15)] border border-[#F85149]/40 text-[#F85149] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Preset Document Loader */}
          <div>
            <label className="text-xs font-semibold text-[#8B949E] mb-2 flex items-center gap-1.5 uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-[#D29922]" />
              Quick Sample Presets (For Instant Testing)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {samplePresets.map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex flex-col justify-between ${
                    fileName === preset.fileName
                      ? 'bg-[rgba(88,166,255,0.15)] border-[#58A6FF] text-[#58A6FF] shadow-sm'
                      : 'bg-[#0B0E14] border-[#30363D] text-[#C9D1D9] hover:bg-[#1C2128] hover:border-[#58A6FF]/40'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-semibold text-white truncate max-w-[180px]">{preset.title}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                      preset.tag.includes('Risk') || preset.tag.includes('HIPAA')
                        ? 'bg-[rgba(248,81,73,0.15)] text-[#F85149] border border-[#F85149]/30'
                        : 'bg-[rgba(35,134,54,0.15)] text-[#3fb950] border border-[#3fb950]/30'
                    }`}>
                      {preset.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8B949E] font-mono truncate">{preset.fileName}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Dropzone File Upload */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx,.png,.jpg,.jpeg,.txt"
              className="hidden"
            />
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                dragOver
                  ? 'border-[#58A6FF] bg-[rgba(88,166,255,0.1)] scale-[1.01]'
                  : fileName
                  ? 'border-[#58A6FF]/60 bg-[rgba(88,166,255,0.05)]'
                  : 'border-[#30363D] bg-[#0B0E14] hover:border-[#58A6FF]/50 hover:bg-[#1C2128]'
              }`}
            >
              {fileName ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(88,166,255,0.15)] text-[#58A6FF] flex items-center justify-center border border-[#58A6FF]/30">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white truncate max-w-sm">{fileName}</p>
                    <p className="text-xs text-[#58A6FF] font-mono">
                      {(fileSize / 1024).toFixed(1)} KB • {pageCount} Pages • {fileType.toUpperCase()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <UploadCloud className="w-10 h-10 text-[#8B949E] mx-auto" />
                  <p className="text-sm font-semibold text-[#C9D1D9]">
                    Drag and drop your file here, or <span className="text-[#58A6FF] underline">browse</span>
                  </p>
                  <p className="text-xs text-[#8B949E]">Supports PDF, DOCX, TXT, PNG/JPG up to 25MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Print Options Configuration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0B0E14] p-4 rounded-xl border border-[#30363D]">
            {/* Target Printer Fleet */}
            <div>
              <label className="text-xs font-semibold text-[#C9D1D9] mb-1.5 flex items-center gap-1.5">
                <PrinterIcon className="w-3.5 h-3.5 text-[#58A6FF]" />
                Target Printer Station
              </label>
              <select
                value={selectedPrinterId}
                onChange={(e) => setSelectedPrinterId(e.target.value)}
                className="w-full bg-[#161B22] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#58A6FF] cursor-pointer"
              >
                {printers.map((p) => (
                  <option key={p.id} value={p.id} disabled={!p.isOnline}>
                    {p.name} ({p.location}) {p.isOnline ? `• Paper: ${p.paperLevel}%` : '• OFFLINE'}
                  </option>
                ))}
              </select>
            </div>

            {/* Copies */}
            <div>
              <label className="text-xs font-semibold text-[#C9D1D9] mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#3fb950]" />
                Number of Copies & Pages
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center bg-[#161B22] border border-[#30363D] rounded-lg px-3 py-1.5">
                  <span className="text-xs text-[#8B949E] mr-2">Copies:</span>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={copies}
                    onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full bg-transparent text-xs font-bold text-white focus:outline-none"
                  />
                </div>
                <div className="flex-1 flex items-center bg-[#161B22] border border-[#30363D] rounded-lg px-3 py-1.5">
                  <span className="text-xs text-[#8B949E] mr-2">Pages:</span>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={pageCount}
                    onChange={(e) => setPageCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full bg-transparent text-xs font-bold text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Color Mode */}
            <div>
              <label className="text-xs font-semibold text-[#C9D1D9] mb-1.5 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#58A6FF]" />
                Color & Layout
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setColorMode('color')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    colorMode === 'color'
                      ? 'bg-[rgba(88,166,255,0.2)] border-[#58A6FF] text-[#58A6FF]'
                      : 'bg-[#161B22] border-[#30363D] text-[#8B949E]'
                  }`}
                >
                  Full Color
                </button>
                <button
                  type="button"
                  onClick={() => setColorMode('monochrome')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    colorMode === 'monochrome'
                      ? 'bg-[rgba(88,166,255,0.2)] border-[#58A6FF] text-[#58A6FF]'
                      : 'bg-[#161B22] border-[#30363D] text-[#8B949E]'
                  }`}
                >
                  Monochrome
                </button>
              </div>
            </div>

            {/* OTP Expiration Time */}
            <div>
              <label className="text-xs font-semibold text-[#C9D1D9] mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#D29922]" />
                PIN / QR Time-to-Live (TTL)
              </label>
              <select
                value={expiryMinutes}
                onChange={(e) => setExpiryMinutes(parseInt(e.target.value, 10))}
                className="w-full bg-[#161B22] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#58A6FF] cursor-pointer"
              >
                <option value={5}>5 Minutes (Maximum Security)</option>
                <option value={15}>15 Minutes (Standard Safe)</option>
                <option value={30}>30 Minutes</option>
                <option value={60}>60 Minutes (Longer Session)</option>
              </select>
            </div>
          </div>

          {/* AI DLP Inspection Preview Banner */}
          <div className="p-3 rounded-xl bg-[#0B0E14] border border-[#30363D] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#C9D1D9]">
              <Sparkles className="w-4 h-4 text-[#58A6FF] animate-pulse" />
              <span>AI Sensitive Document DLP Scanner will analyze payload upon submission</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[rgba(88,166,255,0.15)] text-[#58A6FF] border border-[#58A6FF]/30">
              Gemini 3.7 Flash
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg bg-[#1C2128] hover:bg-[#30363D] text-[#C9D1D9] text-xs font-semibold transition-colors cursor-pointer border border-[#30363D]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isScanning || isSubmitting || !fileName}
              className={`px-6 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                isScanning || isSubmitting
                  ? 'bg-[#30363D] text-[#8B949E] cursor-wait'
                  : 'bg-[#58A6FF] hover:bg-[#79B8FF] text-[#0B0E14] shadow-md shadow-[#58A6FF]/20'
              }`}
            >
              {isScanning ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-[#0B0E14]" />
                  <span>Scanning with AI DLP...</span>
                </>
              ) : isSubmitting ? (
                <>
                  <ShieldCheck className="w-4 h-4 animate-bounce text-[#0B0E14]" />
                  <span>Submitting to Queue...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Scan & Place in Secure Queue</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
