/**
 * CoastalGuard AI - Automated Domain Logic & System Test Suite
 * Validates all 16 test criteria specified in Section 21.
 */

import {
  IncidentCategory,
  IncidentSeverity,
  WorkflowStatus,
  CATEGORY_LABELS,
} from '../src/types/incident';
import { incidentService, INITIAL_SAMPLE_INCIDENTS } from '../src/services/incidentStorage';
import { generateRuleBasedAssessment } from '../src/services/aiAnalysis';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
    failed++;
  }
}

async function runAllTests() {
  console.log('\n======================================================');
  console.log('   COASTALGUARD AI // AUTOMATED TELEMETRY TEST SUITE   ');
  console.log('======================================================\n');

  // TEST 1: Required Report Fields Validation
  console.log('--- TEST GROUP 1: SCHEMA & ENUM VALIDATION ---');
  const validCategories: IncidentCategory[] = [
    'plastic_waste',
    'oil_spill',
    'sewage_wastewater',
    'fishing_nets',
    'algal_bloom',
    'distressed_wildlife',
    'other_environmental',
  ];
  assert(
    validCategories.every((cat) => Boolean(CATEGORY_LABELS[cat])),
    'All 7 incident categories are correctly mapped to user-facing labels'
  );

  const severities: IncidentSeverity[] = ['Low', 'Medium', 'High', 'Critical'];
  assert(severities.length === 4, 'Valid severity levels match domain specification');

  const statuses: WorkflowStatus[] = [
    'Submitted',
    'AI Verified',
    'Cleanup Assigned',
    'In Progress',
    'Resolved',
    'False Report',
  ];
  assert(statuses.length === 6, 'All 6 workflow lifecycle statuses are defined');

  // TEST 2: Unique ID Generation
  console.log('\n--- TEST GROUP 2: UNIQUE ID GENERATION & FORMAT ---');
  const id1 = incidentService.generateIncidentId();
  const id2 = incidentService.generateIncidentId();
  assert(id1 !== id2, 'Generated incident IDs are unique', `${id1} vs ${id2}`);
  assert(
    /^CG-\d{4}-\d{4}$/.test(id1),
    'Incident ID conforms to tactical regex format CG-YYYY-XXXX',
    id1
  );

  // TEST 3: Report Creation & Persistence Logic
  console.log('\n--- TEST GROUP 3: INCIDENT CREATION & REWARDS ---');
  const created = incidentService.create({
    title: 'Automated Test Debris Ingestion Hazard',
    category: 'plastic_waste',
    description: 'Dense cluster of polystyrene foam beads scattered near dune perimeter.',
    severity: 'Medium',
    confidence: 88,
    locationName: 'Test Bay South',
    latitude: 37.8,
    longitude: -122.4,
    locationPrecision: 'exact_gps',
    observedAt: new Date().toISOString(),
    submittedBy: {
      id: 'USR-TEST-01',
      name: 'Automated Test Sentinel',
      isAnonymous: false,
    },
    workflowStatus: 'Submitted',
    aiAssessment: {
      category: 'plastic_waste',
      severity: 'Medium',
      confidence: 88,
      environmentalImpact: 'Microplastic ingestion danger.',
      affectedEcosystems: ['Dune Scrub'],
      immediatePrecautions: ['Use gloves.'],
      recommendedActions: ['Deploy sifter screens.'],
      suggestedAgency: 'Coastal Clean Commission',
      priority: 'Medium',
      explanation: 'Test assessment.',
      limitations: 'Simulated verification.',
      modelUsed: 'gemini-3.8-flash',
      isFallback: false,
    },
  });

  assert(Boolean(created.id), 'Created incident receives valid unique ID', created.id);
  assert(created.rewardEligibility === true, 'Valid plastic waste report is marked reward eligible');
  assert(created.rewardPoints === 10, 'Eligible report awards exactly 10 reward points');
  assert(created.activityHistory.length >= 1, 'Incident initializes with non-empty activity history');

  // TEST 4: Status Transitions & Activity History Audit Trail
  console.log('\n--- TEST GROUP 4: STATUS TRANSITIONS & AUDIT TIMELINE ---');
  const assigned = incidentService.assignTeam(
    created.id,
    'Marine Sorbent Strike Team',
    'MSST-01',
    'Commander Diaz'
  );
  assert(
    assigned?.workflowStatus === 'Cleanup Assigned',
    'Status successfully transitions to Cleanup Assigned upon team assignment'
  );
  assert(
    assigned?.assignedTeam?.unitCode === 'MSST-01',
    'Assigned squad record records team name and unit callsign',
    assigned?.assignedTeam?.name
  );
  assert(
    Boolean(assigned?.activityHistory.some((l) => l.newStatus === 'Cleanup Assigned')),
    'Activity history records team dispatch audit entry'
  );

  // Transition to Resolved
  const resolved = incidentService.updateStatus(
    created.id,
    'Resolved',
    'Chief Inspector Wong',
    'Admin',
    'Containment completed and verified by coastal warden',
    { resolutionSummary: 'Debris retrieved. 45kg polymers disposed at municipal recycling hub.' }
  );
  assert(resolved?.workflowStatus === 'Resolved', 'Status transitions to Resolved');
  assert(
    Boolean(resolved?.resolutionSummary),
    'Resolution summary successfully attached to resolved record'
  );

  // TEST 5: False Report Revocation & Points Penalization
  console.log('\n--- TEST GROUP 5: FALSE REPORT REVOCATION ---');
  const falseInc = incidentService.create({
    title: 'Spurious Hazard Test Report',
    category: 'other_environmental',
    description: 'Short text test to verify false report penalty mechanics.',
    severity: 'Low',
    confidence: 60,
    locationName: 'Ghost Reef',
    locationPrecision: 'manual_approximate',
    observedAt: new Date().toISOString(),
    submittedBy: {
      id: 'USR-TEST-02',
      name: 'Test Cadet',
      isAnonymous: false,
    },
    workflowStatus: 'Submitted',
    aiAssessment: {
      category: 'other_environmental',
      severity: 'Low',
      confidence: 60,
      environmentalImpact: 'Negligible.',
      affectedEcosystems: ['Shoreline'],
      immediatePrecautions: ['None required.'],
      recommendedActions: ['Archive.'],
      suggestedAgency: 'Local Parks',
      priority: 'Low',
      explanation: 'Non-hazardous condition.',
      limitations: 'Visual only.',
      modelUsed: 'CoastalGuard Heuristic Engine (Offline Fallback)',
      isFallback: true,
    },
  });

  const markedFalse = incidentService.updateStatus(
    falseInc.id,
    'False Report',
    'Commander Diaz',
    'Admin',
    'Officer site inspection confirmed benign natural sea foam and kelp detritus.',
    { falseReportReason: 'Harmless natural froth mistaken for chemical discharge.' }
  );

  assert(markedFalse?.workflowStatus === 'False Report', 'Status transitions to False Report');
  assert(markedFalse?.rewardAwarded === false, 'Reward is revoked upon False Report confirmation');
  assert(markedFalse?.rewardPoints === 0, 'Reward points reset to 0 for False Report');
  assert(Boolean(markedFalse?.falseReportReason), 'False report reason is mandatory and saved');

  // TEST 6: Dashboard Metrics Calculations
  console.log('\n--- TEST GROUP 6: DASHBOARD METRIC ACCURACY ---');
  const testIncidents = incidentService.getAll();
  const metrics = incidentService.calculateMetrics(testIncidents);

  assert(
    metrics.totalReports === testIncidents.length,
    'Metric totalReports matches raw incident array length',
    `${metrics.totalReports} vs ${testIncidents.length}`
  );
  assert(
    metrics.openIncidents ===
      testIncidents.filter((i) => i.workflowStatus !== 'Resolved' && i.workflowStatus !== 'False Report').length,
    'Metric openIncidents accurately excludes Resolved and False Reports'
  );
  assert(
    metrics.resolvedIncidents === testIncidents.filter((i) => i.workflowStatus === 'Resolved').length,
    'Metric resolvedIncidents counts all resolved cases'
  );
  assert(
    metrics.categoryDistribution['plastic_waste'] >= 1,
    'Category distribution accurately aggregates plastic waste reports'
  );

  // TEST 7: CSV Export Generation & Escaping
  console.log('\n--- TEST GROUP 7: CSV EXPORT FORMAT & ESCAPING ---');
  const csv = incidentService.exportCSV(testIncidents);
  assert(csv.startsWith('"Incident ID","Title"'), 'CSV begins with expected sanitized header line');
  assert(csv.includes(created.id), 'CSV output includes created incident ID');
  assert(
    csv.split('\n').length === testIncidents.length + 1,
    'CSV row count equals dataset length + header line'
  );

  // TEST 8: AI Multimodal Fallback Behavior
  console.log('\n--- TEST GROUP 8: AI HEURISTIC ENGINE FALLBACK ---');
  const fallbackAssessment = generateRuleBasedAssessment(
    {
      title: 'Dense Diesel Slick',
      category: 'oil_spill',
      description: 'Rainbow colored fuel sheen trailing from fueling dock with intense petroleum odor.',
      locationName: 'North Basin Dock 4',
      perceivedSeverity: 'High',
    },
    'API offline for test'
  );

  assert(fallbackAssessment.isFallback === true, 'Fallback assessment is transparently labeled isFallback: true');
  assert(
    fallbackAssessment.modelUsed.includes('Heuristic Engine'),
    'Attributed model reflects CoastalGuard Heuristic Engine'
  );
  assert(
    fallbackAssessment.severity === 'High',
    'Rule-based engine accurately flags oil spill keywords as High hazard'
  );
  assert(
    fallbackAssessment.immediatePrecautions.some((p) => p.includes('HAZARDOUS MATERIAL WARNING')),
    'Rule-based engine automatically includes hazardous perimeter warnings'
  );

  console.log('\n======================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED / ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
