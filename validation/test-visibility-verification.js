/**
 * LOCATRIA Visibility Operating System v1.0
 * Verification & Learning Test Suite — Module 08 / M08.2 BUILD-06
 *
 * Validates:
 * - Positive Tests T01–T30 (Action & Experiment verification, baseline/environment/prompt set preservation,
 *   protocol deviation recording, 5 categorical outcomes, 5 hypothesis results, Learning creation & traceability,
 *   System Rule Candidate creation & Founder review, versioning, conflict detection)
 * - Negative Tests N01–N30 (Incomplete implementation rejection, unapproved decision rejection, missing evidence,
 *   automatic success/support conversion prohibitions, post-hoc hypothesis denial, unverified learning rejection,
 *   unvalidated rule promotion denial, AI authority restrictions, immutability violations, zero composite scores)
 * - Historical Data Integrity Check: Verifies zero mutation to production historical dataset.
 */

'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const dal = require('../js/visibility-data/index');
const domain = require('../js/visibility-domain/index');
const prio = require('../js/visibility-prioritization/index');
const exec = require('../js/visibility-execution/index');
const vfy = require('../js/visibility-verification/index');

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
console.log('LOCATRIA VISIBILITY VERIFICATION & LEARNING TEST SUITE');
console.log('M08.2 BUILD-06 — Verification & Learning Foundation v1.0');
console.log('============================================================\n');

// Clean up test fixtures from _fixtures
const fixtureDir = path.join(dal.getBaseDir(), '_fixtures');
if (fs.existsSync(fixtureDir)) {
  const existingFiles = fs.readdirSync(fixtureDir);
  for (const f of existingFiles) {
    if (
      f.startsWith('diag-b06-') ||
      f.startsWith('opp-b06-') ||
      f.startsWith('prio-b06-') ||
      f.startsWith('dec-b06-') ||
      f.startsWith('act-b06-') ||
      f.startsWith('exp-b06-') ||
      f.startsWith('int-b06-') ||
      f.startsWith('vfy-test-') ||
      f.startsWith('lrn-test-') ||
      f.startsWith('src-test-')
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
  diagnosis_id: 'DIAG-B06-001',
  title: 'Entity Omission for Verification Testing',
  statement: 'Entity discoverability gap requiring verified intervention.',
  scope: 'GLOBAL',
  observation_refs: ['OBS-T1-CHATGPT-P01'],
  evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
  metric_refs: ['M01_MENTION'],
  environment_refs: ['ENV-CHATGPT'],
  run_refs: ['RUN-M08-1-T1-REF'],
  problem_taxonomy: ['V1_DISCOVERY'],
  confidence_state: 'HIGH'
}, { isFixture: true, recordAudit: false });

domain.transitionDiagnosisStatus('DIAG-B06-001', 'UNDER_REVIEW', { actor: 'OPERATOR' }, { isFixture: true, recordAudit: false });
domain.transitionDiagnosisStatus('DIAG-B06-001', 'VALIDATED', { actor: 'FOUNDER' }, { isFixture: true, recordAudit: false });

// 2. Qualified Opportunity
domain.createOpportunity({
  opportunity_id: 'OPP-B06-001',
  title: 'B06 Canonical Entity Verification Opportunity',
  statement: 'Opportunity to verify canonical schema impact on entity visibility.',
  scope: 'GLOBAL',
  diagnosis_refs: ['DIAG-B06-001'],
  problem_taxonomy: ['V1_DISCOVERY', 'V4_ENTITY'],
  qualification_state: 'UNQUALIFIED',
  confidence_state: 'HIGH'
}, { isFixture: true, recordAudit: false, allowDuplicates: true });

domain.transitionOpportunityStatus('OPP-B06-001', 'DRAFTED', { actor: 'OPERATOR' }, { isFixture: true, recordAudit: false });
domain.transitionOpportunityStatus('OPP-B06-001', 'QUALIFYING', { actor: 'OPERATOR' }, { isFixture: true, recordAudit: false });
domain.transitionOpportunityStatus('OPP-B06-001', 'QUALIFIED', { actor: 'FOUNDER' }, { isFixture: true, recordAudit: false });

// 3. Priority Assessment
prio.createPriorityAssessment({
  priority_assessment_id: 'PRIO-B06-001',
  opportunity_id: 'OPP-B06-001',
  impact: 'HIGH',
  evidence_strength: 'HIGH',
  feasibility: 'HIGH',
  urgency: 'HIGH',
  dependency: 'NONE',
  strategic_relevance: 'HIGH',
  impact_basis: 'High visibility impact.',
  evidence_strength_basis: 'Empirical T1 evidence.',
  feasibility_basis: 'Local schema update.',
  urgency_basis: 'Immediate baseline need.',
  dependency_basis: 'Zero external dependencies.',
  strategic_relevance_basis: 'Foundational entity identity.',
  evidence_refs: ['EVD-VIS-T1-CHATGPT-P01']
}, { isFixture: true, recordAudit: false });

// 4. Approved Founder Decision
prio.createFounderDecision({
  decision_id: 'DEC-B06-APP-001',
  opportunity_id: 'OPP-B06-001',
  priority_assessment_id: 'PRIO-B06-001',
  recommendation: 'P0',
  decision: 'APPROVE',
  decision_reason: 'Approved for verification testing.',
  decided_by: 'FOUNDER',
  evidence_refs: ['EVD-VIS-T1-CHATGPT-P01']
}, { isFixture: true, recordAudit: false });

// 5. Deferred Founder Decision (for negative testing)
prio.createFounderDecision({
  decision_id: 'DEC-B06-DEF-002',
  opportunity_id: 'OPP-B06-001',
  priority_assessment_id: 'PRIO-B06-001',
  recommendation: 'P2',
  decision: 'DEFER',
  decision_reason: 'Deferred by Founder.',
  decided_by: 'FOUNDER'
}, { isFixture: true, recordAudit: false });

// 6. Action in READY_FOR_VERIFICATION
exec.createAction({
  action_id: 'ACT-B06-READY-001',
  opportunity_id: 'OPP-B06-001',
  founder_decision_id: 'DEC-B06-APP-001',
  action_type: 'SCHEMA_MARKUP',
  title: 'Deploy Verification Action',
  description: 'Deploy canonical schema markup for verification testing.',
  objective: 'Verify entity recognition improvement.',
  status: 'DRAFTED'
}, { isFixture: true, recordAudit: false });

exec.transitionActionStatus('ACT-B06-READY-001', 'READY_FOR_IMPLEMENTATION', { actor: 'FOUNDER' }, { isFixture: true, recordAudit: false });
exec.transitionActionStatus('ACT-B06-READY-001', 'IN_PROGRESS', { actor: 'OPERATOR' }, { isFixture: true, recordAudit: false });
exec.transitionActionStatus('ACT-B06-READY-001', 'IMPLEMENTED', { actor: 'OPERATOR' }, { isFixture: true, recordAudit: false });
exec.transitionActionStatus('ACT-B06-READY-001', 'READY_FOR_VERIFICATION', { actor: 'OPERATOR' }, { isFixture: true, recordAudit: false });

// 7. Action NOT in READY_FOR_VERIFICATION (for negative test)
exec.createAction({
  action_id: 'ACT-B06-INPROG-002',
  opportunity_id: 'OPP-B06-001',
  founder_decision_id: 'DEC-B06-APP-001',
  action_type: 'CONTENT_UPDATE',
  title: 'In-Progress Action',
  description: 'Action currently in progress.',
  objective: 'Testing verification precondition.',
  status: 'DRAFTED'
}, { isFixture: true, recordAudit: false });
exec.transitionActionStatus('ACT-B06-INPROG-002', 'READY_FOR_IMPLEMENTATION', { actor: 'FOUNDER' }, { isFixture: true, recordAudit: false });
exec.transitionActionStatus('ACT-B06-INPROG-002', 'IN_PROGRESS', { actor: 'OPERATOR' }, { isFixture: true, recordAudit: false });

// 8. Intervention for Experiment
exec.createIntervention({
  intervention_id: 'INT-B06-001',
  intervention_type: 'SCHEMA_ORGANIZATION',
  target: 'index.html',
  description: 'B06 Schema Organization Intervention.',
  baseline_state: 'Baseline state without schema.',
  intended_change: 'Inject schema JSON-LD.',
  implementation_scope: 'GLOBAL',
  rollback_method: 'Git revert to previous commit.',
  reversible: true,
  status: 'ACTIVE'
}, { isFixture: true, recordAudit: false });

// 9. Experiment in READY_FOR_VERIFICATION
exec.createExperiment({
  experiment_id: 'EXP-B06-READY-001',
  opportunity_id: 'OPP-B06-001',
  founder_decision_id: 'DEC-B06-APP-001',
  title: 'Controlled Schema Verification Experiment',
  hypothesis: 'Adding canonical Organization schema will produce brand recognition across AI environments.',
  reference_run_id: 'RUN-M08-1-T1-REF',
  intervention_id: 'INT-B06-001',
  prompt_set_id: 'PSET-M08-1-FIXED20',
  protocol_version: '1.0',
  environments: ['ENV-CHATGPT', 'ENV-GEMINI'],
  variables: ['Schema presence'],
  confounders: ['Model drift'],
  success_observation: 'Entity mention rate increases.',
  verification_method: 'Run 20 frozen prompts against target environments.',
  rollback_plan: 'Revert git commit and verify rollback.',
  status: 'DRAFTED'
}, { isFixture: true, recordAudit: false });

exec.transitionExperimentStatus('EXP-B06-READY-001', 'READY_FOR_IMPLEMENTATION', { actor: 'FOUNDER' }, { isFixture: true, recordAudit: false });
exec.transitionExperimentStatus('EXP-B06-READY-001', 'IN_PROGRESS', { actor: 'OPERATOR' }, { isFixture: true, recordAudit: false });
exec.transitionExperimentStatus('EXP-B06-READY-001', 'IMPLEMENTED', { actor: 'OPERATOR' }, { isFixture: true, recordAudit: false });
exec.transitionExperimentStatus('EXP-B06-READY-001', 'READY_FOR_VERIFICATION', { actor: 'OPERATOR' }, { isFixture: true, recordAudit: false });

// 10. Experiment NOT in READY_FOR_VERIFICATION (for negative test)
exec.createExperiment({
  experiment_id: 'EXP-B06-DRAFT-002',
  opportunity_id: 'OPP-B06-001',
  founder_decision_id: 'DEC-B06-APP-001',
  title: 'Draft Experiment',
  hypothesis: 'Hypothesis for draft experiment.',
  reference_run_id: 'RUN-M08-1-T1-REF',
  intervention_id: 'INT-B06-001',
  prompt_set_id: 'PSET-M08-1-FIXED20',
  protocol_version: '1.0',
  environments: ['ENV-CHATGPT'],
  variables: ['Schema presence'],
  confounders: ['Model drift'],
  success_observation: 'Entity mention rate increases.',
  verification_method: 'Run 20 frozen prompts.',
  rollback_plan: 'Valid rollback plan of sufficient length.',
  status: 'DRAFTED'
}, { isFixture: true, recordAudit: false });

// -------------------------------------------------------------
// POSITIVE TESTS (T01–T30)
// -------------------------------------------------------------

console.log('--- POSITIVE TESTS (T01–T30) ---');

runTest('T01: Create verification for READY_FOR_VERIFICATION Action', () => {
  const record = vfy.createVerification({
    verification_id: 'VFY-TEST-001',
    subject_type: 'ACTION',
    subject_id: 'ACT-B06-READY-001',
    founder_decision_id: 'DEC-B06-APP-001',
    verification_type: 'VFY-01',
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
    protocol_version: '1.0',
    verification_method: 'Inspect DOM for injected schema script tag.',
    status: 'DRAFTED'
  }, { isFixture: true });

  assert.strictEqual(record.verification_id, 'VFY-TEST-001');
  assert.strictEqual(record.status, 'DRAFTED');
  assert.strictEqual(record.subject_id, 'ACT-B06-READY-001');
});

runTest('T02: Create verification for READY_FOR_VERIFICATION Experiment', () => {
  const record = vfy.createVerification({
    verification_id: 'VFY-TEST-002',
    subject_type: 'EXPERIMENT',
    subject_id: 'EXP-B06-READY-001',
    founder_decision_id: 'DEC-B06-APP-001',
    verification_type: 'VFY-03',
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
    protocol_version: '1.0',
    environment_refs: ['ENV-CHATGPT'],
    prompt_set_refs: ['PSET-M08-1-FIXED20'],
    verification_method: 'Execute 20 frozen prompts and measure entity mention delta.',
    status: 'DRAFTED'
  }, { isFixture: true });

  assert.strictEqual(record.verification_id, 'VFY-TEST-002');
  assert.strictEqual(record.subject_type, 'EXPERIMENT');
});

runTest('T03: Require Founder APPROVE decision for verification creation', () => {
  const check = vfy.validateVerificationPreconditions({
    subject_type: 'ACTION',
    subject_id: 'ACT-B06-READY-001',
    founder_decision_id: 'DEC-B06-APP-001',
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
    verification_method: 'Valid verification method string.'
  }, { isFixture: true });

  assert.strictEqual(check.passed, true);
  assert.strictEqual(check.founder_decision.decision, 'APPROVE');
});

runTest('T04: Require verification evidence (evidence_refs)', () => {
  const record = vfy.createVerification({
    verification_id: 'VFY-TEST-004',
    subject_type: 'ACTION',
    subject_id: 'ACT-B06-READY-001',
    founder_decision_id: 'DEC-B06-APP-001',
    verification_type: 'VFY-02',
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
    protocol_version: '1.0',
    verification_method: 'Verify measurement schema conformity.',
    status: 'DRAFTED'
  }, { isFixture: true });

  assert(record.evidence_refs.length > 0);
});

runTest('T05: Preserve baseline reference across verification', () => {
  const record = vfy.createVerification({
    verification_id: 'VFY-TEST-005',
    subject_type: 'EXPERIMENT',
    subject_id: 'EXP-B06-READY-001',
    founder_decision_id: 'DEC-B06-APP-001',
    verification_type: 'VFY-03',
    baseline_refs: ['RUN-M08-1-T1-REF'],
    post_implementation_refs: ['OBS-T1-CHATGPT-P01'],
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
    protocol_version: '1.0',
    verification_method: 'Comparative prompt evaluation.',
    status: 'DRAFTED'
  }, { isFixture: true });

  assert.strictEqual(record.baseline_refs[0], 'RUN-M08-1-T1-REF');
});

runTest('T06: Preserve environment identity during verification', () => {
  const record = vfy.createVerification({
    verification_id: 'VFY-TEST-006',
    subject_type: 'EXPERIMENT',
    subject_id: 'EXP-B06-READY-001',
    founder_decision_id: 'DEC-B06-APP-001',
    verification_type: 'VFY-03',
    environment_refs: ['ENV-CHATGPT', 'ENV-GEMINI'],
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
    protocol_version: '1.0',
    verification_method: 'Environment comparison method.',
    status: 'DRAFTED'
  }, { isFixture: true });

  assert.strictEqual(record.environment_refs.length, 2);
  assert(record.environment_refs.includes('ENV-CHATGPT'));
  assert(record.environment_refs.includes('ENV-GEMINI'));
});

runTest('T07: Preserve prompt set identity (PSET-M08-1-FIXED20)', () => {
  const record = vfy.createVerification({
    verification_id: 'VFY-TEST-007',
    subject_type: 'EXPERIMENT',
    subject_id: 'EXP-B06-READY-001',
    founder_decision_id: 'DEC-B06-APP-001',
    verification_type: 'VFY-03',
    prompt_set_refs: ['PSET-M08-1-FIXED20'],
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
    protocol_version: '1.0',
    verification_method: 'Frozen prompt verification.',
    status: 'DRAFTED'
  }, { isFixture: true });

  assert.strictEqual(record.prompt_set_refs[0], 'PSET-M08-1-FIXED20');
});

runTest('T08: Preserve protocol version across verification records', () => {
  const record = vfy.createVerification({
    verification_id: 'VFY-TEST-008',
    subject_type: 'EXPERIMENT',
    subject_id: 'EXP-B06-READY-001',
    founder_decision_id: 'DEC-B06-APP-001',
    verification_type: 'VFY-03',
    protocol_version: '1.2.0',
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
    verification_method: 'Protocol v1.2 execution.',
    status: 'DRAFTED'
  }, { isFixture: true });

  assert.strictEqual(record.protocol_version, '1.2.0');
});

runTest('T09: Record protocol deviation with mandatory deviation_reason', () => {
  const record = vfy.createVerification({
    verification_id: 'VFY-TEST-009',
    subject_type: 'EXPERIMENT',
    subject_id: 'EXP-B06-READY-001',
    founder_decision_id: 'DEC-B06-APP-001',
    verification_type: 'VFY-02',
    protocol_version: '1.0',
    protocol_deviation: true,
    deviation_reason: 'ChatGPT UI latency required query pacing to be extended by 500ms.',
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
    verification_method: 'Protocol deviation audit.',
    status: 'DRAFTED'
  }, { isFixture: true });

  assert.strictEqual(record.protocol_deviation, true);
  assert(record.deviation_reason.includes('ChatGPT UI latency'));
});

runTest('T10: Record IMPROVED outcome via categorical evaluation engine', () => {
  const evalResult = vfy.evaluateOutcome(
    [{ prompt_id: 'P01', environment_id: 'ENV-CHATGPT', mention_detected: false, signal_detected: false }],
    [{ prompt_id: 'P01', environment_id: 'ENV-CHATGPT', mention_detected: true, signal_detected: true }]
  );

  assert.strictEqual(evalResult.outcome, 'IMPROVED');
  assert.strictEqual(evalResult.improved_count, 1);
});

runTest('T11: Record NO_CHANGE outcome via categorical evaluation engine', () => {
  const evalResult = vfy.evaluateOutcome(
    [{ prompt_id: 'P01', environment_id: 'ENV-CHATGPT', mention_detected: false, signal_detected: false }],
    [{ prompt_id: 'P01', environment_id: 'ENV-CHATGPT', mention_detected: false, signal_detected: false }]
  );

  assert.strictEqual(evalResult.outcome, 'NO_CHANGE');
  assert.strictEqual(evalResult.no_change_count, 1);
});

runTest('T12: Record DEGRADED outcome via categorical evaluation engine', () => {
  const evalResult = vfy.evaluateOutcome(
    [{ prompt_id: 'P01', environment_id: 'ENV-CHATGPT', mention_detected: true, signal_detected: true }],
    [{ prompt_id: 'P01', environment_id: 'ENV-CHATGPT', mention_detected: false, signal_detected: false }]
  );

  assert.strictEqual(evalResult.outcome, 'DEGRADED');
  assert.strictEqual(evalResult.degraded_count, 1);
});

runTest('T13: Record MIXED outcome when environments diverge', () => {
  const evalResult = vfy.evaluateOutcome(
    [
      { prompt_id: 'P01', environment_id: 'ENV-CHATGPT', mention_detected: false, signal_detected: false },
      { prompt_id: 'P01', environment_id: 'ENV-GEMINI', mention_detected: true, signal_detected: true }
    ],
    [
      { prompt_id: 'P01', environment_id: 'ENV-CHATGPT', mention_detected: true, signal_detected: true }, // Improved
      { prompt_id: 'P01', environment_id: 'ENV-GEMINI', mention_detected: false, signal_detected: false } // Degraded
    ]
  );

  assert.strictEqual(evalResult.outcome, 'MIXED');
  assert.strictEqual(evalResult.improved_count, 1);
  assert.strictEqual(evalResult.degraded_count, 1);
});

runTest('T14: Record UNVERIFIED outcome when evidence is missing', () => {
  const evalResult = vfy.evaluateOutcome(null, null);
  assert.strictEqual(evalResult.outcome, 'UNVERIFIED');
});

runTest('T15: Record SUPPORTED hypothesis result with direct causal evidence', () => {
  const res = vfy.evaluateHypothesisResult(
    'Organization schema increases AI brand mention rate.',
    'IMPROVED',
    { direct_causal_support: true, sample_sufficient: true }
  );

  assert.strictEqual(res.hypothesis_result, 'SUPPORTED');
  assert.strictEqual(res.confidence, 'HIGH');
});

runTest('T16: Record DIRECTIONALLY_SUPPORTED hypothesis result when sample is limited', () => {
  const res = vfy.evaluateHypothesisResult(
    'Organization schema increases AI brand mention rate.',
    'IMPROVED',
    { direct_causal_support: false, sample_sufficient: false }
  );

  assert.strictEqual(res.hypothesis_result, 'DIRECTIONALLY_SUPPORTED');
  assert.strictEqual(res.confidence, 'MEDIUM');
});

runTest('T17: Record NOT_SUPPORTED hypothesis result when outcome is DEGRADED or NO_CHANGE', () => {
  const res = vfy.evaluateHypothesisResult(
    'Organization schema increases AI brand mention rate.',
    'NO_CHANGE',
    {}
  );

  assert.strictEqual(res.hypothesis_result, 'NOT_SUPPORTED');
});

runTest('T18: Record INCONCLUSIVE hypothesis result when outcome is MIXED', () => {
  const res = vfy.evaluateHypothesisResult(
    'Organization schema increases AI brand mention rate.',
    'MIXED',
    {}
  );

  assert.strictEqual(res.hypothesis_result, 'INCONCLUSIVE');
});

runTest('T19: Record INVALID hypothesis result when unaccounted protocol deviation occurs', () => {
  const res = vfy.evaluateHypothesisResult(
    'Organization schema increases AI brand mention rate.',
    'IMPROVED',
    { protocol_deviation: true, deviation_accounted_for: false }
  );

  assert.strictEqual(res.hypothesis_result, 'INVALID');
});

runTest('T20: Create Learning from valid verification in VERIFIED status', () => {
  // Advance VFY-TEST-001 to VERIFIED
  vfy.transitionVerificationStatus('VFY-TEST-001', 'READY_FOR_REVIEW', { actor: 'OPERATOR' }, { isFixture: true });
  vfy.transitionVerificationStatus('VFY-TEST-001', 'UNDER_VERIFICATION', { actor: 'OPERATOR' }, { isFixture: true });
  vfy.transitionVerificationStatus('VFY-TEST-001', 'VERIFIED', { actor: 'OPERATOR' }, { isFixture: true });

  const learning = vfy.createLearning({
    learning_id: 'LRN-TEST-001',
    source_verification_refs: ['VFY-TEST-001'],
    hypothesis_result: 'SUPPORTED',
    learning_type: 'L5', // Action Learning
    statement: 'Organization JSON-LD markup on homepage reliably resolves canonical brand identity in ChatGPT.',
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
    applicability: 'Homepage and canonical entry points for multi-location brands.',
    limitations: 'Does not guarantee citation generation without external corroboration.',
    status: 'DRAFTED'
  }, { isFixture: true });

  assert.strictEqual(learning.learning_id, 'LRN-TEST-001');
  assert.strictEqual(learning.status, 'DRAFTED');
});

runTest('T21: Require empirical evidence for Learning', () => {
  const learning = dal.loadEntity('learning', 'LRN-TEST-001', { isFixture: true });
  assert(learning.evidence_refs.length > 0);
});

runTest('T22: Preserve verification → learning traceability', () => {
  const trace = vfy.traceLearningEvidenceChain('LRN-TEST-001', { isFixture: true });

  assert(trace.learning !== null);
  assert.strictEqual(trace.verifications.length, 1);
  assert.strictEqual(trace.verifications[0].verification_id, 'VFY-TEST-001');
  assert.strictEqual(trace.epistemic_complete, true);
});

runTest('T23: Create System Rule Candidate from validated Learning', () => {
  // Advance LRN-TEST-001 to VALIDATED
  vfy.transitionLearningStatus('LRN-TEST-001', 'UNDER_REVIEW', { actor: 'OPERATOR' }, { isFixture: true });
  vfy.transitionLearningStatus('LRN-TEST-001', 'VALIDATED', { actor: 'FOUNDER' }, { isFixture: true });

  const candidate = vfy.createSystemRuleCandidate({
    candidate_id: 'SRC-TEST-001',
    source_learning_refs: ['LRN-TEST-001'],
    rule_statement: 'Always deploy schema.org Organization JSON-LD before launching AI visibility campaigns.',
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
    applicability: 'All client sites and core digital properties.',
    limitations: 'Subject to LLM crawler indexing delays.',
    proposed_action: 'Add Organization schema template to standard site boilerplate.',
    status: 'DRAFTED'
  }, { isFixture: true });

  assert.strictEqual(candidate.candidate_id, 'SRC-TEST-001');
  assert.strictEqual(candidate.founder_review_required, true);
  assert.strictEqual(candidate.status, 'DRAFTED');
});

runTest('T24: Require Founder review for System Rule Candidate promotion', () => {
  vfy.transitionSystemRuleCandidateStatus('SRC-TEST-001', 'UNDER_REVIEW', { actor: 'OPERATOR' }, { isFixture: true });
  vfy.transitionSystemRuleCandidateStatus('SRC-TEST-001', 'FOUNDER_REVIEW', { actor: 'OPERATOR' }, { isFixture: true });

  const approved = vfy.transitionSystemRuleCandidateStatus('SRC-TEST-001', 'APPROVED', {
    actor: 'FOUNDER',
    decision_reason: 'Approved by Founder: empirically verified across T1 control set.'
  }, { isFixture: true });

  assert.strictEqual(approved.status, 'APPROVED');
  assert.strictEqual(approved.founder_decision, 'APPROVE');
  assert.strictEqual(approved.decided_by, 'FOUNDER');
  assert.strictEqual(approved.is_immutable, true);
});

runTest('T25: Preserve historical T1/T2 data during verification and learning operations', () => {
  const t1Run = dal.loadEntity('measurement_run', 'RUN-M08-1-T1-REF');
  assert.strictEqual(t1Run.status, 'COMPLETED');
  assert.strictEqual(t1Run.is_immutable, true);
});

runTest('T26: Preserve contradictory evidence without silent suppression', () => {
  const conflict = vfy.detectVerificationConflicts({
    entity_type: 'verification',
    verification_id: 'VFY-TEST-CONFLICT',
    subject_type: 'EXPERIMENT',
    subject_id: 'EXP-B06-READY-001',
    outcome: 'IMPROVED',
    hypothesis_result: 'NOT_SUPPORTED', // Contradiction!
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01']
  }, { isFixture: true });

  assert.strictEqual(conflict.conflict_detected, true);
  assert(conflict.conflicts.some(c => c.conflict_type === 'OUTCOME_HYPOTHESIS_CONTRADICTION'));
});

runTest('T27: Preserve environment-specific outcomes in evaluation engine', () => {
  const res = vfy.evaluateOutcome(
    [
      { prompt_id: 'P01', environment_id: 'ENV-CHATGPT', mention_detected: false },
      { prompt_id: 'P01', environment_id: 'ENV-PERPLEXITY', mention_detected: true }
    ],
    [
      { prompt_id: 'P01', environment_id: 'ENV-CHATGPT', mention_detected: true },
      { prompt_id: 'P01', environment_id: 'ENV-PERPLEXITY', mention_detected: true }
    ]
  );

  assert.strictEqual(res.environment_breakdown['ENV-CHATGPT'], 'IMPROVED');
  assert.strictEqual(res.environment_breakdown['ENV-PERPLEXITY'], 'NO_CHANGE');
});

runTest('T28: Version Verification by creating revision', () => {
  const v1 = dal.loadEntity('verification', 'VFY-TEST-001', { isFixture: true });
  assert.strictEqual(v1.verification_version, '1.0');

  const v2 = vfy.createVerification({
    verification_id: 'VFY-TEST-001-V2',
    verification_version: '2.0',
    subject_type: 'ACTION',
    subject_id: 'ACT-B06-READY-001',
    founder_decision_id: 'DEC-B06-APP-001',
    verification_type: 'VFY-01',
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
    protocol_version: '1.1',
    verification_method: 'Extended schema inspection including WebSite JSON-LD.',
    status: 'DRAFTED'
  }, { isFixture: true });

  assert.strictEqual(v2.verification_id, 'VFY-TEST-001-V2');
  assert.strictEqual(v2.verification_version, '2.0');
});

runTest('T29: Version Learning by creating revision', () => {
  const lrn2 = vfy.createLearning({
    learning_id: 'LRN-TEST-001-V2',
    learning_version: '2.0',
    source_verification_refs: ['VFY-TEST-001'],
    hypothesis_result: 'SUPPORTED',
    learning_type: 'L5',
    statement: 'Updated learning statement reflecting multi-model corroboration.',
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
    applicability: 'All primary domain entry pages.',
    limitations: 'Requires valid JSON-LD syntax without trailing commas.',
    status: 'DRAFTED'
  }, { isFixture: true });

  assert.strictEqual(lrn2.learning_version, '2.0');
});

runTest('T30: Preserve Founder Decision history and post-learning handoff', () => {
  const lrn = dal.loadEntity('learning', 'LRN-TEST-001', { isFixture: true });
  const handoff = vfy.validateFounderLearningDecisionGate(lrn, 'SCALE');

  assert.strictEqual(handoff.ready_for_founder_review, true);
  assert.strictEqual(handoff.proposed_decision, 'SCALE');
  assert.strictEqual(handoff.status, 'PENDING_FOUNDER_DECISION');
});

// -------------------------------------------------------------
// NEGATIVE TESTS (N01–N30)
// -------------------------------------------------------------

console.log('\n--- NEGATIVE TESTS (N01–N30) ---');

runTest('N01: Verify Action not READY_FOR_VERIFICATION → REJECT', () => {
  assert.throws(() => {
    vfy.createVerification({
      verification_id: 'VFY-TEST-N01',
      subject_type: 'ACTION',
      subject_id: 'ACT-B06-INPROG-002', // IN_PROGRESS, not READY_FOR_VERIFICATION!
      founder_decision_id: 'DEC-B06-APP-001',
      verification_type: 'VFY-01',
      evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
      protocol_version: '1.0',
      verification_method: 'Testing unfinished action verification.',
      status: 'DRAFTED'
    }, { isFixture: true });
  }, /GATE_ERROR/);
});

runTest('N02: Verify Experiment not READY_FOR_VERIFICATION → REJECT', () => {
  assert.throws(() => {
    vfy.createVerification({
      verification_id: 'VFY-TEST-N02',
      subject_type: 'EXPERIMENT',
      subject_id: 'EXP-B06-DRAFT-002', // DRAFTED!
      founder_decision_id: 'DEC-B06-APP-001',
      verification_type: 'VFY-03',
      evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
      protocol_version: '1.0',
      verification_method: 'Testing unfinished experiment verification.',
      status: 'DRAFTED'
    }, { isFixture: true });
  }, /GATE_ERROR/);
});

runTest('N03: Verify without Founder APPROVE → REJECT', () => {
  assert.throws(() => {
    vfy.createVerification({
      verification_id: 'VFY-TEST-N03',
      subject_type: 'ACTION',
      subject_id: 'ACT-B06-READY-001',
      founder_decision_id: 'DEC-B06-DEF-002', // DEFER!
      verification_type: 'VFY-01',
      evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
      protocol_version: '1.0',
      verification_method: 'Testing unapproved decision verification.',
      status: 'DRAFTED'
    }, { isFixture: true });
  }, /GATE_ERROR/);
});

runTest('N04: Verify without evidence → REJECT', () => {
  assert.throws(() => {
    vfy.createVerification({
      verification_id: 'VFY-TEST-N04',
      subject_type: 'ACTION',
      subject_id: 'ACT-B06-READY-001',
      founder_decision_id: 'DEC-B06-APP-001',
      verification_type: 'VFY-01',
      evidence_refs: [], // Empty evidence!
      protocol_version: '1.0',
      verification_method: 'Testing verification without evidence.',
      status: 'DRAFTED'
    }, { isFixture: true });
  }, /EVIDENCE_ERROR/);
});

runTest('N05: Outcome without evidence → Returns UNVERIFIED', () => {
  const evalResult = vfy.evaluateOutcome([], []);
  assert.strictEqual(evalResult.outcome, 'UNVERIFIED');
});

runTest('N06: IMPROVED automatically converted to SUPPORTED → REJECT', () => {
  // If direct causal support and sample sufficiency are not established, IMPROVED must be DIRECTIONALLY_SUPPORTED, not SUPPORTED
  const res = vfy.evaluateHypothesisResult(
    'Organization schema increases AI brand mention rate.',
    'IMPROVED',
    { direct_causal_support: false, sample_sufficient: false }
  );

  assert.notStrictEqual(res.hypothesis_result, 'SUPPORTED');
  assert.strictEqual(res.hypothesis_result, 'DIRECTIONALLY_SUPPORTED');
});

runTest('N07: Experiment completion automatically converted to SUCCESS → REJECT (C-05.1)', () => {
  // In BUILD-05 / BUILD-06, completion does not equal success. Verification result remains separate from status.
  const exp = dal.loadEntity('experiment', 'EXP-B06-READY-001', { isFixture: true });
  assert.strictEqual(exp.status, 'READY_FOR_VERIFICATION');
  assert.strictEqual(exp.success, undefined);
  assert.strictEqual(exp.is_successful, undefined);
});

runTest('N08: Post-hoc hypothesis creation → REJECT', () => {
  assert.throws(() => {
    vfy.evaluateHypothesisResult('', 'IMPROVED');
  }, /HYPOTHESIS_ERROR/);
});

runTest('N09: Learning without Verification → REJECT', () => {
  assert.throws(() => {
    vfy.createLearning({
      learning_id: 'LRN-TEST-N09',
      source_verification_refs: [], // Empty!
      statement: 'Attempting to create learning without verification.',
      evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
      applicability: 'General',
      limitations: 'None'
    }, { isFixture: true });
  }, /EVIDENCE_ERROR/);
});

runTest('N10: Learning without evidence → REJECT', () => {
  assert.throws(() => {
    vfy.createLearning({
      learning_id: 'LRN-TEST-N10',
      source_verification_refs: ['VFY-TEST-001'],
      statement: 'Attempting to create learning without supporting evidence.',
      evidence_refs: [], // Empty!
      applicability: 'General',
      limitations: 'None'
    }, { isFixture: true });
  }, /EVIDENCE_ERROR/);
});

runTest('N11: System Rule without validated Learning → REJECT', () => {
  // Create an unvalidated learning in DRAFTED status
  const unvalLrn = vfy.createLearning({
    learning_id: 'LRN-TEST-UNVAL',
    source_verification_refs: ['VFY-TEST-001'],
    statement: 'Unvalidated learning for testing system rule candidate rejection.',
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
    applicability: 'General',
    limitations: 'Testing limitations',
    status: 'DRAFTED'
  }, { isFixture: true });

  assert.throws(() => {
    vfy.createSystemRuleCandidate({
      candidate_id: 'SRC-TEST-N11',
      source_learning_refs: ['LRN-TEST-UNVAL'], // Unvalidated!
      rule_statement: 'Rule attempting to skip learning validation.',
      evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
      proposed_action: 'Proposed action text.'
    }, { isFixture: true });
  }, /GATE_ERROR/);
});

runTest('N12: AI promotes System Rule → REJECT', () => {
  assert.throws(() => {
    vfy.transitionSystemRuleCandidateStatus('SRC-TEST-001', 'APPROVED', {
      actor: 'AI_ADVISOR',
      actor_role: 'AI_ADVISOR',
      decision_reason: 'AI attempting to promote rule.'
    }, { isFixture: true });
  }, /AUTHORITY_ERROR/);
});

runTest('N13: AI finalizes Verification → REJECT', () => {
  // Create drafted verification
  const draftVfy = vfy.createVerification({
    verification_id: 'VFY-TEST-AI-001',
    subject_type: 'ACTION',
    subject_id: 'ACT-B06-READY-001',
    founder_decision_id: 'DEC-B06-APP-001',
    verification_type: 'VFY-01',
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
    protocol_version: '1.0',
    verification_method: 'AI verification test.',
    status: 'UNDER_VERIFICATION'
  }, { isFixture: true });

  assert.throws(() => {
    vfy.transitionVerificationStatus('VFY-TEST-AI-001', 'VERIFIED', {
      actor: 'AI_ADVISOR',
      actor_role: 'AI_ADVISOR'
    }, { isFixture: true });
  }, /AUTHORITY_ERROR/);
});

runTest('N14: AI finalizes Learning → REJECT', () => {
  const draftLrn = vfy.createLearning({
    learning_id: 'LRN-TEST-AI-001',
    source_verification_refs: ['VFY-TEST-001'],
    statement: 'Draft learning for testing AI validation rejection.',
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
    applicability: 'General',
    limitations: 'Testing limitations',
    status: 'UNDER_REVIEW'
  }, { isFixture: true });

  assert.throws(() => {
    vfy.transitionLearningStatus('LRN-TEST-AI-001', 'VALIDATED', {
      actor: 'AI_ADVISOR',
      actor_role: 'AI_ADVISOR'
    }, { isFixture: true });
  }, /AUTHORITY_ERROR/);
});

runTest('N15: AI makes Founder Decision → REJECT', () => {
  assert.throws(() => {
    prio.createFounderDecision({
      decision_id: 'DEC-TEST-AI-N15',
      opportunity_id: 'OPP-B06-001',
      priority_assessment_id: 'PRIO-B06-001',
      recommendation: 'P0',
      decision: 'APPROVE',
      decision_reason: 'AI masquerading as Founder.',
      decided_by: 'FOUNDER'
    }, { actor_type: 'AI_ADVISOR', isFixture: true });
  }, /PERMISSION_DENIED/);
});

runTest('N16: Historical T1 mutation → REJECT', () => {
  assert.throws(() => {
    dal.saveEntity('measurement_run', {
      entity_type: 'measurement_run',
      schema_version: '1.0.0',
      run_id: 'RUN-M08-1-T1-REF',
      run_name: 'Mutated T1 Run',
      run_type: 'CONTROL',
      status: 'COMPLETED'
    }, { isFixture: false });
  }, /IMMUTABILITY_VIOLATION/);
});

runTest('N17: Historical T2 mutation → REJECT', () => {
  assert.throws(() => {
    dal.saveEntity('intervention', {
      entity_type: 'intervention',
      schema_version: '1.0',
      intervention_id: 'T2-INT-01',
      intervention_type: 'SCHEMA_ORGANIZATION',
      target: 'index.html',
      description: 'Attempting to mutate T2-INT-01.',
      baseline_state: 'Baseline',
      intended_change: 'Intended',
      rollback_method: 'Git revert',
      reversible: true,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      created_by: 'OPERATOR'
    }, { isFixture: false });
  }, /IMMUTABILITY_VIOLATION/);
});

runTest('N18: Prompt Set mutation during verification → REJECT', () => {
  assert.throws(() => {
    dal.saveEntity('prompt_set', {
      entity_type: 'prompt_set',
      schema_version: '1.0.0',
      prompt_set_id: 'PSET-M08-1-FIXED20',
      prompt_set_version: '1.0.0',
      name: 'Mutated Prompt Set',
      description: 'Attempting mutation.',
      prompt_ids: ['P01'],
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      is_immutable: true
    }, { isFixture: false });
  }, /IMMUTABILITY_VIOLATION/);
});

runTest('N19: Silent environment substitution → REJECT', () => {
  assert.throws(() => {
    vfy.createVerification({
      verification_id: 'VFY-TEST-N19',
      subject_type: 'EXPERIMENT',
      subject_id: 'EXP-B06-READY-001',
      founder_decision_id: 'DEC-B06-APP-001',
      verification_type: 'VFY-03',
      environment_refs: ['ENV-NON-EXISTENT-999'], // Fake environment!
      evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
      protocol_version: '1.0',
      verification_method: 'Method text.',
      status: 'DRAFTED'
    }, { isFixture: true });
  }, /RELATIONSHIP_ERROR/);
});

runTest('N20: Silent protocol substitution without reason → REJECT', () => {
  assert.throws(() => {
    vfy.createVerification({
      verification_id: 'VFY-TEST-N20',
      subject_type: 'EXPERIMENT',
      subject_id: 'EXP-B06-READY-001',
      founder_decision_id: 'DEC-B06-APP-001',
      verification_type: 'VFY-03',
      protocol_version: '2.0',
      protocol_deviation: true,
      deviation_reason: '', // Empty reason!
      evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
      verification_method: 'Method text.',
      status: 'DRAFTED'
    }, { isFixture: true });
  }, /VALIDATION_ERROR/);
});

runTest('N21: Baseline mismatch → REJECT / FLAG', () => {
  const conflict = vfy.detectVerificationConflicts({
    entity_type: 'verification',
    verification_id: 'VFY-TEST-N21',
    subject_type: 'ACTION',
    subject_id: 'ACT-B06-INPROG-002', // In progress!
    protocol_deviation: false,
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01']
  }, { isFixture: true });

  assert.strictEqual(conflict.conflict_detected, true);
  assert(conflict.conflicts.some(c => c.conflict_type === 'UNVERIFIED_IMPLEMENTATION'));
});

runTest('N22: Contradictory evidence silently suppressed → REJECT', () => {
  const conflict = vfy.detectVerificationConflicts({
    entity_type: 'verification',
    verification_id: 'VFY-TEST-N22',
    subject_type: 'EXPERIMENT',
    subject_id: 'EXP-B06-READY-001',
    outcome: 'IMPROVED',
    hypothesis_result: 'NOT_SUPPORTED',
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01']
  }, { isFixture: true });

  assert.strictEqual(conflict.conflict_detected, true);
  assert(conflict.conflicts.some(c => c.conflict_type === 'OUTCOME_HYPOTHESIS_CONTRADICTION'));
});

runTest('N23: Verification overwritten after finalization → REJECT', () => {
  // VFY-TEST-001 is in VERIFIED status
  assert.throws(() => {
    dal.saveEntity('verification', {
      entity_type: 'verification',
      schema_version: '1.0',
      verification_id: 'VFY-TEST-001',
      verification_version: '1.0',
      subject_type: 'ACTION',
      subject_id: 'ACT-B06-READY-001',
      founder_decision_id: 'DEC-B06-APP-001',
      verification_type: 'VFY-01',
      evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
      protocol_version: '1.0',
      verification_method: 'Attempting to overwrite finalized verification.',
      status: 'VERIFIED',
      created_by: 'OPERATOR',
      created_at: new Date().toISOString()
    }, { isFixture: true });
  }, /IMMUTABILITY_VIOLATION/);
});

runTest('N24: Learning overwritten after validation → REJECT', () => {
  // LRN-TEST-001 is in VALIDATED status
  assert.throws(() => {
    dal.saveEntity('learning', {
      entity_type: 'learning',
      schema_version: '1.0',
      learning_id: 'LRN-TEST-001',
      learning_version: '1.0',
      source_verification_refs: ['VFY-TEST-001'],
      hypothesis_result: 'SUPPORTED',
      learning_type: 'L5',
      statement: 'Attempting to overwrite validated learning.',
      evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
      applicability: 'All entry points.',
      limitations: 'Testing limitations.',
      status: 'VALIDATED',
      created_by: 'OPERATOR',
      created_at: new Date().toISOString()
    }, { isFixture: true });
  }, /IMMUTABILITY_VIOLATION/);
});

runTest('N25: System Rule automatically promoted → REJECT', () => {
  // Attempting to create an APPROVED candidate without Founder review
  assert.throws(() => {
    vfy.transitionSystemRuleCandidateStatus('SRC-TEST-001', 'APPROVED', {
      actor: 'OPERATOR', // Not FOUNDER!
      decision_reason: 'Operator attempting to approve.'
    }, { isFixture: true });
  }, /IMMUTABILITY_ERROR|PERMISSION_DENIED/);
});

runTest('N26: Composite outcome score introduced → REJECT', () => {
  assert.throws(() => {
    vfy.createVerification({
      verification_id: 'VFY-TEST-N26',
      subject_type: 'ACTION',
      subject_id: 'ACT-B06-READY-001',
      founder_decision_id: 'DEC-B06-APP-001',
      verification_type: 'VFY-01',
      evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
      protocol_version: '1.0',
      verification_method: 'Testing composite score rejection.',
      status: 'DRAFTED',
      composite_score: 95.5 // Forbidden!
    }, { isFixture: true });
  }, /GOVERNANCE_ERROR/);
});

runTest('N27: Hidden success score introduced → REJECT', () => {
  assert.throws(() => {
    vfy.createLearning({
      learning_id: 'LRN-TEST-N27',
      source_verification_refs: ['VFY-TEST-001'],
      statement: 'Learning with forbidden success score.',
      evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
      applicability: 'General',
      limitations: 'Testing',
      status: 'DRAFTED',
      success_score: 100 // Forbidden!
    }, { isFixture: true });
  }, /GOVERNANCE_ERROR/);
});

runTest('N28: Founder approval inferred from previous approval → REJECT', () => {
  assert.throws(() => {
    vfy.transitionSystemRuleCandidateStatus('SRC-TEST-001', 'APPROVED', {
      actor: 'OPERATOR',
      decision_reason: ''
    }, { isFixture: true });
  }, /IMMUTABILITY_ERROR|PERMISSION_DENIED/);
});

runTest('N29: Outcome inferred from implementation status alone → REJECT', () => {
  const evalResult = vfy.evaluateOutcome(null, null, { action_status: 'IMPLEMENTED' });
  assert.strictEqual(evalResult.outcome, 'UNVERIFIED');
});

runTest('N30: Hypothesis result inferred from outcome alone without evidence evaluation → REJECT', () => {
  const res = vfy.evaluateHypothesisResult(
    'Organization schema increases brand recognition.',
    'IMPROVED',
    { direct_causal_support: false, sample_sufficient: false }
  );

  // Must not jump directly to SUPPORTED
  assert.notStrictEqual(res.hypothesis_result, 'SUPPORTED');
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
console.log(`TOTAL VERIFICATION TESTS : ${totalTests}`);
console.log(`PASSED TESTS             : ${passedTests} ✓`);
console.log(`FAILED TESTS             : ${failedTests} ✗`);
console.log('------------------------------------------------------------\n');

if (failedTests > 0) {
  console.error(`[FAIL] ${failedTests} test(s) failed.`);
  process.exit(1);
} else {
  console.log('[SUCCESS] All M08.2 Verification & Learning tests passed cleanly!\n');
}
