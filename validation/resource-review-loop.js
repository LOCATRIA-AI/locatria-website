/**
 * LOCATRIA Resource Review & Improvement Loop Engine v1.0
 * GDBS OS — Module 07 / Chapter 01 / Sprint A.4.5
 *
 * Implements the continuous improvement lifecycle connecting:
 * Measurement -> Signal / Trigger -> Diagnosis -> Human Review -> Decision -> Implementation -> Re-measurement
 *
 * Enforces strict governance boundaries:
 * - Measurement signals create review candidates, never automatic editorial alterations.
 * - AI may diagnose and propose; only authorized human leadership (Founder) decides.
 * - Commercial performance is completely decoupled from recommendation quality.
 * - History and audit records are immutably preserved.
 */

'use strict';

const path = require('path');
const fs = require('fs');

const REVIEW_TRIGGERS = {
  SCHEDULED: 'SCHEDULED',
  PRICE_CHANGE: 'PRICE_CHANGE',
  FEATURE_CHANGE: 'FEATURE_CHANGE',
  AFFILIATE_CHANGE: 'AFFILIATE_CHANGE',
  USER_FEEDBACK: 'USER_FEEDBACK',
  POLICY_CHANGE: 'POLICY_CHANGE',
  SOURCE_CHANGE: 'SOURCE_CHANGE',
  OTHER: 'OTHER'
};

const MEASUREMENT_SIGNALS = {
  HIGH_ENGAGEMENT_SIGNAL: 'HIGH_ENGAGEMENT_SIGNAL',
  LOW_ENGAGEMENT_SIGNAL: 'LOW_ENGAGEMENT_SIGNAL',
  STRONG_USER_ACTION_SIGNAL: 'STRONG_USER_ACTION_SIGNAL',
  WEAK_USER_ACTION_SIGNAL: 'WEAK_USER_ACTION_SIGNAL',
  COMMERCIAL_ACTIVITY: 'COMMERCIAL_ACTIVITY',
  INSUFFICIENT_DATA: 'INSUFFICIENT_DATA'
};

const REVIEW_TYPES = {
  CONTENT_REVIEW: 'CONTENT_REVIEW',
  TOOL_REVIEW: 'TOOL_REVIEW',
  COMMERCIAL_REVIEW: 'COMMERCIAL_REVIEW',
  GOVERNANCE_REVIEW: 'GOVERNANCE_REVIEW',
  PERFORMANCE_REVIEW: 'PERFORMANCE_REVIEW',
  COMPREHENSIVE_REVIEW: 'COMPREHENSIVE_REVIEW'
};

const CANDIDATE_STATUSES = {
  OPEN: 'OPEN',
  IN_REVIEW: 'IN_REVIEW',
  DECISION_REQUIRED: 'DECISION_REQUIRED',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  DISMISSED: 'DISMISSED'
};

const CANDIDATE_SEVERITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

const DECISION_OUTCOMES = {
  NO_ACTION: 'NO_ACTION',
  MONITOR: 'MONITOR',
  UPDATE: 'UPDATE',
  DOWNGRADE: 'DOWNGRADE',
  RETIRE: 'RETIRE',
  RE_EVALUATE: 'RE_EVALUATE',
  RESEARCH_MORE: 'RESEARCH_MORE',
  COMMERCIAL_UPDATE: 'COMMERCIAL_UPDATE'
};

/**
 * Creates a validated Review Candidate object from an incoming trigger or measurement signal.
 */
function createReviewCandidate(params = {}) {
  const candidate = {
    review_candidate_id: params.review_candidate_id || `RC-${Date.now().toString(36).toUpperCase()}`,
    resource_id: params.resource_id || null,
    tool_id: params.tool_id || null,
    trigger: params.trigger || null,
    detected_at: params.detected_at || new Date().toISOString().slice(0, 10),
    source: params.source || 'SYSTEM_MONITOR',
    signal: params.signal || null,
    severity: params.severity || CANDIDATE_SEVERITIES.MEDIUM,
    reason: params.reason || '',
    evidence_refs: Array.isArray(params.evidence_refs) ? params.evidence_refs : [],
    measurement_refs: Array.isArray(params.measurement_refs) ? params.measurement_refs : [],
    proposed_review_type: params.proposed_review_type || REVIEW_TYPES.GOVERNANCE_REVIEW,
    assigned_reviewer: params.assigned_reviewer || null,
    status: params.status || CANDIDATE_STATUSES.OPEN
  };

  const validation = validateReviewCandidate(candidate);
  if (!validation.valid) {
    const err = new Error(`INVALID_REVIEW_CANDIDATE: ${validation.errors.join('; ')}`);
    err.validationErrors = validation.errors;
    throw err;
  }

  return candidate;
}

/**
 * Validates a Review Candidate structure and field constraints.
 */
function validateReviewCandidate(candidate) {
  const errors = [];

  if (!candidate || typeof candidate !== 'object') {
    return { valid: false, errors: ['Review candidate must be a non-null object.'] };
  }

  // ID pattern
  if (!candidate.review_candidate_id || !/^RC-[A-Za-z0-9_-]+$/.test(candidate.review_candidate_id)) {
    errors.push('Field "review_candidate_id" must match pattern ^RC-[A-Za-z0-9_-]+$.');
  }

  // Must reference at least one target entity: resource_id or tool_id
  if (!candidate.resource_id && !candidate.tool_id) {
    errors.push('Review candidate must reference a "resource_id" and/or "tool_id".');
  }

  // Trigger or Signal required
  if (!candidate.trigger && !candidate.signal) {
    errors.push('Review candidate must specify either a "trigger" or a "signal".');
  }

  // Date format
  if (!candidate.detected_at || !/^\d{4}-\d{2}-\d{2}$/.test(candidate.detected_at)) {
    errors.push('Field "detected_at" must be a valid date in YYYY-MM-DD format.');
  }

  // Severity
  if (candidate.severity && !Object.values(CANDIDATE_SEVERITIES).includes(candidate.severity)) {
    errors.push(`Invalid severity "${candidate.severity}". Must be one of: ${Object.values(CANDIDATE_SEVERITIES).join(', ')}.`);
  }

  // Status
  if (candidate.status && !Object.values(CANDIDATE_STATUSES).includes(candidate.status)) {
    errors.push(`Invalid status "${candidate.status}". Must be one of: ${Object.values(CANDIDATE_STATUSES).join(', ')}.`);
  }

  // Proposed Review Type
  if (candidate.proposed_review_type && !Object.values(REVIEW_TYPES).includes(candidate.proposed_review_type)) {
    errors.push(`Invalid proposed_review_type "${candidate.proposed_review_type}". Must be one of: ${Object.values(REVIEW_TYPES).join(', ')}.`);
  }

  // Substantive reason
  if (!candidate.reason || typeof candidate.reason !== 'string' || candidate.reason.trim().length < 10) {
    errors.push('Field "reason" must provide substantive context (>= 10 characters).');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Executes the 6-question structured AI Diagnosis Framework.
 * Generates a structured diagnosis package for human review.
 */
function diagnoseSignal(signalOrTrigger, context = {}) {
  let whatChanged = '';
  let reliability = 'HIGH';
  let primaryDomain = REVIEW_TYPES.GOVERNANCE_REVIEW;
  let likelyImpact = 'NEGLIGIBLE';
  let proposedAction = DECISION_OUTCOMES.NO_ACTION;

  switch (signalOrTrigger) {
    case REVIEW_TRIGGERS.FEATURE_CHANGE:
      whatChanged = 'Vendor released significant functional or architectural model update.';
      primaryDomain = REVIEW_TYPES.TOOL_REVIEW;
      likelyImpact = 'Potential drift in benchmark capability baseline or instruction fidelity.';
      proposedAction = DECISION_OUTCOMES.RE_EVALUATE;
      break;

    case REVIEW_TRIGGERS.PRICE_CHANGE:
      whatChanged = 'Vendor altered commercial pricing, tiers, or seat minimums.';
      primaryDomain = REVIEW_TYPES.COMMERCIAL_REVIEW;
      likelyImpact = 'Commercial value dimension affected; zero impact on core capability.';
      proposedAction = DECISION_OUTCOMES.COMMERCIAL_UPDATE;
      break;

    case REVIEW_TRIGGERS.AFFILIATE_CHANGE:
      whatChanged = 'Vendor altered affiliate program status, commission schedule, or network link.';
      primaryDomain = REVIEW_TYPES.COMMERCIAL_REVIEW;
      likelyImpact = 'Commercial metadata update required; strictly zero editorial impact.';
      proposedAction = DECISION_OUTCOMES.COMMERCIAL_UPDATE;
      break;

    case MEASUREMENT_SIGNALS.LOW_ENGAGEMENT_SIGNAL:
      whatChanged = 'Resource engagement ratio fell below 20% over recent measurement period.';
      primaryDomain = REVIEW_TYPES.PERFORMANCE_REVIEW;
      likelyImpact = 'Practitioners may bounce due to opening readability or headline-intent mismatch.';
      proposedAction = DECISION_OUTCOMES.UPDATE;
      break;

    case MEASUREMENT_SIGNALS.WEAK_USER_ACTION_SIGNAL:
      whatChanged = 'High reach but zero onward actions toward workflow steps or official tool testing.';
      primaryDomain = REVIEW_TYPES.CONTENT_REVIEW;
      likelyImpact = 'Resource may lack clear next steps, visual checklists, or clear tool links.';
      proposedAction = DECISION_OUTCOMES.UPDATE;
      break;

    case MEASUREMENT_SIGNALS.COMMERCIAL_ACTIVITY:
      whatChanged = 'Outbound commercial affiliate link interaction detected.';
      primaryDomain = REVIEW_TYPES.COMMERCIAL_REVIEW;
      likelyImpact = 'Verify commercial disclosure visibility and ensure zero editorial prominence drift.';
      proposedAction = DECISION_OUTCOMES.MONITOR;
      break;

    case MEASUREMENT_SIGNALS.INSUFFICIENT_DATA:
      whatChanged = 'Initial baseline period; zero or sub-threshold empirical telemetry collected.';
      primaryDomain = REVIEW_TYPES.PERFORMANCE_REVIEW;
      reliability = 'INSUFFICIENT';
      likelyImpact = 'No actionable trend. Maintain status quo.';
      proposedAction = DECISION_OUTCOMES.NO_ACTION;
      break;

    default:
      whatChanged = context.customDetails || 'Ad-hoc trigger or observation received.';
      primaryDomain = REVIEW_TYPES.GOVERNANCE_REVIEW;
      likelyImpact = 'Review required to determine operational necessity.';
      proposedAction = DECISION_OUTCOMES.MONITOR;
      break;
  }

  return {
    signal_or_trigger: signalOrTrigger,
    diagnosis_generated_at: new Date().toISOString().slice(0, 10),
    questions: {
      q1_what_changed: whatChanged,
      q2_is_signal_reliable: reliability,
      q3_supporting_evidence: context.evidenceSummary || 'Pending verification in benchmark dossier',
      q4_primary_domain: primaryDomain,
      q5_likely_impact: likelyImpact,
      q6_proposed_action: proposedAction
    },
    requires_human_approval: true
  };
}

/**
 * Validates a human Decision Record before material actions can be executed.
 * AI is strictly prohibited from approving material editorial changes.
 */
function evaluateDecision(decisionRecord, candidate = null, options = {}) {
  const errors = [];

  if (!decisionRecord || typeof decisionRecord !== 'object') {
    return { valid: false, errors: ['Decision record must be a valid object.'] };
  }

  // Decision outcome check
  if (!decisionRecord.decision || !Object.values(DECISION_OUTCOMES).includes(decisionRecord.decision)) {
    errors.push(`Invalid decision outcome "${decisionRecord.decision}". Must be one of: ${Object.values(DECISION_OUTCOMES).join(', ')}.`);
  }

  // Substantive rationale check
  if (!decisionRecord.rationale || typeof decisionRecord.rationale !== 'string' || decisionRecord.rationale.trim().length < 15) {
    errors.push('Decision requires a substantive rationale (>= 15 characters).');
  }

  // Reviewer identity check (strictly enforces human approval)
  if (!decisionRecord.reviewer || typeof decisionRecord.reviewer !== 'string' || decisionRecord.reviewer.trim().length < 3) {
    errors.push('Decision requires an identified reviewer.');
  } else if (/(?:^|[_\s-])(ai|bot|automated|system)(?:[_\s-]|$)/i.test(decisionRecord.reviewer.trim())) {
    errors.push('GOVERNANCE_VIOLATION: AI/automated bots are strictly prohibited from approving material review decisions.');
  }

  // Date check
  if (!decisionRecord.date || !/^\d{4}-\d{2}-\d{2}$/.test(decisionRecord.date)) {
    errors.push('Decision requires a valid date in YYYY-MM-DD format.');
  }

  // State transition safety check
  const materialChanges = [
    DECISION_OUTCOMES.DOWNGRADE,
    DECISION_OUTCOMES.RETIRE,
    DECISION_OUTCOMES.RE_EVALUATE,
    DECISION_OUTCOMES.UPDATE
  ];

  if (materialChanges.includes(decisionRecord.decision)) {
    if (!decisionRecord.previous_state || !decisionRecord.new_state) {
      errors.push(`Material decision "${decisionRecord.decision}" must record both previous_state and new_state.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Asserts governance decoupling boundaries:
 * - Low traffic cannot automatically cause RETIRE.
 * - Affiliate revenue cannot automatically UPGRADE a recommendation.
 * - Affiliate changes route strictly to COMMERCIAL_REVIEW with zero editorial alteration.
 * - Feature changes route to RE_EVALUATE rather than immediate subjective demotion/promotion.
 */
function assertGovernanceBoundary(triggerOrSignal, proposedDecision) {
  const violations = [];

  // Boundary 1: Low traffic / Low engagement cannot automatically cause RETIRE
  if (triggerOrSignal === MEASUREMENT_SIGNALS.LOW_ENGAGEMENT_SIGNAL && proposedDecision === DECISION_OUTCOMES.RETIRE) {
    violations.push('BOUNDARY_VIOLATION: Low engagement or traffic alone cannot automatically retire a Resource or Tool without evidence of obsolescence or harm.');
  }

  // Boundary 2: Affiliate activity cannot automatically upgrade recommendation
  if (
    (triggerOrSignal === MEASUREMENT_SIGNALS.COMMERCIAL_ACTIVITY || triggerOrSignal === REVIEW_TRIGGERS.AFFILIATE_CHANGE) &&
    proposedDecision === 'UPGRADE_RECOMMENDATION'
  ) {
    violations.push('BOUNDARY_VIOLATION: Commercial performance or affiliate relationships can NEVER automatically upgrade an editorial recommendation.');
  }

  // Boundary 3: Affiliate change must remain strictly in commercial domain
  if (triggerOrSignal === REVIEW_TRIGGERS.AFFILIATE_CHANGE) {
    if (proposedDecision !== DECISION_OUTCOMES.COMMERCIAL_UPDATE && proposedDecision !== DECISION_OUTCOMES.NO_ACTION && proposedDecision !== DECISION_OUTCOMES.MONITOR) {
      violations.push(`BOUNDARY_VIOLATION: AFFILIATE_CHANGE triggers commercial review only. Proposed decision "${proposedDecision}" violates commercial decoupling.`);
    }
  }

  return {
    compliant: violations.length === 0,
    violations
  };
}

/**
 * Preserves review decision history on target entity metadata.
 */
function preserveReviewHistory(targetEntity, decisionRecord) {
  if (!targetEntity) return { updated: false, error: 'Target entity is missing.' };

  const historyEntry = {
    review_date: decisionRecord.date,
    reviewer: decisionRecord.reviewer,
    decision: decisionRecord.decision,
    rationale: decisionRecord.rationale,
    previous_state: decisionRecord.previous_state || null,
    new_state: decisionRecord.new_state || null,
    recorded_at: new Date().toISOString()
  };

  const governance = targetEntity.governance || {};
  const changelog = Array.isArray(governance.history) ? governance.history : [];
  changelog.push(historyEntry);

  governance.last_reviewed = decisionRecord.date;
  governance.reviewer = decisionRecord.reviewer;
  governance.review_status = decisionRecord.decision === DECISION_OUTCOMES.RETIRE ? 'RETIRED' : 'AUDITED';
  governance.history = changelog;

  targetEntity.governance = governance;

  return {
    updated: true,
    historyEntry,
    totalHistoryEntries: changelog.length
  };
}

module.exports = {
  REVIEW_TRIGGERS,
  MEASUREMENT_SIGNALS,
  REVIEW_TYPES,
  CANDIDATE_STATUSES,
  CANDIDATE_SEVERITIES,
  DECISION_OUTCOMES,
  createReviewCandidate,
  validateReviewCandidate,
  diagnoseSignal,
  evaluateDecision,
  assertGovernanceBoundary,
  preserveReviewHistory
};
