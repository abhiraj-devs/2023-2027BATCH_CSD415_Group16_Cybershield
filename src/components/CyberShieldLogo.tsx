import React from "react";
import { ShieldCheck } from "lucide-react";

export default function CyberShieldLogo({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="relative flex items-center justify-center p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
        <ShieldCheck size={size} className="text-emerald-400" />
      </div>
      <div className="flex flex-col">
        <span className="font-bold tracking-tight font-mono text-zinc-100 flex items-center gap-1 leading-none text-sm">
          <span>CYBERSHIELD</span>
          <span className="text-[10px] px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">AI</span>
        </span>
        <span className="text-[9px] text-zinc-500 font-mono tracking-wider">DEFENSE GRID</span>
      </div>
    </div>
  );
}
