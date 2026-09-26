#!/usr/bin/env node
/**
 * LOCATRIA Lifecycle & Governance Test Suite v1.0
 * GDBS OS — Module 07 / Chapter 01 / Sprint A.4.1
 *
 * Verifies lifecycle transition integrity, recommendation gate enforcement,
 * commercial decoupling boundaries, review trigger logic, and audit preservation.
 */

'use strict';

const path = require('path');
const fs = require('fs');
const {
  TOOL_STATES,
  RECOMMENDATION_STATES,
  REVIEW_TRIGGERS,
  REVIEW_ACTIONS,
  validateTransition,
  validateRecommendationGates,
  resolveReviewTriggerAction,
  assertCommercialIndependence
} = require('./lifecycle-governance');

const { runBatchValidation } = require('./validate-all');

const rootDir = path.resolve(__dirname, '..');
const resourceDataDir = path.join(rootDir, 'resource-data');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testNum, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] Test ${testNum.toString().padStart(2, '0')}: ${testName}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] Test ${testNum.toString().padStart(2, '0')}: ${testName}`);
    if (details) console.error(`         Details: ${details}`);
  }
}

console.log('============================================================');
console.log('LOCATRIA RESOURCE LIFECYCLE & GOVERNANCE TEST SUITE');
console.log('============================================================\n');

// -------------------------------------------------------------
// Test 01: Valid Tool Lifecycle Transitions
// -------------------------------------------------------------
try {
  const t1 = validateTransition('tool', TOOL_STATES.DISCOVERED, TOOL_STATES.EVALUATED);
  const t2 = validateTransition('tool', TOOL_STATES.EVALUATED, TOOL_STATES.RECOMMENDED);
  const t3 = validateTransition('tool', TOOL_STATES.RECOMMENDED, TOOL_STATES.CONDITIONALLY_RECOMMENDED);
  const t4 = validateTransition('tool', TOOL_STATES.CONDITIONALLY_RECOMMENDED, TOOL_STATES.RETIRED);

  assert(
    t1.valid && t2.valid && t3.valid && t4.valid,
    1,
    'Valid Tool Lifecycle Transitions (DISCOVERED -> EVALUATED -> RECOMMENDED -> DOWNGRADE -> RETIRED)'
  );
} catch (err) {
  assert(false, 1, 'Valid Tool Lifecycle Transitions', err.message);
}

// -------------------------------------------------------------
// Test 02: Invalid Tool Lifecycle Transitions Blocked
// -------------------------------------------------------------
try {
  // Direct jump from DISCOVERED to RECOMMENDED without evaluation is invalid
  const t1 = validateTransition('tool', TOOL_STATES.DISCOVERED, TOOL_STATES.RECOMMENDED);
  // Direct jump from NOT_RECOMMENDED to RECOMMENDED without review is invalid
  const t2 = validateTransition('tool', TOOL_STATES.NOT_RECOMMENDED, TOOL_STATES.RECOMMENDED);

  assert(
    !t1.valid && !t2.valid && t1.error.includes('INVALID_TRANSITION'),
    2,
    'Invalid Tool Lifecycle Transitions Blocked (Cannot skip EVALUATED / UNDER_REVIEW)'
  );
} catch (err) {
  assert(false, 2, 'Invalid Tool Lifecycle Transitions Blocked', err.message);
}

// -------------------------------------------------------------
// Test 03: Recommendation Gate — Missing Evaluation Rejected
// -------------------------------------------------------------
try {
  const mockTool = { tool_id: 'TOOL-TEST-01', governance: { last_reviewed: '2026-09-26' } };
  const mockRec = {
    recommendation_id: 'REC-TEST-01',
    status: 'RECOMMENDED',
    rationale: 'Valid substantive qualitative rationale explaining why tool fits.',
    context: { problem: 'Drafting', workflow: 'Create' }
  };
  const mockEvidence = [{ evidence_id: 'EVD-01' }];
  const mockEvaluations = []; // EMPTY EVALUATION LIST

  const gateResult = validateRecommendationGates(mockRec, mockTool, mockEvaluations, mockEvidence);
  const failedCorrectly = !gateResult.passed && gateResult.errors.some(e => e.gate === 'GATE_03_EVALUATION');

  assert(
    failedCorrectly,
    3,
    'Recommendation Gate: RECOMMENDED without evaluation -> REJECTED'
  );
} catch (err) {
  assert(false, 3, 'Recommendation Gate: Missing Evaluation', err.message);
}

// -------------------------------------------------------------
// Test 04: Recommendation Gate — Missing Evidence Rejected
// -------------------------------------------------------------
try {
  const mockTool = { tool_id: 'TOOL-TEST-02', governance: { last_reviewed: '2026-09-26' } };
  const mockRec = {
    recommendation_id: 'REC-TEST-02',
    status: 'RECOMMENDED',
    rationale: 'Valid substantive qualitative rationale explaining why tool fits.',
    context: { problem: 'Drafting', workflow: 'Create' }
  };
  const mockEvidence = []; // EMPTY EVIDENCE LIST
  const mockEvaluations = [{ evaluation_id: 'EVAL-01' }];

  const gateResult = validateRecommendationGates(mockRec, mockTool, mockEvaluations, mockEvidence);
  const failedCorrectly = !gateResult.passed && gateResult.errors.some(e => e.gate === 'GATE_03_EVIDENCE');

  assert(
    failedCorrectly,
    4,
    'Recommendation Gate: RECOMMENDED without evidence -> REJECTED'
  );
} catch (err) {
  assert(false, 4, 'Recommendation Gate: Missing Evidence', err.message);
}

// -------------------------------------------------------------
// Test 05: Recommendation Gate — Missing Rationale Rejected
// -------------------------------------------------------------
try {
  const mockTool = { tool_id: 'TOOL-TEST-03', governance: { last_reviewed: '2026-09-26' } };
  const mockRec = {
    recommendation_id: 'REC-TEST-03',
    status: 'RECOMMENDED',
    rationale: 'Too short', // <15 characters
    context: { problem: 'Drafting', workflow: 'Create' }
  };
  const mockEvidence = [{ evidence_id: 'EVD-01' }];
  const mockEvaluations = [{ evaluation_id: 'EVAL-01' }];

  const gateResult = validateRecommendationGates(mockRec, mockTool, mockEvaluations, mockEvidence);
  const failedCorrectly = !gateResult.passed && gateResult.errors.some(e => e.gate === 'GATE_04_RATIONALE');

  assert(
    failedCorrectly,
    5,
    'Recommendation Gate: RECOMMENDED with insufficient rationale -> REJECTED'
  );
} catch (err) {
  assert(false, 5, 'Recommendation Gate: Missing Rationale', err.message);
}

// -------------------------------------------------------------
// Test 06: Commercial Independence — Affiliate Status Does Not Alter Recommendation
// -------------------------------------------------------------
try {
  const mockRec = {
    recommendation_id: 'REC-TEST-CLAUDE',
    tool_id: 'TOOL-CAN-006',
    status: 'RECOMMENDED',
    rationale: 'Empirical benchmark demonstrated zero-hallucination compliance.'
  };

  const isIndependent = assertCommercialIndependence(
    mockRec,
    { status: 'ACTIVE', affiliate_available: true },
    { status: 'NONE', affiliate_available: false }
  );

  assert(
    isIndependent === true,
    6,
    'Commercial Independence: Affiliate status cannot influence recommendation decision'
  );
} catch (err) {
  assert(false, 6, 'Commercial Independence test error', err.message);
}

// -------------------------------------------------------------
// Test 07: Separation of Vendor Program Availability from LOCATRIA Activation
// -------------------------------------------------------------
try {
  // Load real Frase and Grammarly affiliate records from resource-data/affiliates
  const fraseAffPath = path.join(resourceDataDir, 'affiliates', 'aff-can-003.json');
  const grammarlyAffPath = path.join(resourceDataDir, 'affiliates', 'aff-can-008.json');
  const frogAffPath = path.join(resourceDataDir, 'affiliates', 'aff-can-011.json');

  const fraseAff = JSON.parse(fs.readFileSync(fraseAffPath, 'utf8'));
  const grammarlyAff = JSON.parse(fs.readFileSync(grammarlyAffPath, 'utf8'));
  const frogAff = JSON.parse(fs.readFileSync(frogAffPath, 'utf8'));

  const separated =
    fraseAff.affiliate_program_available === 'TRUE' &&
    fraseAff.locatria_affiliate_relationship === 'NOT_CONTRACTED' &&
    fraseAff.affiliate_activation_status === 'NOT_ACTIVATED' &&
    grammarlyAff.affiliate_program_available === 'TRUE' &&
    grammarlyAff.locatria_affiliate_relationship === 'NOT_CONTRACTED' &&
    frogAff.affiliate_program_available === 'FALSE' &&
    frogAff.locatria_affiliate_relationship === 'NOT_CONTRACTED';

  assert(
    separated,
    7,
    'Separation: Vendor program available (TRUE) strictly decoupled from LOCATRIA relationship (NOT_CONTRACTED)'
  );
} catch (err) {
  assert(false, 7, 'Separation test error', err.message);
}

// -------------------------------------------------------------
// Test 08: RETIRED Tool Immutability — Cannot Jump Directly to RECOMMENDED
// -------------------------------------------------------------
try {
  const directReactivation = validateTransition('tool', TOOL_STATES.RETIRED, TOOL_STATES.RECOMMENDED);
  const requalificationPath = validateTransition('tool', TOOL_STATES.RETIRED, TOOL_STATES.UNDER_REVIEW);

  assert(
    directReactivation.valid === false && requalificationPath.valid === true,
    8,
    'RETIRED Immutability: Retired tool cannot jump directly to RECOMMENDED without formal requalification'
  );
} catch (err) {
  assert(false, 8, 'RETIRED Immutability test error', err.message);
}

// -------------------------------------------------------------
// Test 09: Review Trigger Logic — AFFILIATE_CHANGE Never Alters Recommendation
// -------------------------------------------------------------
try {
  const affTrigger = resolveReviewTriggerAction(REVIEW_TRIGGERS.AFFILIATE_CHANGE);
  const featTrigger = resolveReviewTriggerAction(REVIEW_TRIGGERS.FEATURE_CHANGE);
  const schedTrigger = resolveReviewTriggerAction(REVIEW_TRIGGERS.SCHEDULED);

  const triggersValid =
    affTrigger.requiresRecommendationReview === false &&
    affTrigger.canAlterRecommendationAutomatically === false &&
    featTrigger.requiresReevaluation === true &&
    featTrigger.requiresRecommendationReview === true &&
    schedTrigger.action === REVIEW_ACTIONS.INFORMATION_REFRESH;

  assert(
    triggersValid,
    9,
    'Review Triggers: AFFILIATE_CHANGE triggers metadata refresh only; FEATURE_CHANGE requires re-evaluation'
  );
} catch (err) {
  assert(false, 9, 'Review Trigger test error', err.message);
}

// -------------------------------------------------------------
// Test 10: Full Production Data Layer Governance & Schema Integrity
// -------------------------------------------------------------
try {
  const { results } = runBatchValidation(resourceDataDir);
  const fullValidationPassed =
    results.summary.total === 64 &&
    results.summary.valid === 64 &&
    results.summary.invalid === 0 &&
    (!results.crossEntityErrors || results.crossEntityErrors.length === 0);

  assert(
    fullValidationPassed,
    10,
    'Full Resource Data Layer: All 64 production records satisfy canonical schema & governance rules'
  );
} catch (err) {
  assert(false, 10, 'Full Resource Data Layer validation error', err.message);
}

console.log('\n------------------------------------------------------------');
console.log(`GOVERNANCE TEST SUMMARY: ${passedTests}/${totalTests} Passed (${failedTests} Failed)`);
console.log('------------------------------------------------------------\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('ALL RESOURCE LIFECYCLE & GOVERNANCE TESTS PASSED ✓\n');
  process.exit(0);
}
