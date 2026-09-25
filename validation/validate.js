#!/usr/bin/env node
/**
 * LOCATRIA Resource & Tool Data Model v1.0
 * Canonical Schema & Governance Validator CLI
 *
 * Usage:
 *   node validation/validate.js <path-to-json-file>
 */

'use strict';

const fs = require('fs');
const path = require('path');
const Ajv2020 = require('ajv/dist/2020');
const addFormats = require('ajv-formats');
const {
  ERROR_CATEGORIES,
  mapAjvError,
  validateSemanticAndGovernance
} = require('./validation-rules');

const rootDir = path.resolve(__dirname, '..');
const schemasDir = path.join(rootDir, 'schemas');

// Initialize AJV Draft 2020-12 engine
const ajv = new Ajv2020({
  allErrors: true,
  strict: false
});
addFormats(ajv);

// Schema cache
const schemaCache = new Map();

function getSchemaForType(entityType) {
  if (schemaCache.has(entityType)) {
    return schemaCache.get(entityType);
  }
  const schemaFile = path.join(schemasDir, `${entityType}.schema.json`);
  if (!fs.existsSync(schemaFile)) {
    throw new Error(`Schema file not found for entity type "${entityType}": ${schemaFile}`);
  }
  const schemaData = JSON.parse(fs.readFileSync(schemaFile, 'utf8'));
  const validator = ajv.compile(schemaData);
  schemaCache.set(entityType, validator);
  return validator;
}

/**
 * Validates a single entity object.
 * Returns: { valid: boolean, errors: Array<{ category, path, message }> }
 */
function validateEntity(entity) {
  const errors = [];

  if (!entity || typeof entity !== 'object') {
    errors.push({
      category: ERROR_CATEGORIES.SCHEMA_ERROR,
      path: '/',
      message: 'Invalid entity: input must be a JSON object'
    });
    return { valid: false, errors };
  }

  const entityType = entity.entity_type;
  if (!entityType) {
    errors.push({
      category: ERROR_CATEGORIES.FIELD_ERROR,
      path: '/entity_type',
      message: 'Required property "entity_type" is missing'
    });
    return { valid: false, errors };
  }

  // 1. JSON Schema validation
  try {
    const validator = getSchemaForType(entityType);
    const isValid = validator(entity);
    if (!isValid && validator.errors) {
      validator.errors.forEach(err => {
        errors.push(mapAjvError(err));
      });
    }
  } catch (err) {
    errors.push({
      category: ERROR_CATEGORIES.SCHEMA_ERROR,
      path: '/',
      message: `Schema compiler error: ${err.message}`
    });
  }

  // 2. Semantic and Governance validation
  const ruleErrors = validateSemanticAndGovernance(entity);
  errors.push(...ruleErrors);

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates a JSON file on disk.
 */
function validateFile(filePath) {
  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) {
    return {
      valid: false,
      filePath: resolvedPath,
      errors: [{
        category: ERROR_CATEGORIES.SCHEMA_ERROR,
        path: '/',
        message: `File not found: ${resolvedPath}`
      }]
    };
  }

  let data;
  try {
    const raw = fs.readFileSync(resolvedPath, 'utf8');
    data = JSON.parse(raw);
  } catch (err) {
    return {
      valid: false,
      filePath: resolvedPath,
      errors: [{
        category: ERROR_CATEGORIES.SCHEMA_ERROR,
        path: '/',
        message: `JSON parse error: ${err.message}`
      }]
    };
  }

  const result = validateEntity(data);
  return {
    valid: result.valid,
    filePath: resolvedPath,
    entity: data,
    errors: result.errors
  };
}

// CLI Execution
if (require.main === module) {
  const targetFile = process.argv[2];
  if (!targetFile) {
    console.error('Usage: node validation/validate.js <path-to-json-file>');
    process.exit(1);
  }

  const res = validateFile(targetFile);
  const entity = res.entity || {};
  const entityType = entity.entity_type || 'unknown';
  const entityId = entity.tool_id || entity.resource_id || entity.evidence_id || entity.evaluation_id || entity.recommendation_id || entity.affiliate_id || entity.review_id || entity.relationship_id || path.basename(targetFile, '.json');
  const schemaVersion = entity.schema_version || 'N/A';

  console.log('\nLOCATRIA Schema Validation');
  console.log('---------------------------');
  console.log(`Entity: ${entityType}`);
  console.log(`ID:     ${entityId}`);
  console.log(`Schema: ${schemaVersion}\n`);

  if (res.valid) {
    console.log('STATUS: PASS ✓\n');
    process.exit(0);
  } else {
    console.log('STATUS: FAIL ✗\n');
    console.log('Errors:');
    res.errors.forEach(err => {
      console.log(`- [${err.category}] ${err.path}`);
      console.log(`  ${err.message}\n`);
    });
    process.exit(1);
  }
}

module.exports = {
  validateEntity,
  validateFile,
  getSchemaForType
};
