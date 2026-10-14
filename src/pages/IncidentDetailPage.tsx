import React, { useState } from 'react';
import { Incident, WorkflowStatus, SEVERITY_COLORS, STATUS_COLORS, CATEGORY_LABELS } from '../types/incident';
import { incidentService } from '../services/incidentStorage';
import { useAuth } from '../context/AuthContext';
import { playTacticalBlip, playSuccessChime, playTacticalAlert } from '../utils/audio';
import {
  Shield,
  MapPin,
  Clock,
  User,
  Cpu,
  Anchor,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Share2,
  FileText,
  ShieldAlert,
  Send,
  Lock,
} from 'lucide-react';

interface IncidentDetailPageProps {
  incidentId: string;
  onNavigate: (path: string) => void;
}

export const IncidentDetailPage: React.FC<IncidentDetailPageProps> = ({ incidentId, onNavigate }) => {
  const { user, isAdmin } = useAuth();
  const [incident, setIncident] = useState<Incident | null>(() => incidentService.getById(incidentId));

  // Admin Quick Action State
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<WorkflowStatus>('In Progress');
  const [statusNote, setStatusNote] = useState('');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [falseReportReason, setFalseReportReason] = useState('');
  const [assignTeamName, setAssignTeamName] = useState('');
  const [assignUnitCode, setAssignUnitCode] = useState('');
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!incident) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4 font-mono">
        <div className="p-6 bg-rose-950/60 border border-rose-500 rounded text-rose-300">
          <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <h2 className="font-display font-bold text-lg text-white">INCIDENT RECORD NOT FOUND</h2>
          <p className="text-xs text-slate-400 mt-1">
            Telemetry identifier <strong className="text-rose-400">"{incidentId}"</strong> does not exist in active memory.
          </p>
        </div>
        <button
          onClick={() => onNavigate('/map')}
          className="px-4 py-2 bg-cyan-400 text-black font-display font-bold uppercase rounded text-xs"
        >
          Return to Tactical Map
        </button>
      </div>
    );
  }

  const sev = SEVERITY_COLORS[incident.severity];
  const stat = STATUS_COLORS[incident.workflowStatus];
  const ai = incident.aiAssessment;

  const handleStatusChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);

    if (newStatus === 'False Report' && !falseReportReason.trim()) {
      setActionError('A valid operational reason is required when flagging an incident as a False Report.');
      playTacticalAlert();
      return;
    }

    if (newStatus === 'Resolved' && !resolutionSummary.trim()) {
      setActionError('Resolution summary and containment actions must be documented.');
      playTacticalAlert();
      return;
    }

    const updated = incidentService.updateStatus(
      incident.id,
      newStatus,
      user?.name || 'Administrator',
      'Admin',
      statusNote.trim() || undefined,
      {
        resolutionSummary: newStatus === 'Resolved' ? resolutionSummary.trim() : undefined,
        falseReportReason: newStatus === 'False Report' ? falseReportReason.trim() : undefined,
      }
    );

    if (updated) {
      setIncident(updated);
      setStatusUpdateOpen(false);
      setStatusNote('');
      playSuccessChime();
    }
  };

  const handleAssignTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTeamName.trim() || !assignUnitCode.trim()) {
      setActionError('Please specify team name and tactical unit callsign.');
      playTacticalAlert();
      return;
    }

    const updated = incidentService.assignTeam(
      incident.id,
      assignTeamName.trim(),
      assignUnitCode.trim(),
      user?.name || 'Admin Dispatcher'
    );

    if (updated) {
      setIncident(updated);
      setShowTeamModal(false);
      setAssignTeamName('');
      setAssignUnitCode('');
      playSuccessChime();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8 font-mono">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex items-center justify-between border-b border-cyan-900/60 pb-3 text-xs">
        <button
          onClick={() => {
            playTacticalBlip(600, 0.04);
            onNavigate('/map');
          }}
          className="flex items-center space-x-1.5 text-cyan-400 hover:text-cyan-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO RADAR MAP</span>
        </button>

        <div className="flex items-center space-x-2">
          {isAdmin && (
            <button
              onClick={() => {
                setStatusUpdateOpen(!statusUpdateOpen);
                playTacticalBlip(750, 0.04);
              }}
              className="px-3 py-1 bg-pink-950 border border-pink-500 text-pink-300 font-bold rounded hover:bg-pink-900 flex items-center space-x-1"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>DISPATCH WORKFLOW</span>
            </button>
          )}

          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
              }
              playTacticalBlip(800, 0.04);
            }}
            className="px-3 py-1 bg-black/60 border border-slate-700 text-slate-300 rounded hover:border-cyan-400 flex items-center space-x-1"
            title="Copy Report Link to Clipboard"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>SHARE</span>
          </button>
        </div>
      </div>

      {/* Main Incident Dossier Header */}
      <div className="cyber-panel p-6 rounded space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-900/60 pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-cyan-400">
              <span className="font-bold">{incident.id}</span>
              <span>//</span>
              <span>{CATEGORY_LABELS[incident.category] || incident.category}</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase mt-1">
              {incident.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1 rounded border text-xs font-bold ${sev.border} ${sev.text} ${sev.bg}`}>
              {incident.severity.toUpperCase()} SEVERITY
            </span>
            <span className={`px-3 py-1 rounded border text-xs font-bold ${stat.border} ${stat.text} ${stat.bg}`}>
              ● {incident.workflowStatus.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Location & Metadata Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-300 pt-2">
          <div>
            <span className="text-slate-500 text-[10px] block">COASTAL SECTOR:</span>
            <span className="font-semibold text-white flex items-center space-x-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">{incident.locationName}</span>
            </span>
          </div>

          <div>
            <span className="text-slate-500 text-[10px] block">COORDINATES:</span>
            <span className="text-cyan-300 mt-0.5 block">
              {incident.latitude && incident.longitude
                ? `${incident.latitude.toFixed(4)}° N, ${incident.longitude.toFixed(4)}° W`
                : 'Approximate Zone'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 text-[10px] block">OBSERVED TIMESTAMP:</span>
            <span className="text-slate-300 mt-0.5 block">
              {new Date(incident.observedAt).toLocaleString()}
            </span>
          </div>

          <div>
            <span className="text-slate-500 text-[10px] block">REPORTER:</span>
            <span className="text-slate-300 mt-0.5 block">
              {incident.submittedBy.isAnonymous ? 'Anonymous Sentinel' : incident.submittedBy.name}
            </span>
          </div>
        </div>
      </div>

      {/* Admin Action Drawer (if opened) */}
      {isAdmin && statusUpdateOpen && (
        <div className="p-6 bg-pink-950/20 border-2 border-pink-500 rounded cyber-panel space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-pink-900/60">
            <div className="flex items-center space-x-2 text-pink-300 font-bold text-sm">
              <Lock className="w-4 h-4 text-pink-400" />
              <span>OFFICER DISPATCH & WORKFLOW CONTROLS</span>
            </div>
            <button
              onClick={() => setStatusUpdateOpen(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              [Close]
            </button>
          </div>

          {actionError && (
            <div className="p-2.5 bg-rose-950 border border-rose-500 text-rose-300 text-xs rounded">
              {actionError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form A: Transition Workflow Status */}
            <form onSubmit={handleStatusChangeSubmit} className="space-y-3">
              <div className="font-bold text-xs text-white uppercase">Change Incident Status:</div>

              <div>
                <label className="text-slate-400 block text-[11px] mb-1">Target Workflow Status:</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as WorkflowStatus)}
                  className="w-full px-3 py-2 bg-black border border-pink-800 rounded text-xs text-white"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="AI Verified">AI Verified</option>
                  <option value="Cleanup Assigned">Cleanup Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="False Report">False Report</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block text-[11px] mb-1">Audit Log Note:</label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Field agent confirmed oil sheen perimeter"
                  className="w-full px-3 py-2 bg-black border border-slate-700 rounded text-xs text-white"
                />
              </div>

              {newStatus === 'Resolved' && (
                <div>
                  <label className="text-emerald-400 block text-[11px] mb-1 font-bold">
                    Resolution Summary (Required for closure):
                  </label>
                  <textarea
                    rows={2}
                    value={resolutionSummary}
                    onChange={(e) => setResolutionSummary(e.target.value)}
                    placeholder="Document cleanup actions, recovered debris volume, and confirmatory lab water sample testing..."
                    className="w-full px-3 py-2 bg-black border border-emerald-600 rounded text-xs text-white"
                  />
                </div>
              )}

              {newStatus === 'False Report' && (
                <div>
                  <label className="text-rose-400 block text-[11px] mb-1 font-bold">
                    False Report Justification (Required):
                  </label>
                  <textarea
                    rows={2}
                    value={falseReportReason}
                    onChange={(e) => setFalseReportReason(e.target.value)}
                    placeholder="Provide specific findings explaining why this report was inaccurate or non-polluting..."
                    className="w-full px-3 py-2 bg-black border border-rose-600 rounded text-xs text-white"
                  />
                </div>
              )}

              <button
                type="submit"
                className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs uppercase rounded cursor-pointer"
              >
                Apply Status Transition
              </button>
            </form>

            {/* Form B: Assign Response Squad */}
            <form onSubmit={handleAssignTeamSubmit} className="space-y-3 border-t md:border-t-0 md:border-l border-slate-800 md:pl-6">
              <div className="font-bold text-xs text-white uppercase">Assign Response Team:</div>

              <div>
                <label className="text-slate-400 block text-[11px] mb-1">Squad / Team Name:</label>
                <input
                  type="text"
                  value={assignTeamName}
                  onChange={(e) => setAssignTeamName(e.target.value)}
                  placeholder="e.g. Pacific Rapid Sweep Alpha"
                  className="w-full px-3 py-2 bg-black border border-slate-700 rounded text-xs text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block text-[11px] mb-1">Unit Code Callsign:</label>
                <input
                  type="text"
                  value={assignUnitCode}
                  onChange={(e) => setAssignUnitCode(e.target.value)}
                  placeholder="e.g. PRS-A or HAZMAT-1"
                  className="w-full px-3 py-2 bg-black border border-slate-700 rounded text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase rounded cursor-pointer"
              >
                Assign Response Team
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Grid: Left = Description & Photo, Right = AI Assessment & Precautions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Evidence & Description */}
        <div className="lg:col-span-7 space-y-6">
          {/* Photo Evidence */}
          {incident.imageUrl && (
            <div className="cyber-panel p-4 rounded space-y-2">
              <div className="text-cyan-400 text-xs font-bold uppercase flex items-center justify-between">
                <span>PHOTOGRAPHIC EVIDENCE STREAM</span>
                <span className="text-slate-500 text-[10px]">VERIFIED VISUAL CAPTURE</span>
              </div>
              <div className="rounded overflow-hidden border border-cyan-500/50 bg-black max-h-[380px] flex items-center justify-center">
                <img
                  src={incident.imageUrl}
                  alt={incident.title}
                  className="w-full h-full object-cover max-h-[380px]"
                />
              </div>
            </div>
          )}

          {/* Description Card */}
          <div className="cyber-panel p-5 rounded space-y-3">
            <h3 className="font-display font-bold text-sm text-cyan-300 uppercase">
              CITIZEN SENSORY STATEMENT
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
              {incident.description}
            </p>

            {incident.assignedTeam && (
              <div className="mt-4 pt-3 border-t border-slate-800 bg-cyan-950/20 p-3 rounded flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">ASSIGNED RESPONSE SQUAD:</span>
                  <span className="font-bold text-cyan-300">{incident.assignedTeam.name}</span>
                  <span className="text-slate-400 ml-2">({incident.assignedTeam.unitCode})</span>
                </div>
                <Anchor className="w-5 h-5 text-cyan-400" />
              </div>
            )}

            {incident.resolutionSummary && (
              <div className="mt-4 p-4 bg-emerald-950/40 border border-emerald-500/60 rounded space-y-1">
                <span className="font-bold text-xs text-emerald-300 uppercase block">
                  FIELD RESOLUTION SUMMARY:
                </span>
                <p className="text-xs text-emerald-100">{incident.resolutionSummary}</p>
              </div>
            )}

            {incident.falseReportReason && (
              <div className="mt-4 p-4 bg-rose-950/40 border border-rose-500/60 rounded space-y-1">
                <span className="font-bold text-xs text-rose-300 uppercase block">
                  FALSE REPORT RATIONALE:
                </span>
                <p className="text-xs text-rose-100">{incident.falseReportReason}</p>
              </div>
            )}
          </div>

          {/* Activity History Timeline */}
          <div className="cyber-panel p-5 rounded space-y-4">
            <h3 className="font-display font-bold text-sm text-cyan-300 uppercase flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>INCIDENT AUDIT TIMELINE ({incident.activityHistory.length} ENTRIES)</span>
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-cyan-500/40">
              {incident.activityHistory.map((item) => (
                <div key={item.id} className="relative">
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-cyan-400 border-2 border-black" />
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span className="text-cyan-300 font-bold">{item.actor}</span>
                    <span>{new Date(item.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-white font-semibold mt-0.5">
                    Transitioned to: <span className="text-cyan-400">{item.newStatus}</span>
                  </div>
                  {item.note && (
                    <p className="text-xs text-slate-300 mt-1 bg-black/40 p-2 rounded border border-slate-800">
                      {item.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): AI Assessment Dossier */}
        <div className="lg:col-span-5 space-y-6">
          <div className="cyber-panel p-5 rounded space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-900/60 pb-3">
              <div className="flex items-center space-x-2 text-cyan-300 font-bold text-xs uppercase">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>AI ASSESSMENT INTEL</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-black/60 border border-cyan-800 text-cyan-300 font-bold">
                CONFIDENCE: {ai.confidence}%
              </span>
            </div>

            {/* Immediate Precautions Callout */}
            <div className="p-3 bg-pink-950/40 border border-pink-500/60 rounded space-y-1.5 text-xs">
              <div className="flex items-center space-x-1.5 text-pink-400 font-bold text-[11px] uppercase">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>MANDATORY PRECAUTIONS:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-pink-200 text-[11px]">
                {ai.immediatePrecautions.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>

            {/* Environmental Impact */}
            <div className="space-y-1 text-xs">
              <span className="text-slate-400 text-[11px] uppercase font-bold block">Ecosystem Impact:</span>
              <p className="text-slate-300 leading-relaxed text-[11px]">{ai.environmentalImpact}</p>
            </div>

            {/* Affected Ecosystems */}
            <div className="space-y-1 text-xs">
              <span className="text-slate-400 text-[11px] uppercase font-bold block">Sensitive Habitats:</span>
              <div className="flex flex-wrap gap-1">
                {ai.affectedEcosystems.map((eco, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-black/60 border border-cyan-900 text-[10px] text-cyan-300">
                    {eco}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommended Response Actions */}
            <div className="space-y-1 text-xs">
              <span className="text-slate-400 text-[11px] uppercase font-bold block">Recommended Authority Actions:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                {ai.recommendedActions.map((act, i) => (
                  <li key={i}>{act}</li>
                ))}
              </ul>
            </div>

            {/* Agency */}
            <div className="p-2.5 bg-black/60 border border-slate-800 rounded text-xs space-y-0.5">
              <span className="text-slate-500 text-[10px] block uppercase font-bold">Recommended Jurisdiction:</span>
              <span className="text-white font-semibold">{ai.suggestedAgency}</span>
            </div>

            {/* Model & Limitations */}
            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 space-y-1">
              <div>
                <strong className="text-cyan-400">Model Engine:</strong> {ai.modelUsed}{' '}
                {ai.isFallback ? '(Rule-Based Fallback Mode)' : ''}
              </div>
              <div className="text-slate-500 leading-relaxed">
                <strong>Limitations:</strong> {ai.limitations}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
