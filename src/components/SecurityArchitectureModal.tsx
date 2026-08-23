import React from 'react';
import { 
  ShieldCheck, 
  X, 
  Cpu, 
  Lock, 
  Sparkles, 
  Terminal, 
  CheckCircle2, 
  ArrowDown, 
  Server, 
  KeyRound, 
  QrCode, 
  Trash2, 
  Layers 
} from 'lucide-react';

interface SecurityArchitectureModalProps {
  onClose: () => void;
}

export const SecurityArchitectureModal: React.FC<SecurityArchitectureModalProps> = ({ onClose }) => {
  const steps = [
    { num: '01', title: 'User Authentication & RBAC', desc: 'Secure session initiation with role permissions (Admin, Security Officer, Standard Employee).' },
    { num: '02', title: 'Secure Document Ingestion', desc: 'SHA-256 integrity checksum calculated upon payload upload.' },
    { num: '03', title: 'AI DLP Deep Inspection', desc: 'Gemini 3.7 Flash scans document for PII, SSNs, financial ledgers, and secret markings.' },
    { num: '04', title: 'Security Tier Assignment', desc: 'Classification into STANDARD, CONFIDENTIAL, or RESTRICTED with user sign-off.' },
    { num: '05', title: 'Cryptographic OTP & QR Generation', desc: 'Dynamic 6-digit PIN and high-entropy QR token generated with strict Time-To-Live (TTL).' },
    { num: '06', title: 'Encrypted Queue Placement', desc: 'Document payload held securely in protected queue; NO print occurs without physical presence.' },
    { num: '07', title: 'Walk-Up Hardware Terminal', desc: 'User arrives at designated IoT touchscreen printer kiosk.' },
    { num: '08', title: 'Multi-Modal Authentication', desc: 'User verifies identity via PIN touchpad, optical QR code scan, or RFID badge tap.' },
    { num: '09', title: 'Rate-Limited Verification', desc: 'Max 3 failed attempts before automatic lockout and security team notification.' },
    { num: '10', title: 'Laser Engine Output', desc: 'Decrypted in volatile hardware RAM and printed directly into user hands.' },
    { num: '11', title: 'Zero-Retention Memory Shredding', desc: 'Volatile print cache zeroized (DoD 5220.22-M compliant) & immutable SIEM log recorded.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 rounded-2xl bg-[#161B22] border border-[#30363D] shadow-2xl overflow-hidden text-[#C9D1D9] animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-[#0B0E14] p-6 border-b border-[#30363D] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[rgba(88,166,255,0.15)] border border-[#58A6FF]/30 flex items-center justify-center text-[#58A6FF]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">PrintSafe Zero-Trust Security Specification</h3>
              <p className="text-xs text-[#8B949E]">Comprehensive 11-Stage Workflow & IoT Hardware Architecture</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1C2128] hover:bg-[#30363D] text-[#8B949E] hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-[#30363D]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto pr-2">
          {/* Hardware & IoT Integration Blueprint */}
          <div className="p-5 rounded-xl bg-[#0B0E14] border border-[#30363D] space-y-3">
            <h4 className="text-xs font-bold text-[#58A6FF] uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              <span>Embedded Hardware Architecture (Raspberry Pi / IoT Kiosk)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#161B22] border border-[#30363D] space-y-1">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#3fb950]" /> Touchscreen Display
                </p>
                <p className="text-[#8B949E] text-[11px]">7" to 10" Capacitive touch display running secure Linux kiosk container.</p>
              </div>
              <div className="p-3 rounded-lg bg-[#161B22] border border-[#30363D] space-y-1">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-[#58A6FF]" /> Optical & RFID Reader
                </p>
                <p className="text-[#8B949E] text-[11px]">Integrated 2D barcode camera engine & 13.56 MHz NFC / Mifare badge sensor.</p>
              </div>
              <div className="p-3 rounded-lg bg-[#161B22] border border-[#30363D] space-y-1">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-[#D29922]" /> Micro-Controller Hub
                </p>
                <p className="text-[#8B949E] text-[11px]">CUPS secure print daemon communicating over TLS 1.3 to central queue.</p>
              </div>
            </div>
          </div>

          {/* 11-Stage Security Pipeline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#58A6FF]" />
              <span>11-Stage End-to-End Cryptographic Print Workflow</span>
            </h4>

            <div className="space-y-2">
              {steps.map((s, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[#0B0E14] border border-[#30363D] flex items-start gap-3 hover:border-[#58A6FF]/40 transition-colors"
                >
                  <span className="w-7 h-7 rounded-lg bg-[rgba(88,166,255,0.15)] text-[#58A6FF] font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-[#58A6FF]/30">
                    {s.num}
                  </span>
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-white">{s.title}</p>
                    <p className="text-[#8B949E] mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#0B0E14] border-t border-[#30363D] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-[#58A6FF] hover:bg-[#79B8FF] text-[#0B0E14] font-bold text-xs cursor-pointer shadow-md"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
