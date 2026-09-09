import React, { useState } from "react";
import { BookOpen, Target, BrainCircuit, Play } from "lucide-react";

export default function TrainingView() {
  // Paper 1: Confidence-Competence Gap Assessment
  const [confidence, setConfidence] = useState(3);
  const [testScore, setTestScore] = useState<number | null>(null);

  // Paper 12: Ecological VR Simulation
  const [simulationStatus, setSimulationStatus] = useState("Idle");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-6 rounded-md bg-[#111111] border border-zinc-800">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-zinc-100 flex items-center space-x-2">
            <BookOpen size={20} className="text-zinc-400" />
            <span>Security Training & Simulation</span>
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Ecological workspace simulations and cognitive assessment.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Paper 1: Confidence-Competence Gap */}
        <div className="p-4 sm:p-6 rounded-md bg-[#111111] border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-zinc-100 border-b border-zinc-800 pb-2 flex items-center gap-2">
            <BrainCircuit size={16} className="text-purple-500" />
            <span>Confidence-Competence Calibration</span>
          </h3>
          <p className="text-xs text-zinc-400">Evaluate perceived vs. actual detection ability against AI-generated synthetic threats.</p>
          
          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-2">Self-Assessed Detection Confidence: {confidence}/5</label>
              <input type="range" min="1" max="5" value={confidence} onChange={e => setConfidence(Number(e.target.value))} className="w-full" />
            </div>
            <button 
              onClick={() => setTestScore(42.5)} 
              className="w-full py-3 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-200 transition-colors cursor-pointer"
            >
              RUN OBJECTIVE ASSESSMENT
            </button>
            {testScore && (
              <div className="p-4 bg-red-950/20 border border-red-900/30 rounded flex justify-between items-center text-sm font-mono mt-4">
                <span className="text-zinc-400">Actual Accuracy:</span>
                <span className="text-red-400 font-bold">{testScore}% (Gap Detected)</span>
              </div>
            )}
          </div>
        </div>

        {/* Paper 12: Ecological VR Simulation */}
        <div className="p-4 sm:p-6 rounded-md bg-[#111111] border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-zinc-100 border-b border-zinc-800 pb-2 flex items-center gap-2">
            <Target size={16} className="text-emerald-500" />
            <span>Ecological VR Sandbox</span>
          </h3>
          <p className="text-xs text-zinc-400">Launch a 10-minute immersive virtual workspace simulation to assess behavioral risk under stress.</p>
          
          <div className="p-5 bg-zinc-950 border border-zinc-900 rounded space-y-4 mt-2">
            <div className="flex justify-between items-center text-[10px] font-mono uppercase">
              <span className="text-zinc-500">Engine Status</span>
              <span className={simulationStatus === 'Running' ? 'text-emerald-500 font-bold' : 'text-zinc-400'}>{simulationStatus}</span>
            </div>
            <button 
              onClick={() => setSimulationStatus(simulationStatus === 'Running' ? 'Idle' : 'Running')}
              className={`w-full py-3 rounded font-bold text-xs flex items-center justify-center gap-2 transition-colors ${
                simulationStatus === 'Running' 
                  ? 'bg-red-950/30 text-red-500 border border-red-900/50 hover:bg-red-900/40' 
                  : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20'
              }`}
            >
              <Play size={14} />
              <span>{simulationStatus === 'Running' ? 'TERMINATE SIMULATION' : 'LAUNCH ECOLOGICAL SIMULATION'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
