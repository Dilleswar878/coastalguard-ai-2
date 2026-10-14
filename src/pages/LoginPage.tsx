import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { playTacticalBlip, playSuccessChime, playTacticalAlert } from '../utils/audio';
import { Shield, Lock, User, Key, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { user, loginAsDemoUser, loginWithCredentials, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = loginWithCredentials(email, password);
    if (res.success) {
      playSuccessChime();
      onNavigate('/dashboard');
    } else {
      setError(res.error || 'Authentication credential mismatch.');
      playTacticalAlert();
    }
  };

  const handleDemoSelect = (role: 'citizen' | 'admin') => {
    playSuccessChime();
    loginAsDemoUser(role);
    if (role === 'admin') {
      onNavigate('/admin');
    } else {
      onNavigate('/rewards');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6 font-mono">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded bg-cyan-950 border-2 border-cyan-400 mx-auto flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.4)]">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="font-display font-black text-2xl text-white uppercase tracking-wider">
          COASTALGUARD // ACCESS PORTAL
        </h1>
        <p className="text-xs text-slate-400">
          Sign in to track personal pollution citations or manage tactical response dispatches.
        </p>
      </div>

      {user ? (
        <div className="cyber-panel p-6 rounded space-y-4 text-center">
          <div className="w-10 h-10 rounded-full bg-emerald-950 border border-emerald-400 text-emerald-400 mx-auto flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">CURRENTLY AUTHENTICATED AS:</div>
            <div className="font-display font-bold text-lg text-white">{user.name}</div>
            <div className="text-xs text-cyan-400 uppercase mt-0.5 font-bold">
              ROLE: {user.role.toUpperCase()}
            </div>
          </div>
          <div className="flex gap-2 justify-center pt-2">
            <button
              onClick={() => onNavigate(user.role === 'admin' ? '/admin' : '/rewards')}
              className="px-4 py-2 bg-cyan-400 text-black font-bold text-xs uppercase rounded"
            >
              Enter Console
            </button>
            <button
              onClick={() => {
                logout();
                playTacticalBlip(500, 0.04);
              }}
              className="px-4 py-2 bg-black border border-slate-700 text-slate-300 hover:text-white rounded text-xs"
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Quick Demo Login Preset Buttons */}
          <div className="p-4 bg-cyan-950/30 border border-cyan-500/50 rounded space-y-3">
            <div className="text-[11px] text-cyan-300 font-bold uppercase flex items-center justify-between">
              <span>ONE-CLICK DEMO AUTHENTICATION:</span>
              <span className="text-[10px] text-slate-400">NO PASSWORD REQUIRED</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoSelect('citizen')}
                className="p-2.5 bg-black/60 border border-cyan-400 text-cyan-300 hover:bg-cyan-900/60 rounded font-bold uppercase transition-all"
              >
                Citizen Sentinel
              </button>
              <button
                type="button"
                onClick={() => handleDemoSelect('admin')}
                className="p-2.5 bg-black/60 border border-pink-500 text-pink-300 hover:bg-pink-900/60 rounded font-bold uppercase transition-all"
              >
                Admin Officer
              </button>
            </div>
          </div>

          {/* Traditional Form */}
          <form onSubmit={handleSubmit} className="cyber-panel p-6 rounded space-y-4">
            {error && (
              <div className="p-2.5 bg-rose-950 border border-rose-500 text-rose-300 text-xs rounded flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs text-cyan-200 block">Comms Identifier / Email:</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sentinel@oceanwatch.org"
                  className="w-full pl-9 pr-3 py-2 bg-black/70 border border-cyan-900 rounded text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-cyan-200 block">Access Key / Password:</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-black/70 border border-cyan-900 rounded text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded bg-cyan-400 hover:bg-cyan-300 text-black font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.4)]"
            >
              <span>ACCESS COASTALGUARD SYSTEM</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2">
            <span>New environmental sentry? </span>
            <button
              onClick={() => onNavigate('/register')}
              className="text-cyan-400 hover:underline font-bold"
            >
              Register Call-sign
            </button>
          </div>
        </>
      )}
    </div>
  );
};
