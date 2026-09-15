import React, { useState, useEffect } from "react";
import { Radio, Activity, ArrowUpRight, ShieldAlert, Cpu, RefreshCw, Terminal, Globe, Gauge, Download, Upload, Play } from "lucide-react";
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
  const [chartData, setChartData] = useState<any[]>(Array.from({ length: 20 }, (_, i) => ({
    time: new Date(Date.now() - (20 - i) * 5000).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }),
    bandwidth: Math.floor(Math.random() * 10) + 15
  })));

  // Speed test state
  const [testState, setTestState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [testPhase, setTestPhase] = useState<'ping' | 'download' | 'upload' | null>(null);
  const [metrics, setMetrics] = useState({ ping: 0, download: 0, upload: 0 });
  const [progress, setProgress] = useState(0);

  const loadData = async () => {
    try {
      const [evRes, sumRes] = await Promise.allSettled([
        fetchNetworkEvents(),
        fetchNetworkSummary()
      ]);
      
      if (evRes.status === "fulfilled" && evRes.value) {
        setEvents(evRes.value);
      }
      if (sumRes.status === "fulfilled" && sumRes.value) {
        const newSummary = sumRes.value;
        setSummary(newSummary);
        
        const now = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
        setChartData(prev => {
          const newData = [...prev.slice(1), { time: now, bandwidth: newSummary.currentBandwidthMbps || 0 }];
          return newData;
        });
      }
    } catch {
      // Safe fallback handled in api service
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

  const runSpeedTest = async () => {
    if (testState === 'running') return;
    setTestState('running');
    setMetrics({ ping: 0, download: 0, upload: 0 });
    setProgress(0);

    try {
      // Real Ping
      setTestPhase('ping');
      let pingSum = 0;
      for (let i = 0; i < 3; i++) {
        const startPing = performance.now();
        await fetch('/api/network/speedtest/ping', { cache: 'no-store' });
        const endPing = performance.now();
        pingSum += (endPing - startPing);
        setProgress(5 + i * 5);
      }
      setMetrics(m => ({ ...m, ping: Math.round(pingSum / 3) }));
      setProgress(20);

      // Real Download
      setTestPhase('download');
      const startDown = performance.now();
      const downRes = await fetch('/api/network/speedtest/download', { cache: 'no-store' });
      const downBlob = await downRes.blob();
      const endDown = performance.now();
      
      const downSeconds = (endDown - startDown) / 1000;
      const downBytes = downBlob.size;
      const downMbps = Math.round((downBytes * 8) / (1024 * 1024) / Math.max(downSeconds, 0.001)) || 0;
      setMetrics(m => ({ ...m, download: downMbps }));
      setProgress(60);

      // Real Upload
      setTestPhase('upload');
      // Create a 5MB payload
      const upBlob = new Blob([new Uint8Array(5 * 1024 * 1024)]);
      const startUp = performance.now();
      await fetch('/api/network/speedtest/upload', {
        method: 'POST',
        body: upBlob,
        headers: { 'Content-Type': 'application/octet-stream' }
      });
      const endUp = performance.now();
      
      const upSeconds = (endUp - startUp) / 1000;
      const upBytes = upBlob.size;
      const upMbps = Math.round((upBytes * 8) / (1024 * 1024) / Math.max(upSeconds, 0.001)) || 0;
      setMetrics(m => ({ ...m, upload: upMbps }));
    } catch (e) {
      console.error("Speed test failed", e);
    }

    setTestPhase(null);
    setTestState('completed');
    setProgress(100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-6 rounded-md bg-[#111111] border border-zinc-800">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-zinc-100 flex items-center space-x-2">
            <Radio size={20} className="text-zinc-400" />
            <span>Network Telemetry</span>
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Real-time packet inspection and anomaly detection across all endpoints.
          </p>
        </div>
        <button 
          onClick={handleRefresh}
          className="flex items-center justify-center space-x-2 text-[10px] font-mono text-zinc-400 px-3 py-2 sm:py-1.5 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 uppercase tracking-wider transition-colors w-full sm:w-auto cursor-pointer"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          <span>Force Refresh</span>
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <div className="w-10 h-10 rounded bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Globe size={18} className="text-emerald-500" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Current Bandwidth</div>
            <div className="text-xl font-bold text-zinc-100 font-mono">{summary?.currentBandwidthMbps || 0} Mbps</div>
          </div>
        </div>

        <div className="p-4 rounded-md bg-[#111111] border border-zinc-800 flex items-center space-x-4">
          <div className="w-10 h-10 rounded bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
            <ArrowUpRight size={18} className="text-orange-500" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Peak Bandwidth</div>
            <div className="text-xl font-bold text-zinc-100 font-mono">{summary?.peakBandwidthMbps || 0} Mbps</div>
          </div>
        </div>

        <div className="p-4 rounded-md bg-[#111111] border border-zinc-800 flex items-center space-x-4">
          <div className="w-10 h-10 rounded bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <ShieldAlert size={18} className="text-red-500" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Anomalies Detected</div>
            <div className="text-xl font-bold text-zinc-100 font-mono">{events.filter(e => e.anomalyScore > 60).length || summary?.anomaliesDetected || 0}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bandwidth Chart */}
        <div className="lg:col-span-2 p-4 sm:p-6 rounded-md bg-[#111111] border border-zinc-800 space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-100">Live Network Bandwidth</h3>
            <div className="flex items-center space-x-2 text-[10px] font-mono text-emerald-500 uppercase tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live (Mbps)</span>
            </div>
          </div>
          <div className="flex-1 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBandwidth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#52525b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  minTickGap={20}
                />
                <YAxis 
                  stroke="#52525b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `${val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="bandwidth" 
                  name="Bandwidth" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorBandwidth)" 
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Protocols & Speed Test */}
        <div className="space-y-6 flex flex-col">
          {/* Protocol Distribution */}
          <div className="p-4 sm:p-6 rounded-md bg-[#111111] border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-zinc-100 border-b border-zinc-800 pb-3">Protocol Distribution</h3>
            <div className="space-y-4 pt-2">
              {(summary?.protocols || []).map((proto: any, idx: number) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-zinc-300">{proto.protocol}</span>
                    <span className="font-mono text-zinc-400">{proto.percentage}%</span>
                  </div>
                  <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx === 0 ? 'bg-blue-500' : 
                        idx === 1 ? 'bg-emerald-500' : 
                        idx === 2 ? 'bg-purple-500' : 
                        idx === 3 ? 'bg-orange-500' : 'bg-zinc-500'
                      }`} 
                      style={{ width: `${proto.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Network Speed Test */}
          <div className="p-4 sm:p-6 rounded-md bg-[#111111] border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-blue-500" />
                Network Speed Test
              </h3>
              <button
                onClick={runSpeedTest}
                disabled={testState === 'running'}
                className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer"
              >
                {testState === 'running' ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 text-emerald-500" />}
                {testState === 'running' ? 'Testing' : 'Start'}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              <div className="p-2 rounded bg-zinc-950 border border-zinc-900">
                <div className="text-[10px] uppercase text-zinc-500 font-mono flex items-center justify-center gap-1 mb-2">
                  <Activity className="w-3 h-3" /> Ping
                </div>
                <div className={`text-sm font-mono font-bold ${testPhase === 'ping' ? 'text-blue-500 animate-pulse' : 'text-zinc-200'}`}>
                  {testState === 'idle' ? '--' : metrics.ping} <span className="text-[10px] text-zinc-500 font-normal">ms</span>
                </div>
              </div>
              <div className="p-2 rounded bg-zinc-950 border border-zinc-900">
                <div className="text-[10px] uppercase text-zinc-500 font-mono flex items-center justify-center gap-1 mb-2">
                  <Download className="w-3 h-3 text-emerald-500" /> Down
                </div>
                <div className={`text-sm font-mono font-bold ${testPhase === 'download' ? 'text-emerald-500 animate-pulse' : 'text-zinc-200'}`}>
                  {testState === 'idle' && testPhase !== 'download' ? '--' : metrics.download} <span className="text-[10px] text-zinc-500 font-normal">Mbps</span>
                </div>
              </div>
              <div className="p-2 rounded bg-zinc-950 border border-zinc-900">
                <div className="text-[10px] uppercase text-zinc-500 font-mono flex items-center justify-center gap-1 mb-2">
                  <Upload className="w-3 h-3 text-purple-500" /> Up
                </div>
                <div className={`text-sm font-mono font-bold ${testPhase === 'upload' ? 'text-purple-500 animate-pulse' : 'text-zinc-200'}`}>
                  {testState === 'idle' && testPhase !== 'upload' ? '--' : metrics.upload} <span className="text-[10px] text-zinc-500 font-normal">Mbps</span>
                </div>
              </div>
            </div>

            {testState === 'running' && (
              <div className="w-full bg-zinc-900 rounded-full h-1 mt-2 overflow-hidden">
                <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Traffic Feed */}
      <div className="p-4 sm:p-6 rounded-md bg-[#111111] border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h3 className="text-sm font-bold text-zinc-100">Live Traffic Feed</h3>
          <div className="flex items-center space-x-2 text-[10px] font-mono text-emerald-500 uppercase tracking-wider">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Streaming</span>
          </div>
        </div>
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-left border-collapse min-w-[640px]">
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
                  <td className="py-3 px-3">
                    <span className="text-zinc-200">{evt.eventType}</span>
                  </td>
                  <td className="py-3 px-3 text-zinc-400">{evt.sourceIp}</td>
                  <td className="py-3 px-3 text-zinc-400">{evt.destinationIp}</td>
                  <td className="py-3 px-3">
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 border border-zinc-700">
                      {evt.protocol}:{evt.port}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-zinc-300">{evt.bandwidthMbps} Mbps</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      evt.severity === 'CRITICAL' ? 'text-red-500 bg-red-500/10' :
                      evt.severity === 'HIGH' ? 'text-orange-500 bg-orange-500/10' :
                      evt.severity === 'MEDIUM' ? 'text-yellow-500 bg-yellow-500/10' :
                      'text-blue-500 bg-blue-500/10'
                    }`}>
                      {evt.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[10px] text-zinc-600">{new Date(evt.timestamp).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
