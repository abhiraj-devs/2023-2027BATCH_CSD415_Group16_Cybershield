import React, { useState, useEffect } from "react";
import { Bell, AlertTriangle, CheckCircle2, Send, Settings, ShieldAlert, RefreshCw } from "lucide-react";
import { SecurityAlert } from "../types";
import { fetchAlerts, acknowledgeAlert, fetchSettings, updateSettings, testWebhook } from "../services/api";

export default function AlertsView() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [settings, setSettings] = useState({ discordWebhookUrl: "", slackWebhookUrl: "", minSeverity: "MEDIUM" });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    fetchAlerts().then(setAlerts).catch(() => {});
    fetchSettings().then(setSettings).catch(() => {});
  }, []);

  const handleAck = async (id: string) => {
    try {
      const updated = await acknowledgeAlert(id);
      setAlerts(alerts.map(a => a.id === id ? updated : a));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateSettings(settings);
      alert("Settings saved successfully.");
    } catch (e) {
      console.error(e);
      alert("Failed to save settings.");
    }
  };

  const handleTestWebhook = async (platform: "DISCORD" | "SLACK") => {
    setTesting(true);
    setTestResult(null);
    try {
      const url = platform === "DISCORD" ? settings.discordWebhookUrl : settings.slackWebhookUrl;
      const res = await testWebhook(platform, url || "");
      setTestResult(`${platform} test successful: ${res.message}`);
    } catch (e: any) {
      setTestResult(`${platform} test failed: ${e.message}`);
    } finally {
      setTesting(false);
      setTimeout(() => setTestResult(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-6 rounded-md bg-[#111111] border border-zinc-800">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-zinc-100 flex items-center space-x-2">
            <Bell size={20} className="text-zinc-400" />
            <span>SOC Alerting & Integrations</span>
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Manage live security alerts and configure external webhooks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Alerts List */}
        <div className="xl:col-span-2 space-y-4">
          <div className="p-5 rounded-md bg-[#111111] border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="text-sm font-bold text-zinc-100">Live Incident Queue</h3>
              <div className="flex items-center space-x-2 text-[10px] font-mono text-zinc-500 uppercase">
                <span>{alerts.filter(a => !a.acknowledged).length} Unacknowledged</span>
              </div>
            </div>
            
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 font-mono text-sm">No active alerts.</div>
              ) : (
                alerts.map(alert => (
                  <div key={alert.id} className={`p-4 rounded-md border ${
                    alert.acknowledged ? 'bg-zinc-950 border-zinc-900 opacity-70' : 
                    alert.severity === 'CRITICAL' ? 'bg-[#111111] border-red-900/50' :
                    alert.severity === 'HIGH' ? 'bg-[#111111] border-orange-900/50' : 'bg-[#111111] border-zinc-800'
                  }`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                      <div className="flex space-x-3 w-full sm:w-auto">
                        <div className={`mt-1 ${
                          alert.acknowledged ? 'text-zinc-600' :
                          alert.severity === 'CRITICAL' ? 'text-red-500' :
                          alert.severity === 'HIGH' ? 'text-orange-500' : 'text-blue-500'
                        }`}>
                          {alert.severity === 'CRITICAL' ? <ShieldAlert size={18} /> : <AlertTriangle size={18} />}
                        </div>
                        <div>
                          <h4 className={`text-sm font-bold ${alert.acknowledged ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                            {alert.title}
                          </h4>
                          <p className={`text-xs mt-1 font-mono ${alert.acknowledged ? 'text-zinc-600' : 'text-zinc-400'}`}>
                            {alert.message}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] font-mono text-zinc-500">
                            <span>{new Date(alert.timestamp).toLocaleString()}</span>
                            <span className="uppercase">{alert.source}</span>
                            <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                              alert.severity === 'CRITICAL' ? 'text-red-500 bg-red-500/10' :
                              alert.severity === 'HIGH' ? 'text-orange-500 bg-orange-500/10' : 'text-blue-500 bg-blue-500/10'
                            }`}>
                              {alert.severity}
                            </span>
                          </div>
                        </div>
                      </div>
                      {!alert.acknowledged && (
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => { alert("Action initiated: Initiating automated forensic investigation timeline..."); handleAck(alert.id); }}
                            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1 px-3 py-2 sm:py-1.5 rounded bg-blue-950/40 hover:bg-blue-900/60 text-blue-400 text-[10px] font-mono border border-blue-900/60 transition-colors"
                          >
                            <span>INVESTIGATE</span>
                          </button>
                          <button
                            onClick={() => { alert("Action initiated: Added indicator to global whitelist and closed alert."); handleAck(alert.id); }}
                            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1 px-3 py-2 sm:py-1.5 rounded bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 text-[10px] font-mono border border-emerald-900/60 transition-colors"
                          >
                            <span>WHITELIST</span>
                          </button>
                          <button
                            onClick={() => { alert("Action initiated: Target isolated and quarantined from network."); handleAck(alert.id); }}
                            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1 px-3 py-2 sm:py-1.5 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 text-[10px] font-mono border border-rose-900/60 transition-colors"
                          >
                            <span>QUARANTINE</span>
                          </button>
                          <button
                            onClick={() => handleAck(alert.id)}
                            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1 px-3 py-2 sm:py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[10px] font-mono border border-zinc-800 transition-colors"
                          >
                            <CheckCircle2 size={12} />
                            <span>ACKNOWLEDGE</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        <div className="xl:col-span-1 space-y-6">
          <div className="p-5 rounded-md bg-[#111111] border border-zinc-800 space-y-6">
            <div className="flex items-center space-x-2 border-b border-zinc-800 pb-2">
              <Settings size={16} className="text-zinc-400" />
              <h3 className="text-sm font-bold text-zinc-100">Integration Settings</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-wider mb-2">Discord Webhook URL</label>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    value={settings.discordWebhookUrl}
                    onChange={(e) => setSettings({...settings, discordWebhookUrl: e.target.value})}
                    placeholder="https://discord.com/api/webhooks/..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors font-mono"
                  />
                  <button 
                    onClick={() => handleTestWebhook("DISCORD")}
                    disabled={testing || !settings.discordWebhookUrl}
                    className="px-3 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 disabled:opacity-50 transition-colors"
                    title="Test Discord Webhook"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-wider mb-2">Slack Webhook URL</label>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    value={settings.slackWebhookUrl}
                    onChange={(e) => setSettings({...settings, slackWebhookUrl: e.target.value})}
                    placeholder="https://hooks.slack.com/services/..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors font-mono"
                  />
                  <button 
                    onClick={() => handleTestWebhook("SLACK")}
                    disabled={testing || !settings.slackWebhookUrl}
                    className="px-3 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 disabled:opacity-50 transition-colors"
                    title="Test Slack Webhook"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-wider mb-2">Alert Threshold</label>
                <select 
                  value={settings.minSeverity}
                  onChange={(e) => setSettings({...settings, minSeverity: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors font-mono"
                >
                  <option value="INFO">INFO & Above</option>
                  <option value="MEDIUM">MEDIUM & Above</option>
                  <option value="HIGH">HIGH & Above</option>
                  <option value="CRITICAL">CRITICAL Only</option>
                </select>
              </div>

              {testResult && (
                <div className={`p-3 rounded text-[10px] font-mono border ${testResult.includes('failed') ? 'bg-red-950/30 border-red-900/50 text-red-500' : 'bg-emerald-950/30 border-emerald-900/50 text-emerald-500'}`}>
                  {testResult}
                </div>
              )}

              <button 
                onClick={handleSaveSettings}
                className="w-full py-2 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs transition-colors"
              >
                SAVE CONFIGURATION
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
