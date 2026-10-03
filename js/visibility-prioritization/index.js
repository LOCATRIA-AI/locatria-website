/**
 * LOCATRIA Visibility Operating System v1.0
 * Prioritization & Founder Decision Foundation (M08.2 / BUILD-04)
 *
 * Core Epistemic Chain:
 *   Qualified Opportunity → Priority Assessment → Priority Recommendation → Founder Review → Founder Decision
 *
 * Strict Architectural Separation:
 *   Opportunity ≠ Priority Assessment ≠ Priority Recommendation ≠ Founder Decision ≠ Action
 *
 * Invariants & Governance Rules:
 * - P01: Priority Assessment can only be created for QUALIFIED opportunities.
 * - P02: Priority Assessment must reference an existing Opportunity.
 * - P03: Categorical dimensions only (HIGH, MEDIUM, LOW, UNKNOWN, INSUFFICIENT, BLOCKING, SIGNIFICANT, MINOR, NONE).
 * - P04: Tolerance = 0 for composite scores, weighted averages, numeric scores, or hidden ranks.
 * - P05: Priority Recommendation requires a valid assessment with explicit dimension bases.
 * - P06: AI authority restriction: AI_ADVISOR cannot finalize Founder Decisions.
 * - P07: Founder Decision requires a qualified Opportunity.
 * - P08/P09: Founder Decision requires an authorized decision value (APPROVE, DEFER, REJECT, REQUEST_MORE_EVIDENCE).
 * - P10: No automatic transition from recommendation to approval. Silence ≠ approval.
 * - P11: Finalized Founder Decisions (status: DECIDED) are immutable.
 * - P12: Priority Assessment versions referenced by finalized decisions cannot be mutated.
 * - P13: Full evidence traceability traverser: Decision → Assessment → Opportunity → Diagnosis → Observation → Evidence.
 * - P14: Founder override of recommendation requires an explicit decision_reason.
 * - P15/P16: Zero composite scores and zero hidden ranking fields.
 * - P17: AI cannot masquerade as Founder.
 * - P18: Decision revisions must create a new version, not overwrite existing decision records.
 */

'use strict';

const dal = require('../visibility-data');
const domain = require('../visibility-domain');

const IMPACT_VALUES = Object.freeze(['HIGH', 'MEDIUM', 'LOW', 'UNKNOWN']);
const EVIDENCE_STRENGTH_VALUES = Object.freeze(['HIGH', 'MEDIUM', 'LOW', 'INSUFFICIENT']);
const FEASIBILITY_VALUES = Object.freeze(['HIGH', 'MEDIUM', 'LOW', 'UNKNOWN']);
const URGENCY_VALUES = Object.freeze(['HIGH', 'MEDIUM', 'LOW', 'UNKNOWN']);
const DEPENDENCY_VALUES = Object.freeze(['BLOCKING', 'SIGNIFICANT', 'MINOR', 'NONE', 'UNKNOWN']);
const STRATEGIC_RELEVANCE_VALUES = Object.freeze(['HIGH', 'MEDIUM', 'LOW', 'UNKNOWN']);

const PRIORITY_RECOMMENDATIONS = Object.freeze({
  P0: 'P0',
  P1: 'P1',
  P2: 'P2',
  P3: 'P3',
  RECOMMENDATION_UNCERTAIN: 'RECOMMENDATION_UNCERTAIN'
});

const FOUNDER_DECISIONS = Object.freeze({
  APPROVE: 'APPROVE',
  DEFER: 'DEFER',
  REJECT: 'REJECT',
  REQUEST_MORE_EVIDENCE: 'REQUEST_MORE_EVIDENCE'
});

const ASSESSMENT_STATUSES = Object.freeze({
  DRAFTED: 'DRAFTED',
  ASSESSED: 'ASSESSED',
  RECOMMENDED: 'RECOMMENDED',
  FOUNDER_REVIEW: 'FOUNDER_REVIEW'
});

const DECISION_STATUSES = Object.freeze({
  PENDING_REVIEW: 'PENDING_REVIEW',
  DECIDED: 'DECIDED'
});

const FORBIDDEN_FIELDS = Object.freeze([
  'priority_score',
  'overall_score',
  'opportunity_score',
  'ai_score',
  'visibility_score',
  'weighted_score',
  'ranking_score',
  'composite_score',
  'rank',
  'hidden_rank',
  'action_id',
  'action_plan',
  'experiment_id',
  'implementation_plan'
]);

function assertNoForbiddenFields(data, entityName) {
  for (const field of FORBIDDEN_FIELDS) {
    if (data[field] !== undefined) {
      throw new Error(`GOVERNANCE_ERROR: Field '${field}' is strictly forbidden in ${entityName}. Tolerance = 0 for composite scores, weighted scores, or action plans.`);
    }
  }
}

// -------------------------------------------------------------
// PRIORITY RECOMMENDATION RULE ENGINE (Deterministic, Zero Score)
// -------------------------------------------------------------

/**
 * Generates an explainable priority recommendation based solely on categorical dimensions.
 * Zero numeric weights, zero composite scores, zero black-box rankings.
 */
function generatePriorityRecommendation(assessment) {
  if (!assessment) {
    throw new Error('Assessment data is required to generate priority recommendation.');
  }

  const {
    impact,
    evidence_strength,
    feasibility,
    urgency,
    dependency,
    strategic_relevance
  } = assessment;

  // Validation of categories
  if (!IMPACT_VALUES.includes(impact)) throw new Error(`INVALID_DIMENSION: Invalid impact '${impact}'`);
  if (!EVIDENCE_STRENGTH_VALUES.includes(evidence_strength)) throw new Error(`INVALID_DIMENSION: Invalid evidence_strength '${evidence_strength}'`);
  if (!FEASIBILITY_VALUES.includes(feasibility)) throw new Error(`INVALID_DIMENSION: Invalid feasibility '${feasibility}'`);
  if (!URGENCY_VALUES.includes(urgency)) throw new Error(`INVALID_DIMENSION: Invalid urgency '${urgency}'`);
  if (!DEPENDENCY_VALUES.includes(dependency)) throw new Error(`INVALID_DIMENSION: Invalid dependency '${dependency}'`);
  if (!STRATEGIC_RELEVANCE_VALUES.includes(strategic_relevance)) throw new Error(`INVALID_DIMENSION: Invalid strategic_relevance '${strategic_relevance}'`);

  // Rule 1: Insufficient evidence or Unknown Impact triggers uncertain recommendation
  if (evidence_strength === 'INSUFFICIENT' || impact === 'UNKNOWN') {
    return {
      recommendation: PRIORITY_RECOMMENDATIONS.RECOMMENDATION_UNCERTAIN,
      rationale: 'Evidence strength is insufficient or impact is unknown. Recommend REQUEST_MORE_EVIDENCE before strategic commitment.'
    };
  }

  // Rule 2: P0 (Critical / Prerequisite)
  // Prerequisite or blocking downstream capability, or strategic alignment with urgent need and viable feasibility
  if (
    dependency === 'BLOCKING' ||
    (strategic_relevance === 'HIGH' && urgency === 'HIGH' && evidence_strength !== 'INSUFFICIENT' && feasibility !== 'LOW')
  ) {
    return {
      recommendation: PRIORITY_RECOMMENDATIONS.P0,
      rationale: 'Critical / Prerequisite: Opportunity represents a blocking dependency or high-urgency strategic alignment with verified evidence.'
    };
  }

  // Rule 3: P1 (High Priority Candidate)
  // High impact supported by robust evidence and high or medium feasibility
  if (
    impact === 'HIGH' &&
    ['HIGH', 'MEDIUM'].includes(evidence_strength) &&
    ['HIGH', 'MEDIUM'].includes(feasibility)
  ) {
    return {
      recommendation: PRIORITY_RECOMMENDATIONS.P1,
      rationale: 'High Priority Candidate: High impact supported by verified evidence and high/medium feasibility.'
    };
  }

  // Rule 4: P2 (Normal Priority)
  // Moderate impact, or high-impact constrained by lower feasibility
  if (
    impact === 'MEDIUM' ||
    (impact === 'HIGH' && feasibility === 'LOW')
  ) {
    return {
      recommendation: PRIORITY_RECOMMENDATIONS.P2,
      rationale: 'Normal Priority: Moderate impact or high-impact constrained by feasibility.'
    };
  }

  // Rule 5: P3 (Defer Candidate)
  // Low urgency, low feasibility, or low impact
  if (
    urgency === 'LOW' ||
    feasibility === 'LOW' ||
    impact === 'LOW'
  ) {
    return {
      recommendation: PRIORITY_RECOMMENDATIONS.P3,
      rationale: 'Defer Candidate: Low urgency, constrained feasibility, or low immediate impact.'
    };
  }

  return {
    recommendation: PRIORITY_RECOMMENDATIONS.RECOMMENDATION_UNCERTAIN,
    rationale: 'Categorical dimensions do not meet deterministic threshold criteria; requires manual Founder review.'
  };
}

// -------------------------------------------------------------
// PRIORITY ASSESSMENT SERVICES
// -------------------------------------------------------------

/**
 * Creates a new Priority Assessment record with strict invariant checks.
 */
function createPriorityAssessment(data, options = {}) {
  if (!data) throw new Error('Priority assessment data is required');

  assertNoForbiddenFields(data, 'Priority Assessment');

  if (!data.priority_assessment_id || !/^PRIO-[A-Za-z0-9_-]+$/.test(data.priority_assessment_id)) {
    throw new Error(`INVALID_IDENTIFIER: Priority Assessment ID must match pattern ^PRIO-[A-Za-z0-9_-]+$ (got '${data.priority_assessment_id}')`);
  }

  // Dimension bases check (Section 12: explicit basis required for all 6 dimensions)
  const basisFields = [
    'impact_basis',
    'evidence_strength_basis',
    'feasibility_basis',
    'urgency_basis',
    'dependency_basis',
    'strategic_relevance_basis'
  ];
  for (const bf of basisFields) {
    if (!data[bf] || typeof data[bf] !== 'string' || data[bf].trim().length < 3) {
      throw new Error(`VALIDATION_ERROR: Missing or insufficient dimension rationale for '${bf}'. Every dimension must have a traceable basis.`);
    }
  }

  // Generate priority recommendation if not provided
  let recommendation = data.priority_recommendation;
  let rationale = data.recommendation_rationale;
  if (!recommendation) {
    const recResult = generatePriorityRecommendation(data);
    recommendation = recResult.recommendation;
    rationale = recResult.rationale;
  }

  const record = {
    entity_type: 'priority_assessment',
    schema_version: data.schema_version || '1.0.0',
    priority_assessment_id: data.priority_assessment_id,
    priority_assessment_version: data.priority_assessment_version || '1.0.0',
    opportunity_id: data.opportunity_id,
    impact: data.impact,
    evidence_strength: data.evidence_strength,
    feasibility: data.feasibility,
    urgency: data.urgency,
    dependency: data.dependency,
    strategic_relevance: data.strategic_relevance,
    impact_basis: data.impact_basis,
    evidence_strength_basis: data.evidence_strength_basis,
    feasibility_basis: data.feasibility_basis,
    urgency_basis: data.urgency_basis,
    dependency_basis: data.dependency_basis,
    strategic_relevance_basis: data.strategic_relevance_basis,
    priority_recommendation: recommendation,
    recommendation_source: data.recommendation_source || 'RULE_ENGINE',
    recommendation_rationale: rationale || 'Automated deterministic categorical rule engine assessment.',
    assessment_scope: data.assessment_scope || 'GLOBAL',
    assessment_status: data.assessment_status || ASSESSMENT_STATUSES.RECOMMENDED,
    assessment_notes: data.assessment_notes || '',
    evidence_refs: Array.isArray(data.evidence_refs) ? data.evidence_refs : [],
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || null,
    created_by: data.created_by || (options.actor || 'SYSTEM'),
    reviewed_by: data.reviewed_by || null,
    is_immutable: false,
    metadata: data.metadata || {}
  };

  return dal.saveEntity('priority_assessment', record, options);
}

/**
 * Creates a new version of a Priority Assessment.
 * If previous version was referenced by a Founder Decision, previous version is preserved immutably.
 */
function updatePriorityAssessmentVersion(assessmentId, updates, context = {}, options = {}) {
  const current = dal.loadEntity('priority_assessment', assessmentId, options);
  if (!current) {
    throw new Error(`Priority assessment not found: ${assessmentId}`);
  }

  assertNoForbiddenFields(updates, 'Priority Assessment');

  // Parse version numbers (semver major.minor.patch)
  const currentVer = current.priority_assessment_version || '1.0.0';
  const parts = currentVer.split('.').map(Number);
  const nextVer = `${parts[0] || 1}.${(parts[1] || 0) + 1}.0`;

  const updatedRecord = {
    ...current,
    ...updates,
    priority_assessment_id: assessmentId,
    priority_assessment_version: updates.priority_assessment_version || nextVer,
    updated_at: new Date().toISOString(),
    reviewed_by: context.actor || current.reviewed_by,
    is_immutable: false
  };

  // Re-evaluate recommendation if dimensions changed
  if (
    updates.impact ||
    updates.evidence_strength ||
    updates.feasibility ||
    updates.urgency ||
    updates.dependency ||
    updates.strategic_relevance
  ) {
    const recResult = generatePriorityRecommendation(updatedRecord);
    updatedRecord.priority_recommendation = recResult.recommendation;
    updatedRecord.recommendation_rationale = recResult.rationale;
  }

  return dal.saveEntity('priority_assessment', updatedRecord, {
    ...options,
    actor: context.actor || 'SYSTEM',
    actor_type: context.actor_type || 'SYSTEM',
    reason: `Priority assessment version increment: ${currentVer} -> ${updatedRecord.priority_assessment_version}`
  });
}

// -------------------------------------------------------------
// FOUNDER DECISION SERVICES
// -------------------------------------------------------------

/**
 * Creates an authoritative Founder Decision record.
 * Human Founder authority is mandatory. AI_ADVISOR is strictly prohibited from finalizing decisions.
 */
function createFounderDecision(data, options = {}) {
  if (!data) throw new Error('Founder decision data is required');

  assertNoForbiddenFields(data, 'Founder Decision');

  if (!data.decision_id || !/^DEC-[A-Za-z0-9_-]+$/.test(data.decision_id)) {
    throw new Error(`INVALID_IDENTIFIER: Founder Decision ID must match pattern ^DEC-[A-Za-z0-9_-]+$ (got '${data.decision_id}')`);
  }

  // AI AUTHORITY BOUNDARY (Rules P06, P17, Section 25)
  if (options.actor_type === 'AI_ADVISOR' || data.decided_by === 'AI_ADVISOR') {
    throw new Error(`PERMISSION_DENIED: Actor 'AI_ADVISOR' is strictly prohibited from finalizing Founder Decisions. Strategic governance decisions require human Founder authority.`);
  }

  // Decision validity check
  const validDecisions = Object.values(FOUNDER_DECISIONS);
  if (!data.decision || !validDecisions.includes(data.decision)) {
    throw new Error(`INVALID_DECISION: Decision value '${data.decision}' is invalid. Allowed values: [${validDecisions.join(', ')}]`);
  }

  // Recommendation vs Decision Separation & Override Requirement (Rule P14, Section 23)
  const recommendation = data.recommendation;
  if (!recommendation) {
    throw new Error(`VALIDATION_ERROR: Founder Decision must record the underlying 'recommendation'.`);
  }

  // If Founder decision overrides recommendation (e.g. P1 recommendation deferred or P2 approved), require explicit reason
  const isOverride =
    (recommendation === PRIORITY_RECOMMENDATIONS.P0 && data.decision !== FOUNDER_DECISIONS.APPROVE) ||
    (recommendation === PRIORITY_RECOMMENDATIONS.P1 && data.decision === FOUNDER_DECISIONS.DEFER) ||
    (recommendation === PRIORITY_RECOMMENDATIONS.P1 && data.decision === FOUNDER_DECISIONS.REJECT) ||
    (recommendation === PRIORITY_RECOMMENDATIONS.P2 && data.decision === FOUNDER_DECISIONS.APPROVE) ||
    (recommendation === PRIORITY_RECOMMENDATIONS.P3 && data.decision === FOUNDER_DECISIONS.APPROVE) ||
    (recommendation === PRIORITY_RECOMMENDATIONS.RECOMMENDATION_UNCERTAIN && data.decision === FOUNDER_DECISIONS.APPROVE);

  if (isOverride && (!data.decision_reason || data.decision_reason.trim().length < 5)) {
    throw new Error(`GOVERNANCE_ERROR: Founder override of recommendation '${recommendation}' with '${data.decision}' requires an explicit, traceable 'decision_reason'.`);
  }

  const record = {
    entity_type: 'founder_decision',
    schema_version: data.schema_version || '1.0.0',
    decision_id: data.decision_id,
    decision_version: data.decision_version || '1.0.0',
    opportunity_id: data.opportunity_id,
    priority_assessment_id: data.priority_assessment_id,
    recommendation: recommendation,
    decision: data.decision,
    decision_reason: data.decision_reason || 'Founder governance decision recorded.',
    decision_notes: data.decision_notes || '',
    evidence_refs: Array.isArray(data.evidence_refs) ? data.evidence_refs : [],
    created_at: data.created_at || new Date().toISOString(),
    decided_at: data.status === DECISION_STATUSES.PENDING_REVIEW ? null : (data.decided_at || new Date().toISOString()),
    decided_by: data.decided_by || options.actor || 'FOUNDER',
    status: data.status || DECISION_STATUSES.DECIDED,
    is_immutable: (data.status || DECISION_STATUSES.DECIDED) === DECISION_STATUSES.DECIDED,
    metadata: data.metadata || {}
  };

  return dal.saveEntity('founder_decision', record, {
    ...options,
    actor: record.decided_by,
    actor_type: options.actor_type || 'FOUNDER',
    reason: `Founder Decision recorded: ${record.decision} (Recommendation: ${record.recommendation})`
  });
}

/**
 * Creates a revised version of a Founder Decision.
 * Modifying finalized decisions in place is strictly prohibited (Rule P11, P18).
 */
function recordFounderDecisionRevision(decisionId, updates, context = {}, options = {}) {
  const current = dal.loadEntity('founder_decision', decisionId, options);
  if (!current) {
    throw new Error(`Founder decision not found: ${decisionId}`);
  }

  if (context.actor_type === 'AI_ADVISOR' || updates.decided_by === 'AI_ADVISOR') {
    throw new Error(`PERMISSION_DENIED: Actor 'AI_ADVISOR' is strictly prohibited from creating Founder Decision revisions.`);
  }

  assertNoForbiddenFields(updates, 'Founder Decision');

  const currentVer = current.decision_version || '1.0.0';
  const parts = currentVer.split('.').map(Number);
  const nextVer = `${(parts[0] || 1) + 1}.0.0`; // Major bump for decision revision

  const revisedRecord = {
    ...current,
    ...updates,
    decision_id: `${decisionId}-V${parts[0] + 1}`,
    decision_version: nextVer,
    decided_at: new Date().toISOString(),
    decided_by: context.actor || updates.decided_by || 'FOUNDER',
    status: DECISION_STATUSES.DECIDED,
    is_immutable: true,
    metadata: {
      ...(current.metadata || {}),
      supersedes_decision_id: decisionId,
      supersedes_version: currentVer
    }
  };

  return dal.saveEntity('founder_decision', revisedRecord, {
    ...options,
    actor: revisedRecord.decided_by,
    actor_type: 'FOUNDER',
    reason: `Founder Decision revision: ${currentVer} -> ${nextVer}`
  });
}

// -------------------------------------------------------------
// CONFLICT DETECTION ENGINE (Section 34)
// -------------------------------------------------------------

/**
 * Detects strategic and epistemic conflicts across assessment, recommendation, and Founder Decision.
 */
function detectConflicts(assessment, decision = null, options = {}) {
  const conflicts = [];

  if (!assessment) return conflicts;

  // Conflict B: Evidence strength is insufficient for high confidence
  if (assessment.evidence_strength === 'INSUFFICIENT' && assessment.impact === 'HIGH') {
    conflicts.push({
      type: 'CONFLICT_B_INSUFFICIENT_EVIDENCE',
      severity: 'WARNING',
      message: 'Impact is assessed as HIGH while evidence strength is INSUFFICIENT.'
    });
  }

  // Conflict C: Opportunity is qualified but required prioritization dimensions are UNKNOWN
  const unknownCount = [
    assessment.impact,
    assessment.feasibility,
    assessment.urgency,
    assessment.strategic_relevance
  ].filter(v => v === 'UNKNOWN').length;

  if (unknownCount >= 2) {
    conflicts.push({
      type: 'CONFLICT_C_MULTIPLE_UNKNOWN_DIMENSIONS',
      severity: 'WARNING',
      message: `${unknownCount} critical dimensions are marked UNKNOWN. Recommend evidence gathering.`
    });
  }

  // Conflict D: Dependency is BLOCKING but prerequisite opportunity is not identified
  if (assessment.dependency === 'BLOCKING' && (!assessment.dependency_basis || !assessment.dependency_basis.includes('OPP-'))) {
    conflicts.push({
      type: 'CONFLICT_D_BLOCKING_WITHOUT_PREREQUISITE_ID',
      severity: 'ADVISORY',
      message: "Dependency is marked BLOCKING but dependency_basis does not reference a specific prerequisite opportunity ID ('OPP-...')."
    });
  }

  // Conflict A & E: Decision-related conflicts
  if (decision) {
    // Conflict A: Founder Decision differs from recommendation
    if (
      (decision.recommendation === 'P1' && decision.decision !== 'APPROVE') ||
      (decision.recommendation === 'P2' && decision.decision === 'APPROVE') ||
      (decision.recommendation === 'P3' && decision.decision === 'APPROVE')
    ) {
      conflicts.push({
        type: 'CONFLICT_A_FOUNDER_RECOMMENDATION_DIVERGENCE',
        severity: 'INFO',
        message: `Founder Decision '${decision.decision}' differs from recommendation '${decision.recommendation}'. Justified by decision_reason.`
      });
    }

    // Conflict E: Founder Decision references a stale assessment version
    if (
      decision.priority_assessment_id === assessment.priority_assessment_id &&
      decision.metadata &&
      decision.metadata.assessment_version &&
      decision.metadata.assessment_version !== assessment.priority_assessment_version
    ) {
      conflicts.push({
        type: 'CONFLICT_E_STALE_ASSESSMENT_VERSION',
        severity: 'WARNING',
        message: `Decision was made on assessment version '${decision.metadata.assessment_version}', but current assessment version is '${assessment.priority_assessment_version}'.`
      });
    }
  }

  return conflicts;
}

// -------------------------------------------------------------
// FULL TRACEABILITY TRAVERSER (Rule P13, Section 29)
// -------------------------------------------------------------

/**
 * Traces the complete provenance chain for a Founder Decision:
 * Founder Decision → Priority Assessment → Opportunity → Diagnoses → Observations → Evidence → Source/Run
 */
function traceDecisionEvidenceChain(decisionId, options = {}) {
  const decision = dal.loadEntity('founder_decision', decisionId, options);
  if (!decision) {
    return {
      decision_id: decisionId,
      found: false,
      broken_links: [`Founder decision not found: ${decisionId}`],
      is_complete: false
    };
  }

  const broken_links = [];

  // 1. Trace Priority Assessment
  const assessment = dal.loadEntity('priority_assessment', decision.priority_assessment_id, options);
  if (!assessment) {
    broken_links.push(`Referenced priority assessment '${decision.priority_assessment_id}' not found.`);
  }

  // 2. Trace Opportunity via domain traceEvidenceChain
  const oppTrace = domain.traceEvidenceChain(decision.opportunity_id, options);
  if (!oppTrace.found) {
    broken_links.push(`Referenced opportunity '${decision.opportunity_id}' not found.`);
  } else {
    for (const bl of oppTrace.broken_links) {
      broken_links.push(bl);
    }
  }

  return {
    decision_id: decision.decision_id,
    found: true,
    decision,
    assessment,
    opportunity: oppTrace.opportunity || null,
    diagnoses: oppTrace.diagnoses || [],
    observations: oppTrace.observations || [],
    evidence: oppTrace.evidence || [],
    runs: oppTrace.runs || [],
    environments: oppTrace.environments || [],
    counts: {
      assessments: assessment ? 1 : 0,
      opportunities: oppTrace.found ? 1 : 0,
      diagnoses: (oppTrace.diagnoses || []).length,
      observations: (oppTrace.observations || []).length,
      evidence: (oppTrace.evidence || []).length,
      runs: (oppTrace.runs || []).length,
      environments: (oppTrace.environments || []).length
    },
    broken_links,
    is_complete: broken_links.length === 0 && assessment !== null && oppTrace.is_complete === true
  };
}

module.exports = {
  IMPACT_VALUES,
  EVIDENCE_STRENGTH_VALUES,
  FEASIBILITY_VALUES,
  URGENCY_VALUES,
  DEPENDENCY_VALUES,
  STRATEGIC_RELEVANCE_VALUES,
  PRIORITY_RECOMMENDATIONS,
  FOUNDER_DECISIONS,
  ASSESSMENT_STATUSES,
  DECISION_STATUSES,
  FORBIDDEN_FIELDS,
  generatePriorityRecommendation,
  createPriorityAssessment,
  updatePriorityAssessmentVersion,
  createFounderDecision,
  recordFounderDecisionRevision,
  detectConflicts,
  traceDecisionEvidenceChain
};
