import React from "react";
import { User, Trash2, Database, Shield } from "lucide-react";
import { clearAllHistory } from "../services/api";

export default function ProfileSettingsView() {
  const handleClearCache = async () => {
    try {
      await clearAllHistory();
      alert("Cache and local logs cleared successfully!");
    } catch (e) {
      alert("Failed to clear data.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-md bg-[#111111] border border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 flex items-center space-x-2">
            <User size={20} className="text-zinc-400" />
            <span>Operator Profile</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Manage your SOC operator profile, active sessions, and local data cache.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-md bg-[#111111] border border-zinc-800 space-y-4">
          <div className="flex items-center space-x-2 border-b border-zinc-800 pb-2">
            <Shield size={16} className="text-zinc-400" />
            <h3 className="text-sm font-bold text-zinc-100">Authentication & Access</h3>
          </div>
          <div className="space-y-4 text-sm font-mono text-zinc-300">
            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Operator ID</label>
              <div className="p-2 bg-zinc-950 border border-zinc-900 rounded">OP-8894 (Local Dev)</div>
            </div>
            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Access Level</label>
              <div className="p-2 bg-zinc-950 border border-zinc-900 rounded text-emerald-500 font-bold">L4 - System Admin</div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-md bg-[#111111] border border-zinc-800 space-y-4">
          <div className="flex items-center space-x-2 border-b border-zinc-800 pb-2">
            <Database size={16} className="text-zinc-400" />
            <h3 className="text-sm font-bold text-zinc-100">Data Management</h3>
          </div>
          <p className="text-sm text-zinc-400 font-sans">
            Clear all locally cached threat intelligence, network events, and scan history. This action cannot be undone.
          </p>
          <button
            onClick={handleClearCache}
            className="flex items-center justify-center w-full space-x-2 px-4 py-2 rounded bg-red-950/30 hover:bg-red-900/50 border border-red-900/50 text-red-500 font-bold text-xs transition-colors"
          >
            <Trash2 size={16} />
            <span>PURGE LOCAL DATA</span>
          </button>
        </div>
      </div>
    </div>
  );
}
