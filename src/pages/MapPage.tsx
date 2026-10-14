import React from 'react';
import { TacticalMap } from '../components/TacticalMap';
import { Incident } from '../types/incident';
import { playTacticalBlip } from '../utils/audio';
import { MapPin, AlertOctagon, Radio, Shield, Crosshair } from 'lucide-react';

interface MapPageProps {
  incidents: Incident[];
  onNavigate: (path: string) => void;
}

export const MapPage: React.FC<MapPageProps> = ({ incidents, onNavigate }) => {
  const handleSelectIncident = (id: string) => {
    playTacticalBlip(900, 0.05);
    onNavigate(`/report/${id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-cyan-500/30 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
            <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
            <span>GEO-RADAR SURVEILLANCE // OPTICAL SAT & OSM TILES</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight mt-1">
            TACTICAL COASTAL INCIDENT RADAR
          </h1>
          <p className="font-mono text-xs text-slate-400 mt-0.5">
            Real-time geospatial mapping of verified coastal spills, marine debris lines, outfalls, and ecological disruptions.
          </p>
        </div>

        <button
          onClick={() => {
            playTacticalBlip(950, 0.05);
            onNavigate('/report');
          }}
          className="px-4 py-2.5 rounded bg-cyan-400 hover:bg-cyan-300 text-black font-display font-bold text-xs uppercase tracking-wider flex items-center space-x-2 shrink-0 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.4)]"
        >
          <AlertOctagon className="w-4 h-4" />
          <span>REPORT COASTAL INCIDENT</span>
        </button>
      </div>

      {/* Interactive Map Component */}
      <TacticalMap incidents={incidents} onSelectIncident={handleSelectIncident} />

      {/* Geospatial Disclaimer */}
      <div className="p-4 bg-black/40 border border-slate-800 rounded font-mono text-xs text-slate-400 space-y-1">
        <div className="text-cyan-300 font-bold flex items-center space-x-1.5">
          <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
          <span>GEOSPATIAL TELEMETRY SPECIFICATION:</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Markers with verified GPS hardware beacons are plotted at exact decimal coordinates (WGS84 ellipsoid). Markers without exact GPS are anchored to their designated coastal zone centroid. This map reflects active user submissions and persistent demo data for training and simulation.
        </p>
      </div>
    </div>
  );
};
