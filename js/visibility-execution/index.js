/**
 * LOCATRIA Visibility Operating System v1.0
 * Action & Experimentation Foundation (M08.2 / BUILD-05)
 *
 * Core Epistemic Chain:
 *   Qualified Opportunity → Priority Assessment → Priority Recommendation → Founder Review → Founder Decision → Action / Experiment → Implementation → [BUILD-06 Verification/Learning]
 *
 * Strict Architectural Separation:
 *   Opportunity ≠ Priority Assessment ≠ Priority Recommendation ≠ Founder Decision ≠ Action ≠ Experiment ≠ Intervention ≠ Verification ≠ Learning
 *
 * Invariants & Governance Rules:
 * - E01: Action/Experiment requires a QUALIFIED Opportunity.
 * - E02: Action/Experiment requires an approved Founder Decision (status: DECIDED, decision: APPROVE) before entering implementation states.
 * - E03: If Founder Decision is DEFER, REJECT, or REQUEST_MORE_EVIDENCE, transition to implementation states is strictly forbidden (GATE_ERROR).
 * - E04: Dependency check: Any Action depending on another Action (dependency_refs) cannot enter READY_FOR_IMPLEMENTATION or IN_PROGRESS until dependencies are IMPLEMENTED or READY_FOR_VERIFICATION.
 * - E05: AI authority restriction: AI_ADVISOR cannot authorize, approve, or advance Actions or Experiments into implementation states.
 * - E06: Silence ≠ approval. No automatic execution or deployment.
 * - E07: Experiments require explicit hypothesis, reference run, intervention, frozen protocol, environments, variables, confounders, and rollback plan.
 * - E08: Canonical historical intervention identity T2-INT-01 must remain immutable and exact. INT-T2-01 is strictly forbidden.
 * - E09: Tolerance = 0 for composite scores, outcome scores, verification scores, learning scores, or hidden ranking.
 * - E10: No execution beyond verification readiness in BUILD-05. Records reaching READY_FOR_VERIFICATION become frozen/immutable, awaiting BUILD-06.
 * - E11: Full epistemic traceability traversers for both Action and Experiment.
 * - E12: Execution conflict detection across concurrently active actions and experiments.
 */

'use strict';

const dal = require('../visibility-data');
const prioritization = require('../visibility-prioritization');

// -------------------------------------------------------------
// CONSTANTS & ENUMS
// -------------------------------------------------------------

const ACTION_STATUSES = Object.freeze({
  DRAFTED: 'DRAFTED',
  READY_FOR_IMPLEMENTATION: 'READY_FOR_IMPLEMENTATION',
  IN_PROGRESS: 'IN_PROGRESS',
  IMPLEMENTED: 'IMPLEMENTED',
  READY_FOR_VERIFICATION: 'READY_FOR_VERIFICATION',
  BLOCKED: 'BLOCKED',
  CANCELLED: 'CANCELLED'
});

const ACTION_TYPES = Object.freeze({
  CONTENT_UPDATE: 'CONTENT_UPDATE',
  SCHEMA_MARKUP: 'SCHEMA_MARKUP',
  CITATION_ACQUISITION: 'CITATION_ACQUISITION',
  ENTITY_HOMEPAGE_SYNC: 'ENTITY_HOMEPAGE_SYNC',
  TECHNICAL_SEO: 'TECHNICAL_SEO',
  PROCESS_IMPROVEMENT: 'PROCESS_IMPROVEMENT',
  OTHER: 'OTHER'
});

const EXPERIMENT_STATUSES = Object.freeze({
  DRAFTED: 'DRAFTED',
  READY_FOR_IMPLEMENTATION: 'READY_FOR_IMPLEMENTATION',
  IN_PROGRESS: 'IN_PROGRESS',
  IMPLEMENTED: 'IMPLEMENTED',
  READY_FOR_VERIFICATION: 'READY_FOR_VERIFICATION',
  BLOCKED: 'BLOCKED',
  CANCELLED: 'CANCELLED'
});

const INTERVENTION_STATUSES = Object.freeze({
  PLANNED: 'PLANNED',
  ACTIVE: 'ACTIVE',
  ROLLED_BACK: 'ROLLED_BACK',
  SUPERSEDED: 'SUPERSEDED'
});

const INTERVENTION_TYPES = Object.freeze({
  SCHEMA_ORGANIZATION: 'SCHEMA_ORGANIZATION',
  CANONICAL_SOURCE: 'CANONICAL_SOURCE',
  ENTITY_HOMEPAGE: 'ENTITY_HOMEPAGE',
  CONTENT_STRUCTURE: 'CONTENT_STRUCTURE',
  INTERNAL_LINKING: 'INTERNAL_LINKING',
  OTHER: 'OTHER'
});

const DEPENDENCY_TYPES = Object.freeze({
  BLOCKING: 'BLOCKING',
  SIGNIFICANT: 'SIGNIFICANT',
  MINOR: 'MINOR',
  NONE: 'NONE',
  UNKNOWN: 'UNKNOWN'
});

const IMPLEMENTATION_STATES = Object.freeze([
  ACTION_STATUSES.READY_FOR_IMPLEMENTATION,
  ACTION_STATUSES.IN_PROGRESS,
  ACTION_STATUSES.IMPLEMENTED,
  ACTION_STATUSES.READY_FOR_VERIFICATION
]);

const FORBIDDEN_FIELDS = Object.freeze([
  'outcome_score',
  'verification_score',
  'impact_score',
  'learning_score',
  'composite_score',
  'confidence_score',
  'auto_deployed',
  'rank',
  'hidden_rank',
  'automated_execution',
  'priority_score',
  'overall_score'
]);

function assertNoForbiddenFields(data, entityName) {
  if (!data || typeof data !== 'object') return;
  for (const field of FORBIDDEN_FIELDS) {
    if (data[field] !== undefined) {
      throw new Error(`GOVERNANCE_ERROR: Field '${field}' is strictly forbidden in ${entityName}. Tolerance = 0 for composite scores, outcome scores, or automated deployment.`);
    }
  }
}

// -------------------------------------------------------------
// GATE & DEPENDENCY VALIDATION
// -------------------------------------------------------------

/**
 * Validates the Founder Decision Gate for transitioning an action or experiment.
 * @param {Object} founderDecision - The loaded founder_decision entity
 * @param {string} targetStatus - The status being transitioned to
 */
function validateFounderDecisionGate(founderDecision, targetStatus) {
  if (!founderDecision) {
    throw new Error('GATE_ERROR: Founder Decision is required to validate execution gate.');
  }

  if (IMPLEMENTATION_STATES.includes(targetStatus)) {
    if (founderDecision.status !== 'DECIDED') {
      throw new Error(`GATE_ERROR: Founder Decision '${founderDecision.decision_id}' is '${founderDecision.status}' (must be 'DECIDED' before implementation).`);
    }
    if (founderDecision.decision !== 'APPROVE') {
      throw new Error(`GATE_ERROR: Cannot transition to '${targetStatus}'. Founder Decision '${founderDecision.decision_id}' is '${founderDecision.decision}' (must be 'APPROVE').`);
    }
  }

  return { passed: true, decision: founderDecision.decision };
}

/**
 * Validates prerequisite execution dependencies for an action.
 * Dependencies are blocking prerequisites, NOT priorities.
 * An action cannot enter READY_FOR_IMPLEMENTATION or IN_PROGRESS until all dependency_refs are IMPLEMENTED or READY_FOR_VERIFICATION.
 * @param {Object} action - Action entity
 * @param {Object} [options] - DAL options
 */
function validateExecutionDependencies(action, options = {}) {
  const deps = action.dependency_refs || [];
  if (!Array.isArray(deps) || deps.length === 0) {
    return { satisfied: true, pending: [], missing: [] };
  }

  const pending = [];
  const missing = [];

  for (const depId of deps) {
    const dep = dal.loadEntity('action', depId, options);
    if (!dep) {
      missing.push(depId);
    } else if (dep.status !== ACTION_STATUSES.IMPLEMENTED && dep.status !== ACTION_STATUSES.READY_FOR_VERIFICATION) {
      pending.push({
        action_id: depId,
        status: dep.status
      });
    }
  }

  const satisfied = missing.length === 0 && pending.length === 0;
  return {
    satisfied,
    pending,
    missing
  };
}

// -------------------------------------------------------------
// CREATION SERVICES
// -------------------------------------------------------------

/**
 * Creates a new Action record under strict M08.2 governance.
 * @param {Object} actionData
 * @param {Object} [options]
 */
function createAction(actionData, options = {}) {
  assertNoForbiddenFields(actionData, 'action');

  if (!actionData.opportunity_id) {
    throw new Error('RELATIONSHIP_ERROR: Action requires opportunity_id.');
  }
  const opp = dal.loadEntity('opportunity', actionData.opportunity_id, options);
  if (!opp) {
    throw new Error(`RELATIONSHIP_ERROR: Opportunity '${actionData.opportunity_id}' does not exist.`);
  }
  if (opp.status !== 'QUALIFIED' && opp.qualification_state !== 'QUALIFIED') {
    throw new Error(`GATE_ERROR: Cannot create Action for opportunity '${actionData.opportunity_id}' in status '${opp.status}' (must be 'QUALIFIED').`);
  }

  if (!actionData.founder_decision_id) {
    throw new Error('RELATIONSHIP_ERROR: Action requires founder_decision_id.');
  }
  const dec = dal.loadEntity('founder_decision', actionData.founder_decision_id, options);
  if (!dec) {
    throw new Error(`RELATIONSHIP_ERROR: Founder Decision '${actionData.founder_decision_id}' does not exist.`);
  }
  if (dec.status !== 'DECIDED') {
    throw new Error(`GATE_ERROR: Founder Decision '${actionData.founder_decision_id}' is '${dec.status}' (must be 'DECIDED').`);
  }

  const status = actionData.status || ACTION_STATUSES.DRAFTED;
  validateFounderDecisionGate(dec, status);

  if (IMPLEMENTATION_STATES.includes(status) && Array.isArray(actionData.dependency_refs) && actionData.dependency_refs.length > 0) {
    const depCheck = validateExecutionDependencies(actionData, options);
    if (!depCheck.satisfied) {
      const detail = depCheck.missing.length > 0
        ? `missing: ${depCheck.missing.join(', ')}`
        : `pending: ${depCheck.pending.map(p => `${p.action_id} (${p.status})`).join(', ')}`;
      throw new Error(`BLOCKING_DEPENDENCY: Cannot create Action in status '${status}' because dependencies are not satisfied (${detail}).`);
    }
  }

  const action = {
    entity_type: 'action',
    schema_version: actionData.schema_version || '1.0',
    action_id: actionData.action_id || `ACT-${Date.now()}`,
    action_version: actionData.action_version || '1.0',
    opportunity_id: actionData.opportunity_id,
    founder_decision_id: actionData.founder_decision_id,
    action_type: actionData.action_type || ACTION_TYPES.CONTENT_UPDATE,
    title: actionData.title,
    description: actionData.description,
    objective: actionData.objective,
    status: status,
    responsible_actor: actionData.responsible_actor || 'HUMAN_OPERATOR',
    dependency_refs: actionData.dependency_refs || [],
    experiment_refs: actionData.experiment_refs || [],
    intervention_refs: actionData.intervention_refs || [],
    audit_refs: actionData.audit_refs || [],
    blocked_reason: actionData.blocked_reason || null,
    implementation_notes: actionData.implementation_notes || '',
    created_at: actionData.created_at || new Date().toISOString(),
    updated_at: actionData.updated_at || null,
    created_by: actionData.created_by || 'SYSTEM',
    is_immutable: status === ACTION_STATUSES.READY_FOR_VERIFICATION,
    metadata: actionData.metadata || {}
  };

  return dal.saveEntity('action', action, options);
}

/**
 * Creates a new Experiment record under strict M08.2 governance.
 * @param {Object} expData
 * @param {Object} [options]
 */
function createExperiment(expData, options = {}) {
  assertNoForbiddenFields(expData, 'experiment');

  if (!expData.opportunity_id) {
    throw new Error('RELATIONSHIP_ERROR: Experiment requires opportunity_id.');
  }
  const opp = dal.loadEntity('opportunity', expData.opportunity_id, options);
  if (!opp) {
    throw new Error(`RELATIONSHIP_ERROR: Opportunity '${expData.opportunity_id}' does not exist.`);
  }
  if (opp.status !== 'QUALIFIED' && opp.qualification_state !== 'QUALIFIED') {
    throw new Error(`GATE_ERROR: Cannot create Experiment for opportunity '${expData.opportunity_id}' in status '${opp.status}' (must be 'QUALIFIED').`);
  }

  if (!expData.founder_decision_id) {
    throw new Error('RELATIONSHIP_ERROR: Experiment requires founder_decision_id.');
  }
  const dec = dal.loadEntity('founder_decision', expData.founder_decision_id, options);
  if (!dec) {
    throw new Error(`RELATIONSHIP_ERROR: Founder Decision '${expData.founder_decision_id}' does not exist.`);
  }
  if (dec.status !== 'DECIDED') {
    throw new Error(`GATE_ERROR: Founder Decision '${expData.founder_decision_id}' is '${dec.status}' (must be 'DECIDED').`);
  }

  if (!expData.reference_run_id) {
    throw new Error('RELATIONSHIP_ERROR: Experiment requires reference_run_id.');
  }
  const run = dal.loadEntity('measurement_run', expData.reference_run_id, options);
  if (!run) {
    throw new Error(`RELATIONSHIP_ERROR: Reference run '${expData.reference_run_id}' does not exist.`);
  }

  if (!expData.intervention_id) {
    throw new Error('RELATIONSHIP_ERROR: Experiment requires intervention_id.');
  }
  const intervention = dal.loadEntity('intervention', expData.intervention_id, options);
  if (!intervention) {
    throw new Error(`RELATIONSHIP_ERROR: Intervention '${expData.intervention_id}' does not exist.`);
  }

  if (!expData.prompt_set_id) {
    throw new Error('RELATIONSHIP_ERROR: Experiment requires prompt_set_id.');
  }
  const pset = dal.loadEntity('prompt_set', expData.prompt_set_id, options);
  if (!pset) {
    throw new Error(`RELATIONSHIP_ERROR: Prompt set '${expData.prompt_set_id}' does not exist.`);
  }

  if (!Array.isArray(expData.environments) || expData.environments.length === 0) {
    throw new Error('VALIDATION_ERROR: Experiment requires at least one environment.');
  }
  for (const envId of expData.environments) {
    const env = dal.loadEntity('environment', envId, options);
    if (!env) {
      throw new Error(`RELATIONSHIP_ERROR: Environment '${envId}' does not exist.`);
    }
  }

  if (!expData.rollback_plan || typeof expData.rollback_plan !== 'string' || expData.rollback_plan.trim().length < 10) {
    throw new Error('GOVERNANCE_ERROR: Experiment requires an explicit rollback_plan (minimum 10 characters).');
  }

  const status = expData.status || EXPERIMENT_STATUSES.DRAFTED;
  validateFounderDecisionGate(dec, status);

  const experiment = {
    entity_type: 'experiment',
    schema_version: expData.schema_version || '1.0',
    experiment_id: expData.experiment_id || `EXP-${Date.now()}`,
    experiment_version: expData.experiment_version || '1.0',
    opportunity_id: expData.opportunity_id,
    founder_decision_id: expData.founder_decision_id,
    title: expData.title,
    hypothesis: expData.hypothesis,
    reference_run_id: expData.reference_run_id,
    intervention_id: expData.intervention_id,
    prompt_set_id: expData.prompt_set_id,
    protocol_version: expData.protocol_version || '1.0',
    environments: expData.environments,
    variables: expData.variables || [],
    confounders: expData.confounders || [],
    success_observation: expData.success_observation,
    verification_method: expData.verification_method,
    rollback_plan: expData.rollback_plan,
    status: status,
    dependency_refs: expData.dependency_refs || [],
    audit_refs: expData.audit_refs || [],
    blocked_reason: expData.blocked_reason || null,
    created_at: expData.created_at || new Date().toISOString(),
    updated_at: expData.updated_at || null,
    created_by: expData.created_by || 'SYSTEM',
    is_immutable: status === EXPERIMENT_STATUSES.READY_FOR_VERIFICATION,
    metadata: expData.metadata || {}
  };

  return dal.saveEntity('experiment', experiment, options);
}

/**
 * Creates a new Intervention record under strict M08.2 governance.
 * @param {Object} intData
 * @param {Object} [options]
 */
function createIntervention(intData, options = {}) {
  assertNoForbiddenFields(intData, 'intervention');

  const intId = intData.intervention_id || `INT-${Date.now()}`;
  if (intId === 'INT-T2-01') {
    throw new Error(`GOVERNANCE_ERROR: Invalid intervention identity 'INT-T2-01'. Canonical historical identity must be 'T2-INT-01'.`);
  }

  const intervention = {
    entity_type: 'intervention',
    schema_version: intData.schema_version || '1.0',
    intervention_id: intId,
    intervention_type: intData.intervention_type || INTERVENTION_TYPES.OTHER,
    target: intData.target,
    description: intData.description,
    baseline_state: intData.baseline_state,
    intended_change: intData.intended_change,
    implementation_scope: intData.implementation_scope || 'GLOBAL',
    rollback_method: intData.rollback_method,
    reversible: intData.reversible !== undefined ? Boolean(intData.reversible) : true,
    status: intData.status || INTERVENTION_STATUSES.PLANNED,
    created_at: intData.created_at || new Date().toISOString(),
    updated_at: intData.updated_at || null,
    created_by: intData.created_by || 'SYSTEM',
    is_immutable: Boolean(intData.is_immutable),
    metadata: intData.metadata || {}
  };

  return dal.saveEntity('intervention', intervention, options);
}

// -------------------------------------------------------------
// STATUS TRANSITIONS & LIFECYCLE MANAGEMENT
// -------------------------------------------------------------

/**
 * Valid action state transitions
 */
const VALID_ACTION_TRANSITIONS = Object.freeze({
  [ACTION_STATUSES.DRAFTED]: [ACTION_STATUSES.READY_FOR_IMPLEMENTATION, ACTION_STATUSES.BLOCKED, ACTION_STATUSES.CANCELLED],
  [ACTION_STATUSES.READY_FOR_IMPLEMENTATION]: [ACTION_STATUSES.IN_PROGRESS, ACTION_STATUSES.BLOCKED, ACTION_STATUSES.CANCELLED],
  [ACTION_STATUSES.IN_PROGRESS]: [ACTION_STATUSES.IMPLEMENTED, ACTION_STATUSES.BLOCKED, ACTION_STATUSES.CANCELLED],
  [ACTION_STATUSES.IMPLEMENTED]: [ACTION_STATUSES.READY_FOR_VERIFICATION, ACTION_STATUSES.IN_PROGRESS, ACTION_STATUSES.CANCELLED],
  [ACTION_STATUSES.BLOCKED]: [ACTION_STATUSES.READY_FOR_IMPLEMENTATION, ACTION_STATUSES.DRAFTED, ACTION_STATUSES.CANCELLED],
  [ACTION_STATUSES.READY_FOR_VERIFICATION]: [], // Immutable in BUILD-05 (Verification is BUILD-06)
  [ACTION_STATUSES.CANCELLED]: [] // Terminal
});

/**
 * Transitions an Action's status under strict governance and dependency checks.
 * @param {string} actionId
 * @param {string} targetStatus
 * @param {Object} context - { actor, actor_role, reason, notes }
 * @param {Object} [options]
 */
function transitionActionStatus(actionId, targetStatus, context = {}, options = {}) {
  const action = dal.loadEntity('action', actionId, options);
  if (!action) {
    throw new Error(`RELATIONSHIP_ERROR: Action '${actionId}' does not exist.`);
  }

  if (action.is_immutable || action.status === ACTION_STATUSES.READY_FOR_VERIFICATION) {
    throw new Error(`IMMUTABILITY_ERROR: Action '${actionId}' is in status '${action.status}' and cannot be modified.`);
  }

  // BUILD-06 Leakage Prevention:
  if (['VERIFIED', 'SUCCESSFUL', 'FAILED', 'VERIFICATION_PASSED', 'VERIFICATION_FAILED'].includes(targetStatus)) {
    throw new Error(`SCOPE_ERROR: Transition to '${targetStatus}' is prohibited in BUILD-05. Verification and outcome scoring belong to BUILD-06.`);
  }

  // AI Authority Restriction:
  const actorRole = context.actor_role || (options.session && options.session.actor_role);
  if (actorRole === 'AI_ADVISOR') {
    if (IMPLEMENTATION_STATES.includes(targetStatus) || targetStatus === ACTION_STATUSES.CANCELLED) {
      throw new Error(`AUTHORITY_ERROR: AI_ADVISOR cannot transition Action '${actionId}' to '${targetStatus}'. Only Founder or Human Operator can authorize execution state transitions.`);
    }
  }

  // State Transition Validation:
  const allowedTransitions = VALID_ACTION_TRANSITIONS[action.status] || [];
  if (!allowedTransitions.includes(targetStatus)) {
    throw new Error(`TRANSITION_ERROR: Invalid transition for Action '${actionId}' from '${action.status}' to '${targetStatus}'. Allowed: [${allowedTransitions.join(', ')}].`);
  }

  // Founder Decision Gate Check:
  const dec = dal.loadEntity('founder_decision', action.founder_decision_id, options);
  if (!dec) {
    throw new Error(`RELATIONSHIP_ERROR: Referenced founder_decision_id '${action.founder_decision_id}' does not exist.`);
  }
  validateFounderDecisionGate(dec, targetStatus);

  // Dependency Check for implementation states:
  if (targetStatus === ACTION_STATUSES.READY_FOR_IMPLEMENTATION || targetStatus === ACTION_STATUSES.IN_PROGRESS) {
    const depCheck = validateExecutionDependencies(action, options);
    if (!depCheck.satisfied) {
      const detail = depCheck.missing.length > 0
        ? `missing: ${depCheck.missing.join(', ')}`
        : `pending: ${depCheck.pending.map(p => `${p.action_id} (${p.status})`).join(', ')}`;
      throw new Error(`BLOCKING_DEPENDENCY: Action '${actionId}' cannot transition to '${targetStatus}' because prerequisite dependencies are not satisfied (${detail}).`);
    }
  }

  // Apply transition
  action.status = targetStatus;
  action.updated_at = new Date().toISOString();
  if (context.notes) {
    action.implementation_notes = action.implementation_notes
      ? `${action.implementation_notes}\n[${action.updated_at}] ${context.notes}`
      : `[${action.updated_at}] ${context.notes}`;
  }
  if (targetStatus === ACTION_STATUSES.BLOCKED) {
    action.blocked_reason = context.reason || 'Execution blocked by dependency or operator';
  } else if (targetStatus === ACTION_STATUSES.READY_FOR_IMPLEMENTATION || targetStatus === ACTION_STATUSES.IN_PROGRESS) {
    action.blocked_reason = null;
  }

  if (targetStatus === ACTION_STATUSES.READY_FOR_VERIFICATION) {
    action.is_immutable = true;
  }

  return dal.saveEntity('action', action, options);
}

/**
 * Valid experiment state transitions
 */
const VALID_EXPERIMENT_TRANSITIONS = Object.freeze({
  [EXPERIMENT_STATUSES.DRAFTED]: [EXPERIMENT_STATUSES.READY_FOR_IMPLEMENTATION, EXPERIMENT_STATUSES.BLOCKED, EXPERIMENT_STATUSES.CANCELLED],
  [EXPERIMENT_STATUSES.READY_FOR_IMPLEMENTATION]: [EXPERIMENT_STATUSES.IN_PROGRESS, EXPERIMENT_STATUSES.BLOCKED, EXPERIMENT_STATUSES.CANCELLED],
  [EXPERIMENT_STATUSES.IN_PROGRESS]: [EXPERIMENT_STATUSES.IMPLEMENTED, EXPERIMENT_STATUSES.BLOCKED, EXPERIMENT_STATUSES.CANCELLED],
  [EXPERIMENT_STATUSES.IMPLEMENTED]: [EXPERIMENT_STATUSES.READY_FOR_VERIFICATION, EXPERIMENT_STATUSES.CANCELLED],
  [EXPERIMENT_STATUSES.BLOCKED]: [EXPERIMENT_STATUSES.READY_FOR_IMPLEMENTATION, EXPERIMENT_STATUSES.DRAFTED, EXPERIMENT_STATUSES.CANCELLED],
  [EXPERIMENT_STATUSES.READY_FOR_VERIFICATION]: [], // Immutable in BUILD-05
  [EXPERIMENT_STATUSES.CANCELLED]: [] // Terminal
});

/**
 * Transitions an Experiment's status under strict governance and rollback verification.
 * @param {string} expId
 * @param {string} targetStatus
 * @param {Object} context - { actor, actor_role, reason, notes }
 * @param {Object} [options]
 */
function transitionExperimentStatus(expId, targetStatus, context = {}, options = {}) {
  const exp = dal.loadEntity('experiment', expId, options);
  if (!exp) {
    throw new Error(`RELATIONSHIP_ERROR: Experiment '${expId}' does not exist.`);
  }

  if (exp.is_immutable || exp.status === EXPERIMENT_STATUSES.READY_FOR_VERIFICATION) {
    throw new Error(`IMMUTABILITY_ERROR: Experiment '${expId}' is in status '${exp.status}' and cannot be modified.`);
  }

  // BUILD-06 Leakage Prevention:
  if (['VERIFIED', 'SUCCESSFUL', 'FAILED', 'VERIFICATION_PASSED', 'VERIFICATION_FAILED'].includes(targetStatus)) {
    throw new Error(`SCOPE_ERROR: Transition to '${targetStatus}' is prohibited in BUILD-05. Verification and outcome scoring belong to BUILD-06.`);
  }

  // AI Authority Restriction:
  const actorRole = context.actor_role || (options.session && options.session.actor_role);
  if (actorRole === 'AI_ADVISOR') {
    if (IMPLEMENTATION_STATES.includes(targetStatus) || targetStatus === EXPERIMENT_STATUSES.CANCELLED) {
      throw new Error(`AUTHORITY_ERROR: AI_ADVISOR cannot transition Experiment '${expId}' to '${targetStatus}'. Only Founder or Human Operator can authorize execution state transitions.`);
    }
  }

  const allowedTransitions = VALID_EXPERIMENT_TRANSITIONS[exp.status] || [];
  if (!allowedTransitions.includes(targetStatus)) {
    throw new Error(`TRANSITION_ERROR: Invalid transition for Experiment '${expId}' from '${exp.status}' to '${targetStatus}'. Allowed: [${allowedTransitions.join(', ')}].`);
  }

  const dec = dal.loadEntity('founder_decision', exp.founder_decision_id, options);
  if (!dec) {
    throw new Error(`RELATIONSHIP_ERROR: Referenced founder_decision_id '${exp.founder_decision_id}' does not exist.`);
  }
  validateFounderDecisionGate(dec, targetStatus);

  if (IMPLEMENTATION_STATES.includes(targetStatus)) {
    if (!exp.rollback_plan || typeof exp.rollback_plan !== 'string' || exp.rollback_plan.trim().length < 10) {
      throw new Error(`GOVERNANCE_ERROR: Experiment '${expId}' cannot enter '${targetStatus}' without a valid rollback_plan.`);
    }
  }

  exp.status = targetStatus;
  exp.updated_at = new Date().toISOString();
  if (targetStatus === EXPERIMENT_STATUSES.BLOCKED) {
    exp.blocked_reason = context.reason || 'Experiment blocked by operator or precondition';
  } else if (targetStatus === EXPERIMENT_STATUSES.READY_FOR_IMPLEMENTATION || targetStatus === EXPERIMENT_STATUSES.IN_PROGRESS) {
    exp.blocked_reason = null;
  }

  if (targetStatus === EXPERIMENT_STATUSES.READY_FOR_VERIFICATION) {
    exp.is_immutable = true;
  }

  return dal.saveEntity('experiment', exp, options);
}

/**
 * Transitions an Intervention's status.
 * @param {string} intId
 * @param {string} targetStatus
 * @param {Object} context
 * @param {Object} [options]
 */
function transitionInterventionStatus(intId, targetStatus, context = {}, options = {}) {
  const intervention = dal.loadEntity('intervention', intId, options);
  if (!intervention) {
    throw new Error(`RELATIONSHIP_ERROR: Intervention '${intId}' does not exist.`);
  }

  if (intervention.is_immutable) {
    throw new Error(`IMMUTABILITY_ERROR: Intervention '${intId}' is immutable and cannot be modified.`);
  }

  const validTransitions = {
    [INTERVENTION_STATUSES.PLANNED]: [INTERVENTION_STATUSES.ACTIVE, INTERVENTION_STATUSES.SUPERSEDED],
    [INTERVENTION_STATUSES.ACTIVE]: [INTERVENTION_STATUSES.ROLLED_BACK, INTERVENTION_STATUSES.SUPERSEDED],
    [INTERVENTION_STATUSES.ROLLED_BACK]: [INTERVENTION_STATUSES.SUPERSEDED],
    [INTERVENTION_STATUSES.SUPERSEDED]: []
  };

  const allowed = validTransitions[intervention.status] || [];
  if (!allowed.includes(targetStatus)) {
    throw new Error(`TRANSITION_ERROR: Invalid transition for Intervention '${intId}' from '${intervention.status}' to '${targetStatus}'. Allowed: [${allowed.join(', ')}].`);
  }

  intervention.status = targetStatus;
  intervention.updated_at = new Date().toISOString();

  return dal.saveEntity('intervention', intervention, options);
}

// -------------------------------------------------------------
// FULL EPISTEMIC TRACEABILITY TRAVERSERS
// -------------------------------------------------------------

/**
 * Traces the complete epistemic evidence chain for an Action:
 *   Action → Founder Decision → Priority Assessment → Opportunity → Diagnoses → Observations → Evidence → Runs
 *
 * @param {string} actionId
 * @param {Object} [options]
 */
function traceActionEvidenceChain(actionId, options = {}) {
  const action = dal.loadEntity('action', actionId, options);
  if (!action) {
    throw new Error(`RELATIONSHIP_ERROR: Action '${actionId}' not found.`);
  }

  const founderDecision = dal.loadEntity('founder_decision', action.founder_decision_id, options);
  if (!founderDecision) {
    throw new Error(`RELATIONSHIP_ERROR: Founder Decision '${action.founder_decision_id}' not found for action '${actionId}'.`);
  }

  const priorityAssessment = dal.loadEntity('priority_assessment', founderDecision.priority_assessment_id, options);
  if (!priorityAssessment) {
    throw new Error(`RELATIONSHIP_ERROR: Priority Assessment '${founderDecision.priority_assessment_id}' not found for decision '${founderDecision.decision_id}'.`);
  }

  const opportunity = dal.loadEntity('opportunity', action.opportunity_id, options);
  if (!opportunity) {
    throw new Error(`RELATIONSHIP_ERROR: Opportunity '${action.opportunity_id}' not found for action '${actionId}'.`);
  }

  const diagnoses = [];
  const observations = [];
  const evidence = [];
  const runs = [];

  const diagRefs = opportunity.diagnosis_refs || [];
  for (const diagId of diagRefs) {
    const diag = dal.loadEntity('diagnosis', diagId, options);
    if (diag) diagnoses.push(diag);
  }

  const allObservations = dal.listObservations(options);
  const oppObsRefs = new Set();
  for (const diag of diagnoses) {
    for (const obsRef of (diag.observation_refs || [])) {
      oppObsRefs.add(obsRef);
    }
  }

  for (const obs of allObservations) {
    if (oppObsRefs.has(obs.observation_id)) {
      observations.push(obs);
      if (obs.run_id && !runs.includes(obs.run_id)) {
        runs.push(obs.run_id);
      }
    }
  }

  const evdRefs = new Set([
    ...(founderDecision.evidence_refs || []),
    ...(priorityAssessment.evidence_refs || [])
  ]);
  for (const evdId of evdRefs) {
    const evd = dal.loadEntity('visibility_evidence', evdId, options);
    if (evd) {
      evidence.push(evd);
      if (evd.run_id && !runs.includes(evd.run_id)) {
        runs.push(evd.run_id);
      }
    }
  }

  return {
    action,
    founder_decision: founderDecision,
    priority_assessment: priorityAssessment,
    opportunity,
    diagnoses,
    observations,
    evidence,
    runs,
    epistemic_complete: Boolean(
      action &&
      founderDecision &&
      priorityAssessment &&
      opportunity &&
      diagnoses.length > 0 &&
      evidence.length > 0
    )
  };
}

/**
 * Traces the complete epistemic evidence chain for an Experiment:
 *   Experiment → Founder Decision → Opportunity → Intervention → Reference Run → Prompt Set → Environments
 *
 * @param {string} expId
 * @param {Object} [options]
 */
function traceExperimentEvidenceChain(expId, options = {}) {
  const experiment = dal.loadEntity('experiment', expId, options);
  if (!experiment) {
    throw new Error(`RELATIONSHIP_ERROR: Experiment '${expId}' not found.`);
  }

  const founderDecision = dal.loadEntity('founder_decision', experiment.founder_decision_id, options);
  if (!founderDecision) {
    throw new Error(`RELATIONSHIP_ERROR: Founder Decision '${experiment.founder_decision_id}' not found for experiment '${expId}'.`);
  }

  const opportunity = dal.loadEntity('opportunity', experiment.opportunity_id, options);
  if (!opportunity) {
    throw new Error(`RELATIONSHIP_ERROR: Opportunity '${experiment.opportunity_id}' not found for experiment '${expId}'.`);
  }

  const intervention = dal.loadEntity('intervention', experiment.intervention_id, options);
  if (!intervention) {
    throw new Error(`RELATIONSHIP_ERROR: Intervention '${experiment.intervention_id}' not found for experiment '${expId}'.`);
  }

  const referenceRun = dal.loadEntity('measurement_run', experiment.reference_run_id, options);
  if (!referenceRun) {
    throw new Error(`RELATIONSHIP_ERROR: Reference run '${experiment.reference_run_id}' not found for experiment '${expId}'.`);
  }

  const promptSet = dal.loadEntity('prompt_set', experiment.prompt_set_id, options);
  if (!promptSet) {
    throw new Error(`RELATIONSHIP_ERROR: Prompt set '${experiment.prompt_set_id}' not found for experiment '${expId}'.`);
  }

  const environments = [];
  for (const envId of (experiment.environments || [])) {
    const env = dal.loadEntity('environment', envId, options);
    if (env) environments.push(env);
  }

  return {
    experiment,
    founder_decision: founderDecision,
    opportunity,
    intervention,
    reference_run: referenceRun,
    prompt_set: promptSet,
    environments,
    epistemic_complete: Boolean(
      experiment &&
      founderDecision &&
      opportunity &&
      intervention &&
      referenceRun &&
      promptSet &&
      environments.length === (experiment.environments || []).length
    )
  };
}

// -------------------------------------------------------------
// EXECUTION CONFLICT DETECTION
// -------------------------------------------------------------

/**
 * Detects conflicts between concurrently active actions and experiments.
 * E.g., two actions or experiments attempting to modify the same surface, target, or prompt set simultaneously.
 * @param {Object} candidate - Action or Experiment being evaluated
 * @param {Object} [options]
 */
function detectExecutionConflicts(candidate, options = {}) {
  const conflicts = [];
  const activeStatuses = [ACTION_STATUSES.READY_FOR_IMPLEMENTATION, ACTION_STATUSES.IN_PROGRESS];

  const listOpts = { ...options, includeFixtures: Boolean(options.isFixture || options.includeFixtures) };
  const allActions = dal.listActions(listOpts);
  const allExperiments = dal.listExperiments(listOpts);

  if (candidate.entity_type === 'action') {
    for (const act of allActions) {
      if (act.action_id === candidate.action_id) continue;
      if (activeStatuses.includes(act.status)) {
        if (act.action_type === candidate.action_type && act.opportunity_id === candidate.opportunity_id) {
          conflicts.push({
            entity_id: act.action_id,
            entity_type: 'action',
            conflict_type: 'CONCURRENT_OPPORTUNITY_ACTION',
            description: `Active action '${act.action_id}' already targets opportunity '${act.opportunity_id}' with action_type '${act.action_type}'.`
          });
        }
      }
    }
  } else if (candidate.entity_type === 'experiment') {
    for (const exp of allExperiments) {
      if (exp.experiment_id === candidate.experiment_id) continue;
      if (activeStatuses.includes(exp.status)) {
        if (exp.intervention_id === candidate.intervention_id) {
          conflicts.push({
            entity_id: exp.experiment_id,
            entity_type: 'experiment',
            conflict_type: 'SHARED_INTERVENTION',
            description: `Active experiment '${exp.experiment_id}' already executes intervention '${exp.intervention_id}'.`
          });
        }
        if (exp.prompt_set_id === candidate.prompt_set_id) {
          const sharedEnvs = (exp.environments || []).filter(e => (candidate.environments || []).includes(e));
          if (sharedEnvs.length > 0) {
            conflicts.push({
              entity_id: exp.experiment_id,
              entity_type: 'experiment',
              conflict_type: 'SHARED_PROMPT_SET_AND_ENVIRONMENT',
              description: `Active experiment '${exp.experiment_id}' shares prompt_set '${exp.prompt_set_id}' and environments [${sharedEnvs.join(', ')}].`
            });
          }
        }
      }
    }
  }

  return {
    conflict_detected: conflicts.length > 0,
    conflicts
  };
}

module.exports = {
  // Constants & Enums
  ACTION_STATUSES,
  ACTION_TYPES,
  EXPERIMENT_STATUSES,
  INTERVENTION_STATUSES,
  INTERVENTION_TYPES,
  DEPENDENCY_TYPES,
  IMPLEMENTATION_STATES,
  FORBIDDEN_FIELDS,

  // Validators & Guard Functions
  assertNoForbiddenFields,
  validateFounderDecisionGate,
  validateExecutionDependencies,

  // Entity Creation
  createAction,
  createExperiment,
  createIntervention,

  // Lifecycle Transitions
  transitionActionStatus,
  transitionExperimentStatus,
  transitionInterventionStatus,

  // Traceability Traversers
  traceActionEvidenceChain,
  traceExperimentEvidenceChain,

  // Conflict Detection
  detectExecutionConflicts
};
