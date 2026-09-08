import React, { useState } from "react";
import { 
  Cpu, Activity, Globe, Bug, Bell, FileText, Settings, Search, Menu, X, ShieldAlert, Radio, ShieldCheck, Sun, Moon, User, LogOut, Briefcase, BookOpen
} from "lucide-react";

interface LayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  systemStatus: string;
  criticalAlertsCount: number;
  isDarkMode: boolean;
  toggleTheme: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  children: React.ReactNode;
  onLogout: () => void;
}

export default function Layout({ 
  activeTab, setActiveTab, systemStatus, criticalAlertsCount, isDarkMode, toggleTheme, searchQuery, setSearchQuery, children, onLogout
}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Activity },
    { id: "phishing", label: "Phishing Detection", icon: ShieldAlert },
    { id: "malware", label: "Malware Scanner", icon: Bug },
    { id: "vulnerabilityScanner", label: "Vulnerability Scanner", icon: ShieldCheck },
    { id: "network", label: "Network Monitor", icon: Radio },
    { id: "threatIntel", label: "Threat Intelligence", icon: Globe },
    { id: "alerts", label: "Alert Center", icon: Bell, badge: criticalAlertsCount > 0 ? criticalAlertsCount : null },
    { id: "history", label: "Scan History", icon: FileText },
    { id: "risk", label: "Enterprise Risk", icon: Briefcase },
    { id: "training", label: "Security Training", icon: BookOpen },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="h-screen w-screen flex bg-[#030303] text-zinc-300 font-sans overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - Sharp, no glow */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 border-r border-zinc-800/80 flex flex-col bg-[#050505] transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center space-x-3 px-6 h-16 border-b border-zinc-800/80 shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500/20 to-blue-600/20 border border-emerald-500/30 flex items-center justify-center rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
              <path d="M12 2L3 7v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400 drop-shadow-md" />
              <path d="M12 11v4M9 9l2 1.5M15 9l-2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-blue-400" />
              <circle cx="12" cy="11" r="1.5" fill="currentColor" className="text-zinc-100" />
            </svg>
          </div>
          <span className="font-bold text-sm tracking-wide text-zinc-100">CYBERSHIELD AI</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
                  isActive 
                    ? 'bg-zinc-900 text-zinc-100 border border-zinc-800' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50 border border-transparent'
                }`}
              >
                <Icon size={16} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 bg-zinc-100 text-zinc-950 text-[10px] font-bold rounded-sm">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-zinc-800/80 shrink-0">
           <button onClick={() => setActiveTab('profile')} className="flex items-center space-x-3 w-full p-2 rounded-md hover:bg-zinc-900 transition-colors">
              <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">A</div>
              <div className="text-left flex-1">
                 <p className="text-xs font-bold text-zinc-200">Analyst</p>
                 <p className="text-[10px] text-zinc-500">SOC Level 1</p>
              </div>
           </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-[#030303]">
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-800/80 flex items-center justify-between px-4 sm:px-6 shrink-0 bg-[#050505]">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-zinc-500 hover:text-zinc-300"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-zinc-500">
               <span className="uppercase tracking-wider">Status:</span>
               <div className="flex items-center space-x-1.5 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded">
                 <div className={`w-1.5 h-1.5 rounded-full ${
                  (systemStatus === 'Alert' || systemStatus === 'Compromised' || systemStatus === 'Elevated Threat Activity') ? 'animate-pulse' : ''
                 } ${
                  systemStatus === 'Operational' ? 'bg-emerald-500' : 
                  systemStatus === 'Elevated Threat Activity' ? 'bg-amber-500' : 'bg-red-500'
                 }`} />
                 <span className="text-zinc-300">{systemStatus}</span>
               </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-2 text-zinc-600 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search queries..."
                className="bg-zinc-900 border border-zinc-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 font-mono w-64 transition-colors"
              />
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}

