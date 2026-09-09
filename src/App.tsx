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
import TrainingView from "./components/TrainingView";
import { DashboardSummary, SecurityAlert, NetworkEvent, ThreatItem } from "./types";
import { fetchDashboardSummary, fetchAlerts, fetchNetworkEvents, fetchThreatIntel } from "./services/api";
import { AuthProvider } from "./context/AuthContext";

function MainApp() {
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
        />
      )}
      {activeTab === "phishing" && <PhishingView />}
      {activeTab === "malware" && <MalwareView />}
      {activeTab === "vulnerabilityScanner" && <VulnerabilityScannerView />}
      {activeTab === "network" && <NetworkView />}
      {activeTab === "threatIntel" && <ThreatIntelView searchQuery={searchQuery} />}
      {activeTab === "alerts" && <AlertsView />}
      {activeTab === "history" && <HistoryView />}
      {activeTab === "training" && <TrainingView />}
      {activeTab === "profile" && <ProfileSettingsView />}
      {activeTab === "settings" && <SettingsView />}
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
