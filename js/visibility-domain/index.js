/**
 * LOCATRIA Visibility Operating System v1.0
 * Domain Layer — Diagnosis & Opportunity Foundation (M08.2 / BUILD-03)
 *
 * Core Epistemic Chain:
 *   Observation → Evidence → Diagnosis → Opportunity
 *
 * Strict Architectural Separation:
 *   Observation ≠ Evidence ≠ Diagnosis ≠ Opportunity ≠ Priority ≠ Action ≠ Founder Decision
 *
 * Invariants & Governance Rules:
 * - D01: Diagnosis entity conforms to schema (DIAG-<domain>-<seq>).
 * - D02: Diagnosis ID is NOT derived from observation ID.
 * - D03: Diagnosis must link to >= 1 observation, >= 1 evidence, >= 1 metric, >= 1 environment, >= 1 run.
 * - D04: Confidence state describes evidence sufficiency (HIGH/MEDIUM/LOW/UNVERIFIED), NEVER priority.
 * - D05: Uncertainty statement required when confidence is LOW or UNVERIFIED.
 * - D06: Diagnosis status lifecycle: DETECTED → UNDER_REVIEW → VALIDATED | NEED_MORE_EVIDENCE | REJECTED.
 * - D07: AI authority restriction: AI_ADVISOR cannot validate diagnoses. Validation requires FOUNDER / human authority.
 * - D08: Immutability: Validated diagnoses are immutable. Revisions require version increment or new record.
 * - D09: Zero composite visibility score or priority fields permitted in diagnosis.
 * - D10: Opportunity entity conforms to schema (OPP-<domain>-<seq>).
 * - D11: Opportunity must link to >= 1 diagnosis. All referenced diagnoses must exist.
 * - D12: Diagnosis → Opportunity Gate: Opportunity CANNOT be QUALIFIED unless ALL referenced diagnoses are VALIDATED.
 * - D13: Opportunity status lifecycle: DETECTED → DRAFTED → QUALIFYING → QUALIFIED | REJECTED.
 * - D14: AI authority restriction: AI_ADVISOR cannot qualify opportunities. Qualification requires FOUNDER / human authority.
 * - D15: Duplicate opportunity detection based on shared diagnosis refs or taxonomy/environment signature.
 * - D16: Full Traceability Traverser: Opportunity → Diagnosis → Observation → Evidence → Run/Environment.
 */

'use strict';

const dal = require('../visibility-data');

const PROBLEM_TAXONOMY = Object.freeze({
  V1_DISCOVERY: 'V1_DISCOVERY',       // Entity completely omitted
  V2_RETRIEVAL: 'V2_RETRIEVAL',       // Content not retrieved or indexed
  V3_CITATION: 'V3_CITATION',         // Mentioned but URL/source citation omitted/unverified
  V4_ENTITY: 'V4_ENTITY',             // Conflation, canonical name distortion
  V5_CONTEXT: 'V5_CONTEXT',           // Incomplete, stale, or inaccurate context
  V6_COVERAGE: 'V6_COVERAGE',         // Systematic omission across prompt subset
  V7_ENVIRONMENT: 'V7_ENVIRONMENT'    // Failure specific to one AI engine architecture
});

const CONFIDENCE_STATES = Object.freeze({
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  UNVERIFIED: 'UNVERIFIED'
});

const DIAGNOSIS_STATUSES = Object.freeze({
  DETECTED: 'DETECTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  VALIDATED: 'VALIDATED',
  NEED_MORE_EVIDENCE: 'NEED_MORE_EVIDENCE',
  REJECTED: 'REJECTED'
});

const OPPORTUNITY_STATUSES = Object.freeze({
  DETECTED: 'DETECTED',
  DRAFTED: 'DRAFTED',
  QUALIFYING: 'QUALIFYING',
  QUALIFIED: 'QUALIFIED',
  REJECTED: 'REJECTED'
});

const QUALIFICATION_STATES = Object.freeze({
  UNQUALIFIED: 'UNQUALIFIED',
  IN_QUALIFICATION: 'IN_QUALIFICATION',
  QUALIFIED: 'QUALIFIED',
  DISQUALIFIED: 'DISQUALIFIED'
});

const FORBIDDEN_FIELDS = Object.freeze([
  'priority',
  'priority_level',
  'P0',
  'P1',
  'P2',
  'P3',
  'impact_score',
  'urgency',
  'action_id',
  'action_plan',
  'experiment_id',
  'implementation_plan',
  'visibility_score',
  'composite_score',
  'overall_score',
  'AI_visibility_score'
]);

function assertNoForbiddenFields(data, entityName) {
  for (const field of FORBIDDEN_FIELDS) {
    if (data[field] !== undefined) {
      throw new Error(`GOVERNANCE_ERROR: Field '${field}' is strictly forbidden in ${entityName}. Separations of concern: Diagnosis ≠ Opportunity ≠ Priority ≠ Action.`);
    }
  }
}

// -------------------------------------------------------------
// DIAGNOSIS DOMAIN SERVICES
// -------------------------------------------------------------

/**
 * Creates a new Diagnosis record with strict invariant checks.
 */
function createDiagnosis(diagnosisData, options = {}) {
  if (!diagnosisData) {
    throw new Error('Diagnosis data is required');
  }

  // Guard against forbidden priority, action, or score fields
  assertNoForbiddenFields(diagnosisData, 'Diagnosis');

  // Verify diagnosis ID format: DIAG-<domain>-<seq>
  if (!diagnosisData.diagnosis_id || !/^DIAG-[A-Za-z0-9_-]+$/.test(diagnosisData.diagnosis_id)) {
    throw new Error(`INVALID_IDENTIFIER: Diagnosis ID must match pattern ^DIAG-[A-Za-z0-9_-]+$ (got '${diagnosisData.diagnosis_id}')`);
  }

  // Ensure diagnosis ID is not derived from observation ID
  if (diagnosisData.diagnosis_id.startsWith('OBS-') || diagnosisData.diagnosis_id.startsWith('EVD-')) {
    throw new Error(`CONVENTION_ERROR: Diagnosis ID cannot be derived from observation or evidence ID.`);
  }

  // Uncertainty statement check: if confidence is LOW or UNVERIFIED, uncertainty_statement must be provided
  if (
    (diagnosisData.confidence_state === CONFIDENCE_STATES.LOW || diagnosisData.confidence_state === CONFIDENCE_STATES.UNVERIFIED) &&
    (!diagnosisData.uncertainty_statement || diagnosisData.uncertainty_statement.trim().length === 0)
  ) {
    throw new Error(`EPISTEMIC_ERROR: Diagnosis with confidence '${diagnosisData.confidence_state}' requires an explicit 'uncertainty_statement'.`);
  }

  // Initial status must be DETECTED or UNDER_REVIEW
  const initialStatus = diagnosisData.status || DIAGNOSIS_STATUSES.DETECTED;
  if (initialStatus === DIAGNOSIS_STATUSES.VALIDATED) {
    throw new Error(`GOVERNANCE_ERROR: Diagnosis cannot be created directly in VALIDATED status. Must progress through review workflow.`);
  }

  const record = {
    entity_type: 'diagnosis',
    schema_version: diagnosisData.schema_version || '1.0.0',
    diagnosis_id: diagnosisData.diagnosis_id,
    diagnosis_version: diagnosisData.diagnosis_version || '1.0.0',
    diagnosis_type: diagnosisData.diagnosis_type || 'DISCOVERY_DIAGNOSIS',
    title: diagnosisData.title,
    statement: diagnosisData.statement,
    status: initialStatus,
    scope: diagnosisData.scope || 'GLOBAL',
    observation_refs: Array.isArray(diagnosisData.observation_refs) ? diagnosisData.observation_refs : [],
    evidence_refs: Array.isArray(diagnosisData.evidence_refs) ? diagnosisData.evidence_refs : [],
    metric_refs: Array.isArray(diagnosisData.metric_refs) ? diagnosisData.metric_refs : [],
    environment_refs: Array.isArray(diagnosisData.environment_refs) ? diagnosisData.environment_refs : [],
    run_refs: Array.isArray(diagnosisData.run_refs) ? diagnosisData.run_refs : [],
    problem_taxonomy: Array.isArray(diagnosisData.problem_taxonomy) ? diagnosisData.problem_taxonomy : [],
    confidence_state: diagnosisData.confidence_state || CONFIDENCE_STATES.UNVERIFIED,
    uncertainty_statement: diagnosisData.uncertainty_statement || '',
    created_at: diagnosisData.created_at || new Date().toISOString(),
    updated_at: diagnosisData.updated_at || null,
    created_by: diagnosisData.created_by || (options.actor || 'SYSTEM'),
    validated_by: null,
    validated_at: null,
    validation_notes: '',
    is_immutable: false,
    metadata: diagnosisData.metadata || {},
    notes: diagnosisData.notes || ''
  };

  // Schema & referential validation via DAL
  return dal.saveEntity('diagnosis', record, options);
}

/**
 * Transitions Diagnosis lifecycle status with AI authority restrictions and immutability controls.
 */
function transitionDiagnosisStatus(diagnosisId, targetStatus, context = {}, options = {}) {
  const current = dal.loadEntity('diagnosis', diagnosisId, options);
  if (!current) {
    throw new Error(`Diagnosis not found: ${diagnosisId}`);
  }

  if (current.is_immutable === true || current.status === DIAGNOSIS_STATUSES.VALIDATED) {
    throw new Error(`IMMUTABILITY_VIOLATION: Diagnosis '${diagnosisId}' is in status '${current.status}' (immutable) and cannot be altered directly.`);
  }

  const validTransitions = {
    [DIAGNOSIS_STATUSES.DETECTED]: [DIAGNOSIS_STATUSES.UNDER_REVIEW, DIAGNOSIS_STATUSES.REJECTED],
    [DIAGNOSIS_STATUSES.UNDER_REVIEW]: [DIAGNOSIS_STATUSES.VALIDATED, DIAGNOSIS_STATUSES.NEED_MORE_EVIDENCE, DIAGNOSIS_STATUSES.REJECTED],
    [DIAGNOSIS_STATUSES.NEED_MORE_EVIDENCE]: [DIAGNOSIS_STATUSES.UNDER_REVIEW, DIAGNOSIS_STATUSES.REJECTED],
    [DIAGNOSIS_STATUSES.VALIDATED]: [], // Immutable terminal state for this record version
    [DIAGNOSIS_STATUSES.REJECTED]: []  // Terminal
  };

  const allowed = validTransitions[current.status] || [];
  if (!allowed.includes(targetStatus)) {
    throw new Error(`INVALID_TRANSITION: Cannot transition diagnosis from '${current.status}' to '${targetStatus}'. Allowed: [${allowed.join(', ')}]`);
  }

  // AI Authority Check (Rule D07)
  if (targetStatus === DIAGNOSIS_STATUSES.VALIDATED) {
    if (context.actor_type === 'AI_ADVISOR') {
      throw new Error(`PERMISSION_DENIED: Actor 'AI_ADVISOR' is strictly prohibited from validating diagnoses. Validation requires FOUNDER or human authority.`);
    }
    if (!context.actor) {
      throw new Error(`VALIDATION_ERROR: Diagnosis validation requires an explicit authorized 'actor'.`);
    }
  }

  const updated = {
    ...current,
    status: targetStatus,
    updated_at: new Date().toISOString()
  };

  if (targetStatus === DIAGNOSIS_STATUSES.VALIDATED) {
    updated.validated_by = context.actor;
    updated.validated_at = new Date().toISOString();
    updated.validation_notes = context.notes || 'Diagnosis validated against underlying evidence';
    updated.is_immutable = true; // Freeze record upon validation
  } else if (context.notes) {
    updated.notes = (updated.notes ? updated.notes + '\n' : '') + context.notes;
  }

  // Save with internal bypass of immutability check since this is the authorized transition
  return dal.saveEntity('diagnosis', updated, {
    ...options,
    actor: context.actor || 'SYSTEM',
    actor_type: context.actor_type || 'SYSTEM',
    reason: `Status transition: ${current.status} -> ${targetStatus}`
  });
}

// -------------------------------------------------------------
// OPPORTUNITY DOMAIN SERVICES
// -------------------------------------------------------------

/**
 * Creates a new Opportunity record with strict invariant checks.
 */
function createOpportunity(oppData, options = {}) {
  if (!oppData) {
    throw new Error('Opportunity data is required');
  }

  // Guard against forbidden priority, action, or score fields
  assertNoForbiddenFields(oppData, 'Opportunity');

  // Verify opportunity ID format: OPP-<domain>-<seq>
  if (!oppData.opportunity_id || !/^OPP-[A-Za-z0-9_-]+$/.test(oppData.opportunity_id)) {
    throw new Error(`INVALID_IDENTIFIER: Opportunity ID must match pattern ^OPP-[A-Za-z0-9_-]+$ (got '${oppData.opportunity_id}')`);
  }

  // Must reference at least one diagnosis
  if (!Array.isArray(oppData.diagnosis_refs) || oppData.diagnosis_refs.length === 0) {
    throw new Error(`REFERENTIAL_ERROR: Opportunity must link to at least 1 validated or under-review diagnosis.`);
  }

  // Initial status must be DETECTED or DRAFTED
  const initialStatus = oppData.status || OPPORTUNITY_STATUSES.DETECTED;
  if (initialStatus === OPPORTUNITY_STATUSES.QUALIFIED) {
    throw new Error(`GOVERNANCE_ERROR: Opportunity cannot be created directly in QUALIFIED status. Must go through qualification gate.`);
  }

  // Qualification state must be UNQUALIFIED or IN_QUALIFICATION initially
  const initialQualState = oppData.qualification_state || QUALIFICATION_STATES.UNQUALIFIED;
  if (initialQualState === QUALIFICATION_STATES.QUALIFIED) {
    throw new Error(`GOVERNANCE_ERROR: Opportunity qualification_state cannot be QUALIFIED upon creation.`);
  }

  // Duplicate Opportunity Detection (Rule D15)
  const duplicates = detectDuplicateOpportunities(oppData, options);
  if (duplicates.length > 0 && options.allowDuplicates !== true) {
    const dupIds = duplicates.map(d => d.opportunity_id).join(', ');
    throw new Error(`DUPLICATE_OPPORTUNITY: Similar active opportunity already exists: [${dupIds}]. Set allowDuplicates: true if intentional.`);
  }

  const record = {
    entity_type: 'opportunity',
    schema_version: oppData.schema_version || '1.0.0',
    opportunity_id: oppData.opportunity_id,
    opportunity_version: oppData.opportunity_version || '1.0.0',
    opportunity_type: oppData.opportunity_type || 'VISIBILITY_IMPROVEMENT',
    title: oppData.title,
    statement: oppData.statement,
    status: initialStatus,
    scope: oppData.scope || 'GLOBAL',
    diagnosis_refs: oppData.diagnosis_refs,
    observation_refs: Array.isArray(oppData.observation_refs) ? oppData.observation_refs : [],
    evidence_refs: Array.isArray(oppData.evidence_refs) ? oppData.evidence_refs : [],
    metric_refs: Array.isArray(oppData.metric_refs) ? oppData.metric_refs : [],
    environment_refs: Array.isArray(oppData.environment_refs) ? oppData.environment_refs : [],
    run_refs: Array.isArray(oppData.run_refs) ? oppData.run_refs : [],
    problem_taxonomy: Array.isArray(oppData.problem_taxonomy) ? oppData.problem_taxonomy : [],
    qualification_state: initialQualState,
    confidence_state: oppData.confidence_state || CONFIDENCE_STATES.UNVERIFIED,
    expected_impact_hypothesis: oppData.expected_impact_hypothesis || '',
    rationale: oppData.rationale || '',
    created_at: oppData.created_at || new Date().toISOString(),
    updated_at: oppData.updated_at || null,
    created_by: oppData.created_by || (options.actor || 'SYSTEM'),
    qualified_by: null,
    qualified_at: null,
    qualification_notes: '',
    is_immutable: false,
    metadata: oppData.metadata || {},
    notes: oppData.notes || ''
  };

  return dal.saveEntity('opportunity', record, options);
}

/**
 * Transitions Opportunity lifecycle status with Diagnosis → Opportunity Gate and AI restrictions.
 */
function transitionOpportunityStatus(opportunityId, targetStatus, context = {}, options = {}) {
  const current = dal.loadEntity('opportunity', opportunityId, options);
  if (!current) {
    throw new Error(`Opportunity not found: ${opportunityId}`);
  }

  if (current.is_immutable === true || current.status === OPPORTUNITY_STATUSES.QUALIFIED) {
    throw new Error(`IMMUTABILITY_VIOLATION: Opportunity '${opportunityId}' is in status '${current.status}' (immutable) and cannot be altered directly.`);
  }

  const validTransitions = {
    [OPPORTUNITY_STATUSES.DETECTED]: [OPPORTUNITY_STATUSES.DRAFTED, OPPORTUNITY_STATUSES.REJECTED],
    [OPPORTUNITY_STATUSES.DRAFTED]: [OPPORTUNITY_STATUSES.QUALIFYING, OPPORTUNITY_STATUSES.REJECTED],
    [OPPORTUNITY_STATUSES.QUALIFYING]: [OPPORTUNITY_STATUSES.QUALIFIED, OPPORTUNITY_STATUSES.REJECTED],
    [OPPORTUNITY_STATUSES.QUALIFIED]: [], // Immutable terminal state
    [OPPORTUNITY_STATUSES.REJECTED]: []   // Terminal
  };

  const allowed = validTransitions[current.status] || [];
  if (!allowed.includes(targetStatus)) {
    throw new Error(`INVALID_TRANSITION: Cannot transition opportunity from '${current.status}' to '${targetStatus}'. Allowed: [${allowed.join(', ')}]`);
  }

  // AI Authority Check (Rule D14)
  if (targetStatus === OPPORTUNITY_STATUSES.QUALIFIED) {
    if (context.actor_type === 'AI_ADVISOR') {
      throw new Error(`PERMISSION_DENIED: Actor 'AI_ADVISOR' is strictly prohibited from qualifying opportunities. Qualification requires FOUNDER or human authority.`);
    }
    if (!context.actor) {
      throw new Error(`QUALIFICATION_ERROR: Opportunity qualification requires an explicit authorized 'actor'.`);
    }

    // DIAGNOSIS → OPPORTUNITY GATE (Rule D12):
    // Opportunity can ONLY be QUALIFIED if ALL referenced diagnoses are VALIDATED.
    for (const diagId of current.diagnosis_refs) {
      const diag = dal.loadEntity('diagnosis', diagId, options);
      if (!diag) {
        throw new Error(`GATE_ERROR: Referenced diagnosis '${diagId}' does not exist.`);
      }
      if (diag.status !== DIAGNOSIS_STATUSES.VALIDATED) {
        throw new Error(`GATE_ERROR: Cannot qualify opportunity '${opportunityId}'. Referenced diagnosis '${diagId}' is in status '${diag.status}', expected 'VALIDATED'. Epistemic rule: No validated diagnosis = no qualified opportunity.`);
      }
    }
  }

  const updated = {
    ...current,
    status: targetStatus,
    updated_at: new Date().toISOString()
  };

  if (targetStatus === OPPORTUNITY_STATUSES.QUALIFIED) {
    updated.qualification_state = QUALIFICATION_STATES.QUALIFIED;
    updated.qualified_by = context.actor;
    updated.qualified_at = new Date().toISOString();
    updated.qualification_notes = context.notes || 'Opportunity qualified based on validated underlying diagnosis.';
    updated.is_immutable = true; // Freeze upon qualification
  } else if (targetStatus === OPPORTUNITY_STATUSES.QUALIFYING) {
    updated.qualification_state = QUALIFICATION_STATES.IN_QUALIFICATION;
  } else if (targetStatus === OPPORTUNITY_STATUSES.REJECTED) {
    updated.qualification_state = QUALIFICATION_STATES.DISQUALIFIED;
  }

  if (context.notes && targetStatus !== OPPORTUNITY_STATUSES.QUALIFIED) {
    updated.notes = (updated.notes ? updated.notes + '\n' : '') + context.notes;
  }

  return dal.saveEntity('opportunity', updated, {
    ...options,
    actor: context.actor || 'SYSTEM',
    actor_type: context.actor_type || 'SYSTEM',
    reason: `Status transition: ${current.status} -> ${targetStatus}`
  });
}

/**
 * Detects duplicate or near-duplicate opportunities based on diagnosis references or taxonomic signature.
 */
function detectDuplicateOpportunities(oppData, options = {}) {
  const existingList = dal.listOpportunities(options);
  const duplicates = [];

  const targetDiagSet = new Set(oppData.diagnosis_refs || []);
  const targetTaxonomy = (oppData.problem_taxonomy || []).slice().sort().join(',');
  const targetScope = oppData.scope || 'GLOBAL';

  for (const existing of existingList) {
    // Skip self if updating
    if (existing.opportunity_id === oppData.opportunity_id) continue;
    // Skip rejected opportunities
    if (existing.status === OPPORTUNITY_STATUSES.REJECTED) continue;

    // Check 1: Identical diagnosis reference set
    const existingDiagSet = new Set(existing.diagnosis_refs || []);
    if (targetDiagSet.size > 0 && targetDiagSet.size === existingDiagSet.size) {
      let allMatch = true;
      for (const id of targetDiagSet) {
        if (!existingDiagSet.has(id)) {
          allMatch = false;
          break;
        }
      }
      if (allMatch) {
        duplicates.push({
          opportunity_id: existing.opportunity_id,
          reason: 'IDENTICAL_DIAGNOSIS_REFS',
          match_diagnoses: Array.from(targetDiagSet)
        });
        continue;
      }
    }

    // Check 2: Same scope, same taxonomic signature, and high title similarity
    const existingTaxonomy = (existing.problem_taxonomy || []).slice().sort().join(',');
    if (
      existing.scope === targetScope &&
      existingTaxonomy === targetTaxonomy &&
      existing.title &&
      oppData.title &&
      existing.title.trim().toLowerCase() === oppData.title.trim().toLowerCase()
    ) {
      duplicates.push({
        opportunity_id: existing.opportunity_id,
        reason: 'IDENTICAL_SIGNATURE_AND_TITLE',
        title: existing.title
      });
    }
  }

  return duplicates;
}

// -------------------------------------------------------------
// TRACEABILITY TRAVERSER (Rule D16)
// -------------------------------------------------------------

/**
 * Traces the complete provenance chain for an Opportunity:
 * Opportunity → Diagnoses → Observations → Evidence → Environments/Runs
 */
function traceEvidenceChain(opportunityId, options = {}) {
  const opportunity = dal.loadEntity('opportunity', opportunityId, options);
  if (!opportunity) {
    return {
      opportunity_id: opportunityId,
      found: false,
      broken_links: [`Opportunity not found: ${opportunityId}`],
      is_complete: false
    };
  }

  const broken_links = [];
  const diagnoses = [];
  const observations = [];
  const evidence = [];
  const runs = [];
  const environments = [];

  const seenDiag = new Set();
  const seenObs = new Set();
  const seenEvd = new Set();
  const seenRun = new Set();
  const seenEnv = new Set();

  for (const diagId of (opportunity.diagnosis_refs || [])) {
    const diag = dal.loadEntity('diagnosis', diagId, options);
    if (!diag) {
      broken_links.push(`Referenced diagnosis '${diagId}' not found.`);
      continue;
    }
    if (!seenDiag.has(diagId)) {
      seenDiag.add(diagId);
      diagnoses.push(diag);
    }

    // Traverse Observation refs from Diagnosis
    for (const obsId of (diag.observation_refs || [])) {
      const obs = dal.loadEntity('observation', obsId, options);
      if (!obs) {
        broken_links.push(`Diagnosis '${diagId}' references missing observation '${obsId}'.`);
        continue;
      }
      if (!seenObs.has(obsId)) {
        seenObs.add(obsId);
        observations.push(obs);

        // Run
        if (obs.run_id && !seenRun.has(obs.run_id)) {
          const run = dal.loadEntity('measurement_run', obs.run_id, options);
          if (run) {
            seenRun.add(obs.run_id);
            runs.push(run);
          } else {
            broken_links.push(`Observation '${obsId}' references missing run '${obs.run_id}'.`);
          }
        }

        // Environment
        if (obs.environment_id && !seenEnv.has(obs.environment_id)) {
          const env = dal.loadEntity('environment', obs.environment_id, options);
          if (env) {
            seenEnv.add(obs.environment_id);
            environments.push(env);
          } else {
            broken_links.push(`Observation '${obsId}' references missing environment '${obs.environment_id}'.`);
          }
        }
      }
    }

    // Traverse Evidence refs from Diagnosis
    for (const evdId of (diag.evidence_refs || [])) {
      const evd = dal.loadEntity('visibility_evidence', evdId, options);
      if (!evd) {
        broken_links.push(`Diagnosis '${diagId}' references missing evidence '${evdId}'.`);
        continue;
      }
      if (!seenEvd.has(evdId)) {
        seenEvd.add(evdId);
        evidence.push(evd);
      }
    }
  }

  return {
    opportunity_id: opportunity.opportunity_id,
    found: true,
    opportunity,
    diagnoses,
    observations,
    evidence,
    runs,
    environments,
    counts: {
      diagnoses: diagnoses.length,
      observations: observations.length,
      evidence: evidence.length,
      runs: runs.length,
      environments: environments.length
    },
    broken_links,
    is_complete: broken_links.length === 0 && diagnoses.length > 0 && observations.length > 0 && evidence.length > 0
  };
}

/**
 * Traces the evidence chain backwards from a Diagnosis.
 */
function traceDiagnosisEvidenceChain(diagnosisId, options = {}) {
  const diagnosis = dal.loadEntity('diagnosis', diagnosisId, options);
  if (!diagnosis) {
    return {
      diagnosis_id: diagnosisId,
      found: false,
      broken_links: [`Diagnosis not found: ${diagnosisId}`],
      is_complete: false
    };
  }

  const broken_links = [];
  const observations = [];
  const evidence = [];
  const runs = [];
  const environments = [];

  for (const obsId of (diagnosis.observation_refs || [])) {
    const obs = dal.loadEntity('observation', obsId, options);
    if (!obs) {
      broken_links.push(`Referenced observation '${obsId}' not found.`);
      continue;
    }
    observations.push(obs);

    if (obs.run_id) {
      const run = dal.loadEntity('measurement_run', obs.run_id, options);
      if (run) runs.push(run);
      else broken_links.push(`Observation '${obsId}' references missing run '${obs.run_id}'.`);
    }

    if (obs.environment_id) {
      const env = dal.loadEntity('environment', obs.environment_id, options);
      if (env) environments.push(env);
      else broken_links.push(`Observation '${obsId}' references missing environment '${obs.environment_id}'.`);
    }
  }

  for (const evdId of (diagnosis.evidence_refs || [])) {
    const evd = dal.loadEntity('visibility_evidence', evdId, options);
    if (!evd) {
      broken_links.push(`Referenced evidence '${evdId}' not found.`);
      continue;
    }
    evidence.push(evd);
  }

  return {
    diagnosis_id: diagnosis.diagnosis_id,
    found: true,
    diagnosis,
    observations,
    evidence,
    runs,
    environments,
    counts: {
      observations: observations.length,
      evidence: evidence.length,
      runs: runs.length,
      environments: environments.length
    },
    broken_links,
    is_complete: broken_links.length === 0 && observations.length > 0 && evidence.length > 0
  };
}

module.exports = {
  PROBLEM_TAXONOMY,
  CONFIDENCE_STATES,
  DIAGNOSIS_STATUSES,
  OPPORTUNITY_STATUSES,
  QUALIFICATION_STATES,
  FORBIDDEN_FIELDS,
  createDiagnosis,
  transitionDiagnosisStatus,
  createOpportunity,
  transitionOpportunityStatus,
  detectDuplicateOpportunities,
  traceEvidenceChain,
  traceDiagnosisEvidenceChain
};
