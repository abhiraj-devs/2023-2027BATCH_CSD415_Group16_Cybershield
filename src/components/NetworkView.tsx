import React, { useState, useEffect } from "react";
import { Radio, Activity, ArrowUpRight, ShieldAlert, Cpu, RefreshCw, Terminal } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { NetworkEvent } from "../types";
import { fetchNetworkEvents, fetchNetworkSummary } from "../services/api";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111111] border border-[#333] p-3 rounded-md shadow-lg">
        <p className="text-xs font-mono text-zinc-300 mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-xs font-mono" style={{ color: p.color }}>
            {p.name}: <span className="font-bold text-white">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function NetworkView() {
  const [events, setEvents] = useState<NetworkEvent[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [evData, sumData] = await Promise.all([
        fetchNetworkEvents(),
        fetchNetworkSummary()
      ]);
      setEvents(evData);
      setSummary(sumData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    await loadData();
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-md bg-[#111111] border border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 flex items-center space-x-2">
            <Radio size={20} className="text-zinc-400" />
            <span>Network Telemetry & Traffic Analysis</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Real-time packet inspection and anomaly detection across all endpoints.
          </p>
        </div>

        <button 
          onClick={handleRefresh}
          className="flex items-center space-x-2 text-[10px] font-mono text-zinc-400 px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 uppercase tracking-wider transition-colors"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          <span>Force Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-md bg-[#111111] border border-zinc-800 flex items-center space-x-4">
          <div className="w-10 h-10 rounded bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Activity size={18} className="text-blue-500" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Active Conns</div>
            <div className="text-xl font-bold text-zinc-100 font-mono">{summary?.activeConnections || 0}</div>
          </div>
        </div>
        
        <div className="p-4 rounded-md bg-[#111111] border border-zinc-800 flex items-center space-x-4">
          <div className="w-10 h-10 rounded bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
            <ArrowUpRight size={18} className="text-orange-500" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Total Bandwidth</div>
            <div className="text-xl font-bold text-zinc-100 font-mono">{summary?.totalBandwidthMbps || 0} Mbps</div>
          </div>
        </div>

        <div className="p-4 rounded-md bg-[#111111] border border-zinc-800 flex items-center space-x-4">
          <div className="w-10 h-10 rounded bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <ShieldAlert size={18} className="text-red-500" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Anomalies Detected</div>
            <div className="text-xl font-bold text-zinc-100 font-mono">{summary?.anomaliesDetected || 0}</div>
          </div>
        </div>
      </div>

      <div className="p-5 rounded-md bg-[#111111] border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <h3 className="text-sm font-bold text-zinc-100">Live Traffic Feed</h3>
          <div className="flex items-center space-x-2 text-[10px] font-mono text-emerald-500 uppercase tracking-wider">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Streaming</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                <th className="py-2 px-3 font-normal">Event Type</th>
                <th className="py-2 px-3 font-normal">Source IP</th>
                <th className="py-2 px-3 font-normal">Dest IP</th>
                <th className="py-2 px-3 font-normal">Protocol</th>
                <th className="py-2 px-3 font-normal">Bandwidth</th>
                <th className="py-2 px-3 font-normal">Severity</th>
                <th className="py-2 px-3 font-normal">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-xs font-mono">
              {events.map((evt) => (
                <tr key={evt.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="py-2.5 px-3">
                    <span className="text-zinc-200">{evt.eventType}</span>
                  </td>
                  <td className="py-2.5 px-3 text-zinc-400">{evt.sourceIp}</td>
                  <td className="py-2.5 px-3 text-zinc-400">{evt.destinationIp}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 border border-zinc-700">
                      {evt.protocol}:{evt.port}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-zinc-300">{evt.bandwidthMbps} Mbps</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      evt.severity === 'CRITICAL' ? 'text-red-500 bg-red-500/10' :
                      evt.severity === 'HIGH' ? 'text-orange-500 bg-orange-500/10' :
                      evt.severity === 'MEDIUM' ? 'text-yellow-500 bg-yellow-500/10' :
                      'text-blue-500 bg-blue-500/10'
                    }`}>
                      {evt.severity}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[10px] text-zinc-600">{new Date(evt.timestamp).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
