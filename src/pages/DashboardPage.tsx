import React, { useState } from 'react';
import { Incident, IncidentCategory, IncidentSeverity, WorkflowStatus, CATEGORY_LABELS } from '../types/incident';
import { incidentService } from '../services/incidentStorage';
import { playTacticalBlip, playSuccessChime } from '../utils/audio';
import {
  BarChart3,
  TrendingUp,
  Download,
  Filter,
  Search,
  Shield,
  Clock,
  Layers,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface DashboardPageProps {
  incidents: Incident[];
  onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ incidents, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Filtered dataset
  const filtered = incidents.filter((inc) => {
    if (filterCategory !== 'all' && inc.category !== filterCategory) return false;
    if (filterSeverity !== 'all' && inc.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && inc.workflowStatus !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = inc.title.toLowerCase().includes(q);
      const matchLoc = inc.locationName.toLowerCase().includes(q);
      const matchId = inc.id.toLowerCase().includes(q);
      if (!matchTitle && !matchLoc && !matchId) return false;
    }
    return true;
  });

  // Calculate live metrics dynamically from filtered dataset!
  const metrics = incidentService.calculateMetrics(filtered);

  // CSV Export
  const handleExportCSV = () => {
    playSuccessChime();
    const csvContent = incidentService.exportCSV(filtered);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CoastalGuard-Intelligence-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 font-mono">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-cyan-500/30 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-cyan-400">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>MACRO-ENVIRONMENTAL TELEMETRY INTELLIGENCE</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight mt-1">
            COASTAL POLLUTION INTELLIGENCE DASHBOARD
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time statistical synthesis of incident frequencies, severity distributions, response performance, and ecological threat trends.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded bg-black/80 hover:bg-cyan-950 border border-cyan-400 text-cyan-300 font-mono text-xs font-bold flex items-center space-x-2 shrink-0 cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.3)]"
          title="Export Filtered Incident Data as CSV"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>EXPORT CSV DATASET</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="cyber-panel p-4 rounded space-y-3">
        <div className="flex items-center space-x-2 text-xs text-cyan-300 font-bold border-b border-cyan-900/60 pb-2">
          <Filter className="w-3.5 h-3.5" />
          <span>REAL-TIME QUERY PARAMETERS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports or locations..."
              className="w-full pl-8 pr-3 py-2 bg-black/60 border border-cyan-900 rounded text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                playTacticalBlip(700, 0.03);
              }}
              className="w-full px-3 py-2 bg-black/60 border border-cyan-900 rounded text-cyan-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterSeverity}
              onChange={(e) => {
                setFilterSeverity(e.target.value);
                playTacticalBlip(700, 0.03);
              }}
              className="w-full px-3 py-2 bg-black/60 border border-cyan-900 rounded text-cyan-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Severities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                playTacticalBlip(700, 0.03);
              }}
              className="w-full px-3 py-2 bg-black/60 border border-cyan-900 rounded text-cyan-200 focus:outline-none focus:border-cyan-400"
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
        </div>
      </div>

      {/* KPI Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 bg-black/50 border border-slate-800 rounded cyber-panel">
          <span className="text-[10px] text-slate-400 uppercase block">TOTAL REPORTS</span>
          <div className="font-display font-black text-3xl text-cyan-400 mt-1">{metrics.totalReports}</div>
          <span className="text-[10px] text-slate-500 block mt-1">Filtered Sample Space</span>
        </div>

        <div className="p-4 bg-black/50 border border-slate-800 rounded cyber-panel">
          <span className="text-[10px] text-slate-400 uppercase block">ACTIVE OPEN</span>
          <div className="font-display font-black text-3xl text-pink-500 mt-1">{metrics.openIncidents}</div>
          <span className="text-[10px] text-pink-400/80 block mt-1">Require Containment</span>
        </div>

        <div className="p-4 bg-black/50 border border-slate-800 rounded cyber-panel">
          <span className="text-[10px] text-slate-400 uppercase block">HIGH / CRITICAL</span>
          <div className="font-display font-black text-3xl text-amber-400 mt-1">{metrics.highPriorityIncidents}</div>
          <span className="text-[10px] text-amber-300/80 block mt-1">Hazard Escalations</span>
        </div>

        <div className="p-4 bg-black/50 border border-slate-800 rounded cyber-panel">
          <span className="text-[10px] text-slate-400 uppercase block">RESOLVED CLEANUPS</span>
          <div className="font-display font-black text-3xl text-emerald-400 mt-1">{metrics.resolvedIncidents}</div>
          <span className="text-[10px] text-emerald-400/80 block mt-1">Neutralized Hazards</span>
        </div>

        <div className="col-span-2 lg:col-span-1 p-4 bg-black/50 border border-slate-800 rounded cyber-panel">
          <span className="text-[10px] text-slate-400 uppercase block">AVG RESPONSE TIME</span>
          <div className="font-display font-black text-3xl text-cyan-300 mt-1">
            {metrics.averageResponseHours !== null ? `${metrics.averageResponseHours}h` : 'N/A'}
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">
            {metrics.averageResponseHours !== null ? 'Report to Closure' : 'Awaiting closures'}
          </span>
        </div>
      </div>

      {/* Charts Section: Responsive CSS Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Chart */}
        <div className="cyber-panel p-5 rounded space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-900/60 pb-3">
            <h3 className="font-display font-bold text-sm text-cyan-300 uppercase flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>INCIDENTS BY POLLUTION CATEGORY</span>
            </h3>
            <span className="text-xs text-slate-500">{metrics.totalReports} Total</span>
          </div>

          <div className="space-y-3 pt-1">
            {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => {
              const count = metrics.categoryDistribution[catKey as IncidentCategory] || 0;
              const percent = metrics.totalReports > 0 ? Math.round((count / metrics.totalReports) * 100) : 0;

              return (
                <div key={catKey} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 truncate max-w-[240px]">{label}</span>
                    <span className="text-cyan-400 font-bold">{count} ({percent}%)</span>
                  </div>
                  <div className="w-full bg-black/60 h-2.5 rounded overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-700"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Severity & Workflow Status Breakdown */}
        <div className="cyber-panel p-5 rounded space-y-6">
          {/* Severity Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-cyan-900/60 pb-2">
              <h3 className="font-display font-bold text-sm text-cyan-300 uppercase flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-pink-500" />
                <span>SEVERITY SPECTRUM</span>
              </h3>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1 text-center">
              {[
                { label: 'Low', count: metrics.severityDistribution.Low, color: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-950/40' },
                { label: 'Medium', count: metrics.severityDistribution.Medium, color: 'text-cyan-400', border: 'border-cyan-500/40', bg: 'bg-cyan-950/40' },
                { label: 'High', count: metrics.severityDistribution.High, color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-950/40' },
                { label: 'Critical', count: metrics.severityDistribution.Critical, color: 'text-pink-400', border: 'border-pink-500/60', bg: 'bg-pink-950/40' },
              ].map((s) => (
                <div key={s.label} className={`p-2.5 rounded border ${s.border} ${s.bg}`}>
                  <div className={`font-display font-black text-xl ${s.color}`}>{s.count}</div>
                  <div className="text-[10px] text-slate-400 uppercase mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Workflow Status Distribution */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-cyan-900/60 pb-2">
              <h3 className="font-display font-bold text-sm text-cyan-300 uppercase flex items-center space-x-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>WORKFLOW PIPELINE PROGRESSION</span>
              </h3>
            </div>

            <div className="space-y-2 pt-1">
              {[
                'Submitted',
                'AI Verified',
                'Cleanup Assigned',
                'In Progress',
                'Resolved',
                'False Report',
              ].map((statusKey) => {
                const count = metrics.statusDistribution[statusKey as WorkflowStatus] || 0;
                const percent = metrics.totalReports > 0 ? Math.round((count / metrics.totalReports) * 100) : 0;

                return (
                  <div key={statusKey} className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 w-36 truncate">{statusKey}</span>
                    <div className="flex-1 mx-3 bg-black/60 h-2 rounded overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-cyan-400 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-white font-bold w-12 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Synchronized Incidents Table Under Active Filters */}
      <div className="cyber-panel rounded overflow-hidden">
        <div className="p-4 bg-black/60 border-b border-cyan-900/60 flex items-center justify-between">
          <div className="font-display font-bold text-sm text-cyan-300 uppercase">
            FILTERED INCIDENT RECORDS ({filtered.length})
          </div>
          <button
            onClick={handleExportCSV}
            className="text-xs text-cyan-400 hover:text-cyan-200 underline flex items-center space-x-1"
          >
            <span>Download CSV</span>
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs text-slate-300">
            <thead className="bg-black/80 text-cyan-400 uppercase text-[10px] border-b border-cyan-900">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Observed Date</th>
                <th className="px-4 py-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                    No incident records match the active query filters.
                  </td>
                </tr>
              ) : (
                filtered.map((inc) => (
                  <tr key={inc.id} className="hover:bg-cyan-950/20 transition-colors">
                    <td className="px-4 py-3 font-bold text-cyan-300">{inc.id}</td>
                    <td className="px-4 py-3 font-medium text-white max-w-xs truncate">{inc.title}</td>
                    <td className="px-4 py-3 text-slate-400">{CATEGORY_LABELS[inc.category] || inc.category}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-black/60 border border-slate-700 text-cyan-200">
                        {inc.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-cyan-400">{inc.workflowStatus}</td>
                    <td className="px-4 py-3 text-slate-400">{new Date(inc.observedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          playTacticalBlip(800, 0.04);
                          onNavigate(`/report/${inc.id}`);
                        }}
                        className="px-2.5 py-1 bg-cyan-950 border border-cyan-400 text-cyan-300 rounded font-bold text-[10px] hover:bg-cyan-900"
                      >
                        Details &gt;
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
