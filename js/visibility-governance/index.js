/**
 * LOCATRIA Visibility Operating System v1.0
 * Module 08 — Visibility Growth System (M08.2)
 *
 * BUILD-07: Governance, Operating Review & Control Foundation v1.0
 *
 * Governs how the M08.2 Visibility Operating System is:
 * - reviewed
 * - controlled
 * - escalated
 * - audited
 * - approved
 * - changed
 * - monitored
 * - periodically improved
 *
 * Core Principles:
 * - Evidence First
 * - Founder Controlled (Founder = Final Authority)
 * - Auditable & Traceable
 * - Zero Synthetic / Composite Numeric Scores
 * - AI Advisory Only (Cannot approve, change, or decide)
 * - Strict Separation of Execution, Verification, Learning, and System Rules
 */

'use strict';

const dal = require('../visibility-data/index');

// -------------------------------------------------------------
// CONSTANTS & ENUMS
// -------------------------------------------------------------

const GOVERNANCE_LEVELS = Object.freeze({
  G0: 'G0', // INFORMATIONAL (Routine observation)
  G1: 'G1', // OPERATIONAL (Routine SOP handling)
  G2: 'G2', // CONTROLLED (Documented review required)
  G3: 'G3'  // STRATEGIC (Founder approval required)
});

const GOVERNANCE_TYPES = Object.freeze({
  DATA_INTEGRITY: 'DATA_INTEGRITY',
  PROTOCOL_DRIFT: 'PROTOCOL_DRIFT',
  EVIDENCE_ANOMALY: 'EVIDENCE_ANOMALY',
  CONFLICT: 'CONFLICT',
  POLICY_BREACH: 'POLICY_BREACH',
  SECURITY: 'SECURITY',
  OPERATIONAL: 'OPERATIONAL',
  STRATEGIC: 'STRATEGIC'
});

const GOVERNANCE_STATUSES = Object.freeze({
  DETECTED: 'DETECTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  ASSESSED: 'ASSESSED',
  ACTION_REQUIRED: 'ACTION_REQUIRED',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  REJECTED: 'REJECTED'
});

const EXCEPTION_TYPES = Object.freeze({
  EX01: 'EX01', // Protocol Deviation
  EX02: 'EX02', // Measurement Deviation
  EX03: 'EX03', // Environment Deviation
  EX04: 'EX04', // Prompt / Prompt-Set Deviation
  EX05: 'EX05', // Evidence Deviation
  EX06: 'EX06', // Governance Deviation
  EX07: 'EX07'  // System / Architecture Deviation
});

const EXCEPTION_STATUSES = Object.freeze({
  REQUESTED: 'REQUESTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED'
});

const REVIEW_TYPES = Object.freeze({
  MONTHLY_OPERATING: 'MONTHLY_OPERATING',
  QUARTERLY_STRATEGIC: 'QUARTERLY_STRATEGIC'
});

const REVIEW_STATUSES = Object.freeze({
  DRAFTED: 'DRAFTED',
  IN_REVIEW: 'IN_REVIEW',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
});

const CHANGE_TYPES = Object.freeze({
  PROMPT_SET: 'PROMPT_SET',
  PROMPT: 'PROMPT',
  ENVIRONMENT: 'ENVIRONMENT',
  PROTOCOL: 'PROTOCOL',
  METRIC: 'METRIC',
  SCHEMA: 'SCHEMA',
  LIFECYCLE_RULE: 'LIFECYCLE_RULE',
  GOVERNANCE_RULE: 'GOVERNANCE_RULE',
  SYSTEM_RULE: 'SYSTEM_RULE',
  ARCHITECTURE: 'ARCHITECTURE',
  MODULE_BOUNDARY: 'MODULE_BOUNDARY'
});

const CHANGE_STATUSES = Object.freeze({
  DRAFT: 'DRAFT',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  IMPLEMENTED: 'IMPLEMENTED',
  VERIFIED: 'VERIFIED'
});

const SYSTEM_RULE_STATUSES = Object.freeze({
  DRAFT: 'DRAFT',
  FOUNDER_APPROVED: 'FOUNDER_APPROVED',
  ACTIVE: 'ACTIVE',
  RETIRED: 'RETIRED',
  REJECTED: 'REJECTED'
});

const CONTROL_STATES = Object.freeze({
  CONTROL_ACTIVE: 'CONTROL_ACTIVE',
  CONTROL_DEGRADED: 'CONTROL_DEGRADED',
  CONTROL_SUSPENDED: 'CONTROL_SUSPENDED',
  CONTROL_REVIEW_REQUIRED: 'CONTROL_REVIEW_REQUIRED'
});

const CONTROL_GATES = Object.freeze({
  G01: 'G01', // Data Integrity
  G02: 'G02', // Evidence Integrity
  G03: 'G03', // Protocol Integrity
  G04: 'G04', // Environment Integrity
  G05: 'G05', // Governance Integrity
  G06: 'G06', // Founder Decision Integrity
  G07: 'G07', // System Rule Integrity
  G08: 'G08'  // Change Control Integrity
});

const GATE_NAMES = Object.freeze({
  [CONTROL_GATES.G01]: 'Data Integrity',
  [CONTROL_GATES.G02]: 'Evidence Integrity',
  [CONTROL_GATES.G03]: 'Protocol Integrity',
  [CONTROL_GATES.G04]: 'Environment Integrity',
  [CONTROL_GATES.G05]: 'Governance Integrity',
  [CONTROL_GATES.G06]: 'Founder Decision Integrity',
  [CONTROL_GATES.G07]: 'System Rule Integrity',
  [CONTROL_GATES.G08]: 'Change Control Integrity'
});

const FORBIDDEN_FIELDS = Object.freeze([
  'score',
  'composite_score',
  'governance_score',
  'visibility_health_score',
  'ranking',
  'priority_weight',
  'numeric_priority',
  'health_score'
]);

function assertNoForbiddenFields(obj) {
  if (!obj || typeof obj !== 'object') return;
  for (const field of FORBIDDEN_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(obj, field)) {
      throw new Error(`INVARIANT_VIOLATION: Forbidden numeric scoring/ranking field '${field}' detected.`);
    }
  }
}

// -------------------------------------------------------------
// GOVERNANCE ISSUES & LIFECYCLE
// -------------------------------------------------------------

function createGovernanceIssue(data, context = {}, options = {}) {
  assertNoForbiddenFields(data);

  if (!data.issue || typeof data.issue !== 'string' || data.issue.trim().length < 5) {
    throw new Error('VALIDATION_ERROR: Governance issue requires a descriptive issue statement (min 5 chars).');
  }

  const issueId = data.governance_id || `GOV-${Date.now()}`;
  const govLevel = data.governance_level || GOVERNANCE_LEVELS.G1;

  const issue = {
    entity_type: 'governance_issue',
    schema_version: data.schema_version || '1.0',
    governance_id: issueId,
    governance_version: data.governance_version || '1.0',
    governance_type: data.governance_type || GOVERNANCE_TYPES.OPERATIONAL,
    governance_level: govLevel,
    subject_type: data.subject_type || 'SYSTEM',
    subject_id: data.subject_id || 'SYSTEM',
    issue: data.issue,
    evidence_refs: data.evidence_refs || [],
    related_run_refs: data.related_run_refs || [],
    related_opportunity_refs: data.related_opportunity_refs || [],
    related_decision_refs: data.related_decision_refs || [],
    current_state: data.current_state || 'DETECTED',
    required_action: data.required_action || 'Review and assess impact.',
    owner: data.owner || context.actor || 'OPERATOR',
    status: data.status || GOVERNANCE_STATUSES.DETECTED,
    resolution: data.resolution || null,
    resolved_by: data.resolved_by || null,
    founder_review_required: govLevel === GOVERNANCE_LEVELS.G3 || data.founder_review_required === true,
    founder_decision_ref: data.founder_decision_ref || null,
    audit_refs: data.audit_refs || [],
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || null,
    resolved_at: data.resolved_at || null,
    created_by: data.created_by || context.actor || 'SYSTEM',
    is_immutable: data.status === GOVERNANCE_STATUSES.CLOSED,
    metadata: data.metadata || {}
  };

  return dal.saveEntity('governance_issue', issue, options);
}

function transitionGovernanceStatus(issueId, targetStatus, context = {}, options = {}) {
  const issue = dal.loadEntity('governance_issue', issueId, options);
  if (!issue) {
    throw new Error(`RELATIONSHIP_ERROR: Governance Issue '${issueId}' does not exist.`);
  }

  if (issue.is_immutable || issue.status === GOVERNANCE_STATUSES.CLOSED) {
    throw new Error(`IMMUTABILITY_ERROR: Governance Issue '${issueId}' is closed and immutable.`);
  }

  const actorRole = context.actor_role || (options.session && options.session.actor_role);
  if (actorRole === 'AI_ADVISOR') {
    if (context.governance_level && context.governance_level !== issue.governance_level) {
      throw new Error(`AUTHORITY_ERROR: AI_ADVISOR cannot change governance levels.`);
    }
    if (targetStatus === GOVERNANCE_STATUSES.CLOSED || targetStatus === GOVERNANCE_STATUSES.RESOLVED) {
      if (issue.governance_level === GOVERNANCE_LEVELS.G2 || issue.governance_level === GOVERNANCE_LEVELS.G3) {
        throw new Error(`AUTHORITY_ERROR: AI_ADVISOR cannot resolve or close G2 or G3 governance issue '${issueId}'. Requires Human Operator or Founder.`);
      }
    }
  }

  if (targetStatus === GOVERNANCE_STATUSES.CLOSED || targetStatus === GOVERNANCE_STATUSES.RESOLVED) {
    if (!context.resolution || typeof context.resolution !== 'string' || context.resolution.trim().length === 0) {
      throw new Error(`GOVERNANCE_ERROR: Cannot transition governance issue '${issueId}' to '${targetStatus}' without explicit resolution record.`);
    }
    issue.resolution = context.resolution;
    issue.resolved_by = context.actor || 'OPERATOR';
    issue.resolved_at = new Date().toISOString();
  }

  if (context.governance_level) {
    issue.governance_level = context.governance_level;
    if (context.governance_level === GOVERNANCE_LEVELS.G3) {
      issue.founder_review_required = true;
    }
  }

  issue.status = targetStatus;
  issue.updated_at = new Date().toISOString();
  if (targetStatus === GOVERNANCE_STATUSES.CLOSED) {
    issue.is_immutable = true;
  }

  return dal.saveEntity('governance_issue', issue, options);
}

// -------------------------------------------------------------
// EXCEPTION GOVERNANCE
// -------------------------------------------------------------

function createException(data, context = {}, options = {}) {
  assertNoForbiddenFields(data);

  if (!data.deviation || data.deviation.trim().length < 5) {
    throw new Error('VALIDATION_ERROR: Exception requires an explicit deviation statement (min 5 chars).');
  }
  if (!data.reason || data.reason.trim().length < 5) {
    throw new Error('VALIDATION_ERROR: Exception requires an explicit reason (min 5 chars).');
  }
  if (!data.impact || data.impact.trim().length < 5) {
    throw new Error('VALIDATION_ERROR: Exception requires an impact assessment (min 5 chars).');
  }
  if (!data.mitigation || data.mitigation.trim().length < 5) {
    throw new Error('VALIDATION_ERROR: Exception requires an explicit mitigation plan (min 5 chars).');
  }

  const exceptionId = data.exception_id || `EXC-${Date.now()}`;

  const exception = {
    entity_type: 'governance_exception',
    schema_version: data.schema_version || '1.0',
    exception_id: exceptionId,
    exception_version: data.exception_version || '1.0',
    exception_type: data.exception_type || EXCEPTION_TYPES.EX01,
    subject_type: data.subject_type || 'SYSTEM',
    subject_id: data.subject_id || 'SYSTEM',
    rule_reference: data.rule_reference || 'STANDARD_OPERATING_PROCEDURE',
    deviation: data.deviation,
    reason: data.reason,
    impact: data.impact,
    mitigation: data.mitigation,
    expiry_date: data.expiry_date || new Date(Date.now() + 30 * 86400000).toISOString(),
    requested_by: data.requested_by || context.actor || 'OPERATOR',
    approved_by: null,
    approved_at: null,
    decision_reason: null,
    status: EXCEPTION_STATUSES.REQUESTED,
    audit_refs: data.audit_refs || [],
    created_at: data.created_at || new Date().toISOString(),
    updated_at: null,
    is_immutable: false,
    metadata: data.metadata || {}
  };

  return dal.saveEntity('governance_exception', exception, options);
}

function approveException(exceptionId, context = {}, options = {}) {
  const actorRole = context.actor_role || (options.session && options.session.actor_role);
  if (actorRole === 'AI_ADVISOR') {
    throw new Error(`AUTHORITY_ERROR: AI_ADVISOR cannot approve governance exceptions. Only Founder can authorize exceptions.`);
  }

  const actor = context.actor || (options.session && options.session.actor);
  if (actor !== 'FOUNDER') {
    throw new Error(`PERMISSION_DENIED: Only Founder can approve governance exceptions.`);
  }

  const exception = dal.loadEntity('governance_exception', exceptionId, options);
  if (!exception) {
    throw new Error(`RELATIONSHIP_ERROR: Governance Exception '${exceptionId}' does not exist.`);
  }

  if (exception.is_immutable || exception.status === EXCEPTION_STATUSES.APPROVED) {
    throw new Error(`IMMUTABILITY_ERROR: Exception '${exceptionId}' is already approved and immutable.`);
  }

  if (!context.decision_reason || typeof context.decision_reason !== 'string' || context.decision_reason.trim().length === 0) {
    throw new Error('GOVERNANCE_ERROR: Approving an exception requires explicit decision_reason.');
  }

  exception.status = EXCEPTION_STATUSES.APPROVED;
  exception.approved_by = 'FOUNDER';
  exception.approved_at = new Date().toISOString();
  exception.decision_reason = context.decision_reason;
  exception.is_immutable = true;
  exception.updated_at = new Date().toISOString();

  return dal.saveEntity('governance_exception', exception, options);
}

function expireException(exceptionId, context = {}, options = {}) {
  const exception = dal.loadEntity('governance_exception', exceptionId, options);
  if (!exception) {
    throw new Error(`RELATIONSHIP_ERROR: Governance Exception '${exceptionId}' does not exist.`);
  }

  if (exception.status === EXCEPTION_STATUSES.EXPIRED) {
    return exception;
  }

  // Allow expiring even if previously approved
  exception.status = EXCEPTION_STATUSES.EXPIRED;
  exception.is_immutable = true;
  exception.updated_at = new Date().toISOString();

  return dal.saveEntity('governance_exception', exception, { ...options, allowStatusUpdate: true });
}

// -------------------------------------------------------------
// OPERATING REVIEW (MONTHLY & QUARTERLY)
// -------------------------------------------------------------

function createReview(data, context = {}, options = {}) {
  assertNoForbiddenFields(data);

  const reviewId = data.review_id || `REV-${Date.now()}`;
  const review = {
    entity_type: 'operating_review',
    schema_version: data.schema_version || '1.0',
    review_id: reviewId,
    review_version: data.review_version || '1.0',
    review_type: data.review_type || REVIEW_TYPES.MONTHLY_OPERATING,
    period_start: data.period_start || new Date(Date.now() - 30 * 86400000).toISOString(),
    period_end: data.period_end || new Date().toISOString(),
    subjects: data.subjects || [],
    evidence_refs: data.evidence_refs || [],
    issues: data.issues || [],
    decisions_required: data.decisions_required || [],
    recommendations: data.recommendations || [],
    founder_decisions: data.founder_decisions || [],
    exceptions: data.exceptions || [],
    system_rule_candidates: data.system_rule_candidates || [],
    status: data.status || REVIEW_STATUSES.DRAFTED,
    owner: data.owner || context.actor || 'OPERATOR',
    summary: data.summary || '',
    audit_refs: data.audit_refs || [],
    created_at: data.created_at || new Date().toISOString(),
    completed_at: data.completed_at || null,
    is_immutable: data.status === REVIEW_STATUSES.COMPLETED,
    metadata: data.metadata || {}
  };

  return dal.saveEntity('operating_review', review, options);
}

function prepareMonthlyOperatingReview(periodStart, periodEnd, options = {}) {
  const issues = dal.listGovernanceIssues(options);
  const exceptions = dal.listExceptions(options);
  const changeRequests = dal.listChangeRequests(options);
  const decisions = dal.listFounderDecisions(options);
  const candidates = dal.listSystemRuleCandidates(options);
  const rules = dal.listSystemRules(options);
  const runs = dal.listRuns(options);

  const openIssues = issues.filter(i => i.status !== GOVERNANCE_STATUSES.CLOSED && i.status !== GOVERNANCE_STATUSES.RESOLVED);
  const openExceptions = exceptions.filter(e => e.status === EXCEPTION_STATUSES.REQUESTED || e.status === EXCEPTION_STATUSES.UNDER_REVIEW);
  const pendingDecisions = decisions.filter(d => d.status === 'PENDING_REVIEW');
  const openChangeRequests = changeRequests.filter(c => c.status === CHANGE_STATUSES.DRAFT || c.status === CHANGE_STATUSES.UNDER_REVIEW);

  return {
    review_type: REVIEW_TYPES.MONTHLY_OPERATING,
    period_start: periodStart,
    period_end: periodEnd,
    activity_summary: {
      total_runs: runs.length,
      open_governance_issues: openIssues.length,
      open_exceptions: openExceptions.length,
      open_change_requests: openChangeRequests.length,
      pending_founder_decisions: pendingDecisions.length,
      active_system_rules: rules.filter(r => r.status === SYSTEM_RULE_STATUSES.ACTIVE).length,
      system_rule_candidates_under_review: candidates.filter(c => c.status === 'UNDER_REVIEW' || c.status === 'FOUNDER_REVIEW').length
    },
    issues_for_review: openIssues.map(i => i.governance_id),
    exceptions_for_review: openExceptions.map(e => e.exception_id),
    change_requests_for_review: openChangeRequests.map(c => c.change_request_id),
    decisions_required: pendingDecisions.map(d => ({
      decision_topic: `Founder Decision on Opportunity ${d.opportunity_id}`,
      recommended_action: d.recommendation,
      founder_decision: null
    })),
    status: REVIEW_STATUSES.DRAFTED,
    prepared_at: new Date().toISOString()
  };
}

function prepareQuarterlyStrategicReview(periodStart, periodEnd, options = {}) {
  const learnings = dal.listLearnings(options);
  const candidates = dal.listSystemRuleCandidates(options);
  const rules = dal.listSystemRules(options);
  const exceptions = dal.listExceptions(options);
  const changeRequests = dal.listChangeRequests(options);

  return {
    review_type: REVIEW_TYPES.QUARTERLY_STRATEGIC,
    period_start: periodStart,
    period_end: periodEnd,
    strategic_agenda: {
      validated_learnings_count: learnings.filter(l => l.status === 'VALIDATED').length,
      system_rule_candidates: candidates.map(c => ({
        candidate_id: c.candidate_id,
        rule_statement: c.rule_statement,
        status: c.status
      })),
      active_system_rules: rules.filter(r => r.status === SYSTEM_RULE_STATUSES.ACTIVE).map(r => r.system_rule_id),
      major_exceptions: exceptions.filter(e => e.exception_type === EXCEPTION_TYPES.EX01 || e.exception_type === EXCEPTION_TYPES.EX07).map(e => e.exception_id),
      strategic_change_requests: changeRequests.filter(c => c.change_type === CHANGE_TYPES.ARCHITECTURE || c.change_type === CHANGE_TYPES.PROTOCOL).map(c => c.change_request_id)
    },
    options_for_founder: [
      'RETAIN',
      'ITERATE',
      'SCALE',
      'STOP',
      'REQUEST_MORE_EVIDENCE'
    ],
    status: REVIEW_STATUSES.DRAFTED,
    prepared_at: new Date().toISOString()
  };
}

function completeReview(reviewId, context = {}, options = {}) {
  const review = dal.loadEntity('operating_review', reviewId, options);
  if (!review) {
    throw new Error(`RELATIONSHIP_ERROR: Operating Review '${reviewId}' does not exist.`);
  }

  if (review.is_immutable || review.status === REVIEW_STATUSES.COMPLETED) {
    throw new Error(`IMMUTABILITY_ERROR: Operating Review '${reviewId}' is already completed and immutable.`);
  }

  review.status = REVIEW_STATUSES.COMPLETED;
  review.completed_at = new Date().toISOString();
  review.is_immutable = true;

  return dal.saveEntity('operating_review', review, options);
}

// -------------------------------------------------------------
// CHANGE CONTROL
// -------------------------------------------------------------

function createChangeRequest(data, context = {}, options = {}) {
  assertNoForbiddenFields(data);

  if (!data.reason || data.reason.trim().length < 5) {
    throw new Error('VALIDATION_ERROR: Change Request requires an explicit reason (min 5 chars).');
  }
  if (!data.impact || data.impact.trim().length < 5) {
    throw new Error('VALIDATION_ERROR: Change Request requires an impact assessment (min 5 chars).');
  }
  if (!data.risk || data.risk.trim().length < 5) {
    throw new Error('VALIDATION_ERROR: Change Request requires a risk assessment (min 5 chars).');
  }
  if (!data.rollback || data.rollback.trim().length < 5) {
    throw new Error('VALIDATION_ERROR: Change Request requires a rollback plan (min 5 chars).');
  }

  const changeId = data.change_request_id || `CR-${Date.now()}`;

  const cr = {
    entity_type: 'change_request',
    schema_version: data.schema_version || '1.0',
    change_request_id: changeId,
    change_request_version: data.change_request_version || '1.0',
    change_type: data.change_type || CHANGE_TYPES.PROTOCOL,
    target: data.target || 'General System',
    current_state: data.current_state || 'Current baseline',
    proposed_change: data.proposed_change,
    reason: data.reason,
    evidence_refs: data.evidence_refs || [],
    impact: data.impact,
    risk: data.risk,
    rollback: data.rollback,
    requested_by: data.requested_by || context.actor || 'OPERATOR',
    reviewed_by: null,
    approved_by: null,
    approved_at: null,
    decision_reason: null,
    status: data.status || CHANGE_STATUSES.DRAFT,
    effective_version: data.effective_version || null,
    audit_refs: data.audit_refs || [],
    created_at: data.created_at || new Date().toISOString(),
    updated_at: null,
    is_immutable: false,
    metadata: data.metadata || {}
  };

  return dal.saveEntity('change_request', cr, options);
}

function approveChangeRequest(changeRequestId, context = {}, options = {}) {
  const actorRole = context.actor_role || (options.session && options.session.actor_role);
  if (actorRole === 'AI_ADVISOR') {
    throw new Error(`AUTHORITY_ERROR: AI_ADVISOR cannot approve Change Requests. Only Founder can authorize change requests.`);
  }

  const actor = context.actor || (options.session && options.session.actor);
  if (actor !== 'FOUNDER') {
    throw new Error(`PERMISSION_DENIED: Only Founder can approve Change Requests.`);
  }

  const cr = dal.loadEntity('change_request', changeRequestId, options);
  if (!cr) {
    throw new Error(`RELATIONSHIP_ERROR: Change Request '${changeRequestId}' does not exist.`);
  }

  if (cr.is_immutable || cr.status === CHANGE_STATUSES.APPROVED) {
    throw new Error(`IMMUTABILITY_ERROR: Change Request '${changeRequestId}' is already approved and immutable.`);
  }

  if (!context.decision_reason || typeof context.decision_reason !== 'string' || context.decision_reason.trim().length === 0) {
    throw new Error('GOVERNANCE_ERROR: Approving a change request requires explicit decision_reason.');
  }

  cr.status = CHANGE_STATUSES.APPROVED;
  cr.approved_by = 'FOUNDER';
  cr.approved_at = new Date().toISOString();
  cr.decision_reason = context.decision_reason;
  cr.effective_version = context.effective_version || '2.0';
  cr.is_immutable = true;
  cr.updated_at = new Date().toISOString();

  return dal.saveEntity('change_request', cr, options);
}

function rejectChangeRequest(changeRequestId, context = {}, options = {}) {
  const cr = dal.loadEntity('change_request', changeRequestId, options);
  if (!cr) {
    throw new Error(`RELATIONSHIP_ERROR: Change Request '${changeRequestId}' does not exist.`);
  }

  cr.status = CHANGE_STATUSES.REJECTED;
  cr.updated_at = new Date().toISOString();
  cr.decision_reason = context.decision_reason || 'Rejected by reviewer';

  return dal.saveEntity('change_request', cr, options);
}

// -------------------------------------------------------------
// SYSTEM RULE GOVERNANCE
// -------------------------------------------------------------

function createSystemRule(data, context = {}, options = {}) {
  assertNoForbiddenFields(data);

  if (!Array.isArray(data.source_learning_refs) || data.source_learning_refs.length === 0) {
    throw new Error('VALIDATION_ERROR: System rule requires at least one source_learning_ref.');
  }
  for (const lrnId of data.source_learning_refs) {
    const lrn = dal.loadEntity('learning', lrnId, options);
    if (!lrn) {
      throw new Error(`RELATIONSHIP_ERROR: Referenced learning '${lrnId}' does not exist.`);
    }
    if (lrn.status !== 'VALIDATED') {
      throw new Error(`GATE_ERROR: Cannot create System Rule. Source learning '${lrnId}' is '${lrn.status}' (must be 'VALIDATED').`);
    }
  }

  if (!Array.isArray(data.evidence_refs) || data.evidence_refs.length === 0) {
    throw new Error('VALIDATION_ERROR: System rule requires at least one evidence_ref.');
  }

  if (!data.rule_statement || data.rule_statement.trim().length < 10) {
    throw new Error('VALIDATION_ERROR: System rule requires a clear rule_statement (min 10 chars).');
  }

  const ruleId = data.system_rule_id || `SR-${Date.now()}`;

  const rule = {
    entity_type: 'system_rule',
    schema_version: data.schema_version || '1.0',
    system_rule_id: ruleId,
    version: data.version || '1.0',
    rule_statement: data.rule_statement,
    source_learning_refs: data.source_learning_refs,
    source_candidate_ref: data.source_candidate_ref || null,
    evidence_refs: data.evidence_refs,
    applicability: data.applicability || 'System-wide',
    limitations: data.limitations || 'Subject to environment evolution',
    effective_from: null,
    effective_until: null,
    status: data.status || SYSTEM_RULE_STATUSES.DRAFT,
    approved_by: null,
    approved_at: null,
    decision_reason: null,
    supersedes: data.supersedes || null,
    audit_refs: data.audit_refs || [],
    created_at: data.created_at || new Date().toISOString(),
    updated_at: null,
    is_immutable: false,
    metadata: data.metadata || {}
  };

  return dal.saveEntity('system_rule', rule, options);
}

function activateSystemRule(ruleId, context = {}, options = {}) {
  const actorRole = context.actor_role || (options.session && options.session.actor_role);
  if (actorRole === 'AI_ADVISOR') {
    throw new Error(`AUTHORITY_ERROR: AI_ADVISOR cannot approve or activate System Rules. Only Founder can authorize System Rule activation.`);
  }

  const actor = context.actor || (options.session && options.session.actor);
  if (actor !== 'FOUNDER') {
    throw new Error(`PERMISSION_DENIED: Only Founder can approve and activate System Rules.`);
  }

  const rule = dal.loadEntity('system_rule', ruleId, options);
  if (!rule) {
    throw new Error(`RELATIONSHIP_ERROR: System Rule '${ruleId}' does not exist.`);
  }

  if (rule.status === SYSTEM_RULE_STATUSES.ACTIVE) {
    return rule;
  }

  if (!context.decision_reason || typeof context.decision_reason !== 'string' || context.decision_reason.trim().length === 0) {
    throw new Error('GOVERNANCE_ERROR: Activating a system rule requires explicit Founder decision_reason.');
  }

  rule.status = SYSTEM_RULE_STATUSES.ACTIVE;
  rule.approved_by = 'FOUNDER';
  rule.approved_at = new Date().toISOString();
  rule.effective_from = new Date().toISOString();
  rule.decision_reason = context.decision_reason;
  rule.is_immutable = true;
  rule.updated_at = new Date().toISOString();

  return dal.saveEntity('system_rule', rule, options);
}

function retireSystemRule(ruleId, context = {}, options = {}) {
  const actorRole = context.actor_role || (options.session && options.session.actor_role);
  if (actorRole === 'AI_ADVISOR') {
    throw new Error(`AUTHORITY_ERROR: AI_ADVISOR cannot retire System Rules. Only Founder can retire System Rules.`);
  }

  const actor = context.actor || (options.session && options.session.actor);
  if (actor !== 'FOUNDER') {
    throw new Error(`PERMISSION_DENIED: Only Founder can retire System Rules.`);
  }

  const rule = dal.loadEntity('system_rule', ruleId, options);
  if (!rule) {
    throw new Error(`RELATIONSHIP_ERROR: System Rule '${ruleId}' does not exist.`);
  }

  rule.status = SYSTEM_RULE_STATUSES.RETIRED;
  rule.effective_until = new Date().toISOString();
  rule.decision_reason = context.decision_reason || 'Retired by Founder';
  rule.is_immutable = true;
  rule.updated_at = new Date().toISOString();

  return dal.saveEntity('system_rule', rule, options);
}

// -------------------------------------------------------------
// CONTROL GATES & CONTROL STATE
// -------------------------------------------------------------

function evaluateControlGate(gateId, options = {}) {
  const gateName = GATE_NAMES[gateId] || gateId;

  if (gateId === CONTROL_GATES.G01) {
    // Data Integrity
    const runs = dal.listRuns(options);
    const psets = dal.listPromptSets(options);
    const prompts = dal.listPrompts(options);

    const hasT1 = runs.some(r => r.run_id === 'RUN-M08-1-T1-REF' && r.status === 'COMPLETED');
    const hasFixed20 = psets.some(p => p.prompt_set_id === 'PSET-M08-1-FIXED20');
    const promptCount = prompts.filter(p => /^P(0[1-9]|1[0-9]|20)$/.test(p.prompt_id)).length;

    if (!hasT1 || !hasFixed20 || promptCount !== 20) {
      return {
        gate_id: gateId,
        gate_name: gateName,
        status: 'FAIL',
        reason: `Canonical baseline corrupted (hasT1=${hasT1}, hasFixed20=${hasFixed20}, promptCount=${promptCount}/20).`,
        evidence_refs: [],
        affected_entities: ['RUN-M08-1-T1-REF', 'PSET-M08-1-FIXED20'],
        required_action: 'Restore canonical historical baseline from audit import.'
      };
    }
    return {
      gate_id: gateId,
      gate_name: gateName,
      status: 'PASS',
      reason: 'Canonical runs, prompt sets, and prompts verified intact.',
      evidence_refs: [],
      affected_entities: [],
      required_action: 'None'
    };
  }

  if (gateId === CONTROL_GATES.G02) {
    // Evidence Integrity
    const evidence = dal.listEvidence(options);
    const t1Evidence = evidence.filter(e => e.evidence_id && e.evidence_id.startsWith('EVD-VIS-T1-'));
    if (t1Evidence.length < 60) {
      return {
        gate_id: gateId,
        gate_name: gateName,
        status: 'FAIL',
        reason: `T1 Evidence count is ${t1Evidence.length} (expected 60).`,
        evidence_refs: t1Evidence.map(e => e.evidence_id),
        affected_entities: ['EVD-VIS-T1'],
        required_action: 'Verify and formalize canonical visibility evidence.'
      };
    }
    return {
      gate_id: gateId,
      gate_name: gateName,
      status: 'PASS',
      reason: 'All 60 canonical T1 evidence records verified intact.',
      evidence_refs: [],
      affected_entities: [],
      required_action: 'None'
    };
  }

  if (gateId === CONTROL_GATES.G03) {
    // Protocol Integrity
    const verifications = dal.listVerifications(options);
    const unrecordedDeviations = verifications.filter(v => v.protocol_deviation === true && (!v.deviation_reason || v.deviation_reason.length === 0));
    if (unrecordedDeviations.length > 0) {
      return {
        gate_id: gateId,
        gate_name: gateName,
        status: 'FAIL',
        reason: `Detected ${unrecordedDeviations.length} verification(s) with unrecorded protocol deviations.`,
        evidence_refs: [],
        affected_entities: unrecordedDeviations.map(v => v.verification_id),
        required_action: 'Record explicit deviation reasons or invalidate affected verification records.'
      };
    }
    return {
      gate_id: gateId,
      gate_name: gateName,
      status: 'PASS',
      reason: 'All verification protocols aligned without unaccounted drift.',
      evidence_refs: [],
      affected_entities: [],
      required_action: 'None'
    };
  }

  if (gateId === CONTROL_GATES.G04) {
    // Environment Integrity
    const envs = dal.listEnvironments(options);
    const requiredEnvs = ['ENV-CHATGPT', 'ENV-GEMINI', 'ENV-PERPLEXITY'];
    const missing = requiredEnvs.filter(id => !envs.some(e => e.environment_id === id));
    if (missing.length > 0) {
      return {
        gate_id: gateId,
        gate_name: gateName,
        status: 'FAIL',
        reason: `Missing canonical environments: ${missing.join(', ')}`,
        evidence_refs: [],
        affected_entities: missing,
        required_action: 'Re-register missing canonical environments.'
      };
    }
    return {
      gate_id: gateId,
      gate_name: gateName,
      status: 'PASS',
      reason: 'Canonical AI environments verified and active.',
      evidence_refs: [],
      affected_entities: [],
      required_action: 'None'
    };
  }

  if (gateId === CONTROL_GATES.G05) {
    // Governance Integrity
    const issues = dal.listGovernanceIssues(options);
    const unresolvedG3 = issues.filter(i => i.governance_level === GOVERNANCE_LEVELS.G3 && i.status !== GOVERNANCE_STATUSES.CLOSED && i.status !== GOVERNANCE_STATUSES.RESOLVED);
    const exceptions = dal.listExceptions(options);
    const now = new Date();
    const expiredActiveExceptions = exceptions.filter(e => e.status === EXCEPTION_STATUSES.APPROVED && new Date(e.expiry_date) < now);

    if (unresolvedG3.length > 0 || expiredActiveExceptions.length > 0) {
      return {
        gate_id: gateId,
        gate_name: gateName,
        status: 'FAIL',
        reason: `Governance breach: ${unresolvedG3.length} unresolved G3 strategic issues, ${expiredActiveExceptions.length} expired exceptions still active.`,
        evidence_refs: [],
        affected_entities: [...unresolvedG3.map(i => i.governance_id), ...expiredActiveExceptions.map(e => e.exception_id)],
        required_action: 'Escalate G3 issues to Founder and expire stale exceptions.'
      };
    }
    return {
      gate_id: gateId,
      gate_name: gateName,
      status: 'PASS',
      reason: 'Governance issues and exceptions within operating limits.',
      evidence_refs: [],
      affected_entities: [],
      required_action: 'None'
    };
  }

  if (gateId === CONTROL_GATES.G06) {
    // Founder Decision Integrity
    const actions = dal.listActions(options);
    const experiments = dal.listExperiments(options);
    const unapprovedExecution = [
      ...actions.filter(a => a.status === 'IN_PROGRESS' || a.status === 'IMPLEMENTED'),
      ...experiments.filter(e => e.status === 'IN_PROGRESS' || e.status === 'IMPLEMENTED')
    ].filter(e => !e.founder_decision_id);

    if (unapprovedExecution.length > 0) {
      return {
        gate_id: gateId,
        gate_name: gateName,
        status: 'FAIL',
        reason: `Detected ${unapprovedExecution.length} action(s)/experiment(s) in execution without Founder Decision.`,
        evidence_refs: [],
        affected_entities: unapprovedExecution.map(e => e.action_id || e.experiment_id),
        required_action: 'Halt unapproved execution immediately.'
      };
    }
    return {
      gate_id: gateId,
      gate_name: gateName,
      status: 'PASS',
      reason: 'All active actions and experiments backed by valid Founder Decisions.',
      evidence_refs: [],
      affected_entities: [],
      required_action: 'None'
    };
  }

  if (gateId === CONTROL_GATES.G07) {
    // System Rule Integrity
    const rules = dal.listSystemRules(options);
    const invalidRules = rules.filter(r => r.status === SYSTEM_RULE_STATUSES.ACTIVE && r.approved_by !== 'FOUNDER');
    if (invalidRules.length > 0) {
      return {
        gate_id: gateId,
        gate_name: gateName,
        status: 'FAIL',
        reason: `Detected ${invalidRules.length} active system rule(s) without Founder approval.`,
        evidence_refs: [],
        affected_entities: invalidRules.map(r => r.system_rule_id),
        required_action: 'Deactivate unapproved system rules immediately.'
      };
    }
    return {
      gate_id: gateId,
      gate_name: gateName,
      status: 'PASS',
      reason: 'All active system rules backed by explicit Founder authorization.',
      evidence_refs: [],
      affected_entities: [],
      required_action: 'None'
    };
  }

  if (gateId === CONTROL_GATES.G08) {
    // Change Control Integrity
    const changeRequests = dal.listChangeRequests(options);
    const implementedUnapproved = changeRequests.filter(c => c.status === CHANGE_STATUSES.IMPLEMENTED && c.approved_by !== 'FOUNDER');
    if (implementedUnapproved.length > 0) {
      return {
        gate_id: gateId,
        gate_name: gateName,
        status: 'FAIL',
        reason: `Detected ${implementedUnapproved.length} change request(s) implemented without Founder approval.`,
        evidence_refs: [],
        affected_entities: implementedUnapproved.map(c => c.change_request_id),
        required_action: 'Roll back unapproved changes and submit for Founder review.'
      };
    }
    return {
      gate_id: gateId,
      gate_name: gateName,
      status: 'PASS',
      reason: 'Change requests conform to governance approval pipeline.',
      evidence_refs: [],
      affected_entities: [],
      required_action: 'None'
    };
  }

  return {
    gate_id: gateId,
    gate_name: gateName,
    status: 'WARN',
    reason: `Unknown gate identifier '${gateId}'.`,
    evidence_refs: [],
    affected_entities: [],
    required_action: 'Check gate configuration.'
  };
}

function calculateControlState(options = {}) {
  const gates = [
    evaluateControlGate(CONTROL_GATES.G01, options),
    evaluateControlGate(CONTROL_GATES.G02, options),
    evaluateControlGate(CONTROL_GATES.G03, options),
    evaluateControlGate(CONTROL_GATES.G04, options),
    evaluateControlGate(CONTROL_GATES.G05, options),
    evaluateControlGate(CONTROL_GATES.G06, options),
    evaluateControlGate(CONTROL_GATES.G07, options),
    evaluateControlGate(CONTROL_GATES.G08, options)
  ];

  const failedGates = gates.filter(g => g.status === 'FAIL');
  const warnGates = gates.filter(g => g.status === 'WARN');

  let state = CONTROL_STATES.CONTROL_ACTIVE;
  const reasons = [];

  if (failedGates.length > 0) {
    // Determine severity
    const hasDataOrProtocolFailure = failedGates.some(g => g.gate_id === CONTROL_GATES.G01 || g.gate_id === CONTROL_GATES.G03);
    const hasGovernanceFailure = failedGates.some(g => g.gate_id === CONTROL_GATES.G05 || g.gate_id === CONTROL_GATES.G06 || g.gate_id === CONTROL_GATES.G07);

    if (hasDataOrProtocolFailure) {
      state = CONTROL_STATES.CONTROL_REVIEW_REQUIRED;
    } else if (hasGovernanceFailure) {
      state = CONTROL_STATES.CONTROL_REVIEW_REQUIRED;
    } else {
      state = CONTROL_STATES.CONTROL_DEGRADED;
    }

    for (const fg of failedGates) {
      reasons.push(`${fg.gate_name} [${fg.gate_id}] FAILED: ${fg.reason}`);
    }
  } else if (warnGates.length > 0) {
    state = CONTROL_STATES.CONTROL_DEGRADED;
    for (const wg of warnGates) {
      reasons.push(`${wg.gate_name} [${wg.gate_id}] WARNING: ${wg.reason}`);
    }
  } else {
    reasons.push('All 8 control gates passed cleanly. System operating in full compliance.');
  }

  const controlSnapshot = {
    entity_type: 'control_state',
    schema_version: '1.0',
    control_state_id: `CS-${Date.now()}`,
    state: state,
    reasons: reasons,
    evaluated_gates: gates,
    timestamp: new Date().toISOString(),
    evaluated_by: options.actor || 'SYSTEM',
    audit_refs: []
  };

  return dal.saveEntity('control_state', controlSnapshot, options);
}

// -------------------------------------------------------------
// CONFLICT DETECTION
// -------------------------------------------------------------

function detectGovernanceConflicts(options = {}) {
  const conflicts = [];

  const issues = dal.listGovernanceIssues(options);
  const exceptions = dal.listExceptions(options);
  const rules = dal.listSystemRules(options);
  const decisions = dal.listFounderDecisions(options);
  const now = new Date();

  // 1. Expired exceptions relied upon
  for (const exp of exceptions) {
    if (exp.status === EXCEPTION_STATUSES.APPROVED && new Date(exp.expiry_date) < now) {
      conflicts.push({
        conflict_type: 'EXPIRED_EXCEPTION_IN_USE',
        severity: 'HIGH',
        entity_id: exp.exception_id,
        description: `Exception '${exp.exception_id}' expired on ${exp.expiry_date} but remains marked APPROVED.`
      });
    }
  }

  // 2. Unresolved strategic issues
  for (const iss of issues) {
    if (iss.governance_level === GOVERNANCE_LEVELS.G3 && iss.status !== GOVERNANCE_STATUSES.CLOSED && iss.status !== GOVERNANCE_STATUSES.RESOLVED) {
      conflicts.push({
        conflict_type: 'UNRESOLVED_STRATEGIC_ISSUE',
        severity: 'HIGH',
        entity_id: iss.governance_id,
        description: `Strategic G3 governance issue '${iss.governance_id}' remains unresolved in status '${iss.status}'.`
      });
    }
  }

  // 3. Stale approvals (> 90 days without implementation)
  for (const dec of decisions) {
    if (dec.decision === 'APPROVE') {
      const decTime = new Date(dec.created_at).getTime();
      const elapsedDays = (now.getTime() - decTime) / (1000 * 86400);
      if (elapsedDays > 90) {
        conflicts.push({
          conflict_type: 'STALE_APPROVAL',
          severity: 'MEDIUM',
          entity_id: dec.decision_id,
          description: `Founder Decision '${dec.decision_id}' was approved ${Math.floor(elapsedDays)} days ago and may be stale.`
        });
      }
    }
  }

  // 4. Duplicate active system rules
  const activeRules = rules.filter(r => r.status === SYSTEM_RULE_STATUSES.ACTIVE);
  const ruleStatements = new Map();
  for (const r of activeRules) {
    const stmt = r.rule_statement.trim().toLowerCase();
    if (ruleStatements.has(stmt)) {
      conflicts.push({
        conflict_type: 'DUPLICATE_ACTIVE_RULE',
        severity: 'HIGH',
        entity_id: r.system_rule_id,
        conflicting_entity_id: ruleStatements.get(stmt),
        description: `System rule '${r.system_rule_id}' has duplicate statement with '${ruleStatements.get(stmt)}'.`
      });
    } else {
      ruleStatements.set(stmt, r.system_rule_id);
    }
  }

  return {
    conflict_detected: conflicts.length > 0,
    conflict_count: conflicts.length,
    conflicts: conflicts
  };
}

// -------------------------------------------------------------
// TRACEABILITY TRAVERSER
// -------------------------------------------------------------

function traceGovernanceEvidence(entityType, entityId, options = {}) {
  const normType = entityType.toLowerCase();
  const entity = dal.loadEntity(normType, entityId, options);
  if (!entity) {
    return {
      entity: null,
      evidence: [],
      epistemic_complete: false,
      error: `Entity '${entityId}' not found.`
    };
  }

  const evidenceRefs = entity.evidence_refs || [];
  const evidenceRecords = evidenceRefs.map(id => dal.loadEntity('visibility_evidence', id, options)).filter(Boolean);

  return {
    entity_type: normType,
    entity_id: entityId,
    entity: entity,
    evidence_refs: evidenceRefs,
    evidence_records: evidenceRecords,
    epistemic_complete: evidenceRecords.length === evidenceRefs.length && evidenceRefs.length > 0
  };
}

// -------------------------------------------------------------
// FOUNDER DECISION LOG
// -------------------------------------------------------------

function logFounderDecision(decisionData, context = {}, options = {}) {
  assertNoForbiddenFields(decisionData);

  const actorRole = context.actor_role || (options.session && options.session.actor_role);
  if (actorRole === 'AI_ADVISOR') {
    throw new Error('PERMISSION_DENIED: AI_ADVISOR cannot record or modify Founder Decisions.');
  }

  const actor = context.actor || (options.session && options.session.actor);
  if (actor !== 'FOUNDER') {
    throw new Error('PERMISSION_DENIED: Only Founder can record Founder Decisions.');
  }

  const decId = decisionData.decision_id || `DEC-${Date.now()}`;
  const existing = dal.loadEntity('founder_decision', decId, options);

  if (existing) {
    if (existing.status === 'DECIDED' || existing.is_immutable) {
      throw new Error(`IMMUTABILITY_VIOLATION: Finalized Founder Decision '${decId}' is immutable and cannot be overwritten.`);
    }
  }

  const record = {
    entity_type: 'founder_decision',
    schema_version: decisionData.schema_version || '1.0',
    decision_id: decId,
    decision_version: decisionData.decision_version || '1.0',
    opportunity_id: decisionData.opportunity_id,
    priority_assessment_id: decisionData.priority_assessment_id,
    recommendation: decisionData.recommendation,
    decision: decisionData.decision,
    decision_reason: decisionData.decision_reason,
    decision_notes: decisionData.decision_notes || '',
    evidence_refs: decisionData.evidence_refs || [],
    created_at: decisionData.created_at || new Date().toISOString(),
    decided_at: new Date().toISOString(),
    decided_by: 'FOUNDER',
    status: decisionData.status || 'DECIDED',
    is_immutable: decisionData.status === 'DECIDED'
  };

  return dal.saveEntity('founder_decision', record, options);
}

function getFounderDecisionLog(filter = {}, options = {}) {
  const allDecisions = dal.listFounderDecisions(options);
  return allDecisions.filter(d => {
    if (filter.decision && d.decision !== filter.decision) return false;
    if (filter.opportunity_id && d.opportunity_id !== filter.opportunity_id) return false;
    if (filter.status && d.status !== filter.status) return false;
    return true;
  });
}

// -------------------------------------------------------------
// MINIMAL CONTROL SURFACE (CONTROL, NOT ANALYTICS)
// -------------------------------------------------------------

function renderMinimalControlSurface(options = {}) {
  const controlState = calculateControlState(options);
  const issues = dal.listGovernanceIssues(options);
  const exceptions = dal.listExceptions(options);
  const changeRequests = dal.listChangeRequests(options);
  const decisions = dal.listFounderDecisions(options);
  const rules = dal.listSystemRules(options);
  const candidates = dal.listSystemRuleCandidates(options);
  const conflicts = detectGovernanceConflicts(options);

  return {
    system: 'LOCATRIA Visibility Operating System (M08.2)',
    timestamp: new Date().toISOString(),
    control_state: {
      status: controlState.state,
      reasons: controlState.reasons
    },
    control_gates: controlState.evaluated_gates.map(g => ({
      gate_id: g.gate_id,
      name: g.gate_name,
      status: g.status,
      reason: g.reason
    })),
    conflicts: conflicts,
    counts: {
      open_governance_issues: issues.filter(i => i.status !== GOVERNANCE_STATUSES.CLOSED && i.status !== GOVERNANCE_STATUSES.RESOLVED).length,
      active_exceptions: exceptions.filter(e => e.status === EXCEPTION_STATUSES.APPROVED).length,
      pending_change_requests: changeRequests.filter(c => c.status === CHANGE_STATUSES.DRAFT || c.status === CHANGE_STATUSES.UNDER_REVIEW).length,
      pending_founder_decisions: decisions.filter(d => d.status === 'PENDING_REVIEW').length,
      active_system_rules: rules.filter(r => r.status === SYSTEM_RULE_STATUSES.ACTIVE).length,
      system_rule_candidates: candidates.filter(c => c.status === 'UNDER_REVIEW' || c.status === 'FOUNDER_REVIEW').length
    }
  };
}

module.exports = {
  GOVERNANCE_LEVELS,
  GOVERNANCE_TYPES,
  GOVERNANCE_STATUSES,
  EXCEPTION_TYPES,
  EXCEPTION_STATUSES,
  REVIEW_TYPES,
  REVIEW_STATUSES,
  CHANGE_TYPES,
  CHANGE_STATUSES,
  SYSTEM_RULE_STATUSES,
  CONTROL_STATES,
  CONTROL_GATES,
  GATE_NAMES,
  FORBIDDEN_FIELDS,
  createGovernanceIssue,
  transitionGovernanceStatus,
  createException,
  approveException,
  expireException,
  createReview,
  prepareMonthlyOperatingReview,
  prepareQuarterlyStrategicReview,
  completeReview,
  createChangeRequest,
  approveChangeRequest,
  rejectChangeRequest,
  createSystemRule,
  activateSystemRule,
  retireSystemRule,
  evaluateControlGate,
  calculateControlState,
  detectGovernanceConflicts,
  traceGovernanceEvidence,
  logFounderDecision,
  getFounderDecisionLog,
  renderMinimalControlSurface
};
