import React from 'react';
import { 
  BarChart3, 
  Leaf, 
  ShieldCheck, 
  Printer as PrinterIcon, 
  FileText, 
  Download, 
  Layers, 
  Sparkles, 
  TrendingUp, 
  PieChart,
  CheckCircle2,
  TreePine,
  DollarSign
} from 'lucide-react';
import { PrintJob, Printer, SystemStats } from '../types/index.js';

interface ReportsViewProps {
  stats: SystemStats | null;
  jobs: PrintJob[];
  printers: Printer[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ stats, jobs, printers }) => {
  const completedJobs = jobs.filter((j) => j.status === 'COMPLETED');
  const expiredJobs = jobs.filter((j) => j.status === 'EXPIRED');
  
  const totalPagesCompleted = completedJobs.reduce((acc, j) => acc + j.pageCount * j.copies, 0);
  const totalPagesSavedFromExpired = expiredJobs.reduce((acc, j) => acc + j.pageCount * j.copies, 0);
  const paperWastePreventedKg = (totalPagesSavedFromExpired * 0.005).toFixed(2);
  const costSavedDollars = (totalPagesSavedFromExpired * 0.08).toFixed(2);

  const colorJobs = completedJobs.filter((j) => j.colorMode === 'color').length;
  const monoJobs = completedJobs.filter((j) => j.colorMode === 'monochrome').length;
  const dlpIntercepted = jobs.filter((j) => j.aiSensitiveDetected).length;

  const downloadReportSummary = () => {
    const reportText = `PRINTSAFE ENTERPRISE PRINT MANAGEMENT REPORT
===================================================
Generated At: ${new Date().toISOString()}
Compliance Standard: Zero-Trust Document Architecture & DoD 5220.22-M
AI Engine: Gemini 3.7 Flash DLP Classifier

1. VOLUME & TRAFFIC SUMMARY
- Total Print Jobs Processed: ${jobs.length}
- Completed & Authenticated: ${completedJobs.length}
- Auto-Expired (Zero Unattended Prints): ${expiredJobs.length}
- Total Physical Pages Printed: ${totalPagesCompleted}
- Total Pages Prevented from Waste: ${totalPagesSavedFromExpired}

2. ENVIRONMENTAL & COST SAVINGS
- Paper Saved: ${paperWastePreventedKg} kg
- Estimated Operational Cost Saved: $${costSavedDollars}

3. CYBERSECURITY & DLP COMPLIANCE
- Sensitive / PII Documents Intercepted: ${dlpIntercepted}
- Brute Force Lockouts Triggered: ${stats?.securityThreatsBlocked ?? 0}
- Volatile Memory Zeroization Rate: 100%

4. HARDWARE FLEET STATUS
${printers.map((p) => `- ${p.name} (${p.location}): Status: ${p.status}, Lifetime Pages: ${p.totalPagesPrinted}`).join('\n')}
===================================================
End of Report`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PrintSafe_Security_Report_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#161B22] border border-[#30363D] shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#58A6FF]" />
            <span>Printing Analytics, Cost & Sustainability Reports</span>
          </h2>
          <p className="text-xs text-[#8B949E] mt-1">
            Data insights on print volume, security tier distribution, and environmental savings from eliminated abandoned print jobs
          </p>
        </div>

        <button
          onClick={downloadReportSummary}
          className="px-4 py-2 rounded-lg bg-[#58A6FF] hover:bg-[#79B8FF] text-[#0B0E14] text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-md shadow-[#58A6FF]/20"
        >
          <Download className="w-4 h-4" />
          <span>Download Executive Report</span>
        </button>
      </div>

      {/* Sustainability & Environmental Impact Hero Block */}
      <div className="p-6 rounded-2xl bg-[#161B22] border border-[#30363D] shadow-lg space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[rgba(35,134,54,0.2)] text-[#3fb950] flex items-center justify-center">
            <TreePine className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Sustainability Impact: The "Zero-Abandoned Prints" Dividend</h3>
            <p className="text-xs text-[#3fb950]">
              By requiring OTP authentication at the printer, PrintSafe eliminates forgotten and unclaimed prints in output trays.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-[#0B0E14] border border-[#30363D] space-y-1">
            <span className="text-xs text-[#8B949E] flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#3fb950]" /> Pages Saved from Waste
            </span>
            <p className="text-2xl font-black text-white font-mono">{totalPagesSavedFromExpired} Pages</p>
            <p className="text-[11px] text-[#3fb950]">Uncollected jobs auto-purged</p>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0E14] border border-[#30363D] space-y-1">
            <span className="text-xs text-[#8B949E] flex items-center gap-1">
              <Leaf className="w-3.5 h-3.5 text-[#3fb950]" /> Paper Biomass Preserved
            </span>
            <p className="text-2xl font-black text-[#3fb950] font-mono">{paperWastePreventedKg} kg</p>
            <p className="text-[11px] text-[#8B949E]">Direct paper pulp savings</p>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0E14] border border-[#30363D] space-y-1">
            <span className="text-xs text-[#8B949E] flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-[#58A6FF]" /> Budget Savings
            </span>
            <p className="text-2xl font-black text-[#58A6FF] font-mono">${costSavedDollars}</p>
            <p className="text-[11px] text-[#8B949E]">Paper + toner consumables</p>
          </div>
        </div>
      </div>

      {/* Analytics Visual Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Color vs Mono Distribution */}
        <div className="p-6 rounded-2xl bg-[#161B22] border border-[#30363D] shadow-lg space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#58A6FF]" />
            <span>Color vs Monochrome Ratio</span>
          </h3>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#C9D1D9]">Color Printing</span>
                <span className="font-mono text-[#58A6FF]">{colorJobs} jobs ({Math.round((colorJobs / (completedJobs.length || 1)) * 100)}%)</span>
              </div>
              <div className="w-full bg-[#0B0E14] h-3 rounded-full overflow-hidden border border-[#30363D]">
                <div
                  className="bg-[#58A6FF] h-full rounded-full"
                  style={{ width: `${Math.round((colorJobs / (completedJobs.length || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#C9D1D9]">Monochrome Printing</span>
                <span className="font-mono text-[#3fb950]">{monoJobs} jobs ({Math.round((monoJobs / (completedJobs.length || 1)) * 100)}%)</span>
              </div>
              <div className="w-full bg-[#0B0E14] h-3 rounded-full overflow-hidden border border-[#30363D]">
                <div
                  className="bg-[#3fb950] h-full rounded-full"
                  style={{ width: `${Math.round((monoJobs / (completedJobs.length || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Security & DLP Classification */}
        <div className="p-6 rounded-2xl bg-[#161B22] border border-[#30363D] shadow-lg space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#D29922]" />
            <span>Document Security Tiers & DLP Health</span>
          </h3>

          <div className="space-y-2.5 pt-1">
            <div className="p-3 rounded-xl bg-[#0B0E14] border border-[#30363D] flex items-center justify-between text-xs">
              <span className="text-[#C9D1D9]">Standard Tier</span>
              <span className="font-mono font-bold text-[#3fb950]">{jobs.filter((j) => j.securityTier === 'STANDARD').length} Docs</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0B0E14] border border-[#30363D] flex items-center justify-between text-xs">
              <span className="text-[#C9D1D9]">Confidential Tier</span>
              <span className="font-mono font-bold text-[#D29922]">{jobs.filter((j) => j.securityTier === 'CONFIDENTIAL').length} Docs</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0B0E14] border border-[#30363D] flex items-center justify-between text-xs">
              <span className="text-[#C9D1D9]">Restricted / Top Secret</span>
              <span className="font-mono font-bold text-[#F85149]">{jobs.filter((j) => j.securityTier === 'RESTRICTED').length} Docs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
