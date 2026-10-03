/**
 * LOCATRIA Visibility Operating System v1.0
 * Module 08 — Visibility Growth System (M08.2)
 *
 * BUILD-08: Unified Operating Orchestrator & End-to-End Integration Test Suite v1.0
 *
 * Validates:
 * - E2E-01: Valid measurement flow
 * - E2E-02: Measurement to diagnosis
 * - E2E-03: Diagnosis to opportunity
 * - E2E-04: Opportunity to priority
 * - E2E-05: Founder decision gate (APPROVE)
 * - E2E-06: Founder decision block (DEFER / REJECT)
 * - E2E-07: Action vs Experiment distinction
 * - E2E-08: Implementation to verification decoupling
 * - E2E-09: Outcome vs Hypothesis evaluation
 * - E2E-10: Learning vs System Rule decoupling
 * - E2E-11: Governance review & Governance != Evidence invariant
 * - E2E-12: Historical immutability enforcement
 * - E2E-13: AI authority isolation
 * - E2E-14: Intervention identity discipline (T2-INT-01 vs INT-T2-01)
 * - E2E-15: Full operational lineage traceability
 * - E2E-16: Zero data fabrication baseline
 * - E2E-17: Prerequisite dependency enforcement
 * - E2E-18: Zero composite scoring & ranking invariant
 * - E2E-19: Operational cycle orchestration
 * - E2E-20: Operational and production readiness evaluation
 * - H01: Production historical T1 dataset immutability
 */

'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');

const dal = require('../js/visibility-data/index');
const orch = require('../js/visibility-orchestrator/index');
const domain = require('../js/visibility-domain/index');
const prio = require('../js/visibility-prioritization/index');
const exec = require('../js/visibility-execution/index');
const vfy = require('../js/visibility-verification/index');
const gov = require('../js/visibility-governance/index');

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
console.log('LOCATRIA VISIBILITY OPERATING ORCHESTRATOR TEST SUITE');
console.log('M08.2 BUILD-08 — Unified Operating Orchestrator & E2E v1.0');
console.log('============================================================\n');

// Setup test fixtures
const baseDir = dal.getBaseDir();
const fixtureDir = path.join(baseDir, '_fixtures');
if (fs.existsSync(fixtureDir)) {
  const existingFiles = fs.readdirSync(fixtureDir);
  for (const f of existingFiles) {
    if (f.toLowerCase().includes('-e2e-') || f.toLowerCase().startsWith('orch-')) {
      try { fs.unlinkSync(path.join(fixtureDir, f)); } catch (_) {}
    }
  }
} else {
  fs.mkdirSync(fixtureDir, { recursive: true });
}

// -------------------------------------------------------------
// E2E-01: VALID MEASUREMENT FLOW
// -------------------------------------------------------------
console.log('--- END-TO-END SCENARIOS (E2E-01 – E2E-20) ---');

runTest('E2E-01: Valid measurement flow (Prompt -> Environment -> Run -> Observation -> Evidence -> Metric)', () => {
  const prompt = dal.loadEntity('prompt', 'P01');
  assert.ok(prompt, 'Prompt P01 must exist');
  assert.strictEqual(prompt.status, 'ACTIVE');

  const env = dal.loadEntity('environment', 'ENV-CHATGPT');
  assert.ok(env, 'Environment ENV-CHATGPT must exist');
  assert.strictEqual(env.status, 'ACTIVE');

  const run = dal.loadEntity('measurement_run', 'RUN-M08-1-T1-REF');
  assert.ok(run, 'Measurement Run RUN-M08-1-T1-REF must exist');
  assert.strictEqual(run.status, 'COMPLETED');
  assert.strictEqual(run.run_type, 'CONTROL');
  assert.strictEqual(run.intervention_id, null);

  const obs = dal.loadEntity('observation', 'OBS-T1-CHATGPT-P01');
  assert.ok(obs, 'Observation OBS-T1-CHATGPT-P01 must exist');
  assert.strictEqual(obs.prompt_id, 'P01');
  assert.strictEqual(obs.environment_id, 'ENV-CHATGPT');

  const evd = dal.loadEntity('visibility_evidence', 'EVD-VIS-T1-CHATGPT-P01');
  assert.ok(evd, 'Evidence EVD-VIS-T1-CHATGPT-P01 must exist');
  assert.strictEqual(evd.observation_id, obs.observation_id);
  assert.ok(evd.raw_response && evd.raw_response.length > 0);
});

// -------------------------------------------------------------
// E2E-02: MEASUREMENT TO DIAGNOSIS
// -------------------------------------------------------------
runTest('E2E-02: Measurement to diagnosis (PASS only when required evidence exists)', () => {
  // Negative check: creation without evidence fails
  assert.throws(() => {
    orch.orchestrateDiagnosisCreation({
      diagnosis_id: 'DIAG-E2E-NOEVD',
      title: 'Missing Evidence Diagnosis',
      statement: 'Diagnosis without empirical evidence is illegal.',
      diagnosis_type: 'DISCOVERY_DIAGNOSIS',
      problem_taxonomy: ['V1_DISCOVERY'],
      confidence_state: 'HIGH',
      status: 'DETECTED',
      metric_refs: ['M01_MENTION'],
      run_refs: ['RUN-M08-1-T1-REF'],
      evidence_refs: []
    }, { actor: 'OPERATOR' }, { isFixture: true });
  }, /requires at least one empirical evidence reference/);

  // Positive check: creation with valid empirical evidence succeeds
  const diag = orch.orchestrateDiagnosisCreation({
    diagnosis_id: 'DIAG-E2E-001',
    title: 'Brand Entity Discovery Omission in ChatGPT',
    statement: 'Brand entity completely absent from primary prompt responses in ChatGPT.',
    diagnosis_type: 'DISCOVERY_DIAGNOSIS',
    problem_taxonomy: ['V1_DISCOVERY', 'V4_ENTITY'],
    confidence_state: 'HIGH',
    status: 'DETECTED',
    scope: 'ENVIRONMENT_SPECIFIC',
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
    observation_refs: ['OBS-T1-CHATGPT-P01'],
    environment_refs: ['ENV-CHATGPT'],
    metric_refs: ['M01_MENTION', 'M04_ENTITY_RECOGNITION'],
    run_refs: ['RUN-M08-1-T1-REF']
  }, { actor: 'OPERATOR' }, { isFixture: true });

  assert.strictEqual(diag.diagnosis_id, 'DIAG-E2E-001');
  assert.strictEqual(diag.status, 'DETECTED');
});

// -------------------------------------------------------------
// E2E-03: DIAGNOSIS TO OPPORTUNITY
// -------------------------------------------------------------
runTest('E2E-03: Diagnosis to opportunity (Unvalidated blocks; Validated passes)', () => {
  // 1. Create Opportunity referencing unvalidated diagnosis DIAG-E2E-001
  const opp = orch.orchestrateOpportunityCreation({
    opportunity_id: 'OPP-E2E-001',
    title: 'Deploy Organization Schema to Enable Entity Recognition',
    statement: 'Add canonical schema markup to root domain to address entity absence.',
    scope: 'GLOBAL',
    diagnosis_refs: ['DIAG-E2E-001'],
    problem_taxonomy: ['V1_DISCOVERY', 'V4_ENTITY'],
    qualification_state: 'UNQUALIFIED',
    confidence_state: 'HIGH',
    status: 'DETECTED'
  }, { actor: 'OPERATOR' }, { isFixture: true });

  assert.strictEqual(opp.opportunity_id, 'OPP-E2E-001');

  // 2. Attempt qualification while diagnosis is still DETECTED -> MUST BLOCK
  assert.throws(() => {
    orch.orchestrateOpportunityQualification('OPP-E2E-001', { actor: 'OPERATOR' }, { isFixture: true });
  }, /GATE_ERROR.*must be 'VALIDATED'/);

  // 3. Validate diagnosis
  orch.orchestrateDiagnosisValidation('DIAG-E2E-001', { actor: 'OPERATOR', notes: 'Validated against T1 evidence' }, { isFixture: true });
  const validatedDiag = dal.loadEntity('diagnosis', 'DIAG-E2E-001', { isFixture: true });
  assert.strictEqual(validatedDiag.status, 'VALIDATED');

  // 4. Now qualify opportunity -> MUST PASS
  const qualifiedOpp = orch.orchestrateOpportunityQualification('OPP-E2E-001', { actor: 'OPERATOR' }, { isFixture: true });
  assert.strictEqual(qualifiedOpp.status, 'QUALIFIED');
  assert.strictEqual(qualifiedOpp.qualification_state, 'QUALIFIED');
});

// -------------------------------------------------------------
// E2E-04: OPPORTUNITY TO PRIORITY
// -------------------------------------------------------------
runTest('E2E-04: Opportunity to priority (Qualified opportunity produces transparent priority recommendation)', () => {
  const result = orch.orchestratePriorityAssessment({
    priority_assessment_id: 'PRIO-E2E-001',
    opportunity_id: 'OPP-E2E-001',
    impact: 'HIGH',
    evidence_strength: 'HIGH',
    feasibility: 'HIGH',
    urgency: 'MEDIUM',
    dependency: 'NONE',
    strategic_relevance: 'HIGH',
    impact_basis: 'High visibility impact on primary brand queries.',
    evidence_strength_basis: 'Empirical confirmation from T1 reference run.',
    feasibility_basis: 'Direct static schema deployment.',
    urgency_basis: 'Important foundation for AI visibility experiments.',
    dependency_basis: 'Zero blocking dependencies.',
    strategic_relevance_basis: 'Core foundational entity footprint.',
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01']
  }, { actor: 'OPERATOR' }, { isFixture: true });

  assert.strictEqual(result.assessment.priority_assessment_id, 'PRIO-E2E-001');
  assert.strictEqual(result.recommendation.recommendation, 'P1');
  assert.ok(result.recommendation.rationale && result.recommendation.rationale.length > 0);
  assert.strictEqual(result.assessment.score, undefined);
  assert.strictEqual(result.recommendation.score, undefined);
});

// -------------------------------------------------------------
// E2E-05: FOUNDER DECISION GATE (APPROVE)
// -------------------------------------------------------------
runTest('E2E-05: Founder decision gate (Founder APPROVE authorizes Action implementation readiness)', () => {
  const decision = orch.orchestrateFounderDecision({
    decision_id: 'DEC-E2E-APP-001',
    opportunity_id: 'OPP-E2E-001',
    priority_assessment_id: 'PRIO-E2E-001',
    recommendation: 'P1',
    decision: 'APPROVE',
    decision_reason: 'Approved by Founder: fundamental entity discoverability required.',
    decision_maker: 'FOUNDER'
  }, { actor: 'FOUNDER', actor_role: 'FOUNDER' }, { isFixture: true });

  assert.strictEqual(decision.decision, 'APPROVE');
  assert.strictEqual(decision.status, 'DECIDED');

  const action = orch.orchestrateActionCreation({
    action_id: 'ACT-E2E-001',
    opportunity_id: 'OPP-E2E-001',
    founder_decision_id: 'DEC-E2E-APP-001',
    action_type: 'SCHEMA_MARKUP',
    title: 'Deploy Canonical Organization Schema Markup',
    description: 'Implement JSON-LD Organization markup to index.html and knowledge.html.',
    objective: 'Establish definitive entity identity.',
    status: 'DRAFTED',
    responsible_actor: 'OPERATOR'
  }, { actor: 'OPERATOR' }, { isFixture: true });

  assert.strictEqual(action.status, 'DRAFTED');

  const readyAction = orch.orchestrateImplementationReadiness('action', 'ACT-E2E-001', {
    actor: 'FOUNDER',
    actor_role: 'FOUNDER'
  }, { isFixture: true });

  assert.strictEqual(readyAction.status, 'READY_FOR_IMPLEMENTATION');
});

// -------------------------------------------------------------
// E2E-06: FOUNDER DECISION BLOCK (DEFER / REJECT)
// -------------------------------------------------------------
runTest('E2E-06: Founder decision block (Founder DEFER / REJECT blocks implementation readiness)', () => {
  // Create a second opportunity in DETECTED and qualify it
  orch.orchestrateOpportunityCreation({
    opportunity_id: 'OPP-E2E-002',
    title: 'Experimental Secondary Knowledge Graph Injection',
    statement: 'Inject experimental secondary microdata.',
    scope: 'GLOBAL',
    diagnosis_refs: ['DIAG-E2E-001'],
    problem_taxonomy: ['V2_RETRIEVAL'],
    qualification_state: 'UNQUALIFIED',
    confidence_state: 'HIGH',
    status: 'DETECTED'
  }, { actor: 'OPERATOR' }, { isFixture: true });

  orch.orchestrateOpportunityQualification('OPP-E2E-002', { actor: 'OPERATOR' }, { isFixture: true });

  orch.orchestratePriorityAssessment({
    priority_assessment_id: 'PRIO-E2E-002',
    opportunity_id: 'OPP-E2E-002',
    impact: 'LOW',
    evidence_strength: 'LOW',
    feasibility: 'LOW',
    urgency: 'LOW',
    dependency: 'NONE',
    strategic_relevance: 'LOW',
    impact_basis: 'Unproven experimental benefit.',
    evidence_strength_basis: 'Preliminary hypotheses only.',
    feasibility_basis: 'Complex microdata parser requirements.',
    urgency_basis: 'Non-urgent.',
    dependency_basis: 'None.',
    strategic_relevance_basis: 'Peripheral test.',
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01']
  }, { actor: 'OPERATOR' }, { isFixture: true });

  orch.orchestrateFounderDecision({
    decision_id: 'DEC-E2E-DEF-002',
    opportunity_id: 'OPP-E2E-002',
    priority_assessment_id: 'PRIO-E2E-002',
    recommendation: 'P3',
    decision: 'DEFER',
    decision_reason: 'Deferred by Founder: secondary priority until baseline stabilizes.',
    decision_maker: 'FOUNDER'
  }, { actor: 'FOUNDER', actor_role: 'FOUNDER' }, { isFixture: true });

  orch.orchestrateActionCreation({
    action_id: 'ACT-E2E-DEF-002',
    opportunity_id: 'OPP-E2E-002',
    founder_decision_id: 'DEC-E2E-DEF-002',
    action_type: 'CONTENT_UPDATE',
    title: 'Experimental Knowledge Restructure',
    description: 'Deferred experimental action.',
    objective: 'Test deferred execution block.',
    status: 'DRAFTED',
    responsible_actor: 'OPERATOR'
  }, { actor: 'OPERATOR' }, { isFixture: true });

  assert.throws(() => {
    orch.orchestrateImplementationReadiness('action', 'ACT-E2E-DEF-002', {
      actor: 'OPERATOR',
      actor_role: 'OPERATOR'
    }, { isFixture: true });
  }, /GATE_ERROR.*Founder Decision.*is 'DEFER'/);
});

// -------------------------------------------------------------
// E2E-07: ACTION VS EXPERIMENT
// -------------------------------------------------------------
runTest('E2E-07: Action vs Experiment distinction (Action minimal fields; Experiment enforces rigorous protocol)', () => {
  const act = dal.loadEntity('action', 'ACT-E2E-001', { isFixture: true });
  assert.strictEqual(act.hypothesis, undefined);
  assert.strictEqual(act.confounders, undefined);

  assert.throws(() => {
    orch.orchestrateExperimentCreation({
      experiment_id: 'EXP-E2E-INCOMPLETE',
      opportunity_id: 'OPP-E2E-001',
      founder_decision_id: 'DEC-E2E-APP-001',
      title: 'Incomplete Experiment Missing Protocol Fields'
    }, { actor: 'OPERATOR' }, { isFixture: true });
  }, /VALIDATION_ERROR|RELATIONSHIP_ERROR/);

  const exp = orch.orchestrateExperimentCreation({
    experiment_id: 'EXP-E2E-001',
    opportunity_id: 'OPP-E2E-001',
    founder_decision_id: 'DEC-E2E-APP-001',
    title: 'Controlled Schema Intervention Experiment',
    hypothesis: 'Adding Organization schema will increase brand entity mentions across LLMs.',
    reference_run_id: 'RUN-M08-1-T1-REF',
    intervention_id: 'T2-INT-01',
    prompt_set_id: 'PSET-M08-1-FIXED20',
    protocol_version: '1.0',
    environments: ['ENV-CHATGPT', 'ENV-GEMINI', 'ENV-PERPLEXITY'],
    variables: ['Presence of Organization JSON-LD markup'],
    confounders: ['AI model version drift', 'Temporal latency'],
    success_observation: 'Entity mention rate increases from 0% baseline.',
    verification_method: 'Run 20 frozen prompts against 3 environments.',
    rollback_plan: 'Git revert to commit pre-T2-INT-01 and verify index.html.',
    status: 'DRAFTED'
  }, { actor: 'OPERATOR' }, { isFixture: true });

  assert.strictEqual(exp.experiment_id, 'EXP-E2E-001');
  assert.strictEqual(exp.intervention_id, 'T2-INT-01');
});

// -------------------------------------------------------------
// E2E-08: IMPLEMENTATION TO VERIFICATION DECOUPLING
// -------------------------------------------------------------
runTest('E2E-08: Implementation to verification decoupling (IMPLEMENTED does not auto-produce SUCCESS/IMPROVED/LEARNING)', () => {
  orch.orchestrateImplementationProgress('action', 'ACT-E2E-001', 'IN_PROGRESS', { actor: 'OPERATOR', actor_role: 'OPERATOR' }, { isFixture: true });
  orch.orchestrateImplementationProgress('action', 'ACT-E2E-001', 'IMPLEMENTED', { actor: 'OPERATOR', actor_role: 'OPERATOR' }, { isFixture: true });
  const implementedAct = orch.orchestrateImplementationProgress('action', 'ACT-E2E-001', 'READY_FOR_VERIFICATION', { actor: 'OPERATOR', actor_role: 'OPERATOR' }, { isFixture: true });

  assert.strictEqual(implementedAct.status, 'READY_FOR_VERIFICATION');
  assert.strictEqual(implementedAct.is_immutable, true);
  assert.strictEqual(implementedAct.outcome, undefined);
  assert.strictEqual(implementedAct.verification_status, undefined);
  assert.strictEqual(implementedAct.success, undefined);

  const vfyRecord = orch.orchestrateVerification({
    verification_id: 'VFY-E2E-001',
    subject_type: 'ACTION',
    subject_id: 'ACT-E2E-001',
    founder_decision_id: 'DEC-E2E-APP-001',
    verification_type: 'VFY-01',
    reference_run_id: 'RUN-M08-1-T1-REF',
    verification_method: 'Post-implementation 20-prompt execution across 3 environments.',
    baseline_summary: '20 mentions out of 60 observations (33.3%). Zero verified citations.',
    observed_result: 'Entity mention rate increased to 38 mentions out of 60 observations (63.3%).',
    outcome: 'IMPROVED',
    outcome_confidence: 'HIGH',
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
    status: 'VERIFIED'
  }, { actor: 'OPERATOR', actor_role: 'OPERATOR' }, { isFixture: true });

  assert.strictEqual(vfyRecord.verification_id, 'VFY-E2E-001');
  assert.strictEqual(vfyRecord.outcome, 'IMPROVED');
  assert.strictEqual(vfyRecord.status, 'VERIFIED');
});

// -------------------------------------------------------------
// E2E-09: OUTCOME VS HYPOTHESIS EVALUATION
// -------------------------------------------------------------
runTest('E2E-09: Outcome vs Hypothesis evaluation (Outcome = IMPROVED does not auto-produce Hypothesis = SUPPORTED)', () => {
  const hypothesisEvaluation = vfy.evaluateHypothesisResult(
    'Adding Organization schema will increase brand entity mentions across target LLMs.',
    'IMPROVED',
    { confounder_impact: 'SIGNIFICANT', notes: 'Confounder detected: model weights updated during testing window.' }
  );

  assert.notStrictEqual(hypothesisEvaluation.hypothesis_result, 'SUPPORTED');
  assert.strictEqual(hypothesisEvaluation.hypothesis_result, 'DIRECTIONALLY_SUPPORTED');
});

// -------------------------------------------------------------
// E2E-10: LEARNING VS SYSTEM RULE DECOUPLING
// -------------------------------------------------------------
runTest('E2E-10: Learning vs System Rule decoupling (Learning = VALIDATED does not auto-create active System Rule)', () => {
  const lrn = orch.orchestrateLearning({
    learning_id: 'LRN-E2E-001',
    source_verification_refs: ['VFY-E2E-001'],
    hypothesis_result: 'SUPPORTED',
    learning_type: 'L3',
    statement: 'Deploying structured Organization JSON-LD markup reliably improves entity recognition in search LLMs.',
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
    confidence: 'HIGH',
    applicability: 'All client static web properties',
    limitations: 'Subject to search engine crawler re-indexing latency',
    status: 'DRAFTED'
  }, { actor: 'OPERATOR' }, { isFixture: true });

  orch.orchestrateLearningValidation('LRN-E2E-001', { actor: 'OPERATOR', notes: 'Validated against empirical test run' }, { isFixture: true });
  const validatedLrn = dal.loadEntity('learning', 'LRN-E2E-001', { isFixture: true });
  assert.strictEqual(validatedLrn.status, 'VALIDATED');

  const allRules = dal.listSystemRules({ isFixture: true });
  const autoCreated = allRules.find(r => (r.source_learning_refs || []).includes('LRN-E2E-001'));
  assert.strictEqual(autoCreated, undefined, 'System rule must NOT be auto-created upon learning validation');

  const rule = orch.orchestrateSystemRule({
    system_rule_id: 'SR-E2E-001',
    rule_statement: 'Always deploy schema.org Organization JSON-LD before launching visibility campaigns.',
    source_learning_refs: ['LRN-E2E-001'],
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
    applicability: 'All client digital properties.',
    limitations: 'Subject to crawler indexing cycles.'
  }, { actor: 'OPERATOR' }, { isFixture: true });

  assert.strictEqual(rule.system_rule_id, 'SR-E2E-001');
  assert.strictEqual(rule.status, 'DRAFT');

  assert.throws(() => {
    orch.orchestrateSystemRuleActivation('SR-E2E-001', { actor: 'AI_ADVISOR', actor_role: 'AI_ADVISOR' }, { isFixture: true });
  }, /AUTHORITY_ERROR/);

  const activeRule = orch.orchestrateSystemRuleActivation('SR-E2E-001', {
    actor: 'FOUNDER',
    decision_reason: 'Approved by Founder: empirically verified across T1 control set.'
  }, { isFixture: true });

  assert.strictEqual(activeRule.status, 'ACTIVE');
  assert.strictEqual(activeRule.approved_by, 'FOUNDER');
});

// -------------------------------------------------------------
// E2E-11: GOVERNANCE & GOVERNANCE != EVIDENCE INVARIANT
// -------------------------------------------------------------
runTest('E2E-11: Governance review & Governance != Evidence invariant', () => {
  const govIssue = orch.orchestrateGovernanceIssue({
    governance_id: 'GOV-E2E-001',
    governance_type: 'OPERATIONAL',
    governance_level: 'G1',
    subject_type: 'OBSERVATION',
    subject_id: 'OBS-T1-CHATGPT-P01',
    issue: 'Minor crawler latency observed during verification execution.',
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
    current_state: 'DETECTED',
    required_action: 'Monitor crawler index logs.'
  }, { actor: 'OPERATOR' }, { isFixture: true });

  assert.strictEqual(govIssue.governance_id, 'GOV-E2E-001');

  assert.throws(() => {
    orch.orchestrateDiagnosisCreation({
      diagnosis_id: 'DIAG-E2E-INVALID-GOV',
      title: 'Invalid Diagnosis Using Governance As Evidence',
      statement: 'Attempting to use a governance issue as empirical evidence.',
      diagnosis_type: 'DISCOVERY_DIAGNOSIS',
      problem_taxonomy: ['V1_DISCOVERY'],
      confidence_state: 'HIGH',
      status: 'DETECTED',
      metric_refs: ['M01_MENTION'],
      run_refs: ['RUN-M08-1-T1-REF'],
      evidence_refs: ['GOV-E2E-001']
    }, { actor: 'OPERATOR' }, { isFixture: true });
  }, /INVARIANT_VIOLATION.*Governance record 'GOV-E2E-001' cannot be accepted as empirical evidence/);
});

// -------------------------------------------------------------
// E2E-12: HISTORICAL IMMUTABILITY ENFORCEMENT
// -------------------------------------------------------------
runTest('E2E-12: Historical immutability enforcement (Overwriting completed runs or historical observations is blocked)', () => {
  const t1Run = dal.loadEntity('measurement_run', 'RUN-M08-1-T1-REF');
  assert.strictEqual(t1Run.is_immutable, true);

  assert.throws(() => {
    dal.saveEntity('measurement_run', { ...t1Run, notes: 'Attempted mutation' });
  }, /IMMUTABILITY_VIOLATION/);

  const t1Obs = dal.loadEntity('observation', 'OBS-T1-CHATGPT-P01');
  assert.throws(() => {
    dal.saveEntity('observation', { ...t1Obs, mention: 'NO' });
  }, /IMMUTABILITY_VIOLATION/);

  const t1Evd = dal.loadEntity('visibility_evidence', 'EVD-VIS-T1-CHATGPT-P01');
  assert.throws(() => {
    dal.saveEntity('visibility_evidence', { ...t1Evd, raw_response: 'Corrupted text' });
  }, /IMMUTABILITY_VIOLATION/);
});

// -------------------------------------------------------------
// E2E-13: AI AUTHORITY ISOLATION
// -------------------------------------------------------------
runTest('E2E-13: AI authority isolation (AI_ADVISOR is blocked from all sovereign actions)', () => {
  const aiContext = { actor: 'AI_ADVISOR', actor_role: 'AI_ADVISOR' };

  assert.throws(() => {
    orch.orchestrateDiagnosisValidation('DIAG-E2E-001', aiContext, { isFixture: true });
  }, /AUTHORITY_ERROR/);

  assert.throws(() => {
    orch.orchestrateOpportunityQualification('OPP-E2E-001', aiContext, { isFixture: true });
  }, /AUTHORITY_ERROR/);

  assert.throws(() => {
    orch.orchestrateFounderDecision({
      decision_id: 'DEC-E2E-AI-001',
      opportunity_id: 'OPP-E2E-001',
      priority_assessment_id: 'PRIO-E2E-001',
      recommendation: 'P1',
      decision: 'APPROVE',
      decision_reason: 'AI attempted sovereign approval',
      decision_maker: 'AI_ADVISOR'
    }, aiContext, { isFixture: true });
  }, /AUTHORITY_ERROR/);

  assert.throws(() => {
    orch.orchestrateImplementationReadiness('action', 'ACT-E2E-001', aiContext, { isFixture: true });
  }, /AUTHORITY_ERROR/);

  assert.throws(() => {
    orch.orchestrateVerification({
      verification_id: 'VFY-E2E-AI-001',
      subject_type: 'ACTION',
      subject_id: 'ACT-E2E-001',
      founder_decision_id: 'DEC-E2E-APP-001',
      verification_type: 'VFY-01',
      evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
      status: 'VERIFIED'
    }, aiContext, { isFixture: true });
  }, /AUTHORITY_ERROR/);

  assert.throws(() => {
    orch.orchestrateLearningValidation('LRN-E2E-001', aiContext, { isFixture: true });
  }, /AUTHORITY_ERROR/);

  assert.throws(() => {
    orch.orchestrateSystemRuleActivation('SR-E2E-001', aiContext, { isFixture: true });
  }, /AUTHORITY_ERROR/);

  assert.throws(() => {
    orch.orchestrateExceptionApproval('EXC-E2E-001', aiContext, { isFixture: true });
  }, /AUTHORITY_ERROR/);

  assert.throws(() => {
    orch.orchestrateChangeApproval('CR-E2E-001', aiContext, { isFixture: true });
  }, /AUTHORITY_ERROR/);

  assert.throws(() => {
    dal.deleteEntity('diagnosis', 'DIAG-E2E-001', { actor_type: 'AI_ADVISOR', session: { actor_role: 'AI_ADVISOR' }, isFixture: true });
  }, /PERMISSION_DENIED|AUTHORITY_ERROR/);
});

// -------------------------------------------------------------
// E2E-14: INTERVENTION IDENTITY DISCIPLINE
// -------------------------------------------------------------
runTest('E2E-14: Intervention identity discipline (Accepts T2-INT-01; Rejects INT-T2-01)', () => {
  assert.doesNotThrow(() => {
    orch.assertValidInterventionIdentity('T2-INT-01');
  });

  assert.throws(() => {
    orch.assertValidInterventionIdentity('INT-T2-01');
  }, /GUARDRAIL_VIOLATION.*Forbidden intervention alias 'INT-T2-01'/);

  const t1Run = dal.loadEntity('measurement_run', 'RUN-M08-1-T1-REF');
  assert.strictEqual(t1Run.intervention_id, null);
});

// -------------------------------------------------------------
// E2E-15: FULL OPERATIONAL LINEAGE TRACEABILITY
// -------------------------------------------------------------
runTest('E2E-15: Full operational lineage traceability (End-to-end trace from Prompt to System Rule)', () => {
  const lineage = orch.traceOperationalLineage({
    opportunity_id: 'OPP-E2E-001',
    action_id: 'ACT-E2E-001'
  }, { isFixture: true });

  assert.strictEqual(lineage.chain_complete, true, 'Complete 11-stage lineage must resolve');
  assert.ok(lineage.prompt && lineage.prompt.prompt_id === 'P01');
  assert.ok(lineage.environment && lineage.environment.environment_id === 'ENV-CHATGPT');
  assert.ok(lineage.measurement_run && lineage.measurement_run.run_id === 'RUN-M08-1-T1-REF');
  assert.ok(lineage.observation && lineage.observation.observation_id === 'OBS-T1-CHATGPT-P01');
  assert.ok(lineage.evidence.length > 0 && lineage.evidence[0].evidence_id === 'EVD-VIS-T1-CHATGPT-P01');
  assert.ok(lineage.diagnosis && lineage.diagnosis.diagnosis_id === 'DIAG-E2E-001');
  assert.ok(lineage.opportunity && lineage.opportunity.opportunity_id === 'OPP-E2E-001');
  assert.ok(lineage.priority_assessment && lineage.priority_assessment.priority_assessment_id === 'PRIO-E2E-001');
  assert.ok(lineage.founder_decision && lineage.founder_decision.decision_id === 'DEC-E2E-APP-001');
  assert.ok(lineage.action_or_experiment && lineage.action_or_experiment.action_id === 'ACT-E2E-001');
  assert.ok(lineage.verification && lineage.verification.verification_id === 'VFY-E2E-001');
  assert.ok(lineage.learning && lineage.learning.learning_id === 'LRN-E2E-001');
  assert.ok(lineage.system_rule && lineage.system_rule.system_rule_id === 'SR-E2E-001');
});

// -------------------------------------------------------------
// E2E-16: ZERO DATA FABRICATION BASELINE
// -------------------------------------------------------------
runTest('E2E-16: Zero data fabrication baseline (Missing URL/citation/retrieval = UNVERIFIED; No invented data)', () => {
  const evd = dal.loadEntity('visibility_evidence', 'EVD-VIS-T1-CHATGPT-P01');
  const obs = dal.loadEntity('observation', 'OBS-T1-CHATGPT-P01');

  assert.strictEqual(obs.retrieval, 'UNVERIFIED');
  assert.strictEqual(obs.verified_citation, 'NO');

  if (evd.source_url) {
    assert.ok(!evd.source_url.includes('fake-locatria.com'));
    assert.ok(!evd.source_url.includes('example.com'));
  }
});

// -------------------------------------------------------------
// E2E-17: PREREQUISITE DEPENDENCY ENFORCEMENT
// -------------------------------------------------------------
runTest('E2E-17: Prerequisite dependency enforcement (Action with unfulfilled prerequisite cannot enter implementation)', () => {
  orch.orchestrateActionCreation({
    action_id: 'ACT-E2E-PREREQ-A',
    opportunity_id: 'OPP-E2E-001',
    founder_decision_id: 'DEC-E2E-APP-001',
    action_type: 'SCHEMA_MARKUP',
    title: 'Prerequisite Schema Base',
    description: 'Foundational schema deployment.',
    objective: 'Prerequisite task.',
    status: 'DRAFTED',
    responsible_actor: 'OPERATOR'
  }, { actor: 'OPERATOR' }, { isFixture: true });

  orch.orchestrateActionCreation({
    action_id: 'ACT-E2E-DEPENDENT-B',
    opportunity_id: 'OPP-E2E-001',
    founder_decision_id: 'DEC-E2E-APP-001',
    action_type: 'CONTENT_UPDATE',
    title: 'Dependent Content Optimization',
    description: 'Requires base schema.',
    objective: 'Dependent task.',
    dependency_refs: ['ACT-E2E-PREREQ-A'],
    status: 'DRAFTED',
    responsible_actor: 'OPERATOR'
  }, { actor: 'OPERATOR' }, { isFixture: true });

  assert.throws(() => {
    orch.orchestrateImplementationReadiness('action', 'ACT-E2E-DEPENDENT-B', {
      actor: 'OPERATOR',
      actor_role: 'OPERATOR'
    }, { isFixture: true });
  }, /BLOCKING_DEPENDENCY.*ACT-E2E-PREREQ-A.*DRAFTED/);
});

// -------------------------------------------------------------
// E2E-18: ZERO COMPOSITE SCORING & RANKING INVARIANT
// -------------------------------------------------------------
runTest('E2E-18: Zero composite scoring & ranking invariant (Rejects payloads containing forbidden scoring fields)', () => {
  assert.throws(() => {
    orch.orchestrateDiagnosisCreation({
      diagnosis_id: 'DIAG-E2E-SCORE',
      title: 'Diagnosis with Forbidden Score',
      statement: 'Attempting to inject a composite visibility score.',
      diagnosis_type: 'DISCOVERY_DIAGNOSIS',
      problem_taxonomy: ['V1_DISCOVERY'],
      confidence_state: 'HIGH',
      status: 'DETECTED',
      metric_refs: ['M01_MENTION'],
      run_refs: ['RUN-M08-1-T1-REF'],
      visibility_score: 87.5,
      evidence_refs: ['EVD-VIS-T1-CHATGPT-P01']
    }, { actor: 'OPERATOR' }, { isFixture: true });
  }, /INVARIANT_VIOLATION.*Forbidden scoring\/ranking field/);

  assert.throws(() => {
    orch.orchestrateOpportunityCreation({
      opportunity_id: 'OPP-E2E-SCORE',
      title: 'Opportunity with Priority Weight',
      statement: 'Attempting to add algorithm rank.',
      scope: 'GLOBAL',
      diagnosis_refs: ['DIAG-E2E-001'],
      problem_taxonomy: ['V1_DISCOVERY'],
      priority_weight: 9.2,
      status: 'DETECTED'
    }, { actor: 'OPERATOR' }, { isFixture: true });
  }, /INVARIANT_VIOLATION.*Forbidden scoring\/ranking field/);
});

// -------------------------------------------------------------
// E2E-19: OPERATIONAL CYCLE ORCHESTRATION
// -------------------------------------------------------------
runTest('E2E-19: Operational cycle orchestration (Monthly and Quarterly reviews aggregate operational status cleanly)', () => {
  const periodStart = new Date(Date.now() - 30 * 86400000).toISOString();
  const periodEnd = new Date().toISOString();

  const monthlyReview = orch.orchestrateOperatingReview(
    gov.REVIEW_TYPES.MONTHLY_OPERATING,
    periodStart,
    periodEnd,
    { isFixture: true }
  );

  assert.strictEqual(monthlyReview.review_type, 'MONTHLY_OPERATING');
  assert.ok(monthlyReview.activity_summary, 'Monthly review must have activity summary');
  assert.ok(Array.isArray(monthlyReview.issues_for_review));
  assert.ok(Array.isArray(monthlyReview.exceptions_for_review));

  const quarterlyReview = orch.orchestrateOperatingReview(
    gov.REVIEW_TYPES.QUARTERLY_STRATEGIC,
    periodStart,
    periodEnd,
    { isFixture: true }
  );

  assert.strictEqual(quarterlyReview.review_type, 'QUARTERLY_STRATEGIC');
  assert.ok(quarterlyReview.strategic_agenda, 'Quarterly review must have strategic agenda');
});

// -------------------------------------------------------------
// E2E-20: OPERATIONAL AND PRODUCTION READINESS EVALUATION
// -------------------------------------------------------------
runTest('E2E-20: Operational and production readiness evaluation (Evaluates G01..G08 and confirms PR-READY status)', () => {
  const readiness = orch.checkOperationalReadiness({ isFixture: true });

  assert.ok(readiness.gates_evaluated === 8, 'Must evaluate exactly 8 control gates (G01..G08)');
  assert.strictEqual(readiness.zero_scores_enforced, true);
  assert.strictEqual(readiness.historical_integrity_verified, true);
  assert.strictEqual(readiness.intervention_identity_canonical, true);
  assert.strictEqual(readiness.founder_authority_isolated, true);

  assert.ok(
    readiness.status === 'PR-READY' || readiness.status === 'PR-READY-WITH-CONDITIONS',
    `Expected PR-READY, got ${readiness.status}`
  );
});

// -------------------------------------------------------------
// HISTORICAL DATA INTEGRITY CHECK (H01)
// -------------------------------------------------------------
console.log('\n--- HISTORICAL DATA INTEGRITY CHECK ---');

runTest('H01: Production historical T1 dataset remains 100% immutable and intact', () => {
  const t1Run = dal.loadEntity('measurement_run', 'RUN-M08-1-T1-REF');
  assert.strictEqual(t1Run.status, 'COMPLETED');
  assert.strictEqual(t1Run.run_type, 'CONTROL');
  assert.strictEqual(t1Run.intervention_id, null);

  const prompts = dal.listPrompts();
  assert.strictEqual(prompts.length, 20, 'Canonical prompts must remain exactly 20');

  const promptSet = dal.loadEntity('prompt_set', 'PSET-M08-1-FIXED20');
  assert.strictEqual(promptSet.prompt_ids.length, 20);

  const envs = dal.listEnvironments();
  assert.strictEqual(envs.length, 3, 'Canonical environments must remain exactly 3');

  const obs = dal.listObservations();
  assert.strictEqual(obs.length, 60, 'Canonical observations must remain exactly 60');

  const evd = dal.listEvidence();
  assert.strictEqual(evd.length, 60, 'Canonical evidence must remain exactly 60');
});

console.log('------------------------------------------------------------');
console.log(`TOTAL ORCHESTRATOR TESTS : ${totalTests}`);
console.log(`PASSED TESTS             : ${passedTests} ✓`);
console.log(`FAILED TESTS             : ${failedTests} ✗`);
console.log('------------------------------------------------------------\n');

if (failedTests > 0) {
  console.error(`[ERROR] ${failedTests} test(s) failed in M08.2 Operating Orchestrator suite.`);
  process.exit(1);
} else {
  console.log('[SUCCESS] All M08.2 Operating Orchestrator & E2E tests passed cleanly!\n');
}
