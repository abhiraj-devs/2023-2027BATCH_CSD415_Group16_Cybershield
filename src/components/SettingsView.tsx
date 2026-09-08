import React from "react";
import { Settings, Cpu, Shield, Database, Lock } from "lucide-react";

export default function SettingsView() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-md bg-[#111111] border border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 flex items-center space-x-2">
            <Settings size={20} className="text-zinc-400" />
            <span>System Preferences</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Machine learning model parameters, security configuration, and API access credentials.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-md bg-[#111111] border border-zinc-800 space-y-4">
          <div className="flex items-center space-x-2 border-b border-zinc-800 pb-2">
            <Cpu size={16} className="text-zinc-400" />
            <h3 className="text-sm font-bold text-zinc-100">AI Model Configuration</h3>
          </div>
          
          <div className="space-y-4 text-sm font-mono text-zinc-300">
            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Phishing Engine</label>
              <div className="p-2 bg-zinc-950 border border-zinc-900 rounded">RF_Classifier_v1.0.0 (Lexical)</div>
            </div>
            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Threat Explanation Model</label>
              <div className="p-2 bg-zinc-950 border border-zinc-900 rounded">gemini-2.5-pro</div>
            </div>
            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Confidence Threshold</label>
              <input type="range" className="w-full" min="0" max="100" defaultValue="85" />
              <div className="text-right text-[10px] text-zinc-500 mt-1">85%</div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-md bg-[#111111] border border-zinc-800 space-y-4">
          <div className="flex items-center space-x-2 border-b border-zinc-800 pb-2">
            <Shield size={16} className="text-zinc-400" />
            <h3 className="text-sm font-bold text-zinc-100">API Integrations</h3>
          </div>
          
          <div className="space-y-4 text-sm font-mono text-zinc-300">
            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">VirusTotal API Key</label>
              <input type="password" value="************************" readOnly className="w-full p-2 bg-zinc-950 border border-zinc-900 rounded focus:outline-none text-zinc-500" />
            </div>
            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">CISA Feed Sync</label>
              <select className="w-full p-2 bg-zinc-950 border border-zinc-900 rounded focus:outline-none">
                <option>Every 6 Hours</option>
                <option>Every 12 Hours</option>
                <option>Daily</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
