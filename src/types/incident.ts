/**
 * CoastalGuard AI - Incident Types and Domain Models
 */

export type IncidentCategory =
  | 'plastic_waste'
  | 'oil_spill'
  | 'sewage_wastewater'
  | 'fishing_nets'
  | 'algal_bloom'
  | 'distressed_wildlife'
  | 'other_environmental';

export type IncidentSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export type WorkflowStatus =
  | 'Submitted'
  | 'AI Verified'
  | 'Cleanup Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'False Report';

export type LocationPrecision = 'exact_gps' | 'coastal_zone' | 'manual_approximate';

export interface AIAssessment {
  category: IncidentCategory;
  severity: IncidentSeverity;
  confidence: number; // 0 - 100
  environmentalImpact: string;
  affectedEcosystems: string[];
  immediatePrecautions: string[];
  recommendedActions: string[];
  suggestedAgency: string;
  priority: 'Low' | 'Medium' | 'High' | 'Immediate';
  explanation: string;
  limitations: string;
  modelUsed: string;
  isFallback: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  previousStatus?: WorkflowStatus;
  newStatus: WorkflowStatus;
  actor: string;
  actorRole: 'Citizen' | 'AI System' | 'Admin' | 'Response Lead';
  note?: string;
}

export interface AssignedTeam {
  id: string;
  name: string;
  unitCode: string;
  contact?: string;
  assignedAt: string;
}

export interface Incident {
  id: string;
  title: string;
  category: IncidentCategory;
  description: string;
  severity: IncidentSeverity;
  confidence: number;
  locationName: string;
  latitude?: number;
  longitude?: number;
  locationPrecision: LocationPrecision;
  observedAt: string;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  submittedBy: {
    id: string;
    name: string;
    isAnonymous: boolean;
    email?: string;
  };
  workflowStatus: WorkflowStatus;
  assignedTeam?: AssignedTeam;
  aiAssessment: AIAssessment;
  activityHistory: ActivityLog[];
  resolutionSummary?: string;
  falseReportReason?: string;
  rewardEligibility: boolean;
  rewardAwarded: boolean;
  rewardPoints: number;
}

export interface DashboardMetrics {
  totalReports: number;
  openIncidents: number;
  highPriorityIncidents: number;
  inProgressIncidents: number;
  resolvedIncidents: number;
  falseReports: number;
  coastalZonesMonitored: number;
  averageResponseHours: number | null;
  categoryDistribution: Record<IncidentCategory, number>;
  severityDistribution: Record<IncidentSeverity, number>;
  statusDistribution: Record<WorkflowStatus, number>;
}

export interface UserRewardProfile {
  userId: string;
  displayName: string;
  totalPoints: number;
  reportsSubmitted: number;
  qualifyingReports: number;
  rankTitle: string;
  badges: Array<{
    id: string;
    name: string;
    icon: string;
    description: string;
    unlockedAt?: string;
  }>;
}

export const CATEGORY_LABELS: Record<IncidentCategory, string> = {
  plastic_waste: 'Plastic & Solid Waste',
  oil_spill: 'Oil or Chemical Spill',
  sewage_wastewater: 'Sewage or Wastewater Discharge',
  fishing_nets: 'Abandoned Fishing Gear & Marine Debris',
  algal_bloom: 'Algal Bloom / Water Discoloration',
  distressed_wildlife: 'Distressed / Dead Marine Wildlife',
  other_environmental: 'Other Coastal Threat',
};

export const SEVERITY_COLORS: Record<IncidentSeverity, { bg: string; text: string; border: string; glow: string }> = {
  Low: { bg: 'bg-emerald-950/80', text: 'text-emerald-400', border: 'border-emerald-500/50', glow: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]' },
  Medium: { bg: 'bg-cyan-950/80', text: 'text-cyan-400', border: 'border-cyan-500/50', glow: 'shadow-[0_0_10px_rgba(6,182,212,0.3)]' },
  High: { bg: 'bg-amber-950/80', text: 'text-amber-400', border: 'border-amber-500/50', glow: 'shadow-[0_0_10px_rgba(245,158,11,0.3)]' },
  Critical: { bg: 'bg-rose-950/80', text: 'text-rose-400', border: 'border-rose-500/60', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.4)]' },
};

export const STATUS_COLORS: Record<WorkflowStatus, { bg: string; text: string; border: string }> = {
  'Submitted': { bg: 'bg-slate-900', text: 'text-slate-300', border: 'border-slate-600' },
  'AI Verified': { bg: 'bg-cyan-950', text: 'text-cyan-300', border: 'border-cyan-500' },
  'Cleanup Assigned': { bg: 'bg-blue-950', text: 'text-blue-300', border: 'border-blue-500' },
  'In Progress': { bg: 'bg-amber-950', text: 'text-amber-300', border: 'border-amber-500' },
  'Resolved': { bg: 'bg-emerald-950', text: 'text-emerald-300', border: 'border-emerald-500' },
  'False Report': { bg: 'bg-rose-950', text: 'text-rose-300', border: 'border-rose-500' },
};
