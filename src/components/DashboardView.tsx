import React from "react";
import { 
  ShieldAlert, 
  Bug, 
  Radio, 
  Globe, 
  Bell, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle,
  Activity,
  ArrowUpRight,
  Download,
  Zap
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  CartesianGrid 
} from "recharts";
import { DashboardSummary, SecurityAlert, NetworkEvent, ThreatItem } from "../types";

interface DashboardViewProps {
  summary: DashboardSummary | null;
  alerts: SecurityAlert[];
  networkEvents: NetworkEvent[];
  threatIntel: ThreatItem[];
  onNavigate: (tab: string) => void;
}

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

export default function DashboardView({
  summary, alerts, networkEvents, threatIntel, onNavigate,
}: DashboardViewProps) {
  
  const handleDownloadReport = () => {
    let csv = "Type,ID,Timestamp,Severity/Status,Detail\n";

    alerts.forEach(a => {
      csv += `Alert,${a.id},${a.createdAt},${a.severity},"${a.title}: ${a.message.replace(/"/g, '""')}"\n`;
    });

    networkEvents.forEach(e => {
      csv += `Network,${e.id},${e.timestamp},${e.severity},"${e.eventType} (${e.sourceIp} -> ${e.destinationIp})"\n`;
    });

    threatIntel.forEach(t => {
      csv += `ThreatIntel,${t.id},${t.publishedAt},${t.severity},"${t.threatName}: ${t.description.replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", `CyberShield_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const activityData = [
    { time: "00:00", scans: 12, threats: 1, anomalies: 3 },
    { time: "04:00", scans: 8, threats: 0, anomalies: 1 },
    { time: "08:00", scans: 45, threats: 4, anomalies: 7 },
    { time: "12:00", scans: 78, threats: 9, anomalies: 12 },
    { time: "16:00", scans: 62, threats: 6, anomalies: 8 },
    { time: "20:00", scans: 34, threats: 2, anomalies: 4 },
    { time: "24:00", scans: 25, threats: 3, anomalies: 5 },
  ];

  const severityDistribution = [
    { name: "Critical", value: alerts.filter(a => a.severity === 'CRITICAL').length || 2, color: "#ef4444" },
    { name: "High", value: alerts.filter(a => a.severity === 'HIGH').length || 4, color: "#f97316" },
    { name: "Medium", value: alerts.filter(a => a.severity === 'MEDIUM').length || 7, color: "#eab308" },
    { name: "Low/Safe", value: 18, color: "#3b82f6" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 sm:gap-6 p-4 sm:p-6 rounded-md bg-[#111111] border border-zinc-800">
        <div className="space-y-1.5 sm:space-y-2 max-w-2xl min-w-0">
          <div className="flex items-center space-x-2 text-zinc-500 text-xs font-mono font-semibold uppercase tracking-wider">
            <ShieldCheck size={14} />
            <span>SOC Status: Active</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-100">
            System Overview
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
            Real-time multi-vector telemetry, Random Forest URL classification, virus hash analysis, and integrated threat intelligence feeds.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0">
          <button
            onClick={() => onNavigate('phishing')}
            className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded text-zinc-950 bg-zinc-100 hover:bg-white font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
          >
            <span>Scan URL</span>
            <ArrowUpRight size={14} />
          </button>
          <button
            onClick={() => onNavigate('malware')}
            className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs transition-colors text-center"
          >
            Scan Hash
          </button>
          <button
            onClick={handleDownloadReport}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 rounded bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1 */}
        <div className="p-4 rounded-md bg-[#111111] border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-mono uppercase">Total Scans</span>
            <Activity size={16} />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-zinc-100 font-mono">{summary?.totalScans || 248}</span>
            <span className="text-[10px] font-mono text-emerald-500 flex items-center">
              <TrendingUp size={10} className="mr-0.5" /> 12.4%
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-4 rounded-md bg-[#111111] border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-mono uppercase">Phishing Threats</span>
            <ShieldAlert size={16} />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-red-500 font-mono">{summary?.phishingThreats || 14}</span>
            <span className="text-[10px] font-mono text-zinc-500">BLOCKED</span>
          </div>
        </div>
      </div>

      {/* Inference Performance Monitor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-md bg-[#111111] border border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">Deep Learning Inference Latency</div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-zinc-100 font-mono">15.85</span>
              <span className="text-sm text-zinc-500 font-mono">ms / request</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Activity size={18} className="text-blue-500" />
          </div>
        </div>
        <div className="p-4 rounded-md bg-[#111111] border border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">Request Processing Rate</div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-zinc-100 font-mono">145</span>
              <span className="text-sm text-zinc-500 font-mono">req / s</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
            <Zap size={18} className="text-purple-500" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Activity Over Time */}
        <div className="lg:col-span-2 p-5 rounded-md bg-[#111111] border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-100">Telemetry Volume</h3>
            <div className="px-2 py-0.5 rounded text-[10px] font-mono text-zinc-500 border border-zinc-800">
              24-HR ROLLING
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <CartesianGrid strokeDasharray="2 2" stroke="#222" vertical={false} />
                <XAxis dataKey="time" stroke="#555" textAnchor="end" tick={{fontSize: 10, fontFamily: 'monospace'}} axisLine={false} tickLine={false} />
                <YAxis stroke="#555" tick={{fontSize: 10, fontFamily: 'monospace'}} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="scans" stroke="#3b82f6" strokeWidth={2} fillOpacity={0.1} fill="#3b82f6" name="Total Scans" />
                <Area type="monotone" dataKey="threats" stroke="#ef4444" strokeWidth={2} fillOpacity={0.1} fill="#ef4444" name="Threats" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Threat Severity Distribution */}
        <div className="p-5 rounded-md bg-[#111111] border border-zinc-800 flex flex-col">
          <h3 className="text-sm font-bold text-zinc-100 mb-4">Alert Severity</h3>
          
          <div className="flex-1 min-h-[160px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {severityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 mt-4">
            {severityDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-zinc-400">{item.name}</span>
                </div>
                <span className="text-zinc-200 font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Events & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <div className="p-5 rounded-md bg-[#111111] border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-100">Security Alerts</h3>
            <button onClick={() => onNavigate('alerts')} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              VIEW ALL
            </button>
          </div>

          <div className="space-y-0">
            {alerts.slice(0, 5).map((alert, idx) => (
              <div key={alert.id} className={`py-3 flex items-start space-x-3 ${idx !== 0 ? 'border-t border-zinc-800/50' : ''}`}>
                <div className={`mt-0.5 w-1.5 h-1.5 rounded-full ${
                  alert.severity === 'CRITICAL' ? 'bg-red-500' :
                  alert.severity === 'HIGH' ? 'bg-orange-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-200 truncate">{alert.title}</span>
                    <span className="text-[10px] text-zinc-600 font-mono">
                      {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Network Traffic */}
        <div className="p-5 rounded-md bg-[#111111] border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-100">Network Telemetry</h3>
            <button onClick={() => onNavigate('network')} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              VIEW FEED
            </button>
          </div>

          <div className="space-y-0">
            {networkEvents.slice(0, 5).map((evt, idx) => (
              <div key={evt.id} className={`py-3 flex items-center justify-between gap-2 ${idx !== 0 ? 'border-t border-zinc-800/50' : ''}`}>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] sm:text-xs font-bold text-zinc-200 font-mono truncate">
                    {evt.sourceIp} <span className="text-zinc-600">→</span> {evt.destinationIp}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-zinc-500 mt-0.5 truncate">{evt.eventType}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[11px] font-mono font-bold text-zinc-300">{evt.bandwidthMbps} Mbps</div>
                  <div className="text-[10px] text-zinc-600 font-mono">{evt.protocol}:{evt.port}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
