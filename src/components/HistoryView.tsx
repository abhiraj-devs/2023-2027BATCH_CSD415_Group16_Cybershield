import React, { useState, useEffect } from "react";
import { FileText, Search, ShieldAlert, Bug, RefreshCw } from "lucide-react";
import { PhishingScan, MalwareScan } from "../types";
import { fetchPhishingHistory, fetchMalwareHistory } from "../services/api";

export default function HistoryView() {
  const [phishingHistory, setPhishingHistory] = useState<PhishingScan[]>([]);
  const [malwareHistory, setMalwareHistory] = useState<MalwareScan[]>([]);
  const [activeTab, setActiveTab] = useState<'phishing' | 'malware'>('phishing');
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [phish, mal] = await Promise.all([
        fetchPhishingHistory(),
        fetchMalwareHistory()
      ]);
      setPhishingHistory(phish);
      setMalwareHistory(mal);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-md bg-[#111111] border border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 flex items-center space-x-2">
            <FileText size={20} className="text-zinc-400" />
            <span>Audit & Scan History</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Historical logs of all phishing and malware analyses.
          </p>
        </div>

        <button 
          onClick={loadData}
          disabled={loading}
          className="flex items-center space-x-2 text-[10px] font-mono text-zinc-400 px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 uppercase tracking-wider transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          <span>SYNC LOGS</span>
        </button>
      </div>

      <div className="p-6 rounded-md bg-[#111111] border border-zinc-800 space-y-4">
        {/* Tabs */}
        <div className="flex space-x-4 border-b border-zinc-800 pb-4">
          <button
            onClick={() => setActiveTab('phishing')}
            className={`px-4 py-2 rounded text-xs font-bold font-mono tracking-wider transition-colors flex items-center space-x-2 ${
              activeTab === 'phishing' 
                ? 'bg-zinc-100 text-zinc-950' 
                : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <ShieldAlert size={14} />
            <span>PHISHING LOGS</span>
          </button>
          <button
            onClick={() => setActiveTab('malware')}
            className={`px-4 py-2 rounded text-xs font-bold font-mono tracking-wider transition-colors flex items-center space-x-2 ${
              activeTab === 'malware' 
                ? 'bg-zinc-100 text-zinc-950' 
                : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Bug size={14} />
            <span>MALWARE LOGS</span>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-x-auto">
          {activeTab === 'phishing' ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  <th className="py-3 px-4 font-normal">Target URL</th>
                  <th className="py-3 px-4 font-normal">Classification</th>
                  <th className="py-3 px-4 font-normal">Risk</th>
                  <th className="py-3 px-4 font-normal">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 text-xs font-mono">
                {phishingHistory.map((scan) => (
                  <tr key={scan.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3 px-4 text-zinc-300 truncate max-w-sm">{scan.url}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        scan.classification === 'PHISHING' ? 'text-red-500 bg-red-500/10' :
                        scan.classification === 'SUSPICIOUS' ? 'text-orange-500 bg-orange-500/10' :
                        'text-blue-500 bg-blue-500/10'
                      }`}>
                        {scan.classification}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-zinc-100">{scan.riskScore}</td>
                    <td className="py-3 px-4 text-[10px] text-zinc-600">{new Date(scan.scannedAt).toLocaleString()}</td>
                  </tr>
                ))}
                {phishingHistory.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-zinc-500">No phishing logs found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  <th className="py-3 px-4 font-normal">File / Hash</th>
                  <th className="py-3 px-4 font-normal">Status</th>
                  <th className="py-3 px-4 font-normal">Detection</th>
                  <th className="py-3 px-4 font-normal">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 text-xs font-mono">
                {malwareHistory.map((scan) => (
                  <tr key={scan.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="text-zinc-300 truncate max-w-sm">{scan.fileName}</div>
                      <div className="text-[10px] text-zinc-600 truncate max-w-sm">{scan.fileHash}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        scan.status === 'MALICIOUS' ? 'text-red-500 bg-red-500/10' :
                        scan.status === 'SUSPICIOUS' ? 'text-orange-500 bg-orange-500/10' :
                        'text-blue-500 bg-blue-500/10'
                      }`}>
                        {scan.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-zinc-100">{scan.enginesDetected}</span>
                      <span className="text-zinc-500">/{scan.enginesTotal}</span>
                    </td>
                    <td className="py-3 px-4 text-[10px] text-zinc-600">{new Date(scan.scannedAt).toLocaleString()}</td>
                  </tr>
                ))}
                {malwareHistory.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-zinc-500">No malware logs found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
