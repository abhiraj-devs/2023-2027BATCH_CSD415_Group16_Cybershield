import React, { useState, useEffect } from "react";
import { Globe, RefreshCw, AlertTriangle, ShieldAlert, ChevronUp, ChevronDown, ExternalLink, Copy, Check } from "lucide-react";
import { ThreatItem } from "../types";
import { fetchThreatIntel, refreshThreatIntel, getVirusTotalStatus } from "../services/api";

export default function ThreatIntelView({ searchQuery }: { searchQuery: string }) {
  const [intel, setIntel] = useState<ThreatItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>("vt_lockbit");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "VT" | "HASH" | "IP" | "DOMAIN" | "CVE">("ALL");

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchThreatIntel(), getVirusTotalStatus()])
      .then(([threatData]) => {
        setIntel(threatData || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await refreshThreatIntel();
      setIntel(data || []);
    } catch {} finally {
      setRefreshing(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = intel.filter((item) => {
    const matchesFilter =
      activeFilter === "ALL" ||
      (activeFilter === "VT" && item.source.includes("VirusTotal")) ||
      item.indicatorType === activeFilter;

    if (!matchesFilter) return false;
    if (!searchQuery) return true;

    const q = searchQuery.toLowerCase();
    return (
      item.threatName.toLowerCase().includes(q) ||
      item.indicator.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.source.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
              <Globe size={22} className="text-emerald-500" />
              <span>Real-Time Global Threat Intelligence</span>
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
              LIVE FEEDS
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Aggregated indicators of compromise from CISA KEV, AlienVault OTX, CertStream, and VirusTotal v3.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer shadow-sm w-fit"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          <span>{refreshing ? "SYNCING FEEDS..." : "REFRESH THREAT FEEDS"}</span>
        </button>
      </div>

      {/* Filter Badges */}
      <div className="flex flex-wrap items-center gap-2">
        {(["ALL", "CVE", "IP", "DOMAIN", "HASH", "VT"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              activeFilter === f
                ? "bg-emerald-600 text-white font-semibold"
                : "bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            {f === "ALL" ? "All Indicators" : f === "VT" ? "VirusTotal Live" : `${f} Feeds`}
          </button>
        ))}
      </div>

      {/* Intel Feed Items */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <div
              key={item.id}
              className="p-5 rounded-xl bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 space-y-3 transition-colors shadow-xs"
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    <ShieldAlert
                      size={20}
                      className={
                        item.severity === "CRITICAL" ? "text-rose-500" :
                        item.severity === "HIGH" ? "text-amber-500" : "text-blue-400"
                      }
                    />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        item.severity === "CRITICAL" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                        item.severity === "HIGH" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-blue-500/10 text-blue-400"
                      }`}>
                        {item.severity}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-500">
                        {item.indicatorType}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">
                        {item.source}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
                      {item.threatName}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center space-x-3 sm:self-center">
                  <span className="text-xs font-mono text-zinc-500">
                    {new Date(item.updatedAt || item.publishedAt).toLocaleDateString()}
                  </span>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {/* Indicator Banner */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-mono">
                <span className="text-zinc-700 dark:text-zinc-300 truncate max-w-xl">
                  {item.indicator}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(item.indicator, item.id);
                  }}
                  className="text-zinc-500 hover:text-emerald-400 p-1 flex items-center gap-1 text-[11px]"
                >
                  {copiedId === item.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copiedId === item.id ? "Copied" : "Copy"}</span>
                </button>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 space-y-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  <p>{item.description}</p>

                  {item.vtStats && (
                    <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between font-mono text-[11px]">
                      <span className="text-zinc-500">VirusTotal Detection Ratio:</span>
                      <span className="font-bold text-rose-400">
                        {item.vtStats.malicious} malicious / {item.vtStats.total} engines
                      </span>
                    </div>
                  )}

                  {item.sourceOrigin?.externalUrl && (
                    <div className="pt-1">
                      <a
                        href={item.sourceOrigin.externalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-500 hover:underline inline-flex items-center space-x-1 font-mono text-[11px]"
                      >
                        <span>View Source Intelligence Bulletin</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
