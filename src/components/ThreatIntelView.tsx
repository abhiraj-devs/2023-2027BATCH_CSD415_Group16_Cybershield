import React, { useState, useEffect } from "react";
import { Globe, Search, RefreshCw, AlertTriangle, ShieldAlert, CheckCircle2, Shield, ChevronUp, ChevronDown } from "lucide-react";
import { ThreatItem } from "../types";
import { fetchThreatIntel, refreshThreatIntel } from "../services/api";

const MapView = () => {
  // Simple SVG World Map with mock data points for malicious traffic
  const points = [
    { x: 350, y: 150, severity: "CRITICAL" },
    { x: 500, y: 200, severity: "HIGH" },
    { x: 200, y: 180, severity: "MEDIUM" },
    { x: 100, y: 250, severity: "HIGH" },
  ];

  return (
    <div className="p-5 rounded-md bg-[#111111] border border-zinc-800">
      <h3 className="text-sm font-bold text-zinc-100 mb-4 flex items-center space-x-2 border-b border-zinc-800 pb-2">
        <Globe size={16} className="text-zinc-400" />
        <span>Global Threat Origins</span>
      </h3>
      <div className="relative w-full aspect-video bg-zinc-950 rounded border border-zinc-900 flex items-center justify-center overflow-hidden">
        {/* Simplified abstract map shapes */}
        <div className="absolute inset-0 opacity-20">
          <svg viewBox="0 0 800 400" className="w-full h-full text-zinc-500 fill-current">
            <path d="M150 100 Q 200 50 250 100 T 350 100 T 450 150 T 550 100 T 650 150 L 650 300 Q 550 250 450 300 T 250 300 T 150 250 Z" />
            <path d="M50 150 Q 100 100 120 150 T 150 200 L 100 250 Z" />
            <path d="M600 250 Q 650 200 700 250 T 750 300 L 650 350 Z" />
          </svg>
        </div>
        
        {/* Map Grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />

        {/* Threat Pulses */}
        {points.map((p, i) => (
          <div key={i} className="absolute" style={{ left: `${(p.x / 800) * 100}%`, top: `${(p.y / 400) * 100}%` }}>
            <div className={`relative flex items-center justify-center`}>
              <div className={`absolute w-4 h-4 rounded-full animate-ping ${
                p.severity === 'CRITICAL' ? 'bg-red-500/50' : 
                p.severity === 'HIGH' ? 'bg-orange-500/50' : 'bg-yellow-500/50'
              }`} />
              <div className={`w-1.5 h-1.5 rounded-full ${
                p.severity === 'CRITICAL' ? 'bg-red-500' : 
                p.severity === 'HIGH' ? 'bg-orange-500' : 'bg-yellow-500'
              }`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function ThreatIntelView({ searchQuery }: { searchQuery: string }) {
  const [intel, setIntel] = useState<ThreatItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchThreatIntel().then(data => {
      setIntel(data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await refreshThreatIntel();
      setIntel(data);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredIntel = intel.filter(item => 
    item.threatName.toLowerCase().includes((searchQuery || "").toLowerCase()) ||
    item.source.toLowerCase().includes((searchQuery || "").toLowerCase()) ||
    item.cveId?.toLowerCase().includes((searchQuery || "").toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-md bg-[#111111] border border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 flex items-center space-x-2">
            <Globe size={20} className="text-zinc-400" />
            <span>Threat Intelligence Feeds</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Aggregated IoCs and CVEs from CISA, MITRE, and global SOC networks.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="w-full md:w-auto justify-center px-4 py-2 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs transition-colors flex items-center space-x-2 disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          <span>SYNC FEEDS</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          {/* Feed List */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h3 className="text-sm font-bold text-zinc-100">Latest Advisories</h3>
            <span className="text-[10px] text-zinc-500 font-mono">{filteredIntel.length} items found</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <RefreshCw className="animate-spin text-zinc-500" />
            </div>
          ) : (
            <div className="space-y-3">
              {filteredIntel.map(item => (
                <div key={item.id} className="rounded-md bg-[#111111] border border-zinc-800 overflow-hidden transition-all hover:border-zinc-700">
                  <div 
                    className="p-4 cursor-pointer flex items-center justify-between"
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded ${
                        item.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-500' :
                        item.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {item.severity === 'CRITICAL' ? <AlertTriangle size={16} /> : <ShieldAlert size={16} />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-200">{item.threatName}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-[10px] text-zinc-500 font-mono">{new Date(item.publishedAt).toLocaleDateString()}</span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded font-mono text-zinc-400">{item.source}</span>
                          {item.cveId && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded font-mono text-blue-400">{item.cveId}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
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
                    <div className="p-4 border-t border-zinc-800 bg-zinc-950/50">
                      <p className="text-sm text-zinc-300 leading-relaxed font-sans mb-4">
                        {item.description}
                      </p>
                      {item.indicators.length > 0 && (
                        <div>
                          <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Indicators of Compromise (IoCs)</h5>
                          <div className="flex flex-wrap gap-2">
                            {item.indicators.map((ioc, idx) => (
                              <span key={idx} className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300">
                                {ioc}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {filteredIntel.length === 0 && (
                <div className="text-center py-12 text-zinc-500 text-sm font-mono">
                  No intelligence feeds found matching your criteria.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="xl:col-span-1 space-y-6">
          <MapView />
          
          <div className="p-5 rounded-md bg-[#111111] border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-zinc-100 border-b border-zinc-800 pb-2">Active Sources</h3>
            <div className="space-y-3">
              {['CISA Known Exploited Vulnerabilities', 'MITRE ATT&CK Feed', 'AlienVault OTX', 'Local SOC Telemetry', 'CertStream SSL Parked Domains'].map((src, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-zinc-950 border border-zinc-900">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="text-xs font-mono text-zinc-300">{src}</span>
                  </div>
                  <span className="text-[10px] text-emerald-500 font-mono">SYNCED</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
