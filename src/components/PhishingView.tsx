import React, { useState, useEffect } from "react";
import { 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  Cpu, 
  ThumbsUp, 
  ThumbsDown, 
  CloudLightning, 
  Layers, 
  CheckCheck, 
  Activity, 
  Globe, 
  ExternalLink,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";
import { PhishingScan, CrowdsourcedThreat } from "../types";
import { 
  analyzePhishingUrl, 
  fetchPhishingHistory, 
  fetchCrowdsourcedThreats, 
  verifyCrowdsourcedThreat, 
  discardCrowdsourcedThreat,
  fetchPhishGuardStatus
} from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function PhishingView() {
  const { user } = useAuth();
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<PhishingScan | null>(null);
  const [history, setHistory] = useState<PhishingScan[]>([]);
  const [crowdsourcedThreats, setCrowdsourcedThreats] = useState<CrowdsourcedThreat[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeEngineTab, setActiveEngineTab] = useState<"dual" | "engine1" | "engine2">("dual");
  const [engineStatus, setEngineStatus] = useState<{
    engine: string;
    endpoint: string;
    status: "ONLINE" | "OFFLINE";
    latencyMs?: number;
    dataset?: string;
  } | null>(null);

  useEffect(() => {
    fetchPhishingHistory().then(setHistory).catch(() => {});
    fetchCrowdsourcedThreats().then(setCrowdsourcedThreats).catch(() => {});
    fetchPhishGuardStatus().then(setEngineStatus).catch(() => {});
  }, []);

  const handleVerifyThreat = async (id: string) => {
    await verifyCrowdsourcedThreat(id);
    setCrowdsourcedThreats(prev => prev.filter(t => t.id !== id));
  };

  const handleDiscardThreat = async (id: string) => {
    await discardCrowdsourcedThreat(id);
    setCrowdsourcedThreats(prev => prev.filter(t => t.id !== id));
  };

  const handleAnalyze = async (e?: React.FormEvent, presetUrl?: string) => {
    if (e) e.preventDefault();
    const targetUrl = presetUrl !== undefined ? presetUrl : urlInput;
    if (!targetUrl.trim()) return;

    let isValid = true;
    try {
      new URL(targetUrl.trim().startsWith('http') ? targetUrl.trim() : `https://${targetUrl.trim()}`);
    } catch {
      isValid = false;
    }
    
    if (!isValid) {
      setError("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await analyzePhishingUrl(targetUrl.trim());
      setCurrentResult(data);
      const updatedHistory = await fetchPhishingHistory();
      setHistory(updatedHistory);
    } catch (err: any) {
      setError(err.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Two-Way Engine Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-6 rounded-md bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
              <span>Two-Way Phishing Detection Engine</span>
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider">
              Dual-Engine Active
            </span>
          </div>
        </div>

        {/* Engine 1 & 2 Live Badges */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 text-xs">
          <div className="flex items-center gap-2 px-3 py-2 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
              ENGINE 1: PhishGuard
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
              ENGINE 2: CyberShield
            </span>
          </div>
        </div>
      </div>

      {/* URL Input Form */}
      <div className="p-4 sm:p-6 rounded-md bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-4">
        <form onSubmit={(e) => handleAnalyze(e)} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full">
              <div className="absolute left-3 top-3.5 text-zinc-500">
                 <Search size={16} />
              </div>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter target URL (e.g., http://192.168.1.1/paypa1-update-security-login.php)..."
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded pl-10 pr-4 py-3 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto py-3 sm:py-0 sm:h-[46px] px-6 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 shrink-0 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>2-WAY SCANNING...</span>
                </>
              ) : (
                <>
                  <Layers size={14} />
                  <span>TWO-WAY SCAN</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-3 rounded bg-red-950/30 border border-red-900/50 text-red-500 text-xs flex items-center space-x-2 font-mono">
            <AlertTriangle size={14} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Analysis Result Section */}
      {currentResult && (
        <div className="space-y-6">
          {/* Two-Way Consensus Banner */}
          <div className={`p-4 sm:p-5 rounded-md border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
            currentResult.dualEngine?.consensus.finalVerdict === 'CONFIRMED_PHISHING'
              ? 'bg-red-950/20 border-red-500/30 text-red-300'
              : currentResult.dualEngine?.consensus.finalVerdict === 'SUSPICIOUS'
              ? 'bg-orange-950/20 border-orange-500/30 text-orange-300'
              : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
          }`}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {currentResult.dualEngine?.consensus.finalVerdict === 'CONFIRMED_PHISHING' ? (
                  <ShieldAlert className="w-6 h-6 text-red-500" />
                ) : currentResult.dualEngine?.consensus.finalVerdict === 'SUSPICIOUS' ? (
                  <AlertTriangle className="w-6 h-6 text-orange-400" />
                ) : (
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold tracking-wide uppercase font-mono">
                    {currentResult.dualEngine?.consensus.finalVerdict ? currentResult.dualEngine.consensus.finalVerdict.replace('_', ' ') : currentResult.classification}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    currentResult.dualEngine?.consensus.agreement === 'FULL_AGREEMENT'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                  }`}>
                    {currentResult.dualEngine?.consensus.agreement === 'FULL_AGREEMENT' ? 'Two-Way Agreement: Full Consensus' : 'Two-Way Checking: Discordant Check'}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                  {currentResult.dualEngine?.consensus.description || currentResult.aiExplanation}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 border-t md:border-t-0 md:border-l border-zinc-700/50 pt-3 md:pt-0 md:pl-6">
              <div className="text-center">
                <div className="text-2xl font-bold font-mono text-zinc-100">
                  {currentResult.riskScore}/100
                </div>
                <div className="text-[10px] font-mono uppercase text-zinc-400">Combined Risk</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold font-mono text-zinc-100">
                  {(currentResult.confidence * 100).toFixed(0)}%
                </div>
                <div className="text-[10px] font-mono uppercase text-zinc-400">Confidence</div>
              </div>
            </div>
          </div>

          {/* Dual Engine Side-by-Side Comparison Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ENGINE 1: PhishGuard */}
            <div className="p-6 rounded-md bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <div className="flex items-center space-x-2">
                  <CloudLightning className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                    ENGINE 1: PhishGuard
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                  Trained on 235k Dataset
                </span>
              </div>

              {/* Endpoint & Status */}
              <div className="flex items-center justify-between p-2.5 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono">
                <span className="text-zinc-500 truncate max-w-[200px] sm:max-w-xs">
                  {currentResult.dualEngine?.engine1.endpoint || "https://phishguard-api-pbjw.onrender.com"}
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {currentResult.dualEngine?.engine1.status || "ONLINE"}
                  {currentResult.dualEngine?.engine1.latencyMs ? ` (${currentResult.dualEngine.engine1.latencyMs}ms)` : ""}
                </span>
              </div>

              {/* Verdict & Probability Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-zinc-400 uppercase">Phishing Probability:</span>
                  <span className={`font-bold ${
                    (currentResult.dualEngine?.engine1.probability ?? 0) >= 50 ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {(currentResult.dualEngine?.engine1.probability ?? 0).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-700 ${
                      (currentResult.dualEngine?.engine1.probability ?? 0) >= 50 ? 'bg-red-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, currentResult.dualEngine?.engine1.probability ?? 0))}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] font-mono pt-1">
                  <span className="text-zinc-500">Verdict:</span>
                  <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                    currentResult.dualEngine?.engine1.isPhishing
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {currentResult.dualEngine?.engine1.isPhishing ? 'PREDICTED: PHISHING' : 'PREDICTED: LEGITIMATE'}
                  </span>
                </div>
              </div>

              {/* Extracted Cloud Features */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
                  Cloud Features Extracted (Live Model Payload):
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <div className="text-[9px] uppercase text-zinc-500 font-mono">DomainLength</div>
                    <div className="text-sm font-mono font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                      {currentResult.dualEngine?.engine1.features.DomainLength ?? currentResult.featureSummary.hostnameLength}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <div className="text-[9px] uppercase text-zinc-500 font-mono">IsDomainIP</div>
                    <div className="text-sm font-mono font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                      {currentResult.dualEngine?.engine1.features.IsDomainIP ? "1 (YES)" : "0 (NO)"}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <div className="text-[9px] uppercase text-zinc-500 font-mono">IsHTTPS</div>
                    <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
                      {currentResult.dualEngine?.engine1.features.IsHTTPS ? "1 (YES)" : "0 (NO)"}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <div className="text-[9px] uppercase text-zinc-500 font-mono">NoOfSubDomain</div>
                    <div className="text-sm font-mono font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                      {currentResult.dualEngine?.engine1.features.NoOfSubDomain ?? currentResult.featureSummary.dotsCount}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ENGINE 2: CyberShield */}
            <div className="p-6 rounded-md bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                    ENGINE 2: CyberShield
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                  Multi-Heuristic + Gemini
                </span>
              </div>

              {/* Engine 2 Risk Score Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-zinc-400 uppercase">Structural Threat Rating:</span>
                  <span className={`font-bold ${
                    (currentResult.dualEngine?.engine2.riskScore ?? currentResult.riskScore) >= 50 ? 'text-red-400' : 'text-blue-400'
                  }`}>
                    {currentResult.dualEngine?.engine2.riskScore ?? currentResult.riskScore}/100
                  </span>
                </div>
                <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-700 ${
                      (currentResult.dualEngine?.engine2.riskScore ?? currentResult.riskScore) >= 70 ? 'bg-red-500' :
                      (currentResult.dualEngine?.engine2.riskScore ?? currentResult.riskScore) >= 35 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, currentResult.dualEngine?.engine2.riskScore ?? currentResult.riskScore))}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] font-mono pt-1">
                  <span className="text-zinc-500">Classification:</span>
                  <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                    (currentResult.dualEngine?.engine2.classification ?? currentResult.classification) === 'PHISHING'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : (currentResult.dualEngine?.engine2.classification ?? currentResult.classification) === 'SUSPICIOUS'
                      ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {currentResult.dualEngine?.engine2.classification ?? currentResult.classification}
                  </span>
                </div>
              </div>

              {/* 8 Structural Indicators */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
                  Deep Structural & Syntactic Indicators:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <div className="text-[9px] uppercase text-zinc-500 font-mono">URL Length</div>
                    <div className="text-sm font-mono font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">{currentResult.featureSummary.urlLength}</div>
                  </div>
                  <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <div className="text-[9px] uppercase text-zinc-500 font-mono">Subdomains</div>
                    <div className="text-sm font-mono font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">{currentResult.featureSummary.dotsCount}</div>
                  </div>
                  <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <div className="text-[9px] uppercase text-zinc-500 font-mono">Sus Keywords</div>
                    <div className="text-sm font-mono font-bold text-red-400 mt-0.5">{currentResult.featureSummary.suspiciousKeywordsCount}</div>
                  </div>
                  <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <div className="text-[9px] uppercase text-zinc-500 font-mono">Special Chars</div>
                    <div className="text-sm font-mono font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">{currentResult.featureSummary.specialCharsCount}</div>
                  </div>
                </div>
              </div>

              {/* AI SOC Analyst Rationale */}
              {currentResult.aiExplanation && (
                <div className="p-3 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold text-zinc-400">
                    <Cpu size={12} className="text-purple-400" />
                    <span>Gemini AI SOC Expert Rationale</span>
                  </div>
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    {currentResult.aiExplanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Crowdsourced Threat Intelligence Queue */}
      {user && crowdsourcedThreats.length > 0 && (
        <div className="p-4 sm:p-6 rounded-md bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Crowdsourced Threat Verification
            </h3>
            <span className="text-[10px] text-zinc-500 font-mono uppercase bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded">
              {crowdsourcedThreats.length} Pending Review
            </span>
          </div>
          <div className="space-y-3">
            {crowdsourcedThreats.map((threat) => (
              <div key={threat.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-900 rounded gap-3 sm:gap-0">
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300 truncate max-w-full sm:max-w-sm">{threat.url}</span>
                  <span className="text-[10px] text-zinc-500 mt-1">Reported by: {threat.reportedBy} • {new Date(threat.reportedAt).toLocaleString()}</span>
                </div>
                <div className="flex space-x-2 shrink-0">
                  <button 
                    onClick={() => handleVerifyThreat(threat.id)}
                    className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <ThumbsUp className="w-3 h-3" /> VERIFY
                  </button>
                  <button 
                    onClick={() => handleDiscardThreat(threat.id)}
                    className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <ThumbsDown className="w-3 h-3" /> DISCARD
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phishing History Table */}
      <div className="p-4 sm:p-6 rounded-md bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Scan History & Two-Way Consensus Log</h3>
          <span className="text-[10px] font-mono text-zinc-500 uppercase">
            {history.length} Scans Recorded
          </span>
        </div>
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                <th className="py-2 px-3 font-normal">Target URL</th>
                <th className="py-2 px-3 font-normal">Two-Way Verdict</th>
                <th className="py-2 px-3 font-normal">Combined Risk</th>
                <th className="py-2 px-3 font-normal">Engine 1 (Render)</th>
                <th className="py-2 px-3 font-normal">Engine 2 (Lexical)</th>
                <th className="py-2 px-3 font-normal">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-xs font-mono">
              {history.map((scan) => (
                <tr key={scan.id} className="hover:bg-zinc-100 dark:bg-zinc-900/50 transition-colors">
                  <td className="py-2.5 px-3 text-zinc-700 dark:text-zinc-300 truncate max-w-xs">{scan.url}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      scan.classification === 'PHISHING' ? 'text-red-500 bg-red-500/10 border border-red-500/20' :
                      scan.classification === 'SUSPICIOUS' ? 'text-orange-500 bg-orange-500/10 border border-orange-500/20' :
                      'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20'
                    }`}>
                      {scan.dualEngine?.consensus.finalVerdict ? scan.dualEngine.consensus.finalVerdict.replace('_', ' ') : scan.classification}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-zinc-900 dark:text-zinc-100">{scan.riskScore}/100</td>
                  <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400">
                    {scan.dualEngine?.engine1.probability !== undefined 
                      ? `${scan.dualEngine.engine1.probability.toFixed(0)}% (${scan.dualEngine.engine1.isPhishing ? 'Phish' : 'Safe'})`
                      : 'Synced'}
                  </td>
                  <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400">
                    {scan.dualEngine?.engine2.riskScore !== undefined 
                      ? `${scan.dualEngine.engine2.riskScore}/100` 
                      : `${scan.riskScore}/100`}
                  </td>
                  <td className="py-2.5 px-3 text-[10px] text-zinc-600">{new Date(scan.scannedAt).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

