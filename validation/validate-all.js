#!/usr/bin/env node
/**
 * LOCATRIA Resource & Tool Data Model v1.0
 * Batch Validation & Reporting CLI
 *
 * Scans data directories and fixtures, runs schema, semantic, governance,
 * and cross-entity validations, and generates a structured report in reports/validation/.
 *
 * Usage:
 *   node validation/validate-all.js [target-dir]
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { validateFile } = require('./validate');
const { validateCrossEntityCollection } = require('./validation-rules');

const rootDir = path.resolve(__dirname, '..');
const defaultTargetDir = path.join(__dirname, 'fixtures');
const reportsDir = path.join(rootDir, 'reports/validation');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function findJsonFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file === 'index' || file === 'node_modules' || file === '.git' || file === '_fixtures') {
        return;
      }
      results = results.concat(findJsonFiles(fullPath));
    } else if (
      file.endsWith('.json') &&
      !file.endsWith('.schema.json') &&
      !file.endsWith('-index.json') &&
      file !== 'resource-data-manifest.json'
    ) {
      results.push(fullPath);
    }
  });
  return results;
}

function runBatchValidation(targetDir = defaultTargetDir) {
  ensureDir(reportsDir);

  const files = findJsonFiles(targetDir);
  const startTime = new Date();

  const results = {
    timestamp: startTime.toISOString(),
    targetDirectory: path.relative(rootDir, targetDir) || '.',
    summary: {
      total: 0,
      valid: 0,
      invalid: 0
    },
    byEntityType: {
      tool: { total: 0, valid: 0, invalid: 0 },
      resource: { total: 0, valid: 0, invalid: 0 },
      evidence: { total: 0, valid: 0, invalid: 0 },
      evaluation: { total: 0, valid: 0, invalid: 0 },
      recommendation: { total: 0, valid: 0, invalid: 0 },
      affiliate: { total: 0, valid: 0, invalid: 0 },
      review: { total: 0, valid: 0, invalid: 0 },
      relationship: { total: 0, valid: 0, invalid: 0 },
      measurement: { total: 0, valid: 0, invalid: 0 },
      other: { total: 0, valid: 0, invalid: 0 }
    },
    files: [],
    crossEntityErrors: []
  };

  const allRecords = [];

  files.forEach(file => {
    const res = validateFile(file);
    const entity = res.entity;
    const rawType = entity && entity.entity_type ? entity.entity_type.toLowerCase() : 'other';
    const type = results.byEntityType[rawType] ? rawType : 'other';

    results.summary.total++;
    results.byEntityType[type].total++;

    if (res.valid) {
      results.summary.valid++;
      results.byEntityType[type].valid++;
      if (entity) allRecords.push(entity);
    } else {
      results.summary.invalid++;
      results.byEntityType[type].invalid++;
    }

    results.files.push({
      file: path.relative(rootDir, file),
      entityType: rawType,
      id: entity ? (entity.tool_id || entity.resource_id || entity.evidence_id || entity.evaluation_id || entity.recommendation_id || entity.affiliate_id || entity.review_id || entity.relationship_id || entity.measurement_id || 'unknown') : 'unknown',
      valid: res.valid,
      errors: res.errors
    });
  });

  // Cross-entity validation on valid entities
  const crossErrors = validateCrossEntityCollection(allRecords);
  if (crossErrors.length > 0) {
    results.crossEntityErrors = crossErrors;
  }

  // Write reports
  const timestampStr = startTime.toISOString().replace(/[:.]/g, '-');
  const reportFileName = `validation-report-${timestampStr}.json`;
  const reportPath = path.join(reportsDir, reportFileName);
  const latestPath = path.join(reportsDir, 'latest.json');

  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf8');
  fs.writeFileSync(latestPath, JSON.stringify(results, null, 2), 'utf8');

  return { results, reportPath };
}

// CLI Execution
if (require.main === module) {
  const targetDir = process.argv[2] ? path.resolve(process.argv[2]) : defaultTargetDir;

  console.log('\n============================================================');
  console.log('LOCATRIA RESOURCE & TOOL DATA MODEL VALIDATION SUITE');
  console.log('============================================================');
  console.log(`Target Directory: ${path.relative(rootDir, targetDir) || '.'}\n`);

  const { results, reportPath } = runBatchValidation(targetDir);

  console.log('------------------------------------------------------------');
  console.log('VALIDATION SUMMARY');
  console.log('------------------------------------------------------------');
  console.log(`Total Inspected : ${results.summary.total}`);
  console.log(`Valid Records   : ${results.summary.valid} ✓`);
  console.log(`Invalid Records : ${results.summary.invalid} ✗\n`);

  console.log('BREAKDOWN BY ENTITY TYPE:');
  const typeLabels = {
    tool: 'Tools',
    resource: 'Resources',
    evidence: 'Evidence',
    evaluation: 'Evaluations',
    recommendation: 'Recommendations',
    affiliate: 'Affiliates',
    review: 'Reviews',
    relationship: 'Relationships',
    measurement: 'Measurements'
  };

  Object.entries(typeLabels).forEach(([key, label]) => {
    const stats = results.byEntityType[key];
    console.log(`  ${label.padEnd(16)} : Total ${stats.total.toString().padStart(2)} | Valid ${stats.valid.toString().padStart(2)} | Invalid ${stats.invalid.toString().padStart(2)}`);
  });

  if (results.crossEntityErrors.length > 0) {
    console.log('\nCROSS-ENTITY GOVERNANCE ERRORS:');
    results.crossEntityErrors.forEach(err => {
      console.log(`  - [${err.category}] Entity ${err.entityId || 'N/A'}${err.path}: ${err.message}`);
    });
  }

  console.log('\nREPORT SAVED TO:');
  console.log(`  ${path.relative(rootDir, reportPath)}`);
  console.log('------------------------------------------------------------\n');

  // Note: If running against a directory of mixed valid/invalid fixtures, individual results are reported.
  // When running purely on valid fixtures or production data, exit 1 if unexpected invalid records exist.
  const isTargetingValidOnly = targetDir.endsWith(`${path.sep}valid`) || path.basename(targetDir) === 'valid';
  if (isTargetingValidOnly && results.summary.invalid > 0) {
    process.exit(1);
  }
}

module.exports = {
  runBatchValidation
};
