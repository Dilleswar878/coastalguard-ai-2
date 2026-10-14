import React, { useState, useEffect } from 'react';
import { UserRewardProfile, Incident } from '../types/incident';
import { incidentService } from '../services/incidentStorage';
import { useAuth } from '../context/AuthContext';
import { playTacticalBlip, playSuccessChime } from '../utils/audio';
import {
  Award,
  Shield,
  Star,
  CheckCircle2,
  Crosshair,
  AlertTriangle,
  Trophy,
  History,
  Info,
  ExternalLink,
  Flame,
} from 'lucide-react';

interface RewardsPageProps {
  incidents: Incident[];
  onNavigate: (path: string) => void;
}

export const RewardsPage: React.FC<RewardsPageProps> = ({ incidents, onNavigate }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserRewardProfile>(() => incidentService.getUserRewards());

  useEffect(() => {
    const unsub = incidentService.subscribe(() => {
      setProfile(incidentService.getUserRewards());
    });
    return unsub;
  }, []);

  // Filter user's submitted incidents
  const userIncidents = incidents.filter(
    (inc) =>
      !inc.submittedBy.isAnonymous &&
      (inc.submittedBy.email === user?.email || inc.submittedBy.name.includes('Kai Vance') || inc.submittedBy.id === user?.id)
  );

  // Calibrated illustrative leaderboard
  const leaderboard = [
    { rank: 1, callsign: 'Captain Marina S.', points: 180, reports: 18, badge: 'Ocean Vanguard Commander' },
    { rank: 2, callsign: 'ReefDiver_Maya', points: 140, reports: 14, badge: 'Senior Coastal Sentinel' },
    { rank: 3, callsign: 'Dr. E. Rostova', points: 90, reports: 9, badge: 'Biohazard Interceptor' },
    { rank: 4, callsign: profile.displayName, points: profile.totalPoints, reports: profile.reportsSubmitted, isUser: true, badge: profile.rankTitle },
    { rank: 5, callsign: 'HarborSentry_9', points: 40, reports: 4, badge: 'Coast Sentry Tier I' },
  ].sort((a, b) => b.points - a.points);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 font-mono">
      {/* Top Banner */}
      <div className="pb-4 border-b border-cyan-500/30">
        <div className="flex items-center space-x-2 text-xs text-cyan-400">
          <Award className="w-3.5 h-3.5" />
          <span>COAST GUARDIAN CITIZEN CITATION SYSTEM</span>
        </div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight mt-1">
          GUARDIAN TOKENS & CITIZEN SENTRY ACCOLADES
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Earning recognition for verifiable shoreline surveillance, timely hazard alerts, and validated cleanups.
        </p>
      </div>

      {/* Main Profile Header Card */}
      <div className="cyber-panel p-6 rounded relative overflow-hidden bg-gradient-to-r from-[#03152c] to-[#041c38]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-cyan-950 border border-cyan-400 text-cyan-300 text-xs font-bold">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>{profile.rankTitle.toUpperCase()}</span>
            </div>

            <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wider">
              {profile.displayName}
            </h2>

            <p className="text-xs text-slate-300 max-w-lg">
              Active coastal surveillance cadence. Telemetry submissions contribute directly to municipal hazard mitigation and marine sanctuary defense.
            </p>
          </div>

          <div className="md:col-span-4 flex md:justify-end">
            <div className="p-4 bg-black/70 border-2 border-cyan-400 rounded-sm text-center min-w-[180px] shadow-[0_0_25px_rgba(0,240,255,0.3)]">
              <span className="text-[10px] text-cyan-300 font-bold uppercase block tracking-wider">
                COAST GUARDIAN BALANCE
              </span>
              <div className="font-display font-black text-4xl sm:text-5xl text-white mt-1">
                {profile.totalPoints}
                <span className="text-cyan-400 text-lg ml-1">PTS</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">
                {profile.qualifyingReports} Qualifying Reports Logged
              </span>
            </div>
          </div>
        </div>

        {/* Level Progression Bar */}
        <div className="mt-6 pt-4 border-t border-cyan-900/60 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Progression to Next Sentinel Rank:</span>
            <span className="text-cyan-300 font-bold">{profile.totalPoints} / 100 PTS</span>
          </div>
          <div className="w-full bg-black/60 h-2.5 rounded overflow-hidden border border-cyan-900">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-teal-400 to-pink-500 transition-all duration-700"
              style={{ width: `${Math.min(100, (profile.totalPoints / 100) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Rewards Rules & Qualification Guide */}
      <div className="p-4 bg-black/60 border border-cyan-500/40 rounded space-y-2 text-xs">
        <div className="text-cyan-300 font-bold flex items-center space-x-1.5 uppercase">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>REWARD SYSTEM OPERATIONAL RULES & POLICY:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-300 text-[11px] pt-1">
          <div className="p-2.5 bg-black/40 border border-slate-800 rounded">
            <strong className="text-white block mb-0.5">1. ELIGIBLE REPORTS (+10 PTS)</strong>
            Every unique report with verified pollution category and descriptive evidence earns 10 Coast Guardian Points upon registration.
          </div>
          <div className="p-2.5 bg-black/40 border border-slate-800 rounded">
            <strong className="text-white block mb-0.5">2. ZERO DUPLICATION DISCIPLINE</strong>
            Points are calculated and awarded strictly once per validated incident. Refreshing pages or recalculating state never duplicates awards.
          </div>
          <div className="p-2.5 bg-black/40 border border-slate-800 rounded">
            <strong className="text-white block mb-0.5">3. FALSE REPORT REVOCATION</strong>
            Reports evaluated and officially confirmed as False Reports forfeit reward points, maintaining audit integrity.
          </div>
        </div>
      </div>

      {/* Badges & Achievements */}
      <div className="cyber-panel p-6 rounded space-y-4">
        <div className="flex items-center justify-between border-b border-cyan-900/60 pb-3">
          <div className="flex items-center space-x-2 text-cyan-300 font-bold text-sm uppercase">
            <Trophy className="w-4 h-4 text-cyan-400" />
            <span>GUARDIAN MERIT BADGES</span>
          </div>
          <span className="text-xs text-slate-400">
            {profile.badges.filter((b) => b.unlockedAt).length} / {profile.badges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {profile.badges.map((badge) => {
            const isUnlocked = Boolean(badge.unlockedAt);

            return (
              <div
                key={badge.id}
                className={`p-4 rounded border transition-all ${
                  isUnlocked
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                    : 'bg-black/40 border-slate-800 opacity-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded flex items-center justify-center border ${
                    isUnlocked ? 'bg-cyan-950 border-cyan-400 text-cyan-300' : 'bg-slate-900 border-slate-700 text-slate-500'
                  }`}>
                    {isUnlocked ? <CheckCircle2 className="w-5 h-5 text-cyan-400" /> : <Shield className="w-5 h-5" />}
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    isUnlocked ? 'bg-cyan-900/80 text-cyan-300' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {isUnlocked ? 'EARNED' : 'LOCKED'}
                  </span>
                </div>

                <div className="font-display font-bold text-sm text-white">{badge.name}</div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{badge.description}</p>

                {badge.unlockedAt && (
                  <div className="text-[10px] text-cyan-400/80 mt-3 pt-2 border-t border-cyan-950">
                    Awarded: {new Date(badge.unlockedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Community Leaderboard & User Report Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left (6 cols): Community Leaderboard */}
        <div className="lg:col-span-6 cyber-panel p-5 rounded space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-900/60 pb-3">
            <div className="flex items-center space-x-2 text-cyan-300 font-bold text-sm uppercase">
              <Flame className="w-4 h-4 text-pink-500" />
              <span>COAST SENTRY LEADERBOARD</span>
            </div>
            <span className="text-[10px] text-slate-500">PACIFIC SECTOR</span>
          </div>

          <div className="space-y-2">
            {leaderboard.map((item, index) => (
              <div
                key={index}
                className={`p-3 rounded border flex items-center justify-between text-xs ${
                  item.isUser
                    ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                    : 'bg-black/40 border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${
                    index === 0 ? 'bg-amber-500 text-black' : index === 1 ? 'bg-slate-300 text-black' : index === 2 ? 'bg-amber-800 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center space-x-1.5">
                      <span>{item.callsign}</span>
                      {item.isUser && (
                        <span className="text-[9px] px-1 bg-cyan-950 border border-cyan-400 text-cyan-300 rounded">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">{item.badge}</div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-display font-black text-sm text-cyan-300">{item.points} PTS</span>
                  <div className="text-[10px] text-slate-400">{item.reports} reports</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right (6 cols): Citizen's Reporting History */}
        <div className="lg:col-span-6 cyber-panel p-5 rounded space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-900/60 pb-3">
            <div className="flex items-center space-x-2 text-cyan-300 font-bold text-sm uppercase">
              <History className="w-4 h-4 text-cyan-400" />
              <span>YOUR RECENT REPORT CITATIONS</span>
            </div>
            <button
              onClick={() => onNavigate('/report')}
              className="text-xs text-cyan-400 hover:underline"
            >
              + Submit Report
            </button>
          </div>

          <div className="space-y-2.5">
            {userIncidents.length === 0 ? (
              <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded text-xs">
                No reports submitted under current cadet callsign yet. Submit an incident to earn 10 Coast Guardian points.
              </div>
            ) : (
              userIncidents.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => onNavigate(`/report/${inc.id}`)}
                  className="p-3 bg-black/50 border border-slate-800 hover:border-cyan-500 rounded cursor-pointer transition-colors flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-cyan-300">{inc.id}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-white font-medium truncate max-w-[200px]">{inc.title}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      📍 {inc.locationName} • Status: <span className="text-cyan-400">{inc.workflowStatus}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold text-emerald-400">+{inc.rewardPoints} PTS</span>
                    <div className="text-[10px] text-slate-500">{new Date(inc.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
