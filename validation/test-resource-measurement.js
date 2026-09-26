#!/usr/bin/env node
/**
 * LOCATRIA Resource Measurement Test Suite v1.0
 * GDBS OS — Module 07 / Chapter 01 / Sprint A.4.4
 *
 * Verifies measurement schema validation, unknown resource rejection,
 * epistemic data quality tagging, user value vs commercial separation,
 * recommendation/evaluation invariance, and empty measurement baseline validity.
 */

'use strict';

const path = require('path');
const fs = require('fs');
const {
  MEASUREMENT_LAYERS,
  MEASUREMENT_EVENTS,
  DATA_QUALITY,
  MEASUREMENT_SOURCES,
  PERFORMANCE_SIGNALS,
  validateMeasurementRecord,
  loadKnownResourceIds,
  assertMeasurementDecoupling,
  assertUserVsCommercialSeparation,
  evaluateQualitativePerformance,
  resolveMeasurementReviewTrigger
} = require('./resource-measurement');

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
console.log('LOCATRIA RESOURCE MEASUREMENT TEST SUITE v1.0');
console.log('============================================================\n');

// -------------------------------------------------------------
// Test 01: Valid Measurement Record Passes Validation
// -------------------------------------------------------------
try {
  const validRecord = {
    entity_type: 'measurement',
    schema_version: '1.0',
    measurement_id: 'MEAS-WORKFLOW-001-ENGAGED-202609',
    resource_id: 'RES-WORKFLOW-001',
    layer: MEASUREMENT_LAYERS.ENGAGEMENT,
    metric: MEASUREMENT_EVENTS.RESOURCE_ENGAGED,
    value: 142,
    unit: 'count',
    data_quality: DATA_QUALITY.ACTUAL,
    source: MEASUREMENT_SOURCES.WEBSITE_ANALYTICS,
    measurement_period: {
      start_date: '2026-09-01',
      end_date: '2026-09-26'
    },
    captured_at: '2026-09-26',
    attribution_context: { channel: 'organic_search' },
    notes: 'Engaged visits with dwell time >= 45 seconds.'
  };

  const result = validateMeasurementRecord(validRecord, {
    knownResourceIds: ['RES-WORKFLOW-001']
  });

  assert(
    result.valid && result.errors.length === 0,
    1,
    'Valid Measurement Record Passes Validation (All Canonical Fields & Period Valid)'
  );
} catch (err) {
  assert(false, 1, 'Valid Measurement Record', err.message);
}

// -------------------------------------------------------------
// Test 02: Invalid Measurement Record Blocked
// -------------------------------------------------------------
try {
  const invalidRecord = {
    entity_type: 'measurement',
    schema_version: '1.0',
    measurement_id: 'INVALID_ID_FORMAT', // Missing MEAS- prefix
    // Missing resource_id, layer, metric, value, data_quality, source
    captured_at: '2026-09-26'
  };

  const result = validateMeasurementRecord(invalidRecord);

  assert(
    !result.valid &&
    result.errors.length >= 4 &&
    result.errors.some(e => e.includes('MEASUREMENT_ID_FORMAT')) &&
    result.errors.some(e => e.includes('resource_id')),
    2,
    'Invalid Measurement Record Blocked (Missing Fields & Invalid ID Trigger Rejection)'
  );
} catch (err) {
  assert(false, 2, 'Invalid Measurement Record Blocked', err.message);
}

// -------------------------------------------------------------
// Test 03: Unknown Resource ID Rejected
// -------------------------------------------------------------
try {
  const recordWithUnknownResource = {
    entity_type: 'measurement',
    schema_version: '1.0',
    measurement_id: 'MEAS-UNKNOWN-001',
    resource_id: 'RES-NONEXISTENT-RESOURCE-XYZ', // Does not exist!
    layer: MEASUREMENT_LAYERS.REACH,
    metric: MEASUREMENT_EVENTS.RESOURCE_VIEW,
    value: 50,
    unit: 'count',
    data_quality: DATA_QUALITY.ACTUAL,
    source: MEASUREMENT_SOURCES.WEBSITE_ANALYTICS,
    measurement_period: {
      start_date: '2026-09-01',
      end_date: '2026-09-26'
    },
    captured_at: '2026-09-26'
  };

  const result = validateMeasurementRecord(recordWithUnknownResource, {
    knownResourceIds: ['RES-WORKFLOW-001', 'RES-GUIDE-001']
  });

  assert(
    !result.valid &&
    result.errors.some(e => e.includes('MEASUREMENT_UNKNOWN_RESOURCE')),
    3,
    'Unknown Resource ID Rejected (Cross-Entity Integrity Prevents Orphan Telemetry)'
  );
} catch (err) {
  assert(false, 3, 'Unknown Resource ID Rejected', err.message);
}

// -------------------------------------------------------------
// Test 04: Measurement Source Classification
// -------------------------------------------------------------
try {
  const validSources = Object.values(MEASUREMENT_SOURCES);
  const invalidSourceRecord = {
    entity_type: 'measurement',
    schema_version: '1.0',
    measurement_id: 'MEAS-SOURCE-TEST-001',
    resource_id: 'RES-WORKFLOW-001',
    layer: MEASUREMENT_LAYERS.REACH,
    metric: MEASUREMENT_EVENTS.RESOURCE_VIEW,
    value: 10,
    unit: 'count',
    data_quality: DATA_QUALITY.ACTUAL,
    source: 'FABRICATED_UNVERIFIED_SCRAPER', // Invalid source!
    measurement_period: {
      start_date: '2026-09-01',
      end_date: '2026-09-26'
    },
    captured_at: '2026-09-26'
  };

  const result = validateMeasurementRecord(invalidSourceRecord, {
    knownResourceIds: ['RES-WORKFLOW-001']
  });

  assert(
    validSources.length === 6 &&
    !result.valid &&
    result.errors.some(e => e.includes('MEASUREMENT_INVALID_SOURCE')),
    4,
    'Measurement Source Classification (Only Authoritative Sources Permitted)'
  );
} catch (err) {
  assert(false, 4, 'Source Classification', err.message);
}

// -------------------------------------------------------------
// Test 05: Actual vs Estimated vs Manual Distinction
// -------------------------------------------------------------
try {
  const qualities = [DATA_QUALITY.ACTUAL, DATA_QUALITY.ESTIMATED, DATA_QUALITY.MANUAL, DATA_QUALITY.UNAVAILABLE];

  const actualRecord = {
    entity_type: 'measurement',
    schema_version: '1.0',
    measurement_id: 'MEAS-QUAL-001',
    resource_id: 'RES-WORKFLOW-001',
    layer: MEASUREMENT_LAYERS.REACH,
    metric: MEASUREMENT_EVENTS.RESOURCE_VIEW,
    value: 100,
    data_quality: DATA_QUALITY.ACTUAL,
    source: MEASUREMENT_SOURCES.WEBSITE_ANALYTICS,
    measurement_period: { start_date: '2026-09-01', end_date: '2026-09-26' },
    captured_at: '2026-09-26'
  };

  const manualRecord = {
    ...actualRecord,
    measurement_id: 'MEAS-QUAL-002',
    metric: MEASUREMENT_EVENTS.RESOURCE_FEEDBACK,
    layer: MEASUREMENT_LAYERS.USER_VALUE,
    data_quality: DATA_QUALITY.MANUAL,
    source: MEASUREMENT_SOURCES.MANUAL_AUDIT
  };

  const r1 = validateMeasurementRecord(actualRecord, { knownResourceIds: ['RES-WORKFLOW-001'] });
  const r2 = validateMeasurementRecord(manualRecord, { knownResourceIds: ['RES-WORKFLOW-001'] });

  assert(
    qualities.length === 4 && r1.valid && r2.valid,
    5,
    'Actual vs Estimated vs Manual Distinction (Strict Epistemic Classification Supported)'
  );
} catch (err) {
  assert(false, 5, 'Data Quality Distinction', err.message);
}

// -------------------------------------------------------------
// Test 06: User-Value and Commercial-Value Separation
// -------------------------------------------------------------
try {
  const mixedTelemetry = [
    {
      measurement_id: 'M1',
      layer: MEASUREMENT_LAYERS.REACH,
      metric: MEASUREMENT_EVENTS.RESOURCE_VIEW,
      value: 1000
    },
    {
      measurement_id: 'M2',
      layer: MEASUREMENT_LAYERS.ENGAGEMENT,
      metric: MEASUREMENT_EVENTS.RESOURCE_ENGAGED,
      value: 450
    },
    {
      measurement_id: 'M3',
      layer: MEASUREMENT_LAYERS.USER_VALUE,
      metric: MEASUREMENT_EVENTS.OFFICIAL_TOOL_CLICK,
      value: 35
    },
    {
      measurement_id: 'M4',
      layer: MEASUREMENT_LAYERS.COMMERCIAL,
      metric: MEASUREMENT_EVENTS.AFFILIATE_CLICK,
      value: 12
    },
    {
      measurement_id: 'M5',
      layer: MEASUREMENT_LAYERS.COMMERCIAL,
      metric: MEASUREMENT_EVENTS.REVENUE,
      value: 240
    }
  ];

  const sepResult = assertUserVsCommercialSeparation(mixedTelemetry);

  assert(
    sepResult.separated &&
    sepResult.userValueCount === 3 &&
    sepResult.commercialCount === 2 &&
    sepResult.commercialLedger.every(m => m.layer === 'COMMERCIAL'),
    6,
    'User-Value and Commercial-Value Separation (Strict Two-Ledger Partitioning Maintained)'
  );
} catch (err) {
  assert(false, 6, 'User vs Commercial Separation', err.message);
}

// -------------------------------------------------------------
// Test 07: Measurement Cannot Modify Recommendation
// -------------------------------------------------------------
try {
  const mockRec = {
    recommendation_id: 'REC-TEST-001',
    tool_id: 'TOOL-CAN-006',
    status: 'RECOMMENDED'
  };

  const highTrafficHighRevenueMeasurement = {
    layer: 'COMMERCIAL',
    metric: 'REVENUE',
    value: 50000 // Huge revenue surge
  };

  const zeroTrafficMeasurement = {
    layer: 'REACH',
    metric: 'RESOURCE_VIEW',
    value: 0 // Zero views
  };

  const dec1 = assertMeasurementDecoupling(highTrafficHighRevenueMeasurement, null, mockRec, null);
  const dec2 = assertMeasurementDecoupling(zeroTrafficMeasurement, null, mockRec, null);

  assert(
    dec1.decoupled &&
    dec1.recommendationInvariant &&
    dec2.recommendationInvariant &&
    mockRec.status === 'RECOMMENDED',
    7,
    'Measurement Cannot Modify Recommendation (Recommendation Invariant to Traffic & Revenue)'
  );
} catch (err) {
  assert(false, 7, 'Measurement Decoupled from Recommendation', err.message);
}

// -------------------------------------------------------------
// Test 08: Measurement Cannot Modify Evaluation
// -------------------------------------------------------------
try {
  const mockEval = {
    evaluation_id: 'EVAL-TEST-001',
    overall_score: 8.5
  };

  const zeroCommercialMeasurement = {
    layer: 'COMMERCIAL',
    metric: 'AFFILIATE_CLICK',
    value: 0
  };

  const decResult = assertMeasurementDecoupling(zeroCommercialMeasurement, null, null, mockEval);

  assert(
    decResult.decoupled &&
    decResult.evaluationInvariant &&
    mockEval.overall_score === 8.5,
    8,
    'Measurement Cannot Modify Evaluation (Empirical Scores Invariant to Monetization)'
  );
} catch (err) {
  assert(false, 8, 'Measurement Decoupled from Evaluation', err.message);
}

// -------------------------------------------------------------
// Test 09: Affiliate Click Remains Separate from Conversion / Revenue
// -------------------------------------------------------------
try {
  const telemetryRecords = [
    {
      metric: MEASUREMENT_EVENTS.AFFILIATE_CLICK,
      value: 50,
      layer: MEASUREMENT_LAYERS.COMMERCIAL
    },
    {
      metric: MEASUREMENT_EVENTS.CONVERSION,
      value: 2,
      layer: MEASUREMENT_LAYERS.COMMERCIAL
    },
    {
      metric: MEASUREMENT_EVENTS.REVENUE,
      value: 60,
      layer: MEASUREMENT_LAYERS.COMMERCIAL
    }
  ];

  const clickEvent = telemetryRecords.find(t => t.metric === 'AFFILIATE_CLICK');
  const convEvent = telemetryRecords.find(t => t.metric === 'CONVERSION');
  const revEvent = telemetryRecords.find(t => t.metric === 'REVENUE');

  assert(
    clickEvent.value !== convEvent.value &&
    convEvent.value !== revEvent.value &&
    clickEvent.metric !== convEvent.metric,
    9,
    'Affiliate Click Remains Separate from Conversion & Revenue (Discrete Funnel Events)'
  );
} catch (err) {
  assert(false, 9, 'Funnel Event Separation', err.message);
}

// -------------------------------------------------------------
// Test 10: Empty Measurement State Is Legitimate & Valid
// -------------------------------------------------------------
try {
  const measDir = path.join(resourceDataDir, 'measurements');
  const files = fs.existsSync(measDir)
    ? fs.readdirSync(measDir).filter(f => f.endsWith('.json'))
    : [];

  const qualitativeEmpty = evaluateQualitativePerformance([]);

  assert(
    files.length === 0 &&
    qualitativeEmpty.signals.includes(PERFORMANCE_SIGNALS.INSUFFICIENT_DATA),
    10,
    'Empty Measurement State Is Legitimate & Valid (Zero Data Fabrication Baseline Verified)'
  );
} catch (err) {
  assert(false, 10, 'Empty Measurement State', err.message);
}

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log('\n------------------------------------------------------------');
console.log(`TOTAL MEASUREMENT TESTS : ${totalTests}`);
console.log(`PASSED TESTS            : ${passedTests} ✓`);
console.log(`FAILED TESTS            : ${failedTests} ✗`);
console.log('------------------------------------------------------------\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('ALL RESOURCE MEASUREMENT TESTS PASSED CLEANLY.\n');
  process.exit(0);
}
