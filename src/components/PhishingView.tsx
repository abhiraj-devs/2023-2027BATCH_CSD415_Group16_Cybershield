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
  ShieldAlert, 
  ShieldCheck,
  Check
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
  const [engineStatus, setEngineStatus] = useState<any>(null);

  useEffect(() => {
    if (user?.email) {
      fetchPhishingHistory(user.email).then(setHistory).catch(() => {});
    } else {
      setHistory([]);
    }
    fetchCrowdsourcedThreats().then(setCrowdsourcedThreats).catch(() => {});
    fetchPhishGuardStatus().then(setEngineStatus).catch(() => {});
  }, [user]);

  const handleVerifyThreat = async (id: string) => {
    await verifyCrowdsourcedThreat(id);
    setCrowdsourcedThreats((prev) => prev.filter((t) => t.id !== id));
  };

  const handleDiscardThreat = async (id: string) => {
    await discardCrowdsourcedThreat(id);
    setCrowdsourcedThreats((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAnalyze = async (e?: React.FormEvent, presetUrl?: string) => {
    if (e) e.preventDefault();
    const targetUrl = presetUrl !== undefined ? presetUrl : urlInput;
    if (!targetUrl.trim()) return;

    let isValid = true;
    try {
      new URL(targetUrl.trim().startsWith("http") ? targetUrl.trim() : `https://${targetUrl.trim()}`);
    } catch {
      isValid = false;
    }
    
    if (!isValid) {
      setError("Please enter a valid URL (e.g., https://secure-login-apple.com)");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await analyzePhishingUrl(targetUrl.trim(), user?.email || undefined);
      setCurrentResult(data);
      setHistory((prev) => [data, ...prev.filter((item) => item.id !== data.id)]);
    } catch (err: any) {
      setError(err.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Two-Way Engine Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-xl bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
              <Layers size={22} className="text-emerald-500" />
              <span>Two-Way Phishing Detection Engine</span>
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider">
              Dual-Engine Active
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Simultaneous cross-verification between PhishGuard Cloud AI and CyberShield Deep Lexical Engine.
          </p>
        </div>

        {/* Engine 1 & 2 Live Badges */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 text-xs">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wide">
              ENGINE 1: PhishGuard (235k)
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wide">
              ENGINE 2: CyberShield
            </span>
          </div>
        </div>
      </div>

      {/* URL Input Form */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-4">
        <form onSubmit={(e) => handleAnalyze(e)} className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                <Search size={16} />
              </div>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter target URL (e.g., http://192.168.1.1/paypa1-update-security-login.php)..."
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto py-3 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 shrink-0 cursor-pointer shadow-sm"
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

          {/* Quick preset tests */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Try Sample:</span>
            <button
              type="button"
              onClick={() => {
                setUrlInput("http://paypa1-security-update.verify-account.tk/login");
                handleAnalyze(undefined, "http://paypa1-security-update.verify-account.tk/login");
              }}
              className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-rose-400 text-[10px] font-mono border border-zinc-200 dark:border-zinc-800"
            >
              Malicious PayPal Phish
            </button>
            <button
              type="button"
              onClick={() => {
                setUrlInput("https://www.google.com/search?q=cybersecurity");
                handleAnalyze(undefined, "https://www.google.com/search?q=cybersecurity");
              }}
              className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-emerald-400 text-[10px] font-mono border border-zinc-200 dark:border-zinc-800"
            >
              Safe Google Domain
            </button>
          </div>
        </form>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2 font-mono">
            <AlertTriangle size={14} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Analysis Result Section */}
      {currentResult && (
        <div className="space-y-6">
          {/* Two-Way Consensus Banner */}
          <div className={`p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
            currentResult.dualEngine?.consensus.finalVerdict === "CONFIRMED_PHISHING" || currentResult.classification === "PHISHING"
              ? "bg-rose-950/20 border-rose-500/30 text-rose-300"
              : currentResult.dualEngine?.consensus.finalVerdict === "SUSPICIOUS" || currentResult.classification === "SUSPICIOUS"
              ? "bg-amber-950/20 border-amber-500/30 text-amber-300"
              : "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
          }`}>
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {currentResult.classification === "PHISHING" ? (
                  <ShieldAlert className="w-7 h-7 text-rose-500" />
                ) : currentResult.classification === "SUSPICIOUS" ? (
                  <AlertTriangle className="w-7 h-7 text-amber-400" />
                ) : (
                  <ShieldCheck className="w-7 h-7 text-emerald-400" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold tracking-wide uppercase font-mono">
                    {currentResult.dualEngine?.consensus.finalVerdict ? currentResult.dualEngine.consensus.finalVerdict.replace("_", " ") : currentResult.classification}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    currentResult.dualEngine?.consensus.agreement === "FULL_AGREEMENT"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}>
                    {currentResult.dualEngine?.consensus.agreement === "FULL_AGREEMENT" ? "Two-Way Consensus: Full Agreement" : "Two-Way Check: Discordant Alert"}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-mono">
                  {currentResult.url}
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {currentResult.dualEngine?.consensus.description || currentResult.aiExplanation}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 shrink-0 border-t md:border-t-0 md:border-l border-zinc-700/50 pt-3 md:pt-0 md:pl-6">
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
            <div className="p-5 rounded-xl bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <div className="flex items-center space-x-2">
                  <CloudLightning className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                    ENGINE 1: PhishGuard AI
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                  235k URL Dataset
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono">
                <span className="text-zinc-500 truncate max-w-xs">
                  {currentResult.dualEngine?.engine1.endpoint || "https://phishguard-api-pbjw.onrender.com"}
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {currentResult.dualEngine?.engine1.status || "ONLINE"}
                  {currentResult.dualEngine?.engine1.latencyMs ? ` (${currentResult.dualEngine.engine1.latencyMs}ms)` : ""}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-zinc-500">Phishing Likelihood:</span>
                  <span className={`font-bold ${
                    (currentResult.dualEngine?.engine1.probability ?? 0) >= 50 ? "text-rose-400" : "text-emerald-400"
                  }`}>
                    {(currentResult.dualEngine?.engine1.probability ?? currentResult.riskScore).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-700 ${
                      (currentResult.dualEngine?.engine1.probability ?? 0) >= 50 ? "bg-rose-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, currentResult.dualEngine?.engine1.probability ?? currentResult.riskScore))}%` }}
                  />
                </div>
              </div>

              {/* Extracted Cloud Features */}
              <div className="space-y-2 pt-2">
                <div className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
                  Cloud Features Extracted:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <div className="text-[9px] uppercase text-zinc-500 font-mono">DomainLength</div>
                    <div className="text-sm font-mono font-bold mt-0.5">{currentResult.featureSummary.hostnameLength}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <div className="text-[9px] uppercase text-zinc-500 font-mono">IsDomainIP</div>
                    <div className="text-sm font-mono font-bold mt-0.5">{currentResult.featureSummary.isIpAddress ? "1 (YES)" : "0 (NO)"}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <div className="text-[9px] uppercase text-zinc-500 font-mono">IsHTTPS</div>
                    <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">{currentResult.featureSummary.hasHttps ? "1 (YES)" : "0 (NO)"}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <div className="text-[9px] uppercase text-zinc-500 font-mono">NoOfSubDomains</div>
                    <div className="text-sm font-mono font-bold mt-0.5">{currentResult.featureSummary.dotsCount}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ENGINE 2: CyberShield */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                    ENGINE 2: CyberShield Lexical
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                  15-Feature Heuristic
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-zinc-500">Structural Threat Score:</span>
                  <span className={`font-bold ${
                    (currentResult.dualEngine?.engine2.riskScore ?? currentResult.riskScore) >= 50 ? "text-rose-400" : "text-blue-400"
                  }`}>
                    {currentResult.dualEngine?.engine2.riskScore ?? currentResult.riskScore}/100
                  </span>
                </div>
                <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.max(0, currentResult.dualEngine?.engine2.riskScore ?? currentResult.riskScore))}%` }}
                  />
                </div>
              </div>

              {/* 8 Structural Indicators */}
              <div className="space-y-2 pt-2">
                <div className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">
                  Deep Structural Indicators:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <div className="text-[9px] uppercase text-zinc-500 font-mono">URL Length</div>
                    <div className="text-sm font-mono font-bold mt-0.5">{currentResult.featureSummary.urlLength}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <div className="text-[9px] uppercase text-zinc-500 font-mono">Dots</div>
                    <div className="text-sm font-mono font-bold mt-0.5">{currentResult.featureSummary.dotsCount}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <div className="text-[9px] uppercase text-zinc-500 font-mono">Keywords</div>
                    <div className="text-sm font-mono font-bold text-rose-400 mt-0.5">{currentResult.featureSummary.suspiciousKeywordsCount}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <div className="text-[9px] uppercase text-zinc-500 font-mono">Special Chars</div>
                    <div className="text-sm font-mono font-bold mt-0.5">{currentResult.featureSummary.specialCharsCount}</div>
                  </div>
                </div>
              </div>

              {/* AI SOC Analyst Rationale */}
              {currentResult.aiExplanation && (
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold text-zinc-400">
                    <Cpu size={12} className="text-emerald-400" />
                    <span>Gemini AI SOC Expert Rationale</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                    {currentResult.aiExplanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Crowdsourced Threat Verification */}
      {crowdsourcedThreats.length > 0 && (
        <div className="p-5 rounded-xl bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Crowdsourced Community Threat Queue</span>
            </h3>
            <span className="text-[10px] font-mono uppercase bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded text-zinc-500">
              {crowdsourcedThreats.length} Pending Review
            </span>
          </div>

          <div className="space-y-2">
            {crowdsourcedThreats.map((t) => (
              <div key={t.id} className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-200 truncate">{t.url}</div>
                  <div className="text-[10px] text-zinc-500">Reported by {t.reportedBy} • {new Date(t.reportedAt).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleVerifyThreat(t.id)}
                    className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-mono font-bold flex items-center gap-1 border border-emerald-500/20"
                  >
                    <ThumbsUp size={12} /> Verify
                  </button>
                  <button
                    onClick={() => handleDiscardThreat(t.id)}
                    className="px-2.5 py-1 rounded bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/20 text-[10px] font-mono flex items-center gap-1 border border-zinc-500/20"
                  >
                    <ThumbsDown size={12} /> Discard
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
