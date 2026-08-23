import React from 'react';
import { 
  ShieldCheck, 
  Printer as PrinterIcon, 
  FileText, 
  Sliders, 
  ScrollText, 
  BarChart3, 
  Layers, 
  LogOut, 
  Terminal, 
  Sun, 
  Moon, 
  UserCheck, 
  Sparkles,
  RefreshCw,
  Info
} from 'lucide-react';
import { User } from '../types/index.js';

interface NavbarProps {
  currentUser: User | null;
  allUsers: User[];
  onSelectUser: (user: User) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenUpload: () => void;
  onOpenKiosk: () => void;
  onOpenArchInfo: () => void;
  onResetDemo: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  allUsers,
  onSelectUser,
  activeTab,
  setActiveTab,
  onOpenUpload,
  onOpenKiosk,
  onOpenArchInfo,
  onResetDemo,
  isDarkMode,
  setIsDarkMode,
}) => {
  const isAdminOrSec = currentUser?.role === 'admin' || currentUser?.role === 'security_officer';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#30363D] bg-[#161B22]/95 backdrop-blur-md text-[#C9D1D9] shadow-lg transition-colors">
      {/* Top Security Banner */}
      <div className="bg-[#0B0E14] px-4 py-1.5 text-xs text-[#8B949E] border-b border-[#30363D] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[#58A6FF] font-semibold uppercase tracking-wider text-[11px]">
            <span className="w-2 h-2 rounded-full bg-[#58A6FF] animate-pulse"></span>
            Zero-Trust Print Protection
          </span>
          <span className="text-[#30363D]">|</span>
          <span className="hidden sm:inline text-[#8B949E]">
            End-to-End Encrypted Queue • 6-Digit OTP / QR Authorization • AI DLP Active
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenArchInfo}
            className="text-[#58A6FF] hover:text-[#79B8FF] flex items-center gap-1 transition-colors text-xs font-medium cursor-pointer"
            title="View Security & Hardware Architecture"
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Architecture & Security Spec</span>
          </button>
          <button
            onClick={onResetDemo}
            className="text-[#8B949E] hover:text-[#D29922] flex items-center gap-1 transition-colors text-xs cursor-pointer"
            title="Reset system state to clean sample dataset"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-md bg-[#58A6FF] flex items-center justify-center shadow-md shadow-[#58A6FF]/20 group-hover:opacity-90 transition-opacity">
                <ShieldCheck className="w-5 h-5 text-[#0B0E14] stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold tracking-tight text-white font-sans">
                    PrintSafe
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[rgba(88,166,255,0.15)] text-[#58A6FF] border border-[#58A6FF]/30">
                    Enterprise
                  </span>
                </div>
                <p className="text-[11px] text-[#8B949E] hidden sm:block">Smart & Secure Print Management</p>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden lg:flex items-center gap-1 ml-6">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'dashboard'
                    ? 'bg-[rgba(88,166,255,0.1)] text-[#58A6FF] border border-[#58A6FF]/30 font-semibold'
                    : 'text-[#8B949E] hover:bg-[#1C2128] hover:text-[#C9D1D9]'
                }`}
              >
                <FileText className="w-4 h-4" />
                Print Queue
              </button>

              <button
                onClick={() => setActiveTab('printers')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'printers'
                    ? 'bg-[rgba(88,166,255,0.1)] text-[#58A6FF] border border-[#58A6FF]/30 font-semibold'
                    : 'text-[#8B949E] hover:bg-[#1C2128] hover:text-[#C9D1D9]'
                }`}
              >
                <PrinterIcon className="w-4 h-4" />
                Fleet Prtrs
              </button>

              {isAdminOrSec && (
                <>
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'admin'
                        ? 'bg-[rgba(88,166,255,0.1)] text-[#58A6FF] border border-[#58A6FF]/30 font-semibold'
                        : 'text-[#8B949E] hover:bg-[#1C2128] hover:text-[#C9D1D9]'
                    }`}
                  >
                    <Sliders className="w-4 h-4" />
                    Admin Governance
                  </button>

                  <button
                    onClick={() => setActiveTab('logs')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'logs'
                        ? 'bg-[rgba(88,166,255,0.1)] text-[#58A6FF] border border-[#58A6FF]/30 font-semibold'
                        : 'text-[#8B949E] hover:bg-[#1C2128] hover:text-[#C9D1D9]'
                    }`}
                  >
                    <ScrollText className="w-4 h-4" />
                    Audit Logs
                  </button>

                  <button
                    onClick={() => setActiveTab('reports')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'reports'
                        ? 'bg-[rgba(88,166,255,0.1)] text-[#58A6FF] border border-[#58A6FF]/30 font-semibold'
                        : 'text-[#8B949E] hover:bg-[#1C2128] hover:text-[#C9D1D9]'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Reports
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* Quick Action Buttons & Switchers */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Launch IoT Printer Terminal Simulator Button */}
            <button
              onClick={onOpenKiosk}
              className="relative px-3 py-1.5 rounded-md bg-[rgba(88,166,255,0.12)] hover:bg-[rgba(88,166,255,0.2)] border border-[#58A6FF]/40 text-[#58A6FF] text-xs sm:text-sm font-medium flex items-center gap-1.5 shadow-sm transition-all cursor-pointer group"
              title="Open the Virtual IoT Touchscreen Kiosk to test PIN/QR physical release"
            >
              <Terminal className="w-4 h-4 text-[#58A6FF] group-hover:animate-pulse" />
              <span>Printer Kiosk Simulator</span>
              <span className="w-2 h-2 rounded-full bg-[#58A6FF] animate-ping"></span>
            </button>

            {/* Quick Upload Button */}
            <button
              onClick={onOpenUpload}
              className="px-3.5 py-1.5 rounded-md bg-[#58A6FF] hover:bg-[#79B8FF] text-[#0B0E14] font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-[#58A6FF]/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Upload Document</span>
            </button>

            {/* Role Switcher Dropdown */}
            <div className="relative group">
              <div className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-md bg-[#161B22] border border-[#30363D] hover:border-[#8B949E] cursor-pointer transition-all">
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                  alt={currentUser?.name}
                  className="w-7 h-7 rounded-full object-cover border border-[#30363D]"
                />
                <div className="text-left hidden xl:block">
                  <p className="text-xs font-semibold text-[#C9D1D9] leading-tight">{currentUser?.name}</p>
                  <p className="text-[10px] text-[#58A6FF] font-mono capitalize">{currentUser?.role.replace('_', ' ')}</p>
                </div>
                <UserCheck className="w-3.5 h-3.5 text-[#8B949E]" />
              </div>

              {/* Fast User Switch Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#161B22] border border-[#30363D] shadow-2xl p-2 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-2 py-1.5 border-b border-[#30363D] mb-1">
                  <p className="text-[11px] font-semibold text-[#8B949E] uppercase tracking-wider">Fast Role Switcher</p>
                  <p className="text-[11px] text-[#8B949E]/80">Test different user permissions:</p>
                </div>
                <div className="space-y-1">
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => onSelectUser(u)}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-md text-left text-xs transition-colors cursor-pointer ${
                        currentUser?.id === u.id
                          ? 'bg-[rgba(88,166,255,0.15)] text-[#58A6FF] border border-[#58A6FF]/30'
                          : 'hover:bg-[#1C2128] text-[#C9D1D9]'
                      }`}
                    >
                      <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-[#C9D1D9]">{u.name}</p>
                        <p className="text-[10px] text-[#8B949E] capitalize">{u.role.replace('_', ' ')} • {u.department.split(' ')[0]}</p>
                      </div>
                      {currentUser?.id === u.id && (
                        <span className="w-2 h-2 rounded-full bg-[#58A6FF]"></span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden flex items-center gap-2 py-2 overflow-x-auto border-t border-[#30363D] text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-[rgba(88,166,255,0.15)] text-[#58A6FF] font-semibold' : 'text-[#8B949E]'
            }`}
          >
            Print Queue
          </button>
          <button
            onClick={() => setActiveTab('printers')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'printers' ? 'bg-[rgba(88,166,255,0.15)] text-[#58A6FF] font-semibold' : 'text-[#8B949E]'
            }`}
          >
            Printers
          </button>
          {isAdminOrSec && (
            <>
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-2.5 py-1 rounded whitespace-nowrap ${
                  activeTab === 'admin' ? 'bg-[rgba(88,166,255,0.15)] text-[#58A6FF] font-semibold' : 'text-[#8B949E]'
                }`}
              >
                Governance
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-2.5 py-1 rounded whitespace-nowrap ${
                  activeTab === 'logs' ? 'bg-[rgba(88,166,255,0.15)] text-[#58A6FF] font-semibold' : 'text-[#8B949E]'
                }`}
              >
                Audit Logs
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-2.5 py-1 rounded whitespace-nowrap ${
                  activeTab === 'reports' ? 'bg-[rgba(88,166,255,0.15)] text-[#58A6FF] font-semibold' : 'text-[#8B949E]'
                }`}
              >
                Reports
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
