/**
 * LOCATRIA Visibility Operating System v1.0
 * Verification & Learning Foundation (M08.2 / BUILD-06)
 *
 * Core Operating Flow:
 *   Action / Experiment (READY_FOR_VERIFICATION)
 *         ↓
 *   Verification (VFY-01..VFY-05)
 *         ↓
 *   Outcome (IMPROVED / NO_CHANGE / DEGRADED / MIXED / UNVERIFIED)
 *         ↓
 *   Hypothesis Result (SUPPORTED / DIRECTIONALLY_SUPPORTED / NOT_SUPPORTED / INCONCLUSIVE / INVALID)
 *         ↓
 *   Learning (L1..L7, DRAFTED → UNDER_REVIEW → VALIDATED)
 *         ↓
 *   System Rule Candidate (DRAFTED → UNDER_REVIEW → FOUNDER_REVIEW → APPROVED)
 *         ↓
 *   Founder Review & Decision (RETAIN / ITERATE / SCALE / STOP / REQUEST_MORE_EVIDENCE)
 *
 * Strict Architectural Separation (Constraint C-05.1):
 *   Execution Completion ≠ Verification Outcome ≠ Hypothesis Result ≠ Learning ≠ Founder Decision ≠ System Rule
 *   - IMPLEMENTED does NOT mean IMPROVED.
 *   - EXPERIMENT COMPLETED does NOT mean HYPOTHESIS SUPPORTED.
 *   - READY_FOR_VERIFICATION does NOT mean SUCCESS.
 *   - OUTCOME = IMPROVED does NOT mean LEARNING = RETAIN.
 *   - SINGLE EXPERIMENT does NOT generate a permanent System Rule.
 *
 * Invariants & Governance Rules:
 * - V01: Verification requires subject in READY_FOR_VERIFICATION status.
 * - V02: Verification requires an approved Founder Decision (status: DECIDED, decision: APPROVE).
 * - V03: Verification requires empirical evidence. Outcome without evidence = UNVERIFIED.
 * - V04: No automatic conversion of IMPROVED into SUPPORTED.
 * - V05: No post-hoc hypothesis creation. Hypotheses must be defined ex-ante.
 * - V06: Baseline, environment, prompt set, and protocol integrity must be strictly preserved.
 * - V07: Protocol deviations must be recorded explicitly with deviation_reason.
 * - V08: Learning requires at least one source verification in VERIFIED status and supporting evidence.
 * - V09: System Rule Candidate requires at least one validated Learning and explicit Founder Review.
 * - V10: AI authority restriction: AI_ADVISOR cannot finalize Verification, validate Learning, or approve System Rules.
 * - V11: Immutability: Finalized Verifications (VERIFIED), Validated Learnings (VALIDATED), and Approved Candidates (APPROVED) are immutable.
 * - V12: Tolerance = 0 for composite scores, outcome scores, or hidden ranking.
 */

'use strict';

const dal = require('../visibility-data');

// -------------------------------------------------------------
// CONSTANTS & ENUMS
// -------------------------------------------------------------

const VERIFICATION_TYPES = Object.freeze({
  VFY_01: 'VFY-01', // Implementation Verification
  VFY_02: 'VFY-02', // Measurement Integrity Verification
  VFY_03: 'VFY-03', // Outcome Verification
  VFY_04: 'VFY-04', // Hypothesis Verification
  VFY_05: 'VFY-05', // Learning Verification
  IMPLEMENTATION: 'IMPLEMENTATION',
  MEASUREMENT_INTEGRITY: 'MEASUREMENT_INTEGRITY',
  OUTCOME: 'OUTCOME',
  HYPOTHESIS: 'HYPOTHESIS',
  LEARNING: 'LEARNING'
});

const VERIFICATION_STATUSES = Object.freeze({
  DRAFTED: 'DRAFTED',
  READY_FOR_REVIEW: 'READY_FOR_REVIEW',
  UNDER_VERIFICATION: 'UNDER_VERIFICATION',
  VERIFIED: 'VERIFIED',
  NEEDS_MORE_EVIDENCE: 'NEEDS_MORE_EVIDENCE',
  UNVERIFIED: 'UNVERIFIED',
  CANCELLED: 'CANCELLED'
});

const OUTCOMES = Object.freeze({
  IMPROVED: 'IMPROVED',
  NO_CHANGE: 'NO_CHANGE',
  DEGRADED: 'DEGRADED',
  MIXED: 'MIXED',
  UNVERIFIED: 'UNVERIFIED'
});

const HYPOTHESIS_RESULTS = Object.freeze({
  SUPPORTED: 'SUPPORTED',
  DIRECTIONALLY_SUPPORTED: 'DIRECTIONALLY_SUPPORTED',
  NOT_SUPPORTED: 'NOT_SUPPORTED',
  INCONCLUSIVE: 'INCONCLUSIVE',
  INVALID: 'INVALID',
  NOT_APPLICABLE: 'NOT_APPLICABLE'
});

const LEARNING_TYPES = Object.freeze({
  L1: 'L1', // Measurement Learning
  L2: 'L2', // Diagnosis Learning
  L3: 'L3', // Opportunity Learning
  L4: 'L4', // Prioritization Learning
  L5: 'L5', // Action Learning
  L6: 'L6', // Experiment Learning
  L7: 'L7', // System Learning
  MEASUREMENT: 'MEASUREMENT',
  DIAGNOSIS: 'DIAGNOSIS',
  OPPORTUNITY: 'OPPORTUNITY',
  PRIORITIZATION: 'PRIORITIZATION',
  ACTION: 'ACTION',
  EXPERIMENT: 'EXPERIMENT',
  SYSTEM: 'SYSTEM'
});

const LEARNING_STATUSES = Object.freeze({
  DRAFTED: 'DRAFTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  VALIDATED: 'VALIDATED',
  REJECTED: 'REJECTED',
  NEEDS_MORE_EVIDENCE: 'NEEDS_MORE_EVIDENCE'
});

const SYSTEM_RULE_CANDIDATE_STATUSES = Object.freeze({
  DRAFTED: 'DRAFTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  FOUNDER_REVIEW: 'FOUNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  NEEDS_MORE_EVIDENCE: 'NEEDS_MORE_EVIDENCE'
});

const CONFIDENCE_LEVELS = Object.freeze({
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  INSUFFICIENT: 'INSUFFICIENT',
  UNVERIFIED: 'UNVERIFIED'
});

const POST_LEARNING_DECISIONS = Object.freeze({
  RETAIN: 'RETAIN',
  ITERATE: 'ITERATE',
  SCALE: 'SCALE',
  STOP: 'STOP',
  REQUEST_MORE_EVIDENCE: 'REQUEST_MORE_EVIDENCE'
});

const FORBIDDEN_FIELDS = Object.freeze([
  'outcome_score',
  'verification_score',
  'impact_score',
  'learning_score',
  'system_rule_score',
  'composite_score',
  'confidence_score',
  'auto_deployed',
  'auto_promoted',
  'rank',
  'hidden_rank',
  'success_score',
  'automated_execution'
]);

function assertNoForbiddenFields(data, entityName) {
  if (!data || typeof data !== 'object') return;
  for (const field of FORBIDDEN_FIELDS) {
    if (data[field] !== undefined) {
      throw new Error(`GOVERNANCE_ERROR: Field '${field}' is strictly forbidden in ${entityName}. Tolerance = 0 for composite scores, outcome scores, or automated promotions.`);
    }
  }
}

// -------------------------------------------------------------
// VERIFICATION DOMAIN SERVICE
// -------------------------------------------------------------

/**
 * Validates verification preconditions before creation or execution.
 */
function validateVerificationPreconditions(data, options = {}) {
  if (!data.subject_type || !data.subject_id) {
    throw new Error('PRECONDITION_ERROR: Verification requires subject_type and subject_id.');
  }

  const subjectNormType = data.subject_type === 'ACTION' ? 'action' : 'experiment';
  const subject = dal.loadEntity(subjectNormType, data.subject_id, options);
  if (!subject) {
    throw new Error(`RELATIONSHIP_ERROR: Subject '${data.subject_id}' of type '${data.subject_type}' does not exist.`);
  }

  // Precondition: Subject must be READY_FOR_VERIFICATION
  if (subject.status !== 'READY_FOR_VERIFICATION') {
    throw new Error(`GATE_ERROR: Cannot verify subject '${data.subject_id}'. Subject status is '${subject.status}' (must be 'READY_FOR_VERIFICATION').`);
  }

  if (!data.founder_decision_id) {
    throw new Error('PRECONDITION_ERROR: Verification requires founder_decision_id.');
  }
  const dec = dal.loadEntity('founder_decision', data.founder_decision_id, options);
  if (!dec) {
    throw new Error(`RELATIONSHIP_ERROR: Founder Decision '${data.founder_decision_id}' does not exist.`);
  }
  if (dec.status !== 'DECIDED' || dec.decision !== 'APPROVE') {
    throw new Error(`GATE_ERROR: Cannot verify subject. Founder Decision '${data.founder_decision_id}' is '${dec.decision}' (must be 'DECIDED' and 'APPROVE').`);
  }

  if (!Array.isArray(data.evidence_refs) || data.evidence_refs.length === 0) {
    throw new Error('EVIDENCE_ERROR: Verification cannot be created without empirical evidence (evidence_refs is required).');
  }

  if (!data.verification_method || typeof data.verification_method !== 'string' || data.verification_method.trim().length < 5) {
    throw new Error('VALIDATION_ERROR: Verification requires an explicit verification_method (minimum 5 characters).');
  }

  return { passed: true, subject, founder_decision: dec };
}

/**
 * Creates a formal Verification entity under strict M08.2 governance.
 * @param {Object} data
 * @param {Object} [options]
 */
function createVerification(data, options = {}) {
  assertNoForbiddenFields(data, 'verification');
  validateVerificationPreconditions(data, options);

  const verification = {
    entity_type: 'verification',
    schema_version: data.schema_version || '1.0',
    verification_id: data.verification_id || `VFY-${Date.now()}`,
    verification_version: data.verification_version || '1.0',
    subject_type: data.subject_type,
    subject_id: data.subject_id,
    action_id: data.subject_type === 'ACTION' ? data.subject_id : (data.action_id || null),
    experiment_id: data.subject_type === 'EXPERIMENT' ? data.subject_id : (data.experiment_id || null),
    founder_decision_id: data.founder_decision_id,
    verification_type: data.verification_type || VERIFICATION_TYPES.VFY_03,
    baseline_refs: data.baseline_refs || [],
    post_implementation_refs: data.post_implementation_refs || [],
    evidence_refs: data.evidence_refs,
    protocol_version: data.protocol_version || '1.0',
    protocol_deviation: Boolean(data.protocol_deviation),
    deviation_reason: data.deviation_reason || null,
    environment_refs: data.environment_refs || [],
    prompt_set_refs: data.prompt_set_refs || [],
    verification_method: data.verification_method,
    outcome: data.outcome || null,
    hypothesis_result: data.hypothesis_result || null,
    confidence: data.confidence || CONFIDENCE_LEVELS.HIGH,
    status: data.status || VERIFICATION_STATUSES.DRAFTED,
    verifier: data.verifier || null,
    verified_at: data.verified_at || null,
    notes: data.notes || '',
    audit_refs: data.audit_refs || [],
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || null,
    created_by: data.created_by || 'SYSTEM',
    is_immutable: data.status === VERIFICATION_STATUSES.VERIFIED,
    metadata: data.metadata || {}
  };

  return dal.saveEntity('verification', verification, options);
}

/**
 * Valid transitions for Verification lifecycle
 */
const VALID_VERIFICATION_TRANSITIONS = Object.freeze({
  [VERIFICATION_STATUSES.DRAFTED]: [
    VERIFICATION_STATUSES.READY_FOR_REVIEW,
    VERIFICATION_STATUSES.UNDER_VERIFICATION,
    VERIFICATION_STATUSES.UNVERIFIED,
    VERIFICATION_STATUSES.CANCELLED
  ],
  [VERIFICATION_STATUSES.READY_FOR_REVIEW]: [
    VERIFICATION_STATUSES.UNDER_VERIFICATION,
    VERIFICATION_STATUSES.NEEDS_MORE_EVIDENCE,
    VERIFICATION_STATUSES.UNVERIFIED,
    VERIFICATION_STATUSES.CANCELLED
  ],
  [VERIFICATION_STATUSES.UNDER_VERIFICATION]: [
    VERIFICATION_STATUSES.VERIFIED,
    VERIFICATION_STATUSES.NEEDS_MORE_EVIDENCE,
    VERIFICATION_STATUSES.UNVERIFIED,
    VERIFICATION_STATUSES.CANCELLED
  ],
  [VERIFICATION_STATUSES.NEEDS_MORE_EVIDENCE]: [
    VERIFICATION_STATUSES.UNDER_VERIFICATION,
    VERIFICATION_STATUSES.UNVERIFIED,
    VERIFICATION_STATUSES.CANCELLED
  ],
  [VERIFICATION_STATUSES.VERIFIED]: [], // Finalized & Immutable
  [VERIFICATION_STATUSES.UNVERIFIED]: [], // Terminal
  [VERIFICATION_STATUSES.CANCELLED]: []  // Terminal
});

/**
 * Transitions a Verification status with AI authority and immutability checks.
 */
function transitionVerificationStatus(vfyId, targetStatus, context = {}, options = {}) {
  const vfy = dal.loadEntity('verification', vfyId, options);
  if (!vfy) {
    throw new Error(`RELATIONSHIP_ERROR: Verification '${vfyId}' does not exist.`);
  }

  if (vfy.is_immutable || vfy.status === VERIFICATION_STATUSES.VERIFIED) {
    throw new Error(`IMMUTABILITY_ERROR: Verification '${vfyId}' is finalized and cannot be modified.`);
  }

  const actorRole = context.actor_role || (options.session && options.session.actor_role);
  if (actorRole === 'AI_ADVISOR') {
    if (targetStatus === VERIFICATION_STATUSES.VERIFIED || targetStatus === VERIFICATION_STATUSES.CANCELLED) {
      throw new Error(`AUTHORITY_ERROR: AI_ADVISOR cannot finalize Verification '${vfyId}' to '${targetStatus}'. Only Founder or Human Operator can authorize verification finalization.`);
    }
  }

  const allowed = VALID_VERIFICATION_TRANSITIONS[vfy.status] || [];
  if (!allowed.includes(targetStatus)) {
    throw new Error(`TRANSITION_ERROR: Invalid transition for Verification '${vfyId}' from '${vfy.status}' to '${targetStatus}'. Allowed: [${allowed.join(', ')}].`);
  }

  if (targetStatus === VERIFICATION_STATUSES.VERIFIED) {
    if (!vfy.evidence_refs || vfy.evidence_refs.length === 0) {
      throw new Error(`EVIDENCE_ERROR: Cannot finalize Verification '${vfyId}' without supporting empirical evidence.`);
    }
    vfy.is_immutable = true;
    vfy.verified_at = new Date().toISOString();
    vfy.verifier = context.actor || 'HUMAN_OPERATOR';
  }

  vfy.status = targetStatus;
  vfy.updated_at = new Date().toISOString();
  if (context.notes) {
    vfy.notes = vfy.notes ? `${vfy.notes}\n[${vfy.updated_at}] ${context.notes}` : context.notes;
  }

  return dal.saveEntity('verification', vfy, options);
}

// -------------------------------------------------------------
// OUTCOME & HYPOTHESIS EVALUATION ENGINES (Zero Score, Empirical)
// -------------------------------------------------------------

/**
 * Evaluates the observable outcome between baseline and post-implementation evidence.
 * Categorical values: IMPROVED, NO_CHANGE, DEGRADED, MIXED, UNVERIFIED.
 * Does NOT generate a numerical score or composite index.
 * Preserves environment-level distinctions.
 */
function evaluateOutcome(baselineEvidence, postEvidence, context = {}) {
  if (!baselineEvidence || !postEvidence) {
    return {
      outcome: OUTCOMES.UNVERIFIED,
      reason: 'Missing baseline or post-implementation evidence. Inferred outcome is prohibited.',
      environment_breakdown: {}
    };
  }

  const baseEvds = Array.isArray(baselineEvidence) ? baselineEvidence : [baselineEvidence];
  const postEvds = Array.isArray(postEvidence) ? postEvidence : [postEvidence];

  if (baseEvds.length === 0 || postEvds.length === 0) {
    return {
      outcome: OUTCOMES.UNVERIFIED,
      reason: 'Empty baseline or post-implementation evidence sets.',
      environment_breakdown: {}
    };
  }

  const envBreakdown = {};
  let improvedCount = 0;
  let degradedCount = 0;
  let noChangeCount = 0;

  for (const post of postEvds) {
    const envId = post.environment_id || 'UNKNOWN';
    const base = baseEvds.find(b => b.prompt_id === post.prompt_id && (b.environment_id === post.environment_id || !b.environment_id));

    if (!base) {
      envBreakdown[envId] = 'UNVERIFIED_MISSING_BASELINE';
      continue;
    }

    // Compare qualitative or metric signal
    let envOutcome = OUTCOMES.NO_CHANGE;
    if (post.signal_detected === true && base.signal_detected === false) {
      envOutcome = OUTCOMES.IMPROVED;
      improvedCount++;
    } else if (post.signal_detected === false && base.signal_detected === true) {
      envOutcome = OUTCOMES.DEGRADED;
      degradedCount++;
    } else if (post.mention_detected === true && base.mention_detected === false) {
      envOutcome = OUTCOMES.IMPROVED;
      improvedCount++;
    } else if (post.mention_detected === false && base.mention_detected === true) {
      envOutcome = OUTCOMES.DEGRADED;
      degradedCount++;
    } else {
      envOutcome = OUTCOMES.NO_CHANGE;
      noChangeCount++;
    }

    envBreakdown[envId] = envOutcome;
  }

  let finalOutcome = OUTCOMES.NO_CHANGE;
  if (improvedCount > 0 && degradedCount === 0) {
    finalOutcome = OUTCOMES.IMPROVED;
  } else if (degradedCount > 0 && improvedCount === 0) {
    finalOutcome = OUTCOMES.DEGRADED;
  } else if (improvedCount > 0 && degradedCount > 0) {
    finalOutcome = OUTCOMES.MIXED;
  } else if (improvedCount === 0 && degradedCount === 0 && noChangeCount > 0) {
    finalOutcome = OUTCOMES.NO_CHANGE;
  } else {
    finalOutcome = OUTCOMES.UNVERIFIED;
  }

  return {
    outcome: finalOutcome,
    improved_count: improvedCount,
    degraded_count: degradedCount,
    no_change_count: noChangeCount,
    environment_breakdown: envBreakdown,
    evaluator: context.actor || 'SYSTEM'
  };
}

/**
 * Evaluates hypothesis result against observed outcome and evidence.
 * Categorical values: SUPPORTED, DIRECTIONALLY_SUPPORTED, NOT_SUPPORTED, INCONCLUSIVE, INVALID.
 * Invariant: IMPROVED does NOT automatically mean SUPPORTED.
 * Predefined hypothesis must exist ex-ante.
 */
function evaluateHypothesisResult(hypothesisStatement, outcome, evidenceDetails = {}, context = {}) {
  if (!hypothesisStatement || typeof hypothesisStatement !== 'string' || hypothesisStatement.trim().length < 10) {
    throw new Error('HYPOTHESIS_ERROR: Hypothesis statement must be defined ex-ante (minimum 10 characters). Post-hoc hypothesis creation is prohibited.');
  }

  if (!outcome || outcome === OUTCOMES.UNVERIFIED) {
    return {
      hypothesis_result: HYPOTHESIS_RESULTS.INCONCLUSIVE,
      rationale: 'Outcome is unverified; insufficient evidence to evaluate hypothesis.',
      confidence: CONFIDENCE_LEVELS.INSUFFICIENT
    };
  }

  // Check if experiment became invalid
  if (evidenceDetails.protocol_deviation && !evidenceDetails.deviation_accounted_for) {
    return {
      hypothesis_result: HYPOTHESIS_RESULTS.INVALID,
      rationale: 'Protocol deviation occurred without adequate methodological accounting.',
      confidence: CONFIDENCE_LEVELS.LOW
    };
  }

  if (outcome === OUTCOMES.IMPROVED) {
    if (evidenceDetails.direct_causal_support === true && evidenceDetails.sample_sufficient === true) {
      return {
        hypothesis_result: HYPOTHESIS_RESULTS.SUPPORTED,
        rationale: 'Observed improvements across target environments provide sufficient evidence for the predefined hypothesis.',
        confidence: CONFIDENCE_LEVELS.HIGH
      };
    }
    return {
      hypothesis_result: HYPOTHESIS_RESULTS.DIRECTIONALLY_SUPPORTED,
      rationale: 'Observed improvements are directionally aligned with hypothesis, but sample or confounder controls require further validation.',
      confidence: CONFIDENCE_LEVELS.MEDIUM
    };
  }

  if (outcome === OUTCOMES.DEGRADED || outcome === OUTCOMES.NO_CHANGE) {
    return {
      hypothesis_result: HYPOTHESIS_RESULTS.NOT_SUPPORTED,
      rationale: `Predefined hypothesis predicted positive effect, but observed outcome was '${outcome}'.`,
      confidence: CONFIDENCE_LEVELS.HIGH
    };
  }

  if (outcome === OUTCOMES.MIXED) {
    return {
      hypothesis_result: HYPOTHESIS_RESULTS.INCONCLUSIVE,
      rationale: 'Observed mixed outcome across environments indicates divergent or contradictory effects.',
      confidence: CONFIDENCE_LEVELS.LOW
    };
  }

  return {
    hypothesis_result: HYPOTHESIS_RESULTS.INCONCLUSIVE,
    rationale: 'Evidence is insufficient or conflicting.',
    confidence: CONFIDENCE_LEVELS.INSUFFICIENT
  };
}

// -------------------------------------------------------------
// LEARNING DOMAIN SERVICE
// -------------------------------------------------------------

/**
 * Creates a validated Learning entity derived strictly from verified evidence.
 */
function createLearning(data, options = {}) {
  assertNoForbiddenFields(data, 'learning');

  if (!Array.isArray(data.source_verification_refs) || data.source_verification_refs.length === 0) {
    throw new Error('EVIDENCE_ERROR: Learning requires at least one source_verification_ref. Learning cannot be created directly from unverified opportunities or actions.');
  }

  for (const vfyId of data.source_verification_refs) {
    const vfy = dal.loadEntity('verification', vfyId, options);
    if (!vfy) {
      throw new Error(`RELATIONSHIP_ERROR: Source verification '${vfyId}' does not exist.`);
    }
    if (vfy.status !== VERIFICATION_STATUSES.VERIFIED) {
      throw new Error(`GATE_ERROR: Cannot create Learning from unverified record '${vfyId}'. Verification status is '${vfy.status}' (must be 'VERIFIED').`);
    }
  }

  if (!Array.isArray(data.evidence_refs) || data.evidence_refs.length === 0) {
    throw new Error('EVIDENCE_ERROR: Learning requires supporting evidence_refs.');
  }

  for (const evdId of data.evidence_refs) {
    const evd = dal.loadEntity('visibility_evidence', evdId, options);
    if (!evd) {
      throw new Error(`RELATIONSHIP_ERROR: Referenced evidence '${evdId}' does not exist.`);
    }
  }

  if (!data.statement || typeof data.statement !== 'string' || data.statement.trim().length < 10) {
    throw new Error('VALIDATION_ERROR: Learning statement must be at least 10 characters.');
  }

  if (!data.applicability || typeof data.applicability !== 'string' || data.applicability.trim().length < 5) {
    throw new Error('VALIDATION_ERROR: Documented applicability is required (minimum 5 characters).');
  }

  if (!data.limitations || typeof data.limitations !== 'string' || data.limitations.trim().length < 5) {
    throw new Error('VALIDATION_ERROR: Documented limitations are required (minimum 5 characters).');
  }

  const learning = {
    entity_type: 'learning',
    schema_version: data.schema_version || '1.0',
    learning_id: data.learning_id || `LRN-${Date.now()}`,
    learning_version: data.learning_version || '1.0',
    source_verification_refs: data.source_verification_refs,
    hypothesis_result: data.hypothesis_result || HYPOTHESIS_RESULTS.NOT_APPLICABLE,
    learning_type: data.learning_type || LEARNING_TYPES.L1,
    statement: data.statement,
    evidence_refs: data.evidence_refs,
    confidence: data.confidence || CONFIDENCE_LEVELS.HIGH,
    applicability: data.applicability,
    limitations: data.limitations,
    status: data.status || LEARNING_STATUSES.DRAFTED,
    audit_refs: data.audit_refs || [],
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || null,
    created_by: data.created_by || 'SYSTEM',
    is_immutable: data.status === LEARNING_STATUSES.VALIDATED,
    metadata: data.metadata || {}
  };

  return dal.saveEntity('learning', learning, options);
}

/**
 * Valid transitions for Learning lifecycle
 */
const VALID_LEARNING_TRANSITIONS = Object.freeze({
  [LEARNING_STATUSES.DRAFTED]: [
    LEARNING_STATUSES.UNDER_REVIEW,
    LEARNING_STATUSES.REJECTED,
    LEARNING_STATUSES.NEEDS_MORE_EVIDENCE
  ],
  [LEARNING_STATUSES.UNDER_REVIEW]: [
    LEARNING_STATUSES.VALIDATED,
    LEARNING_STATUSES.REJECTED,
    LEARNING_STATUSES.NEEDS_MORE_EVIDENCE
  ],
  [LEARNING_STATUSES.NEEDS_MORE_EVIDENCE]: [
    LEARNING_STATUSES.UNDER_REVIEW,
    LEARNING_STATUSES.REJECTED
  ],
  [LEARNING_STATUSES.VALIDATED]: [], // Finalized & Immutable
  [LEARNING_STATUSES.REJECTED]: []   // Terminal
});

/**
 * Transitions Learning status under AI governance and immutability controls.
 */
function transitionLearningStatus(lrnId, targetStatus, context = {}, options = {}) {
  const lrn = dal.loadEntity('learning', lrnId, options);
  if (!lrn) {
    throw new Error(`RELATIONSHIP_ERROR: Learning '${lrnId}' does not exist.`);
  }

  if (lrn.is_immutable || lrn.status === LEARNING_STATUSES.VALIDATED) {
    throw new Error(`IMMUTABILITY_ERROR: Learning '${lrnId}' is validated and cannot be modified.`);
  }

  const actorRole = context.actor_role || (options.session && options.session.actor_role);
  if (actorRole === 'AI_ADVISOR') {
    if (targetStatus === LEARNING_STATUSES.VALIDATED || targetStatus === LEARNING_STATUSES.REJECTED) {
      throw new Error(`AUTHORITY_ERROR: AI_ADVISOR cannot validate Learning '${lrnId}'. Only Founder or Human Operator can authorize learning validation.`);
    }
  }

  const allowed = VALID_LEARNING_TRANSITIONS[lrn.status] || [];
  if (!allowed.includes(targetStatus)) {
    throw new Error(`TRANSITION_ERROR: Invalid transition for Learning '${lrnId}' from '${lrn.status}' to '${targetStatus}'. Allowed: [${allowed.join(', ')}].`);
  }

  if (targetStatus === LEARNING_STATUSES.VALIDATED) {
    lrn.is_immutable = true;
  }

  lrn.status = targetStatus;
  lrn.updated_at = new Date().toISOString();

  return dal.saveEntity('learning', lrn, options);
}

// -------------------------------------------------------------
// SYSTEM RULE CANDIDATE DOMAIN SERVICE
// -------------------------------------------------------------

/**
 * Creates a System Rule Candidate from validated Learning.
 * Invariant: System Rule Candidate is NOT automatically a System Rule.
 * Explicit Founder Review and approval is mandatory.
 */
function createSystemRuleCandidate(data, options = {}) {
  assertNoForbiddenFields(data, 'system_rule_candidate');

  if (!Array.isArray(data.source_learning_refs) || data.source_learning_refs.length === 0) {
    throw new Error('EVIDENCE_ERROR: System rule candidate requires at least one source_learning_ref.');
  }

  for (const lrnId of data.source_learning_refs) {
    const lrn = dal.loadEntity('learning', lrnId, options);
    if (!lrn) {
      throw new Error(`RELATIONSHIP_ERROR: Source learning '${lrnId}' does not exist.`);
    }
    if (lrn.status !== LEARNING_STATUSES.VALIDATED) {
      throw new Error(`GATE_ERROR: Cannot create System Rule Candidate from unvalidated learning '${lrnId}' (status is '${lrn.status}', must be 'VALIDATED').`);
    }
  }

  if (!Array.isArray(data.evidence_refs) || data.evidence_refs.length === 0) {
    throw new Error('EVIDENCE_ERROR: System rule candidate requires supporting evidence_refs.');
  }

  for (const evdId of data.evidence_refs) {
    const evd = dal.loadEntity('visibility_evidence', evdId, options);
    if (!evd) {
      throw new Error(`RELATIONSHIP_ERROR: Referenced evidence '${evdId}' does not exist.`);
    }
  }

  if (!data.rule_statement || typeof data.rule_statement !== 'string' || data.rule_statement.trim().length < 10) {
    throw new Error('VALIDATION_ERROR: Rule statement must be at least 10 characters.');
  }

  if (!data.proposed_action || typeof data.proposed_action !== 'string' || data.proposed_action.trim().length < 5) {
    throw new Error('VALIDATION_ERROR: Proposed action must be at least 5 characters.');
  }

  const candidate = {
    entity_type: 'system_rule_candidate',
    schema_version: data.schema_version || '1.0',
    candidate_id: data.candidate_id || `SRC-${Date.now()}`,
    candidate_version: data.candidate_version || '1.0',
    source_learning_refs: data.source_learning_refs,
    rule_statement: data.rule_statement,
    evidence_refs: data.evidence_refs,
    applicability: data.applicability || 'System-wide',
    limitations: data.limitations || 'Subject to environment evolution',
    confidence: data.confidence || CONFIDENCE_LEVELS.HIGH,
    proposed_action: data.proposed_action,
    status: data.status || SYSTEM_RULE_CANDIDATE_STATUSES.DRAFTED,
    founder_review_required: true,
    founder_decision: data.founder_decision || null,
    decision_reason: data.decision_reason || null,
    decided_by: data.decided_by || null,
    decided_at: data.decided_at || null,
    audit_refs: data.audit_refs || [],
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || null,
    created_by: data.created_by || 'SYSTEM',
    is_immutable: data.status === SYSTEM_RULE_CANDIDATE_STATUSES.APPROVED,
    metadata: data.metadata || {}
  };

  return dal.saveEntity('system_rule_candidate', candidate, options);
}

/**
 * Transitions a System Rule Candidate status with strict Founder authorization.
 * AI cannot promote or approve a system rule candidate.
 */
function transitionSystemRuleCandidateStatus(candidateId, targetStatus, context = {}, options = {}) {
  const candidate = dal.loadEntity('system_rule_candidate', candidateId, options);
  if (!candidate) {
    throw new Error(`RELATIONSHIP_ERROR: System Rule Candidate '${candidateId}' does not exist.`);
  }

  const actorRole = context.actor_role || (options.session && options.session.actor_role);
  if (actorRole === 'AI_ADVISOR') {
    throw new Error(`AUTHORITY_ERROR: AI_ADVISOR cannot approve or promote System Rule Candidate '${candidateId}'. Only the Founder can authorize System Rule promotion.`);
  }

  if (candidate.is_immutable || candidate.status === SYSTEM_RULE_CANDIDATE_STATUSES.APPROVED) {
    throw new Error(`IMMUTABILITY_ERROR: System Rule Candidate '${candidateId}' is approved and immutable.`);
  }

  if (targetStatus === SYSTEM_RULE_CANDIDATE_STATUSES.APPROVED) {
    const actor = context.actor || (options.session && options.session.actor);
    if (actor !== 'FOUNDER') {
      throw new Error(`PERMISSION_DENIED: Only Founder can approve System Rule Candidate '${candidateId}'.`);
    }
    if (!context.decision_reason || typeof context.decision_reason !== 'string' || context.decision_reason.trim().length === 0) {
      throw new Error('GOVERNANCE_ERROR: Founder approval of System Rule Candidate requires explicit decision_reason.');
    }
    candidate.founder_decision = 'APPROVE';
    candidate.decided_by = 'FOUNDER';
    candidate.decided_at = new Date().toISOString();
    candidate.decision_reason = context.decision_reason;
    candidate.is_immutable = true;
  }

  candidate.status = targetStatus;
  candidate.updated_at = new Date().toISOString();

  return dal.saveEntity('system_rule_candidate', candidate, options);
}

// -------------------------------------------------------------
// POST-LEARNING FOUNDER DECISION HANDOFF
// -------------------------------------------------------------

/**
 * Validates a proposed post-learning strategic decision recommendation.
 * Prepares recommendation for Founder review without autonomous execution.
 */
function validateFounderLearningDecisionGate(learning, proposedDecision) {
  if (!learning || learning.status !== LEARNING_STATUSES.VALIDATED) {
    throw new Error('GATE_ERROR: Strategic decision handoff requires a VALIDATED Learning.');
  }

  const validDecisions = Object.values(POST_LEARNING_DECISIONS);
  if (!validDecisions.includes(proposedDecision)) {
    throw new Error(`GOVERNANCE_ERROR: Invalid post-learning decision '${proposedDecision}'. Allowed: [${validDecisions.join(', ')}].`);
  }

  return {
    ready_for_founder_review: true,
    learning_id: learning.learning_id,
    proposed_decision: proposedDecision,
    status: 'PENDING_FOUNDER_DECISION'
  };
}

// -------------------------------------------------------------
// FULL EPISTEMIC TRACEABILITY TRAVERSER
// -------------------------------------------------------------

/**
 * Traces the complete epistemic evidence chain for a Learning:
 *   Learning → Verification → Outcome/Hypothesis → Action/Experiment → Founder Decision → Priority Assessment → Opportunity → Diagnoses → Observations → Evidence → Runs
 */
function traceLearningEvidenceChain(learningId, options = {}) {
  const learning = dal.loadEntity('learning', learningId, options);
  if (!learning) {
    throw new Error(`RELATIONSHIP_ERROR: Learning '${learningId}' not found.`);
  }

  const verifications = [];
  const subjects = [];
  const founderDecisions = [];
  const opportunities = [];
  const evidence = [];

  for (const vfyId of (learning.source_verification_refs || [])) {
    const vfy = dal.loadEntity('verification', vfyId, options);
    if (vfy) {
      verifications.push(vfy);

      const subjectType = vfy.subject_type === 'ACTION' ? 'action' : 'experiment';
      const subject = dal.loadEntity(subjectType, vfy.subject_id, options);
      if (subject) subjects.push(subject);

      const dec = dal.loadEntity('founder_decision', vfy.founder_decision_id, options);
      if (dec) founderDecisions.push(dec);
    }
  }

  for (const evdId of (learning.evidence_refs || [])) {
    const evd = dal.loadEntity('visibility_evidence', evdId, options);
    if (evd) evidence.push(evd);
  }

  return {
    learning,
    verifications,
    subjects,
    founder_decisions: founderDecisions,
    evidence,
    epistemic_complete: Boolean(
      learning &&
      verifications.length > 0 &&
      subjects.length > 0 &&
      founderDecisions.length > 0 &&
      evidence.length > 0
    )
  };
}

// -------------------------------------------------------------
// CONFLICT & INTEGRITY DETECTION
// -------------------------------------------------------------

/**
 * Detects conflicts, baseline mismatches, protocol deviations, or governance violations.
 */
function detectVerificationConflicts(verificationOrLearning, options = {}) {
  const conflicts = [];

  if (verificationOrLearning.entity_type === 'verification') {
    const vfy = verificationOrLearning;

    // 1. Precondition check
    const subjectType = vfy.subject_type === 'ACTION' ? 'action' : 'experiment';
    const subject = dal.loadEntity(subjectType, vfy.subject_id, options);
    if (subject && subject.status !== 'READY_FOR_VERIFICATION') {
      conflicts.push({
        conflict_type: 'UNVERIFIED_IMPLEMENTATION',
        description: `Subject '${vfy.subject_id}' is in status '${subject.status}', not 'READY_FOR_VERIFICATION'.`
      });
    }

    // 2. Protocol mismatch check
    if (vfy.protocol_deviation === true && (!vfy.deviation_reason || vfy.deviation_reason.trim().length === 0)) {
      conflicts.push({
        conflict_type: 'UNDECLARED_PROTOCOL_DEVIATION',
        description: `Verification records protocol_deviation=true but lacks deviation_reason.`
      });
    }

    // 3. Contradictory evidence check
    if (vfy.outcome === OUTCOMES.IMPROVED && vfy.hypothesis_result === HYPOTHESIS_RESULTS.NOT_SUPPORTED) {
      conflicts.push({
        conflict_type: 'OUTCOME_HYPOTHESIS_CONTRADICTION',
        description: `Outcome marked as IMPROVED while hypothesis_result is marked as NOT_SUPPORTED.`
      });
    }

    // 4. Missing evidence check
    if ((!vfy.evidence_refs || vfy.evidence_refs.length === 0) && vfy.status === VERIFICATION_STATUSES.VERIFIED) {
      conflicts.push({
        conflict_type: 'MISSING_VERIFICATION_EVIDENCE',
        description: `Verification '${vfy.verification_id}' marked as VERIFIED without evidence.`
      });
    }
  }

  if (verificationOrLearning.entity_type === 'learning') {
    const lrn = verificationOrLearning;
    if (!lrn.source_verification_refs || lrn.source_verification_refs.length === 0) {
      conflicts.push({
        conflict_type: 'LEARNING_WITHOUT_VERIFICATION',
        description: `Learning '${lrn.learning_id}' lacks source verification references.`
      });
    }
  }

  return {
    conflict_detected: conflicts.length > 0,
    conflicts
  };
}

module.exports = {
  // Enums & Constants
  VERIFICATION_TYPES,
  VERIFICATION_STATUSES,
  OUTCOMES,
  HYPOTHESIS_RESULTS,
  LEARNING_TYPES,
  LEARNING_STATUSES,
  SYSTEM_RULE_CANDIDATE_STATUSES,
  CONFIDENCE_LEVELS,
  POST_LEARNING_DECISIONS,
  FORBIDDEN_FIELDS,

  // Validators & Guard Functions
  assertNoForbiddenFields,
  validateVerificationPreconditions,
  validateFounderLearningDecisionGate,

  // Evaluation Engines
  evaluateOutcome,
  evaluateHypothesisResult,

  // Entity Creation
  createVerification,
  createLearning,
  createSystemRuleCandidate,

  // Lifecycle Transitions
  transitionVerificationStatus,
  transitionLearningStatus,
  transitionSystemRuleCandidateStatus,

  // Traceability & Conflict Detection
  traceLearningEvidenceChain,
  detectVerificationConflicts
};
