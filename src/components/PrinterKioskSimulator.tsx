import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Terminal, 
  X, 
  Printer as PrinterIcon, 
  KeyRound, 
  QrCode, 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Play, 
  RefreshCw, 
  FileText, 
  Trash2, 
  Zap,
  Lock,
  Eye,
  Camera,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { Printer, PrintJob, User } from '../types/index.js';
import { api } from '../services/api.js';

interface PrinterKioskSimulatorProps {
  printers: Printer[];
  initialJob?: PrintJob | null;
  currentUser: User | null;
  onClose: () => void;
  onPrintCompleted: (job: PrintJob) => void;
}

export const PrinterKioskSimulator: React.FC<PrinterKioskSimulatorProps> = ({
  printers,
  initialJob,
  currentUser,
  onClose,
  onPrintCompleted,
}) => {
  const [selectedPrinterId, setSelectedPrinterId] = useState<string>(
    initialJob?.selectedPrinterId || printers[0]?.id || 'PRT-01'
  );
  
  // Auth Modes: 'pin' | 'qr' | 'rfid' | 'quick_pick'
  const [authMode, setAuthMode] = useState<'pin' | 'qr' | 'rfid' | 'quick_pick'>('pin');
  
  // PIN state
  const [enteredPin, setEnteredPin] = useState<string>(initialJob?.pinCode || '');
  const [pinError, setPinError] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);

  // QR state
  const [enteredQrToken, setEnteredQrToken] = useState<string>(initialJob?.qrToken || '');

  // Active Authenticated Job
  const [authenticatedJob, setAuthenticatedJob] = useState<PrintJob | null>(null);

  // Printing Spooling Simulation State
  const [isPrinting, setIsPrinting] = useState(false);
  const [spoolStep, setSpoolStep] = useState<string>('');
  const [printProgress, setPrintProgress] = useState<number>(0);
  const [isPrintFinished, setIsPrintFinished] = useState(false);

  // Active queued jobs for quick testing
  const [queuedJobs, setQueuedJobs] = useState<PrintJob[]>([]);

  const selectedPrinter = printers.find((p) => p.id === selectedPrinterId) || printers[0];

  // Fetch active queued jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.getPrintJobs();
        const active = res.jobs.filter((j) => j.status === 'QUEUED' || j.status === 'AUTHENTICATED');
        setQueuedJobs(active);
      } catch (err) {
        console.error(err);
      }
    };
    fetchJobs();
  }, []);

  // Handle Keypad Inputs
  const handleKeypadPress = (val: string) => {
    if (isVerifying || isPrinting) return;
    setPinError('');
    if (val === 'CLEAR') {
      setEnteredPin('');
    } else if (val === 'BACK') {
      setEnteredPin((prev) => prev.slice(0, -1));
    } else if (enteredPin.length < 6) {
      setEnteredPin((prev) => prev + val);
    }
  };

  // Verify PIN
  const handleVerifyPin = async (pinToTest?: string) => {
    const code = pinToTest || enteredPin;
    if (!code || code.length < 4) {
      setPinError('Please enter the full 6-digit secure PIN.');
      return;
    }

    setIsVerifying(true);
    setPinError('');

    try {
      const res = await api.verifyOtpAtPrinter(selectedPrinterId, code);
      setAuthenticatedJob(res.job);
      setFailedAttempts(0);
    } catch (err: any) {
      setFailedAttempts((prev) => prev + 1);
      setPinError(err.message || 'PIN verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Verify QR Token
  const handleVerifyQr = async (tokenToTest?: string) => {
    const token = tokenToTest || enteredQrToken;
    if (!token) {
      setPinError('Please enter or scan a valid QR security token.');
      return;
    }

    setIsVerifying(true);
    setPinError('');

    try {
      const res = await api.verifyQrAtPrinter(selectedPrinterId, token);
      setAuthenticatedJob(res.job);
      setFailedAttempts(0);
    } catch (err: any) {
      setFailedAttempts((prev) => prev + 1);
      setPinError(err.message || 'QR verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  // RFID Tap Simulation
  const handleRfidTap = async () => {
    if (!currentUser) return;
    setIsVerifying(true);
    setPinError('');

    try {
      // Find latest queued job for user
      const userQueued = queuedJobs.find((j) => j.userId === currentUser.id);
      if (!userQueued) {
        setPinError(`No queued jobs found for Badge ${currentUser.badgeId} (${currentUser.name}).`);
        setIsVerifying(false);
        return;
      }

      const res = await api.verifyOtpAtPrinter(selectedPrinterId, userQueued.pinCode);
      setAuthenticatedJob(res.job);
    } catch (err: any) {
      setPinError(err.message || 'RFID Badge verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Execute Printing Animation and API Call
  const handleExecutePrint = async () => {
    if (!authenticatedJob) return;

    setIsPrinting(true);
    setPrintProgress(10);
    setSpoolStep('Authenticating Hardware Crypto Engine...');

    try {
      // Trigger API
      await api.executePrint(authenticatedJob.id, selectedPrinterId);

      // Simulation steps
      setTimeout(() => {
        setPrintProgress(35);
        setSpoolStep('Receiving Encrypted Document Stream from Queue...');
      }, 500);

      setTimeout(() => {
        setPrintProgress(65);
        setSpoolStep(`Laser Rasterization in Progress (${authenticatedJob.pageCount} Pages, ${authenticatedJob.colorMode})...`);
      }, 1000);

      setTimeout(() => {
        setPrintProgress(90);
        setSpoolStep('Ejecting Printed Sheets to Secure Output Tray...');
      }, 1500);

      setTimeout(() => {
        setPrintProgress(100);
        setSpoolStep('Zero-Retention Purge: Volatile Print RAM Shredded (DoD 5220.22-M Compliant).');
        setIsPrintFinished(true);
        setIsPrinting(false);
        onPrintCompleted(authenticatedJob);

        // Confetti celebration
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10b981', '#06b6d4', '#3b82f6'],
          });
        } catch (e) {
          // ignore confetti fallback
        }
      }, 2100);
    } catch (err: any) {
      setIsPrinting(false);
      setPinError(err.message || 'Printing hardware fault.');
    }
  };

  const handleResetKiosk = () => {
    setAuthenticatedJob(null);
    setEnteredPin('');
    setEnteredQrToken('');
    setPinError('');
    setIsPrinting(false);
    setIsPrintFinished(false);
    setPrintProgress(0);
    setSpoolStep('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl my-auto rounded-2xl bg-[#161B22] border-2 border-[#30363D] shadow-2xl overflow-hidden text-[#C9D1D9] flex flex-col">
        {/* Physical Printer Terminal Top Hardware Bezel */}
        <div className="bg-[#0B0E14] px-6 py-3 border-b border-[#30363D] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F85149]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#D29922]"></span>
              <span className={`w-2.5 h-2.5 rounded-full ${selectedPrinter?.isOnline ? 'bg-[#3fb950] animate-pulse' : 'bg-[#8B949E]'}`}></span>
            </div>
            <div className="h-4 w-px bg-[#30363D]"></div>
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#58A6FF]" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#C9D1D9]">
                PrintSafe IoT Kiosk Terminal v4.2
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-[#8B949E] hidden sm:inline">
              IP: {selectedPrinter?.ipAddress}
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[#1C2128] hover:bg-[#30363D] text-[#8B949E] hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-[#30363D]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Touchscreen Body */}
        <div className="p-4 sm:p-6 bg-[#0B0E14] flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Touch Display */}
          <div className="lg:col-span-8 space-y-4">
            {/* Screen Glass Frame */}
            <div className="rounded-xl border border-[#30363D] bg-[#161B22] p-5 shadow-inner relative overflow-hidden flex flex-col justify-between min-h-[420px]">
              {/* Screen Top Status Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-[#30363D] text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#3fb950]"></span>
                  <span className="text-[#3fb950] font-bold">{selectedPrinter?.name}</span>
                </div>
                <div className="flex items-center gap-3 text-[#8B949E]">
                  <span>Paper: {selectedPrinter?.paperLevel}%</span>
                  <span>Toner: {selectedPrinter?.tonerLevel}%</span>
                  <span className="text-[#58A6FF]">PULL-PRINT ON</span>
                </div>
              </div>

              {/* State 1: Printing in Progress Screen */}
              {isPrinting || isPrintFinished ? (
                <div className="my-auto py-8 text-center space-y-5 animate-in fade-in">
                  <div className="relative w-24 h-24 mx-auto">
                    <div className="w-24 h-24 rounded-full border-4 border-[#3fb950]/20 border-t-[#3fb950] animate-spin flex items-center justify-center"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PrinterIcon className="w-10 h-10 text-[#3fb950] animate-bounce" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white font-mono">
                      {isPrintFinished ? 'Print Complete & Secured!' : 'Printing Document...'}
                    </h3>
                    <p className="text-xs text-[#58A6FF] font-mono">{spoolStep}</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full max-w-md mx-auto bg-[#0B0E14] h-3 rounded-full overflow-hidden border border-[#30363D]">
                    <div
                      className="bg-[#58A6FF] h-full transition-all duration-300 rounded-full"
                      style={{ width: `${printProgress}%` }}
                    ></div>
                  </div>

                  {isPrintFinished && (
                    <div className="space-y-3 pt-2">
                      <div className="p-3 rounded-xl bg-[rgba(35,134,54,0.15)] border border-[#3fb950]/40 max-w-md mx-auto text-xs text-[#3fb950] flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#3fb950]" />
                        <span>Please collect your printed sheets from the output tray.</span>
                      </div>
                      <button
                        onClick={handleResetKiosk}
                        className="px-6 py-2 rounded-lg bg-[#58A6FF] hover:bg-[#79B8FF] text-[#0B0E14] font-bold text-xs cursor-pointer shadow-md shadow-[#58A6FF]/20"
                      >
                        Print Another Document / Log Off
                      </button>
                    </div>
                  )}
                </div>
              ) : authenticatedJob ? (
                /* State 2: Authenticated Job Ready to Release */
                <div className="my-auto py-4 space-y-4 animate-in zoom-in-95">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(35,134,54,0.15)] border border-[#3fb950]/40">
                    <div className="w-10 h-10 rounded-lg bg-[rgba(35,134,54,0.2)] text-[#3fb950] flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Identity Verified: Release Authorization Granted</h4>
                      <p className="text-xs text-[#3fb950]">Authorized for: {authenticatedJob.userName} ({authenticatedJob.userEmail})</p>
                    </div>
                  </div>

                  {/* Job Metadata Card */}
                  <div className="p-4 rounded-xl bg-[#0B0E14] border border-[#30363D] space-y-2 text-xs">
                    <div className="flex justify-between pb-1.5 border-b border-[#30363D]">
                      <span className="text-[#8B949E]">Document Name:</span>
                      <span className="font-bold text-white font-mono">{authenticatedJob.documentName}</span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-[#30363D]">
                      <span className="text-[#8B949E]">Pages / Copies:</span>
                      <span className="text-[#C9D1D9]">{authenticatedJob.pageCount} Pages • {authenticatedJob.copies} Copies</span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-[#30363D]">
                      <span className="text-[#8B949E]">Color / Duplex:</span>
                      <span className="text-[#C9D1D9] capitalize">{authenticatedJob.colorMode} • {authenticatedJob.duplex}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8B949E]">Security Tier:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        authenticatedJob.securityTier === 'RESTRICTED' ? 'bg-[rgba(248,81,73,0.15)] text-[#F85149]' :
                        authenticatedJob.securityTier === 'CONFIDENTIAL' ? 'bg-[rgba(210,153,34,0.15)] text-[#D29922]' :
                        'bg-[rgba(35,134,54,0.15)] text-[#3fb950]'
                      }`}>
                        {authenticatedJob.securityTier}
                      </span>
                    </div>
                  </div>

                  {/* Big Release Button */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleResetKiosk}
                      className="py-3 px-4 rounded-lg bg-[#1C2128] hover:bg-[#30363D] text-[#C9D1D9] text-xs font-semibold cursor-pointer border border-[#30363D]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleExecutePrint}
                      className="flex-1 py-3 px-6 rounded-lg bg-[#58A6FF] hover:bg-[#79B8FF] text-[#0B0E14] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-[#58A6FF]/25 cursor-pointer transition-all"
                    >
                      <PrinterIcon className="w-5 h-5" />
                      <span>Release & Print Now</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* State 3: Authentication Input Screen (PIN or QR or RFID) */
                <div className="space-y-4 my-auto py-2">
                  {/* Mode Tabs */}
                  <div className="flex items-center justify-center gap-2 pb-2">
                    <button
                      onClick={() => { setAuthMode('pin'); setPinError(''); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        authMode === 'pin' ? 'bg-[rgba(88,166,255,0.15)] text-[#58A6FF] border border-[#58A6FF]/40' : 'text-[#8B949E] hover:bg-[#1C2128]'
                      }`}
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      6-Digit PIN
                    </button>
                    <button
                      onClick={() => { setAuthMode('qr'); setPinError(''); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        authMode === 'qr' ? 'bg-[rgba(88,166,255,0.15)] text-[#58A6FF] border border-[#58A6FF]/40' : 'text-[#8B949E] hover:bg-[#1C2128]'
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      QR Scanner
                    </button>
                    <button
                      onClick={() => { setAuthMode('rfid'); setPinError(''); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        authMode === 'rfid' ? 'bg-[rgba(88,166,255,0.15)] text-[#58A6FF] border border-[#58A6FF]/40' : 'text-[#8B949E] hover:bg-[#1C2128]'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Badge Tap (RFID)
                    </button>
                  </div>

                  {pinError && (
                    <div className="p-2.5 rounded-lg bg-[rgba(248,81,73,0.15)] border border-[#F85149]/40 text-[#F85149] text-xs flex items-center justify-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{pinError}</span>
                      {failedAttempts > 0 && <span className="font-mono">({failedAttempts}/3 attempts)</span>}
                    </div>
                  )}

                  {authMode === 'pin' && (
                    <div className="space-y-3">
                      {/* PIN Display Digits */}
                      <div className="flex items-center justify-center gap-2 py-2">
                        {[0, 1, 2, 3, 4, 5].map((idx) => {
                          const char = enteredPin[idx];
                          return (
                            <div
                              key={idx}
                              className={`w-11 h-13 rounded-lg border flex items-center justify-center font-mono text-2xl font-black transition-all ${
                                char
                                  ? 'border-[#58A6FF] bg-[rgba(88,166,255,0.15)] text-[#58A6FF] shadow-sm scale-105'
                                  : 'border-[#30363D] bg-[#0B0E14] text-[#8B949E]'
                              }`}
                            >
                              {char ? char : '•'}
                            </div>
                          );
                        })}
                      </div>

                      {/* Touch Keypad */}
                      <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLEAR', '0', 'BACK'].map((key) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleKeypadPress(key)}
                            className={`py-3 rounded-lg font-mono text-base font-bold transition-all active:scale-95 cursor-pointer shadow-sm ${
                              key === 'CLEAR'
                                ? 'bg-[rgba(248,81,73,0.15)] hover:bg-[rgba(248,81,73,0.25)] text-[#F85149] border border-[#F85149]/40 text-xs'
                                : key === 'BACK'
                                ? 'bg-[rgba(210,153,34,0.15)] hover:bg-[rgba(210,153,34,0.25)] text-[#D29922] border border-[#D29922]/40 text-xs'
                                : 'bg-[#1C2128] hover:bg-[#30363D] text-white border border-[#30363D]'
                            }`}
                          >
                            {key}
                          </button>
                        ))}
                      </div>

                      <div className="text-center pt-1">
                        <button
                          onClick={() => handleVerifyPin()}
                          disabled={isVerifying || enteredPin.length < 4}
                          className={`w-full max-w-xs py-2.5 rounded-lg font-bold text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                            enteredPin.length >= 4
                              ? 'bg-[#58A6FF] hover:bg-[#79B8FF] text-[#0B0E14] shadow-md shadow-[#58A6FF]/20'
                              : 'bg-[#1C2128] text-[#8B949E] cursor-not-allowed border border-[#30363D]'
                          }`}
                        >
                          {isVerifying ? 'Verifying PIN...' : 'Confirm PIN & Unlock'}
                        </button>
                      </div>
                    </div>
                  )}

                  {authMode === 'qr' && (
                    <div className="space-y-4 text-center py-4">
                      <div className="w-24 h-24 mx-auto rounded-xl bg-[rgba(88,166,255,0.15)] border-2 border-dashed border-[#58A6FF]/60 flex items-center justify-center text-[#58A6FF]">
                        <Camera className="w-10 h-10 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#C9D1D9]">Optical QR Code Scanner</p>
                        <p className="text-[11px] text-[#8B949E]">Hold up your mobile screen or digital badge</p>
                      </div>

                      <div className="max-w-xs mx-auto space-y-2">
                        <input
                          type="text"
                          placeholder="Paste or enter QR Token string..."
                          value={enteredQrToken}
                          onChange={(e) => setEnteredQrToken(e.target.value)}
                          className="w-full bg-[#0B0E14] border border-[#30363D] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#58A6FF]"
                        />
                        <button
                          onClick={() => handleVerifyQr()}
                          disabled={isVerifying || !enteredQrToken}
                          className="w-full py-2 rounded-lg bg-[#58A6FF] hover:bg-[#79B8FF] text-[#0B0E14] font-bold text-xs cursor-pointer shadow-md"
                        >
                          {isVerifying ? 'Scanning...' : 'Simulate Optical QR Scan'}
                        </button>
                      </div>
                    </div>
                  )}

                  {authMode === 'rfid' && (
                    <div className="space-y-4 text-center py-4">
                      <div className="w-24 h-24 mx-auto rounded-xl bg-[rgba(88,166,255,0.15)] border-2 border-dashed border-[#58A6FF]/60 flex items-center justify-center text-[#58A6FF]">
                        <CreditCard className="w-10 h-10 animate-bounce" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#C9D1D9]">NFC / RFID Contactless Badge Reader</p>
                        <p className="text-[11px] text-[#8B949E]">
                          Tap your physical employee identity card to the reader zone
                        </p>
                      </div>

                      <button
                        onClick={handleRfidTap}
                        disabled={isVerifying}
                        className="px-6 py-2.5 rounded-lg bg-[#58A6FF] hover:bg-[#79B8FF] text-[#0B0E14] font-bold text-xs cursor-pointer shadow-md shadow-[#58A6FF]/20"
                      >
                        {isVerifying ? 'Reading Badge...' : `Tap ${currentUser?.name || 'User'}'s Badge (${currentUser?.badgeId || 'BADGE-9901'})`}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Physical Printer Station Selector & Quick Test Panel */}
          <div className="lg:col-span-4 space-y-4">
            {/* Station Selector */}
            <div className="p-4 rounded-xl bg-[#161B22] border border-[#30363D] space-y-3">
              <label className="text-xs font-bold text-[#8B949E] flex items-center gap-1.5 uppercase tracking-wider">
                <PrinterIcon className="w-3.5 h-3.5 text-[#58A6FF]" />
                Select Hardware Station
              </label>

              <div className="space-y-2">
                {printers.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPrinterId(p.id);
                      handleResetKiosk();
                    }}
                    className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                      selectedPrinterId === p.id
                        ? 'bg-[rgba(88,166,255,0.15)] border-[#58A6FF] text-white shadow-sm'
                        : 'bg-[#0B0E14] border-[#30363D] text-[#8B949E] hover:border-[#58A6FF]/40 hover:text-[#C9D1D9]'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-white truncate max-w-[170px]">{p.name}</p>
                      <p className="text-[10px] text-[#8B949E]">{p.location.split(' - ')[0]}</p>
                    </div>
                    <span className={`w-2.5 h-2.5 rounded-full ${p.isOnline ? 'bg-[#3fb950]' : 'bg-[#F85149]'}`}></span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick 1-Click Active Job Pass Injector */}
            <div className="p-4 rounded-xl bg-[#161B22] border border-[#30363D] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#8B949E] flex items-center gap-1.5 uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5 text-[#D29922]" />
                  Active Queue Tickets
                </label>
                <span className="text-[10px] font-mono bg-[#0B0E14] px-2 py-0.5 rounded text-[#D29922] border border-[#30363D]">
                  {queuedJobs.length} Available
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {queuedJobs.length === 0 ? (
                  <p className="text-xs text-[#8B949E] text-center py-3">No active jobs in queue. Upload one to test.</p>
                ) : (
                  queuedJobs.map((job) => (
                    <button
                      key={job.id}
                      onClick={() => {
                        setEnteredPin(job.pinCode);
                        setEnteredQrToken(job.qrToken);
                        handleVerifyPin(job.pinCode);
                      }}
                      className="w-full p-2.5 rounded-lg bg-[#0B0E14] hover:bg-[#1C2128] border border-[#30363D] hover:border-[#58A6FF]/40 text-left text-xs transition-all cursor-pointer flex flex-col gap-1 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white truncate max-w-[140px] group-hover:text-[#58A6FF]">
                          {job.documentName}
                        </span>
                        <span className="font-mono text-[#58A6FF] font-bold bg-[#161B22] px-1.5 py-0.5 rounded border border-[#30363D] text-[10px]">
                          PIN: {job.pinCode}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#8B949E]">
                        <span>By: {job.userName}</span>
                        <span>{job.pageCount} pgs • {job.copies} cp</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
