import React, { useState, useEffect } from "react";
import Layout from "./components/Layout";
import DashboardView from "./components/DashboardView";
import GuidedTour from "./components/GuidedTour";
import PhishingView from "./components/PhishingView";
import MalwareView from "./components/MalwareView";
import VulnerabilityScannerView from "./components/VulnerabilityScannerView";
import NetworkView from "./components/NetworkView";
import ThreatIntelView from "./components/ThreatIntelView";
import AlertsView from "./components/AlertsView";
import HistoryView from "./components/HistoryView";
import SettingsView from "./components/SettingsView";
import { DashboardSummary, SecurityAlert, NetworkEvent, ThreatItem } from "./types";
import { fetchDashboardSummary, fetchAlerts, fetchNetworkEvents, fetchThreatIntel } from "./services/api";
import { AuthProvider } from "./context/AuthContext";

function MainApp() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [networkEvents, setNetworkEvents] = useState<NetworkEvent[]>([]);
  const [threatIntel, setThreatIntel] = useState<ThreatItem[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("cybershield_theme");
      if (saved !== null) {
        return saved === "dark";
      }
      return true; // Default to dark cybersecurity SOC theme
    } catch {
      return true;
    }
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [runTour] = useState(true);

  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add("dark");
        document.body.classList.add("dark");
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("cybershield_theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.body.classList.remove("dark");
        document.documentElement.setAttribute("data-theme", "light");
        localStorage.setItem("cybershield_theme", "light");
      }
    } catch (e) {
      console.warn("Theme toggle error:", e);
    }
  }, [isDarkMode]);

  const loadAppData = async () => {
    try {
      const [sumRes, alertRes, netRes, tiRes] = await Promise.allSettled([
        fetchDashboardSummary(),
        fetchAlerts(),
        fetchNetworkEvents(),
        fetchThreatIntel(),
      ]);

      if (sumRes.status === "fulfilled" && sumRes.value) {
        setSummary(sumRes.value);
      }
      if (alertRes.status === "fulfilled" && alertRes.value) {
        setAlerts(alertRes.value);
      }
      if (netRes.status === "fulfilled" && netRes.value) {
        setNetworkEvents(netRes.value);
      }
      if (tiRes.status === "fulfilled" && tiRes.value) {
        setThreatIntel(tiRes.value);
      }
    } catch (err) {
      console.warn("App data synchronization notice:", err);
    }
  };

  useEffect(() => {
    loadAppData();
    const interval = setInterval(loadAppData, 10000);
    return () => clearInterval(interval);
  }, []);

  const criticalAlertsCount = alerts.filter(a => !a.acknowledged && (a.severity === 'CRITICAL' || a.severity === 'HIGH')).length;

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      systemStatus={summary?.systemStatus || "Operational"}
      criticalAlertsCount={criticalAlertsCount}
      isDarkMode={isDarkMode}
      toggleTheme={() => setIsDarkMode(!isDarkMode)}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      onLogout={() => {}}
    >
      <GuidedTour run={runTour} />
      {activeTab === "dashboard" && (
        <DashboardView
          summary={summary}
          alerts={alerts}
          networkEvents={networkEvents}
          threatIntel={threatIntel}
          onNavigate={setActiveTab}
          onOpenQuickScan={() => window.dispatchEvent(new CustomEvent('open-quick-scan'))}
        />
      )}
      {activeTab === "phishing" && <PhishingView />}
      {activeTab === "malware" && <MalwareView />}
      {activeTab === "vulnerabilityScanner" && <VulnerabilityScannerView />}
      {activeTab === "network" && <NetworkView />}
      {activeTab === "threatIntel" && <ThreatIntelView searchQuery={searchQuery} />}
      {activeTab === "alerts" && <AlertsView />}
      {activeTab === "history" && <HistoryView />}
      {activeTab === "settings" && (
        <SettingsView 
          isDarkMode={isDarkMode} 
          onToggleTheme={() => setIsDarkMode(prev => !prev)} 
        />
      )}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
