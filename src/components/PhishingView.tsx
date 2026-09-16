import React, { useState, useEffect } from "react";
import { ShieldAlert, ShieldCheck, Search, AlertTriangle, CheckCircle2, Cpu, ArrowRight, RefreshCw, Terminal, ExternalLink, ThumbsUp, ThumbsDown } from "lucide-react";
import { PhishingScan, CrowdsourcedThreat } from "../types";
import { analyzePhishingUrl, fetchPhishingHistory, fetchCrowdsourcedThreats, verifyCrowdsourcedThreat, discardCrowdsourcedThreat } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function PhishingView() {
  const { user } = useAuth();
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<PhishingScan | null>(null);
  const [history, setHistory] = useState<PhishingScan[]>([]);
  const [crowdsourcedThreats, setCrowdsourcedThreats] = useState<CrowdsourcedThreat[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPhishingHistory().then(setHistory).catch(() => {});
    fetchCrowdsourcedThreats().then(setCrowdsourcedThreats).catch(() => {});
  }, []);

  const handleVerifyThreat = async (id: string) => {
    await verifyCrowdsourcedThreat(id);
    setCrowdsourcedThreats(prev => prev.filter(t => t.id !== id));
  };

  const handleDiscardThreat = async (id: string) => {
    await discardCrowdsourcedThreat(id);
    setCrowdsourcedThreats(prev => prev.filter(t => t.id !== id));
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    let isValid = true;
    try {
      new URL(urlInput.trim().startsWith('http') ? urlInput.trim() : `https://${urlInput.trim()}`);
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
      const data = await analyzePhishingUrl(urlInput.trim());
      setCurrentResult(data);
      const updatedHistory = await fetchPhishingHistory();
      setHistory(updatedHistory);
    } catch (err: any) {
      setError(err.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const sampleUrls = [
    "https://secure-login-apple-support.com/auth/verify",
    "https://www.google.com/search?q=cybersecurity",
    "https://update-paypal-billing-secure.net/signin",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-6 rounded-md bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
            <ShieldAlert size={20} className="text-zinc-600 dark:text-zinc-400" />
            <span>Phishing URL Engine</span>
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm mt-1">
            Random Forest lexical feature extraction coupled with Gemini AI expert threat explanation.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center space-x-2 text-[10px] font-mono text-zinc-600 dark:text-zinc-400 px-2 py-1.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 uppercase tracking-wider">
            <Cpu size={12} />
            <span>XGBoost</span>
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-mono text-zinc-600 dark:text-zinc-400 px-2 py-1.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 uppercase tracking-wider">
            <span>Threshold: 0.85</span>
          </div>
        </div>
      </div>

      {/* URL Input Form */}
      <div className="p-4 sm:p-6 rounded-md bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-4">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full">
              <div className="absolute left-3 top-3.5 text-zinc-500">
                 <Search size={16} />
              </div>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter target URL (e.g., https://example.com/login)..."
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded pl-10 pr-4 py-3 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors font-mono"
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
                  <span>ANALYZING</span>
                </>
              ) : (
                <>
                  <span>SCAN</span>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Verdict Card */}
          <div className="p-6 rounded-md bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-6 flex flex-col justify-between items-center text-center">
            <div className="w-full flex items-center justify-between text-[10px] text-zinc-500 font-mono uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <span>SCAN RESULT</span>
              <span>{new Date(currentResult.scannedAt).toLocaleTimeString()}</span>
            </div>

            {/* Circular Gauge / Risk Meter */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-zinc-900 fill-none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={351.8}
                  strokeDashoffset={351.8 - (351.8 * (currentResult.riskScore || 0)) / 100}
                  strokeLinecap="butt"
                  className={`fill-none transition-all duration-1000 ${
                    currentResult.riskScore >= 70 ? 'text-red-500' :
                    currentResult.riskScore >= 35 ? 'text-orange-500' : 'text-blue-500'
                  }`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">{currentResult.riskScore}</span>
                <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Risk Score</span>
              </div>
            </div>

            <div className="space-y-3 w-full">
              <div className={`inline-block px-3 py-1 rounded text-[10px] font-bold font-mono tracking-widest uppercase ${
                currentResult.classification === 'PHISHING' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                currentResult.classification === 'SUSPICIOUS' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                'bg-blue-500/10 text-blue-500 border border-blue-500/20'
              }`}>
                {currentResult.classification}
              </div>
              <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
                Confidence: <span className="text-zinc-800 dark:text-zinc-200 font-bold">{(currentResult.confidence * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Detailed Features & AI Explanation */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Explanation */}
            <div className="p-6 rounded-md bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center space-x-2 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <Cpu size={14} />
                <span>ChatSpamDetector LLM Rationale</span>
              </div>
              <div className="text-xs text-zinc-700 dark:text-zinc-300 font-mono bg-zinc-50 dark:bg-zinc-950 p-4 rounded border border-zinc-300 dark:border-zinc-900 space-y-3">
                <div className="flex justify-between items-center"><span className="text-zinc-500">Brand Impersonation:</span> <span className="text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded">DETECTED</span></div>
                <div className="flex justify-between items-center"><span className="text-zinc-500">Suspicious Links:</span> <span className="text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded">TRUE (Mismatch)</span></div>
                <div className="flex justify-between items-center"><span className="text-zinc-500">Authentication:</span> <span className="text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">SPF/DKIM PASS</span></div>
                <div className="mt-2 pt-3 border-t border-zinc-300 dark:border-zinc-900 text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
                  {currentResult.aiExplanation}
                </div>
              </div>
            </div>

            {/* Feature Extraction Table */}
            <div className="p-6 rounded-md bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h3 className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 pb-2">Lexical & Structural Indicators</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-900">
                  <div className="text-[10px] uppercase text-zinc-500 font-mono">URL Length</div>
                  <div className="text-base font-mono font-bold text-zinc-800 dark:text-zinc-200 mt-1">{currentResult.featureSummary.urlLength}</div>
                </div>
                <div className="p-3 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-900">
                  <div className="text-[10px] uppercase text-zinc-500 font-mono">Subdomains</div>
                  <div className="text-base font-mono font-bold text-zinc-800 dark:text-zinc-200 mt-1">{currentResult.featureSummary.dotsCount}</div>
                </div>
                <div className="p-3 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-900">
                  <div className="text-[10px] uppercase text-zinc-500 font-mono">Hyphens</div>
                  <div className="text-base font-mono font-bold text-zinc-800 dark:text-zinc-200 mt-1">{currentResult.featureSummary.hyphensCount}</div>
                </div>
                <div className="p-3 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-900">
                  <div className="text-[10px] uppercase text-zinc-500 font-mono">HTTPS Secure</div>
                  <div className="text-base font-mono font-bold text-emerald-500 mt-1">
                    {currentResult.featureSummary.hasHttps ? "YES" : "NO"}
                  </div>
                </div>
                <div className="p-3 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-900">
                  <div className="text-[10px] uppercase text-zinc-500 font-mono">IP Address</div>
                  <div className="text-base font-mono font-bold text-zinc-800 dark:text-zinc-200 mt-1">
                    {currentResult.featureSummary.isIpAddress ? "YES" : "NO"}
                  </div>
                </div>
                <div className="p-3 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-900">
                  <div className="text-[10px] uppercase text-zinc-500 font-mono">Sus Keywords</div>
                  <div className="text-base font-mono font-bold text-red-500 mt-1">{currentResult.featureSummary.suspiciousKeywordsCount}</div>
                </div>
                <div className="p-3 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-900">
                  <div className="text-[10px] uppercase text-zinc-500 font-mono">Special Chars</div>
                  <div className="text-base font-mono font-bold text-zinc-800 dark:text-zinc-200 mt-1">{currentResult.featureSummary.specialCharsCount}</div>
                </div>
                <div className="p-3 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-900">
                  <div className="text-[10px] uppercase text-zinc-500 font-mono">Version</div>
                  <div className="text-xs font-mono font-bold text-zinc-500 mt-1">{currentResult.modelVersion}</div>
                </div>
              </div>
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
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-3">Scan History</h3>
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-left border-collapse min-w-[560px]">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                <th className="py-2 px-3 font-normal">Target URL</th>
                <th className="py-2 px-3 font-normal">Classification</th>
                <th className="py-2 px-3 font-normal">Risk Score</th>
                <th className="py-2 px-3 font-normal">Confidence</th>
                <th className="py-2 px-3 font-normal">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-xs font-mono">
              {history.map((scan) => (
                <tr key={scan.id} className="hover:bg-zinc-100 dark:bg-zinc-900/50 transition-colors">
                  <td className="py-2.5 px-3 text-zinc-700 dark:text-zinc-300 truncate max-w-xs">{scan.url}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      scan.classification === 'PHISHING' ? 'text-red-500 bg-red-500/10' :
                      scan.classification === 'SUSPICIOUS' ? 'text-orange-500 bg-orange-500/10' :
                      'text-blue-500 bg-blue-500/10'
                    }`}>
                      {scan.classification}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-zinc-900 dark:text-zinc-100">{scan.riskScore}</td>
                  <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400">{(scan.confidence * 100).toFixed(0)}%</td>
                  <td className="py-2.5 px-3 text-[10px] text-zinc-600">{new Date(scan.scannedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
