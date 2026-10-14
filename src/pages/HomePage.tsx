import React from 'react';
import { Incident } from '../types/incident';
import { incidentService } from '../services/incidentStorage';
import { playTacticalBlip } from '../utils/audio';
import {
  Shield,
  AlertOctagon,
  MapPin,
  Cpu,
  Radio,
  Crosshair,
  ArrowRight,
  Droplets,
  Fish,
  Anchor,
  Compass,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (path: string) => void;
  incidents: Incident[];
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, incidents }) => {
  const metrics = incidentService.calculateMetrics(incidents);
  const recentIncidents = incidents.slice(0, 3);

  const handleAction = (path: string) => {
    playTacticalBlip(950, 0.05);
    onNavigate(path);
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative pt-6 pb-12 overflow-hidden">
        {/* Ambient background glow & grid */}
        <div className="absolute inset-0 bg-ocean-grid opacity-50 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Mission & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-cyan-950/80 border border-cyan-400/60 text-cyan-300 font-mono text-xs shadow-[0_0_12px_rgba(0,240,255,0.3)]">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>ACTIVE CITIZEN TELEMETRY NETWORK // SECTOR PACIFIC-01</span>
              </div>

              <div className="space-y-2">
                <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight uppercase leading-[1.05]">
                  PROTECT OUR <span className="text-cyan-400 glitch-title" data-text="COASTLINES">COASTLINES</span>.
                  <br />
                  <span className="text-pink-500 glitch-title" data-text="ONE REPORT">ONE REPORT</span> AT A TIME.
                </h1>
                <p className="font-mono text-sm sm:text-base text-cyan-100/80 max-w-2xl leading-relaxed">
                  Decentralized coastal pollution intelligence. Empowering citizen sentinels to report oil spills, plastics, toxic outfalls, and ghost nets with automated multimodal AI hazard assessment and coordinated dispatch.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() => handleAction('/report')}
                  className="px-6 py-3.5 rounded bg-cyan-400 hover:bg-cyan-300 text-black font-display font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(0,240,255,0.6)] hover:shadow-[0_0_35px_rgba(0,240,255,0.9)] transition-all flex items-center space-x-2.5 cursor-pointer transform hover:-translate-y-0.5"
                >
                  <AlertOctagon className="w-5 h-5" />
                  <span>REPORT POLLUTION NOW</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  onClick={() => handleAction('/map')}
                  className="px-6 py-3.5 rounded bg-black/60 hover:bg-cyan-950/60 border border-cyan-400 text-cyan-300 font-mono text-sm tracking-wider transition-all flex items-center space-x-2.5 shadow-[0_0_15px_rgba(0,0,0,0.5)] cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>EXPLORE TACTICAL MAP</span>
                </button>
              </div>

              {/* Quick Trust / Tech Highlights */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-cyan-900/60 font-mono text-xs text-slate-400">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Gemini 3.8 AI Multimodal</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Crosshair className="w-4 h-4 text-pink-400 shrink-0" />
                  <span>WGS84 GPS Telemetry</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Verified Response Logs</span>
                </div>
              </div>
            </div>

            {/* Right Column: Radar HUD Visualizer */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-72 h-72 sm:w-88 sm:h-88 rounded-full border-2 border-cyan-500/40 bg-[#020b17] flex items-center justify-center shadow-[0_0_40px_rgba(0,240,255,0.2)]">
                {/* Concentric radar rings */}
                <div className="absolute inset-4 rounded-full border border-cyan-500/20" />
                <div className="absolute inset-16 rounded-full border border-cyan-500/30" />
                <div className="absolute inset-28 rounded-full border border-dashed border-cyan-500/40" />

                {/* Radar Crosshairs */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-cyan-500/30" />
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-cyan-500/30" />

                {/* Rotating Sweep Beam */}
                <div
                  className="absolute inset-0 rounded-full origin-center pointer-events-none"
                  style={{
                    background: 'conic-gradient(from 0deg, rgba(0, 240, 255, 0.4) 0deg, rgba(0, 240, 255, 0) 60deg)',
                    animation: 'radar-sweep 4s linear infinite',
                  }}
                />

                {/* Blinking detected blips */}
                <div className="absolute top-1/4 left-1/3 w-3 h-3 rounded-full bg-pink-500 animate-ping shadow-[0_0_10px_#ff007f]" />
                <div className="absolute top-1/4 left-1/3 w-3 h-3 rounded-full bg-pink-500" />
                
                <div className="absolute bottom-1/3 right-1/4 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]" />
                <div className="absolute top-1/2 right-1/3 w-2 h-2 rounded-full bg-amber-400" />

                {/* Center shield emblem */}
                <div className="z-10 w-20 h-20 rounded bg-cyan-950/90 border-2 border-cyan-400 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.5)]">
                  <Shield className="w-8 h-8 text-cyan-300" />
                  <span className="font-mono text-[9px] font-bold text-cyan-400 tracking-wider">DEFENSE</span>
                </div>

                {/* Cardinal direction labels */}
                <span className="absolute top-2 font-mono text-[10px] text-cyan-400/80 font-bold">N 000°</span>
                <span className="absolute right-2 font-mono text-[10px] text-cyan-400/80 font-bold">E 090°</span>
                <span className="absolute bottom-2 font-mono text-[10px] text-cyan-400/80 font-bold">S 180°</span>
                <span className="absolute left-2 font-mono text-[10px] text-cyan-400/80 font-bold">W 270°</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real Live Telemetry Impact Counters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#030e1d] border border-cyan-500/30 rounded p-6 shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between pb-4 border-b border-cyan-900/60 mb-6 font-mono text-xs">
            <div className="flex items-center space-x-2 text-cyan-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>LIVE ENVIRONMENTAL TELEMETRY STATS</span>
            </div>
            <span className="text-slate-500 font-mono text-[11px]">
              DATA SOURCE: LOCAL STORAGE STORE (REACTIVE ENGINE)
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-black/40 border border-slate-800 rounded">
              <div className="font-display font-black text-3xl sm:text-4xl text-cyan-400">
                {metrics.totalReports}
              </div>
              <div className="font-mono text-xs text-slate-400 mt-1 uppercase">Total Incidents Logged</div>
            </div>

            <div className="p-4 bg-black/40 border border-slate-800 rounded">
              <div className="font-display font-black text-3xl sm:text-4xl text-pink-400">
                {metrics.openIncidents}
              </div>
              <div className="font-mono text-xs text-slate-400 mt-1 uppercase">Active Open Threats</div>
            </div>

            <div className="p-4 bg-black/40 border border-slate-800 rounded">
              <div className="font-display font-black text-3xl sm:text-4xl text-emerald-400">
                {metrics.resolvedIncidents}
              </div>
              <div className="font-mono text-xs text-slate-400 mt-1 uppercase">Containments Resolved</div>
            </div>

            <div className="p-4 bg-black/40 border border-slate-800 rounded">
              <div className="font-display font-black text-3xl sm:text-4xl text-amber-400">
                {metrics.coastalZonesMonitored}
              </div>
              <div className="font-mono text-xs text-slate-400 mt-1 uppercase">Monitored Coast Sectors</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Workflow (01 Report -> 02 Analyze -> 03 Respond -> 04 Restore) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          <div className="font-mono text-xs text-cyan-400 tracking-widest uppercase">OPERATIONAL PROTOCOL</div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white uppercase tracking-wide">
            RAPID SENSORY-TO-REMEDIATION PIPELINE
          </h2>
          <p className="font-mono text-xs sm:text-sm text-slate-400">
            From first citizen sighting to verified environmental neutralization in four coordinated stages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="cyber-panel p-5 rounded space-y-3 relative group">
            <div className="font-mono text-pink-500 text-xs font-bold">01 // DISCOVER & LOG</div>
            <div className="w-10 h-10 rounded bg-cyan-950/80 border border-cyan-400 flex items-center justify-center text-cyan-300">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-white">CITIZEN SENTRY</h3>
            <p className="font-mono text-xs text-slate-400 leading-relaxed">
              Capture photographs, GPS coordinates, speech audio, or text descriptions of plastic drift, oil slicks, or sewage outfalls.
            </p>
          </div>

          <div className="cyber-panel p-5 rounded space-y-3 relative group">
            <div className="font-mono text-cyan-400 text-xs font-bold">02 // NEURAL TRIAGE</div>
            <div className="w-10 h-10 rounded bg-cyan-950/80 border border-cyan-400 flex items-center justify-center text-cyan-300">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-white">AI ASSESSMENT</h3>
            <p className="font-mono text-xs text-slate-400 leading-relaxed">
              Multimodal Gemini AI model evaluates threat severity, affected ecosystems, safety perimeters, and responsible regulatory agencies.
            </p>
          </div>

          <div className="cyber-panel p-5 rounded space-y-3 relative group">
            <div className="font-mono text-amber-400 text-xs font-bold">03 // TASKFORCE ALERT</div>
            <div className="w-10 h-10 rounded bg-cyan-950/80 border border-cyan-400 flex items-center justify-center text-cyan-300">
              <Anchor className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-white">COASTAL DISPATCH</h3>
            <p className="font-mono text-xs text-slate-400 leading-relaxed">
              Environmental authorities and volunteer rapid sweep crews receive localized telemetry for boom deployment, net cutting, or beach closure.
            </p>
          </div>

          <div className="cyber-panel p-5 rounded space-y-3 relative group">
            <div className="font-mono text-emerald-400 text-xs font-bold">04 // SHORELINE RESTORE</div>
            <div className="w-10 h-10 rounded bg-cyan-950/80 border border-cyan-400 flex items-center justify-center text-cyan-300">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-white">AUDITED RESOLUTION</h3>
            <p className="font-mono text-xs text-slate-400 leading-relaxed">
              Resolution summaries and lab clearance water assays are recorded permanently into public telemetry; citizen earns Guardian rewards.
            </p>
          </div>
        </div>
      </section>

      {/* Live Recent Incidents Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-cyan-900/60 mb-6 gap-2">
          <div>
            <div className="font-mono text-xs text-cyan-400 uppercase tracking-widest">LIVE SENSORY STREAM</div>
            <h2 className="font-display font-bold text-2xl text-white uppercase">RECENT COASTAL INCIDENTS</h2>
          </div>
          <button
            onClick={() => handleAction('/map')}
            className="font-mono text-xs text-cyan-400 hover:text-cyan-200 flex items-center space-x-1"
          >
            <span>VIEW ALL ON RADAR MAP</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentIncidents.map((inc) => (
            <div
              key={inc.id}
              onClick={() => handleAction(`/report/${inc.id}`)}
              className="cyber-panel p-5 rounded space-y-3 cursor-pointer group hover:border-cyan-400 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-cyan-400">{inc.id}</span>
                  <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                    inc.severity === 'Critical'
                      ? 'border-pink-500 bg-pink-950/80 text-pink-300 font-bold'
                      : inc.severity === 'High'
                      ? 'border-amber-500 bg-amber-950/80 text-amber-300'
                      : 'border-cyan-500 bg-cyan-950/80 text-cyan-300'
                  }`}>
                    {inc.severity} HAZARD
                  </span>
                </div>

                {inc.imageUrl && (
                  <div className="h-36 w-full rounded overflow-hidden mb-3 border border-slate-800 relative">
                    <img
                      src={inc.imageUrl}
                      alt={inc.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#040e1e] via-transparent to-transparent opacity-80" />
                  </div>
                )}

                <h3 className="font-display font-bold text-sm text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                  {inc.title}
                </h3>

                <p className="font-mono text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                  {inc.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 font-mono text-[11px] flex items-center justify-between text-slate-400">
                <span>📍 {inc.locationName}</span>
                <span className="text-cyan-400 group-hover:translate-x-1 transition-transform">Inspect &gt;</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Rewards Teaser Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-cyan-950/60 via-[#03152c] to-purple-950/60 border border-cyan-400/50 rounded p-8 relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8 space-y-3">
              <span className="px-2.5 py-1 rounded bg-cyan-950 border border-cyan-400 text-cyan-300 font-mono text-xs font-bold uppercase">
                COAST GUARDIAN INITIATIVE
              </span>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase">
                EARN CITIZEN SENTRY POINTS FOR EVERY VERIFIED HAZARD
              </h2>
              <p className="font-mono text-xs sm:text-sm text-cyan-100/80 leading-relaxed max-w-xl">
                Submit qualifying coastal pollution reports, earn verifiable Coast Guardian tokens, climb through Sentinel ranking tiers, and receive environmental protection badges.
              </p>
            </div>

            <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col justify-center gap-3">
              <button
                onClick={() => handleAction('/rewards')}
                className="px-6 py-3 rounded bg-cyan-400 hover:bg-cyan-300 text-black font-display font-bold text-xs uppercase tracking-wider text-center cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.4)]"
              >
                VIEW GUARDIAN REWARDS
              </button>
              <button
                onClick={() => handleAction('/report')}
                className="px-6 py-3 rounded bg-black/60 hover:bg-cyan-950 border border-cyan-500 text-cyan-300 font-mono text-xs uppercase tracking-wider text-center cursor-pointer"
              >
                SUBMIT YOUR FIRST REPORT
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
