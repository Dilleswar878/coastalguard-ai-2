import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Incident, SEVERITY_COLORS, CATEGORY_LABELS } from '../types/incident';
import { playSuccessChime, playTacticalBlip } from '../utils/audio';
import {
  CheckCircle2,
  Shield,
  AlertTriangle,
  MapPin,
  ExternalLink,
  PlusCircle,
  Cpu,
  Award,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface ReportResultPageProps {
  incident: Incident | null;
  onNavigate: (path: string, state?: Record<string, unknown>) => void;
}

export const ReportResultPage: React.FC<ReportResultPageProps> = ({ incident, onNavigate }) => {
  useEffect(() => {
    if (incident) {
      playSuccessChime();
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f0ff', '#ff007f', '#10b981', '#ffffff'],
        });
      } catch {
        // Ignore confetti error if canvas unmounted
      }
    }
  }, [incident]);

  if (!incident) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4 font-mono">
        <div className="p-4 bg-rose-950/60 border border-rose-500 rounded text-rose-300">
          No active submission record in current session telemetry.
        </div>
        <button
          onClick={() => onNavigate('/report')}
          className="px-4 py-2 bg-cyan-400 text-black font-display font-bold uppercase rounded"
        >
          Submit a New Report
        </button>
      </div>
    );
  }

  const ai = incident.aiAssessment;
  const sev = SEVERITY_COLORS[incident.severity];

  const handleAction = (path: string) => {
    playTacticalBlip(850, 0.04);
    onNavigate(path);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8 font-mono">
      {/* Success Banner */}
      <div className="p-6 bg-[#041528] border-2 border-emerald-500 rounded cyber-panel space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-emerald-950/90 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <div className="text-emerald-400 font-bold text-xs uppercase tracking-widest flex items-center space-x-1.5">
                <span>TELEMETRY TRANSMITTED & ARCHIVED</span>
              </div>
              <h1 className="font-display font-black text-2xl text-white uppercase tracking-tight">
                INCIDENT LOGGED: <span className="text-cyan-400">{incident.id}</span>
              </h1>
            </div>
          </div>

          {/* Reward Points Badge */}
          {incident.rewardPoints > 0 && (
            <div className="px-3.5 py-1.5 bg-cyan-950 border border-cyan-400 rounded flex items-center space-x-2 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.4)]">
              <Award className="w-5 h-5 text-cyan-400" />
              <div>
                <span className="font-display font-black text-sm">+{incident.rewardPoints} PTS</span>
                <span className="text-[10px] block text-cyan-200">COAST GUARDIAN</span>
              </div>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-cyan-900/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-300">
          <div>
            <span className="text-slate-500 block text-[10px]">TIME RECORDED:</span>
            <span>{new Date(incident.createdAt).toLocaleTimeString()}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">SECTOR:</span>
            <span className="truncate block">{incident.locationName}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">WORKFLOW STATUS:</span>
            <span className="text-cyan-400 font-bold">{incident.workflowStatus}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">REPORTER:</span>
            <span>{incident.submittedBy.isAnonymous ? 'Anonymous' : incident.submittedBy.name}</span>
          </div>
        </div>
      </div>

      {/* AI Assessment Panel */}
      <div className="cyber-panel p-6 rounded space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-cyan-900/60 gap-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-300">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="font-display font-bold text-base text-white uppercase">
                AUTOMATED NEURAL THREAT ASSESSMENT
              </div>
              <div className="text-[11px] text-cyan-400">
                ENGINE: <span className="text-white font-bold">{ai.modelUsed}</span>
                {ai.isFallback && (
                  <span className="ml-2 px-1.5 py-0.2 bg-amber-950 border border-amber-500 text-amber-300 text-[9px] rounded font-bold">
                    DEMO / HEURISTIC FALLBACK
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`px-2.5 py-1 rounded border font-mono text-xs font-bold ${sev.border} ${sev.text} ${sev.bg}`}>
              SEVERITY: {incident.severity.toUpperCase()}
            </div>
            <div className="px-2.5 py-1 rounded bg-black/60 border border-cyan-500/50 text-cyan-300 text-xs font-bold">
              CONFIDENCE: {ai.confidence}%
            </div>
          </div>
        </div>

        {/* Highlighted Immediate Precautions */}
        <div className="p-4 bg-pink-950/30 border border-pink-500/60 rounded space-y-2">
          <div className="flex items-center space-x-2 text-pink-400 font-bold text-xs uppercase">
            <ShieldAlert className="w-4 h-4 text-pink-400" />
            <span>MANDATORY SAFETY PRECAUTIONS & PERIMETER</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-xs text-pink-200 pl-1">
            {ai.immediatePrecautions.map((p, idx) => (
              <li key={idx} className="leading-relaxed">{p}</li>
            ))}
          </ul>
        </div>

        {/* Environmental Impact & Ecosystems */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-black/50 border border-slate-800 rounded space-y-2">
            <div className="text-cyan-400 font-bold uppercase border-b border-slate-800 pb-1">
              ECOLOGICAL IMPACT ANALYSIS
            </div>
            <p className="text-slate-300 leading-relaxed">{ai.environmentalImpact}</p>
            <div className="pt-2">
              <span className="text-slate-500 block text-[10px] mb-1 uppercase font-bold">Affected Ecosystems:</span>
              <div className="flex flex-wrap gap-1.5">
                {ai.affectedEcosystems.map((eco, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800 text-[10px] text-cyan-300">
                    {eco}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-black/50 border border-slate-800 rounded space-y-2">
            <div className="text-cyan-400 font-bold uppercase border-b border-slate-800 pb-1">
              RECOMMENDED ACTIONS & AGENCY DISPATCH
            </div>
            <div className="text-slate-300">
              <span className="text-slate-500 block text-[10px] mb-0.5 uppercase font-bold">Suggested Agency:</span>
              <span className="text-white font-semibold">{ai.suggestedAgency}</span>
            </div>
            <div className="pt-1">
              <span className="text-slate-500 block text-[10px] mb-1 uppercase font-bold">Investigation / Cleanup Protocols:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                {ai.recommendedActions.map((act, i) => (
                  <li key={i}>{act}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Explanation & Technical Limitations */}
        <div className="p-3 bg-black/40 border border-cyan-950 rounded text-xs space-y-1 text-slate-400">
          <div><strong className="text-cyan-300">Explanation:</strong> {ai.explanation}</div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800">
            <strong className="text-slate-400">Limitations:</strong> {ai.limitations}
          </div>
        </div>
      </div>

      {/* Navigation Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          onClick={() => handleAction(`/report/${incident.id}`)}
          className="w-full sm:w-auto px-6 py-3 rounded bg-cyan-400 hover:bg-cyan-300 text-black font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer"
        >
          <span>VIEW FULL INCIDENT RECORD & TIMELINE</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={() => handleAction('/map')}
            className="flex-1 sm:flex-none px-4 py-3 rounded bg-black/60 border border-cyan-500 text-cyan-300 hover:bg-cyan-950 text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>LOCATE ON MAP</span>
          </button>

          <button
            onClick={() => handleAction('/report')}
            className="flex-1 sm:flex-none px-4 py-3 rounded bg-black/60 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400 text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>SUBMIT ANOTHER</span>
          </button>
        </div>
      </div>
    </div>
  );
};
