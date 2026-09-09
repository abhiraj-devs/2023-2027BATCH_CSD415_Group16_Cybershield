import React, { useState } from 'react';
import { Settings, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import CyberShieldLogo from './CyberShieldLogo';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  systemStatus: string;
  criticalAlertsCount?: number;
  isDarkMode?: boolean;
  toggleTheme?: () => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  onLogout?: () => void;
  onRunAudit?: () => void;
  onClearHistory?: () => void;
}

export default function Layout({ 
  children, 
  activeTab, 
  setActiveTab, 
  systemStatus,
  criticalAlertsCount,
  searchQuery: externalSearchQuery,
  setSearchQuery: setExternalSearchQuery,
}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, isAdmin, emailVerified } = useAuth();

  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const setSearchQuery = setExternalSearchQuery || setInternalSearchQuery;

  const navItems: { id: string; label: string; badge?: string }[] = [
    { id: 'dashboard', label: 'SOC Dashboard' },
    { id: 'phishing', label: 'Phishing Detection' },
    { id: 'malware', label: 'Malware Forensics' },
    { id: 'network', label: 'Network Telemetry' },
    { id: 'threat-intel', label: 'Threat Intelligence' },
    { id: 'alerts', label: 'Security Alerts' },
    { id: 'training', label: 'Security Training' },
    { id: 'profile', label: 'Operator Identity' },
  ];

  return (
    <div className="flex h-screen bg-[#030303] text-zinc-100 font-sans antialiased overflow-hidden selection:bg-zinc-800 selection:text-zinc-200">
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 max-w-[85vw] bg-[#080808] border-r border-zinc-800/80 flex flex-col justify-between
        transform transition-transform duration-200 ease-in-out shadow-2xl lg:shadow-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 shrink-0 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <CyberShieldLogo className="w-8 h-8 shrink-0 drop-shadow-[0_0_8px_rgba(0,210,255,0.4)]" />
             <div>
               <h1 className="text-sm font-bold tracking-tight text-zinc-100">CyberShield</h1>
               <p className="text-[10px] text-zinc-500 font-mono">Real-Time Threat Intelligence</p>
             </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center px-3 py-2.5 rounded-md transition-colors text-sm font-medium cursor-pointer ${
                  isActive 
                    ? 'bg-zinc-900 text-zinc-100 border border-zinc-800' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50 border border-transparent'
                }`}
              >
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
        
        {/* User container */}
        <div className="p-4 border-t border-zinc-800/80 shrink-0 flex items-center justify-between gap-2">
          {user ? (
            <button 
              onClick={() => { setActiveTab('profile'); setSidebarOpen(false); }} 
              className="flex items-center space-x-2.5 flex-1 min-w-0 p-1.5 rounded-md hover:bg-zinc-900 transition-colors text-left cursor-pointer"
            >
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || "User"} 
                  className="w-8 h-8 rounded-full border border-zinc-700 shrink-0 object-cover" 
                  referrerPolicy="no-referrer" 
                />
              ) : (
                <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 shrink-0 font-mono">
                  {user.email ? user.email.charAt(0).toUpperCase() : "U"}
                </div>
              )}
              <div className="text-left flex-1 min-w-0">
                <p className="text-xs font-bold text-zinc-200 truncate">
                  {user.displayName || user.email?.split('@')[0] || "Operator"}
                </p>
                <div className="flex items-center space-x-1">
                  <span className={`text-[10px] font-mono font-bold ${isAdmin ? 'text-emerald-400' : 'text-blue-400'}`}>
                    {isAdmin ? 'Admin' : 'User'}
                  </span>
                  {!emailVerified && (
                    <span className="text-[9px] text-amber-400 font-mono" title="Email verification pending">
                      • Unverified
                    </span>
                  )}
                </div>
              </div>
            </button>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center justify-center flex-1 min-w-0 px-2.5 py-2 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium transition-colors cursor-pointer"
            >
              <span className="truncate">Sign In</span>
            </button>
          )}

          <button
            id="sidebar-settings-btn"
            onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}
            title="Settings"
            aria-label="Settings"
            className={`p-2 rounded-md transition-colors shrink-0 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-zinc-900 text-zinc-100 border border-zinc-800'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 border border-transparent'
            }`}
          >
            <Settings size={18} />
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-[#030303]">
        {/* Top Header */}
        <header className="h-14 sm:h-16 border-b border-zinc-800/80 flex items-center justify-between px-3 sm:px-6 shrink-0 bg-[#050505]">
          <div className="flex items-center space-x-2.5 sm:space-x-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 -ml-1 rounded-md text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center shrink-0"
              aria-label="Toggle menu"
            >
              <Menu size={18} />
            </button>
            
            {/* Mobile Header Brand */}
            <div className="flex items-center space-x-2 lg:hidden">
              <CyberShieldLogo className="w-6 h-6 shrink-0 drop-shadow-[0_0_6px_rgba(0,210,255,0.4)]" />
              <span className="text-xs font-bold font-mono tracking-tight text-zinc-100">CyberShield</span>
            </div>

            {/* Status indicator */}
            <div className="flex items-center space-x-1.5 text-xs font-mono text-zinc-500">
               <span className="uppercase tracking-wider hidden sm:inline">Status:</span>
               <div className="flex items-center space-x-1.5 px-2 py-0.5 sm:py-1 bg-zinc-900 border border-zinc-800 rounded">
                 <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  (systemStatus === 'Alert' || systemStatus === 'Compromised' || systemStatus === 'Elevated Threat Activity') ? 'animate-pulse' : ''
                 } ${
                  systemStatus === 'Operational' ? 'bg-emerald-500' : 
                  systemStatus === 'Elevated Threat Activity' ? 'bg-amber-500' : 'bg-red-500'
                 }`} />
                 <span className="text-zinc-300 text-[11px] sm:text-xs truncate max-w-[85px] sm:max-w-none">{systemStatus}</span>
               </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="relative hidden md:block">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search queries..."
                className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 font-mono w-48 lg:w-64 transition-colors"
              />
            </div>

            {/* Auth Top Action */}
            {user ? (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer min-h-[36px]"
                title={user.email || ""}
              >
                <span className={`w-2 h-2 rounded-full ${emailVerified ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span className="font-mono text-[11px] font-bold">
                  {isAdmin ? 'Admin' : 'User'}
                </span>
              </button>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer min-h-[36px] flex items-center"
              >
                <span>Sign In</span>
              </button>
            )}
          </div>
        </header>

        {/* Email verification reminder banner if user logged in but unverified */}
        {user && !emailVerified && (
          <div className="bg-amber-950/40 border-b border-amber-800/50 px-3 sm:px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-amber-300 gap-2">
            <div className="flex items-start sm:items-center space-x-2">
              <span className="font-mono font-bold text-amber-400 shrink-0">[Verification Required]</span>
              <span className="break-all sm:break-normal">
                Verify <strong className="font-mono">{user.email}</strong> via email OTP.
              </span>
            </div>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="underline font-bold hover:text-amber-200 shrink-0 cursor-pointer self-end sm:self-auto"
            >
              Verify OTP
            </button>
          </div>
        )}

        {/* View Content */}
        <div className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
