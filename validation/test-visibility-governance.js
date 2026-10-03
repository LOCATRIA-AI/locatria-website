/**
 * LOCATRIA Visibility Operating System v1.0
 * Module 08 — Visibility Growth System (M08.2)
 *
 * BUILD-07: Governance, Operating Review & Control Test Suite v1.0
 *
 * Validates:
 * - Positive Tests (T01–T30)
 * - Negative Tests (N01–N30)
 * - Historical Production Integrity Check (H01)
 */

'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');

const dal = require('../js/visibility-data/index');
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
console.log('LOCATRIA VISIBILITY GOVERNANCE & CONTROL TEST SUITE');
console.log('M08.2 BUILD-07 — Governance, Operating Review & Control v1.0');
console.log('============================================================\n');

// Setup test fixtures
const baseDir = dal.getBaseDir();
const fixtureDir = path.join(baseDir, '_fixtures');
if (fs.existsSync(fixtureDir)) {
  const existingFiles = fs.readdirSync(fixtureDir);
  for (const f of existingFiles) {
    if (
      f.startsWith('gov-test-') ||
      f.startsWith('exc-test-') ||
      f.startsWith('rev-test-') ||
      f.startsWith('cr-test-') ||
      f.startsWith('sr-test-') ||
      f.startsWith('lrn-test-val-') ||
      f.startsWith('dec-log-test-') ||
      f.startsWith('dec-test-stale') ||
      f.startsWith('cs-')
    ) {
      try { fs.unlinkSync(path.join(fixtureDir, f)); } catch (_) {}
    }
  }
} else {
  fs.mkdirSync(fixtureDir, { recursive: true });
}

// -------------------------------------------------------------
// POSITIVE TESTS (T01–T30)
// -------------------------------------------------------------

console.log('--- POSITIVE TESTS (T01–T30) ---');

runTest('T01: Create governance issue', () => {
  const issue = gov.createGovernanceIssue({
    governance_id: 'GOV-TEST-001',
    governance_type: 'DATA_INTEGRITY',
    governance_level: 'G1',
    subject_type: 'OBSERVATION',
    subject_id: 'OBS-VIS-T1-CHATGPT-P01',
    issue: 'Discrepancy in raw observation citation structure.',
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
    current_state: 'DETECTED',
    required_action: 'Perform manual verification.',
    owner: 'OPERATOR'
  }, { actor: 'OPERATOR' }, { isFixture: true });

  assert.strictEqual(issue.governance_id, 'GOV-TEST-001');
  assert.strictEqual(issue.status, 'DETECTED');
  assert.strictEqual(issue.governance_level, 'G1');
});

runTest('T02: Assign governance level (G0, G1, G2, G3)', () => {
  const issue = gov.createGovernanceIssue({
    governance_id: 'GOV-TEST-G3',
    governance_type: 'STRATEGIC',
    governance_level: 'G3',
    subject_type: 'PROTOCOL',
    subject_id: 'PROT-M08-2-v1',
    issue: 'Major protocol evolution proposal requiring Founder authorization.',
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
    current_state: 'DETECTED',
    required_action: 'Escalate to Founder.',
    owner: 'OPERATOR'
  }, { actor: 'OPERATOR' }, { isFixture: true });

  assert.strictEqual(issue.governance_level, 'G3');
  assert.strictEqual(issue.founder_review_required, true);
});

runTest('T03: Create exception', () => {
  const exc = gov.createException({
    exception_id: 'EXC-TEST-001',
    exception_type: 'EX01',
    subject_type: 'EXPERIMENT',
    subject_id: 'EXP-B06-READY-001',
    rule_reference: 'PROTOCOL_ISOLATION_RULE',
    deviation: 'Temporary relaxation of secondary environment verification for urgent schema test.',
    reason: 'Evaluating homepage schema ahead of search engine crawler cycle.',
    impact: 'Gemini and Perplexity results deferred to secondary run.',
    mitigation: 'Full 3-environment verification scheduled within 48 hours.',
    expiry_date: new Date(Date.now() + 7 * 86400000).toISOString(),
    requested_by: 'OPERATOR'
  }, { actor: 'OPERATOR' }, { isFixture: true });

  assert.strictEqual(exc.exception_id, 'EXC-TEST-001');
  assert.strictEqual(exc.status, 'REQUESTED');
});

runTest('T04: Approve valid exception by authorized Founder', () => {
  const approved = gov.approveException('EXC-TEST-001', {
    actor: 'FOUNDER',
    decision_reason: 'Approved by Founder: limited 48-hour scope justified.'
  }, { isFixture: true });

  assert.strictEqual(approved.status, 'APPROVED');
  assert.strictEqual(approved.approved_by, 'FOUNDER');
  assert.strictEqual(approved.is_immutable, true);
});

runTest('T05: Expire exception', () => {
  const expired = gov.expireException('EXC-TEST-001', { actor: 'SYSTEM' }, { isFixture: true });
  assert.strictEqual(expired.status, 'EXPIRED');
});

runTest('T06: Create Monthly Operating Review', () => {
  const rev = gov.createReview({
    review_id: 'REV-TEST-M01',
    review_type: 'MONTHLY_OPERATING',
    period_start: new Date(Date.now() - 30 * 86400000).toISOString(),
    period_end: new Date().toISOString(),
    subjects: ['Measurement activity', 'Open issues', 'Exceptions'],
    owner: 'OPERATOR',
    status: 'DRAFTED'
  }, { actor: 'OPERATOR' }, { isFixture: true });

  assert.strictEqual(rev.review_id, 'REV-TEST-M01');
  assert.strictEqual(rev.review_type, 'MONTHLY_OPERATING');
});

runTest('T07: Create Quarterly Strategic Review', () => {
  const rev = gov.createReview({
    review_id: 'REV-TEST-Q01',
    review_type: 'QUARTERLY_STRATEGIC',
    period_start: new Date(Date.now() - 90 * 86400000).toISOString(),
    period_end: new Date().toISOString(),
    subjects: ['System architecture', 'System rule candidates', 'Strategy alignment'],
    owner: 'FOUNDER',
    status: 'DRAFTED'
  }, { actor: 'FOUNDER' }, { isFixture: true });

  assert.strictEqual(rev.review_id, 'REV-TEST-Q01');
  assert.strictEqual(rev.review_type, 'QUARTERLY_STRATEGIC');
});

runTest('T08: Create Change Request', () => {
  const cr = gov.createChangeRequest({
    change_request_id: 'CR-TEST-001',
    change_type: 'PROTOCOL',
    target: 'Verification Protocol v1.0',
    current_state: 'Protocol v1.0 requires 1 run per environment.',
    proposed_change: 'Upgrade to Protocol v1.1 requiring 3 temporal passes per environment.',
    reason: 'Mitigates LLM output stochastic variance observed in pilot runs.',
    impact: 'Increases measurement runtime by 3x; enhances epistemic confidence.',
    risk: 'Potential rate limiting on public search endpoints.',
    rollback: 'Revert to single-pass Protocol v1.0 in DAL configuration.',
    requested_by: 'OPERATOR'
  }, { actor: 'OPERATOR' }, { isFixture: true });

  assert.strictEqual(cr.change_request_id, 'CR-TEST-001');
  assert.strictEqual(cr.status, 'DRAFT');
});

runTest('T09: Approve valid Founder Change Request', () => {
  const approved = gov.approveChangeRequest('CR-TEST-001', {
    actor: 'FOUNDER',
    decision_reason: 'Approved by Founder: 3-pass temporal verification justified.',
    effective_version: '1.1'
  }, { isFixture: true });

  assert.strictEqual(approved.status, 'APPROVED');
  assert.strictEqual(approved.approved_by, 'FOUNDER');
  assert.strictEqual(approved.effective_version, '1.1');
  assert.strictEqual(approved.is_immutable, true);
});

runTest('T10: Reject Change Request', () => {
  const cr = gov.createChangeRequest({
    change_request_id: 'CR-TEST-002',
    change_type: 'METRIC',
    target: 'Metric M01',
    current_state: 'M01 is categorical Mention Status.',
    proposed_change: 'Convert M01 into a weighted numeric score.',
    reason: 'Attempting to calculate synthetic percentage.',
    impact: 'Violates core LOCATRIA zero-score architecture.',
    risk: 'Arbitrary ranking distortion.',
    rollback: 'Reject change request.',
    requested_by: 'OPERATOR'
  }, { actor: 'OPERATOR' }, { isFixture: true });

  const rejected = gov.rejectChangeRequest('CR-TEST-002', {
    actor: 'FOUNDER',
    decision_reason: 'Rejected by Founder: violates zero-score architectural invariant.'
  }, { isFixture: true });

  assert.strictEqual(rejected.status, 'REJECTED');
});

runTest('T11: Create System Rule from validated Learning', () => {
  // Ensure validated learning exists
  dal.saveEntity('learning', {
    entity_type: 'learning',
    schema_version: '1.0',
    learning_id: 'LRN-TEST-VAL-001',
    learning_version: '1.0',
    source_verification_refs: ['VFY-TEST-001'],
    hypothesis_result: 'SUPPORTED',
    learning_type: 'L3',
    statement: 'Validated schema.org markup increases local business entity extraction.',
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
    confidence: 'HIGH',
    applicability: 'All client sites',
    limitations: 'Subject to crawler indexing',
    status: 'VALIDATED',
    created_at: new Date().toISOString(),
    created_by: 'OPERATOR',
    is_immutable: true
  }, { isFixture: true });

  const rule = gov.createSystemRule({
    system_rule_id: 'SR-TEST-001',
    rule_statement: 'Always deploy schema.org Organization JSON-LD before launching visibility campaigns.',
    source_learning_refs: ['LRN-TEST-VAL-001'],
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
    applicability: 'All client digital properties.',
    limitations: 'Subject to search engine crawler indexing schedules.'
  }, { actor: 'OPERATOR' }, { isFixture: true });

  assert.strictEqual(rule.system_rule_id, 'SR-TEST-001');
  assert.strictEqual(rule.status, 'DRAFT');
});

runTest('T12: Require Founder approval for System Rule', () => {
  const rule = dal.loadEntity('system_rule', 'SR-TEST-001', { isFixture: true });
  assert.strictEqual(rule.status, 'DRAFT');
  assert.strictEqual(rule.approved_by, null);
});

runTest('T13: Activate approved System Rule', () => {
  const activeRule = gov.activateSystemRule('SR-TEST-001', {
    actor: 'FOUNDER',
    decision_reason: 'Approved by Founder: empirically verified across T1 control set.'
  }, { isFixture: true });

  assert.strictEqual(activeRule.status, 'ACTIVE');
  assert.strictEqual(activeRule.approved_by, 'FOUNDER');
  assert.strictEqual(activeRule.is_immutable, true);
});

runTest('T14: Retire System Rule', () => {
  const retiredRule = gov.retireSystemRule('SR-TEST-001', {
    actor: 'FOUNDER',
    decision_reason: 'Retired by Founder: superseded by Protocol v2 rule set.'
  }, { isFixture: true });

  assert.strictEqual(retiredRule.status, 'RETIRED');
  assert.strictEqual(retiredRule.is_immutable, true);
});

runTest('T15: Evaluate control gate (G01..G08)', () => {
  const g1 = gov.evaluateControlGate('G01', { isFixture: false });
  assert.strictEqual(g1.status, 'PASS');

  const g2 = gov.evaluateControlGate('G02', { isFixture: false });
  assert.strictEqual(g2.status, 'PASS');

  const g4 = gov.evaluateControlGate('G04', { isFixture: false });
  assert.strictEqual(g4.status, 'PASS');
});

runTest('T16: Produce CONTROL_REVIEW_REQUIRED state', () => {
  // Create an unresolved G3 issue in fixtures to trigger CONTROL_REVIEW_REQUIRED
  gov.createGovernanceIssue({
    governance_id: 'GOV-TEST-CRIT',
    governance_type: 'PROTOCOL_DRIFT',
    governance_level: 'G3',
    subject_type: 'PROTOCOL',
    subject_id: 'PROT-M08-2-v1',
    issue: 'Critical protocol drift detected during production audit.',
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
    current_state: 'DETECTED',
    required_action: 'Immediate Founder review.',
    owner: 'OPERATOR'
  }, { actor: 'OPERATOR' }, { isFixture: true });

  const state = gov.calculateControlState({ isFixture: true, includeFixtures: true });
  assert.strictEqual(state.state, 'CONTROL_REVIEW_REQUIRED');
  assert(state.reasons.length > 0);
  assert(state.reasons.some(r => r.includes('G05') || r.includes('Governance')));
});

runTest('T17: Preserve Founder Decision history', () => {
  const logged = gov.logFounderDecision({
    decision_id: 'DEC-LOG-TEST-001',
    decision_version: '1.0',
    opportunity_id: 'OPP-B06-001',
    priority_assessment_id: 'PRIO-B06-001',
    recommendation: 'P0',
    decision: 'APPROVE',
    decision_reason: 'Approved for production pilot by Founder.',
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01']
  }, { actor: 'FOUNDER' }, { isFixture: true });

  assert.strictEqual(logged.decision_id, 'DEC-LOG-TEST-001');
  assert.strictEqual(logged.decided_by, 'FOUNDER');

  const log = gov.getFounderDecisionLog({ opportunity_id: 'OPP-B06-001' }, { isFixture: true, includeFixtures: true });
  assert(log.length > 0);
});

runTest('T18: Preserve audit trail', () => {
  const audit = dal.recordAuditLog({
    actor: 'FOUNDER',
    actor_type: 'FOUNDER',
    action: 'APPROVE_CHANGE',
    entity_type_target: 'change_request',
    entity_id: 'CR-TEST-001',
    reason: 'Approved Protocol v1.1 update'
  }, { isFixture: true });

  assert(audit.audit_id !== null);
  assert.strictEqual(audit.actor, 'FOUNDER');
});

runTest('T19: Preserve protocol versions', () => {
  const t1Run = dal.loadEntity('measurement_run', 'RUN-M08-1-T1-REF');
  assert.strictEqual(t1Run.protocol_version, '1.0.0');
});

runTest('T20: Preserve prompt-set versions', () => {
  const pset = dal.loadEntity('prompt_set', 'PSET-M08-1-FIXED20');
  assert.strictEqual(pset.prompt_set_version, '1.0.0');
});

runTest('T21: Preserve environment versions', () => {
  const env = dal.loadEntity('environment', 'ENV-CHATGPT');
  assert.strictEqual(env.status, 'ACTIVE');
  assert.strictEqual(env.environment_name, 'ChatGPT');
});

runTest('T22: Detect unresolved governance issue', () => {
  const conflicts = gov.detectGovernanceConflicts({ isFixture: true, includeFixtures: true });
  assert.strictEqual(conflicts.conflict_detected, true);
  assert(conflicts.conflicts.some(c => c.conflict_type === 'UNRESOLVED_STRATEGIC_ISSUE'));
});

runTest('T23: Detect expired exception', () => {
  // Create an expired exception that was marked APPROVED
  dal.saveEntity('governance_exception', {
    entity_type: 'governance_exception',
    schema_version: '1.0',
    exception_id: 'EXC-TEST-EXP-001',
    exception_version: '1.0',
    exception_type: 'EX01',
    subject_type: 'EXPERIMENT',
    subject_id: 'EXP-B06-READY-001',
    rule_reference: 'PROTOCOL_RULE',
    deviation: 'Expired deviation test.',
    reason: 'Testing conflict detection.',
    impact: 'Temporary deviation.',
    mitigation: 'Temporary deviation logged for test verification.',
    expiry_date: new Date(Date.now() - 86400000).toISOString(), // Yesterday!
    requested_by: 'OPERATOR',
    approved_by: 'FOUNDER',
    approved_at: new Date(Date.now() - 100000000).toISOString(),
    status: 'APPROVED',
    created_at: new Date(Date.now() - 100000000).toISOString(),
    is_immutable: true
  }, { isFixture: true });

  const conflicts = gov.detectGovernanceConflicts({ isFixture: true, includeFixtures: true });
  assert(conflicts.conflicts.some(c => c.conflict_type === 'EXPIRED_EXCEPTION_IN_USE'));
});

runTest('T24: Detect stale approval', () => {
  // Create a decision older than 90 days
  dal.saveEntity('founder_decision', {
    entity_type: 'founder_decision',
    schema_version: '1.0.0',
    decision_id: 'DEC-TEST-STALE',
    decision_version: '1.0',
    opportunity_id: 'OPP-B06-001',
    priority_assessment_id: 'PRIO-B06-001',
    recommendation: 'P0',
    decision: 'APPROVE',
    decision_reason: 'Stale approval test',
    decided_by: 'FOUNDER',
    status: 'DECIDED',
    created_at: new Date(Date.now() - 100 * 86400000).toISOString(), // 100 days ago
    decided_at: new Date(Date.now() - 100 * 86400000).toISOString(),
    is_immutable: true
  }, { isFixture: true });

  const conflicts = gov.detectGovernanceConflicts({ isFixture: true, includeFixtures: true });
  assert(conflicts.conflicts.some(c => c.conflict_type === 'STALE_APPROVAL'));
});

runTest('T25: Prepare monthly review', () => {
  const prep = gov.prepareMonthlyOperatingReview(
    new Date(Date.now() - 30 * 86400000).toISOString(),
    new Date().toISOString(),
    { isFixture: true, includeFixtures: true }
  );

  assert.strictEqual(prep.review_type, 'MONTHLY_OPERATING');
  assert(prep.activity_summary !== undefined);
  assert(Array.isArray(prep.issues_for_review));
  assert(Array.isArray(prep.decisions_required));
});

runTest('T26: Prepare quarterly review', () => {
  const prep = gov.prepareQuarterlyStrategicReview(
    new Date(Date.now() - 90 * 86400000).toISOString(),
    new Date().toISOString(),
    { isFixture: true, includeFixtures: true }
  );

  assert.strictEqual(prep.review_type, 'QUARTERLY_STRATEGIC');
  assert(prep.strategic_agenda !== undefined);
  assert.strictEqual(prep.options_for_founder.length, 5);
  assert(prep.options_for_founder.includes('SCALE'));
});

runTest('T27: Trace governance decision to evidence', () => {
  const trace = gov.traceGovernanceEvidence('governance_issue', 'GOV-TEST-001', { isFixture: true });
  assert.strictEqual(trace.entity_id, 'GOV-TEST-001');
  assert.strictEqual(trace.epistemic_complete, true);
  assert.strictEqual(trace.evidence_records.length, 1);
});

runTest('T28: Preserve AI / Founder actor identity', () => {
  const audit = dal.recordAuditLog({
    actor: 'AI_ADVISOR',
    actor_type: 'AI_ADVISOR',
    action: 'PROPOSE_EXCEPTION',
    entity_type_target: 'governance_exception',
    entity_id: 'EXC-TEST-001',
    reason: 'AI detected candidate exception'
  }, { isFixture: true });

  assert.strictEqual(audit.actor, 'AI_ADVISOR');
  assert.strictEqual(audit.actor_type, 'AI_ADVISOR');
});

runTest('T29: Preserve historical records', () => {
  const t1Run = dal.loadEntity('measurement_run', 'RUN-M08-1-T1-REF');
  assert.strictEqual(t1Run.status, 'COMPLETED');
  assert.strictEqual(t1Run.is_immutable, true);
});

runTest('T30: Version governance records', () => {
  // Creating version 2.0 of an approved change request creates a new version record
  const crV2 = gov.createChangeRequest({
    change_request_id: 'CR-TEST-001-v2',
    change_request_version: '2.0',
    change_type: 'PROTOCOL',
    target: 'Verification Protocol v1.1',
    current_state: 'Protocol v1.1',
    proposed_change: 'Protocol v2.0 with automated crawler retry.',
    reason: 'Further epistemic refinement.',
    impact: 'Improves measurement completion rate.',
    risk: 'Low risk of crawler latency.',
    rollback: 'Revert to Protocol v1.1',
    requested_by: 'OPERATOR'
  }, { actor: 'OPERATOR' }, { isFixture: true });

  assert.strictEqual(crV2.change_request_id, 'CR-TEST-001-v2');
  assert.strictEqual(crV2.change_request_version, '2.0');
});

// -------------------------------------------------------------
// NEGATIVE TESTS (N01–N30)
// -------------------------------------------------------------

console.log('\n--- NEGATIVE TESTS (N01–N30) ---');

runTest('N01: AI approves Exception → REJECT', () => {
  assert.throws(() => {
    gov.approveException('EXC-TEST-001', {
      actor: 'AI_ADVISOR',
      actor_role: 'AI_ADVISOR',
      decision_reason: 'AI attempting approval.'
    }, { isFixture: true });
  }, /AUTHORITY_ERROR/);
});

runTest('N02: AI approves Change Request → REJECT', () => {
  assert.throws(() => {
    gov.approveChangeRequest('CR-TEST-001-v2', {
      actor: 'AI_ADVISOR',
      actor_role: 'AI_ADVISOR',
      decision_reason: 'AI attempting CR approval.'
    }, { isFixture: true });
  }, /AUTHORITY_ERROR/);
});

runTest('N03: AI approves System Rule → REJECT', () => {
  assert.throws(() => {
    gov.activateSystemRule('SR-TEST-001', {
      actor: 'AI_ADVISOR',
      actor_role: 'AI_ADVISOR',
      decision_reason: 'AI attempting rule activation.'
    }, { isFixture: true });
  }, /AUTHORITY_ERROR/);
});

runTest('N04: AI changes Founder Decision → REJECT', () => {
  assert.throws(() => {
    gov.logFounderDecision({
      decision_id: 'DEC-TEST-AI',
      decision_version: '1.0',
      opportunity_id: 'OPP-B06-001',
      priority_assessment_id: 'PRIO-B06-001',
      recommendation: 'P0',
      decision: 'APPROVE',
      decision_reason: 'AI pretending to be Founder.'
    }, { actor: 'AI_ADVISOR', actor_role: 'AI_ADVISOR' }, { isFixture: true });
  }, /PERMISSION_DENIED/);
});

runTest('N05: Silent protocol modification → REJECT', () => {
  // Protocol modification requires explicit change request; mutating completed run is blocked
  assert.throws(() => {
    dal.saveEntity('measurement_run', {
      entity_type: 'measurement_run',
      schema_version: '1.0.0',
      run_id: 'RUN-M08-1-T1-REF',
      protocol_version: '2.0'
    }, { isFixture: false });
  }, /IMMUTABILITY_VIOLATION/);
});

runTest('N06: Silent metric modification → REJECT', () => {
  // Attempting to introduce forbidden metric scoring is rejected
  assert.throws(() => {
    gov.createGovernanceIssue({
      governance_id: 'GOV-TEST-N06',
      issue: 'Testing metric modification rejection.',
      evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
      score: 95.5 // Forbidden!
    }, { actor: 'OPERATOR' }, { isFixture: true });
  }, /INVARIANT_VIOLATION/);
});

runTest('N07: Silent prompt-set modification → REJECT', () => {
  assert.throws(() => {
    dal.saveEntity('prompt_set', {
      entity_type: 'prompt_set',
      schema_version: '1.0.0',
      prompt_set_id: 'PSET-M08-1-FIXED20',
      prompt_set_version: '1.0.0',
      name: 'Mutated Prompt Set',
      description: 'Attempting silent modification.',
      prompt_ids: ['P01'],
      status: 'ACTIVE',
      created_at: new Date().toISOString()
    }, { isFixture: false });
  }, /IMMUTABILITY_VIOLATION/);
});

runTest('N08: Silent environment modification → REJECT', () => {
  assert.throws(() => {
    dal.deleteEntity('environment', 'ENV-CHATGPT', { actor_type: 'AI_ADVISOR', isFixture: false });
  }, /PERMISSION_DENIED/);
});

runTest('N09: Activate System Rule without Founder approval → REJECT', () => {
  assert.throws(() => {
    gov.activateSystemRule('SR-TEST-001', {
      actor: 'OPERATOR', // Not FOUNDER!
      decision_reason: 'Operator attempting activation.'
    }, { isFixture: true });
  }, /PERMISSION_DENIED/);
});

runTest('N10: Create System Rule without validated Learning → REJECT', () => {
  // Create an unvalidated learning
  dal.saveEntity('learning', {
    entity_type: 'learning',
    schema_version: '1.0',
    learning_id: 'LRN-TEST-UNVAL-B07',
    learning_version: '1.0',
    source_verification_refs: ['VFY-TEST-001'],
    statement: 'Unvalidated statement.',
    hypothesis_result: 'NOT_APPLICABLE',
    learning_type: 'L1',
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
    confidence: 'HIGH',
    applicability: 'General',
    limitations: 'Testing',
    status: 'DRAFTED', // DRAFTED, not VALIDATED!
    created_at: new Date().toISOString(),
    created_by: 'OPERATOR'
  }, { isFixture: true });

  assert.throws(() => {
    gov.createSystemRule({
      system_rule_id: 'SR-TEST-N10',
      rule_statement: 'Rule attempting to skip learning validation.',
      source_learning_refs: ['LRN-TEST-UNVAL-B07'],
      evidence_refs: ['EVD-VIS-T1-CHATGPT-P01']
    }, { actor: 'OPERATOR' }, { isFixture: true });
  }, /GATE_ERROR/);
});

runTest('N11: Close governance issue without resolution → REJECT', () => {
  assert.throws(() => {
    gov.transitionGovernanceStatus('GOV-TEST-001', 'CLOSED', {
      actor: 'OPERATOR',
      resolution: '' // Empty resolution!
    }, { isFixture: true });
  }, /GOVERNANCE_ERROR/);
});

runTest('N12: Expired Exception used as active authorization → REJECT', () => {
  const exc = dal.loadEntity('governance_exception', 'EXC-TEST-EXP-001', { isFixture: true });
  const isExpired = new Date(exc.expiry_date) < new Date();
  assert.strictEqual(isExpired, true, 'Exception must be recognized as expired.');

  // System should detect it as a governance conflict
  const conflicts = gov.detectGovernanceConflicts({ isFixture: true, includeFixtures: true });
  assert(conflicts.conflicts.some(c => c.entity_id === 'EXC-TEST-EXP-001'));
});

runTest('N13: Change Request without reason → REJECT', () => {
  assert.throws(() => {
    gov.createChangeRequest({
      change_request_id: 'CR-TEST-N13',
      change_type: 'PROTOCOL',
      proposed_change: 'Proposed change text.',
      reason: '', // Empty reason!
      impact: 'Valid impact text.',
      risk: 'Valid risk text.',
      rollback: 'Valid rollback text.'
    }, { actor: 'OPERATOR' }, { isFixture: true });
  }, /VALIDATION_ERROR/);
});

runTest('N14: Change Request without impact assessment → REJECT', () => {
  assert.throws(() => {
    gov.createChangeRequest({
      change_request_id: 'CR-TEST-N14',
      change_type: 'PROTOCOL',
      proposed_change: 'Proposed change text.',
      reason: 'Valid reason text.',
      impact: '', // Empty impact!
      risk: 'Valid risk text.',
      rollback: 'Valid rollback text.'
    }, { actor: 'OPERATOR' }, { isFixture: true });
  }, /VALIDATION_ERROR/);
});

runTest('N15: Change Request without rollback where required → REJECT', () => {
  assert.throws(() => {
    gov.createChangeRequest({
      change_request_id: 'CR-TEST-N15',
      change_type: 'PROTOCOL',
      proposed_change: 'Proposed change text.',
      reason: 'Valid reason text.',
      impact: 'Valid impact text.',
      risk: 'Valid risk text.',
      rollback: '' // Empty rollback!
    }, { actor: 'OPERATOR' }, { isFixture: true });
  }, /VALIDATION_ERROR/);
});

runTest('N16: Founder Decision overwritten → REJECT', () => {
  assert.throws(() => {
    gov.logFounderDecision({
      decision_id: 'DEC-LOG-TEST-001',
      opportunity_id: 'OPP-B06-001',
      priority_assessment_id: 'PRIO-B06-001',
      recommendation: 'P0',
      decision: 'APPROVE',
      decision_reason: 'Attempting overwrite of finalized decision.'
    }, { actor: 'FOUNDER' }, { isFixture: true });
  }, /IMMUTABILITY_VIOLATION/);
});

runTest('N17: Historical protocol overwritten → REJECT', () => {
  assert.throws(() => {
    dal.saveEntity('measurement_run', {
      entity_type: 'measurement_run',
      schema_version: '1.0.0',
      run_id: 'RUN-M08-1-T1-REF',
      protocol_version: '9.9'
    }, { isFixture: false });
  }, /IMMUTABILITY_VIOLATION/);
});

runTest('N18: Historical prompt set overwritten → REJECT', () => {
  assert.throws(() => {
    dal.saveEntity('prompt_set', {
      entity_type: 'prompt_set',
      schema_version: '1.0.0',
      prompt_set_id: 'PSET-M08-1-FIXED20',
      name: 'Attempted overwrite.'
    }, { isFixture: false });
  }, /IMMUTABILITY_VIOLATION/);
});

runTest('N19: Historical environment overwritten → REJECT', () => {
  const env = dal.loadEntity('environment', 'ENV-CHATGPT');
  assert(env !== null, 'ENV-CHATGPT must exist');
  assert.throws(() => {
    dal.saveEntity('environment', {
      ...env,
      environment_name: 'Mutated ChatGPT'
    }, { isFixture: false });
  }, /IMMUTABILITY_VIOLATION/);
});

runTest('N20: Governance conflict silently resolved → REJECT', () => {
  // Unresolved strategic issues cannot be marked closed without resolution record
  assert.throws(() => {
    gov.transitionGovernanceStatus('GOV-TEST-CRIT', 'CLOSED', {
      actor: 'OPERATOR',
      resolution: '' // Silent closure without resolution!
    }, { isFixture: true });
  }, /GOVERNANCE_ERROR/);
});

runTest('N21: Composite governance score introduced → REJECT', () => {
  assert.throws(() => {
    gov.createGovernanceIssue({
      governance_id: 'GOV-TEST-N21',
      issue: 'Testing governance score rejection.',
      evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
      governance_score: 88.5 // Forbidden!
    }, { actor: 'OPERATOR' }, { isFixture: true });
  }, /INVARIANT_VIOLATION/);
});

runTest('N22: Composite Visibility Health Score introduced → REJECT', () => {
  assert.throws(() => {
    gov.createReview({
      review_id: 'REV-TEST-N22',
      review_type: 'MONTHLY_OPERATING',
      visibility_health_score: 92 // Forbidden!
    }, { actor: 'OPERATOR' }, { isFixture: true });
  }, /INVARIANT_VIOLATION/);
});

runTest('N23: Hidden governance ranking introduced → REJECT', () => {
  assert.throws(() => {
    gov.createChangeRequest({
      change_request_id: 'CR-TEST-N23',
      change_type: 'METRIC',
      proposed_change: 'Proposed change text.',
      reason: 'Valid reason.',
      impact: 'Valid impact.',
      risk: 'Valid risk.',
      rollback: 'Valid rollback.',
      ranking: 1 // Forbidden!
    }, { actor: 'OPERATOR' }, { isFixture: true });
  }, /INVARIANT_VIOLATION/);
});

runTest('N24: AI closes strategic governance issue → REJECT', () => {
  assert.throws(() => {
    gov.transitionGovernanceStatus('GOV-TEST-CRIT', 'CLOSED', {
      actor: 'AI_ADVISOR',
      actor_role: 'AI_ADVISOR',
      resolution: 'AI attempting closure of G3 issue.'
    }, { isFixture: true });
  }, /AUTHORITY_ERROR/);
});

runTest('N25: AI changes governance level → REJECT', () => {
  assert.throws(() => {
    gov.transitionGovernanceStatus('GOV-TEST-001', 'UNDER_REVIEW', {
      actor: 'AI_ADVISOR',
      actor_role: 'AI_ADVISOR',
      governance_level: 'G0' // AI demoting issue!
    }, { isFixture: true });
  }, /AUTHORITY_ERROR/);
});

runTest('N26: System Rule activated automatically → REJECT', () => {
  // Creating a system rule leaves it in DRAFT; activation must be explicit Founder action
  const rule = gov.createSystemRule({
    system_rule_id: 'SR-TEST-N26',
    rule_statement: 'Rule testing automatic activation prevention.',
    source_learning_refs: ['LRN-TEST-VAL-001'],
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01']
  }, { actor: 'OPERATOR' }, { isFixture: true });

  assert.strictEqual(rule.status, 'DRAFT');
  assert.notStrictEqual(rule.status, 'ACTIVE');
});

runTest('N27: Review automatically creates Founder Decision → REJECT', () => {
  const prep = gov.prepareMonthlyOperatingReview(
    new Date(Date.now() - 30 * 86400000).toISOString(),
    new Date().toISOString(),
    { isFixture: true, includeFixtures: true }
  );

  // Decisions required must remain null / undecided
  assert(prep.decisions_required.every(d => d.founder_decision === null));
});

runTest('N28: Monthly Review automatically changes strategy → REJECT', () => {
  const prep = gov.prepareMonthlyOperatingReview(
    new Date(Date.now() - 30 * 86400000).toISOString(),
    new Date().toISOString(),
    { isFixture: true, includeFixtures: true }
  );

  // Status must be DRAFTED, no automatic strategy mutations
  assert.strictEqual(prep.status, 'DRAFTED');
  assert.strictEqual(prep.strategic_mutation, undefined);
});

runTest('N29: Quarterly Review automatically changes system → REJECT', () => {
  const prep = gov.prepareQuarterlyStrategicReview(
    new Date(Date.now() - 90 * 86400000).toISOString(),
    new Date().toISOString(),
    { isFixture: true, includeFixtures: true }
  );

  // Options presented to Founder; system cannot choose an option autonomously
  assert.strictEqual(prep.chosen_option, undefined);
});

runTest('N30: Governance record loses evidence traceability → REJECT', () => {
  const trace = gov.traceGovernanceEvidence('governance_issue', 'GOV-NON-EXISTENT', { isFixture: true });
  assert.strictEqual(trace.epistemic_complete, false);
});

// -------------------------------------------------------------
// HISTORICAL PRODUCTION INTEGRITY CHECK
// -------------------------------------------------------------

console.log('\n--- HISTORICAL DATA INTEGRITY CHECK ---');

runTest('H01: Production historical T1 dataset remains 100% immutable and intact', () => {
  const t1Run = dal.loadEntity('measurement_run', 'RUN-M08-1-T1-REF');
  assert(t1Run !== null, 'T1 run must exist');
  assert.strictEqual(t1Run.status, 'COMPLETED');
  assert.strictEqual(t1Run.is_immutable, true);
  assert.strictEqual(t1Run.observation_count, 60);

  const pset = dal.loadEntity('prompt_set', 'PSET-M08-1-FIXED20');
  assert(pset !== null, 'PSET-M08-1-FIXED20 must exist');
  assert.strictEqual(pset.prompt_ids.length, 20);

  const envs = dal.listEnvironments();
  assert.strictEqual(envs.length, 3);

  const observations = dal.listObservations();
  assert.strictEqual(observations.length, 60);

  const evidence = dal.listEvidence();
  assert.strictEqual(evidence.length, 60);
});

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------

console.log('------------------------------------------------------------');
console.log(`TOTAL GOVERNANCE TESTS   : ${totalTests}`);
console.log(`PASSED TESTS             : ${passedTests} ✓`);
console.log(`FAILED TESTS             : ${failedTests} ✗`);
console.log('------------------------------------------------------------\n');

if (failedTests > 0) {
  console.error(`[FAIL] ${failedTests} test(s) failed.`);
  process.exit(1);
} else {
  console.log('[SUCCESS] All M08.2 Governance & Control tests passed cleanly!\n');
}
