#!/usr/bin/env node
/**
 * LOCATRIA Affiliate Operations Test Suite v1.0
 * GDBS OS — Module 07 / Chapter 01 / Sprint A.4.2
 *
 * Verifies commercial decoupling boundaries, the 7-Gate Affiliate Activation Engine,
 * transition validation, link integrity, review trigger isolation, and audit trail preservation.
 */

'use strict';

const path = require('path');
const fs = require('fs');
const {
  AFFILIATE_PROGRAM_AVAILABILITY,
  LOCATRIA_AFFILIATE_RELATIONSHIP,
  AFFILIATE_ACTIVATION_STATUS,
  AFFILIATE_STATUS,
  VERIFICATION_STATUS,
  validateAffiliateTransition,
  validateAffiliateActivationGates,
  validateAffiliateLinkIntegrity,
  resolveAffiliateReviewTrigger,
  assertCommercialIndependence
} = require('./affiliate-operations');

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
console.log('LOCATRIA AFFILIATE OPERATIONS TEST SUITE v1.0');
console.log('============================================================\n');

// -------------------------------------------------------------
// Test 01: Vendor Has No Affiliate Program (Valid Baseline)
// -------------------------------------------------------------
try {
  const affNoProgram = {
    entity_type: 'affiliate',
    schema_version: '1.0',
    affiliate_id: 'AFF-TEST-001',
    tool_id: 'TOOL-TEST-001',
    affiliate_available: false,
    status: AFFILIATE_STATUS.NONE,
    affiliate_program_available: AFFILIATE_PROGRAM_AVAILABILITY.FALSE,
    locatria_affiliate_relationship: LOCATRIA_AFFILIATE_RELATIONSHIP.NOT_CONTRACTED,
    affiliate_activation_status: AFFILIATE_ACTIVATION_STATUS.NOT_ACTIVATED,
    program: 'None',
    network: 'None',
    disclosure_required: false,
    last_verified: '2026-09-26'
  };

  const tool = {
    tool_id: 'TOOL-TEST-001',
    official_url: 'https://example.com/tool',
    lifecycle: { state: 'RECOMMENDED' }
  };

  const gateResult = validateAffiliateActivationGates(affNoProgram, tool);
  const linkResult = validateAffiliateLinkIntegrity(affNoProgram, tool);

  // Should NOT pass activation gates (because it is not active and has no program), but is completely valid in baseline
  assert(
    !gateResult.passed && affNoProgram.status === 'NONE' && linkResult.valid,
    1,
    'Vendor Has No Affiliate Program (Valid Decoupled Baseline: NOT_CONTRACTED / NONE)'
  );
} catch (err) {
  assert(false, 1, 'Vendor Has No Affiliate Program', err.message);
}

// -------------------------------------------------------------
// Test 02: Vendor Has Affiliate Program but LOCATRIA Is NOT_CONTRACTED (Valid)
// -------------------------------------------------------------
try {
  const affProgramNotContracted = {
    entity_type: 'affiliate',
    schema_version: '1.0',
    affiliate_id: 'AFF-TEST-002',
    tool_id: 'TOOL-TEST-002',
    affiliate_available: false,
    status: AFFILIATE_STATUS.NONE,
    affiliate_program_available: AFFILIATE_PROGRAM_AVAILABILITY.TRUE,
    locatria_affiliate_relationship: LOCATRIA_AFFILIATE_RELATIONSHIP.NOT_CONTRACTED,
    affiliate_activation_status: AFFILIATE_ACTIVATION_STATUS.NOT_ACTIVATED,
    program: 'Vendor Direct Affiliate',
    network: 'Impact',
    disclosure_required: false,
    last_verified: '2026-09-26'
  };

  const tool = {
    tool_id: 'TOOL-TEST-002',
    official_url: 'https://example.com/tool2',
    lifecycle: { state: 'RECOMMENDED' }
  };

  const linkResult = validateAffiliateLinkIntegrity(affProgramNotContracted, tool);
  assert(
    affProgramNotContracted.affiliate_program_available === 'TRUE' &&
    affProgramNotContracted.locatria_affiliate_relationship === 'NOT_CONTRACTED' &&
    affProgramNotContracted.affiliate_activation_status === 'NOT_ACTIVATED' &&
    linkResult.valid,
    2,
    'Vendor Has Affiliate Program but LOCATRIA Is NOT_CONTRACTED (Independent Separation)'
  );
} catch (err) {
  assert(false, 2, 'Vendor Program Available but NOT_CONTRACTED', err.message);
}

// -------------------------------------------------------------
// Test 03: Vendor Program + LOCATRIA ACTIVE (All 7 Gates Passed)
// -------------------------------------------------------------
try {
  const affActiveValid = {
    entity_type: 'affiliate',
    schema_version: '1.0',
    affiliate_id: 'AFF-TEST-003',
    tool_id: 'TOOL-TEST-003',
    affiliate_available: true,
    status: AFFILIATE_STATUS.ACTIVE,
    affiliate_program_available: AFFILIATE_PROGRAM_AVAILABILITY.TRUE,
    locatria_affiliate_relationship: LOCATRIA_AFFILIATE_RELATIONSHIP.ACTIVE,
    affiliate_activation_status: AFFILIATE_ACTIVATION_STATUS.ACTIVATED,
    program: 'Vendor Official Partner Program',
    network: 'PartnerStack',
    verification_status: VERIFICATION_STATUS.VERIFIED,
    program_source_url: 'https://vendor.com/affiliates',
    affiliate_url: 'https://partnerstack.com/track/locatria-referral-123',
    destination_url: 'https://vendor.com/product',
    disclosure_required: true,
    responsible_owner: 'LOCATRIA Commercial Operations',
    last_verified: '2026-09-26',
    notes: 'Approved by Founder. Contract executed on 2026-09-20. 20% recurring 60-day cookie.'
  };

  const tool = {
    tool_id: 'TOOL-TEST-003',
    official_url: 'https://vendor.com/product',
    lifecycle: { state: 'RECOMMENDED' }
  };

  const gateResult = validateAffiliateActivationGates(affActiveValid, tool);
  const linkResult = validateAffiliateLinkIntegrity(affActiveValid, tool);

  assert(
    gateResult.passed && gateResult.errors.length === 0 && linkResult.valid,
    3,
    'Vendor Program + LOCATRIA ACTIVE (All 7 Activation Gates Cleared Successfully)'
  );
} catch (err) {
  assert(false, 3, 'All 7 Gates Cleared Successfully', err.message);
}

// -------------------------------------------------------------
// Test 04: Cannot Become ACTIVE Without Verified Vendor Program (Gate 1 Rejection)
// -------------------------------------------------------------
try {
  const affUnverified = {
    entity_type: 'affiliate',
    schema_version: '1.0',
    affiliate_id: 'AFF-TEST-004',
    tool_id: 'TOOL-TEST-004',
    affiliate_available: true,
    status: AFFILIATE_STATUS.ACTIVE,
    affiliate_program_available: AFFILIATE_PROGRAM_AVAILABILITY.FALSE, // False!
    locatria_affiliate_relationship: LOCATRIA_AFFILIATE_RELATIONSHIP.ACTIVE,
    affiliate_activation_status: AFFILIATE_ACTIVATION_STATUS.ACTIVATED,
    program: 'Unverified Program',
    network: 'Unknown',
    verification_status: VERIFICATION_STATUS.UNVERIFIED,
    affiliate_url: 'https://example.com/aff',
    disclosure_required: true,
    responsible_owner: 'Owner',
    last_verified: '2026-09-26',
    notes: 'Approved by Founder'
  };

  const tool = {
    tool_id: 'TOOL-TEST-004',
    official_url: 'https://example.com/tool4',
    lifecycle: { state: 'RECOMMENDED' }
  };

  const gateResult = validateAffiliateActivationGates(affUnverified, tool);
  const transitionResult = validateAffiliateTransition(
    'activation',
    AFFILIATE_ACTIVATION_STATUS.NOT_ACTIVATED,
    AFFILIATE_ACTIVATION_STATUS.ACTIVATED,
    affUnverified
  );

  assert(
    !gateResult.passed &&
    !gateResult.gates.GATE_01_VENDOR_PROGRAM_VERIFIED.passed &&
    !transitionResult.valid &&
    transitionResult.error.includes('COMMERCIAL_GATE_VIOLATION'),
    4,
    'Cannot Become ACTIVE Without Verified Vendor Program (Gate 1 Strictly Blocks Activation)'
  );
} catch (err) {
  assert(false, 4, 'Cannot Become ACTIVE Without Verified Vendor Program', err.message);
}

// -------------------------------------------------------------
// Test 05: Affiliate URL Cannot Replace Tool Canonical official_url (Integrity Violation)
// -------------------------------------------------------------
try {
  const toolWithOverwrittenUrl = {
    tool_id: 'TOOL-TEST-005',
    // VIOLATION: canonical official_url points to affiliate network!
    official_url: 'https://impact.com/ref/locatria-secret-link',
    lifecycle: { state: 'RECOMMENDED' }
  };

  const aff = {
    affiliate_id: 'AFF-TEST-005',
    affiliate_url: 'https://impact.com/ref/locatria-secret-link'
  };

  const linkResult = validateAffiliateLinkIntegrity(aff, toolWithOverwrittenUrl);

  assert(
    !linkResult.valid &&
    linkResult.errors.some(e => e.includes('INTEGRITY_VIOLATION')),
    5,
    'Affiliate URL Cannot Replace Tool Canonical official_url (Network Domain in official_url Blocked)'
  );
} catch (err) {
  assert(false, 5, 'Affiliate URL Replacing official_url Blocked', err.message);
}

// -------------------------------------------------------------
// Test 06: Missing or Unverified Affiliate URL Cannot Activate (Gate 4 Blocked)
// -------------------------------------------------------------
try {
  const affMissingUrl = {
    entity_type: 'affiliate',
    schema_version: '1.0',
    affiliate_id: 'AFF-TEST-006',
    tool_id: 'TOOL-TEST-006',
    affiliate_available: true,
    status: AFFILIATE_STATUS.ACTIVE,
    affiliate_program_available: AFFILIATE_PROGRAM_AVAILABILITY.TRUE,
    locatria_affiliate_relationship: LOCATRIA_AFFILIATE_RELATIONSHIP.ACTIVE,
    affiliate_activation_status: AFFILIATE_ACTIVATION_STATUS.ACTIVATED,
    program: 'Verified Partner Program',
    network: 'Direct',
    verification_status: VERIFICATION_STATUS.VERIFIED,
    program_source_url: 'https://example.com/affiliate-terms',
    // Missing affiliate_url!
    disclosure_required: true,
    responsible_owner: 'Editorial Operations',
    last_verified: '2026-09-26',
    notes: 'Approved by Founder'
  };

  const tool = {
    tool_id: 'TOOL-TEST-006',
    official_url: 'https://example.com/tool6',
    lifecycle: { state: 'RECOMMENDED' }
  };

  const gateResult = validateAffiliateActivationGates(affMissingUrl, tool);

  assert(
    !gateResult.passed &&
    !gateResult.gates.GATE_04_LINK_INTEGRITY.passed,
    6,
    'Missing or Unverified Affiliate URL Cannot Activate (Gate 4 Strictly Blocks Activation)'
  );
} catch (err) {
  assert(false, 6, 'Missing Affiliate URL Blocks Activation', err.message);
}

// -------------------------------------------------------------
// Test 07: Commercial Affiliate Change Does Not Modify Recommendation
// -------------------------------------------------------------
try {
  const tool = { tool_id: 'TOOL-TEST-007', official_url: 'https://example.com/tool7' };
  const rec = { recommendation_id: 'REC-TEST-007', status: 'RECOMMENDED', priority: 1 };
  const currentAff = {
    locatria_affiliate_relationship: LOCATRIA_AFFILIATE_RELATIONSHIP.ACTIVE,
    affiliate_activation_status: AFFILIATE_ACTIVATION_STATUS.ACTIVATED,
    status: AFFILIATE_STATUS.ACTIVE
  };

  // Vendor abruptly terminates affiliate program
  const triggerResult = resolveAffiliateReviewTrigger('PROGRAM_TERMINATED', currentAff, tool, rec);

  assert(
    triggerResult.editorialImpact.unaffected === true &&
    triggerResult.editorialImpact.recommendationStatusBefore === 'RECOMMENDED' &&
    triggerResult.editorialImpact.recommendationStatusAfter === 'RECOMMENDED' &&
    triggerResult.recommendedUpdates.locatria_affiliate_relationship === 'ENDED',
    7,
    'Affiliate Change Does Not Modify Recommendation (Editorial Decoupling Maintained)'
  );
} catch (err) {
  assert(false, 7, 'Affiliate Change Does Not Modify Recommendation', err.message);
}

// -------------------------------------------------------------
// Test 08: Commercial Affiliate Activation Does Not Modify Evaluation
// -------------------------------------------------------------
try {
  const evalData = {
    evaluation_id: 'EVAL-TEST-008',
    overall_score: 8.75,
    criteria: { problem_fit: 9, workflow_fit: 9, usability: 8 }
  };
  const recData = {
    recommendation_id: 'REC-TEST-008',
    status: 'CONDITIONALLY_RECOMMENDED'
  };

  const mockActive = { status: 'ACTIVE', affiliate_activation_status: 'ACTIVATED' };
  const mockNone = { status: 'NONE', affiliate_activation_status: 'NOT_ACTIVATED' };

  const independenceResult = assertCommercialIndependence(recData, evalData, mockActive, mockNone);

  assert(
    independenceResult.valid &&
    independenceResult.evalInvariant &&
    independenceResult.recInvariant,
    8,
    'Affiliate Activation Does Not Modify Evaluation (Empirical Scores Invariant to Commercial Status)'
  );
} catch (err) {
  assert(false, 8, 'Affiliate Activation Does Not Modify Evaluation', err.message);
}

// -------------------------------------------------------------
// Test 09: RETIRED Tool Cannot Be Newly Activated (Gate 7 Rejection)
// -------------------------------------------------------------
try {
  const retiredTool = {
    tool_id: 'TOOL-TEST-009',
    official_url: 'https://example.com/retired-tool',
    lifecycle: { state: 'RETIRED' }
  };

  const affForRetired = {
    entity_type: 'affiliate',
    schema_version: '1.0',
    affiliate_id: 'AFF-TEST-009',
    tool_id: 'TOOL-TEST-009',
    affiliate_available: true,
    status: AFFILIATE_STATUS.ACTIVE,
    affiliate_program_available: AFFILIATE_PROGRAM_AVAILABILITY.TRUE,
    locatria_affiliate_relationship: LOCATRIA_AFFILIATE_RELATIONSHIP.ACTIVE,
    affiliate_activation_status: AFFILIATE_ACTIVATION_STATUS.ACTIVATED,
    program: 'Legacy Program',
    network: 'Direct',
    verification_status: VERIFICATION_STATUS.VERIFIED,
    program_source_url: 'https://example.com/affiliates',
    affiliate_url: 'https://track.com/aff-9',
    disclosure_required: true,
    responsible_owner: 'Commercial Ops',
    last_verified: '2026-09-26',
    notes: 'Approved by Founder'
  };

  const gateResult = validateAffiliateActivationGates(affForRetired, retiredTool);

  assert(
    !gateResult.passed &&
    !gateResult.gates.GATE_07_GOVERNANCE_AND_TOOL_STATE.passed &&
    gateResult.gates.GATE_07_GOVERNANCE_AND_TOOL_STATE.message.includes('RETIRED'),
    9,
    'RETIRED Tool Cannot Be Newly Activated (Gate 7 Rejects Commercial Activation on Deprecated Assets)'
  );
} catch (err) {
  assert(false, 9, 'RETIRED Tool Cannot Be Activated', err.message);
}

// -------------------------------------------------------------
// Test 10: Historical Affiliate Status & Production Baseline Integrity
// -------------------------------------------------------------
try {
  // Inspect all production affiliates in resource-data/affiliates/
  const affiliateDir = path.join(resourceDataDir, 'affiliates');
  const files = fs.readdirSync(affiliateDir).filter(f => f.endsWith('.json'));

  let allBaselineUnactivated = true;
  let allHaveValidSchema = true;

  files.forEach(file => {
    const raw = fs.readFileSync(path.join(affiliateDir, file), 'utf8');
    const data = JSON.parse(raw);

    // Hard boundary verification: In Sprint A.4.2, ZERO real affiliates are activated
    if (data.status !== 'NONE') allBaselineUnactivated = false;
    if (data.locatria_affiliate_relationship !== 'NOT_CONTRACTED') allBaselineUnactivated = false;
    if (data.affiliate_activation_status !== 'NOT_ACTIVATED') allBaselineUnactivated = false;
    if (!['TRUE', 'FALSE', 'UNKNOWN'].includes(data.affiliate_program_available)) allHaveValidSchema = false;
  });

  assert(
    files.length === 10 && allBaselineUnactivated && allHaveValidSchema,
    10,
    `Production Affiliate Baseline Verified (10/10 Records Strictly NOT_CONTRACTED / NOT_ACTIVATED / NONE)`
  );
} catch (err) {
  assert(false, 10, 'Production Affiliate Baseline Integrity', err.message);
}

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log('\n------------------------------------------------------------');
console.log(`TOTAL AFFILIATE TESTS : ${totalTests}`);
console.log(`PASSED TESTS          : ${passedTests} ✓`);
console.log(`FAILED TESTS          : ${failedTests} ✗`);
console.log('------------------------------------------------------------\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('ALL AFFILIATE OPERATIONS TESTS PASSED CLEANLY.\n');
  process.exit(0);
}
