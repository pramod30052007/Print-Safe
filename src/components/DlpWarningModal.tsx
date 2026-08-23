import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  X, 
  Lock, 
  FileWarning, 
  ArrowRight, 
  Eye, 
  EyeOff,
  Sparkles,
  Check
} from 'lucide-react';
import { DlpScanResult } from '../types/index.js';

interface DlpWarningModalProps {
  dlpResult: DlpScanResult;
  fileName: string;
  onConfirmProceed: (securityTier: 'CONFIDENTIAL' | 'RESTRICTED') => void;
  onCancel: () => void;
}

export const DlpWarningModal: React.FC<DlpWarningModalProps> = ({
  dlpResult,
  fileName,
  onConfirmProceed,
  onCancel,
}) => {
  const [selectedTier, setSelectedTier] = useState<'CONFIDENTIAL' | 'RESTRICTED'>(
    dlpResult.recommendedTier === 'RESTRICTED' ? 'RESTRICTED' : 'CONFIDENTIAL'
  );
  const [acknowledged, setAcknowledged] = useState(false);
  const [showMasked, setShowMasked] = useState(true);

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-[#F85149] bg-[rgba(248,81,73,0.15)] border-[#F85149]/40';
    if (score >= 40) return 'text-[#D29922] bg-[rgba(210,153,34,0.15)] border-[#D29922]/40';
    return 'text-[#58A6FF] bg-[rgba(88,166,255,0.15)] border-[#58A6FF]/40';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#161B22] border border-[#30363D] shadow-2xl overflow-hidden text-[#C9D1D9] animate-in zoom-in-95">
        {/* Header Alert Strip */}
        <div className="bg-[#0B0E14] p-4 border-b border-[#30363D] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[rgba(210,153,34,0.15)] border border-[#D29922]/40 flex items-center justify-center text-[#D29922]">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">AI Sensitive Document Warning</h3>
                <span className="px-2 py-0.5 rounded-full bg-[rgba(88,166,255,0.15)] border border-[#58A6FF]/30 text-[10px] font-mono text-[#58A6FF] uppercase tracking-wide flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Gemini DLP
                </span>
              </div>
              <p className="text-xs text-[#8B949E]">Confidential / PII Data Detected Prior to Print Spooling</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-lg bg-[#1C2128] hover:bg-[#30363D] text-[#8B949E] hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-[#30363D]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Risk Score & Executive Summary */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-[#0B0E14] border border-[#30363D]">
            <div className={`px-3.5 py-2 rounded-xl border flex flex-col items-center justify-center font-mono ${getScoreColor(dlpResult.sensitivityScore)}`}>
              <span className="text-2xl font-black">{dlpResult.sensitivityScore}</span>
              <span className="text-[9px] uppercase tracking-wider font-semibold">Risk Index</span>
            </div>
            <div className="flex-1 text-xs space-y-1">
              <p className="font-semibold text-white">Target: <span className="text-[#58A6FF] font-mono">{fileName}</span></p>
              <p className="text-[#C9D1D9] leading-relaxed">{dlpResult.summary}</p>
            </div>
          </div>

          {/* Granular Findings List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#8B949E] flex items-center gap-1.5">
                <FileWarning className="w-3.5 h-3.5 text-[#D29922]" />
                Detected Security & Privacy Violations ({dlpResult.findings.length})
              </span>
              <button
                onClick={() => setShowMasked(!showMasked)}
                className="text-[11px] text-[#58A6FF] hover:text-[#79B8FF] flex items-center gap-1 cursor-pointer"
              >
                {showMasked ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                <span>{showMasked ? 'Reveal Snippets' : 'Mask PII'}</span>
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {dlpResult.findings.map((item, idx) => (
                <div 
                  key={idx} 
                  className="p-3 rounded-lg bg-[#0B0E14] border border-[#30363D] text-xs flex items-start gap-3 hover:border-[#58A6FF]/40 transition-colors"
                >
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase shrink-0 mt-0.5 ${
                    item.severity === 'HIGH' ? 'bg-[rgba(248,81,73,0.15)] text-[#F85149] border border-[#F85149]/40' :
                    item.severity === 'MEDIUM' ? 'bg-[rgba(210,153,34,0.15)] text-[#D29922] border border-[#D29922]/40' :
                    'bg-[rgba(88,166,255,0.15)] text-[#58A6FF] border border-[#58A6FF]/40'
                  }`}>
                    {item.type.replace('_', ' ')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-white bg-[#161B22] px-2 py-1 rounded border border-[#30363D] mb-1 truncate">
                      {showMasked && (item.type === 'SSN' || item.type === 'CREDIT_CARD' || item.type === 'BANK_ACCOUNT')
                        ? item.snippet.replace(/\d(?=\d{4})/g, '*')
                        : item.snippet}
                    </p>
                    <p className="text-[11px] text-[#8B949E]">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Classification Tier Picker */}
          <div className="space-y-2 pt-1 border-t border-[#30363D]">
            <label className="text-xs font-semibold text-[#8B949E] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#58A6FF]" />
              Select Required Security Release Tier:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedTier('CONFIDENTIAL')}
                className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  selectedTier === 'CONFIDENTIAL'
                    ? 'bg-[rgba(210,153,34,0.15)] border-[#D29922] text-white shadow-sm'
                    : 'bg-[#0B0E14] border-[#30363D] text-[#8B949E] hover:border-[#58A6FF]/40'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-white mb-1">
                  <span>Confidential</span>
                  {selectedTier === 'CONFIDENTIAL' && <Check className="w-3.5 h-3.5 text-[#D29922]" />}
                </div>
                <p className="text-[11px] text-[#8B949E]">PIN/OTP release + standard 20min buffer retention.</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTier('RESTRICTED')}
                className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  selectedTier === 'RESTRICTED'
                    ? 'bg-[rgba(248,81,73,0.15)] border-[#F85149] text-white shadow-sm'
                    : 'bg-[#0B0E14] border-[#30363D] text-[#8B949E] hover:border-[#58A6FF]/40'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-white mb-1">
                  <span>Top Secret / Restricted</span>
                  {selectedTier === 'RESTRICTED' && <Check className="w-3.5 h-3.5 text-[#F85149]" />}
                </div>
                <p className="text-[11px] text-[#8B949E]">Immediate memory zeroization + enhanced audit logging.</p>
              </button>
            </div>
          </div>

          {/* Mandatory Compliance Checkbox */}
          <div className="p-3 rounded-xl bg-[#0B0E14] border border-[#30363D] text-xs text-[#C9D1D9] flex items-start gap-2.5">
            <input
              type="checkbox"
              id="ackDlp"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-[#30363D] text-[#58A6FF] focus:ring-[#58A6FF] cursor-pointer accent-[#58A6FF]"
            />
            <label htmlFor="ackDlp" className="cursor-pointer select-none leading-relaxed">
              I acknowledge that this document contains confidential information. I confirm that I will authenticate at the physical printer immediately and collect printed sheets directly from the tray.
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onCancel}
              className="px-4 py-2.5 rounded-lg bg-[#1C2128] hover:bg-[#30363D] text-[#C9D1D9] text-xs font-semibold border border-[#30363D] transition-colors cursor-pointer"
            >
              Cancel Upload
            </button>

            <button
              disabled={!acknowledged}
              onClick={() => onConfirmProceed(selectedTier)}
              className={`px-5 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                acknowledged
                  ? 'bg-[#58A6FF] hover:bg-[#79B8FF] text-[#0B0E14] shadow-md shadow-[#58A6FF]/20'
                  : 'bg-[#1C2128] text-[#8B949E] cursor-not-allowed border border-[#30363D]'
              }`}
            >
              <span>Confirm & Secure Queue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
