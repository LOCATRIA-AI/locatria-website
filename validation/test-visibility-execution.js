/**
 * LOCATRIA Visibility Operating System v1.0
 * Action & Experimentation Test Suite — Module 08 / M08.2 BUILD-05
 *
 * Validates:
 * - Positive Tests T01–T20 (Action creation, Experiment creation, Intervention creation,
 *   state lifecycle progression, Founder Decision Gate checks, dependency resolution,
 *   traceability traversers, conflict detection, immutability of ready_for_verification records)
 * - Negative Tests N01–N25 (Unqualified opportunity rejection, undecidable/unapproved gate rejection,
 *   blocking dependency violations, AI advisor authority restrictions, forbidden score fields,
 *   invalid historical intervention ID rejection, rollback plan validation, immutability guards,
 *   BUILD-06 scope leakage prohibitions)
 * - Historical Integrity Check: Verifies zero mutation to historical production data.
 */

'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const dal = require('../js/visibility-data/index');
const domain = require('../js/visibility-domain/index');
const prio = require('../js/visibility-prioritization/index');
const exec = require('../js/visibility-execution/index');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(testName, testFn) {
  totalTests++;
  try {
    testFn();
    console.log(`  [PASS] Test ${String(totalTests).padStart(2, '0')}: ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] Test ${String(totalTests).padStart(2, '0')}: ${testName}`);
    console.error(`         Error: ${err.message}`);
    failedTests++;
  }
}

console.log('============================================================');
console.log('LOCATRIA VISIBILITY ACTION & EXPERIMENTATION TEST SUITE');
console.log('M08.2 BUILD-05 — Action & Experimentation Foundation v1.0');
console.log('============================================================\n');

// Clean up test fixtures from _fixtures
const fixtureDir = path.join(dal.getBaseDir(), '_fixtures');
if (fs.existsSync(fixtureDir)) {
  const existingFiles = fs.readdirSync(fixtureDir);
  for (const f of existingFiles) {
    if (
      f.startsWith('diag-b05-') ||
      f.startsWith('opp-b05-') ||
      f.startsWith('prio-b05-') ||
      f.startsWith('dec-b05-') ||
      f.startsWith('act-test-') ||
      f.startsWith('exp-test-') ||
      f.startsWith('int-test-') ||
      f.startsWith('t2-int-01')
    ) {
      try { fs.unlinkSync(path.join(fixtureDir, f)); } catch (_) {}
    }
  }
}

// -------------------------------------------------------------
// SETUP BASELINE TEST FIXTURES IN _fixtures
// -------------------------------------------------------------

// 1. Validated Diagnosis
domain.createDiagnosis({
  diagnosis_id: 'DIAG-B05-001',
  title: 'Entity Identity Diagnosis for Execution Testing',
  statement: 'LOCATRIA canonical entity identity is incomplete in target AI environments.',
  scope: 'GLOBAL',
  observation_refs: ['OBS-T1-CHATGPT-P01'],
  evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
  metric_refs: ['M01_MENTION'],
  environment_refs: ['ENV-CHATGPT'],
  run_refs: ['RUN-M08-1-T1-REF'],
  problem_taxonomy: ['V1_DISCOVERY'],
  confidence_state: 'HIGH'
}, { isFixture: true, recordAudit: false });

domain.transitionDiagnosisStatus('DIAG-B05-001', 'UNDER_REVIEW', { actor: 'OPERATOR', actor_type: 'OPERATOR' }, { isFixture: true, recordAudit: false });
domain.transitionDiagnosisStatus('DIAG-B05-001', 'VALIDATED', { actor: 'FOUNDER', actor_type: 'FOUNDER' }, { isFixture: true, recordAudit: false });

// 2. Qualified Opportunity
domain.createOpportunity({
  opportunity_id: 'OPP-B05-QUAL-001',
  title: 'B05 Canonical Entity Schema Implementation',
  statement: 'Implement Organization schema markup to establish canonical entity identity.',
  scope: 'GLOBAL',
  diagnosis_refs: ['DIAG-B05-001'],
  problem_taxonomy: ['V1_DISCOVERY', 'V4_ENTITY'],
  qualification_state: 'UNQUALIFIED',
  confidence_state: 'HIGH'
}, { isFixture: true, recordAudit: false, allowDuplicates: true });

domain.transitionOpportunityStatus('OPP-B05-QUAL-001', 'DRAFTED', { actor: 'OPERATOR', actor_type: 'OPERATOR' }, { isFixture: true, recordAudit: false });
domain.transitionOpportunityStatus('OPP-B05-QUAL-001', 'QUALIFYING', { actor: 'OPERATOR', actor_type: 'OPERATOR' }, { isFixture: true, recordAudit: false });
domain.transitionOpportunityStatus('OPP-B05-QUAL-001', 'QUALIFIED', { actor: 'FOUNDER', actor_type: 'FOUNDER', notes: 'Qualified by Founder' }, { isFixture: true, recordAudit: false });

// 3. Unqualified Opportunity (for negative tests)
domain.createOpportunity({
  opportunity_id: 'OPP-B05-UNQUAL-002',
  title: 'Unqualified Opportunity For Testing',
  statement: 'This opportunity remains unvalidated and unqualified.',
  scope: 'GLOBAL',
  diagnosis_refs: ['DIAG-B05-001'],
  problem_taxonomy: ['V1_DISCOVERY'],
  qualification_state: 'UNQUALIFIED',
  confidence_state: 'LOW'
}, { isFixture: true, recordAudit: false, allowDuplicates: true });

// 4. Priority Assessment for Qualified Opportunity
prio.createPriorityAssessment({
  priority_assessment_id: 'PRIO-B05-001',
  opportunity_id: 'OPP-B05-QUAL-001',
  impact: 'HIGH',
  evidence_strength: 'HIGH',
  feasibility: 'HIGH',
  urgency: 'HIGH',
  dependency: 'NONE',
  strategic_relevance: 'HIGH',
  impact_basis: 'High visibility impact on primary entity queries.',
  evidence_strength_basis: 'Direct empirical observation in T1 dataset.',
  feasibility_basis: 'Local schema markup updates require standard static deployment.',
  urgency_basis: 'Core identity prerequisite for subsequent experiments.',
  dependency_basis: 'Zero external dependencies.',
  strategic_relevance_basis: 'Foundational entity discoverability.',
  evidence_refs: ['EVD-VIS-T1-CHATGPT-P01']
}, { isFixture: true, recordAudit: false });

// 5. Approved Founder Decision
prio.createFounderDecision({
  decision_id: 'DEC-B05-APP-001',
  opportunity_id: 'OPP-B05-QUAL-001',
  priority_assessment_id: 'PRIO-B05-001',
  recommendation: 'P0',
  decision: 'APPROVE',
  decision_reason: 'Approved for controlled implementation.',
  decided_by: 'FOUNDER',
  evidence_refs: ['EVD-VIS-T1-CHATGPT-P01']
}, { isFixture: true, recordAudit: false });

// 6. Deferred Founder Decision
prio.createFounderDecision({
  decision_id: 'DEC-B05-DEF-002',
  opportunity_id: 'OPP-B05-QUAL-001',
  priority_assessment_id: 'PRIO-B05-001',
  recommendation: 'P2',
  decision: 'DEFER',
  decision_reason: 'Deferred until Q4.',
  decided_by: 'FOUNDER'
}, { isFixture: true, recordAudit: false });

// 7. Rejected Founder Decision
prio.createFounderDecision({
  decision_id: 'DEC-B05-REJ-003',
  opportunity_id: 'OPP-B05-QUAL-001',
  priority_assessment_id: 'PRIO-B05-001',
  recommendation: 'P3',
  decision: 'REJECT',
  decision_reason: 'Not aligned with current focus.',
  decided_by: 'FOUNDER'
}, { isFixture: true, recordAudit: false });

// 8. Request More Evidence Founder Decision
prio.createFounderDecision({
  decision_id: 'DEC-B05-REQ-004',
  opportunity_id: 'OPP-B05-QUAL-001',
  priority_assessment_id: 'PRIO-B05-001',
  recommendation: 'P1',
  decision: 'REQUEST_MORE_EVIDENCE',
  decision_reason: 'Need additional data from Gemini.',
  decided_by: 'FOUNDER'
}, { isFixture: true, recordAudit: false });

// 9. Undecided (PENDING_REVIEW) Founder Decision
dal.saveEntity('founder_decision', {
  entity_type: 'founder_decision',
  schema_version: '1.0',
  decision_id: 'DEC-B05-PEN-005',
  decision_version: '1.0',
  opportunity_id: 'OPP-B05-QUAL-001',
  priority_assessment_id: 'PRIO-B05-001',
  recommendation: 'P0',
  decision: 'APPROVE',
  decision_reason: 'Drafted review.',
  status: 'PENDING_REVIEW', // Not decided!
  decided_by: 'FOUNDER',
  decided_at: null,
  created_at: new Date().toISOString()
}, { isFixture: true, recordAudit: false });

// 10. Baseline Intervention for Experiments
exec.createIntervention({
  intervention_id: 'INT-TEST-001',
  intervention_type: 'SCHEMA_ORGANIZATION',
  target: 'index.html',
  description: 'Add Organization schema to index.html',
  baseline_state: 'No Organization schema present.',
  intended_change: 'Inject schema.org Organization JSON-LD markup.',
  implementation_scope: 'GLOBAL',
  rollback_method: 'Revert git commit and restore previous HTML markup.',
  reversible: true,
  status: 'ACTIVE'
}, { isFixture: true, recordAudit: false });

// -------------------------------------------------------------
// POSITIVE TESTS (T01–T20)
// -------------------------------------------------------------

console.log('--- POSITIVE TESTS (T01–T20) ---');

runTest('T01: Create Action in DRAFTED status with approved decision', () => {
  const act = exec.createAction({
    action_id: 'ACT-TEST-001',
    opportunity_id: 'OPP-B05-QUAL-001',
    founder_decision_id: 'DEC-B05-APP-001',
    action_type: 'SCHEMA_MARKUP',
    title: 'Deploy Canonical Schema Markup',
    description: 'Deploy canonical Organization JSON-LD markup to index.html.',
    objective: 'Establish definitive canonical organization entity identity.',
    status: 'DRAFTED',
    responsible_actor: 'HUMAN_OPERATOR'
  }, { isFixture: true });

  assert.strictEqual(act.action_id, 'ACT-TEST-001');
  assert.strictEqual(act.status, 'DRAFTED');
  assert.strictEqual(act.is_immutable, false);
});

runTest('T02: Advance Action to READY_FOR_IMPLEMENTATION under approved decision', () => {
  const updated = exec.transitionActionStatus('ACT-TEST-001', 'READY_FOR_IMPLEMENTATION', {
    actor: 'FOUNDER',
    actor_role: 'FOUNDER',
    notes: 'Authorized by Founder for implementation.'
  }, { isFixture: true });

  assert.strictEqual(updated.status, 'READY_FOR_IMPLEMENTATION');
});

runTest('T03: Advance Action to IN_PROGRESS', () => {
  const updated = exec.transitionActionStatus('ACT-TEST-001', 'IN_PROGRESS', {
    actor: 'OPERATOR',
    actor_role: 'OPERATOR',
    notes: 'Implementation work commenced.'
  }, { isFixture: true });

  assert.strictEqual(updated.status, 'IN_PROGRESS');
});

runTest('T04: Advance Action to IMPLEMENTED', () => {
  const updated = exec.transitionActionStatus('ACT-TEST-001', 'IMPLEMENTED', {
    actor: 'OPERATOR',
    actor_role: 'OPERATOR',
    notes: 'Markup verified locally and committed.'
  }, { isFixture: true });

  assert.strictEqual(updated.status, 'IMPLEMENTED');
});

runTest('T05: Advance Action to READY_FOR_VERIFICATION and verify it becomes immutable', () => {
  const updated = exec.transitionActionStatus('ACT-TEST-001', 'READY_FOR_VERIFICATION', {
    actor: 'OPERATOR',
    actor_role: 'OPERATOR',
    notes: 'Implementation finalized; handoff to BUILD-06 verification.'
  }, { isFixture: true });

  assert.strictEqual(updated.status, 'READY_FOR_VERIFICATION');
  assert.strictEqual(updated.is_immutable, true);

  // Attempting to modify this action should fail due to immutability
  assert.throws(() => {
    exec.transitionActionStatus('ACT-TEST-001', 'IN_PROGRESS', { actor: 'OPERATOR' }, { isFixture: true });
  }, /IMMUTABILITY_ERROR/);
});

runTest('T06: Create Experiment in DRAFTED status with valid protocol & rollback plan', () => {
  const exp = exec.createExperiment({
    experiment_id: 'EXP-TEST-001',
    opportunity_id: 'OPP-B05-QUAL-001',
    founder_decision_id: 'DEC-B05-APP-001',
    title: 'Controlled Schema Intervention Test',
    hypothesis: 'Injecting Organization schema will increase brand entity recognition by AI models.',
    reference_run_id: 'RUN-M08-1-T1-REF',
    intervention_id: 'INT-TEST-001',
    prompt_set_id: 'PSET-M08-1-FIXED20',
    protocol_version: '1.0',
    environments: ['ENV-CHATGPT', 'ENV-GEMINI'],
    variables: ['Schema JSON-LD presence'],
    confounders: ['AI model version drift', 'Temporal latency'],
    success_observation: 'Entity mention rate increases from 0% baseline.',
    verification_method: 'Run 20 frozen prompts against target environments.',
    rollback_plan: 'Revert index.html git commit and re-run sanity prompts.',
    status: 'DRAFTED'
  }, { isFixture: true });

  assert.strictEqual(exp.experiment_id, 'EXP-TEST-001');
  assert.strictEqual(exp.status, 'DRAFTED');
  assert.strictEqual(exp.is_immutable, false);
});

runTest('T07: Advance Experiment to READY_FOR_IMPLEMENTATION, IN_PROGRESS, IMPLEMENTED, and READY_FOR_VERIFICATION', () => {
  let exp = exec.transitionExperimentStatus('EXP-TEST-001', 'READY_FOR_IMPLEMENTATION', {
    actor: 'FOUNDER',
    actor_role: 'FOUNDER'
  }, { isFixture: true });
  assert.strictEqual(exp.status, 'READY_FOR_IMPLEMENTATION');

  exp = exec.transitionExperimentStatus('EXP-TEST-001', 'IN_PROGRESS', {
    actor: 'OPERATOR',
    actor_role: 'OPERATOR'
  }, { isFixture: true });
  assert.strictEqual(exp.status, 'IN_PROGRESS');

  exp = exec.transitionExperimentStatus('EXP-TEST-001', 'IMPLEMENTED', {
    actor: 'OPERATOR',
    actor_role: 'OPERATOR'
  }, { isFixture: true });
  assert.strictEqual(exp.status, 'IMPLEMENTED');

  exp = exec.transitionExperimentStatus('EXP-TEST-001', 'READY_FOR_VERIFICATION', {
    actor: 'OPERATOR',
    actor_role: 'OPERATOR'
  }, { isFixture: true });
  assert.strictEqual(exp.status, 'READY_FOR_VERIFICATION');
  assert.strictEqual(exp.is_immutable, true);
});

runTest('T08: Create Intervention with valid parameters', () => {
  const int = exec.createIntervention({
    intervention_id: 'INT-TEST-002',
    intervention_type: 'CANONICAL_SOURCE',
    target: 'knowledge.html',
    description: 'Add authoritative source references to knowledge portal.',
    baseline_state: 'Source citations omitted in knowledge base.',
    intended_change: 'Add bibliographic citations to each knowledge card.',
    implementation_scope: 'GLOBAL',
    rollback_method: 'Revert git commit on knowledge.html.',
    reversible: true,
    status: 'PLANNED'
  }, { isFixture: true });

  assert.strictEqual(int.intervention_id, 'INT-TEST-002');
  assert.strictEqual(int.status, 'PLANNED');
});

runTest('T09: Preserves historical intervention identity pattern (T2-INT-01)', () => {
  const t2Int = exec.createIntervention({
    intervention_id: 'T2-INT-01',
    intervention_type: 'CANONICAL_SOURCE',
    target: 'index.html, knowledge.html',
    description: 'Canonical Entity & Source Discoverability Intervention.',
    baseline_state: 'T1 control state with unlinked canonical entity.',
    intended_change: 'Inject schema markup and authoritative discoverability links.',
    implementation_scope: 'GLOBAL',
    rollback_method: 'Git revert to commit pre-T2-INT-01.',
    reversible: true,
    status: 'ACTIVE'
  }, { isFixture: true });

  assert.strictEqual(t2Int.intervention_id, 'T2-INT-01');
});

runTest('T10: Action with satisfied dependencies allows transition to READY_FOR_IMPLEMENTATION', () => {
  // ACT-TEST-001 is in READY_FOR_VERIFICATION (satisfied!)
  const act = exec.createAction({
    action_id: 'ACT-TEST-DEP-001',
    opportunity_id: 'OPP-B05-QUAL-001',
    founder_decision_id: 'DEC-B05-APP-001',
    action_type: 'CONTENT_UPDATE',
    title: 'Secondary Content Action',
    description: 'Update article metadata after canonical schema is deployed.',
    objective: 'Align article schemas with canonical organization schema.',
    status: 'DRAFTED',
    dependency_refs: ['ACT-TEST-001']
  }, { isFixture: true });

  const updated = exec.transitionActionStatus('ACT-TEST-DEP-001', 'READY_FOR_IMPLEMENTATION', {
    actor: 'FOUNDER',
    actor_role: 'FOUNDER'
  }, { isFixture: true });

  assert.strictEqual(updated.status, 'READY_FOR_IMPLEMENTATION');
});

runTest('T11: Action with unsatisfied dependencies transitions to BLOCKED status', () => {
  // Create an action that depends on a non-implemented action
  const unimplAct = exec.createAction({
    action_id: 'ACT-TEST-PENDING-001',
    opportunity_id: 'OPP-B05-QUAL-001',
    founder_decision_id: 'DEC-B05-APP-001',
    action_type: 'TECHNICAL_SEO',
    title: 'Pending Prerequisite Action',
    description: 'Prerequisite that has not been implemented yet.',
    objective: 'Test prerequisite blocking.',
    status: 'DRAFTED'
  }, { isFixture: true });

  const depAct = exec.createAction({
    action_id: 'ACT-TEST-DEP-002',
    opportunity_id: 'OPP-B05-QUAL-001',
    founder_decision_id: 'DEC-B05-APP-001',
    action_type: 'CONTENT_UPDATE',
    title: 'Dependent Action on Pending Prerequisite',
    description: 'Depends on ACT-TEST-PENDING-001 which is still DRAFTED.',
    objective: 'Verify blocking transition.',
    status: 'DRAFTED',
    dependency_refs: ['ACT-TEST-PENDING-001']
  }, { isFixture: true });

  const blocked = exec.transitionActionStatus('ACT-TEST-DEP-002', 'BLOCKED', {
    actor: 'OPERATOR',
    reason: 'Prerequisite ACT-TEST-PENDING-001 is not yet implemented.'
  }, { isFixture: true });

  assert.strictEqual(blocked.status, 'BLOCKED');
  assert.strictEqual(blocked.blocked_reason, 'Prerequisite ACT-TEST-PENDING-001 is not yet implemented.');
});

runTest('T12: Blocked Action can transition back to READY_FOR_IMPLEMENTATION once prerequisite dependency is IMPLEMENTED', () => {
  // Advance ACT-TEST-PENDING-001 to IMPLEMENTED
  exec.transitionActionStatus('ACT-TEST-PENDING-001', 'READY_FOR_IMPLEMENTATION', { actor: 'FOUNDER' }, { isFixture: true });
  exec.transitionActionStatus('ACT-TEST-PENDING-001', 'IN_PROGRESS', { actor: 'OPERATOR' }, { isFixture: true });
  exec.transitionActionStatus('ACT-TEST-PENDING-001', 'IMPLEMENTED', { actor: 'OPERATOR' }, { isFixture: true });

  // Now ACT-TEST-DEP-002 can be unblocked
  const unblocked = exec.transitionActionStatus('ACT-TEST-DEP-002', 'READY_FOR_IMPLEMENTATION', {
    actor: 'FOUNDER',
    notes: 'Prerequisite completed, unblocking action.'
  }, { isFixture: true });

  assert.strictEqual(unblocked.status, 'READY_FOR_IMPLEMENTATION');
  assert.strictEqual(unblocked.blocked_reason, null);
});

runTest('T13: Full evidence traceability traverser for Action', () => {
  const trace = exec.traceActionEvidenceChain('ACT-TEST-001', { isFixture: true });

  assert(trace.action !== null, 'Action must be present');
  assert(trace.founder_decision !== null, 'Founder decision must be present');
  assert(trace.priority_assessment !== null, 'Priority assessment must be present');
  assert(trace.opportunity !== null, 'Opportunity must be present');
  assert(trace.diagnoses.length > 0, 'Diagnoses must be linked');
  assert(trace.evidence.length > 0, 'Evidence must be linked');
  assert.strictEqual(trace.epistemic_complete, true);
});

runTest('T14: Full evidence traceability traverser for Experiment', () => {
  const trace = exec.traceExperimentEvidenceChain('EXP-TEST-001', { isFixture: true });

  assert(trace.experiment !== null, 'Experiment must be present');
  assert(trace.founder_decision !== null, 'Founder decision must be present');
  assert(trace.opportunity !== null, 'Opportunity must be present');
  assert(trace.intervention !== null, 'Intervention must be present');
  assert(trace.reference_run !== null, 'Reference run must be present');
  assert(trace.prompt_set !== null, 'Prompt set must be present');
  assert(trace.environments.length > 0, 'Environments must be resolved');
  assert.strictEqual(trace.epistemic_complete, true);
});

runTest('T15: Conflict detection detects concurrent actions targeting same opportunity and type', () => {
  // Create an active action
  exec.createAction({
    action_id: 'ACT-TEST-ACTIVE-001',
    opportunity_id: 'OPP-B05-QUAL-001',
    founder_decision_id: 'DEC-B05-APP-001',
    action_type: 'ENTITY_HOMEPAGE_SYNC',
    title: 'Homepage Sync Active Action',
    description: 'Active entity homepage synchronization.',
    objective: 'Test conflict detection.',
    status: 'IN_PROGRESS'
  }, { isFixture: true });

  const conflictCheck = exec.detectExecutionConflicts({
    entity_type: 'action',
    action_id: 'ACT-TEST-CANDIDATE-002',
    opportunity_id: 'OPP-B05-QUAL-001',
    action_type: 'ENTITY_HOMEPAGE_SYNC'
  }, { isFixture: true });

  assert.strictEqual(conflictCheck.conflict_detected, true);
  assert(conflictCheck.conflicts.some(c => c.conflict_type === 'CONCURRENT_OPPORTUNITY_ACTION'));
});

runTest('T16: Conflict detection detects concurrent experiments sharing intervention or prompt set + environments', () => {
  // Create an active experiment
  exec.createExperiment({
    experiment_id: 'EXP-TEST-ACTIVE-001',
    opportunity_id: 'OPP-B05-QUAL-001',
    founder_decision_id: 'DEC-B05-APP-001',
    title: 'Active Experiment 1',
    hypothesis: 'Active hypothesis test.',
    reference_run_id: 'RUN-M08-1-T1-REF',
    intervention_id: 'INT-TEST-001',
    prompt_set_id: 'PSET-M08-1-FIXED20',
    protocol_version: '1.0',
    environments: ['ENV-CHATGPT'],
    success_observation: 'Entity mention rate increases from baseline.',
    verification_method: 'Frozen 20-prompt evaluation.',
    rollback_plan: 'Valid rollback plan of sufficient length.',
    status: 'IN_PROGRESS'
  }, { isFixture: true });

  const conflictCheck = exec.detectExecutionConflicts({
    entity_type: 'experiment',
    experiment_id: 'EXP-TEST-CANDIDATE-002',
    intervention_id: 'INT-TEST-001',
    prompt_set_id: 'PSET-M08-1-FIXED20',
    environments: ['ENV-CHATGPT']
  }, { isFixture: true });

  assert.strictEqual(conflictCheck.conflict_detected, true);
  assert(conflictCheck.conflicts.some(c => c.conflict_type === 'SHARED_INTERVENTION'));
});

runTest('T17: Cancellation transitions: Action and Experiment can transition to CANCELLED', () => {
  const act = exec.createAction({
    action_id: 'ACT-TEST-CANCEL-001',
    opportunity_id: 'OPP-B05-QUAL-001',
    founder_decision_id: 'DEC-B05-APP-001',
    action_type: 'CONTENT_UPDATE',
    title: 'Cancellable Action',
    description: 'Testing action cancellation.',
    objective: 'Test cancellation lifecycle.',
    status: 'DRAFTED'
  }, { isFixture: true });

  const cancelledAct = exec.transitionActionStatus('ACT-TEST-CANCEL-001', 'CANCELLED', {
    actor: 'FOUNDER',
    reason: 'Strategy pivoted before implementation.'
  }, { isFixture: true });
  assert.strictEqual(cancelledAct.status, 'CANCELLED');

  const exp = exec.createExperiment({
    experiment_id: 'EXP-TEST-CANCEL-001',
    opportunity_id: 'OPP-B05-QUAL-001',
    founder_decision_id: 'DEC-B05-APP-001',
    title: 'Cancellable Experiment',
    hypothesis: 'Testing experiment cancellation.',
    reference_run_id: 'RUN-M08-1-T1-REF',
    intervention_id: 'INT-TEST-001',
    prompt_set_id: 'PSET-M08-1-FIXED20',
    protocol_version: '1.0',
    environments: ['ENV-CHATGPT'],
    success_observation: 'Entity mention rate increases from baseline.',
    verification_method: 'Frozen 20-prompt evaluation.',
    rollback_plan: 'Valid rollback plan for experiment.',
    status: 'DRAFTED'
  }, { isFixture: true });

  const cancelledExp = exec.transitionExperimentStatus('EXP-TEST-CANCEL-001', 'CANCELLED', {
    actor: 'FOUNDER',
    reason: 'Experiment cancelled.'
  }, { isFixture: true });
  assert.strictEqual(cancelledExp.status, 'CANCELLED');
});

runTest('T18: Load Action, Experiment, and Intervention by ID via DAL', () => {
  const act = dal.loadEntity('action', 'ACT-TEST-001', { isFixture: true });
  assert(act !== null);
  assert.strictEqual(act.action_id, 'ACT-TEST-001');

  const exp = dal.loadEntity('experiment', 'EXP-TEST-001', { isFixture: true });
  assert(exp !== null);
  assert.strictEqual(exp.experiment_id, 'EXP-TEST-001');

  const int = dal.loadEntity('intervention', 'INT-TEST-001', { isFixture: true });
  assert(int !== null);
  assert.strictEqual(int.intervention_id, 'INT-TEST-001');
});

runTest('T19: List Actions, Experiments, and Interventions via DAL', () => {
  const actions = dal.listActions({ includeFixtures: true });
  assert(Array.isArray(actions) && actions.length > 0);

  const experiments = dal.listExperiments({ includeFixtures: true });
  assert(Array.isArray(experiments) && experiments.length > 0);

  const interventions = dal.listInterventions({ includeFixtures: true });
  assert(Array.isArray(interventions) && interventions.length > 0);
});

runTest('T20: Human operator can advance action lifecycle states with audit context', () => {
  const act = exec.createAction({
    action_id: 'ACT-TEST-LIFECYCLE-001',
    opportunity_id: 'OPP-B05-QUAL-001',
    founder_decision_id: 'DEC-B05-APP-001',
    action_type: 'PROCESS_IMPROVEMENT',
    title: 'Process Lifecycle Action',
    description: 'Human operator lifecycle walkthrough.',
    objective: 'Test complete human operator audit trail.',
    status: 'DRAFTED'
  }, { isFixture: true });

  const advanced = exec.transitionActionStatus('ACT-TEST-LIFECYCLE-001', 'READY_FOR_IMPLEMENTATION', {
    actor: 'FOUNDER',
    actor_role: 'FOUNDER',
    notes: 'Founder approval confirmed.'
  }, { isFixture: true });

  assert.strictEqual(advanced.status, 'READY_FOR_IMPLEMENTATION');
  assert(advanced.implementation_notes.includes('Founder approval confirmed.'));
});

// -------------------------------------------------------------
// NEGATIVE TESTS (N01–N25)
// -------------------------------------------------------------

console.log('\n--- NEGATIVE TESTS (N01–N25) ---');

runTest('N01: Reject Action creation without opportunity_id', () => {
  assert.throws(() => {
    exec.createAction({
      action_id: 'ACT-TEST-N01',
      founder_decision_id: 'DEC-B05-APP-001',
      title: 'Missing Opportunity Action',
      description: 'Action without opportunity_id.',
      objective: 'Objective text.'
    }, { isFixture: true });
  }, /RELATIONSHIP_ERROR/);
});

runTest('N02: Reject Action creation with non-existent opportunity_id', () => {
  assert.throws(() => {
    exec.createAction({
      action_id: 'ACT-TEST-N02',
      opportunity_id: 'OPP-NON-EXISTENT-999',
      founder_decision_id: 'DEC-B05-APP-001',
      title: 'Invalid Opportunity Action',
      description: 'Action referencing fake opportunity.',
      objective: 'Objective text.'
    }, { isFixture: true });
  }, /RELATIONSHIP_ERROR/);
});

runTest('N03: Reject Action creation with UNQUALIFIED opportunity', () => {
  assert.throws(() => {
    exec.createAction({
      action_id: 'ACT-TEST-N03',
      opportunity_id: 'OPP-B05-UNQUAL-002', // Drafted/Unqualified!
      founder_decision_id: 'DEC-B05-APP-001',
      title: 'Action on Unqualified Opportunity',
      description: 'Action referencing drafted opportunity.',
      objective: 'Objective text.'
    }, { isFixture: true });
  }, /GATE_ERROR/);
});

runTest('N04: Reject Action creation without founder_decision_id', () => {
  assert.throws(() => {
    exec.createAction({
      action_id: 'ACT-TEST-N04',
      opportunity_id: 'OPP-B05-QUAL-001',
      title: 'Missing Decision Action',
      description: 'Action without founder_decision_id.',
      objective: 'Objective text.'
    }, { isFixture: true });
  }, /RELATIONSHIP_ERROR/);
});

runTest('N05: Reject Action creation with non-existent founder_decision_id', () => {
  assert.throws(() => {
    exec.createAction({
      action_id: 'ACT-TEST-N05',
      opportunity_id: 'OPP-B05-QUAL-001',
      founder_decision_id: 'DEC-NON-EXISTENT-999',
      title: 'Invalid Decision Action',
      description: 'Action referencing fake founder decision.',
      objective: 'Objective text.'
    }, { isFixture: true });
  }, /RELATIONSHIP_ERROR/);
});

runTest('N06: Reject Action creation with PENDING_REVIEW (undecided) founder decision', () => {
  assert.throws(() => {
    exec.createAction({
      action_id: 'ACT-TEST-N06',
      opportunity_id: 'OPP-B05-QUAL-001',
      founder_decision_id: 'DEC-B05-PEN-005', // Status is PENDING_REVIEW!
      title: 'Undecided Decision Action',
      description: 'Action referencing undecided founder decision.',
      objective: 'Objective text.'
    }, { isFixture: true });
  }, /GATE_ERROR/);
});

runTest('N07: Reject Action entering implementation state when Founder Decision is DEFER', () => {
  const act = exec.createAction({
    action_id: 'ACT-TEST-N07',
    opportunity_id: 'OPP-B05-QUAL-001',
    founder_decision_id: 'DEC-B05-DEF-002', // DEFER decision!
    title: 'Deferred Decision Action',
    description: 'Action on deferred opportunity.',
    objective: 'Objective text.',
    status: 'DRAFTED'
  }, { isFixture: true });

  assert.throws(() => {
    exec.transitionActionStatus('ACT-TEST-N07', 'READY_FOR_IMPLEMENTATION', { actor: 'FOUNDER' }, { isFixture: true });
  }, /GATE_ERROR/);
});

runTest('N08: Reject Action entering implementation state when Founder Decision is REJECT', () => {
  const act = exec.createAction({
    action_id: 'ACT-TEST-N08',
    opportunity_id: 'OPP-B05-QUAL-001',
    founder_decision_id: 'DEC-B05-REJ-003', // REJECT decision!
    title: 'Rejected Decision Action',
    description: 'Action on rejected opportunity.',
    objective: 'Objective text.',
    status: 'DRAFTED'
  }, { isFixture: true });

  assert.throws(() => {
    exec.transitionActionStatus('ACT-TEST-N08', 'READY_FOR_IMPLEMENTATION', { actor: 'FOUNDER' }, { isFixture: true });
  }, /GATE_ERROR/);
});

runTest('N09: Reject Action entering implementation state when Founder Decision is REQUEST_MORE_EVIDENCE', () => {
  const act = exec.createAction({
    action_id: 'ACT-TEST-N09',
    opportunity_id: 'OPP-B05-QUAL-001',
    founder_decision_id: 'DEC-B05-REQ-004', // REQUEST_MORE_EVIDENCE!
    title: 'Evidence Requested Action',
    description: 'Action on opportunity requiring more evidence.',
    objective: 'Objective text.',
    status: 'DRAFTED'
  }, { isFixture: true });

  assert.throws(() => {
    exec.transitionActionStatus('ACT-TEST-N09', 'READY_FOR_IMPLEMENTATION', { actor: 'FOUNDER' }, { isFixture: true });
  }, /GATE_ERROR/);
});

runTest('N10: Reject Action entering implementation state when prerequisite dependency is not IMPLEMENTED', () => {
  // ACT-TEST-DEP-002 depends on ACT-TEST-PENDING-001 which is currently IMPLEMENTED.
  // Let's create an action that depends on a fresh DRAFTED action.
  const draftDep = exec.createAction({
    action_id: 'ACT-TEST-DRAFT-DEP',
    opportunity_id: 'OPP-B05-QUAL-001',
    founder_decision_id: 'DEC-B05-APP-001',
    action_type: 'TECHNICAL_SEO',
    title: 'Draft Dependency',
    description: 'This dependency remains DRAFTED.',
    objective: 'Prerequisite testing.',
    status: 'DRAFTED'
  }, { isFixture: true });

  const act = exec.createAction({
    action_id: 'ACT-TEST-N10',
    opportunity_id: 'OPP-B05-QUAL-001',
    founder_decision_id: 'DEC-B05-APP-001',
    action_type: 'CONTENT_UPDATE',
    title: 'Blocked Action Prerequisite Test',
    description: 'Action with unsatisfied dependency.',
    objective: 'Objective text.',
    status: 'DRAFTED',
    dependency_refs: ['ACT-TEST-DRAFT-DEP']
  }, { isFixture: true });

  assert.throws(() => {
    exec.transitionActionStatus('ACT-TEST-N10', 'READY_FOR_IMPLEMENTATION', { actor: 'FOUNDER' }, { isFixture: true });
  }, /BLOCKING_DEPENDENCY/);
});

runTest('N11: Reject Action modification when status is READY_FOR_VERIFICATION (immutability)', () => {
  assert.throws(() => {
    dal.saveEntity('action', {
      entity_type: 'action',
      schema_version: '1.0',
      action_id: 'ACT-TEST-001', // In READY_FOR_VERIFICATION!
      action_version: '1.0',
      opportunity_id: 'OPP-B05-QUAL-001',
      founder_decision_id: 'DEC-B05-APP-001',
      action_type: 'SCHEMA_MARKUP',
      title: 'Attempting to mutate finalized action',
      description: 'Mutated description.',
      objective: 'Objective text.',
      status: 'READY_FOR_VERIFICATION',
      responsible_actor: 'HUMAN_OPERATOR',
      created_by: 'OPERATOR',
      created_at: new Date().toISOString()
    }, { isFixture: true });
  }, /IMMUTABILITY_VIOLATION/);
});

runTest('N12: Reject Experiment creation without opportunity_id or founder_decision_id', () => {
  assert.throws(() => {
    exec.createExperiment({
      experiment_id: 'EXP-TEST-N12',
      title: 'Missing Opp & Decision',
      hypothesis: 'Missing opportunity and decision hypothesis.',
      reference_run_id: 'RUN-M08-1-T1-REF',
      intervention_id: 'INT-TEST-001',
      prompt_set_id: 'PSET-M08-1-FIXED20',
      environments: ['ENV-CHATGPT'],
      rollback_plan: 'Valid rollback plan.'
    }, { isFixture: true });
  }, /RELATIONSHIP_ERROR/);
});

runTest('N13: Reject Experiment creation with UNAPPROVED founder decision (DEFER)', () => {
  assert.throws(() => {
    exec.createExperiment({
      experiment_id: 'EXP-TEST-N13',
      opportunity_id: 'OPP-B05-QUAL-001',
      founder_decision_id: 'DEC-B05-DEF-002', // DEFER!
      title: 'Experiment on Deferred Decision',
      hypothesis: 'Hypothesis for deferred decision.',
      reference_run_id: 'RUN-M08-1-T1-REF',
      intervention_id: 'INT-TEST-001',
      prompt_set_id: 'PSET-M08-1-FIXED20',
      environments: ['ENV-CHATGPT'],
      rollback_plan: 'Valid rollback plan for experiment.',
      status: 'READY_FOR_IMPLEMENTATION' // Implementation state requires APPROVE
    }, { isFixture: true });
  }, /GATE_ERROR/);
});

runTest('N14: Reject Experiment creation without reference_run_id or non-existent run', () => {
  assert.throws(() => {
    exec.createExperiment({
      experiment_id: 'EXP-TEST-N14',
      opportunity_id: 'OPP-B05-QUAL-001',
      founder_decision_id: 'DEC-B05-APP-001',
      title: 'Missing Reference Run',
      hypothesis: 'Hypothesis with missing reference run.',
      reference_run_id: 'RUN-NON-EXISTENT-999',
      intervention_id: 'INT-TEST-001',
      prompt_set_id: 'PSET-M08-1-FIXED20',
      environments: ['ENV-CHATGPT'],
      rollback_plan: 'Valid rollback plan.'
    }, { isFixture: true });
  }, /RELATIONSHIP_ERROR/);
});

runTest('N15: Reject Experiment creation without intervention_id or non-existent intervention', () => {
  assert.throws(() => {
    exec.createExperiment({
      experiment_id: 'EXP-TEST-N15',
      opportunity_id: 'OPP-B05-QUAL-001',
      founder_decision_id: 'DEC-B05-APP-001',
      title: 'Missing Intervention',
      hypothesis: 'Hypothesis with missing intervention.',
      reference_run_id: 'RUN-M08-1-T1-REF',
      intervention_id: 'INT-NON-EXISTENT-999',
      prompt_set_id: 'PSET-M08-1-FIXED20',
      environments: ['ENV-CHATGPT'],
      rollback_plan: 'Valid rollback plan.'
    }, { isFixture: true });
  }, /RELATIONSHIP_ERROR/);
});

runTest('N16: Reject Experiment creation without prompt_set_id or non-existent prompt set', () => {
  assert.throws(() => {
    exec.createExperiment({
      experiment_id: 'EXP-TEST-N16',
      opportunity_id: 'OPP-B05-QUAL-001',
      founder_decision_id: 'DEC-B05-APP-001',
      title: 'Missing Prompt Set',
      hypothesis: 'Hypothesis with missing prompt set.',
      reference_run_id: 'RUN-M08-1-T1-REF',
      intervention_id: 'INT-TEST-001',
      prompt_set_id: 'PSET-NON-EXISTENT-999',
      environments: ['ENV-CHATGPT'],
      rollback_plan: 'Valid rollback plan.'
    }, { isFixture: true });
  }, /RELATIONSHIP_ERROR/);
});

runTest('N17: Reject Experiment creation without environments or with invalid environment', () => {
  assert.throws(() => {
    exec.createExperiment({
      experiment_id: 'EXP-TEST-N17',
      opportunity_id: 'OPP-B05-QUAL-001',
      founder_decision_id: 'DEC-B05-APP-001',
      title: 'Invalid Environment',
      hypothesis: 'Hypothesis with invalid environment.',
      reference_run_id: 'RUN-M08-1-T1-REF',
      intervention_id: 'INT-TEST-001',
      prompt_set_id: 'PSET-M08-1-FIXED20',
      environments: ['ENV-NON-EXISTENT-999'],
      rollback_plan: 'Valid rollback plan.'
    }, { isFixture: true });
  }, /RELATIONSHIP_ERROR/);
});

runTest('N18: Reject Experiment creation without explicit rollback_plan (< 10 chars)', () => {
  assert.throws(() => {
    exec.createExperiment({
      experiment_id: 'EXP-TEST-N18',
      opportunity_id: 'OPP-B05-QUAL-001',
      founder_decision_id: 'DEC-B05-APP-001',
      title: 'Missing Rollback Plan',
      hypothesis: 'Hypothesis without rollback plan.',
      reference_run_id: 'RUN-M08-1-T1-REF',
      intervention_id: 'INT-TEST-001',
      prompt_set_id: 'PSET-M08-1-FIXED20',
      environments: ['ENV-CHATGPT'],
      rollback_plan: 'short' // Too short (< 10 chars)!
    }, { isFixture: true });
  }, /GOVERNANCE_ERROR/);
});

runTest('N19: Reject Experiment modification when status is READY_FOR_VERIFICATION (immutability)', () => {
  assert.throws(() => {
    dal.saveEntity('experiment', {
      entity_type: 'experiment',
      schema_version: '1.0',
      experiment_id: 'EXP-TEST-001', // In READY_FOR_VERIFICATION!
      experiment_version: '1.0',
      opportunity_id: 'OPP-B05-QUAL-001',
      founder_decision_id: 'DEC-B05-APP-001',
      title: 'Attempting to mutate finalized experiment',
      hypothesis: 'Mutated hypothesis.',
      reference_run_id: 'RUN-M08-1-T1-REF',
      intervention_id: 'INT-TEST-001',
      prompt_set_id: 'PSET-M08-1-FIXED20',
      protocol_version: '1.0',
      environments: ['ENV-CHATGPT'],
      variables: ['Schema JSON-LD presence'],
      confounders: ['AI model version drift'],
      success_observation: 'Entity mention rate increases from 0% baseline.',
      verification_method: 'Run 20 frozen prompts against target environments.',
      rollback_plan: 'Valid rollback plan text.',
      status: 'READY_FOR_VERIFICATION',
      created_by: 'OPERATOR',
      created_at: new Date().toISOString()
    }, { isFixture: true });
  }, /IMMUTABILITY_VIOLATION/);
});

runTest('N20: Reject Intervention creation with forbidden identity INT-T2-01', () => {
  assert.throws(() => {
    exec.createIntervention({
      intervention_id: 'INT-T2-01', // Forbidden! Canonical is T2-INT-01
      intervention_type: 'CANONICAL_SOURCE',
      target: 'index.html',
      description: 'Attempting invalid historical ID.',
      baseline_state: 'Baseline state text.',
      intended_change: 'Intended change text.',
      implementation_scope: 'GLOBAL',
      rollback_method: 'Git rollback.',
      reversible: true
    }, { isFixture: true });
  }, /GOVERNANCE_ERROR/);
});

runTest('N21: Reject AI_ADVISOR attempting to transition Action to READY_FOR_IMPLEMENTATION', () => {
  const act = exec.createAction({
    action_id: 'ACT-TEST-N21',
    opportunity_id: 'OPP-B05-QUAL-001',
    founder_decision_id: 'DEC-B05-APP-001',
    action_type: 'TECHNICAL_SEO',
    title: 'AI Advisor Transition Test',
    description: 'Testing AI advisor authority denial.',
    objective: 'Objective text.',
    status: 'DRAFTED'
  }, { isFixture: true });

  assert.throws(() => {
    exec.transitionActionStatus('ACT-TEST-N21', 'READY_FOR_IMPLEMENTATION', {
      actor: 'AI_ADVISOR',
      actor_role: 'AI_ADVISOR'
    }, { isFixture: true });
  }, /AUTHORITY_ERROR/);
});

runTest('N22: Reject AI_ADVISOR attempting to transition Experiment to implementation states', () => {
  const exp = exec.createExperiment({
    experiment_id: 'EXP-TEST-N22',
    opportunity_id: 'OPP-B05-QUAL-001',
    founder_decision_id: 'DEC-B05-APP-001',
    title: 'AI Advisor Experiment Test',
    hypothesis: 'Testing AI advisor authority rejection.',
    reference_run_id: 'RUN-M08-1-T1-REF',
    intervention_id: 'INT-TEST-001',
    prompt_set_id: 'PSET-M08-1-FIXED20',
    protocol_version: '1.0',
    environments: ['ENV-CHATGPT'],
    success_observation: 'Entity mention rate increases from baseline.',
    verification_method: 'Frozen 20-prompt evaluation.',
    rollback_plan: 'Valid rollback plan for experiment testing.',
    status: 'DRAFTED'
  }, { isFixture: true });

  assert.throws(() => {
    exec.transitionExperimentStatus('EXP-TEST-N22', 'READY_FOR_IMPLEMENTATION', {
      actor: 'AI_ADVISOR',
      actor_role: 'AI_ADVISOR'
    }, { isFixture: true });
  }, /AUTHORITY_ERROR/);
});

runTest('N23: Reject forbidden fields in Action (e.g. outcome_score, verification_score)', () => {
  assert.throws(() => {
    exec.createAction({
      action_id: 'ACT-TEST-N23',
      opportunity_id: 'OPP-B05-QUAL-001',
      founder_decision_id: 'DEC-B05-APP-001',
      title: 'Action with Forbidden Score',
      description: 'Attempting to inject outcome_score.',
      objective: 'Objective text.',
      outcome_score: 95 // Forbidden! Tolerance = 0
    }, { isFixture: true });
  }, /GOVERNANCE_ERROR/);
});

runTest('N24: Reject forbidden fields in Experiment (e.g. learning_score, composite_score)', () => {
  assert.throws(() => {
    exec.createExperiment({
      experiment_id: 'EXP-TEST-N24',
      opportunity_id: 'OPP-B05-QUAL-001',
      founder_decision_id: 'DEC-B05-APP-001',
      title: 'Experiment with Forbidden Score',
      hypothesis: 'Attempting to inject learning score.',
      reference_run_id: 'RUN-M08-1-T1-REF',
      intervention_id: 'INT-TEST-001',
      prompt_set_id: 'PSET-M08-1-T1-FROZEN',
      environments: ['ENV-CHATGPT'],
      rollback_plan: 'Valid rollback plan text.',
      composite_score: 88 // Forbidden!
    }, { isFixture: true });
  }, /GOVERNANCE_ERROR/);
});

runTest('N25: Reject forbidden transitions (e.g. transition to VERIFIED in BUILD-05)', () => {
  const act = exec.createAction({
    action_id: 'ACT-TEST-N25',
    opportunity_id: 'OPP-B05-QUAL-001',
    founder_decision_id: 'DEC-B05-APP-001',
    action_type: 'TECHNICAL_SEO',
    title: 'Scope Leakage Test Action',
    description: 'Testing prevention of BUILD-06 scope leakage.',
    objective: 'Scope boundary verification.',
    status: 'DRAFTED'
  }, { isFixture: true });

  assert.throws(() => {
    exec.transitionActionStatus('ACT-TEST-N25', 'VERIFIED', { actor: 'OPERATOR' }, { isFixture: true });
  }, /SCOPE_ERROR/);
});

// -------------------------------------------------------------
// HISTORICAL DATA INTEGRITY CHECK
// -------------------------------------------------------------

console.log('\n--- HISTORICAL DATA INTEGRITY CHECK ---');

runTest('H01: Production historical T1 dataset remains 100% immutable and intact', () => {
  const t1Run = dal.loadEntity('measurement_run', 'RUN-M08-1-T1-REF');
  assert(t1Run !== null, 'T1 run must exist');
  assert.strictEqual(t1Run.status, 'COMPLETED');
  assert.strictEqual(t1Run.is_immutable, true);
  assert.strictEqual(t1Run.observation_count, 60);

  const observations = dal.listObservations();
  assert.strictEqual(observations.length, 60, 'Exactly 60 T1 observations must remain in production');

  const evidence = dal.listEvidence();
  assert.strictEqual(evidence.length, 60, 'Exactly 60 T1 evidence records must remain in production');

  const prompts = dal.listPrompts();
  assert.strictEqual(prompts.length, 20, 'Exactly 20 prompts must remain in production');
});

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------

console.log('------------------------------------------------------------');
console.log(`TOTAL EXECUTION TESTS  : ${totalTests}`);
console.log(`PASSED TESTS           : ${passedTests} ✓`);
console.log(`FAILED TESTS           : ${failedTests} ✗`);
console.log('------------------------------------------------------------\n');

if (failedTests > 0) {
  console.error(`[FAIL] ${failedTests} test(s) failed.`);
  process.exit(1);
} else {
  console.log('[SUCCESS] All M08.2 Action & Experimentation tests passed cleanly!\n');
}
