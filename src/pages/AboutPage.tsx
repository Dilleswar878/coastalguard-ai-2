import React from 'react';
import { playTacticalBlip } from '../utils/audio';
import {
  Shield,
  Cpu,
  AlertTriangle,
  Lock,
  LifeBuoy,
  BookOpen,
  CheckCircle2,
  Compass,
  FileCheck,
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10 font-mono text-xs text-slate-300">
      {/* Header */}
      <div className="border-b border-cyan-500/30 pb-4">
        <div className="flex items-center space-x-2 text-cyan-400">
          <Shield className="w-4 h-4" />
          <span>SPECIFICATION // ARCHITECTURE & TRUST MATRIX</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight mt-1">
          COASTALGUARD AI PLATFORM MANUAL
        </h1>
        <p className="text-slate-400 mt-1">
          Open-architecture environmental intelligence system bridging citizen observation with multimodal AI hazard triage and verified taskforce containment.
        </p>
      </div>

      {/* 1. Problem & Mission */}
      <section className="cyber-panel p-6 rounded space-y-3">
        <div className="text-cyan-300 font-bold text-sm uppercase flex items-center space-x-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span>1. MISSION & THE COASTAL CONTAMINATION CRISIS</span>
        </div>
        <p className="leading-relaxed">
          Over 80% of marine pollution originates from land-based sources—including illegal stormwater outfall discharges, microplastic driftlines, uncontained harbor fuel slicks, and ghost fishing nets that continuously trap wildlife. Traditional environmental inspections are constrained by limited municipal patrol vessels and delayed notification windows.
        </p>
        <p className="leading-relaxed text-cyan-100/90">
          <strong>CoastalGuard AI</strong> transforms recreational beachgoers, surfers, divers, and coastal residents into an active sensor mesh. Reports submitted through the platform are immediately indexed with coordinates, evaluated via computer vision neural models, and forwarded to containment squads before tidal dispersion.
        </p>
      </section>

      {/* 2. Role and Limitations of AI */}
      <section className="cyber-panel p-6 rounded space-y-4">
        <div className="text-cyan-300 font-bold text-sm uppercase flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>2. AI ANALYSIS CAPABILITIES & SCIENTIFIC BOUNDARIES</span>
        </div>
        <p className="leading-relaxed">
          The platform integrates Google's Gemini 3.8 Flash multimodal foundation model for rapid preliminary triage. When an incident is logged, the engine inspects visual tokens, chromatic refraction (such as fuel sheens), debris geometry, and descriptive text.
        </p>
        <div className="p-4 bg-pink-950/30 border border-pink-500/60 rounded space-y-2 text-pink-200">
          <strong className="text-pink-300 uppercase block text-xs flex items-center space-x-1.5">
            <AlertTriangle className="w-4 h-4 text-pink-400 shrink-0" />
            <span>CRITICAL SCIENTIFIC & LEGAL SAFEGUARDS:</span>
          </strong>
          <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
            <li>
              <strong>Preliminary Estimates Only:</strong> AI severity scores (Low, Medium, High, Critical) are operational triage estimates, NOT legal proof or official chemical assays.
            </li>
            <li>
              <strong>No Certain Chemical Identification:</strong> No algorithm can conclusively determine hydrocarbon chemical species or pathogen strains from an image alone; gas chromatography or biological culture assays remain mandatory.
            </li>
            <li>
              <strong>Explicit Uncertainty:</strong> When photographic resolution is low or description lacks volume metrics, the model is strictly prompted to declare uncertainty rather than fabricate observations.
            </li>
            <li>
              <strong>Zero Citizen Hazard Exposure:</strong> The system will NEVER instruct a citizen to touch, sniff, sample, or contain hazardous chemical spills.
            </li>
          </ul>
        </div>
      </section>

      {/* 3. The Three Tiers of Verification */}
      <section className="cyber-panel p-6 rounded space-y-3">
        <div className="text-cyan-300 font-bold text-sm uppercase flex items-center space-x-2">
          <FileCheck className="w-4 h-4 text-cyan-400" />
          <span>3. TRIAGE TAXONOMY: CITIZEN vs AI vs FIELD INSPECTION</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3 bg-black/50 border border-slate-800 rounded space-y-1">
            <span className="font-bold text-white block text-[11px]">STAGE 1: CITIZEN REPORT</span>
            <p className="text-[11px] text-slate-400">
              Observational allegation filed by an on-site citizen with preliminary photos and GPS. Marked as "Submitted".
            </p>
          </div>
          <div className="p-3 bg-black/50 border border-cyan-900 rounded space-y-1">
            <span className="font-bold text-cyan-300 block text-[11px]">STAGE 2: AI NEURAL VERIFIED</span>
            <p className="text-[11px] text-slate-400">
              Corroborated by Gemini 3.8 computer vision. Evaluates biological risk and maps appropriate agency.
            </p>
          </div>
          <div className="p-3 bg-black/50 border border-emerald-900 rounded space-y-1">
            <span className="font-bold text-emerald-400 block text-[11px]">STAGE 3: FIELD RESOLUTION</span>
            <p className="text-[11px] text-slate-400">
              Official dispatch of response unit (booms, dive extraction). Certified with final laboratory resolution summary.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Field Reporting Best Practices */}
      <section className="cyber-panel p-6 rounded space-y-3">
        <div className="text-cyan-300 font-bold text-sm uppercase flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>4. CITIZEN SENTINEL FIELD REPORTING GUIDE</span>
        </div>
        <ul className="space-y-2 text-slate-300 pl-2">
          <li className="flex items-start space-x-2">
            <span className="text-cyan-400 font-bold">✓</span>
            <span><strong>High-Resolution Wide & Close-up Shots:</strong> Photograph the debris line showing reference landmarks (jetties, bluffs) as well as close-ups of packaging or discoloration.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-cyan-400 font-bold">✓</span>
            <span><strong>Enable GPS Hardware:</strong> Click "Acquire GPS Coordinates" while standing at a safe vantage point to anchor exact decimal coordinates.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-cyan-400 font-bold">✓</span>
            <span><strong>Note Odor and Wildlife:</strong> Describe whether sulfurous, chemical, or fuel odors are present, and note any shorebirds or seals foraging in the immediate driftline.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-pink-400 font-bold">✕</span>
            <span><strong>DO NOT Risk Personal Safety:</strong> Never traverse slippery seawalls during high surf or approach drums labeled with hazardous placards.</span>
          </li>
        </ul>
      </section>

      {/* 5. Emergency Jurisdictions */}
      <section className="p-6 bg-pink-950/20 border-2 border-pink-500 rounded cyber-panel space-y-3">
        <div className="text-pink-400 font-bold text-sm uppercase flex items-center space-x-2">
          <LifeBuoy className="w-4 h-4 text-pink-400" />
          <span>5. EMERGENCY HOTLINES & REGULATORY AUTHORITIES</span>
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          For catastrophic spills requiring immediate Coast Guard or federal intervention:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] pt-1">
          <div className="p-3 bg-black/60 border border-pink-900 rounded">
            <strong className="text-white block">U.S. National Response Center (NRC)</strong>
            <span className="text-pink-300 font-bold text-sm">1-800-424-8802</span>
            <p className="text-slate-400 text-[10px] mt-0.5">Sole federal point of contact for oil and chemical spills into navigable waters.</p>
          </div>
          <div className="p-3 bg-black/60 border border-pink-900 rounded">
            <strong className="text-white block">Marine Mammal Stranding Network</strong>
            <span className="text-cyan-300 font-bold text-sm">1-866-767-6114</span>
            <p className="text-slate-400 text-[10px] mt-0.5">Authorized response for entangled, stranded, or injured cetaceans and pinnipeds.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
