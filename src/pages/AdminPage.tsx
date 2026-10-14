import React, { useState } from 'react';
import { Incident, WorkflowStatus, IncidentSeverity, IncidentCategory, CATEGORY_LABELS, SEVERITY_COLORS, STATUS_COLORS } from '../types/incident';
import { incidentService } from '../services/incidentStorage';
import { useAuth } from '../context/AuthContext';
import { playTacticalBlip, playTacticalAlert, playSuccessChime } from '../utils/audio';
import {
  Lock,
  Search,
  Filter,
  Download,
  RotateCcw,
  ShieldAlert,
  Anchor,
  CheckCircle,
  XCircle,
  FileText,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

interface AdminPageProps {
  incidents: Incident[];
  onNavigate: (path: string) => void;
  onRefresh: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ incidents, onNavigate, onRefresh }) => {
  const { user, isAdmin, loginAsDemoUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  // Selected incident for management drawer
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Status Change State
  const [statusTarget, setStatusTarget] = useState<WorkflowStatus>('In Progress');
  const [statusNote, setStatusNote] = useState('');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [falseReportReason, setFalseReportReason] = useState('');

  // Team Assignment State
  const [teamName, setTeamName] = useState('');
  const [unitCode, setUnitCode] = useState('');

  // Reset demo modal state
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return incidents.filter((inc) => {
      if (filterCategory !== 'all' && inc.category !== filterCategory) return false;
      if (filterStatus !== 'all' && inc.workflowStatus !== filterStatus) return false;
      if (filterSeverity !== 'all' && inc.severity !== filterSeverity) return false;
      if (q) {
        if (!inc.id.toLowerCase().includes(q) && !inc.title.toLowerCase().includes(q) && !inc.locationName.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [incidents, filterCategory, filterStatus, filterSeverity, searchQuery]);

  const handleSelectIncident = (inc: Incident) => {
    playTacticalBlip(750, 0.04);
    setSelectedIncident(inc);
    setStatusTarget(inc.workflowStatus);
    setStatusNote('');
    setResolutionSummary(inc.resolutionSummary || '');
    setFalseReportReason(inc.falseReportReason || '');
    setActionMessage(null);
    setActionError(null);
  };

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident) return;
    setActionError(null);

    if (statusTarget === 'False Report' && !falseReportReason.trim()) {
      setActionError('Specific operational rationale is required to declare an incident as a False Report.');
      playTacticalAlert();
      return;
    }

    if (statusTarget === 'Resolved' && !resolutionSummary.trim()) {
      setActionError('Resolution summary and containment documentation is required to mark as Resolved.');
      playTacticalAlert();
      return;
    }

    const updated = incidentService.updateStatus(
      selectedIncident.id,
      statusTarget,
      user?.name || 'Administrator C. Diaz',
      'Admin',
      statusNote.trim() || undefined,
      {
        resolutionSummary: statusTarget === 'Resolved' ? resolutionSummary.trim() : undefined,
        falseReportReason: statusTarget === 'False Report' ? falseReportReason.trim() : undefined,
      }
    );

    if (updated) {
      setSelectedIncident(updated);
      setActionMessage(`Incident ${updated.id} status transitioned to "${statusTarget}".`);
      playSuccessChime();
      onRefresh();
    }
  };

  const handleAssignTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident) return;
    setActionError(null);

    if (!teamName.trim() || !unitCode.trim()) {
      setActionError('Both squad name and unit callsign are required.');
      playTacticalAlert();
      return;
    }

    const updated = incidentService.assignTeam(
      selectedIncident.id,
      teamName.trim(),
      unitCode.trim(),
      user?.name || 'Admin Dispatcher'
    );

    if (updated) {
      setSelectedIncident(updated);
      setTeamName('');
      setUnitCode('');
      setActionMessage(`Response squad ${unitCode} successfully assigned to ${updated.id}.`);
      playSuccessChime();
      onRefresh();
    }
  };

  const handleResetDemoData = () => {
    incidentService.resetDemoData();
    setConfirmResetOpen(false);
    setSelectedIncident(null);
    playSuccessChime();
    onRefresh();
  };

  const handleExportCSV = () => {
    playSuccessChime();
    const csvContent = incidentService.exportCSV(filtered);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CoastalGuard-Admin-Filtered-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-mono">
      {/* Top Banner & Demo Mode Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-pink-500/40 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-pink-400">
            <Lock className="w-3.5 h-3.5" />
            <span>AUTHORITY DISPATCH CONSOLE // CLEARANCE LEVEL TIER 1</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight mt-1">
            ENVIRONMENTAL RESPONSE & DISPATCH CONSOLE
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Triage citizen incident telemetry, assign cleanup squads, record containment actions, and update official resolution records.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              playTacticalBlip(700, 0.04);
              setConfirmResetOpen(true);
            }}
            className="px-3.5 py-2 bg-black/60 border border-amber-500/60 text-amber-300 hover:bg-amber-950/40 rounded text-xs flex items-center space-x-1.5 cursor-pointer"
            title="Reset storage to original calibrated demo incidents"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET DEMO DATA</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-black/60 border border-cyan-400 text-cyan-300 hover:bg-cyan-950/40 rounded text-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </div>

      {/* Admin Auth Notice / Quick Switcher */}
      {!isAdmin && (
        <div className="p-4 bg-pink-950/30 border border-pink-500 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-pink-300">
            <AlertTriangle className="w-4 h-4 text-pink-400 shrink-0" />
            <span>You are currently in Citizen mode. Switch to Officer clearance to execute dispatch operations.</span>
          </div>
          <button
            onClick={() => {
              loginAsDemoUser('admin');
              playSuccessChime();
            }}
            className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded uppercase shrink-0"
          >
            Switch to Demo Admin Officer
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="cyber-panel p-4 rounded space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, title, or location..."
              aria-label="Search incidents by ID, title, or coastal location"
              className="w-full pl-8 pr-3 py-2 bg-black/60 border border-slate-700 rounded text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              aria-label="Filter queue by pollution category"
              className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded text-cyan-200 focus:outline-none"
            >
              <option value="all">All Categories ({incidents.length})</option>
              {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              aria-label="Filter queue by workflow status"
              className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded text-cyan-200 focus:outline-none"
            >
              <option value="all">All Workflow Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="AI Verified">AI Verified</option>
              <option value="Cleanup Assigned">Cleanup Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="False Report">False Report</option>
            </select>
          </div>

          <div>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              aria-label="Filter queue by incident severity"
              className="w-full px-3 py-2 bg-black/60 border border-slate-700 rounded text-cyan-200 focus:outline-none"
            >
              <option value="all">All Severities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout: Incident Queue & Selected Incident Inspector Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Incidents Queue Table */}
        <div className="lg:col-span-7 cyber-panel rounded overflow-hidden">
          <div className="p-4 bg-black/60 border-b border-cyan-900/60 flex items-center justify-between text-xs font-bold text-cyan-300">
            <span>INCIDENT QUEUE ({filtered.length} INCIDENTS)</span>
            <span className="text-slate-400 font-normal">Click to Inspect & Dispatch</span>
          </div>

          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-300" aria-label="Incident response telemetry queue">
              <thead className="bg-black/90 text-cyan-400 uppercase text-[10px] sticky top-0 border-b border-cyan-900">
                <tr>
                  <th scope="col" className="px-3 py-2.5">ID</th>
                  <th scope="col" className="px-3 py-2.5">Title & Sector</th>
                  <th scope="col" className="px-3 py-2.5">Severity</th>
                  <th scope="col" className="px-3 py-2.5">Status</th>
                  <th scope="col" className="px-3 py-2.5">Assigned Squad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      No records match the current administrative filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((inc) => {
                    const isSelected = selectedIncident?.id === inc.id;
                    const sev = SEVERITY_COLORS[inc.severity];
                    const stat = STATUS_COLORS[inc.workflowStatus];

                    return (
                      <tr
                        key={inc.id}
                        onClick={() => handleSelectIncident(inc)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-cyan-950/80 border-l-4 border-cyan-400' : 'hover:bg-cyan-950/20'
                        }`}
                      >
                        <td className="px-3 py-3 font-bold text-cyan-300">{inc.id}</td>
                        <td className="px-3 py-3">
                          <div className="font-semibold text-white max-w-[200px] truncate">{inc.title}</div>
                          <div className="text-[10px] text-slate-400 truncate">{inc.locationName}</div>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] border font-bold ${sev.border} ${sev.text} ${sev.bg}`}>
                            {inc.severity}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`text-[11px] ${stat.text}`}>● {inc.workflowStatus}</span>
                        </td>
                        <td className="px-3 py-3 text-slate-400 text-[11px]">
                          {inc.assignedTeam ? inc.assignedTeam.unitCode : <span className="text-slate-600">Unassigned</span>}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (5 cols): Incident Command & Control Drawer */}
        <div className="lg:col-span-5 space-y-4">
          {selectedIncident ? (
            <div className="cyber-panel p-5 rounded space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-cyan-900/60">
                <div>
                  <span className="text-cyan-400 text-xs font-bold">{selectedIncident.id}</span>
                  <h3 className="font-display font-bold text-base text-white mt-0.5">
                    {selectedIncident.title}
                  </h3>
                </div>
                <button
                  onClick={() => onNavigate(`/report/${selectedIncident.id}`)}
                  className="text-xs text-cyan-300 hover:text-cyan-100 flex items-center space-x-1"
                  title="Open Full Incident Page"
                >
                  <span>Full Record</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {actionMessage && (
                <div className="p-2.5 bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs rounded">
                  {actionMessage}
                </div>
              )}

              {actionError && (
                <div className="p-2.5 bg-rose-950/80 border border-rose-500 text-rose-300 text-xs rounded">
                  {actionError}
                </div>
              )}

              {/* Status Update Form */}
              <form onSubmit={handleUpdateStatus} className="space-y-3 pt-1">
                <div className="text-xs font-bold text-white uppercase border-b border-slate-800 pb-1">
                  1. UPDATE OPERATIONAL STATUS
                </div>

                <div>
                  <label className="text-slate-400 block text-[11px] mb-1">Target Status:</label>
                  <select
                    value={statusTarget}
                    onChange={(e) => setStatusTarget(e.target.value as WorkflowStatus)}
                    className="w-full px-3 py-2 bg-black border border-cyan-800 rounded text-xs text-white"
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
                  <label className="text-slate-400 block text-[11px] mb-1">Operational Log Note:</label>
                  <input
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="e.g. Sorbent boom deployment in progress"
                    className="w-full px-3 py-1.5 bg-black border border-slate-700 rounded text-xs text-white"
                  />
                </div>

                {statusTarget === 'Resolved' && (
                  <div>
                    <label className="text-emerald-400 block text-[11px] mb-1 font-bold">
                      Resolution Summary (Required for Resolved):
                    </label>
                    <textarea
                      rows={2}
                      value={resolutionSummary}
                      onChange={(e) => setResolutionSummary(e.target.value)}
                      placeholder="Detail actions taken, weight of debris removed, or lab sample results..."
                      className="w-full px-3 py-1.5 bg-black border border-emerald-600 rounded text-xs text-white"
                    />
                  </div>
                )}

                {statusTarget === 'False Report' && (
                  <div>
                    <label className="text-rose-400 block text-[11px] mb-1 font-bold">
                      Reason for False Report Classification:
                    </label>
                    <textarea
                      rows={2}
                      value={falseReportReason}
                      onChange={(e) => setFalseReportReason(e.target.value)}
                      placeholder="Document inspection findings proving non-polluting condition..."
                      className="w-full px-3 py-1.5 bg-black border border-rose-600 rounded text-xs text-white"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!isAdmin}
                  className="w-full py-2 bg-pink-600 hover:bg-pink-500 disabled:opacity-40 text-white font-bold text-xs uppercase rounded cursor-pointer"
                >
                  Confirm Status Transition
                </button>
              </form>

              {/* Team Assignment Form */}
              <form onSubmit={handleAssignTeam} className="space-y-3 pt-3 border-t border-slate-800">
                <div className="text-xs font-bold text-white uppercase border-b border-slate-800 pb-1">
                  2. ASSIGN RESPONSE TASKFORCE
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block text-[10px] mb-1">Team Name:</label>
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="e.g. Pacific Sweep Alpha"
                      className="w-full px-2.5 py-1.5 bg-black border border-slate-700 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block text-[10px] mb-1">Unit Code:</label>
                    <input
                      type="text"
                      value={unitCode}
                      onChange={(e) => setUnitCode(e.target.value)}
                      placeholder="e.g. PRS-A"
                      className="w-full px-2.5 py-1.5 bg-black border border-slate-700 rounded text-xs text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!isAdmin}
                  className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-bold text-xs uppercase rounded cursor-pointer"
                >
                  Dispatch Squad
                </button>
              </form>
            </div>
          ) : (
            <div className="cyber-panel p-8 rounded text-center text-slate-500 space-y-2">
              <ShieldAlert className="w-8 h-8 text-cyan-500/40 mx-auto" />
              <div className="text-sm font-bold text-slate-400">NO INCIDENT SELECTED</div>
              <p className="text-xs">
                Select an incident from the queue on the left to inspect its telemetry dossier, assign cleanup teams, or transition workflow status.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Resetting Demo Data */}
      {confirmResetOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#051428] border-2 border-amber-500 rounded p-6 max-w-md w-full space-y-4 shadow-[0_0_30px_rgba(245,158,11,0.4)]">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>CONFIRM DEMO REINITIALIZATION</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This action will reset the local incident database and Coast Guardian rewards back to the initial 5 calibrated environmental scenario records. Any user-submitted incidents in browser memory will be replaced.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmResetOpen(false)}
                className="px-4 py-2 bg-black border border-slate-700 text-slate-300 hover:text-white rounded text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetDemoData}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded text-xs uppercase"
              >
                Reset Demo Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
