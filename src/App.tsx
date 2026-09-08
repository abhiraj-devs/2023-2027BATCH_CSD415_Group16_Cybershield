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
import ProfileSettingsView from "./components/ProfileSettingsView";
import EnterpriseRiskView from "./components/EnterpriseRiskView";
import TrainingView from "./components/TrainingView";
import { DashboardSummary, SecurityAlert, NetworkEvent, ThreatItem } from "./types";
import { fetchDashboardSummary, fetchAlerts, fetchNetworkEvents, fetchThreatIntel } from "./services/api";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [networkEvents, setNetworkEvents] = useState<NetworkEvent[]>([]);
  const [threatIntel, setThreatIntel] = useState<ThreatItem[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [runTour, setRunTour] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const loadAppData = async () => {
    try {
      const [sumData, alertData, netData, tiData] = await Promise.all([
        fetchDashboardSummary(),
        fetchAlerts(),
        fetchNetworkEvents(),
        fetchThreatIntel(),
      ]);
      setSummary(sumData);
      setAlerts(alertData);
      setNetworkEvents(netData);
      setThreatIntel(tiData);
    } catch (err) {
      console.error("Failed to load app data:", err);
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
        />
      )}
      {activeTab === "phishing" && <PhishingView />}
      {activeTab === "malware" && <MalwareView />}
      {activeTab === "vulnerabilityScanner" && <VulnerabilityScannerView />}
      {activeTab === "network" && <NetworkView />}
      {activeTab === "threatIntel" && <ThreatIntelView searchQuery={searchQuery} />}
      {activeTab === "alerts" && <AlertsView />}
      {activeTab === "history" && <HistoryView />}
      {activeTab === "risk" && <EnterpriseRiskView />}
      {activeTab === "training" && <TrainingView />}
      {activeTab === "profile" && <ProfileSettingsView />}
      {activeTab === "settings" && <SettingsView />}
    </Layout>
  );
}
