import React from 'react';
import { Shield, AlertTriangle, Terminal, Heart, ExternalLink, LifeBuoy } from 'lucide-react';
import { playTacticalBlip } from '../utils/audio';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleLink = (path: string) => {
    playTacticalBlip(800, 0.04);
    onNavigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#020712] border-t border-cyan-500/25 mt-16 font-mono text-xs text-slate-400 relative overflow-hidden">
      {/* Top subtle cyan scanline */}
      <div className="h-[2px] bg-gradient-to-r from-cyan-500 via-pink-500 to-teal-400 opacity-60"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center space-x-2 text-white">
              <div className="w-7 h-7 rounded bg-cyan-950 border border-cyan-400 flex items-center justify-center">
                <Shield className="w-4 h-4 text-cyan-300" />
              </div>
              <span className="font-display font-bold text-base tracking-wider text-cyan-300">
                COASTALGUARD // AI
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Decentralized coastal pollution intelligence network combining citizen sensory telemetry with multimodal AI assessment.
            </p>
            <div className="pt-2 flex items-center space-x-2 text-[10px] text-cyan-400/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>NODE STATUS: ACTIVE // 24/7 SURVEILLANCE</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-cyan-300 font-bold uppercase tracking-wider text-[11px] pb-1 border-b border-cyan-900/60 flex items-center space-x-1.5">
              <Terminal className="w-3.5 h-3.5" />
              <span>RADAR & TELEMETRY</span>
            </h4>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => handleLink('/map')} className="hover:text-cyan-300 transition-colors">
                  &gt; Interactive Coastal Map
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('/dashboard')} className="hover:text-cyan-300 transition-colors">
                  &gt; Environmental Intelligence Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('/report')} className="hover:text-cyan-300 transition-colors">
                  &gt; Submit Incident Report
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('/rewards')} className="hover:text-cyan-300 transition-colors">
                  &gt; Coast Guardian Rewards & Badges
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('/admin')} className="hover:text-cyan-300 transition-colors text-pink-400/90 hover:text-pink-300">
                  &gt; Administrative Dispatch Console
                </button>
              </li>
            </ul>
          </div>

          {/* Guidelines & Safety */}
          <div className="space-y-2">
            <h4 className="text-cyan-300 font-bold uppercase tracking-wider text-[11px] pb-1 border-b border-cyan-900/60 flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>SAFETY & REPORTING PROTOCOL</span>
            </h4>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => handleLink('/about')} className="hover:text-cyan-300 transition-colors">
                  &gt; Reporting Field Guide
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('/about')} className="hover:text-cyan-300 transition-colors">
                  &gt; Hazardous Material Safety Distance
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('/about')} className="hover:text-cyan-300 transition-colors">
                  &gt; AI Assessment Limitations
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('/about')} className="hover:text-cyan-300 transition-colors">
                  &gt; Wildlife Stranding Guidelines
                </button>
              </li>
            </ul>
          </div>

          {/* Emergency & Disclaimer */}
          <div className="space-y-3">
            <h4 className="text-pink-400 font-bold uppercase tracking-wider text-[11px] pb-1 border-b border-pink-900/60 flex items-center space-x-1.5">
              <LifeBuoy className="w-3.5 h-3.5 text-pink-400" />
              <span>EMERGENCY JURISDICTION</span>
            </h4>
            <p className="text-[11px] text-slate-300 bg-pink-950/20 border border-pink-900/40 p-2.5 rounded leading-relaxed">
              <strong className="text-pink-300 block mb-1">DANGER / ACUTE HAZARD:</strong>
              For active major oil spills, chemical vapor clouds, or trapped cetaceans, do NOT approach. Alert National Response Center (1-800-424-8802) or your regional Coast Guard Marine Safety detachment immediately.
            </p>
          </div>
        </div>

        {/* Technical Architecture & Disclaimers Bar */}
        <div className="pt-8 border-t border-cyan-900/40 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-black/40 border border-cyan-950 rounded text-[11px]">
            <div>
              <span className="text-cyan-400 font-bold block mb-0.5">STORAGE & PERSISTENCE:</span>
              <span className="text-slate-400">LocalStorage persistence engine with reactive broadcast synchronization. Demo records can be reset via the Admin console.</span>
            </div>
            <div>
              <span className="text-cyan-400 font-bold block mb-0.5">AI INTELLIGENCE ARCHITECTURE:</span>
              <span className="text-slate-400">Powered by server-side Gemini 3.8 Flash multimodal API with automatic transparent fallback to the calibrated CoastalGuard heuristic matrix.</span>
            </div>
            <div>
              <span className="text-cyan-400 font-bold block mb-0.5">ACCESSIBILITY & PRIVACY:</span>
              <span className="text-slate-400">WCAG 2.1 AA compliant, screen-reader optimized table & list views, optional anonymous reporting without exact home telemetry exposure.</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 pt-2">
            <div>
              © 2026 CoastalGuard AI Platform. Open Environmental Telemetry Standard.
            </div>
            <div className="flex items-center space-x-4 mt-2 sm:mt-0">
              <button onClick={() => handleLink('/about')} className="hover:text-cyan-300">Privacy Policy</button>
              <span>•</span>
              <button onClick={() => handleLink('/about')} className="hover:text-cyan-300">Accessibility Statement</button>
              <span>•</span>
              <button onClick={() => handleLink('/about')} className="hover:text-cyan-300">Data Terms</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
