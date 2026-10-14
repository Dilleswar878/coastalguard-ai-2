import React, { useState } from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import { playTacticalBlip, playSuccessChime, playTacticalAlert } from '../utils/audio';
import { Shield, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (path: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { registerUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('citizen');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = registerUser(name, email, password, role);
    if (res.success) {
      playSuccessChime();
      onNavigate(role === 'admin' ? '/admin' : '/rewards');
    } else {
      setError(res.error || 'Failed to register cadet callsign.');
      playTacticalAlert();
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6 font-mono">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded bg-cyan-950 border-2 border-cyan-400 mx-auto flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.4)]">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="font-display font-black text-2xl text-white uppercase tracking-wider">
          ENLIST AS COAST GUARDIAN
        </h1>
        <p className="text-xs text-slate-400">
          Create an active telemetry profile to log pollution observations and accrue Coast Guardian points.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="cyber-panel p-6 rounded space-y-4">
        {error && (
          <div className="p-2.5 bg-rose-950 border border-rose-500 text-rose-300 text-xs rounded flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs text-cyan-200 block">Cadet Callsign / Full Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Kai Vance"
            className="w-full px-3 py-2 bg-black/70 border border-cyan-900 rounded text-xs text-white focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-cyan-200 block">Operational Comms Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="kai.vance@oceanwatch.org"
            className="w-full px-3 py-2 bg-black/70 border border-cyan-900 rounded text-xs text-white focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-cyan-200 block">Access Key / Password (Min 6 chars):</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2 bg-black/70 border border-cyan-900 rounded text-xs text-white focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-cyan-200 block">Surveillance Role Assignment:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full px-3 py-2 bg-black/70 border border-cyan-900 rounded text-xs text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="citizen">Citizen Sentinel (Pollution Reporting & Rewards)</option>
            <option value="admin">Environmental Officer (Incident Triage & Response Dispatch)</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded bg-cyan-400 hover:bg-cyan-300 text-black font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.4)] mt-2"
        >
          <span>ACTIVATE SENTINEL PROFILE</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="text-center text-xs text-slate-400">
        <span>Already have an active credential? </span>
        <button
          onClick={() => onNavigate('/login')}
          className="text-cyan-400 hover:underline font-bold"
        >
          Access Portal
        </button>
      </div>
    </div>
  );
};
