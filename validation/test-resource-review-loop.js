#!/usr/bin/env node
/**
 * LOCATRIA Resource Review & Improvement Loop Test Suite v1.0
 * GDBS OS — Module 07 / Chapter 01 / Sprint A.4.5
 *
 * Verifies review candidate validation, measurement signal diagnosis,
 * commercial/feature routing, decoupling invariants, human authority enforcement,
 * immutable governance history preservation, and empty review baseline validity.
 */

'use strict';

const path = require('path');
const fs = require('fs');
const {
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
} = require('./resource-review-loop');

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
console.log('LOCATRIA RESOURCE REVIEW & IMPROVEMENT LOOP TEST SUITE v1.0');
console.log('============================================================\n');

// -------------------------------------------------------------
// Test 01: Valid Review Candidate Passes Validation
// -------------------------------------------------------------
try {
  const candidate = createReviewCandidate({
    review_candidate_id: 'RC-WORKFLOW-001-SCHEDULED-202610',
    resource_id: 'RES-WORKFLOW-001',
    trigger: REVIEW_TRIGGERS.SCHEDULED,
    detected_at: '2026-10-01',
    source: 'GOVERNANCE_SCHEDULE',
    severity: CANDIDATE_SEVERITIES.MEDIUM,
    reason: 'Quarterly governance and freshness audit for AI Content Workflow resource guide.',
    proposed_review_type: REVIEW_TYPES.GOVERNANCE_REVIEW
  });

  const res = validateReviewCandidate(candidate);
  assert(res.valid === true && res.errors.length === 0, 1, 'Valid Review Candidate Passes Validation');
} catch (err) {
  assert(false, 1, 'Valid Review Candidate Passes Validation', err.message);
}

// -------------------------------------------------------------
// Test 02: Invalid Review Candidate Blocked
// -------------------------------------------------------------
try {
  // Test invalid ID pattern
  const badId = {
    review_candidate_id: 'INVALID-ID',
    resource_id: 'RES-WORKFLOW-001',
    trigger: REVIEW_TRIGGERS.SCHEDULED,
    detected_at: '2026-10-01',
    reason: 'Testing invalid candidate id format'
  };
  const resBadId = validateReviewCandidate(badId);

  // Test missing target entity (both resource_id and tool_id null)
  const noEntity = {
    review_candidate_id: 'RC-TEST-001',
    trigger: REVIEW_TRIGGERS.SCHEDULED,
    detected_at: '2026-10-01',
    reason: 'Testing missing entity reference'
  };
  const resNoEntity = validateReviewCandidate(noEntity);

  // Test missing trigger & signal
  const noTrigger = {
    review_candidate_id: 'RC-TEST-002',
    resource_id: 'RES-WORKFLOW-001',
    detected_at: '2026-10-01',
    reason: 'Testing missing trigger and signal'
  };
  const resNoTrigger = validateReviewCandidate(noTrigger);

  // Test too short reason
  const shortReason = {
    review_candidate_id: 'RC-TEST-003',
    resource_id: 'RES-WORKFLOW-001',
    trigger: REVIEW_TRIGGERS.OTHER,
    detected_at: '2026-10-01',
    reason: 'short'
  };
  const resShortReason = validateReviewCandidate(shortReason);

  const allRejected = !resBadId.valid && !resNoEntity.valid && !resNoTrigger.valid && !resShortReason.valid;
  assert(allRejected, 2, 'Invalid Review Candidate Blocked (Schema & Field Constraints)');
} catch (err) {
  assert(false, 2, 'Invalid Review Candidate Blocked', err.message);
}

// -------------------------------------------------------------
// Test 03: Measurement Signal Successfully Creates Review Candidate & Diagnosis
// -------------------------------------------------------------
try {
  const signalCandidate = createReviewCandidate({
    review_candidate_id: 'RC-SIGNAL-ENG-001',
    resource_id: 'RES-WORKFLOW-001',
    signal: MEASUREMENT_SIGNALS.LOW_ENGAGEMENT_SIGNAL,
    detected_at: '2026-10-15',
    source: 'MEASUREMENT_SIGNAL_MONITOR',
    severity: CANDIDATE_SEVERITIES.MEDIUM,
    reason: 'Engagement drop observed below 20% benchmark over 30-day monitoring window.',
    proposed_review_type: REVIEW_TYPES.PERFORMANCE_REVIEW
  });

  const diagnosis = diagnoseSignal(MEASUREMENT_SIGNALS.LOW_ENGAGEMENT_SIGNAL);

  const signalValid = signalCandidate.signal === MEASUREMENT_SIGNALS.LOW_ENGAGEMENT_SIGNAL;
  const diagnosisValid = diagnosis.requires_human_approval === true &&
    diagnosis.questions.q4_primary_domain === REVIEW_TYPES.PERFORMANCE_REVIEW &&
    diagnosis.questions.q6_proposed_action === DECISION_OUTCOMES.UPDATE;

  assert(signalValid && diagnosisValid, 3, 'Measurement Signal Successfully Creates Candidate & AI Diagnosis');
} catch (err) {
  assert(false, 3, 'Measurement Signal Successfully Creates Candidate & AI Diagnosis', err.message);
}

// -------------------------------------------------------------
// Test 04: Affiliate Change Creates Commercial Review Only
// -------------------------------------------------------------
try {
  const diagnosis = diagnoseSignal(REVIEW_TRIGGERS.AFFILIATE_CHANGE);
  const boundaryClean = assertGovernanceBoundary(REVIEW_TRIGGERS.AFFILIATE_CHANGE, DECISION_OUTCOMES.COMMERCIAL_UPDATE);
  const boundaryViolated = assertGovernanceBoundary(REVIEW_TRIGGERS.AFFILIATE_CHANGE, DECISION_OUTCOMES.DOWNGRADE);

  const isCommercialDomain = diagnosis.questions.q4_primary_domain === REVIEW_TYPES.COMMERCIAL_REVIEW;
  const isCommercialAction = diagnosis.questions.q6_proposed_action === DECISION_OUTCOMES.COMMERCIAL_UPDATE;
  const isBoundaryEnforced = boundaryClean.compliant && !boundaryViolated.compliant;

  assert(isCommercialDomain && isCommercialAction && isBoundaryEnforced, 4, 'Affiliate Change Routes to Commercial Review Only (Editorial Decoupling)');
} catch (err) {
  assert(false, 4, 'Affiliate Change Routes to Commercial Review Only', err.message);
}

// -------------------------------------------------------------
// Test 05: Feature Change Correctly Routes to Re-evaluation
// -------------------------------------------------------------
try {
  const diagnosis = diagnoseSignal(REVIEW_TRIGGERS.FEATURE_CHANGE, {
    evidenceSummary: 'Vendor launched major 3.5 Sonnet architectural upgrade changing prompt grounding.'
  });

  const isToolReview = diagnosis.questions.q4_primary_domain === REVIEW_TYPES.TOOL_REVIEW;
  const isReevaluate = diagnosis.questions.q6_proposed_action === DECISION_OUTCOMES.RE_EVALUATE;
  const requiresHuman = diagnosis.requires_human_approval === true;

  assert(isToolReview && isReevaluate && requiresHuman, 5, 'Feature Change Correctly Routes to Re-evaluation');
} catch (err) {
  assert(false, 5, 'Feature Change Correctly Routes to Re-evaluation', err.message);
}

// -------------------------------------------------------------
// Test 06: Low Traffic Does Not Automatically Retire a Resource
// -------------------------------------------------------------
try {
  const boundaryCheck = assertGovernanceBoundary(
    MEASUREMENT_SIGNALS.LOW_ENGAGEMENT_SIGNAL,
    DECISION_OUTCOMES.RETIRE
  );

  const isBlocked = !boundaryCheck.compliant &&
    boundaryCheck.violations.some(v => v.includes('Low engagement or traffic alone cannot automatically retire'));

  assert(isBlocked, 6, 'Low Traffic / Engagement Invariant Enforced (Cannot Automatically Retire)');
} catch (err) {
  assert(false, 6, 'Low Traffic / Engagement Invariant Enforced', err.message);
}

// -------------------------------------------------------------
// Test 07: Affiliate Revenue Does Not Automatically Upgrade a Recommendation
// -------------------------------------------------------------
try {
  const checkSignal = assertGovernanceBoundary(
    MEASUREMENT_SIGNALS.COMMERCIAL_ACTIVITY,
    'UPGRADE_RECOMMENDATION'
  );

  const checkTrigger = assertGovernanceBoundary(
    REVIEW_TRIGGERS.AFFILIATE_CHANGE,
    'UPGRADE_RECOMMENDATION'
  );

  const isBlocked = !checkSignal.compliant && !checkTrigger.compliant &&
    checkSignal.violations.some(v => v.includes('Commercial performance or affiliate relationships can NEVER automatically upgrade'));

  assert(isBlocked, 7, 'Commercial Neutrality Invariant Enforced (Revenue Cannot Upgrade Recommendation)');
} catch (err) {
  assert(false, 7, 'Commercial Neutrality Invariant Enforced', err.message);
}

// -------------------------------------------------------------
// Test 08: AI Cannot Approve Material Decisions (Human Authority Enforced)
// -------------------------------------------------------------
try {
  const aiDecision = {
    decision: DECISION_OUTCOMES.UPDATE,
    rationale: 'Automated algorithm determined that intro text needs optimization for reader retention.',
    reviewer: 'AI_BOT_OPTIMIZER',
    date: '2026-10-01',
    previous_state: 'ACTIVE',
    new_state: 'REVIEW_DUE'
  };

  const humanDecision = {
    decision: DECISION_OUTCOMES.UPDATE,
    rationale: 'Founder evaluated empirical bounce data and approved clarifying the introductory problem statement.',
    reviewer: 'Founder',
    date: '2026-10-01',
    previous_state: 'ACTIVE',
    new_state: 'REVIEW_DUE'
  };

  const aiEval = evaluateDecision(aiDecision);
  const humanEval = evaluateDecision(humanDecision);

  const aiBlocked = !aiEval.valid && aiEval.errors.some(e => e.includes('GOVERNANCE_VIOLATION: AI/automated bots are strictly prohibited'));
  const humanApproved = humanEval.valid && humanEval.errors.length === 0;

  assert(aiBlocked && humanApproved, 8, 'Human Review Authority Enforced (AI Strictly Blocked from Material Approvals)');
} catch (err) {
  assert(false, 8, 'Human Review Authority Enforced', err.message);
}

// -------------------------------------------------------------
// Test 09: Historical Decision / Version Preserved on Entity Metadata
// -------------------------------------------------------------
try {
  const dummyEntity = {
    resource_id: 'RES-WORKFLOW-001',
    governance: {
      status: 'ACTIVE',
      last_reviewed: '2026-09-01',
      reviewer: 'Founder',
      history: [
        {
          review_date: '2026-09-01',
          reviewer: 'Founder',
          decision: 'INITIAL_APPROVAL',
          rationale: 'Initial publication approval for Sprint A.3.5'
        }
      ]
    }
  };

  const decisionToRecord = {
    decision: DECISION_OUTCOMES.UPDATE,
    rationale: 'Updated Step 3 prompt instructions following v1.1 framework refresh.',
    reviewer: 'Founder',
    date: '2026-10-15',
    previous_state: 'ACTIVE',
    new_state: 'ACTIVE'
  };

  const result = preserveReviewHistory(dummyEntity, decisionToRecord);

  const historyAppended = result.updated === true &&
    result.totalHistoryEntries === 2 &&
    dummyEntity.governance.history.length === 2 &&
    dummyEntity.governance.last_reviewed === '2026-10-15' &&
    dummyEntity.governance.history[1].decision === DECISION_OUTCOMES.UPDATE;

  assert(historyAppended, 9, 'Historical Review Decision Immutably Preserved on Entity Metadata');
} catch (err) {
  assert(false, 9, 'Historical Review Decision Immutably Preserved', err.message);
}

// -------------------------------------------------------------
// Test 10: Empty Review State is Valid (0 records in resource-data/reviews/)
// -------------------------------------------------------------
try {
  const reviewsDir = path.join(resourceDataDir, 'reviews');
  let reviewJsonFiles = [];

  if (fs.existsSync(reviewsDir)) {
    reviewJsonFiles = fs.readdirSync(reviewsDir).filter(f => f.endsWith('.json'));
  }

  // Authentic baseline: Exactly 0 fabricated review files must exist
  const emptyBaselineValid = reviewJsonFiles.length === 0;

  assert(emptyBaselineValid, 10, `Empty Review Baseline Valid (${reviewJsonFiles.length} review JSON records found in baseline)`);
} catch (err) {
  assert(false, 10, 'Empty Review Baseline Valid', err.message);
}

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log('\n------------------------------------------------------------');
console.log(`Review & Improvement Loop Tests Run: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);
console.log('------------------------------------------------------------');

if (failedTests > 0) {
  console.error(`\n[FATAL] ${failedTests} review loop tests failed!`);
  process.exit(1);
} else {
  console.log('\n[SUCCESS] All Review & Improvement Loop verification tests passed!\n');
  process.exit(0);
}
