import { AIAssessment, IncidentCategory, IncidentSeverity } from '../types/incident';

export interface AnalysisInput {
  title: string;
  category: IncidentCategory;
  description: string;
  locationName: string;
  perceivedSeverity?: IncidentSeverity;
  wildlifeObservations?: string;
  imageBase64?: string;
  mimeType?: string;
}

export function generateRuleBasedAssessment(input: AnalysisInput, reasonText?: string): AIAssessment {
  const desc = (input.description || '').toLowerCase();
  const title = (input.title || '').toLowerCase();
  const wildlife = (input.wildlifeObservations || '').toLowerCase();
  const combined = `${title} ${desc} ${wildlife}`;

  let severity: IncidentSeverity = input.perceivedSeverity || 'Medium';
  let priority: 'Low' | 'Medium' | 'High' | 'Immediate' = 'Medium';
  let confidence = 82;
  const ecosystems: string[] = ['Intertidal Zone', 'Coastal Nearshore Water'];
  const precautions: string[] = ['Maintain a safe distance of at least 25 meters.'];
  const actions: string[] = ['Notify local municipal coastal coordinator.'];
  let impact = 'Potential localized contamination of shoreline substrate.';
  let suggestedAgency = 'Municipal Environmental Protection Dept';
  let explanation = 'Assessment generated using CoastalGuard deterministic rule-based heuristic matrix based on submitted citizen report tokens.';

  if (input.category === 'oil_spill' || combined.includes('oil') || combined.includes('fuel') || combined.includes('sheen')) {
    severity = 'High';
    priority = 'High';
    confidence = 88;
    ecosystems.push('Pelagic Surface Boundary', 'Rocky Reef Filter Feeders', 'Marine Bird Roosts');
    precautions.push(
      'HAZARDOUS MATERIAL WARNING: Do not approach, ignite, or inhale fumes.',
      'Keep upwind at least 50 meters away.',
      'Report directly to National Response Center / Coast Guard Marine Safety.'
    );
    actions.push(
      'Deploy absorbent containment booms at tidal inlet.',
      'Launch surface skimmer recovery vessel.',
      'Collect water samples for hydrocarbon fingerprinting.'
    );
    impact = 'Hydrocarbon slicks coat bird plumage, impair gas exchange, and introduce toxic polycyclic aromatic hydrocarbons into nearshore food webs.';
    suggestedAgency = 'U.S. Coast Guard Marine Safety / State Dept of Fish & Wildlife Spill Response';
    explanation = 'Detected hydrocarbon and surface sheen indicators. High mobility across tidal currents mandates urgent containment.';
  } else if (input.category === 'sewage_wastewater' || combined.includes('sewage') || combined.includes('odor') || combined.includes('culvert')) {
    severity = 'Critical';
    priority = 'Immediate';
    confidence = 90;
    ecosystems.push('Bathing Water Column', 'Bivalve Shellfish Beds', 'Estuarine Nursery Grounds');
    precautions.push(
      'BIOHAZARD WARNING: Untreated wastewater contains virulent pathogens (Enterococci, Salmonella, viruses).',
      'Do not touch, swim, or harvest shellfish in impacted area.',
      'Keep children and domestic animals away from water edge.'
    );
    actions.push(
      'Erect emergency advisory beach closure signage.',
      'Conduct upstream sewer collection network dye trace.',
      'Collect duplicate samples for coliform and Enterococci enumeration.'
    );
    impact = 'Severe bacteriological and pathogen spike posing human contact risks and eutrophication-driven dissolved oxygen depletion.';
    suggestedAgency = 'County Public Health Agency & Regional Water Quality Control Board';
    explanation = 'Turbid outfall and odor profile correlate with sanitary sewer overflow or infrastructure breach.';
  } else if (input.category === 'fishing_nets' || combined.includes('net') || combined.includes('entangle') || combined.includes('ghost')) {
    severity = 'High';
    priority = 'High';
    confidence = 89;
    ecosystems.push('Subtidal Kelp Forests', 'Benthic Reef Habitats', 'Marine Mammal Migration Corridor');
    precautions.push(
      'Do not dive or attempt manual gear removal without professional lift rigging.',
      'Mark surface GPS coordinates with floating buoy.',
      'Report tagged marine life immediately to stranding network.'
    );
    actions.push(
      'Deploy specialized scientific recovery dive team.',
      'Assess tension lines and remove trapped organisms safely.',
      'Catalog net mesh geometry in the Global Ghost Gear Initiative database.'
    );
    impact = 'Unattended monofilament netting causes perpetual ghost fishing mortality cycles across crustaceans, diving birds, and cetaceans.';
    suggestedAgency = 'Marine Sanctuary Protection Team & Fisheries Enforcement';
    explanation = 'Non-biodegradable synthetic net debris detected. Subsurface entanglements require certified recovery divers.';
  } else if (input.category === 'algal_bloom' || combined.includes('red tide') || combined.includes('green scum') || combined.includes('discoloration')) {
    severity = 'Medium';
    priority = 'Medium';
    confidence = 84;
    ecosystems.push('Coastal Surface Layer', 'Seafood Harvest Areas', 'Nearshore Benthos');
    precautions.push(
      'Avoid contact with surface scum or discolored foam.',
      'People with respiratory sensitivity should avoid aerosolized sea spray.',
      'Do not consume wild harvested shellfish from affected shoreline.'
    );
    actions.push(
      'Collect water samples for phytoplankton microscope cell counts.',
      'Review satellite chlorophyll-a optical imagery.',
      'Issue local seafood safety precautionary bulletin.'
    );
    impact = 'Potential production of marine biotoxins (domoic acid / brevetoxins) leading to anoxic bottom conditions and bioaccumulation.';
    suggestedAgency = 'State Marine Biotoxin Monitoring Section';
    explanation = 'Water discoloration and bloom characteristics flagged for biological surveillance and toxin assay.';
  } else if (input.category === 'distressed_wildlife' || combined.includes('turtle') || combined.includes('seal') || combined.includes('bird')) {
    severity = 'High';
    priority = 'High';
    confidence = 87;
    ecosystems.push('Marine Mammal Haulout Sites', 'Coastal Avian Foraging Zone');
    precautions.push(
      'DO NOT TOUCH, FEED, OR PUSH ANIMAL BACK INTO WATER.',
      'Maintain at least 100 yards distance from distressed pinnipeds or cetaceans.',
      'Keep dogs leashed and quiet.'
    );
    actions.push(
      'Dispatch authorized Marine Mammal Stranding Rescue Unit.',
      'Photograph from a distance showing body condition and injuries.',
      'Log GPS coordinates and tide direction.'
    );
    impact = 'Distressed marine wildlife often indicates acute toxic exposure, entanglement trauma, or vessel strike requiring specialized veterinary intervention.';
    suggestedAgency = 'Authorized Marine Wildlife Stranding Network & NOAA Fisheries Office';
    explanation = 'Wildlife distress flags detected. Urgent specialized veterinary assessment required.';
  } else {
    // Plastic and solid waste / generic
    if (combined.includes('bottle') || combined.includes('plastic') || combined.includes('microplastic')) {
      severity = 'Medium';
      priority = 'Medium';
      confidence = 85;
      ecosystems.push('Sandy Beach Driftline', 'Shorebird Nesting Perimeter');
      precautions.push(
        'Wear puncture-resistant gloves when handling beach litter.',
        'Beware of broken glass or sharp metal among plastics.',
        'Do not burn trash on coastal bluffs.'
      );
      actions.push(
        'Organize targeted clean-up sweep with micro-debris sifting screens.',
        'Catalog brand origins for single-use plastic producer accountability.',
        'Coordinate proper municipal waste haulage and sorting.'
      );
      impact = 'Ingestion hazard for surface-feeding seabirds, degradation into hazardous microplastics, and physical smothering of coastal vegetation.';
      suggestedAgency = 'Coastal Commission Clean Beach Initiative & Municipal Waste Division';
      explanation = 'Persistent synthetic polymers detected along tidal wash line. Rapid cleanup prevents fragmentation.';
    }
  }

  const limitations = reasonText
    ? `Fallback mode active: ${reasonText}. Visual verification was simulated through deterministic pattern recognition. Official chemical chromatography or field sample lab testing is required for legal and regulatory confirmation.`
    : 'Assessment is based solely on citizen-submitted text, imagery, and geographical metadata. Field inspection and certified laboratory assays are necessary for regulatory enforcement.';

  return {
    category: input.category,
    severity,
    confidence,
    environmentalImpact: impact,
    affectedEcosystems: ecosystems,
    immediatePrecautions: precautions,
    recommendedActions: actions,
    suggestedAgency,
    priority,
    explanation,
    limitations,
    modelUsed: 'CoastalGuard Heuristic Engine (Offline Fallback)',
    isFallback: true,
  };
}

export async function analyzeIncidentWithAI(input: AnalysisInput): Promise<AIAssessment> {
  try {
    const res = await fetch('/api/gemini/analyze-incident', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: input.title,
        category: input.category,
        description: input.description,
        locationName: input.locationName,
        perceivedSeverity: input.perceivedSeverity,
        wildlifeObservations: input.wildlifeObservations,
        imageBase64: input.imageBase64,
        mimeType: input.mimeType,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const reason = errData.error || `Server returned HTTP ${res.status}`;
      return generateRuleBasedAssessment(input, `AI server endpoint error (${reason})`);
    }

    const data = await res.json();
    if (data.isFallback || !data.assessment) {
      return generateRuleBasedAssessment(input, data.message || 'Server indicated fallback');
    }

    // Validate structure
    const ass = data.assessment;
    return {
      category: ass.category || input.category,
      severity: ass.severity || input.perceivedSeverity || 'Medium',
      confidence: typeof ass.confidence === 'number' ? ass.confidence : 90,
      environmentalImpact: ass.environmentalImpact || 'Impact assessment under review.',
      affectedEcosystems: Array.isArray(ass.affectedEcosystems) ? ass.affectedEcosystems : ['Coastal Ecosystem'],
      immediatePrecautions: Array.isArray(ass.immediatePrecautions) ? ass.immediatePrecautions : ['Maintain safe perimeter.'],
      recommendedActions: Array.isArray(ass.recommendedActions) ? ass.recommendedActions : ['Conduct on-site verification.'],
      suggestedAgency: ass.suggestedAgency || 'Regional Environmental Response Agency',
      priority: ass.priority || 'Medium',
      explanation: ass.explanation || 'Analyzed via Gemini multimodal model.',
      limitations: ass.limitations || 'Assessment is an AI estimate and not an official regulatory measurement.',
      modelUsed: data.modelUsed || 'gemini-3.8-flash',
      isFallback: false,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Network failure';
    return generateRuleBasedAssessment(input, `AI network connection unavailable (${errorMsg})`);
  }
}
