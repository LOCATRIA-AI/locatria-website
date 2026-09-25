#!/usr/bin/env node
/**
 * LOCATRIA Resource Data Layer v1.0
 * Operational Test Suite
 *
 * Implements the 10 mandatory operational tests defined in Sprint A.2.3 Section 21:
 * - Test 01: Load valid Tool entity -> PASS
 * - Test 02: Load valid Resource entity -> PASS
 * - Test 03: List all Tool entities -> PASS
 * - Test 04: List all Resource entities -> PASS
 * - Test 05: Resolve Tool → Evidence relationship -> PASS
 * - Test 06: Resolve nonexistent entity -> FAIL gracefully with clear error
 * - Test 07: Invalid entity schema -> VALIDATION_ERROR / SCHEMA_ERROR
 * - Test 08: Recommendation without required evidence/evaluation -> GOVERNANCE_ERROR
 * - Test 09: Affiliate ACTIVE while affiliate_available=false -> SEMANTIC_ERROR
 * - Test 10: Run full Resource Data Layer validation -> PASS for valid data
 */

'use strict';

const path = require('path');
const {
  loadTool,
  loadResource,
  listTools,
  listResources,
  resolveRelationship,
  resolveEntity
} = require('../js/resource-data');
const { validateEntity, validateFile } = require('./validate');
const { runBatchValidation } = require('./validate-all');
const {
  validateCrossEntityCollection,
  ERROR_CATEGORIES
} = require('./validation-rules');

const rootDir = path.resolve(__dirname, '..');
const fixturesDir = path.join(rootDir, 'resource-data', '_fixtures');
const legacyFixturesDir = path.join(rootDir, 'validation', 'fixtures');

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
console.log('LOCATRIA RESOURCE DATA LAYER OPERATIONAL TEST SUITE');
console.log('============================================================\n');

// -------------------------------------------------------------
// Test 01: Load valid Tool entity
// -------------------------------------------------------------
try {
  const tool = loadTool('TOOL-001', { baseDir: fixturesDir });
  assert(
    tool !== null && tool.tool_id === 'TOOL-001' && tool.entity_type === 'tool',
    1,
    'Load valid Tool entity (TOOL-001)'
  );
} catch (err) {
  assert(false, 1, 'Load valid Tool entity (TOOL-001)', err.message);
}

// -------------------------------------------------------------
// Test 02: Load valid Resource entity
// -------------------------------------------------------------
try {
  const res = loadResource('RES-001', { baseDir: fixturesDir });
  assert(
    res !== null && res.resource_id === 'RES-001' && res.entity_type === 'resource',
    2,
    'Load valid Resource entity (RES-001)'
  );
} catch (err) {
  assert(false, 2, 'Load valid Resource entity (RES-001)', err.message);
}

// -------------------------------------------------------------
// Test 03: List all Tool entities
// -------------------------------------------------------------
try {
  const tools = listTools({ baseDir: fixturesDir });
  assert(
    Array.isArray(tools) && tools.length > 0 && tools.some(t => t.tool_id === 'TOOL-001'),
    3,
    'List all Tool entities'
  );
} catch (err) {
  assert(false, 3, 'List all Tool entities', err.message);
}

// -------------------------------------------------------------
// Test 04: List all Resource entities
// -------------------------------------------------------------
try {
  const resources = listResources({ baseDir: fixturesDir });
  assert(
    Array.isArray(resources) && resources.length > 0 && resources.some(r => r.resource_id === 'RES-001'),
    4,
    'List all Resource entities'
  );
} catch (err) {
  assert(false, 4, 'List all Resource entities', err.message);
}

// -------------------------------------------------------------
// Test 05: Resolve Tool → Evidence relationship
// -------------------------------------------------------------
try {
  const relResult = resolveRelationship('REL-001', { baseDir: fixturesDir });
  const isValidResolution =
    relResult.ok === true &&
    relResult.relationship !== null &&
    relResult.source !== null &&
    relResult.source.tool_id === 'TOOL-001' &&
    relResult.target !== null &&
    relResult.target.evidence_id === 'EVD-001';

  assert(
    isValidResolution,
    5,
    'Resolve Tool → Evidence relationship (REL-001)'
  );
} catch (err) {
  assert(false, 5, 'Resolve Tool → Evidence relationship (REL-001)', err.message);
}

// -------------------------------------------------------------
// Test 06: Resolve nonexistent entity
// -------------------------------------------------------------
try {
  const missingResult = resolveEntity('tool', 'NONEXISTENT-ENTITY-999', { baseDir: fixturesDir });
  const failedGracefully =
    missingResult.ok === false &&
    missingResult.entity === null &&
    missingResult.error !== null &&
    missingResult.error.code === 'ENTITY_NOT_FOUND';

  assert(
    failedGracefully,
    6,
    'Resolve nonexistent entity (fails gracefully with clear error)'
  );
} catch (err) {
  assert(false, 6, 'Resolve nonexistent entity', err.message);
}

// -------------------------------------------------------------
// Test 07: Invalid entity schema
// -------------------------------------------------------------
try {
  const invalidSchemaFile = path.join(legacyFixturesDir, 'invalid', 'tool-invalid-missing-required.json');
  const validationRes = validateFile(invalidSchemaFile);
  const hasSchemaOrFieldError =
    validationRes.valid === false &&
    validationRes.errors.some(e =>
      e.category === ERROR_CATEGORIES.FIELD_ERROR ||
      e.category === ERROR_CATEGORIES.SCHEMA_ERROR
    );

  assert(
    hasSchemaOrFieldError,
    7,
    'Invalid entity schema rejected with SCHEMA_ERROR / FIELD_ERROR'
  );
} catch (err) {
  assert(false, 7, 'Invalid entity schema rejected', err.message);
}

// -------------------------------------------------------------
// Test 08: Recommendation without required evidence/evaluation
// -------------------------------------------------------------
try {
  // Test recommendation entity that lacks corresponding evaluation in collection
  const mockTool = {
    entity_type: 'tool',
    schema_version: '1.0',
    tool_id: 'TOOL-NO-EVAL',
    lifecycle_status: 'DISCOVERED'
  };
  const mockRec = {
    entity_type: 'recommendation',
    schema_version: '1.0',
    recommendation_id: 'REC-NO-EVAL',
    tool_id: 'TOOL-NO-EVAL',
    status: 'RECOMMENDED',
    rationale: 'Missing required evaluation test case',
    evidence_refs: ['EVD-001']
  };

  const crossErrors = validateCrossEntityCollection([mockTool, mockRec]);
  const hasGovError = crossErrors.some(e => e.category === ERROR_CATEGORIES.GOVERNANCE_ERROR);

  assert(
    hasGovError,
    8,
    'Recommendation without required evaluation triggers GOVERNANCE_ERROR'
  );
} catch (err) {
  assert(false, 8, 'Recommendation without required evaluation triggers GOVERNANCE_ERROR', err.message);
}

// -------------------------------------------------------------
// Test 09: Affiliate ACTIVE while affiliate_available=false
// -------------------------------------------------------------
try {
  const mockTool = {
    entity_type: 'tool',
    schema_version: '1.0',
    tool_id: 'TOOL-NO-AFFILIATE',
    commercial: {
      pricing_model: 'FREE',
      affiliate_available: false
    },
    lifecycle_status: 'DISCOVERED'
  };
  const mockAff = {
    entity_type: 'affiliate',
    schema_version: '1.0',
    affiliate_id: 'AFF-INVALID-ACTIVE',
    tool_id: 'TOOL-NO-AFFILIATE',
    status: 'ACTIVE',
    affiliate_available: false
  };

  const crossErrors = validateCrossEntityCollection([mockTool, mockAff]);
  const hasSemanticError = crossErrors.some(e => e.category === ERROR_CATEGORIES.SEMANTIC_ERROR);

  assert(
    hasSemanticError,
    9,
    'Affiliate ACTIVE while affiliate_available=false triggers SEMANTIC_ERROR'
  );
} catch (err) {
  assert(false, 9, 'Affiliate ACTIVE while affiliate_available=false triggers SEMANTIC_ERROR', err.message);
}

// -------------------------------------------------------------
// Test 10: Run full Resource Data Layer validation
// -------------------------------------------------------------
try {
  const { results } = runBatchValidation(fixturesDir);
  const fullValidationPassed =
    results.summary.total === 8 &&
    results.summary.valid === 8 &&
    results.summary.invalid === 0 &&
    (!results.crossEntityErrors || results.crossEntityErrors.length === 0);

  assert(
    fullValidationPassed,
    10,
    'Run full Resource Data Layer validation (all 8 seed records PASS)'
  );
} catch (err) {
  assert(false, 10, 'Run full Resource Data Layer validation', err.message);
}

console.log('\n------------------------------------------------------------');
console.log(`TEST SUMMARY: ${passedTests}/${totalTests} Passed (${failedTests} Failed)`);
console.log('------------------------------------------------------------\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('ALL OPERATIONAL RESOURCE DATA LAYER TESTS PASSED ✓\n');
  process.exit(0);
}
