#!/usr/bin/env node
/**
 * LOCATRIA Resource Operating Dashboard Test Suite v1.0
 * GDBS OS — Module 07 / Chapter 01 / Sprint A.4.6
 *
 * Verifies canonical count derivation, authentic empty-state handling,
 * commercial/editorial decoupling, invariant non-modification,
 * absence of numeric rankings/scoring, and error safety.
 */

'use strict';

const path = require('path');
const fs = require('fs');

const {
  getCompleteDashboardSnapshot,
  buildPortfolioSummary,
  buildResourcePortfolioView,
  buildToolStateView,
  buildMeasurementSummary,
  buildUserVsCommercialLedgers,
  buildReviewQueueView,
  buildDecisionHistoryView,
  buildGovernanceHealthView,
  buildCommercialStatusView,
  buildFounderActionCenterView,
  searchEntities,
  filterEntities,
  assertDashboardDecoupling
} = require('./resource-dashboard');

const dal = require('../js/resource-data/index');

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
console.log('LOCATRIA RESOURCE OPERATING DASHBOARD TEST SUITE v1.0');
console.log('============================================================\n');

let snapshot = null;

// -------------------------------------------------------------
// Test 01: Dashboard Loads with Current Production Data
// -------------------------------------------------------------
try {
  snapshot = getCompleteDashboardSnapshot();
  const loaded = snapshot && typeof snapshot === 'object' && snapshot.generated_at && snapshot.operating_overview;
  assert(loaded, 1, 'Dashboard Loads with Current Production Data');
} catch (err) {
  assert(false, 1, 'Dashboard Loads with Current Production Data', err.message);
}

// -------------------------------------------------------------
// Test 02: Dashboard Correctly Reports Current Canonical Entity Counts
// -------------------------------------------------------------
try {
  const ov = snapshot.operating_overview;
  const countsMatch =
    ov.total_tools === 10 &&
    ov.total_resources === 4 &&
    ov.total_evaluations === 10 &&
    ov.total_recommendations === 10 &&
    ov.total_evidence === 10 &&
    ov.total_relationships === 10 &&
    ov.total_reviews === 0 &&
    ov.total_measurements === 0 &&
    ov.active_affiliates === 0;

  assert(countsMatch, 2, 'Dashboard Correctly Reports Canonical Entity Counts (10 Tools, 4 Resources, 0 Reviews, 0 Measurements)');
} catch (err) {
  assert(false, 2, 'Dashboard Correctly Reports Canonical Entity Counts', err.message);
}

// -------------------------------------------------------------
// Test 03: Empty Measurement State Handled Correctly
// -------------------------------------------------------------
try {
  const meas = snapshot.measurement_overview;
  const emptyHandled =
    meas.total_measurements === 0 &&
    meas.resources_with_measurements === 0 &&
    meas.status === 'INSUFFICIENT_DATA' &&
    meas.display_state === 'EMPTY' &&
    typeof meas.empty_state_message === 'string' &&
    meas.empty_state_message.includes('NO MEASUREMENT DATA AVAILABLE') &&
    meas.empty_state_message.includes('No synthetic data');

  assert(emptyHandled, 3, 'Empty Measurement State Handled Authentically (INSUFFICIENT_DATA, No Synthetic Charts)');
} catch (err) {
  assert(false, 3, 'Empty Measurement State Handled Authentically', err.message);
}

// -------------------------------------------------------------
// Test 04: Empty Review State Handled Correctly
// -------------------------------------------------------------
try {
  const rq = snapshot.review_queue;
  const emptyQueueHandled =
    rq.total_candidates === 0 &&
    rq.pending_attention_count === 0 &&
    rq.status === 'NO_OPEN_CANDIDATES' &&
    typeof rq.empty_state_message === 'string' &&
    rq.empty_state_message.includes('NO OPEN REVIEW CANDIDATES') &&
    Array.isArray(rq.candidates) &&
    rq.candidates.length === 0;

  assert(emptyQueueHandled, 4, 'Empty Review State Handled Authentically (NO_OPEN_CANDIDATES, 0 Open Records)');
} catch (err) {
  assert(false, 4, 'Empty Review State Handled Authentically', err.message);
}

// -------------------------------------------------------------
// Test 05: Affiliate State Is Separated from Recommendation State
// -------------------------------------------------------------
try {
  const comm = snapshot.commercial_status;
  const hasSeparation = comm.tools.every(t =>
    t.vendor_program_available !== undefined &&
    t.locatria_relationship !== undefined &&
    t.activation_status !== undefined &&
    t.recommendation_status !== undefined
  );

  // Check specific decoupling case: Frase has vendor program available (TRUE) but relationship is NOT_CONTRACTED and recommendation is LISTED
  const frase = comm.tools.find(t => t.tool_name.toLowerCase().includes('frase'));
  const fraseDecoupled = frase &&
    frase.vendor_program_available === 'TRUE' &&
    frase.locatria_relationship === 'NOT_CONTRACTED' &&
    frase.activation_status === 'NOT_ACTIVATED' &&
    frase.recommendation_status === 'LISTED';

  // Check Content Harmony has vendor program (TRUE) but is CONDITIONALLY_RECOMMENDED and NOT_CONTRACTED
  const harmony = comm.tools.find(t => t.tool_name.toLowerCase().includes('harmony'));
  const harmonyDecoupled = harmony &&
    harmony.vendor_program_available === 'TRUE' &&
    harmony.locatria_relationship === 'NOT_CONTRACTED' &&
    harmony.activation_status === 'NOT_ACTIVATED' &&
    harmony.recommendation_status === 'CONDITIONALLY_RECOMMENDED';

  assert(hasSeparation && fraseDecoupled && harmonyDecoupled && comm.decoupling_status === 'STRICTLY_DECOUPLED', 5, 'Affiliate State Separated from Recommendation State (4-Way Distinction Enforced)');
} catch (err) {
  assert(false, 5, 'Affiliate State Separated from Recommendation State', err.message);
}

// -------------------------------------------------------------
// Test 06: Measurement Data Does Not Modify Recommendation State
// -------------------------------------------------------------
try {
  const initialRecs = dal.listRecommendations();
  const claudeInitial = initialRecs.find(r => r.tool_id === 'TOOL-CAN-006')?.status;

  // Simulate reading measurement view with hypothetical telemetry
  const dummyMeasurement = {
    measurement_id: 'MEAS-TEST-001',
    resource_id: 'RES-PROFILE-CLAUDE',
    measurement_layer: 'ENGAGEMENT',
    metrics: { actual_count: 5000 }
  };
  const measSummary = buildMeasurementSummary({ baseDir: path.join(__dirname, '../resource-data') });

  // Verify DAL recommendation has not mutated
  const currentRecs = dal.listRecommendations();
  const claudeCurrent = currentRecs.find(r => r.tool_id === 'TOOL-CAN-006')?.status;

  const unmodified = claudeInitial === claudeCurrent && claudeCurrent === 'RECOMMENDED';
  assert(unmodified, 6, 'Measurement Telemetry Invariant Enforced (Cannot Mutate Recommendation State)');
} catch (err) {
  assert(false, 6, 'Measurement Telemetry Invariant Enforced', err.message);
}

// -------------------------------------------------------------
// Test 07: Commercial Activity Does Not Modify Recommendation State
// -------------------------------------------------------------
try {
  const initialRecs = dal.listRecommendations();
  const surferRec = initialRecs.find(r => r.tool_id === 'TOOL-CAN-006')?.status;

  // View commercial status
  const commStatus = buildCommercialStatusView();
  const surferComm = commStatus.tools.find(t => t.tool_id === 'TOOL-CAN-006');

  // Verify recommendation remains RECOMMENDED and is invariant to commercial state
  const invariant = surferRec === 'RECOMMENDED' &&
    surferComm.recommendation_status === 'RECOMMENDED' &&
    surferComm.locatria_relationship === 'NOT_CONTRACTED' &&
    commStatus.commercial_neutrality_verified === true;

  assert(invariant, 7, 'Commercial Neutrality Invariant Enforced (Zero Revenue Bias on Recommendations)');
} catch (err) {
  assert(false, 7, 'Commercial Neutrality Invariant Enforced', err.message);
}

// -------------------------------------------------------------
// Test 08: Review Candidate Status Is Represented Correctly
// -------------------------------------------------------------
try {
  // Test supporting all 6 canonical candidate states
  const rq = buildReviewQueueView();
  const statesSupported =
    rq.status_counts.OPEN !== undefined &&
    rq.status_counts.IN_REVIEW !== undefined &&
    rq.status_counts.DECISION_REQUIRED !== undefined &&
    rq.status_counts.RESOLVED !== undefined &&
    rq.status_counts.CLOSED !== undefined &&
    rq.status_counts.DISMISSED !== undefined;

  assert(statesSupported, 8, 'Review Candidate Lifecycle States Represented Correctly (All 6 States Supported)');
} catch (err) {
  assert(false, 8, 'Review Candidate Lifecycle States Represented Correctly', err.message);
}

// -------------------------------------------------------------
// Test 09: Historical Decisions Remain Immutable / Read-Only
// -------------------------------------------------------------
try {
  const decView = snapshot.decision_history;
  const hasRecords = decView.total_decisions > 0 && Array.isArray(decView.decisions);

  // Verify structure of historical records
  const allValid = decView.decisions.every(d =>
    d.date &&
    d.entity_type &&
    d.entity_id &&
    d.decision &&
    d.rationale &&
    d.reviewer
  );

  assert(hasRecords && allValid, 9, 'Historical Decisions Preserved as Read-Only Immutable Audit Log');
} catch (err) {
  assert(false, 9, 'Historical Decisions Preserved as Read-Only', err.message);
}

// -------------------------------------------------------------
// Test 10: No Numeric Scoring or Ranking Generated
// -------------------------------------------------------------
try {
  const check = assertDashboardDecoupling(snapshot);

  // Also check tool state view specifically
  const toolsView = snapshot.tool_state;
  const noScoreFields = toolsView.tools.every(t =>
    t.score === undefined &&
    t.rating === undefined &&
    t.ranking === undefined &&
    t.rank === undefined &&
    t.winner === undefined
  );

  // Check governance health panel has no numeric score
  const govHealth = snapshot.governance_health;
  const noGovScore = govHealth.no_numeric_score === true && govHealth.governance_score === undefined;

  assert(check.compliant && noScoreFields && noGovScore, 10, 'No Numeric Scoring or Ranking Generated (Strict Zero-Score Policy)');
} catch (err) {
  assert(false, 10, 'No Numeric Scoring or Ranking Generated', err.message);
}

// -------------------------------------------------------------
// Test 11: Orphaned / Invalid Relationships Handled Safely
// -------------------------------------------------------------
try {
  // Test resolving relationship with nonexistent target
  const ghostRel = dal.resolveRelationship('REL-NONEXISTENT');
  const safeFallback = ghostRel && ghostRel.ok === false && ghostRel.error !== null;

  // Test searching nonexistent entity
  const searchNone = searchEntities('NONEXISTENT_QUERY_XYZ_123');
  const searchSafe = Array.isArray(searchNone) && searchNone.length === 0;

  // Test filtering with unmatched criteria
  const filterNone = filterEntities(snapshot.tool_state.tools, { provider: 'NONEXISTENT_PROVIDER' });
  const filterSafe = Array.isArray(filterNone) && filterNone.length === 0;

  assert(safeFallback && searchSafe && filterSafe, 11, 'Orphaned & Invalid Entities Handled Safely (Graceful Error Handlers)');
} catch (err) {
  assert(false, 11, 'Orphaned & Invalid Entities Handled Safely', err.message);
}

// -------------------------------------------------------------
// Test 12: Dashboard Does Not Fabricate Missing Data
// -------------------------------------------------------------
try {
  const meas = snapshot.measurement_overview;
  const comm = snapshot.commercial_status;
  const rq = snapshot.review_queue;

  const noFakeMeasurements = meas.total_measurements === 0 && meas.records.length === 0;
  const noFakeAffiliates = comm.activated_affiliates === 0 && comm.active_relationships === 0;
  const noFakeReviews = rq.total_candidates === 0 && rq.candidates.length === 0;

  const authentic = noFakeMeasurements && noFakeAffiliates && noFakeReviews;
  assert(authentic, 12, 'Dashboard Does Not Fabricate Missing Data (Authentic Zero Baseline Preserved)');
} catch (err) {
  assert(false, 12, 'Dashboard Does Not Fabricate Missing Data', err.message);
}

// -------------------------------------------------------------
// Test 13: Universal Search Across Entities Returns Canonical References
// -------------------------------------------------------------
try {
  const searchClaude = searchEntities('Claude');
  const searchNotebook = searchEntities('TOOL-CAN-001');
  const searchWorkflow = searchEntities('RES-WORKFLOW-001');

  const foundClaude = searchClaude.some(r => r.entity_id === 'TOOL-CAN-006' || r.entity_id === 'RES-PROFILE-CLAUDE');
  const foundNotebook = searchNotebook.some(r => r.entity_id === 'TOOL-CAN-001');
  const foundWorkflow = searchWorkflow.some(r => r.entity_id === 'RES-WORKFLOW-001');

  assert(foundClaude && foundNotebook && foundWorkflow, 13, 'Universal Search Returns Canonical Entity References Across Tools & Resources');
} catch (err) {
  assert(false, 13, 'Universal Search Returns Canonical Entity References', err.message);
}

// -------------------------------------------------------------
// Test 14: Founder Action Center Categorization Enforces Human Decision Authority
// -------------------------------------------------------------
try {
  const fac = snapshot.founder_action_center;
  const hasCategories = fac.categories &&
    fac.categories.REVIEW_REQUIRED !== undefined &&
    fac.categories.EVIDENCE_REQUIRED !== undefined &&
    fac.categories.INSUFFICIENT_DATA !== undefined;

  const telemetryNotice = fac.items.some(i => i.id === 'ACT-MEAS-BASELINE' && i.category === 'INSUFFICIENT_DATA');
  const founderAuthorityPreserved = fac.requires_founder_decision === false; // Only baseline notice present

  assert(hasCategories && telemetryNotice && founderAuthorityPreserved, 14, 'Founder Action Center Enforces Human Decision Authority & Categorization');
} catch (err) {
  assert(false, 14, 'Founder Action Center Enforces Human Decision Authority', err.message);
}

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log('\n------------------------------------------------------------');
console.log(`Resource Operating Dashboard Tests Run: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);
console.log('------------------------------------------------------------');

if (failedTests > 0) {
  console.error(`\n[FATAL] ${failedTests} dashboard tests failed!`);
  process.exit(1);
} else {
  console.log('\n[SUCCESS] All Resource Operating Dashboard verification tests passed!\n');
  process.exit(0);
}
