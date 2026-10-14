import {
  Incident,
  IncidentCategory,
  IncidentSeverity,
  WorkflowStatus,
  DashboardMetrics,
  UserRewardProfile,
  CATEGORY_LABELS,
} from '../types/incident';
import { sanitizeCsvCell } from '../utils/sanitize';

const STORAGE_KEY = 'coastalguard_incidents_v2';
const REWARDS_KEY = 'coastalguard_rewards_v2';
const DEMO_RESET_KEY = 'coastalguard_demo_seeded_v2';

export const INITIAL_SAMPLE_INCIDENTS: Incident[] = [
  {
    id: 'CG-2026-7014',
    title: 'Dense Microplastic & Bottle Debris Accumulation',
    category: 'plastic_waste',
    description: 'Extensive line of broken plastic containers, PET bottles, synthetic ropes, and nurdle pellets accumulated along the high tide driftline stretching approximately 250 meters.',
    severity: 'Medium',
    confidence: 94,
    locationName: 'Pacific Shoreline - Dune Sector 4',
    latitude: 37.769,
    longitude: -122.511,
    locationPrecision: 'exact_gps',
    observedAt: '2026-10-13T14:30:00Z',
    createdAt: '2026-10-13T15:00:00Z',
    updatedAt: '2026-10-14T08:15:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&w=800&q=80',
    submittedBy: {
      id: 'USR-8821',
      name: 'Kai Vance',
      isAnonymous: false,
      email: 'kai.vance@oceanwatch.org',
    },
    workflowStatus: 'Cleanup Assigned',
    assignedTeam: {
      id: 'TEAM-04',
      name: 'Pacific Rapid Sweep Alpha',
      unitCode: 'PRS-A',
      contact: 'coord-alpha@coastalguard.local',
      assignedAt: '2026-10-14T08:15:00Z',
    },
    aiAssessment: {
      category: 'plastic_waste',
      severity: 'Medium',
      confidence: 94,
      environmentalImpact: 'High risk of microplastic ingestion by shorebirds (Western Snowy Plover habitat) and tidal crab populations.',
      affectedEcosystems: ['Tidal Dune Scrub', 'Intertidal Foraging Zone', 'Shorebird Nesting Perimeter'],
      immediatePrecautions: [
        'Do not burn or shred debris on site.',
        'Use heavy-duty puncture-resistant collection sacks.',
        'Document branded packaging for producer responsibility tracing.',
      ],
      recommendedActions: [
        'Deploy 8-person volunteer or cleanup team with sieving screens.',
        'Conduct micro-pellet density quadrat sampling.',
        'Segregate recyclable polymers from degraded foam.',
      ],
      suggestedAgency: 'Municipal Beach Management & Coastal Conservancy',
      priority: 'Medium',
      explanation: 'Visual markers match consumer single-use packaging and marine debris drift. High tidal turnover threatens dispersal into surf zone within 12 hours.',
      limitations: 'Surface survey only; subsurface sediment contamination depth cannot be estimated from imagery.',
      modelUsed: 'gemini-3.8-flash',
      isFallback: false,
    },
    activityHistory: [
      {
        id: 'LOG-001',
        timestamp: '2026-10-13T15:00:00Z',
        newStatus: 'Submitted',
        actor: 'Kai Vance',
        actorRole: 'Citizen',
        note: 'Report submitted via CoastalGuard Mobile HUD.',
      },
      {
        id: 'LOG-002',
        timestamp: '2026-10-13T15:02:14Z',
        previousStatus: 'Submitted',
        newStatus: 'AI Verified',
        actor: 'CoastalGuard Neural Telemetry (Gemini 3.8)',
        actorRole: 'AI System',
        note: 'Automated verification completed with 94% confidence rating.',
      },
      {
        id: 'LOG-003',
        timestamp: '2026-10-14T08:15:00Z',
        previousStatus: 'AI Verified',
        newStatus: 'Cleanup Assigned',
        actor: 'Admin Dispatcher C. Diaz',
        actorRole: 'Admin',
        note: 'Assigned to Pacific Rapid Sweep Alpha (TEAM-04). ETA on-site 11:00.',
      },
    ],
    rewardEligibility: true,
    rewardAwarded: true,
    rewardPoints: 10,
  },
  {
    id: 'CG-2026-7015',
    title: 'Iridescent Hydrocarbon Sheen Near Harbor Jetty',
    category: 'oil_spill',
    description: 'Pungent fuel odor and multi-colored iridescent surface slick observed drifting outward from the commercial fueling breakwater towards eelgrass beds.',
    severity: 'High',
    confidence: 89,
    locationName: 'North Breakwater Channel',
    latitude: 37.828,
    longitude: -122.368,
    locationPrecision: 'exact_gps',
    observedAt: '2026-10-14T06:45:00Z',
    createdAt: '2026-10-14T07:10:00Z',
    updatedAt: '2026-10-14T07:30:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    submittedBy: {
      id: 'USR-ANON',
      name: 'Anonymous Harbor Pilot',
      isAnonymous: true,
    },
    workflowStatus: 'In Progress',
    assignedTeam: {
      id: 'TEAM-01',
      name: 'HazMat Marine Containment Taskforce',
      unitCode: 'HMCT-9',
      contact: 'hazmat-dispatch@maritime-alert.gov',
      assignedAt: '2026-10-14T07:20:00Z',
    },
    aiAssessment: {
      category: 'oil_spill',
      severity: 'High',
      confidence: 89,
      environmentalImpact: 'Immediate toxic threat to eelgrass (Zostera marina) juvenile fish nurseries and waterbirds feathers leading to hypothermia.',
      affectedEcosystems: ['Subtidal Eelgrass Meadow', 'Pelagic Surface Boundary', 'Harbor Basin'],
      immediatePrecautions: [
        'DO NOT APPROACH OR IGNITE.',
        'Maintain a minimum 50-meter perimeter upwind.',
        'Keep recreational watercraft away from containment corridor.',
        'Report immediately to Coast Guard Marine Safety Office.',
      ],
      recommendedActions: [
        'Deploy sorbent booms across breakwater narrow constriction.',
        'Utilize skimmer skiff for hydrocarbon recovery.',
        'Collect water samples for chromatographic signature fingerprinting.',
      ],
      suggestedAgency: 'Coast Guard Marine Safety Office & State Fish and Wildlife Spill Prevention',
      priority: 'High',
      explanation: 'Characteristic rainbow sheen indicates diesel or light fuel oil film. Rapid tidal current could spread slick into protected estuary within 2 hours.',
      limitations: 'Exact volume and spill thickness cannot be quantified from visual observation alone.',
      modelUsed: 'gemini-3.8-flash',
      isFallback: false,
    },
    activityHistory: [
      {
        id: 'LOG-004',
        timestamp: '2026-10-14T07:10:00Z',
        newStatus: 'Submitted',
        actor: 'Anonymous Harbor Pilot',
        actorRole: 'Citizen',
        note: 'Submitted with location telemetry beacon.',
      },
      {
        id: 'LOG-005',
        timestamp: '2026-10-14T07:11:30Z',
        previousStatus: 'Submitted',
        newStatus: 'AI Verified',
        actor: 'CoastalGuard Neural Telemetry (Gemini 3.8)',
        actorRole: 'AI System',
        note: 'Critical sheen detection flags triggered. Automated spill protocols initiated.',
      },
      {
        id: 'LOG-006',
        timestamp: '2026-10-14T07:20:00Z',
        previousStatus: 'AI Verified',
        newStatus: 'Cleanup Assigned',
        actor: 'Admin Dispatcher C. Diaz',
        actorRole: 'Admin',
        note: 'Dispatched HazMat Marine Containment (HMCT-9) with sorbent boom payload.',
      },
      {
        id: 'LOG-007',
        timestamp: '2026-10-14T07:30:00Z',
        previousStatus: 'Cleanup Assigned',
        newStatus: 'In Progress',
        actor: 'Lead Tech M. Thorne (HMCT-9)',
        actorRole: 'Response Lead',
        note: 'Sorbent boom deployed across mouth. Skimmer skiff active on surface plume.',
      },
    ],
    rewardEligibility: true,
    rewardAwarded: true,
    rewardPoints: 10,
  },
  {
    id: 'CG-2026-7016',
    title: 'Turbid Gray Outfall Plume & Septic Odor',
    category: 'sewage_wastewater',
    description: 'Murky brownish-gray discharge issuing continuously from a stormwater culvert during dry weather with foam bubbling and strong sulfurous septic odor.',
    severity: 'Critical',
    confidence: 91,
    locationName: 'Seaside Promenade Culvert 12B',
    latitude: 37.742,
    longitude: -122.505,
    locationPrecision: 'exact_gps',
    observedAt: '2026-10-12T16:00:00Z',
    createdAt: '2026-10-12T16:25:00Z',
    updatedAt: '2026-10-13T19:40:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    submittedBy: {
      id: 'USR-4912',
      name: 'Dr. Elena Rostova',
      isAnonymous: false,
      email: 'e.rostova@marine-bio.edu',
    },
    workflowStatus: 'Resolved',
    assignedTeam: {
      id: 'TEAM-09',
      name: 'Municipal Wastewater Response Unit',
      unitCode: 'MWRU-3',
      contact: 'emergency@waterboard.gov',
      assignedAt: '2026-10-12T17:00:00Z',
    },
    aiAssessment: {
      category: 'sewage_wastewater',
      severity: 'Critical',
      confidence: 91,
      environmentalImpact: 'Severe pathogen and coliform contamination posing immediate biohazard to swimmers and filter-feeding shellfish.',
      affectedEcosystems: ['Recreational Bathing Waters', 'Intertidal Mussel Beds', 'Coastal Surf Zone'],
      immediatePrecautions: [
        'Post emergency beach closure signage.',
        'Do not touch or enter the surf within 500 meters of the discharge.',
        'Prohibit recreational shellfish harvesting immediately.',
      ],
      recommendedActions: [
        'Perform dye-testing up-gradient in sewer network to locate cross-connection or pipe rupture.',
        'Collect sterile duplicate samples for Enterococci and fecal coliform enumeration.',
        'Repair breached trunk line and flush impacted sediment.',
      ],
      suggestedAgency: 'Department of Public Health & Regional Water Quality Control Board',
      priority: 'Immediate',
      explanation: 'Discharge characteristics indicate untreated sanitary sewer bypass entering the municipal stormwater conveyance.',
      limitations: 'Bacterial counts require 24-hour incubator culture verification.',
      modelUsed: 'gemini-3.8-flash',
      isFallback: false,
    },
    activityHistory: [
      {
        id: 'LOG-008',
        timestamp: '2026-10-12T16:25:00Z',
        newStatus: 'Submitted',
        actor: 'Dr. Elena Rostova',
        actorRole: 'Citizen',
        note: 'Reported with high-priority sensor telemetry.',
      },
      {
        id: 'LOG-009',
        timestamp: '2026-10-12T16:27:00Z',
        previousStatus: 'Submitted',
        newStatus: 'AI Verified',
        actor: 'CoastalGuard Neural Telemetry (Gemini 3.8)',
        actorRole: 'AI System',
        note: 'Biohazard risk evaluated as Critical.',
      },
      {
        id: 'LOG-010',
        timestamp: '2026-10-12T17:00:00Z',
        previousStatus: 'AI Verified',
        newStatus: 'Cleanup Assigned',
        actor: 'Admin Dispatcher C. Diaz',
        actorRole: 'Admin',
        note: 'Notified County Public Health and Water Control Board.',
      },
      {
        id: 'LOG-011',
        timestamp: '2026-10-13T19:40:00Z',
        previousStatus: 'In Progress',
        newStatus: 'Resolved',
        actor: 'Chief Inspector T. Wong',
        actorRole: 'Admin',
        note: 'Damaged sanitary line isolated and relined. Surf bacteriological levels returned to safe baselines.',
      },
    ],
    resolutionSummary: 'Sanitary line collapse isolated at 4th Ave junction. Rerouted via bypass pump, permanent slip-lining installed. Water quality testing confirms Enterococci < 10 CFU/100mL.',
    rewardEligibility: true,
    rewardAwarded: true,
    rewardPoints: 10,
  },
  {
    id: 'CG-2026-7017',
    title: 'Submerged Monofilament Gillnet Snagged on Kelp Reef',
    category: 'fishing_nets',
    description: 'Ghost net approximately 30 meters long tangled across rocky reef ledges. Multiple crab species and rockfish trapped and decaying.',
    severity: 'High',
    confidence: 96,
    locationName: 'Punta Ballena Marine Reserve Edge',
    latitude: 37.812,
    longitude: -122.482,
    locationPrecision: 'coastal_zone',
    observedAt: '2026-10-11T11:15:00Z',
    createdAt: '2026-10-11T12:00:00Z',
    updatedAt: '2026-10-12T14:10:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    submittedBy: {
      id: 'USR-3199',
      name: 'Maya Lin (Reef Diver)',
      isAnonymous: false,
      email: 'diver.maya@kelpprotect.org',
    },
    workflowStatus: 'Cleanup Assigned',
    assignedTeam: {
      id: 'TEAM-06',
      name: 'Ghost Net Marine Extraction Dive Squad',
      unitCode: 'GND-Alpha',
      contact: 'diver-lead@oceanconservancy.org',
      assignedAt: '2026-10-12T14:10:00Z',
    },
    aiAssessment: {
      category: 'fishing_nets',
      severity: 'High',
      confidence: 96,
      environmentalImpact: 'Perpetual ghost fishing mortality cycle: trapped organisms act as bait, drawing additional predators into the entanglement mesh.',
      affectedEcosystems: ['Giant Kelp Canopy (Macrocystis pyrifera)', 'Rocky Subtidal Reef', 'Benthic Crustaceans'],
      immediatePrecautions: [
        'Untrained recreational divers should NOT attempt manual net cutting.',
        'High entanglement risk in kelp surge conditions.',
        'Mark GPS surface coordinates with temporary marker buoy.',
      ],
      recommendedActions: [
        'Dispatch certified scientific recovery dive team with lift bags and line cutters.',
        'Document net mesh dimensions and twine gauge for gear type identification.',
        'Weigh retrieved net at port and log into global ghost gear database.',
      ],
      suggestedAgency: 'Department of Fish & Wildlife Dive Unit & Marine Sanctuary Authority',
      priority: 'High',
      explanation: 'High-strength nylon monofilament net poses prolonged threat until physically extracted. Clear underwater documentation enables targeted recovery plan.',
      limitations: 'Bottom surge conditions may require dive window scheduling around slack tides.',
      modelUsed: 'gemini-3.8-flash',
      isFallback: false,
    },
    activityHistory: [
      {
        id: 'LOG-012',
        timestamp: '2026-10-11T12:00:00Z',
        newStatus: 'Submitted',
        actor: 'Maya Lin',
        actorRole: 'Citizen',
        note: 'Submitted with underwater photos and dive computer depth logs.',
      },
      {
        id: 'LOG-013',
        timestamp: '2026-10-11T12:02:40Z',
        previousStatus: 'Submitted',
        newStatus: 'AI Verified',
        actor: 'CoastalGuard Neural Telemetry (Gemini 3.8)',
        actorRole: 'AI System',
        note: 'Ghost gear signature identified; high mortality risk detected.',
      },
      {
        id: 'LOG-014',
        timestamp: '2026-10-12T14:10:00Z',
        previousStatus: 'AI Verified',
        newStatus: 'Cleanup Assigned',
        actor: 'Admin Dispatcher C. Diaz',
        actorRole: 'Admin',
        note: 'Assigned to Ghost Net Marine Extraction Dive Squad (TEAM-06). Dive planned for next slack tide.',
      },
    ],
    rewardEligibility: true,
    rewardAwarded: true,
    rewardPoints: 10,
  },
  {
    id: 'CG-2026-7018',
    title: 'Dense Red Tide Bloom with Pungent Aerosolization',
    category: 'algal_bloom',
    description: 'Extensive rust-red to dark crimson surface bloom covering the entire cove. Beachgoers reporting coughing and mild respiratory irritation from sea spray.',
    severity: 'Medium',
    confidence: 88,
    locationName: 'Crescent Cove & Cliff Bluffs',
    latitude: 37.795,
    longitude: -122.518,
    locationPrecision: 'exact_gps',
    observedAt: '2026-10-10T09:30:00Z',
    createdAt: '2026-10-10T10:15:00Z',
    updatedAt: '2026-10-10T12:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    submittedBy: {
      id: 'USR-8821',
      name: 'Kai Vance',
      isAnonymous: false,
    },
    workflowStatus: 'In Progress',
    assignedTeam: {
      id: 'TEAM-03',
      name: 'Phytoplankton Bio-Surveillance Team',
      unitCode: 'PBST-2',
      contact: 'biotoxins@noaa-affiliate.gov',
      assignedAt: '2026-10-10T11:00:00Z',
    },
    aiAssessment: {
      category: 'algal_bloom',
      severity: 'Medium',
      confidence: 88,
      environmentalImpact: 'Potential production of brevetoxins or domoic acid causing neurotoxic shellfish poisoning (NSP/ASP) and marine mammal mortality.',
      affectedEcosystems: ['Cove Water Column', 'Coastal Air Quality', 'Bivalve Filter Feeders'],
      immediatePrecautions: [
        'Individuals with asthma or respiratory conditions should vacate coastal bluffs.',
        'Do not harvest wild mussels, clams, or oysters.',
        'Keep pets away from foam and stranded water lines.',
      ],
      recommendedActions: [
        'Collect microscope water samples for dinoflagellate species taxonomy (Alexandrium vs Karenia).',
        'Initiate satellite ocean color spectroradiometry tracking.',
        'Issue advisory to local seafood markets and coastal trailheads.',
      ],
      suggestedAgency: 'State Department of Public Health Biotoxin Monitoring Program',
      priority: 'Medium',
      explanation: 'Visual pattern consistent with harmful algal bloom (HAB). Aerosol irritation indicates chemical toxin aerosolization in breaking waves.',
      limitations: 'Species identification requires microscope cell count and HPLC toxin assay.',
      modelUsed: 'gemini-3.8-flash',
      isFallback: false,
    },
    activityHistory: [
      {
        id: 'LOG-015',
        timestamp: '2026-10-10T10:15:00Z',
        newStatus: 'Submitted',
        actor: 'Kai Vance',
        actorRole: 'Citizen',
        note: 'Reported with symptom notes regarding aerosol irritation.',
      },
      {
        id: 'LOG-016',
        timestamp: '2026-10-10T10:16:45Z',
        previousStatus: 'Submitted',
        newStatus: 'AI Verified',
        actor: 'CoastalGuard Neural Telemetry (Gemini 3.8)',
        actorRole: 'AI System',
        note: 'HAB classification confirmed via spectral color signature analysis.',
      },
      {
        id: 'LOG-017',
        timestamp: '2026-10-10T11:00:00Z',
        previousStatus: 'AI Verified',
        newStatus: 'Cleanup Assigned',
        actor: 'Admin Dispatcher C. Diaz',
        actorRole: 'Admin',
        note: 'Routed to Phytoplankton Bio-Surveillance Team for toxin assay sampling.',
      },
      {
        id: 'LOG-018',
        timestamp: '2026-10-10T12:00:00Z',
        previousStatus: 'Cleanup Assigned',
        newStatus: 'In Progress',
        actor: 'Dr. S. Chen (PBST-2)',
        actorRole: 'Response Lead',
        note: 'Surface transect samples collected. Warning advisory posted at cove entrance.',
      },
    ],
    rewardEligibility: true,
    rewardAwarded: true,
    rewardPoints: 10,
  },
];

export const INITIAL_REWARD_PROFILE: UserRewardProfile = {
  userId: 'USR-CURRENT',
  displayName: 'Coast Guardian Cadet',
  totalPoints: 20,
  reportsSubmitted: 2,
  qualifyingReports: 2,
  rankTitle: 'Coastal Sentinel Tier II',
  badges: [
    {
      id: 'FIRST_DISCOVERY',
      name: 'First Sentry',
      icon: 'ShieldCheck',
      description: 'Submitted first verified coastal pollution intelligence report.',
      unlockedAt: '2026-10-10T10:15:00Z',
    },
    {
      id: 'ACCURATE_TELEMETRY',
      name: 'Precision Beacon',
      icon: 'Crosshair',
      description: 'Provided exact GPS coordinate telemetry with photo evidence.',
      unlockedAt: '2026-10-13T15:00:00Z',
    },
    {
      id: 'RAPID_ALERT',
      name: 'Hazard Interceptor',
      icon: 'AlertTriangle',
      description: 'Reported a High or Critical severity incident enabling rapid containment.',
    },
    {
      id: 'VETERAN_GUARDIAN',
      name: 'Ocean Vanguard',
      icon: 'Award',
      description: 'Accumulate 100 Coast Guardian points across verified environmental actions.',
    },
  ],
};

class IncidentStorageService {
  private inMemoryIncidents: Incident[] = [...INITIAL_SAMPLE_INCIDENTS];
  private inMemoryRewards: UserRewardProfile = { ...INITIAL_REWARD_PROFILE };
  private listeners: Array<() => void> = [];

  constructor() {
    this.ensureInitialized();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY || e.key === REWARDS_KEY) {
          this.notify();
        }
      });
    }
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify(): void {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Storage notify error', err);
      }
    });
  }

  private ensureInitialized(): void {
    if (typeof window === 'undefined') return;
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      const isSeeded = localStorage.getItem(DEMO_RESET_KEY);
      if (!existing || !isSeeded) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_INCIDENTS));
        localStorage.setItem(DEMO_RESET_KEY, 'true');
      }
      const existingRewards = localStorage.getItem(REWARDS_KEY);
      if (!existingRewards) {
        localStorage.setItem(REWARDS_KEY, JSON.stringify(INITIAL_REWARD_PROFILE));
      }
    } catch (e) {
      console.warn('LocalStorage unavailable or restricted', e);
    }
  }

  public getAll(): Incident[] {
    if (typeof window === 'undefined') {
      return [...this.inMemoryIncidents];
    }
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [...this.inMemoryIncidents];
      const parsed: Incident[] = JSON.parse(data);
      return parsed;
    } catch (err) {
      console.error('Failed reading incidents from storage', err);
      return [...this.inMemoryIncidents];
    }
  }

  public getById(id: string): Incident | null {
    const list = this.getAll();
    return list.find((inc) => inc.id.toUpperCase() === id.toUpperCase()) || null;
  }

  public create(incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt' | 'activityHistory' | 'rewardEligibility' | 'rewardAwarded' | 'rewardPoints'> & Partial<Incident>): Incident {
    const now = new Date().toISOString();
    const id = incident.id || this.generateIncidentId();
    
    // Reward rule: Valid category, non-empty description, valid severity gets points
    const rewardEligibility = incident.category !== 'other_environmental' || (incident.description && incident.description.length >= 20);
    
    const newIncident: Incident = {
      ...incident,
      id,
      createdAt: incident.createdAt || now,
      updatedAt: now,
      rewardEligibility: Boolean(rewardEligibility),
      rewardAwarded: Boolean(rewardEligibility),
      rewardPoints: rewardEligibility ? 10 : 0,
      activityHistory: incident.activityHistory || [
        {
          id: `LOG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          timestamp: now,
          newStatus: incident.workflowStatus || 'Submitted',
          actor: incident.submittedBy?.name || 'Citizen Sentry',
          actorRole: incident.submittedBy?.isAnonymous ? 'Citizen' : 'Citizen',
          note: 'Initial incident report submitted through CoastalGuard web telemetry.',
        },
      ],
    };

    const current = this.getAll();
    const updated = [newIncident, ...current];
    this.save(updated);

    // If eligible, award reward points to current profile
    if (rewardEligibility) {
      this.incrementUserPoints(10);
    }

    return newIncident;
  }

  public updateStatus(
    id: string,
    newStatus: WorkflowStatus,
    actor: string,
    actorRole: 'Admin' | 'Response Lead' | 'AI System' = 'Admin',
    note?: string,
    extra?: { resolutionSummary?: string; falseReportReason?: string }
  ): Incident | null {
    const list = this.getAll();
    const index = list.findIndex((i) => i.id === id);
    if (index === -1) return null;

    const current = list[index];
    const prevStatus = current.workflowStatus;
    const now = new Date().toISOString();

    const log: Incident['activityHistory'][0] = {
      id: `LOG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      timestamp: now,
      previousStatus: prevStatus,
      newStatus,
      actor,
      actorRole,
      note: note || `Status transitioned from ${prevStatus} to ${newStatus}.`,
    };

    // If marked as False Report, revoke reward eligibility and subtract points if they were awarded
    let rewardAwarded = current.rewardAwarded;
    let rewardEligibility = current.rewardEligibility;
    let rewardPoints = current.rewardPoints;

    if (newStatus === 'False Report' && current.rewardAwarded) {
      rewardAwarded = false;
      rewardEligibility = false;
      rewardPoints = 0;
      this.decrementUserPoints(10);
    }

    const updatedItem: Incident = {
      ...current,
      workflowStatus: newStatus,
      updatedAt: now,
      activityHistory: [...current.activityHistory, log],
      resolutionSummary: extra?.resolutionSummary !== undefined ? extra.resolutionSummary : current.resolutionSummary,
      falseReportReason: extra?.falseReportReason !== undefined ? extra.falseReportReason : current.falseReportReason,
      rewardAwarded,
      rewardEligibility,
      rewardPoints,
    };

    list[index] = updatedItem;
    this.save(list);
    return updatedItem;
  }

  public assignTeam(
    id: string,
    teamName: string,
    unitCode: string,
    actor: string = 'Admin Dispatcher'
  ): Incident | null {
    const list = this.getAll();
    const index = list.findIndex((i) => i.id === id);
    if (index === -1) return null;

    const current = list[index];
    const now = new Date().toISOString();

    const assignedTeam = {
      id: `TEAM-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      name: teamName,
      unitCode,
      assignedAt: now,
    };

    const log: Incident['activityHistory'][0] = {
      id: `LOG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      timestamp: now,
      previousStatus: current.workflowStatus,
      newStatus: 'Cleanup Assigned' as WorkflowStatus,
      actor,
      actorRole: 'Admin' as const,
      note: `Assigned response unit ${unitCode} (${teamName}). Dispatch record logged.`,
    };

    const updatedItem: Incident = {
      ...current,
      workflowStatus: 'Cleanup Assigned',
      assignedTeam,
      updatedAt: now,
      activityHistory: [...current.activityHistory, log],
    };

    list[index] = updatedItem;
    this.save(list);
    return updatedItem;
  }

  public resetDemoData(): void {
    this.inMemoryIncidents = [...INITIAL_SAMPLE_INCIDENTS];
    this.inMemoryRewards = { ...INITIAL_REWARD_PROFILE };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_INCIDENTS));
        localStorage.setItem(REWARDS_KEY, JSON.stringify(INITIAL_REWARD_PROFILE));
        localStorage.setItem(DEMO_RESET_KEY, 'true');
      } catch (e) {
        console.error('Failed to reset demo data', e);
      }
    }
    this.notify();
  }

  public getUserRewards(): UserRewardProfile {
    if (typeof window === 'undefined') return { ...this.inMemoryRewards };
    try {
      const data = localStorage.getItem(REWARDS_KEY);
      if (!data) return { ...this.inMemoryRewards };
      return JSON.parse(data);
    } catch (e) {
      return { ...this.inMemoryRewards };
    }
  }

  public incrementUserPoints(points: number): void {
    const profile = this.getUserRewards();
    profile.totalPoints += points;
    profile.reportsSubmitted += 1;
    profile.qualifyingReports += 1;
    
    // Update Rank Title based on points
    if (profile.totalPoints >= 100) {
      profile.rankTitle = 'Coastal Vanguard Commander';
    } else if (profile.totalPoints >= 50) {
      profile.rankTitle = 'Coastal Sentinel Tier III';
    } else if (profile.totalPoints >= 20) {
      profile.rankTitle = 'Coastal Sentinel Tier II';
    }

    this.inMemoryRewards = profile;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(REWARDS_KEY, JSON.stringify(profile));
      } catch (e) {
        console.error('Failed updating rewards', e);
      }
    }
    this.notify();
  }

  public decrementUserPoints(points: number): void {
    const profile = this.getUserRewards();
    profile.totalPoints = Math.max(0, profile.totalPoints - points);
    profile.qualifyingReports = Math.max(0, profile.qualifyingReports - 1);
    this.inMemoryRewards = profile;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(REWARDS_KEY, JSON.stringify(profile));
      } catch (e) {
        console.error('Failed decrementing rewards', e);
      }
    }
    this.notify();
  }

  public generateIncidentId(): string {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `CG-${year}-${rand}`;
  }

  private save(list: Incident[]): void {
    this.inMemoryIncidents = list;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      } catch (err: unknown) {
        console.warn('[CoastalGuard Storage] Initial localStorage write exceeded quota. Engaging adaptive prune strategy.', err);
        try {
          // Adaptive Strategy 1: Strip large base64 image strings from older historical incidents
          const pruned = list.map((inc, index) => {
            // Keep recent incident images (first 2), replace older base64 thumbnails with placeholder marker
            if (index > 1 && inc.imageUrl && inc.imageUrl.startsWith('data:image')) {
              return { ...inc, imageUrl: undefined };
            }
            return inc;
          });
          localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
        } catch {
          try {
            // Adaptive Strategy 2: If still overflowing, retain the latest 25 essential telemetry records
            const compact = list.slice(0, 25).map((inc) => ({
              ...inc,
              imageUrl: inc.imageUrl?.startsWith('data:image') ? undefined : inc.imageUrl,
            }));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(compact));
          } catch (criticalErr) {
            console.error('[CoastalGuard Storage] LocalStorage completely full. In-memory telemetry remains active.', criticalErr);
          }
        }
      }
    }
    this.notify();
  }

  public calculateMetrics(incidents: Incident[]): DashboardMetrics {
    const totalReports = incidents.length;
    const openIncidents = incidents.filter(
      (i) => i.workflowStatus !== 'Resolved' && i.workflowStatus !== 'False Report'
    ).length;
    const highPriorityIncidents = incidents.filter(
      (i) => i.severity === 'High' || i.severity === 'Critical'
    ).length;
    const inProgressIncidents = incidents.filter(
      (i) => i.workflowStatus === 'In Progress' || i.workflowStatus === 'Cleanup Assigned'
    ).length;
    const resolvedIncidents = incidents.filter((i) => i.workflowStatus === 'Resolved').length;
    const falseReports = incidents.filter((i) => i.workflowStatus === 'False Report').length;

    // Coastal zones monitored: unique locationNames
    const zones = new Set(incidents.map((i) => i.locationName.trim().toLowerCase()));
    const coastalZonesMonitored = zones.size;

    // Average response time calculation for resolved incidents
    let totalResponseHours = 0;
    let resolvedCountWithTiming = 0;

    incidents.forEach((inc) => {
      if (inc.workflowStatus === 'Resolved' && inc.createdAt) {
        const resolvedLog = inc.activityHistory.find((l) => l.newStatus === 'Resolved');
        if (resolvedLog) {
          const diffMs = new Date(resolvedLog.timestamp).getTime() - new Date(inc.createdAt).getTime();
          if (diffMs > 0) {
            totalResponseHours += diffMs / (1000 * 60 * 60);
            resolvedCountWithTiming++;
          }
        }
      }
    });

    const averageResponseHours =
      resolvedCountWithTiming > 0 ? Math.round((totalResponseHours / resolvedCountWithTiming) * 10) / 10 : null;

    const categoryDistribution: Record<IncidentCategory, number> = {
      plastic_waste: 0,
      oil_spill: 0,
      sewage_wastewater: 0,
      fishing_nets: 0,
      algal_bloom: 0,
      distressed_wildlife: 0,
      other_environmental: 0,
    };

    const severityDistribution: Record<IncidentSeverity, number> = {
      Low: 0,
      Medium: 0,
      High: 0,
      Critical: 0,
    };

    const statusDistribution: Record<WorkflowStatus, number> = {
      'Submitted': 0,
      'AI Verified': 0,
      'Cleanup Assigned': 0,
      'In Progress': 0,
      'Resolved': 0,
      'False Report': 0,
    };

    incidents.forEach((inc) => {
      if (categoryDistribution[inc.category] !== undefined) {
        categoryDistribution[inc.category]++;
      } else {
        categoryDistribution['other_environmental']++;
      }

      if (severityDistribution[inc.severity] !== undefined) {
        severityDistribution[inc.severity]++;
      }

      if (statusDistribution[inc.workflowStatus] !== undefined) {
        statusDistribution[inc.workflowStatus]++;
      }
    });

    return {
      totalReports,
      openIncidents,
      highPriorityIncidents,
      inProgressIncidents,
      resolvedIncidents,
      falseReports,
      coastalZonesMonitored,
      averageResponseHours,
      categoryDistribution,
      severityDistribution,
      statusDistribution,
    };
  }

  public exportCSV(incidents: Incident[]): string {
    const rawHeaders = [
      'Incident ID',
      'Title',
      'Category',
      'Severity',
      'Workflow Status',
      'Confidence %',
      'Location Name',
      'Latitude',
      'Longitude',
      'Location Precision',
      'Observed At',
      'Created At',
      'Reporter',
      'Assigned Team',
      'AI Suggested Agency',
      'Reward Points',
    ];

    const headers = rawHeaders.map((h) => sanitizeCsvCell(h)).join(',');

    const rows = incidents.map((inc) => [
      sanitizeCsvCell(inc.id),
      sanitizeCsvCell(inc.title),
      sanitizeCsvCell(CATEGORY_LABELS[inc.category] || inc.category),
      sanitizeCsvCell(inc.severity),
      sanitizeCsvCell(inc.workflowStatus),
      sanitizeCsvCell(inc.confidence),
      sanitizeCsvCell(inc.locationName),
      sanitizeCsvCell(inc.latitude ?? ''),
      sanitizeCsvCell(inc.longitude ?? ''),
      sanitizeCsvCell(inc.locationPrecision),
      sanitizeCsvCell(inc.observedAt),
      sanitizeCsvCell(inc.createdAt),
      sanitizeCsvCell(inc.submittedBy.isAnonymous ? 'Anonymous Citizen' : inc.submittedBy.name),
      sanitizeCsvCell(inc.assignedTeam ? inc.assignedTeam.name : 'Unassigned'),
      sanitizeCsvCell(inc.aiAssessment?.suggestedAgency || ''),
      sanitizeCsvCell(inc.rewardPoints),
    ]);

    return [headers, ...rows.map((r) => r.join(','))].join('\n');
  }
}

export const incidentService = new IncidentStorageService();
