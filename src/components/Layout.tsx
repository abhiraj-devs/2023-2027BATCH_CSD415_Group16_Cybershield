import React, { useState } from "react";
import { 
  ShieldAlert, 
  Layers, 
  Bug, 
  Activity, 
  Scan, 
  Globe, 
  Bell, 
  FileText, 
  Settings, 
  Sun, 
  Moon, 
  Search, 
  Menu, 
  X, 
  User as UserIcon,
  Radio,
  ExternalLink
} from "lucide-react";
import CyberShieldLogo from "./CyberShieldLogo";
import AuthModal from "./AuthModal";
import { useAuth } from "../context/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  systemStatus: string;
  criticalAlertsCount: number;
  isDarkMode: boolean;
  toggleTheme: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onLogout: () => void;
}

export default function Layout({
  children,
  activeTab,
  setActiveTab,
  systemStatus,
  criticalAlertsCount,
  isDarkMode,
  toggleTheme,
  searchQuery,
  setSearchQuery,
}: LayoutProps) {
  const { user, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "SOC Dashboard", icon: ShieldAlert, tourId: "nav-dashboard" },
    { id: "phishing", label: "Phishing Detection", icon: Layers, badge: "Dual-Engine", tourId: "nav-phishing" },
    { id: "malware", label: "Malware Scanner", icon: Bug, badge: "72 Engines", tourId: "nav-malware" },
    { id: "network", label: "Network Telemetry", icon: Activity, tourId: "nav-network" },
    { id: "vulnerabilityScanner", label: "Vulnerability Scanner", icon: Scan },
    { id: "threatIntel", label: "Threat Intelligence", icon: Globe },
    { id: "alerts", label: "Security Alerts", icon: Bell, count: criticalAlertsCount },
    { id: "history", label: "Audit & History", icon: FileText },
    { id: "settings", label: "System Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 h-14 bg-white/90 dark:bg-[#111111]/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <CyberShieldLogo />
        </div>

        {/* Status indicator & Search */}
        <div className="hidden sm:flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${
              systemStatus === "Operational" ? "bg-emerald-500 animate-pulse" :
              systemStatus === "Elevated Threat Activity" ? "bg-amber-500 animate-pulse" : "bg-rose-500 animate-ping"
            }`} />
            <span className="text-zinc-500 uppercase text-[10px]">GRID:</span>
            <span className={`font-semibold ${
              systemStatus === "Operational" ? "text-emerald-500" :
              systemStatus === "Elevated Threat Activity" ? "text-amber-500" : "text-rose-500"
            }`}>
              {systemStatus}
            </span>
          </div>

          <div className="relative w-48 lg:w-64">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search threat indicators..."
              className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-8 pr-3 py-1 text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs font-mono transition-colors"
          >
            <UserIcon size={14} className={user ? "text-emerald-400" : "text-zinc-500"} />
            <span className="hidden sm:inline font-semibold">
              {user ? (user.displayName || user.email?.split("@")[0] || "User") : "Sign In"}
            </span>
            {user && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                {isAdmin ? "ADMIN" : "ANALYST"}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-60 shrink-0 flex-col bg-white dark:bg-[#111111] border-r border-zinc-200 dark:border-zinc-800 p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-mono uppercase text-zinc-500 font-bold tracking-wider">
            SOC Operations
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                data-tour={item.tourId}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon size={16} className={isActive ? "text-emerald-500" : "text-zinc-500"} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                    {item.badge}
                  </span>
                )}
                {item.count && item.count > 0 ? (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500 text-white font-bold">
                    {item.count}
                  </span>
                ) : null}
              </button>
            );
          })}

          <div className="pt-4 mt-auto">
            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[10px] space-y-1 font-mono text-zinc-500">
              <div className="flex items-center justify-between">
                <span>Core Engine</span>
                <span className="text-emerald-500 font-bold">v2.1.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span>PhishGuard ML</span>
                <span className="text-zinc-400">235k Model</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-xs flex">
            <div className="w-64 bg-white dark:bg-[#111111] p-4 space-y-2 flex flex-col h-full border-r border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <CyberShieldLogo />
                <button onClick={() => setMobileMenuOpen(false)} className="p-1">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 pt-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium ${
                        isActive
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "text-zinc-400 hover:bg-zinc-900"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </div>
                      {item.count && item.count > 0 ? (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500 text-white font-bold">
                          {item.count}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
