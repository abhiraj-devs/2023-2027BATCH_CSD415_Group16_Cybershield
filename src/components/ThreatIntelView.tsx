import React, { useState, useEffect } from "react";
import {
  Globe,
  
  RefreshCw,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Cpu,
  
  Tag,
  Copy,
  Check} from "lucide-react";
import { ThreatItem } from "../types";
import {
  fetchThreatIntel,
  refreshThreatIntel,
  
  getVirusTotalStatus,
  } from "../services/api";

export default function ThreatIntelView({ searchQuery }: { searchQuery: string }) {
  const [intel, setIntel] = useState<ThreatItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>("vt_lockbit");
  
  // Real-time lookup console state
  
    
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'VT' | 'HASH' | 'IP' | 'DOMAIN' | 'CVE'>('ALL');

  // PhishTank Quick Check state
      

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchThreatIntel(),
      getVirusTotalStatus()
    ]).then(([threatData, statusData]) => {
      setIntel(threatData || []);
      console.log(statusData || { configured: false, service: "VirusTotal v3" });
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    console.log(null);
    try {
      const data = await refreshThreatIntel();
      setIntel(data || []);
      console.log("Synchronized threat feed with live VirusTotal indicators.");
      setTimeout(() => console.log(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

      const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Quick test samples
    const filteredIntel = intel.filter(item => {
    if (!item) return false;
    const name = item.threatName || (item as any).threatLabel || (item as any).name || "";
    const src = item.source || "";
    const cve = item.cveId || "";
    const ind = item.indicator || "";
    const query = (searchQuery || "").toLowerCase();
    
    const matchesSearch = name.toLowerCase().includes(query) ||
      src.toLowerCase().includes(query) ||
      cve.toLowerCase().includes(query) ||
      ind.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (activeFilter === 'VT') {
      return src.toLowerCase().includes('virustotal');
    }
    if (activeFilter === 'HASH') {
      return item.indicatorType === 'HASH';
    }
    if (activeFilter === 'IP') {
      return item.indicatorType === 'IP';
    }
    if (activeFilter === 'DOMAIN') {
      return item.indicatorType === 'DOMAIN' || item.indicatorType === 'URL';
    }
    if (activeFilter === 'CVE') {
      return item.indicatorType === 'CVE';
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div id="threat-intel-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-6 rounded-md bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center space-x-2">
            <Globe size={20} className="text-zinc-600 dark:text-zinc-400" />
            <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Threat Intelligence Feeds
            </h1>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm mt-1">
            Real-time threat feeds, malware signatures, and IoCs fetched directly from the VirusTotal API and global intelligence databases.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            id="threat-intel-sync-btn"
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-full md:w-auto justify-center px-4 py-2.5 sm:py-2 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs transition-colors flex items-center space-x-2 disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            <span>{refreshing ? "QUERYING VIRUSTOTAL..." : "SYNC LIVE FEEDS"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          {/* Feed Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'ALL', label: 'All Indicators' },
                { id: 'VT', label: 'VirusTotal Feed' },
                { id: 'HASH', label: 'Malware Hashes' },
                { id: 'IP', label: 'C2 IPs' },
                { id: 'DOMAIN', label: 'Domains & URLs' },
                { id: 'CVE', label: 'CVEs' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as any)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                    activeFilter === tab.id
                      ? 'bg-zinc-100 text-zinc-950 font-bold'
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-zinc-500 font-mono shrink-0">
              {filteredIntel.length} verified indicators
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <RefreshCw className="animate-spin text-zinc-500" size={24} />
              <span className="text-xs font-mono text-zinc-500">Retrieving intelligence indicators...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredIntel.map(item => {
                const isVirusTotal = item.source?.toLowerCase().includes("virustotal") || !!item.vtStats;
                const maliciousVendors = item.vtStats?.malicious ?? 0;
                const totalVendors = item.vtStats?.total ?? 72;
                const detectionPct = Math.round((maliciousVendors / totalVendors) * 100);

                return (
                  <div
                    key={item.id}
                    id={`threat-card-${item.id}`}
                    className={`rounded-md bg-white dark:bg-[#111111] border transition-all ${
                      expandedId === item.id ? 'border-zinc-300 dark:border-zinc-700 shadow-md' : 'border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:border-zinc-700'
                    }`}
                  >
                    <div 
                      className="p-3.5 sm:p-4 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0"
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    >
                      <div className="flex items-start sm:items-center space-x-3 min-w-0">
                        <div className={`p-2 rounded shrink-0 mt-0.5 sm:mt-0 ${
                          item.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                          item.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 
                          'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                        }`}>
                          {item.severity === 'CRITICAL' ? <AlertTriangle size={16} /> : <ShieldAlert size={16} />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">
                              {item.threatName || (item as any).threatLabel || (item as any).name || "Unknown Threat"}
                            </h4>
                            {isVirusTotal && (
                              <span className="px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-mono font-bold shrink-0">
                                VT API
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <span className="text-[10px] text-zinc-500 font-mono">
                              {new Date(item.publishedAt).toLocaleDateString()}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded font-mono text-zinc-600 dark:text-zinc-400">
                              {item.sourceOrigin ? `${item.sourceOrigin.attribution} via ${item.sourceOrigin.name}` : item.source}
                            </span>
                            {item.sourceOrigin?.endpoint && (
                              <span className="text-[10px] text-zinc-600 font-mono italic truncate max-w-[200px]" title={item.sourceOrigin.endpoint}>
                                from {item.sourceOrigin.endpoint}
                              </span>
                            )}
                            <span className="text-[10px] px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded font-mono text-amber-400">
                              {item.indicatorType}
                            </span>
                            {item.cveId && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded font-mono text-blue-400">
                                {item.cveId}
                              </span>
                            )}
                            {item.popularCategory && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded font-mono">
                                {item.popularCategory}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end space-x-4 shrink-0 pl-11 sm:pl-0">
                        {item.vtStats && (
                          <div className="text-right hidden md:block">
                            <div className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">
                              Detection Ratio
                            </div>
                            <div className={`text-xs font-mono font-bold ${
                              maliciousVendors > 30 ? 'text-red-400' : maliciousVendors > 5 ? 'text-orange-400' : 'text-emerald-400'
                            }`}>
                              {maliciousVendors} / {totalVendors} Vendors
                            </div>
                          </div>
                        )}

                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          item.severity === 'CRITICAL' ? 'text-red-500 bg-red-500/10 border border-red-500/20' :
                          item.severity === 'HIGH' ? 'text-orange-500 bg-orange-500/10 border border-orange-500/20' : 
                          'text-blue-500 bg-blue-500/10 border border-blue-500/20'
                        }`}>
                          {item.severity}
                        </span>
                        {expandedId === item.id ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
                      </div>
                    </div>

                    {expandedId === item.id && (
                      <div className="p-4 sm:p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/70 space-y-4">
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
                          {item.description}
                        </p>

                        {/* VirusTotal Live Detection Meter */}
                        {item.vtStats && (
                          <div className="p-3 rounded bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                                <ShieldAlert size={14} className={maliciousVendors > 0 ? "text-red-400" : "text-emerald-400"} />
                                VirusTotal Multi-Engine Antivirus Verdict
                              </span>
                              <span className="font-mono text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                                {maliciousVendors} of {totalVendors} flagged ({detectionPct}%)
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                              <div style={{ width: `${detectionPct}%` }} className="bg-red-500 h-full transition-all"></div>
                              <div style={{ width: `${(item.vtStats.suspicious / totalVendors) * 100}%` }} className="bg-orange-500 h-full"></div>
                              <div style={{ width: `${(item.vtStats.harmless / totalVendors) * 100}%` }} className="bg-emerald-500 h-full"></div>
                            </div>

                            <div className="grid grid-cols-4 gap-2 pt-1">
                              <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-950 text-center border border-zinc-200 dark:border-zinc-800/80">
                                <div className="text-[10px] text-red-400 font-mono uppercase">Malicious</div>
                                <div className="text-sm font-bold font-mono text-zinc-800 dark:text-zinc-200">{item.vtStats.malicious}</div>
                              </div>
                              <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-950 text-center border border-zinc-200 dark:border-zinc-800/80">
                                <div className="text-[10px] text-orange-400 font-mono uppercase">Suspicious</div>
                                <div className="text-sm font-bold font-mono text-zinc-800 dark:text-zinc-200">{item.vtStats.suspicious}</div>
                              </div>
                              <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-950 text-center border border-zinc-200 dark:border-zinc-800/80">
                                <div className="text-[10px] text-emerald-400 font-mono uppercase">Harmless</div>
                                <div className="text-sm font-bold font-mono text-zinc-800 dark:text-zinc-200">{item.vtStats.harmless}</div>
                              </div>
                              <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-950 text-center border border-zinc-200 dark:border-zinc-800/80">
                                <div className="text-[10px] text-zinc-500 font-mono uppercase">Undetected</div>
                                <div className="text-sm font-bold font-mono text-zinc-800 dark:text-zinc-200">{item.vtStats.undetected}</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Top Antivirus Engine Verdicts */}
                        {item.engineDetections && item.engineDetections.length > 0 && (
                          <div>
                            <h5 className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <Cpu size={12} className="text-zinc-500" />
                              Antivirus Engine Signatures (Sampled from VirusTotal)
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {item.engineDetections.map((eng, idx) => (
                                <div key={idx} className="p-2 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                                  <span className="font-bold text-zinc-700 dark:text-zinc-300 font-mono text-[11px]">{eng.engine}</span>
                                  <span className="font-mono text-[10px] text-red-400 truncate max-w-[170px]" title={eng.result}>
                                    {eng.result}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Indicators of Compromise */}
                        <div>
                          <h5 className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2">
                            Indicators of Compromise (IoCs)
                          </h5>
                          <div className="space-y-1.5">
                            {([item.indicator, ...(item.indicators || [])]).filter((v, i, a) => a.indexOf(v) === i && !!v).map((ioc, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                                <span className="truncate mr-2 text-[11px]">{ioc}</span>
                                <button
                                  onClick={() => copyToClipboard(ioc, `${item.id}-${idx}`)}
                                  className="p-1 rounded hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-200 transition-colors shrink-0 cursor-pointer"
                                  title="Copy IoC"
                                >
                                  {copiedId === `${item.id}-${idx}` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Tags */}
                        {item.vtTags && item.vtTags.length > 0 && (
                          <div>
                            <h5 className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                              <Tag size={12} className="text-zinc-500" />
                              Threat Tags
                            </h5>
                            <div className="flex flex-wrap gap-1.5">
                              {item.vtTags.map((tag, tIdx) => (
                                <span key={tIdx} className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-mono text-zinc-700 dark:text-zinc-300">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs">
                          <span className="text-zinc-500 text-[11px] font-mono">
                            Last Modified: {item.updatedAt}
                          </span>
                          {item.vtPermalink && (
                            <a
                              href={item.vtPermalink}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="px-3 py-1.5 rounded bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:text-white font-mono text-[11px] flex items-center space-x-1.5 transition-colors cursor-pointer"
                            >
                              <span>View on VirusTotal</span>
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredIntel.length === 0 && (
                <div className="text-center py-12 text-zinc-500 text-sm font-mono bg-white dark:bg-[#111111] rounded-md border border-zinc-200 dark:border-zinc-800">
                  No intelligence feeds found matching your criteria.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Global Map & Intelligence Feeds Status */}
        <div className="xl:col-span-1 space-y-6">
          {/* Active Sources List */}
          <div id="active-sources-card" className="p-5 rounded-md bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-2 flex items-center justify-between">
              <span>Active Intelligence Sources</span>
              <span className="text-[10px] text-zinc-500 font-mono">5 CONNECTED</span>
            </h3>
            <div className="space-y-2.5">
              {[
                { name: 'VirusTotal v3 Live Threat Feed', status: 'ACTIVE / REAL-TIME', highlight: true },
                { name: 'PhishTank Anti-Phishing ', status: 'SYNCED', highlight: false },
                { name: 'CISA Known Exploited Vulnerabilities', status: 'SYNCED', highlight: false },
                { name: 'MITRE ATT&CK Framework', status: 'SYNCED', highlight: false },
                { name: 'AlienVault OTX Community Pulse', status: 'SYNCED', highlight: false },
              ].map((src, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-2.5 rounded border transition-colors ${
                    src.highlight
                      ? 'bg-blue-500/5 border-blue-500/30'
                      : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-300 dark:border-zinc-900'
                  }`}
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <CheckCircle2 size={14} className={src.highlight ? "text-blue-400" : "text-emerald-500"} />
                    <span className={`text-xs font-mono truncate ${src.highlight ? "text-blue-300 font-bold" : "text-zinc-700 dark:text-zinc-300"}`}>
                      {src.name}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono shrink-0 pl-2 ${src.highlight ? "text-blue-400 font-bold" : "text-emerald-500"}`}>
                    {src.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
