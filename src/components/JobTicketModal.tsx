import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Shield, 
  Clock, 
  Copy, 
  Check, 
  KeyRound, 
  QrCode, 
  Printer, 
  Sparkles, 
  FileText, 
  AlertTriangle,
  Play,
  Download,
  Lock
} from 'lucide-react';
import { PrintJob } from '../types/index.js';

interface JobTicketModalProps {
  job: PrintJob | null;
  onClose: () => void;
  onOpenInKiosk: (job: PrintJob) => void;
  onCancelJob: (jobId: string) => void;
}

export const JobTicketModal: React.FC<JobTicketModalProps> = ({
  job,
  onClose,
  onOpenInKiosk,
  onCancelJob,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedPin, setCopiedPin] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!job) return;

    // Generate QR Code
    QRCode.toDataURL(
      job.qrToken,
      {
        width: 260,
        margin: 1.5,
        color: {
          dark: '#022c22', // deep emerald-950
          light: '#f0fdf4', // emerald-50
        },
        errorCorrectionLevel: 'H',
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );

    // Countdown Timer
    const calculateTime = () => {
      const diff = new Date(job.expiresAt).getTime() - new Date().getTime();
      if (diff <= 0) {
        setTimeLeft('00:00 - EXPIRED');
        setIsExpired(true);
      } else {
        const mins = Math.floor(diff / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
        setIsExpired(false);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [job]);

  if (!job) return null;

  const handleCopyPin = () => {
    navigator.clipboard.writeText(job.pinCode);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#161B22] border border-[#30363D] shadow-2xl overflow-hidden text-[#C9D1D9]">
        {/* Top Header Badge */}
        <div className="bg-[#0B0E14] p-4 border-b border-[#30363D] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[rgba(88,166,255,0.15)] border border-[#58A6FF]/30 flex items-center justify-center text-[#58A6FF]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Secure Print Release Pass
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase ${
                  job.status === 'QUEUED' ? 'bg-[rgba(59,185,80,0.15)] text-[#3fb950] border border-[#3fb950]/30' :
                  job.status === 'COMPLETED' ? 'bg-[rgba(88,166,255,0.15)] text-[#58A6FF] border border-[#58A6FF]/30' :
                  'bg-[rgba(248,81,73,0.15)] text-[#F85149] border border-[#F85149]/30'
                }`}>
                  {job.status}
                </span>
              </h3>
              <p className="text-xs text-[#8B949E] font-mono">Job ID: {job.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1C2128] hover:bg-[#30363D] text-[#8B949E] hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-[#30363D]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Expiration Timer Banner */}
          {job.status === 'QUEUED' && (
            <div className={`p-3 rounded-xl flex items-center justify-between border ${
              isExpired 
                ? 'bg-[rgba(248,81,73,0.15)] border-[#F85149]/40 text-[#F85149]' 
                : 'bg-[rgba(35,134,54,0.15)] border-[#3fb950]/40 text-[#3fb950]'
            }`}>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#3fb950]" />
                <span className="text-xs font-semibold">
                  {isExpired ? 'Time Expired: Memory Buffer Purged' : 'Authentication Code Valid For:'}
                </span>
              </div>
              <span className="text-sm font-mono font-bold tracking-widest bg-[#0B0E14] px-2.5 py-1 rounded border border-[#30363D]">
                {timeLeft}
              </span>
            </div>
          )}

          {/* Dual Authentication Mechanism: PIN Code & QR Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 6-Digit PIN Box */}
            <div className="bg-[#0B0E14] rounded-xl p-4 border border-[#30363D] flex flex-col items-center justify-center text-center relative group">
              <div className="flex items-center gap-1.5 text-xs text-[#8B949E] mb-2 font-medium">
                <KeyRound className="w-3.5 h-3.5 text-[#58A6FF]" />
                <span>6-Digit Kiosk PIN</span>
              </div>

              <div className="text-3xl font-mono font-black tracking-widest text-[#58A6FF] bg-[#161B22] px-4 py-2 rounded-lg border border-[#58A6FF]/40 shadow-inner w-full flex items-center justify-center">
                {job.pinCode}
              </div>

              <button
                onClick={handleCopyPin}
                className="mt-3 text-xs text-[#C9D1D9] hover:text-white flex items-center gap-1 bg-[#1C2128] hover:bg-[#30363D] px-3 py-1 rounded-lg border border-[#30363D] transition-colors cursor-pointer"
              >
                {copiedPin ? <Check className="w-3 h-3 text-[#3fb950]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPin ? 'PIN Copied!' : 'Copy Code'}</span>
              </button>
              <p className="text-[10px] text-[#8B949E] mt-2">Enter this at printer touchscreen</p>
            </div>

            {/* QR Code Pass */}
            <div className="bg-[#0B0E14] rounded-xl p-3 border border-[#30363D] flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1.5 text-xs text-[#8B949E] mb-1.5 font-medium">
                <QrCode className="w-3.5 h-3.5 text-[#58A6FF]" />
                <span>Scan at Optical Reader</span>
              </div>

              <div className="p-2 bg-white rounded-lg shadow-md border border-[#30363D]">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Job QR Code" className="w-28 h-28 object-contain" />
                ) : (
                  <div className="w-28 h-28 bg-[#161B22] flex items-center justify-center text-[#8B949E] text-xs">
                    Generating...
                  </div>
                )}
              </div>
              <p className="text-[10px] text-[#8B949E] mt-1.5">Hold up to printer camera / scanner</p>
            </div>
          </div>

          {/* Job Details Card */}
          <div className="bg-[#0B0E14] rounded-xl p-4 border border-[#30363D] space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#30363D]">
              <span className="text-[#8B949E] flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-[#8B949E]" /> Document Name
              </span>
              <span className="font-semibold text-white truncate max-w-[200px]" title={job.documentName}>
                {job.documentName}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-[#30363D]">
              <span className="text-[#8B949E]">Target Printer</span>
              <span className="font-medium text-[#58A6FF]">{job.selectedPrinterName}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-[#30363D]">
              <span className="text-[#8B949E]">Print Configuration</span>
              <span className="text-[#C9D1D9]">
                {job.pageCount} Pages • {job.copies} {job.copies === 1 ? 'Copy' : 'Copies'} • {job.colorMode} • {job.duplex}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#8B949E]">Security Classification</span>
              <span className={`px-2 py-0.5 rounded font-mono font-semibold text-[10px] ${
                job.securityTier === 'RESTRICTED' ? 'bg-[rgba(248,81,73,0.15)] text-[#F85149] border border-[#F85149]/40' :
                job.securityTier === 'CONFIDENTIAL' ? 'bg-[rgba(210,153,34,0.15)] text-[#D29922] border border-[#D29922]/40' :
                'bg-[rgba(35,134,54,0.15)] text-[#3fb950] border border-[#3fb950]/40'
              }`}>
                {job.securityTier}
              </span>
            </div>

            {job.aiSensitiveDetected && (
              <div className="mt-2 p-2 rounded-lg bg-[rgba(210,153,34,0.15)] border border-[#D29922]/40 text-[#D29922] text-[11px] flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#D29922] shrink-0 mt-0.5" />
                <span>AI DLP Warning: {job.dlpFindingsSummary || 'Document contains sensitive or confidential markers.'}</span>
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            {job.status === 'QUEUED' && !isExpired && (
              <button
                onClick={() => {
                  onClose();
                  onOpenInKiosk(job);
                }}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-lg bg-[#58A6FF] hover:bg-[#79B8FF] text-[#0B0E14] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#58A6FF]/20 cursor-pointer transition-all"
              >
                <Play className="w-4 h-4 fill-[#0B0E14]" />
                <span>Test Walk-Up Release in Kiosk</span>
              </button>
            )}

            {job.status === 'QUEUED' && (
              <button
                onClick={() => {
                  onCancelJob(job.id);
                  onClose();
                }}
                className="w-full sm:w-auto py-2.5 px-4 rounded-lg bg-[#1C2128] hover:bg-[rgba(248,81,73,0.15)] text-[#C9D1D9] hover:text-[#F85149] border border-[#30363D] hover:border-[#F85149]/40 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel Job
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full sm:w-auto py-2.5 px-4 rounded-lg bg-[#1C2128] hover:bg-[#30363D] text-[#C9D1D9] text-xs font-semibold border border-[#30363D] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
