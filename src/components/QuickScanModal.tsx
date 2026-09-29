import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  X, 
  Zap, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Copy, 
  Check, 
  ArrowRight, 
  RefreshCw, 
  Clipboard, 
  FileCode, 
  Globe, 
  Binary, 
  ExternalLink,
  History,
  CornerDownLeft
} from "lucide-react";
import { QuickScanResult } from "../types";
import { runQuickScan } from "../services/api";

interface QuickScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToView?: (viewId: string) => void;
}

export default function QuickScanModal({ isOpen, onClose, onNavigateToView }: QuickScanModalProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanPhase, setScanPhase] = useState("Initializing scan engines...");
  const [result, setResult] = useState<QuickScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [recentScans, setRecentScans] = useState<QuickScanResult[]>([]);
  const [activeTab, setActiveTab] = useState<"scan" | "history">("scan");
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 80);
    } else {
      setError(null);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Real-time detection of input format
  const detectInputType = (val: string): { label: string; type: string; color: string } => {
    const clean = val.trim();
    if (!clean) return { label: "Awaiting Input", type: "NONE", color: "text-zinc-500" };
    
    if (/^[a-fA-F0-9]{64}$/.test(clean)) {
      return { label: "SHA-256 Hash", type: "SHA256", color: "text-purple-400" };
    }
    if (/^[a-fA-F0-9]{40}$/.test(clean)) {
      return { label: "SHA-1 Hash", type: "SHA1", color: "text-indigo-400" };
    }
    if (/^[a-fA-F0-9]{32}$/.test(clean)) {
      return { label: "MD5 Hash", type: "MD5", color: "text-blue-400" };
    }
    if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(clean)) {
      return { label: "IPv4 Address", type: "IP", color: "text-cyan-400" };
    }
    if (clean.startsWith("http://") || clean.startsWith("https://") || clean.includes("/") || clean.includes(".")) {
      return { label: "URL / Domain", type: "URL", color: "text-emerald-400" };
    }
    return { label: "Text / Generic", type: "GENERIC", color: "text-zinc-400" };
  };

  const detected = detectInputType(query);

  const handleScan = async (overrideQuery?: string) => {
    const target = (overrideQuery !== undefined ? overrideQuery : query).trim();
    if (!target) {
      setError("Please paste or type a valid URL, domain, or file hash.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    // Multi-phase progress ticker for realistic SOC telemetry
    const phases = [
      "Parsing & classifying input payload...",
      "Cross-referencing global threat databases...",
      "Running heuristic ML & lexical evaluation...",
      "Synthesizing threat intelligence verdict..."
    ];
    let phaseIdx = 0;
    const interval = setInterval(() => {
      phaseIdx = (phaseIdx + 1) % phases.length;
      setScanPhase(phases[phaseIdx]);
    }, 380);

    try {
      const scanData = await runQuickScan(target);
      clearInterval(interval);
      setResult(scanData);
      setRecentScans(prev => {
        const filtered = prev.filter(p => p.query.toLowerCase() !== scanData.query.toLowerCase());
        return [scanData, ...filtered].slice(0, 10);
      });
    } catch (err: any) {
      clearInterval(interval);
      setError(err?.message || "Threat scan operation failed. Please check network connectivity.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setQuery(text.trim());
          setError(null);
          // Auto-trigger if looks like a hash or URL
          const check = detectInputType(text);
          if (check.type !== "NONE" && check.type !== "GENERIC") {
            handleScan(text.trim());
          }
        }
      } else {
        setError("Clipboard access not available in this browser context.");
      }
    } catch {
      setError("Unable to read clipboard. Please paste manually into the input box.");
    }
  };

  const handleCopyReport = () => {
    if (!result) return;
    const report = [
      `=== CYBERSHIELD QUICK THREAT SCAN REPORT ===`,
      `Target: ${result.query}`,
      `Type: ${result.inputType}`,
      `Verdict: ${result.verdict} (${result.threatLevel})`,
      `Threat Name: ${result.threatName || 'None'}`,
      `Risk Score: ${result.riskScore}/100 | Confidence: ${(result.confidence * 100).toFixed(0)}%`,
      `Detections: ${result.enginesDetected}/${result.enginesTotal} security vendors`,
      `Summary: ${result.analysisSummary}`,
      `Timestamp: ${result.scannedAt}`,
      `============================================`
    ].join('\n');

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      {/* Backdrop click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog Card */}
      <div 
        className="relative w-full max-w-3xl bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-4 sm:px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-zinc-800 border border-zinc-700/60 text-emerald-400">
              <Zap size={18} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm sm:text-base font-bold tracking-tight text-white">Instant Quick Scan</h2>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Paste any URL or file hash (MD5, SHA-1, SHA-256) for multi-source SOC threat analysis.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab(activeTab === "scan" ? "history" : "scan")}
              className={`px-2.5 py-1.5 rounded text-xs font-mono font-medium border transition-colors flex items-center space-x-1.5 cursor-pointer ${
                activeTab === "history"
                  ? "bg-zinc-800 text-white border-zinc-600"
                  : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200"
              }`}
              title="Recent Quick Scans"
            >
              <History size={13} />
              <span className="hidden sm:inline">Recent</span>
              {recentScans.length > 0 && (
                <span className="text-[10px] text-zinc-300">({recentScans.length})</span>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Close Quick Scan"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {activeTab === "history" ? (
            /* Recent Scans Session View */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Recent Session Scans ({recentScans.length})
                </h3>
                <button
                  onClick={() => setActiveTab("scan")}
                  className="text-xs text-emerald-400 hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <span>Back to scanner</span>
                  <ArrowRight size={12} />
                </button>
              </div>

              {recentScans.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-zinc-800 rounded bg-zinc-900/30 text-zinc-500 text-xs">
                  No quick scans performed in this session yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {recentScans.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setResult(item);
                        setQuery(item.query);
                        setActiveTab("scan");
                      }}
                      className="p-3 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 rounded transition-colors cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            item.verdict === 'MALICIOUS' ? 'bg-rose-950 text-rose-300 border border-rose-800/60' :
                            item.verdict === 'SUSPICIOUS' ? 'bg-amber-950 text-amber-300 border border-amber-800/60' :
                            'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                          }`}>
                            {item.verdict}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-400">{item.inputType}</span>
                          <span className="text-xs font-bold text-zinc-200 truncate">
                            {item.threatName || "Analyzed Indicator"}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-zinc-400 truncate mt-1">
                          {item.query}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-mono font-bold text-zinc-300">
                          {item.enginesDetected}/{item.enginesTotal} engines
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          Score: {item.riskScore}/100
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Main Scanner View */
            <>
              {/* Input Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="quick-scan-input" className="font-mono text-zinc-300 flex items-center space-x-2">
                    <span>Target Indicator</span>
                    <span className="text-zinc-500">·</span>
                    <span className={`font-mono text-[11px] font-medium ${detected.color}`}>
                      {detected.label}
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={handlePasteClipboard}
                    className="text-zinc-400 hover:text-white transition-colors flex items-center space-x-1 font-mono text-[11px] cursor-pointer"
                    title="Paste from system clipboard"
                  >
                    <Clipboard size={12} />
                    <span>Paste Clipboard</span>
                  </button>
                </div>

                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-zinc-500 pointer-events-none">
                    {detected.type === "URL" ? (
                      <Globe size={16} className="text-emerald-400" />
                    ) : detected.type.startsWith("HASH") ? (
                      <Binary size={16} className="text-purple-400" />
                    ) : (
                      <Search size={16} />
                    )}
                  </div>

                  <input
                    ref={inputRef}
                    id="quick-scan-input"
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !loading) {
                        handleScan();
                      }
                    }}
                    placeholder="Paste URL (https://...) or file hash (MD5, SHA-1, SHA-256)..."
                    className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-zinc-400 rounded-md pl-10 pr-24 py-3 text-sm font-mono text-white placeholder-zinc-500 focus:outline-none transition-colors"
                  />

                  {query && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setResult(null);
                        setError(null);
                        inputRef.current?.focus();
                      }}
                      className="absolute right-20 text-zinc-500 hover:text-zinc-300 p-1 cursor-pointer"
                      title="Clear input"
                    >
                      <X size={14} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleScan()}
                    disabled={loading || !query.trim()}
                    className="absolute right-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs rounded transition-colors flex items-center space-x-1.5 disabled:opacity-40 disabled:hover:bg-zinc-100 cursor-pointer"
                  >
                    {loading ? (
                      <RefreshCw size={13} className="animate-spin" />
                    ) : (
                      <CornerDownLeft size={13} />
                    )}
                    <span>{loading ? "Scanning" : "Analyze"}</span>
                  </button>
                </div>

                {error && (
                  <p className="text-xs text-rose-400 font-mono mt-1 flex items-center space-x-1">
                    <AlertTriangle size={13} className="shrink-0" />
                    <span>{error}</span>
                  </p>
                )}
              </div>

              {/* Scanning Progress Banner */}
              {loading && (
                <div className="p-4 rounded-md border border-zinc-800 bg-zinc-900/60 space-y-3 animate-pulse">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-400 flex items-center space-x-2">
                      <RefreshCw size={14} className="animate-spin" />
                      <span>{scanPhase}</span>
                    </span>
                    <span className="text-zinc-500">Live SOC telemetry</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-2/3 animate-pulse" />
                  </div>
                </div>
              )}

              {/* Scan Results Display */}
              {result && !loading && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Verdict Card Banner */}
                  <div className={`p-4 rounded-md border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    result.verdict === 'MALICIOUS'
                      ? 'bg-rose-950/40 border-rose-800/80 text-rose-100'
                      : result.verdict === 'SUSPICIOUS'
                      ? 'bg-amber-950/40 border-amber-800/80 text-amber-100'
                      : 'bg-emerald-950/40 border-emerald-800/80 text-emerald-100'
                  }`}>
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded mt-0.5 shrink-0 ${
                        result.verdict === 'MALICIOUS' ? 'bg-rose-900/60 text-rose-400' :
                        result.verdict === 'SUSPICIOUS' ? 'bg-amber-900/60 text-amber-400' :
                        'bg-emerald-900/60 text-emerald-400'
                      }`}>
                        {result.verdict === 'MALICIOUS' ? <ShieldAlert size={20} /> :
                         result.verdict === 'SUSPICIOUS' ? <AlertTriangle size={20} /> :
                         <ShieldCheck size={20} />}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold tracking-wider uppercase">
                            Verdict: {result.verdict}
                          </span>
                          <span className="text-zinc-500">·</span>
                          <span className="text-xs font-mono font-semibold">
                            Severity: {result.threatLevel}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white mt-0.5">
                          {result.threatName || (result.verdict === 'MALICIOUS' ? 'Confirmed Security Threat' : 'Benign Clean Indicator')}
                        </h3>
                        <p className="text-xs text-zinc-300 font-mono mt-1 break-all line-clamp-2">
                          {result.query}
                        </p>
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60">
                      <div className="text-2xl font-bold font-mono tracking-tight text-white">
                        {result.riskScore}<span className="text-xs text-zinc-400 font-normal">/100</span>
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                        Risk Rating
                      </div>
                    </div>
                  </div>

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                        Engine Detections
                      </span>
                      <div className="text-base font-mono font-bold text-white mt-0.5">
                        <span className={result.enginesDetected > 0 ? "text-rose-400" : "text-emerald-400"}>
                          {result.enginesDetected}
                        </span>
                        <span className="text-xs text-zinc-500"> / {result.enginesTotal}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                        Payload Type
                      </span>
                      <div className="text-xs font-mono font-bold text-zinc-200 mt-1 truncate">
                        {result.inputType}
                      </div>
                    </div>

                    <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                        Detection Confidence
                      </span>
                      <div className="text-base font-mono font-bold text-white mt-0.5">
                        {(result.confidence * 100).toFixed(0)}%
                      </div>
                    </div>

                    <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                        Threat Tags
                      </span>
                      <div className="text-xs font-mono text-zinc-300 mt-1 truncate">
                        {result.tags.slice(0, 2).join(", ") || "unclassified"}
                      </div>
                    </div>
                  </div>

                  {/* Expert SOC Analysis Summary */}
                  <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded space-y-2">
                    <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400">
                      <FileCode size={13} className="text-emerald-400" />
                      <span className="uppercase tracking-wider font-semibold">SOC Intelligence Assessment</span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                      {result.analysisSummary}
                    </p>
                  </div>

                  {/* Vendor Detections (if flagged) */}
                  {result.vendorDetections && result.vendorDetections.length > 0 && (
                    <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-400 uppercase tracking-wider font-semibold">
                          Security Vendor Signatures ({result.vendorDetections.length})
                        </span>
                        <span className="text-zinc-500">Multi-engine correlation</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {result.vendorDetections.map((vd, i) => (
                          <div 
                            key={i} 
                            className="p-2.5 rounded bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs font-mono"
                          >
                            <span className="font-semibold text-zinc-300">{vd.engine}</span>
                            <span className="text-rose-400 truncate max-w-[180px] ml-2 text-right">
                              {vd.result}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bottom Action Controls */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800/80">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={handleCopyReport}
                        className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-mono flex items-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        <span>{copied ? "Copied Report" : "Copy Report"}</span>
                      </button>

                      {onNavigateToView && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            if (result.inputType.startsWith("HASH")) {
                              onNavigateToView("malware");
                            } else {
                              onNavigateToView("phishing");
                            }
                          }}
                          className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-mono flex items-center space-x-1.5 transition-colors cursor-pointer"
                        >
                          <span>Deep Forensics</span>
                          <ExternalLink size={12} />
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setResult(null);
                        setQuery("");
                        inputRef.current?.focus();
                      }}
                      className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-mono flex items-center space-x-1 transition-colors cursor-pointer"
                    >
                      <RefreshCw size={12} />
                      <span>Scan Another</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}
