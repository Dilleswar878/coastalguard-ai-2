import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { playTacticalBlip } from '../utils/audio';
import {
  Shield,
  Radio,
  MapPin,
  BarChart3,
  Award,
  Lock,
  Info,
  Menu,
  X,
  Tv,
  Volume2,
  VolumeX,
  AlertOctagon,
  UserCheck,
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const TelemetryClock: React.FC = React.memo(() => {
  const [timeUtc, setTimeUtc] = useState<string>(() => new Date().toISOString().substring(11, 19) + ' UTC');

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUtc(new Date().toISOString().substring(11, 19) + ' UTC');
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return <span>SYS CLK: <span className="text-cyan-300">{timeUtc}</span></span>;
});

TelemetryClock.displayName = 'TelemetryClock';

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const { user, isAdmin, loginAsDemoUser, logout, isCRTActive, toggleCRT, isAudioActive, toggleAudio } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (path: string) => {
    playTacticalBlip(980, 0.05);
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { label: 'SENTRY HUB', path: '/', icon: Shield },
    { label: 'REPORT POLLUTION', path: '/report', icon: AlertOctagon, highlight: true },
    { label: 'TACTICAL MAP', path: '/map', icon: MapPin },
    { label: 'INTELLIGENCE', path: '/dashboard', icon: BarChart3 },
    { label: 'REWARDS', path: '/rewards', icon: Award },
    { label: 'ADMIN DISPATCH', path: '/admin', icon: Lock, badge: 'OFFICER' },
    { label: 'ABOUT & SPECS', path: '/about', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#020914]/95 border-b border-cyan-500/30 backdrop-blur-md">
      {/* Top telemetry ticker */}
      <div className="hidden lg:flex items-center justify-between px-4 py-1 bg-black/60 border-b border-cyan-900/40 text-[11px] font-mono text-cyan-400/80 tracking-wider">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="text-cyan-300 font-bold">COASTALGUARD // DEFENSE LINK ACTIVE</span>
          </div>
          <span className="text-slate-500">|</span>
          <span>LAT 37.7749° N // LON 122.4194° W</span>
          <span className="text-slate-500">|</span>
          <TelemetryClock />
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 text-[10px]">SIMULATE ROLE:</span>
            <button
              onClick={() => {
                loginAsDemoUser('citizen');
                playTacticalBlip(600, 0.04);
              }}
              className={`px-2 py-0.5 border text-[10px] rounded transition-colors ${
                !isAdmin
                  ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300 font-bold shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                  : 'border-slate-800 text-slate-400 hover:text-cyan-300'
              }`}
            >
              CITIZEN
            </button>
            <button
              onClick={() => {
                loginAsDemoUser('admin');
                playTacticalBlip(750, 0.04);
              }}
              className={`px-2 py-0.5 border text-[10px] rounded transition-colors ${
                isAdmin
                  ? 'border-magenta-500 bg-pink-950/60 text-pink-300 font-bold shadow-[0_0_8px_rgba(255,0,127,0.3)]'
                  : 'border-slate-800 text-slate-400 hover:text-pink-300'
              }`}
            >
              ADMIN
            </button>
          </div>

          <span className="text-slate-600">|</span>

          {/* CRT scanlines toggle */}
          <button
            onClick={() => {
              toggleCRT();
              playTacticalBlip(550, 0.04);
            }}
            title="Toggle CRT Screen Scanlines (Glitch Mode)"
            className={`flex items-center space-x-1 px-1.5 py-0.5 rounded border text-[10px] ${
              isCRTActive
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40'
                : 'border-slate-700 text-slate-500'
            }`}
          >
            <Tv className="w-3 h-3" />
            <span>CRT: {isCRTActive ? 'ON' : 'OFF'}</span>
          </button>

          {/* Audio toggle */}
          <button
            onClick={() => {
              toggleAudio();
              playTacticalBlip(600, 0.04);
            }}
            title="Toggle Synthesizer Sound FX"
            className="flex items-center space-x-1 text-slate-400 hover:text-cyan-300"
          >
            {isAudioActive ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-600" />}
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNav('/')}>
            <div className="relative w-10 h-10 flex items-center justify-center bg-cyan-950/80 border-2 border-cyan-400 rounded-sm shadow-[0_0_15px_rgba(0,240,255,0.4)]">
              <Shield className="w-6 h-6 text-cyan-300" />
              <div className="absolute inset-0 bg-cyan-400/10 animate-pulse pointer-events-none" />
              {/* Corner tech notch */}
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500"></div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-black text-xl text-white tracking-wider glitch-text-hover">
                  COASTAL<span className="text-cyan-400">GUARD</span>
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-400/60 text-cyan-300 font-bold">
                  AI v2.6
                </span>
              </div>
              <p className="font-mono text-[10px] text-cyan-300/70 tracking-widest uppercase">
                See the Threat. Protect the Coast.
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentPath === link.path || (link.path !== '/' && currentPath.startsWith(link.path));
              if (link.highlight) {
                return (
                  <button
                    key={link.path}
                    onClick={() => handleNav(link.path)}
                    className="ml-2 relative group overflow-hidden px-4 py-2 rounded bg-gradient-to-r from-cyan-500 to-teal-400 text-black font-display font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.5)] hover:shadow-[0_0_30px_rgba(0,240,255,0.8)] transition-all flex items-center space-x-2"
                  >
                    <Icon className="w-4 h-4 animate-bounce" />
                    <span>{link.label}</span>
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
                  </button>
                );
              }

              return (
                <button
                  key={link.path}
                  onClick={() => handleNav(link.path)}
                  className={`px-3 py-1.5 rounded font-mono text-xs tracking-wider transition-all flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-cyan-950/70 border border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                      : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[9px] px-1 bg-pink-950 border border-pink-500 text-pink-300 font-bold rounded">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile / Status */}
          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              <div
                className="flex items-center space-x-2 bg-slate-900/80 border border-slate-700 px-2.5 py-1 rounded cursor-pointer hover:border-cyan-400"
                onClick={() => handleNav('/rewards')}
                title="View Coast Guardian Profile & Points"
              >
                <div className="w-6 h-6 rounded bg-cyan-950 border border-cyan-400 flex items-center justify-center text-[10px] text-cyan-300 font-bold">
                  {user.role === 'admin' ? 'OP' : 'CG'}
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-mono text-cyan-200 truncate max-w-[120px]">
                    {user.name}
                  </div>
                  <div className="text-[9px] font-mono text-cyan-400">
                    {user.role === 'admin' ? 'OFFICER CLEARANCE' : 'SENTINEL TIER II'}
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleNav('/login')}
                className="px-3 py-1.5 border border-cyan-500/50 text-cyan-300 font-mono text-xs hover:bg-cyan-950/60 transition-colors"
              >
                SIGN IN
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={() => handleNav('/report')}
              className="px-2.5 py-1 bg-cyan-400 text-black font-display font-bold text-xs uppercase rounded"
            >
              REPORT
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded border border-cyan-500/40 text-cyan-300 hover:bg-cyan-950"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#040e1e] border-b border-cyan-500/40 px-4 pt-3 pb-6 space-y-2">
          {/* Quick Sim Switcher */}
          <div className="flex items-center justify-between pb-3 border-b border-cyan-900/60 font-mono text-xs">
            <span className="text-slate-400">Simulate Role:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => loginAsDemoUser('citizen')}
                className={`px-2 py-1 text-xs border rounded ${!isAdmin ? 'bg-cyan-950 border-cyan-400 text-cyan-300' : 'border-slate-700 text-slate-400'}`}
              >
                Citizen
              </button>
              <button
                onClick={() => loginAsDemoUser('admin')}
                className={`px-2 py-1 text-xs border rounded ${isAdmin ? 'bg-pink-950 border-pink-400 text-pink-300' : 'border-slate-700 text-slate-400'}`}
              >
                Admin
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleNav(link.path)}
                  className={`w-full text-left px-3 py-2.5 rounded font-mono text-xs flex items-center justify-between ${
                    isActive
                      ? 'bg-cyan-950 border border-cyan-400 text-cyan-300'
                      : 'text-slate-300 hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-pink-950 border border-pink-500 text-pink-300 rounded font-bold">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-cyan-900/60 font-mono text-xs text-slate-400">
            <button
              onClick={toggleCRT}
              className="flex items-center space-x-1.5 px-2 py-1 border border-slate-700 rounded"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>CRT Scanlines: {isCRTActive ? 'ON' : 'OFF'}</span>
            </button>
            <button
              onClick={() => handleNav(user ? '/rewards' : '/login')}
              className="text-cyan-300 hover:underline"
            >
              {user ? `Profile: ${user.name.split(' ')[0]}` : 'Sign In'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
