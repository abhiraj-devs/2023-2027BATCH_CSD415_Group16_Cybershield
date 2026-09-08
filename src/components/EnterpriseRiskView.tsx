import React, { useState } from "react";
import { Briefcase, AlertTriangle, Calculator } from "lucide-react";

export default function EnterpriseRiskView() {
  // Paper 9: FAIR-ROSI Calculator
  const [lossMagnitude, setLossMagnitude] = useState(5360000);
  const [mitigationCost, setMitigationCost] = useState(1950000);
  const [riskReduction, setRiskReduction] = useState(50); // %
  
  const rosi = (((lossMagnitude * (riskReduction / 100)) - mitigationCost) / mitigationCost) * 100;

  // Paper 5: 11-Factor SDO Risk
  const sdoChallenges = [
    { name: "Cyber-Attack Exposure", score: 87.3 },
    { name: "Resource Constraints", score: 77.1 },
    { name: "Framework Gaps", score: 72.9 },
    { name: "Knowledge Deficiency", score: 65.7 },
    { name: "Tech Support Limitations", score: 61.4 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-md bg-[#111111] border border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 flex items-center space-x-2">
            <Briefcase size={20} className="text-zinc-400" />
            <span>Enterprise Risk & Security Economics</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Strategic SDO assessment and FAIR-ROSI investment calculation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Paper 5: SDO 11-Factor Risk Radar */}
        <div className="p-6 rounded-md bg-[#111111] border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-zinc-100 border-b border-zinc-800 pb-2 flex items-center gap-2">
            <AlertTriangle size={16} className="text-orange-500" />
            <span>SDO Critical Challenge Assessment</span>
          </h3>
          <p className="text-xs text-zinc-400 mb-4">Tracking the 11 critical challenges impacting Software Development Organizations (SDOs).</p>
          <div className="space-y-3">
            {sdoChallenges.map((challenge, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-zinc-400 uppercase">
                  <span>{challenge.name}</span>
                  <span>{challenge.score}%</span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-1.5">
                  <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${challenge.score}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Paper 9: FAIR-ROSI Calculator */}
        <div className="p-6 rounded-md bg-[#111111] border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-zinc-100 border-b border-zinc-800 pb-2 flex items-center gap-2">
            <Calculator size={16} className="text-blue-500" />
            <span>FAIR-ROSI Investment Calculator</span>
          </h3>
          <p className="text-xs text-zinc-400 mb-4">Calculate Return on Security Investment (ROSI) using quantitative loss and risk factors.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Estimated Loss Magnitude ($)</label>
              <input type="number" value={lossMagnitude} onChange={e => setLossMagnitude(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 font-mono focus:outline-none focus:border-zinc-500 transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Mitigation Cost ($)</label>
              <input type="number" value={mitigationCost} onChange={e => setMitigationCost(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 font-mono focus:outline-none focus:border-zinc-500 transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1 flex justify-between">
                <span>Risk Reduction</span>
                <span>{riskReduction}%</span>
              </label>
              <input type="range" min="0" max="100" value={riskReduction} onChange={e => setRiskReduction(Number(e.target.value))} className="w-full" />
            </div>
            <div className="p-4 rounded bg-zinc-950 border border-zinc-900 flex justify-between items-center mt-6">
              <span className="text-xs text-zinc-400 font-mono uppercase">Projected ROSI</span>
              <span className={`text-2xl font-bold font-mono ${rosi >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {rosi.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
