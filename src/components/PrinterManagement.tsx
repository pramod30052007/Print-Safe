import React from 'react';
import { 
  Printer as PrinterIcon, 
  Power, 
  RefreshCw, 
  Layers, 
  Droplet, 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  MapPin, 
  Cpu, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Printer } from '../types/index.js';

interface PrinterManagementProps {
  printers: Printer[];
  onPrinterAction: (printerId: string, action: string, value?: any) => void;
  onOpenKioskForPrinter: (printer: Printer) => void;
}

export const PrinterManagement: React.FC<PrinterManagementProps> = ({
  printers,
  onPrinterAction,
  onOpenKioskForPrinter,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#161B22] border border-[#30363D] shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <PrinterIcon className="w-6 h-6 text-[#58A6FF]" />
            <span>Enterprise Printer Fleet & IoT Terminals</span>
          </h2>
          <p className="text-xs text-[#8B949E] mt-1">
            Real-time telemetry, paper/toner levels, hardware status, and interactive terminal dispatch
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#8B949E] font-mono bg-[#0B0E14] px-3 py-1.5 rounded-lg border border-[#30363D] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3fb950] animate-pulse"></span>
            {printers.filter((p) => p.isOnline).length} / {printers.length} Stations Online
          </span>
        </div>
      </div>

      {/* Printer Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {printers.map((printer) => {
          const isPaperLow = printer.paperLevel <= 20;
          const isTonerLow = printer.tonerLevel <= 20;

          return (
            <div
              key={printer.id}
              className={`p-6 rounded-2xl border transition-all space-y-5 bg-[#161B22] shadow-md ${
                !printer.isOnline
                  ? 'border-[#30363D] opacity-70'
                  : printer.status === 'PAPER_JAM' || printer.status === 'OUT_OF_PAPER'
                  ? 'border-[#D29922]/50'
                  : 'border-[#30363D] hover:border-[#58A6FF]/40'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm ${
                    !printer.isOnline
                      ? 'bg-[#1C2128] text-[#8B949E] border-[#30363D]'
                      : printer.status === 'PRINTING'
                      ? 'bg-[rgba(88,166,255,0.2)] text-[#58A6FF] border-[#58A6FF]/40 animate-pulse'
                      : 'bg-[rgba(88,166,255,0.15)] text-[#58A6FF] border-[#58A6FF]/30'
                  }`}>
                    <PrinterIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base">{printer.name}</h3>
                    </div>
                    <p className="text-xs text-[#8B949E] font-mono flex items-center gap-1 mt-0.5">
                      <Cpu className="w-3 h-3 text-[#8B949E]" />
                      {printer.model} • {printer.ipAddress}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                  printer.status === 'IDLE' ? 'bg-[rgba(35,134,54,0.15)] text-[#3fb950] border border-[#3fb950]/30' :
                  printer.status === 'PRINTING' ? 'bg-[rgba(88,166,255,0.15)] text-[#58A6FF] border border-[#58A6FF]/30' :
                  printer.status === 'OUT_OF_PAPER' || printer.status === 'PAPER_JAM' ? 'bg-[rgba(210,153,34,0.15)] text-[#D29922] border border-[#D29922]/30' :
                  'bg-[rgba(248,81,73,0.15)] text-[#F85149] border border-[#F85149]/30'
                }`}>
                  {printer.status}
                </span>
              </div>

              {/* Location Tag */}
              <div className="p-2.5 rounded-lg bg-[#0B0E14] border border-[#30363D] flex items-center gap-2 text-xs text-[#C9D1D9]">
                <MapPin className="w-3.5 h-3.5 text-[#58A6FF] shrink-0" />
                <span className="truncate">{printer.location}</span>
              </div>

              {/* Telemetry Bars: Paper & Toner */}
              <div className="grid grid-cols-2 gap-4">
                {/* Paper Level */}
                <div className="p-3 rounded-lg bg-[#0B0E14] border border-[#30363D] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8B949E] flex items-center gap-1">
                      <Layers className="w-3 h-3 text-[#8B949E]" /> Paper Tray
                    </span>
                    <span className={`font-mono font-bold ${isPaperLow ? 'text-[#D29922]' : 'text-[#C9D1D9]'}`}>
                      {printer.paperLevel}%
                    </span>
                  </div>
                  <div className="w-full bg-[#1C2128] h-2 rounded-full overflow-hidden border border-[#30363D]">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isPaperLow ? 'bg-[#D29922]' : 'bg-[#3fb950]'
                      }`}
                      style={{ width: `${printer.paperLevel}%` }}
                    ></div>
                  </div>
                </div>

                {/* Toner Level */}
                <div className="p-3 rounded-lg bg-[#0B0E14] border border-[#30363D] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8B949E] flex items-center gap-1">
                      <Droplet className="w-3 h-3 text-[#58A6FF]" /> Toner Cartridge
                    </span>
                    <span className={`font-mono font-bold ${isTonerLow ? 'text-[#D29922]' : 'text-[#C9D1D9]'}`}>
                      {printer.tonerLevel}%
                    </span>
                  </div>
                  <div className="w-full bg-[#1C2128] h-2 rounded-full overflow-hidden border border-[#30363D]">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isTonerLow ? 'bg-[#D29922]' : 'bg-[#58A6FF]'
                      }`}
                      style={{ width: `${printer.tonerLevel}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Supported Media Formats & Printed Stats */}
              <div className="flex items-center justify-between text-[11px] text-[#8B949E] pt-1">
                <span>Formats: {printer.supportedFormats.join(', ')}</span>
                <span className="font-mono text-[#C9D1D9] font-semibold">
                  {printer.totalPagesPrinted.toLocaleString()} pgs printed
                </span>
              </div>

              {/* Action Buttons & Maintenance */}
              <div className="pt-2 border-t border-[#30363D] flex flex-wrap items-center justify-between gap-2">
                {/* Launch Kiosk Button */}
                <button
                  onClick={() => onOpenKioskForPrinter(printer)}
                  disabled={!printer.isOnline}
                  className={`px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                    printer.isOnline
                      ? 'bg-[#58A6FF] hover:bg-[#79B8FF] text-[#0B0E14] shadow-md shadow-[#58A6FF]/20'
                      : 'bg-[#1C2128] text-[#8B949E] cursor-not-allowed border border-[#30363D]'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Open Touchscreen Kiosk</span>
                </button>

                {/* Maintenance Tools */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onPrinterAction(printer.id, 'REFILL_PAPER')}
                    className="p-2 rounded-lg bg-[#1C2128] hover:bg-[#30363D] text-[#C9D1D9] hover:text-[#3fb950] text-xs transition-colors cursor-pointer border border-[#30363D]"
                    title="Refill Paper Tray to 100%"
                  >
                    <Layers className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onPrinterAction(printer.id, 'REPLACE_TONER')}
                    className="p-2 rounded-lg bg-[#1C2128] hover:bg-[#30363D] text-[#C9D1D9] hover:text-[#58A6FF] text-xs transition-colors cursor-pointer border border-[#30363D]"
                    title="Replace Toner Cartridge (100%)"
                  >
                    <Droplet className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onPrinterAction(printer.id, 'TOGGLE_ONLINE')}
                    className={`p-2 rounded-lg transition-colors cursor-pointer border ${
                      printer.isOnline
                        ? 'bg-[#1C2128] hover:bg-[rgba(248,81,73,0.15)] text-[#C9D1D9] hover:text-[#F85149] border-[#30363D] hover:border-[#F85149]/40'
                        : 'bg-[rgba(35,134,54,0.15)] text-[#3fb950] border-[#3fb950]/30 hover:bg-[rgba(35,134,54,0.25)]'
                    }`}
                    title={printer.isOnline ? 'Set Station Offline' : 'Bring Station Online'}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
