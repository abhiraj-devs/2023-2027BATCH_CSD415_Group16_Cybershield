import React, { useState, useEffect } from "react";
import { FileText, ShieldAlert, Bug, RefreshCw, Layers } from "lucide-react";
import { PhishingScan, MalwareScan } from "../types";
import { fetchPhishingHistory, fetchMalwareHistory } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function HistoryView() {
  const { user } = useAuth();
  const [phishingHistory, setPhishingHistory] = useState<PhishingScan[]>([]);
  const [malwareHistory, setMalwareHistory] = useState<MalwareScan[]>([]);
  const [activeTab, setActiveTab] = useState<"phishing" | "malware">("phishing");
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    if (!user?.email) {
      setPhishingHistory([]);
      setMalwareHistory([]);
      return;
    }
    setLoading(true);
    try {
      const [phish, mal] = await Promise.all([
        fetchPhishingHistory(user.email),
        fetchMalwareHistory(user.email),
      ]);
      setPhishingHistory(phish || []);
      setMalwareHistory(mal || []);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
              <FileText size={22} className="text-blue-400" />
              <span>Forensic Audit & Scan Logs</span>
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
              AUDIT TRAILS
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {user?.email
              ? `Personal audit logs recorded for authenticated operator ${user.email}.`
              : "Sign in to access immutable forensic audit logs and historical scan records."}
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading || !user}
          className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-mono border border-zinc-200 dark:border-zinc-800 flex items-center space-x-1.5 transition-colors disabled:opacity-50 cursor-pointer w-fit"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          <span>SYNC LOGS</span>
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center space-x-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab("phishing")}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
            activeTab === "phishing"
              ? "bg-emerald-600 text-white font-semibold"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <Layers size={14} />
          <span>Phishing URL Audits ({phishingHistory.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("malware")}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
            activeTab === "malware"
              ? "bg-amber-600 text-white font-semibold"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <Bug size={14} />
          <span>Malware Payload Audits ({malwareHistory.length})</span>
        </button>
      </div>

      {/* Log Feed */}
      <div className="space-y-3">
        {activeTab === "phishing" && (
          <div className="space-y-3">
            {phishingHistory.map((scan) => (
              <div
                key={scan.id}
                className="p-4 rounded-xl bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      scan.classification === "PHISHING" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                      scan.classification === "SUSPICIOUS" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-400"
                    }`}>
                      {scan.classification}
                    </span>
                    <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-md">
                      {scan.url}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs font-mono">
                    <span className="text-zinc-500">{new Date(scan.scannedAt).toLocaleString()}</span>
                    <span className="font-bold text-zinc-300">{scan.riskScore}/100</span>
                  </div>
                </div>
                {scan.aiExplanation && (
                  <p className="text-xs text-zinc-500 font-sans leading-relaxed pt-1">
                    {scan.aiExplanation}
                  </p>
                )}
              </div>
            ))}
            {phishingHistory.length === 0 && (
              <div className="p-8 text-center text-xs text-zinc-500 font-mono bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 rounded-xl">
                {user ? "No phishing scan records found for this account." : "Please sign in to view personal scan audit logs."}
              </div>
            )}
          </div>
        )}

        {activeTab === "malware" && (
          <div className="space-y-3">
            {malwareHistory.map((scan) => (
              <div
                key={scan.id}
                className="p-4 rounded-xl bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      scan.malicious ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-emerald-500/10 text-emerald-400"
                    }`}>
                      {scan.malicious ? "MALICIOUS" : "BENIGN"}
                    </span>
                    <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {scan.filename}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs font-mono">
                    <span className="text-zinc-500">{new Date(scan.scannedAt).toLocaleString()}</span>
                    <span className="text-rose-400 font-bold">{scan.detectionCount} / {scan.totalEngines} Flagged</span>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-zinc-500 truncate">
                  SHA-256: {scan.sha256}
                </div>
              </div>
            ))}
            {malwareHistory.length === 0 && (
              <div className="p-8 text-center text-xs text-zinc-500 font-mono bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 rounded-xl">
                {user ? "No malware scan records found for this account." : "Please sign in to view personal scan audit logs."}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
