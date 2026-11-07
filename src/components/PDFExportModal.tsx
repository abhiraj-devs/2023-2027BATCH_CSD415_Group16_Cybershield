import React, { useState } from "react";
import { X, FileText, Download, ShieldCheck, Check, Filter } from "lucide-react";
import { DashboardSummary, SecurityAlert, NetworkEvent, ThreatItem } from "../types";
import { downloadSecurityOverviewPDF } from "../services/pdfExport";

interface PDFExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: DashboardSummary | null;
  alerts: SecurityAlert[];
  networkEvents?: NetworkEvent[];
  threatIntel?: ThreatItem[];
}

export default function PDFExportModal({
  isOpen,
  onClose,
  summary,
  alerts,
  networkEvents = [],
  threatIntel = [],
}: PDFExportModalProps) {
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [includeNetwork, setIncludeNetwork] = useState<boolean>(true);
  const [includeIntel, setIncludeIntel] = useState<boolean>(true);
  const [analystName, setAnalystName] = useState<string>("SOC Lead Analyst");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const filteredAlertsCount = filterSeverity === "ALL" 
    ? alerts.length 
    : alerts.filter(a => a.severity.toUpperCase() === filterSeverity.toUpperCase()).length;

  const handleDownload = () => {
    setIsExporting(true);
    try {
      downloadSecurityOverviewPDF({
        summary,
        alerts,
        networkEvents,
        threatIntel,
        generatedBy: analystName,
        filterSeverity,
        includeNetworkTelemetry: includeNetwork,
        includeThreatIntel: includeIntel,
      });
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Failed to generate PDF report:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                Export Security Overview & Alerts PDF
              </h2>
              <p className="text-[11px] text-zinc-500 font-mono">
                Executive formatted SOC intelligence report (jsPDF)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Quick Stats Summary Preview */}
          <div className="grid grid-cols-3 gap-2.5 p-3 rounded-md bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Total Scans</span>
              <span className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100">
                {summary?.totalScans || 248}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Active Alerts</span>
              <span className="text-sm font-bold font-mono text-red-500">
                {alerts.filter(a => !a.acknowledged).length}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">System Status</span>
              <span className="text-[11px] font-bold font-mono text-emerald-500 truncate block">
                {summary?.systemStatus || "Operational"}
              </span>
            </div>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="block text-[11px] font-bold font-mono text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Filter size={12} className="text-zinc-400" />
                <span>Alert Severity Filter</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                {filteredAlertsCount} of {alerts.length} alerts included
              </span>
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { id: "ALL", label: "All" },
                { id: "CRITICAL", label: "Critical" },
                { id: "HIGH", label: "High" },
                { id: "MEDIUM", label: "Medium" },
                { id: "LOW", label: "Low/Info" },
              ].map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setFilterSeverity(tier.id)}
                  className={`py-1.5 px-2 rounded font-mono text-[11px] font-semibold border transition-colors ${
                    filterSeverity === tier.id
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section Toggles */}
          <div className="space-y-2 pt-1 border-t border-zinc-200 dark:border-zinc-800">
            <label className="block text-[11px] font-bold font-mono text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
              Report Sections
            </label>

            <label className="flex items-center justify-between p-2 rounded bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 cursor-pointer">
              <div className="flex items-center space-x-2">
                <ShieldCheck size={14} className="text-blue-500" />
                <span className="text-zinc-800 dark:text-zinc-200 font-medium">Correlated Network Telemetry</span>
              </div>
              <input
                type="checkbox"
                checked={includeNetwork}
                onChange={(e) => setIncludeNetwork(e.target.checked)}
                className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 cursor-pointer">
              <div className="flex items-center space-x-2">
                <ShieldCheck size={14} className="text-blue-500" />
                <span className="text-zinc-800 dark:text-zinc-200 font-medium">Active Threat Intelligence Feeds</span>
              </div>
              <input
                type="checkbox"
                checked={includeIntel}
                onChange={(e) => setIncludeIntel(e.target.checked)}
                className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
            </label>
          </div>

          {/* Auditor / Analyst Attribution */}
          <div className="pt-1">
            <label className="block text-[11px] font-bold font-mono text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Auditor / Analyst Sign-off
            </label>
            <input
              type="text"
              value={analystName}
              onChange={(e) => setAnalystName(e.target.value)}
              placeholder="e.g. Lead SOC Security Analyst"
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-3 py-1.5 text-zinc-800 dark:text-zinc-200 font-mono text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-zinc-50 dark:bg-zinc-900/40 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 font-semibold text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isExporting}
            className={`px-4 py-2 rounded font-bold text-xs flex items-center space-x-2 shadow-sm transition-all cursor-pointer ${
              downloadSuccess
                ? "bg-emerald-600 text-white"
                : "bg-blue-600 hover:bg-blue-500 text-white"
            }`}
          >
            {downloadSuccess ? (
              <>
                <Check size={14} />
                <span>PDF Downloaded!</span>
              </>
            ) : isExporting ? (
              <span>Generating PDF...</span>
            ) : (
              <>
                <Download size={14} />
                <span>Download Formatted PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
