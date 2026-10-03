/**
 * LOCATRIA Visibility Operating System v1.0
 * Domain Layer Test Suite — Module 08 / M08.2 BUILD-03
 *
 * Validates:
 * - D01: Diagnosis entity conforms to schema (DIAG-<domain>-<seq>)
 * - D02: Diagnosis ID pattern strictly enforced; not derived from observation ID
 * - D03: Diagnosis referential integrity (Observation, Evidence, Environment, Run)
 * - D04: Confidence state describes evidence sufficiency (HIGH/MED/LOW/UNVERIFIED)
 * - D05: Uncertainty statement required when confidence is LOW or UNVERIFIED
 * - D06: Diagnosis status lifecycle transitions (DETECTED → UNDER_REVIEW → VALIDATED | NEED_MORE_EVIDENCE | REJECTED)
 * - D07: AI authority restriction: AI_ADVISOR cannot validate diagnoses
 * - D08: Immutability enforcement: Validated diagnoses cannot be overwritten
 * - D09: Zero composite visibility score or priority fields in diagnosis
 * - D10: Opportunity entity conforms to schema (OPP-<domain>-<seq>)
 * - D11: Opportunity referential integrity (links to >= 1 diagnosis)
 * - D12: Diagnosis → Opportunity Gate: Opportunity CANNOT be QUALIFIED unless ALL referenced diagnoses are VALIDATED
 * - D13: Opportunity status lifecycle transitions (DETECTED → DRAFTED → QUALIFYING → QUALIFIED | REJECTED)
 * - D14: AI authority restriction: AI_ADVISOR cannot qualify opportunities
 * - D15: Duplicate opportunity detection
 * - D16: Full Traceability Traverser: Opportunity → Diagnosis → Observation → Evidence → Run/Environment
 *
 * Negative Tests:
 * - N01: Reject diagnosis missing required fields
 * - N02: Reject diagnosis with invalid ID format
 * - N03: Reject diagnosis referencing non-existent observation ID
 * - N04: Reject diagnosis containing forbidden priority fields
 * - N05: Reject diagnosis containing forbidden composite score
 * - N06: Reject diagnosis validation attempt by AI_ADVISOR
 * - N07: Reject mutation of validated diagnosis
 * - N08: Reject opportunity missing required fields
 * - N09: Reject opportunity with invalid ID format
 * - N10: Reject opportunity referencing non-existent diagnosis
 * - N11: Reject opportunity qualification when diagnosis is NOT validated (Gate check)
 * - N12: Reject opportunity qualification attempt by AI_ADVISOR
 * - N13: Reject opportunity containing forbidden action/priority fields
 * - N14: Reject opportunity containing composite score
 * - N15: Reject mutation of qualified opportunity
 *
 * Historical Integrity Guard:
 * - Verifies zero modifications to production historical records (T1 run, 60 obs, 60 evd, 20 prompts)
 */

'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const dal = require('../js/visibility-data/index');
const domain = require('../js/visibility-domain/index');

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
console.log('LOCATRIA VISIBILITY OPERATING SYSTEM DOMAIN TEST SUITE');
console.log('M08.2 BUILD-03 — Diagnosis & Opportunity Foundation v1.0');
console.log('============================================================\n');

// Clean up any previous test fixtures in _fixtures matching DIAG-TEST-* or OPP-TEST-*
const fixtureDir = path.join(dal.getBaseDir(), '_fixtures');
if (fs.existsSync(fixtureDir)) {
  const existingFiles = fs.readdirSync(fixtureDir);
  for (const f of existingFiles) {
    if (f.startsWith('diag-test-') || f.startsWith('opp-test-')) {
      try { fs.unlinkSync(path.join(fixtureDir, f)); } catch (_) {}
    }
  }
}

// -----------------------------------------------------------------
// SECTION 1: DIAGNOSIS DOMAIN TESTS (D01–D09)
// -----------------------------------------------------------------

runTest('D01: Diagnosis entity conforms to schema (DIAG-<domain>-<seq>)', () => {
  const diagData = {
    entity_type: 'diagnosis',
    schema_version: '1.0.0',
    diagnosis_id: 'DIAG-TEST-001',
    diagnosis_version: '1.0.0',
    diagnosis_type: 'DISCOVERY_DIAGNOSIS',
    title: 'Test Entity Discovery Omission in Perplexity',
    statement: 'LOCATRIA entity is consistently omitted across competitive discovery prompts.',
    status: 'DETECTED',
    scope: 'ENVIRONMENT_SPECIFIC',
    observation_refs: ['OBS-T1-PERPLEXITY-P01'],
    evidence_refs: ['EVD-VIS-T1-PERPLEXITY-P01'],
    metric_refs: ['M01_MENTION', 'M04_ENTITY_RECOGNITION'],
    environment_refs: ['ENV-PERPLEXITY'],
    run_refs: ['RUN-M08-1-T1-REF'],
    problem_taxonomy: ['V1_DISCOVERY', 'V7_ENVIRONMENT'],
    confidence_state: 'HIGH',
    created_at: new Date().toISOString(),
    created_by: 'AUDITOR_HUMAN'
  };

  const validation = dal.validateEntity('diagnosis', diagData);
  assert.strictEqual(validation.valid, true, `Schema validation should pass: ${validation.errors.join('; ')}`);
});

runTest('D02: Diagnosis ID pattern strictly enforced; not derived from observation ID', () => {
  assert.doesNotThrow(() => {
    domain.createDiagnosis({
      diagnosis_id: 'DIAG-TEST-002',
      title: 'Valid Diagnosis ID Pattern',
      statement: 'Valid diagnosis statement for pattern test.',
      scope: 'GLOBAL',
      observation_refs: ['OBS-T1-CHATGPT-P01'],
      evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
      metric_refs: ['M01_MENTION'],
      environment_refs: ['ENV-CHATGPT'],
      run_refs: ['RUN-M08-1-T1-REF'],
      problem_taxonomy: ['V1_DISCOVERY'],
      confidence_state: 'HIGH'
    }, { isFixture: true, recordAudit: false });
  });

  // Rejection of observation-derived ID
  assert.throws(() => {
    domain.createDiagnosis({
      diagnosis_id: 'OBS-T1-CHATGPT-P01-DIAG',
      title: 'Invalid Diagnosis ID Pattern',
      statement: 'Derived from observation ID',
      scope: 'GLOBAL',
      observation_refs: ['OBS-T1-CHATGPT-P01'],
      evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
      metric_refs: ['M01_MENTION'],
      environment_refs: ['ENV-CHATGPT'],
      run_refs: ['RUN-M08-1-T1-REF'],
      problem_taxonomy: ['V1_DISCOVERY'],
      confidence_state: 'HIGH'
    }, { isFixture: true });
  }, /INVALID_IDENTIFIER|CONVENTION_ERROR/);
});

runTest('D03: Diagnosis referential integrity (Observation, Evidence, Environment, Run)', () => {
  const created = domain.createDiagnosis({
    diagnosis_id: 'DIAG-TEST-003',
    title: 'Referential Integrity Test Diagnosis',
    statement: 'Referencing existing canonical observations and evidence from T1.',
    scope: 'GLOBAL',
    observation_refs: ['OBS-T1-CHATGPT-P01', 'OBS-T1-GEMINI-P01'],
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01', 'EVD-VIS-T1-GEMINI-P01'],
    metric_refs: ['M01_MENTION'],
    environment_refs: ['ENV-CHATGPT', 'ENV-GEMINI'],
    run_refs: ['RUN-M08-1-T1-REF'],
    problem_taxonomy: ['V1_DISCOVERY'],
    confidence_state: 'HIGH'
  }, { isFixture: true, recordAudit: false });

  assert.strictEqual(created.diagnosis_id, 'DIAG-TEST-003');

  // Verify DAL relationship resolution
  const resolvedObs = dal.resolveRelationship('diagnosis', 'DIAG-TEST-003', 'observation');
  assert.strictEqual(resolvedObs.length, 2, 'Should resolve 2 observations');
  assert.strictEqual(resolvedObs[0].observation_id, 'OBS-T1-CHATGPT-P01');

  const resolvedEvd = dal.resolveRelationship('diagnosis', 'DIAG-TEST-003', 'visibility_evidence');
  assert.strictEqual(resolvedEvd.length, 2, 'Should resolve 2 evidence records');

  const resolvedEnv = dal.resolveRelationship('diagnosis', 'DIAG-TEST-003', 'environment');
  assert.strictEqual(resolvedEnv.length, 2, 'Should resolve 2 environments');
});

runTest('D04: Confidence state describes evidence sufficiency (HIGH/MED/LOW/UNVERIFIED)', () => {
  // HIGH confidence
  const dHigh = domain.createDiagnosis({
    diagnosis_id: 'DIAG-TEST-004-HIGH',
    title: 'High Confidence Diagnosis',
    statement: 'Solid multi-observation evidence across full run.',
    scope: 'GLOBAL',
    observation_refs: ['OBS-T1-CHATGPT-P01'],
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
    metric_refs: ['M01_MENTION'],
    environment_refs: ['ENV-CHATGPT'],
    run_refs: ['RUN-M08-1-T1-REF'],
    problem_taxonomy: ['V1_DISCOVERY'],
    confidence_state: 'HIGH'
  }, { isFixture: true, recordAudit: false });
  assert.strictEqual(dHigh.confidence_state, 'HIGH');

  // UNVERIFIED confidence with uncertainty statement
  const dUnver = domain.createDiagnosis({
    diagnosis_id: 'DIAG-TEST-004-UNVER',
    title: 'Unverified Confidence Diagnosis',
    statement: 'Preliminary observation requiring further testing.',
    scope: 'GLOBAL',
    observation_refs: ['OBS-T1-GEMINI-P01'],
    evidence_refs: ['EVD-VIS-T1-GEMINI-P01'],
    metric_refs: ['M01_MENTION'],
    environment_refs: ['ENV-GEMINI'],
    run_refs: ['RUN-M08-1-T1-REF'],
    problem_taxonomy: ['V1_DISCOVERY'],
    confidence_state: 'UNVERIFIED',
    uncertainty_statement: 'Sample size insufficient to confirm whether failure is persistent or transient.'
  }, { isFixture: true, recordAudit: false });
  assert.strictEqual(dUnver.confidence_state, 'UNVERIFIED');
});

runTest('D05: Uncertainty statement required when confidence is LOW or UNVERIFIED', () => {
  // Should reject when confidence is LOW and uncertainty_statement is missing
  assert.throws(() => {
    domain.createDiagnosis({
      diagnosis_id: 'DIAG-TEST-005-FAIL',
      title: 'Missing Uncertainty Diagnosis',
      statement: 'Low confidence without uncertainty statement',
      scope: 'GLOBAL',
      observation_refs: ['OBS-T1-CHATGPT-P01'],
      evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
      metric_refs: ['M01_MENTION'],
      environment_refs: ['ENV-CHATGPT'],
      run_refs: ['RUN-M08-1-T1-REF'],
      problem_taxonomy: ['V1_DISCOVERY'],
      confidence_state: 'LOW'
    }, { isFixture: true });
  }, /EPISTEMIC_ERROR/);

  // Should succeed when uncertainty_statement is present
  assert.doesNotThrow(() => {
    domain.createDiagnosis({
      diagnosis_id: 'DIAG-TEST-005-PASS',
      title: 'Valid Low Confidence Diagnosis',
      statement: 'Low confidence with explicit uncertainty statement',
      scope: 'GLOBAL',
      observation_refs: ['OBS-T1-CHATGPT-P01'],
      evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
      metric_refs: ['M01_MENTION'],
      environment_refs: ['ENV-CHATGPT'],
      run_refs: ['RUN-M08-1-T1-REF'],
      problem_taxonomy: ['V1_DISCOVERY'],
      confidence_state: 'LOW',
      uncertainty_statement: 'High variability in AI search engine responses across repeated trials.'
    }, { isFixture: true, recordAudit: false });
  });
});

runTest('D06: Diagnosis status lifecycle transitions (DETECTED → UNDER_REVIEW → VALIDATED)', () => {
  domain.createDiagnosis({
    diagnosis_id: 'DIAG-TEST-006',
    title: 'Lifecycle Transition Diagnosis',
    statement: 'Valid statement for transition testing.',
    scope: 'GLOBAL',
    observation_refs: ['OBS-T1-PERPLEXITY-P01'],
    evidence_refs: ['EVD-VIS-T1-PERPLEXITY-P01'],
    metric_refs: ['M01_MENTION'],
    environment_refs: ['ENV-PERPLEXITY'],
    run_refs: ['RUN-M08-1-T1-REF'],
    problem_taxonomy: ['V1_DISCOVERY'],
    confidence_state: 'HIGH'
  }, { isFixture: true, recordAudit: false });

  // DETECTED -> UNDER_REVIEW
  const underReview = domain.transitionDiagnosisStatus('DIAG-TEST-006', 'UNDER_REVIEW', {
    actor: 'OPERATOR_QA',
    actor_type: 'OPERATOR',
    notes: 'Beginning manual review'
  }, { isFixture: true, recordAudit: false });
  assert.strictEqual(underReview.status, 'UNDER_REVIEW');

  // UNDER_REVIEW -> VALIDATED (by Founder)
  const validated = domain.transitionDiagnosisStatus('DIAG-TEST-006', 'VALIDATED', {
    actor: 'FOUNDER',
    actor_type: 'FOUNDER',
    notes: 'Diagnosis confirmed by Founder audit'
  }, { isFixture: true, recordAudit: false });
  assert.strictEqual(validated.status, 'VALIDATED');
  assert.strictEqual(validated.validated_by, 'FOUNDER');
  assert.strictEqual(validated.is_immutable, true);
});

runTest('D07: AI authority restriction: AI_ADVISOR cannot validate diagnoses', () => {
  domain.createDiagnosis({
    diagnosis_id: 'DIAG-TEST-007',
    title: 'AI Restriction Test Diagnosis',
    statement: 'Diagnosis to test AI validation prohibition.',
    scope: 'GLOBAL',
    observation_refs: ['OBS-T1-PERPLEXITY-P01'],
    evidence_refs: ['EVD-VIS-T1-PERPLEXITY-P01'],
    metric_refs: ['M01_MENTION'],
    environment_refs: ['ENV-PERPLEXITY'],
    run_refs: ['RUN-M08-1-T1-REF'],
    problem_taxonomy: ['V1_DISCOVERY'],
    confidence_state: 'HIGH'
  }, { isFixture: true, recordAudit: false });

  domain.transitionDiagnosisStatus('DIAG-TEST-007', 'UNDER_REVIEW', {
    actor: 'AI_ADVISOR',
    actor_type: 'AI_ADVISOR'
  }, { isFixture: true, recordAudit: false });

  // AI attempting to validate must be blocked
  assert.throws(() => {
    domain.transitionDiagnosisStatus('DIAG-TEST-007', 'VALIDATED', {
      actor: 'AI_ADVISOR',
      actor_type: 'AI_ADVISOR',
      notes: 'AI auto-validation'
    }, { isFixture: true });
  }, /PERMISSION_DENIED/);
});

runTest('D08: Immutability enforcement: Validated diagnoses cannot be overwritten', () => {
  domain.createDiagnosis({
    diagnosis_id: 'DIAG-TEST-008',
    title: 'Immutability Test Diagnosis',
    statement: 'Statement before validation.',
    scope: 'GLOBAL',
    observation_refs: ['OBS-T1-CHATGPT-P01'],
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
    metric_refs: ['M01_MENTION'],
    environment_refs: ['ENV-CHATGPT'],
    run_refs: ['RUN-M08-1-T1-REF'],
    problem_taxonomy: ['V1_DISCOVERY'],
    confidence_state: 'HIGH'
  }, { isFixture: true, recordAudit: false });

  domain.transitionDiagnosisStatus('DIAG-TEST-008', 'UNDER_REVIEW', { actor: 'HUMAN', actor_type: 'OPERATOR' }, { isFixture: true, recordAudit: false });
  domain.transitionDiagnosisStatus('DIAG-TEST-008', 'VALIDATED', { actor: 'FOUNDER', actor_type: 'FOUNDER' }, { isFixture: true, recordAudit: false });

  // Attempting to overwrite or mutate validated diagnosis
  assert.throws(() => {
    dal.saveEntity('diagnosis', {
      entity_type: 'diagnosis',
      schema_version: '1.0.0',
      diagnosis_id: 'DIAG-TEST-008',
      diagnosis_version: '1.0.0',
      diagnosis_type: 'DISCOVERY_DIAGNOSIS',
      title: 'Tampered Title',
      statement: 'Attempting to overwrite a validated diagnosis.',
      status: 'VALIDATED',
      scope: 'GLOBAL',
      observation_refs: ['OBS-T1-CHATGPT-P01'],
      evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
      metric_refs: ['M01_MENTION'],
      environment_refs: ['ENV-CHATGPT'],
      run_refs: ['RUN-M08-1-T1-REF'],
      problem_taxonomy: ['V1_DISCOVERY'],
      confidence_state: 'HIGH',
      created_at: new Date().toISOString(),
      created_by: 'MALICIOUS_ACTOR'
    }, { isFixture: true });
  }, /IMMUTABILITY_VIOLATION/);
});

runTest('D09: Zero composite visibility score or priority fields in diagnosis', () => {
  const diagForbidden = {
    entity_type: 'diagnosis',
    schema_version: '1.0.0',
    diagnosis_id: 'DIAG-TEST-009',
    diagnosis_version: '1.0.0',
    diagnosis_type: 'DISCOVERY_DIAGNOSIS',
    title: 'Diagnosis with Forbidden Score',
    statement: 'Forbidden field test.',
    status: 'DETECTED',
    scope: 'GLOBAL',
    observation_refs: ['OBS-T1-CHATGPT-P01'],
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
    metric_refs: ['M01_MENTION'],
    environment_refs: ['ENV-CHATGPT'],
    run_refs: ['RUN-M08-1-T1-REF'],
    problem_taxonomy: ['V1_DISCOVERY'],
    confidence_state: 'HIGH',
    visibility_score: 85, // Strictly forbidden!
    created_at: new Date().toISOString(),
    created_by: 'OPERATOR'
  };

  const validation = dal.validateEntity('diagnosis', diagForbidden);
  assert.strictEqual(validation.valid, false, 'Should fail validation due to composite score');
});

// -----------------------------------------------------------------
// SECTION 2: OPPORTUNITY DOMAIN TESTS (D10–D16)
// -----------------------------------------------------------------

runTest('D10: Opportunity entity conforms to schema (OPP-<domain>-<seq>)', () => {
  // First ensure we have a validated diagnosis to reference
  domain.createDiagnosis({
    diagnosis_id: 'DIAG-TEST-010',
    title: 'Validated Diagnosis for Opportunity',
    statement: 'Validated statement for opportunity testing.',
    scope: 'GLOBAL',
    observation_refs: ['OBS-T1-CHATGPT-P01'],
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
    metric_refs: ['M01_MENTION'],
    environment_refs: ['ENV-CHATGPT'],
    run_refs: ['RUN-M08-1-T1-REF'],
    problem_taxonomy: ['V1_DISCOVERY'],
    confidence_state: 'HIGH'
  }, { isFixture: true, recordAudit: false });
  domain.transitionDiagnosisStatus('DIAG-TEST-010', 'UNDER_REVIEW', { actor: 'HUMAN', actor_type: 'OPERATOR' }, { isFixture: true, recordAudit: false });
  domain.transitionDiagnosisStatus('DIAG-TEST-010', 'VALIDATED', { actor: 'FOUNDER', actor_type: 'FOUNDER' }, { isFixture: true, recordAudit: false });

  const oppData = {
    entity_type: 'opportunity',
    schema_version: '1.0.0',
    opportunity_id: 'OPP-TEST-010',
    opportunity_version: '1.0.0',
    opportunity_type: 'VISIBILITY_IMPROVEMENT',
    title: 'Establish Authoritative Entity Grounding',
    statement: 'Opportunity to improve entity discoverability by formalizing entity schema markup.',
    status: 'DETECTED',
    scope: 'GLOBAL',
    diagnosis_refs: ['DIAG-TEST-010'],
    problem_taxonomy: ['V1_DISCOVERY', 'V4_ENTITY'],
    qualification_state: 'UNQUALIFIED',
    confidence_state: 'HIGH',
    created_at: new Date().toISOString(),
    created_by: 'FOUNDER'
  };

  const validation = dal.validateEntity('opportunity', oppData);
  assert.strictEqual(validation.valid, true, `Schema validation should pass: ${validation.errors.join('; ')}`);
});

runTest('D11: Opportunity referential integrity (links to >= 1 diagnosis)', () => {
  const opp = domain.createOpportunity({
    opportunity_id: 'OPP-TEST-011',
    title: 'Referential Integrity Opportunity',
    statement: 'Opportunity referencing validated diagnosis DIAG-TEST-010.',
    scope: 'GLOBAL',
    diagnosis_refs: ['DIAG-TEST-010'],
    problem_taxonomy: ['V1_DISCOVERY'],
    qualification_state: 'UNQUALIFIED',
    confidence_state: 'HIGH'
  }, { isFixture: true, recordAudit: false });

  assert.strictEqual(opp.opportunity_id, 'OPP-TEST-011');
  const resolvedDiags = dal.resolveRelationship('opportunity', 'OPP-TEST-011', 'diagnosis');
  assert.strictEqual(resolvedDiags.length, 1);
  assert.strictEqual(resolvedDiags[0].diagnosis_id, 'DIAG-TEST-010');
});

runTest('D12: Diagnosis → Opportunity Gate: Opportunity CANNOT be QUALIFIED unless ALL referenced diagnoses are VALIDATED', () => {
  // Create an UNVALIDATED diagnosis (remains in DETECTED)
  domain.createDiagnosis({
    diagnosis_id: 'DIAG-TEST-012-UNVAL',
    title: 'Unvalidated Diagnosis',
    statement: 'This diagnosis has not been validated by Founder.',
    scope: 'GLOBAL',
    observation_refs: ['OBS-T1-CHATGPT-P01'],
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
    metric_refs: ['M01_MENTION'],
    environment_refs: ['ENV-CHATGPT'],
    run_refs: ['RUN-M08-1-T1-REF'],
    problem_taxonomy: ['V1_DISCOVERY'],
    confidence_state: 'HIGH'
  }, { isFixture: true, recordAudit: false });

  // Create Opportunity referencing unvalidated diagnosis
  domain.createOpportunity({
    opportunity_id: 'OPP-TEST-012',
    title: 'Gate Test Opportunity',
    statement: 'Opportunity that should fail qualification gate.',
    scope: 'GLOBAL',
    diagnosis_refs: ['DIAG-TEST-012-UNVAL'],
    problem_taxonomy: ['V1_DISCOVERY'],
    qualification_state: 'UNQUALIFIED',
    confidence_state: 'HIGH'
  }, { isFixture: true, recordAudit: false });

  domain.transitionOpportunityStatus('OPP-TEST-012', 'DRAFTED', { actor: 'OPERATOR', actor_type: 'OPERATOR' }, { isFixture: true, recordAudit: false });
  domain.transitionOpportunityStatus('OPP-TEST-012', 'QUALIFYING', { actor: 'OPERATOR', actor_type: 'OPERATOR' }, { isFixture: true, recordAudit: false });

  // Qualification attempt must fail gate check!
  assert.throws(() => {
    domain.transitionOpportunityStatus('OPP-TEST-012', 'QUALIFIED', {
      actor: 'FOUNDER',
      actor_type: 'FOUNDER'
    }, { isFixture: true });
  }, /GATE_ERROR/);
});

runTest('D13: Opportunity status lifecycle transitions (DETECTED → DRAFTED → QUALIFYING → QUALIFIED)', () => {
  // Reference DIAG-TEST-010 which is already VALIDATED
  domain.createOpportunity({
    opportunity_id: 'OPP-TEST-013',
    title: 'Valid Lifecycle Opportunity',
    statement: 'Opportunity progressing cleanly through qualification gate.',
    scope: 'GLOBAL',
    diagnosis_refs: ['DIAG-TEST-010'],
    problem_taxonomy: ['V1_DISCOVERY'],
    qualification_state: 'UNQUALIFIED',
    confidence_state: 'HIGH'
  }, { isFixture: true, recordAudit: false });

  const drafted = domain.transitionOpportunityStatus('OPP-TEST-013', 'DRAFTED', { actor: 'HUMAN', actor_type: 'OPERATOR' }, { isFixture: true, recordAudit: false });
  assert.strictEqual(drafted.status, 'DRAFTED');

  const qualifying = domain.transitionOpportunityStatus('OPP-TEST-013', 'QUALIFYING', { actor: 'HUMAN', actor_type: 'OPERATOR' }, { isFixture: true, recordAudit: false });
  assert.strictEqual(qualifying.status, 'QUALIFYING');
  assert.strictEqual(qualifying.qualification_state, 'IN_QUALIFICATION');

  const qualified = domain.transitionOpportunityStatus('OPP-TEST-013', 'QUALIFIED', {
    actor: 'FOUNDER',
    actor_type: 'FOUNDER',
    notes: 'Opportunity approved and qualified by Founder'
  }, { isFixture: true, recordAudit: false });
  assert.strictEqual(qualified.status, 'QUALIFIED');
  assert.strictEqual(qualified.qualification_state, 'QUALIFIED');
  assert.strictEqual(qualified.qualified_by, 'FOUNDER');
  assert.strictEqual(qualified.is_immutable, true);
});

runTest('D14: AI authority restriction: AI_ADVISOR cannot qualify opportunities', () => {
  domain.createOpportunity({
    opportunity_id: 'OPP-TEST-014',
    title: 'AI Qualification Restriction Opportunity',
    statement: 'Testing prohibition of AI qualifying opportunities.',
    scope: 'GLOBAL',
    diagnosis_refs: ['DIAG-TEST-010'],
    problem_taxonomy: ['V1_DISCOVERY'],
    qualification_state: 'UNQUALIFIED',
    confidence_state: 'HIGH'
  }, { isFixture: true, recordAudit: false });

  domain.transitionOpportunityStatus('OPP-TEST-014', 'DRAFTED', { actor: 'AI_ADVISOR', actor_type: 'AI_ADVISOR' }, { isFixture: true, recordAudit: false });
  domain.transitionOpportunityStatus('OPP-TEST-014', 'QUALIFYING', { actor: 'AI_ADVISOR', actor_type: 'AI_ADVISOR' }, { isFixture: true, recordAudit: false });

  // AI attempting to qualify must be blocked
  assert.throws(() => {
    domain.transitionOpportunityStatus('OPP-TEST-014', 'QUALIFIED', {
      actor: 'AI_ADVISOR',
      actor_type: 'AI_ADVISOR'
    }, { isFixture: true });
  }, /PERMISSION_DENIED/);
});

runTest('D15: Duplicate opportunity detection', () => {
  const oppCandidate = {
    opportunity_id: 'OPP-TEST-015-DUP',
    title: 'Duplicate Check Candidate',
    statement: 'Candidate with identical diagnosis refs as OPP-TEST-013.',
    scope: 'GLOBAL',
    diagnosis_refs: ['DIAG-TEST-010'],
    problem_taxonomy: ['V1_DISCOVERY'],
    qualification_state: 'UNQUALIFIED',
    confidence_state: 'HIGH'
  };

  const dups = domain.detectDuplicateOpportunities(oppCandidate, { includeFixtures: true });
  assert(dups.length > 0, 'Should detect duplicate opportunity sharing identical diagnosis refs');
  assert.strictEqual(dups[0].reason, 'IDENTICAL_DIAGNOSIS_REFS');
});

runTest('D16: Full Traceability Traverser: Opportunity → Diagnosis → Observation → Evidence → Run/Environment', () => {
  const trace = domain.traceEvidenceChain('OPP-TEST-013', { includeFixtures: true });
  assert.strictEqual(trace.found, true, 'Opportunity should be found');
  assert.strictEqual(trace.is_complete, true, 'Trace chain should be complete');
  assert.strictEqual(trace.diagnoses.length, 1, 'Should resolve 1 diagnosis');
  assert.strictEqual(trace.diagnoses[0].diagnosis_id, 'DIAG-TEST-010');
  assert.strictEqual(trace.observations.length, 1, 'Should resolve 1 observation');
  assert.strictEqual(trace.evidence.length, 1, 'Should resolve 1 evidence record');
  assert.strictEqual(trace.broken_links.length, 0, 'Should have 0 broken links');
});

// -----------------------------------------------------------------
// SECTION 3: NEGATIVE TESTS (N01–N15)
// -----------------------------------------------------------------

runTest('N01: Reject diagnosis missing required fields', () => {
  const incompleteDiag = {
    entity_type: 'diagnosis',
    schema_version: '1.0.0',
    diagnosis_id: 'DIAG-N01-INCOMPLETE',
    // missing statement, scope, confidence_state, created_by
    title: 'Incomplete Diagnosis'
  };
  const validation = dal.validateEntity('diagnosis', incompleteDiag);
  assert.strictEqual(validation.valid, false);
});

runTest('N02: Reject diagnosis with invalid ID format', () => {
  const invalidIdDiag = {
    entity_type: 'diagnosis',
    schema_version: '1.0.0',
    diagnosis_id: 'INVALID_DIAG_ID', // Missing DIAG- prefix
    diagnosis_version: '1.0.0',
    diagnosis_type: 'DISCOVERY_DIAGNOSIS',
    title: 'Invalid ID Format',
    statement: 'Testing invalid ID format rejection.',
    status: 'DETECTED',
    scope: 'GLOBAL',
    observation_refs: ['OBS-T1-CHATGPT-P01'],
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
    metric_refs: ['M01_MENTION'],
    environment_refs: ['ENV-CHATGPT'],
    run_refs: ['RUN-M08-1-T1-REF'],
    problem_taxonomy: ['V1_DISCOVERY'],
    confidence_state: 'HIGH',
    created_at: new Date().toISOString(),
    created_by: 'OPERATOR'
  };
  const validation = dal.validateEntity('diagnosis', invalidIdDiag);
  assert.strictEqual(validation.valid, false);
});

runTest('N03: Reject diagnosis referencing non-existent observation ID', () => {
  assert.throws(() => {
    domain.createDiagnosis({
      diagnosis_id: 'DIAG-TEST-N03',
      title: 'Missing Observation Diagnosis',
      statement: 'Referencing non-existent observation.',
      scope: 'GLOBAL',
      observation_refs: ['OBS-NON-EXISTENT-999'],
      evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
      metric_refs: ['M01_MENTION'],
      environment_refs: ['ENV-CHATGPT'],
      run_refs: ['RUN-M08-1-T1-REF'],
      problem_taxonomy: ['V1_DISCOVERY'],
      confidence_state: 'HIGH'
    }, { isFixture: true });
  }, /RELATIONSHIP_ERROR/);
});

runTest('N04: Reject diagnosis containing forbidden priority field', () => {
  assert.throws(() => {
    domain.createDiagnosis({
      diagnosis_id: 'DIAG-TEST-N04',
      title: 'Forbidden Priority Diagnosis',
      statement: 'Attempting to inject priority into diagnosis.',
      scope: 'GLOBAL',
      observation_refs: ['OBS-T1-CHATGPT-P01'],
      evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
      metric_refs: ['M01_MENTION'],
      environment_refs: ['ENV-CHATGPT'],
      run_refs: ['RUN-M08-1-T1-REF'],
      problem_taxonomy: ['V1_DISCOVERY'],
      confidence_state: 'HIGH',
      priority: 'P0' // FORBIDDEN!
    }, { isFixture: true });
  }, /GOVERNANCE_ERROR/);
});

runTest('N05: Reject diagnosis containing forbidden composite score', () => {
  assert.throws(() => {
    domain.createDiagnosis({
      diagnosis_id: 'DIAG-TEST-N05',
      title: 'Forbidden Score Diagnosis',
      statement: 'Attempting to inject composite visibility score.',
      scope: 'GLOBAL',
      observation_refs: ['OBS-T1-CHATGPT-P01'],
      evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
      metric_refs: ['M01_MENTION'],
      environment_refs: ['ENV-CHATGPT'],
      run_refs: ['RUN-M08-1-T1-REF'],
      problem_taxonomy: ['V1_DISCOVERY'],
      confidence_state: 'HIGH',
      composite_score: 95.5 // FORBIDDEN!
    }, { isFixture: true });
  }, /GOVERNANCE_ERROR/);
});

runTest('N06: Reject diagnosis validation attempt by AI_ADVISOR', () => {
  domain.createDiagnosis({
    diagnosis_id: 'DIAG-TEST-N06',
    title: 'AI Validation Block Test',
    statement: 'Testing AI validation rejection.',
    scope: 'GLOBAL',
    observation_refs: ['OBS-T1-CHATGPT-P01'],
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
    metric_refs: ['M01_MENTION'],
    environment_refs: ['ENV-CHATGPT'],
    run_refs: ['RUN-M08-1-T1-REF'],
    problem_taxonomy: ['V1_DISCOVERY'],
    confidence_state: 'HIGH'
  }, { isFixture: true, recordAudit: false });

  domain.transitionDiagnosisStatus('DIAG-TEST-N06', 'UNDER_REVIEW', { actor: 'OPERATOR', actor_type: 'OPERATOR' }, { isFixture: true, recordAudit: false });

  assert.throws(() => {
    domain.transitionDiagnosisStatus('DIAG-TEST-N06', 'VALIDATED', {
      actor: 'AI_AGENT',
      actor_type: 'AI_ADVISOR'
    }, { isFixture: true });
  }, /PERMISSION_DENIED/);
});

runTest('N07: Reject mutation of validated diagnosis', () => {
  domain.createDiagnosis({
    diagnosis_id: 'DIAG-TEST-N07',
    title: 'Validated Immutability Test',
    statement: 'Pre-validation diagnosis statement.',
    scope: 'GLOBAL',
    observation_refs: ['OBS-T1-CHATGPT-P01'],
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
    metric_refs: ['M01_MENTION'],
    environment_refs: ['ENV-CHATGPT'],
    run_refs: ['RUN-M08-1-T1-REF'],
    problem_taxonomy: ['V1_DISCOVERY'],
    confidence_state: 'HIGH'
  }, { isFixture: true, recordAudit: false });

  domain.transitionDiagnosisStatus('DIAG-TEST-N07', 'UNDER_REVIEW', { actor: 'OPERATOR', actor_type: 'OPERATOR' }, { isFixture: true, recordAudit: false });
  domain.transitionDiagnosisStatus('DIAG-TEST-N07', 'VALIDATED', { actor: 'FOUNDER', actor_type: 'FOUNDER' }, { isFixture: true, recordAudit: false });

  // Direct mutation attempt must fail
  assert.throws(() => {
    domain.transitionDiagnosisStatus('DIAG-TEST-N07', 'UNDER_REVIEW', { actor: 'FOUNDER', actor_type: 'FOUNDER' }, { isFixture: true });
  }, /IMMUTABILITY_VIOLATION/);
});

runTest('N08: Reject opportunity missing required fields', () => {
  const incompleteOpp = {
    entity_type: 'opportunity',
    schema_version: '1.0.0',
    opportunity_id: 'OPP-N08-INCOMPLETE',
    title: 'Incomplete Opportunity'
    // missing statement, diagnosis_refs, etc.
  };
  const validation = dal.validateEntity('opportunity', incompleteOpp);
  assert.strictEqual(validation.valid, false);
});

runTest('N09: Reject opportunity with invalid ID format', () => {
  const invalidIdOpp = {
    entity_type: 'opportunity',
    schema_version: '1.0.0',
    opportunity_id: 'INVALID_OPP_ID', // missing OPP- prefix
    opportunity_version: '1.0.0',
    opportunity_type: 'VISIBILITY_IMPROVEMENT',
    title: 'Invalid ID Format Opp',
    statement: 'Opportunity testing invalid ID pattern.',
    status: 'DETECTED',
    scope: 'GLOBAL',
    diagnosis_refs: ['DIAG-TEST-010'],
    problem_taxonomy: ['V1_DISCOVERY'],
    qualification_state: 'UNQUALIFIED',
    confidence_state: 'HIGH',
    created_at: new Date().toISOString(),
    created_by: 'FOUNDER'
  };
  const validation = dal.validateEntity('opportunity', invalidIdOpp);
  assert.strictEqual(validation.valid, false);
});

runTest('N10: Reject opportunity referencing non-existent diagnosis', () => {
  assert.throws(() => {
    domain.createOpportunity({
      opportunity_id: 'OPP-TEST-N10',
      title: 'Missing Diagnosis Reference Opp',
      statement: 'Referencing non-existent diagnosis.',
      scope: 'GLOBAL',
      diagnosis_refs: ['DIAG-NON-EXISTENT-999'],
      problem_taxonomy: ['V1_DISCOVERY'],
      qualification_state: 'UNQUALIFIED',
      confidence_state: 'HIGH'
    }, { isFixture: true });
  }, /RELATIONSHIP_ERROR/);
});

runTest('N11: Reject opportunity qualification when diagnosis is NOT validated (Gate check)', () => {
  // Diagnosis exists but in UNDER_REVIEW
  domain.createDiagnosis({
    diagnosis_id: 'DIAG-TEST-N11',
    title: 'Diagnosis Under Review',
    statement: 'In review, not yet validated.',
    scope: 'GLOBAL',
    observation_refs: ['OBS-T1-CHATGPT-P01'],
    evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
    metric_refs: ['M01_MENTION'],
    environment_refs: ['ENV-CHATGPT'],
    run_refs: ['RUN-M08-1-T1-REF'],
    problem_taxonomy: ['V1_DISCOVERY'],
    confidence_state: 'HIGH'
  }, { isFixture: true, recordAudit: false });

  domain.transitionDiagnosisStatus('DIAG-TEST-N11', 'UNDER_REVIEW', { actor: 'OPERATOR', actor_type: 'OPERATOR' }, { isFixture: true, recordAudit: false });

  domain.createOpportunity({
    opportunity_id: 'OPP-TEST-N11',
    title: 'Unqualified Opportunity Due To Gate',
    statement: 'Referencing diagnosis DIAG-TEST-N11 which is UNDER_REVIEW.',
    scope: 'GLOBAL',
    diagnosis_refs: ['DIAG-TEST-N11'],
    problem_taxonomy: ['V1_DISCOVERY'],
    qualification_state: 'UNQUALIFIED',
    confidence_state: 'HIGH'
  }, { isFixture: true, recordAudit: false });

  domain.transitionOpportunityStatus('OPP-TEST-N11', 'DRAFTED', { actor: 'OPERATOR', actor_type: 'OPERATOR' }, { isFixture: true, recordAudit: false });
  domain.transitionOpportunityStatus('OPP-TEST-N11', 'QUALIFYING', { actor: 'OPERATOR', actor_type: 'OPERATOR' }, { isFixture: true, recordAudit: false });

  // Gate check must reject qualification
  assert.throws(() => {
    domain.transitionOpportunityStatus('OPP-TEST-N11', 'QUALIFIED', {
      actor: 'FOUNDER',
      actor_type: 'FOUNDER'
    }, { isFixture: true });
  }, /GATE_ERROR/);
});

runTest('N12: Reject opportunity qualification attempt by AI_ADVISOR', () => {
  // Using DIAG-TEST-010 which is VALIDATED
  domain.createOpportunity({
    opportunity_id: 'OPP-TEST-N12',
    title: 'AI Qualification Block Test',
    statement: 'Opportunity testing AI qualification rejection.',
    scope: 'GLOBAL',
    diagnosis_refs: ['DIAG-TEST-010'],
    problem_taxonomy: ['V1_DISCOVERY'],
    qualification_state: 'UNQUALIFIED',
    confidence_state: 'HIGH'
  }, { isFixture: true, recordAudit: false });

  domain.transitionOpportunityStatus('OPP-TEST-N12', 'DRAFTED', { actor: 'OPERATOR', actor_type: 'OPERATOR' }, { isFixture: true, recordAudit: false });
  domain.transitionOpportunityStatus('OPP-TEST-N12', 'QUALIFYING', { actor: 'OPERATOR', actor_type: 'OPERATOR' }, { isFixture: true, recordAudit: false });

  assert.throws(() => {
    domain.transitionOpportunityStatus('OPP-TEST-N12', 'QUALIFIED', {
      actor: 'AI_ADVISOR',
      actor_type: 'AI_ADVISOR'
    }, { isFixture: true });
  }, /PERMISSION_DENIED/);
});

runTest('N13: Reject opportunity containing forbidden action/priority fields', () => {
  assert.throws(() => {
    domain.createOpportunity({
      opportunity_id: 'OPP-TEST-N13',
      title: 'Forbidden Fields Opportunity',
      statement: 'Attempting to inject priority and action_id into opportunity.',
      scope: 'GLOBAL',
      diagnosis_refs: ['DIAG-TEST-010'],
      problem_taxonomy: ['V1_DISCOVERY'],
      qualification_state: 'UNQUALIFIED',
      confidence_state: 'HIGH',
      priority: 'P1',        // FORBIDDEN!
      action_id: 'ACT-01'    // FORBIDDEN!
    }, { isFixture: true });
  }, /GOVERNANCE_ERROR/);
});

runTest('N14: Reject opportunity containing composite score', () => {
  assert.throws(() => {
    domain.createOpportunity({
      opportunity_id: 'OPP-TEST-N14',
      title: 'Forbidden Composite Score Opp',
      statement: 'Attempting to inject composite visibility score.',
      scope: 'GLOBAL',
      diagnosis_refs: ['DIAG-TEST-010'],
      problem_taxonomy: ['V1_DISCOVERY'],
      qualification_state: 'UNQUALIFIED',
      confidence_state: 'HIGH',
      visibility_score: 77.2 // FORBIDDEN!
    }, { isFixture: true });
  }, /GOVERNANCE_ERROR/);
});

runTest('N15: Reject mutation of qualified opportunity', () => {
  domain.createOpportunity({
    opportunity_id: 'OPP-TEST-N15',
    title: 'Qualified Opportunity Immutability Test',
    statement: 'Opportunity to verify post-qualification immutability.',
    scope: 'GLOBAL',
    diagnosis_refs: ['DIAG-TEST-010'],
    problem_taxonomy: ['V1_DISCOVERY'],
    qualification_state: 'UNQUALIFIED',
    confidence_state: 'HIGH'
  }, { isFixture: true, recordAudit: false });

  domain.transitionOpportunityStatus('OPP-TEST-N15', 'DRAFTED', { actor: 'OPERATOR', actor_type: 'OPERATOR' }, { isFixture: true, recordAudit: false });
  domain.transitionOpportunityStatus('OPP-TEST-N15', 'QUALIFYING', { actor: 'OPERATOR', actor_type: 'OPERATOR' }, { isFixture: true, recordAudit: false });
  domain.transitionOpportunityStatus('OPP-TEST-N15', 'QUALIFIED', { actor: 'FOUNDER', actor_type: 'FOUNDER' }, { isFixture: true, recordAudit: false });

  // Direct mutation attempt must fail
  assert.throws(() => {
    domain.transitionOpportunityStatus('OPP-TEST-N15', 'DRAFTED', { actor: 'FOUNDER', actor_type: 'FOUNDER' }, { isFixture: true });
  }, /IMMUTABILITY_VIOLATION/);
});

// -----------------------------------------------------------------
// SECTION 4: HISTORICAL DATA INTEGRITY GUARD
// -----------------------------------------------------------------

runTest('HIST-INTEGRITY: Zero production historical records modified during domain tests', () => {
  // Verify T1 Run
  const t1Run = dal.loadEntity('measurement_run', 'RUN-M08-1-T1-REF');
  assert(t1Run !== null, 'T1 run must exist');
  assert.strictEqual(t1Run.status, 'COMPLETED');
  assert.strictEqual(t1Run.is_immutable, true);
  assert.strictEqual(t1Run.observation_count, 60);

  // Verify 60 observations
  const observations = dal.listObservations();
  assert.strictEqual(observations.length, 60, 'Exactly 60 T1 observations must remain in production');

  // Verify 60 evidence records
  const evidence = dal.listEvidence();
  assert.strictEqual(evidence.length, 60, 'Exactly 60 T1 evidence records must remain in production');

  // Verify 20 prompts
  const prompts = dal.listPrompts();
  assert.strictEqual(prompts.length, 20, 'Exactly 20 prompts must remain in production');
});

// -----------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------

console.log('------------------------------------------------------------');
console.log(`TOTAL DOMAIN TESTS     : ${totalTests}`);
console.log(`PASSED TESTS           : ${passedTests} ✓`);
console.log(`FAILED TESTS           : ${failedTests} ✗`);
console.log('------------------------------------------------------------\n');

if (failedTests > 0) {
  console.error(`[FAIL] ${failedTests} test(s) failed.`);
  process.exit(1);
} else {
  console.log('[SUCCESS] All M08.2 Diagnosis & Opportunity Foundation tests passed cleanly!\n');
}
