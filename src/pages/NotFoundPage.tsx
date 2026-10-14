import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { playTacticalBlip } from '../utils/audio';

interface NotFoundPageProps {
  onNavigate: (path: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6 font-mono">
      <div className="w-16 h-16 rounded bg-pink-950 border-2 border-pink-500 mx-auto flex items-center justify-center text-pink-400 shadow-[0_0_30px_rgba(255,0,127,0.5)]">
        <ShieldAlert className="w-10 h-10 animate-bounce" />
      </div>

      <div className="space-y-2">
        <div className="text-xs text-pink-400 font-bold uppercase tracking-widest">
          ERROR 404 // SIGNAL LOST
        </div>
        <h1 className="font-display font-black text-3xl text-white uppercase">
          COASTAL SECTOR NOT FOUND
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          The requested coordinate trajectory or URL telemetry beacon does not correspond to an active surveillance node.
        </p>
      </div>

      <button
        onClick={() => {
          playTacticalBlip(800, 0.05);
          onNavigate('/');
        }}
        className="px-6 py-2.5 rounded bg-cyan-400 hover:bg-cyan-300 text-black font-display font-bold text-xs uppercase tracking-wider inline-flex items-center space-x-2 shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>RETURN TO SENTRY HUB</span>
      </button>
    </div>
  );
};
