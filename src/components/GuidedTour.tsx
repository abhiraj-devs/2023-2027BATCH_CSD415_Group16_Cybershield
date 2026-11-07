import React, { useState } from "react";
import { X, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function GuidedTour({ run }: { run: boolean }) {
  const [isOpen, setIsOpen] = useState(() => {
    try {
      return localStorage.getItem("cybershield_tour_dismissed") !== "true" && run;
    } catch {
      return false;
    }
  });
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const tourSteps = [
    {
      title: "Welcome to CyberShield AI SOC",
      desc: "CyberShield AI is a real-time AI threat detection platform combining Two-Way URL phishing verification, 72-engine malware hash inspection, and eBPF kernel telemetry.",
      badge: "PLATFORM OVERVIEW",
    },
    {
      title: "Two-Way Phishing Detection",
      desc: "Cross-examines suspect URLs simultaneously across the external PhishGuard 235k AI model and the internal CyberShield 15-feature deep lexical analyzer with Shannon entropy scoring.",
      badge: "DUAL-ENGINE CORE",
    },
    {
      title: "Automated Incident Alerting & Forensics",
      desc: "High-priority incidents are automatically dispatched to Discord & Slack webhooks. Authenticated operators enjoy immutable audit logs synced directly with Google Cloud Firestore.",
      badge: "INCIDENT RESPONSE",
    },
  ];

  const current = tourSteps[step];

  const handleNext = () => {
    if (step < tourSteps.length - 1) {
      setStep(step + 1);
    } else {
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
    try {
      localStorage.setItem("cybershield_tour_dismissed", "true");
    } catch {}
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full p-4 rounded-xl bg-zinc-900 border border-zinc-700 shadow-2xl text-zinc-100 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <ShieldCheck size={16} className="text-emerald-400" />
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
            {current.badge}
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>

      <div className="space-y-1">
        <h4 className="text-xs font-bold font-mono text-zinc-100">{current.title}</h4>
        <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{current.desc}</p>
      </div>

      <div className="flex items-center justify-between pt-1 text-xs">
        <div className="flex space-x-1">
          {tourSteps.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all ${i === step ? "w-5 bg-emerald-500" : "w-1.5 bg-zinc-700"}`}
            />
          ))}
        </div>
        <button
          onClick={handleNext}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] flex items-center space-x-1 transition-colors cursor-pointer shadow-sm"
        >
          <span>{step === tourSteps.length - 1 ? "Get Started" : "Next"}</span>
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}
