/**
 * LOCATRIA Visibility Operating System v1.0
 * Foundation & Data Model Test Suite (BUILD-01)
 *
 * Validates:
 * - AT-01: Entity creation across all core entities
 * - AT-02: Entity relationships (Run -> PromptSet, Observation -> Run/Prompt/Env, Evidence -> Obs)
 * - AT-03: Historical immutability (Modifying historical records blocked)
 * - AT-04: Versioning consistency
 * - Test B: AI cannot delete raw evidence (Critical Negative Test)
 * - Test C: Historical observation cannot be overwritten (Critical Negative Test)
 * - Test J: No composite visibility score allowed (Critical Negative Test)
 * - Schema validation & error handling
 * - Intervention identity guardrail: T2-INT-01 enforced
 */

'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const dal = require('../js/visibility-data/index');

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
console.log('LOCATRIA VISIBILITY OPERATING SYSTEM FOUNDATION TEST SUITE');
console.log('M08.2 BUILD-01 — Data Model & Governance Invariants');
console.log('============================================================\n');

// AT-01: Entity Creation
runTest('AT-01: Load and validate core entities (Prompt, PromptSet, Env, Run, Obs, Evidence, Audit)', () => {
  const prompt = dal.loadEntity('prompt', 'PROMPT-FIX-001');
  assert(prompt !== null, 'Should load prompt fixture');
  assert.strictEqual(prompt.entity_type, 'prompt');
  const vPrompt = dal.validateEntity('prompt', prompt);
  assert.strictEqual(vPrompt.valid, true, 'Prompt must be valid schema');

  const pset = dal.loadEntity('prompt_set', 'PSET-FIX-001');
  assert(pset !== null, 'Should load prompt_set fixture');
  assert.strictEqual(pset.entity_type, 'prompt_set');
  const vPset = dal.validateEntity('prompt_set', pset);
  assert.strictEqual(vPset.valid, true, 'PromptSet must be valid schema');

  const env = dal.loadEntity('environment', 'ENV-FIX-001');
  assert(env !== null, 'Should load environment fixture');
  assert.strictEqual(env.entity_type, 'environment');
  const vEnv = dal.validateEntity('environment', env);
  assert.strictEqual(vEnv.valid, true, 'Environment must be valid schema');

  const run = dal.loadEntity('measurement_run', 'RUN-FIX-001');
  assert(run !== null, 'Should load measurement_run fixture');
  assert.strictEqual(run.entity_type, 'measurement_run');
  const vRun = dal.validateEntity('measurement_run', run);
  assert.strictEqual(vRun.valid, true, 'Run must be valid schema');

  const obs = dal.loadEntity('observation', 'OBS-FIX-001');
  assert(obs !== null, 'Should load observation fixture');
  assert.strictEqual(obs.entity_type, 'observation');
  const vObs = dal.validateEntity('observation', obs);
  assert.strictEqual(vObs.valid, true, 'Observation must be valid schema');

  const evd = dal.loadEntity('visibility_evidence', 'EVD-VIS-FIX-001');
  assert(evd !== null, 'Should load evidence fixture');
  assert.strictEqual(evd.entity_type, 'visibility_evidence');
  const vEvd = dal.validateEntity('visibility_evidence', evd);
  assert.strictEqual(vEvd.valid, true, 'Evidence must be valid schema');

  const aud = dal.loadEntity('audit_log', 'AUD-FIX-001');
  assert(aud !== null, 'Should load audit_log fixture');
  assert.strictEqual(aud.entity_type, 'audit_log');
  const vAud = dal.validateEntity('audit_log', aud);
  assert.strictEqual(vAud.valid, true, 'Audit log must be valid schema');
});

// AT-02: Entity Relationships
runTest('AT-02: Resolve entity relationships across M08.2 domains', () => {
  const pset = dal.resolveRelationship('measurement_run', 'RUN-FIX-001', 'prompt_set');
  assert(pset !== null, 'Run must resolve to PromptSet');
  assert.strictEqual(pset.prompt_set_id, 'PSET-FIX-001');

  const run = dal.resolveRelationship('observation', 'OBS-FIX-001', 'measurement_run');
  assert(run !== null, 'Observation must resolve to Measurement Run');
  assert.strictEqual(run.run_id, 'RUN-FIX-001');

  const prompt = dal.resolveRelationship('observation', 'OBS-FIX-001', 'prompt');
  assert(prompt !== null, 'Observation must resolve to Prompt');
  assert.strictEqual(prompt.prompt_id, 'PROMPT-FIX-001');

  const env = dal.resolveRelationship('observation', 'OBS-FIX-001', 'environment');
  assert(env !== null, 'Observation must resolve to Environment');
  assert.strictEqual(env.environment_id, 'ENV-FIX-001');

  const evdList = dal.resolveRelationship('observation', 'OBS-FIX-001', 'visibility_evidence');
  assert(Array.isArray(evdList), 'Observation must resolve to Evidence list');
  assert(evdList.some(e => e.evidence_id === 'EVD-VIS-FIX-001'), 'Must contain EVD-VIS-FIX-001');

  const obs = dal.resolveRelationship('visibility_evidence', 'EVD-VIS-FIX-001', 'observation');
  assert(obs !== null, 'Evidence must resolve back to parent Observation');
  assert.strictEqual(obs.observation_id, 'OBS-FIX-001');
});

// AT-03: Historical Immutability
runTest('AT-03: Historical completed runs and records cannot be overwritten', () => {
  const completedRun = dal.loadEntity('measurement_run', 'RUN-FIX-001');
  assert(completedRun.is_immutable === true, 'Run fixture is immutable');

  let writeBlocked = false;
  try {
    dal.saveEntity('measurement_run', {
      ...completedRun,
      run_name: 'Illicit Modification'
    });
  } catch (err) {
    if (err.message.includes('IMMUTABILITY_VIOLATION')) {
      writeBlocked = true;
    }
  }
  assert.strictEqual(writeBlocked, true, 'Overwriting completed run must throw IMMUTABILITY_VIOLATION');
});

// AT-04: Versioning
runTest('AT-04: Version identifiers strictly validated across all entities', () => {
  const invalidVersionPrompt = {
    entity_type: 'prompt',
    schema_version: 'invalid-version-string',
    prompt_id: 'P-TEST-VER',
    prompt_version: 'bad',
    prompt_text: 'Test',
    prompt_category: 'DISCOVERY',
    intent_type: 'INFORMATIONAL',
    language: 'en',
    status: 'ACTIVE',
    created_at: '2026-09-28'
  };

  const validation = dal.validateEntity('prompt', invalidVersionPrompt);
  assert.strictEqual(validation.valid, false, 'Invalid version string pattern must be rejected');
});

// Critical Negative Test B: AI cannot delete raw evidence
runTest('Test B: AI cannot delete raw evidence (Critical Negative Test)', () => {
  let deleteBlocked = false;
  try {
    dal.deleteEntity('visibility_evidence', 'EVD-VIS-FIX-001', {
      actor_type: 'AI_ADVISOR'
    });
  } catch (err) {
    if (err.message.includes('PERMISSION_DENIED') && err.message.includes('AI_ADVISOR')) {
      deleteBlocked = true;
    }
  }
  assert.strictEqual(deleteBlocked, true, 'AI attempting to delete raw evidence must throw PERMISSION_DENIED');
});

// Critical Negative Test C: Historical observation cannot be overwritten
runTest('Test C: Historical observation cannot be overwritten (Critical Negative Test)', () => {
  const existingObs = dal.loadEntity('observation', 'OBS-FIX-001');
  assert(existingObs !== null);

  let overwriteBlocked = false;
  try {
    dal.saveEntity('observation', {
      ...existingObs,
      mention: 'NO'
    });
  } catch (err) {
    if (err.message.includes('IMMUTABILITY_VIOLATION')) {
      overwriteBlocked = true;
    }
  }
  assert.strictEqual(overwriteBlocked, true, 'Attempting to overwrite observation must throw IMMUTABILITY_VIOLATION');
});

// Critical Negative Test J: No composite visibility score
runTest('Test J: No composite visibility score allowed in schema or entity data', () => {
  const obsWithCompositeScore = {
    entity_type: 'observation',
    schema_version: '1.0.0',
    observation_id: 'OBS-COMPOSITE-TEST',
    run_id: 'RUN-FIX-001',
    prompt_id: 'PROMPT-FIX-001',
    environment_id: 'ENV-FIX-001',
    observed_at: '2026-09-28T00:30:00Z',
    mention: 'YES',
    citation_signal: 'YES',
    verified_citation: 'YES',
    retrieval: 'YES',
    entity_recognition: 'CORRECT',
    context_accuracy: 'ACCURATE',
    confidence: 'HIGH',
    qa_status: 'VERIFIED',
    is_immutable: true,
    visibility_score: 85.5 // Strictly forbidden!
  };

  const validation = dal.validateEntity('observation', obsWithCompositeScore);
  assert.strictEqual(validation.valid, false, 'Entity containing composite visibility score must be rejected');
  assert(validation.errors[0].includes('Composite visibility score field') || validation.errors[0].includes('forbidden'));
});

// Canonical Intervention Guardrail: T2-INT-01 preserved, INT-T2-01 blocked
runTest('Guardrail: Intervention ID must be T2-INT-01, rejecting INT-T2-01', () => {
  const runWithWrongInterventionId = {
    entity_type: 'measurement_run',
    schema_version: '1.0.0',
    run_id: 'RUN-INT-TEST',
    run_name: 'Test Run',
    run_type: 'EXPERIMENT',
    intervention_id: 'INT-T2-01', // Incorrect ID!
    prompt_set_id: 'PSET-FIX-001',
    protocol_version: '1.0.0',
    start_time: '2026-09-28T00:00:00Z',
    operator: 'FOUNDER',
    status: 'PENDING',
    environment_count: 1,
    prompt_count: 1,
    observation_count: 0,
    is_immutable: false
  };

  const validation = dal.validateEntity('measurement_run', runWithWrongInterventionId);
  assert.strictEqual(validation.valid, false, 'INT-T2-01 must be rejected in favor of canonical T2-INT-01');
  assert(validation.errors[0].includes('T2-INT-01'));
});

// Relationship integrity: Reject missing referenced entities
runTest('Integrity: Reject measurement run referencing non-existent prompt set', () => {
  let relationshipBlocked = false;
  try {
    dal.saveEntity('measurement_run', {
      entity_type: 'measurement_run',
      schema_version: '1.0.0',
      run_id: 'RUN-ORPHAN-TEST',
      run_name: 'Orphan Run',
      run_type: 'EXPERIMENT',
      intervention_id: 'T2-INT-01',
      prompt_set_id: 'PSET-NON-EXISTENT-ID',
      protocol_version: '1.0.0',
      start_time: '2026-09-28T00:00:00Z',
      operator: 'QA',
      status: 'PENDING',
      environment_count: 1,
      prompt_count: 1,
      observation_count: 0,
      is_immutable: false
    });
  } catch (err) {
    if (err.message.includes('RELATIONSHIP_ERROR')) {
      relationshipBlocked = true;
    }
  }
  assert.strictEqual(relationshipBlocked, true, 'Orphan prompt_set reference must throw RELATIONSHIP_ERROR');
});

// Canonical production data validation
runTest('Production Baseline: Validate canonical initial environments, prompt set, prompts, and T1 run', () => {
  const envs = dal.listEnvironments();
  assert.strictEqual(envs.length, 3, 'Must have exactly 3 canonical environments (ChatGPT, Gemini, Perplexity)');
  assert(envs.some(e => e.environment_id === 'ENV-CHATGPT'));
  assert(envs.some(e => e.environment_id === 'ENV-GEMINI'));
  assert(envs.some(e => e.environment_id === 'ENV-PERPLEXITY'));

  const psets = dal.listPromptSets();
  assert.strictEqual(psets.length, 1, 'Must have exactly 1 canonical prompt set (PSET-M08-1-FIXED20)');
  assert.strictEqual(psets[0].prompt_ids.length, 20, 'Prompt set must contain 20 prompt IDs');

  const prompts = dal.listPrompts();
  assert.strictEqual(prompts.length, 20, 'Must have exactly 20 canonical prompts (P01 to P20)');

  const runs = dal.listRuns();
  assert.strictEqual(runs.length, 1, 'Must have exactly 1 canonical run (RUN-M08-1-T1-REF)');
  assert.strictEqual(runs[0].run_id, 'RUN-M08-1-T1-REF');
  assert.strictEqual(runs[0].run_type, 'CONTROL');
  assert.strictEqual(runs[0].status, 'COMPLETED');
  assert.strictEqual(runs[0].is_immutable, true);

  // Verify all production records pass schema validation
  for (const env of envs) assert.strictEqual(dal.validateEntity('environment', env).valid, true);
  for (const pset of psets) assert.strictEqual(dal.validateEntity('prompt_set', pset).valid, true);
  for (const prompt of prompts) assert.strictEqual(dal.validateEntity('prompt', prompt).valid, true);
  for (const run of runs) assert.strictEqual(dal.validateEntity('measurement_run', run).valid, true);
});

console.log('------------------------------------------------------------');
console.log(`TOTAL FOUNDATION TESTS : ${totalTests}`);
console.log(`PASSED TESTS           : ${passedTests} ✓`);
console.log(`FAILED TESTS           : ${failedTests} ✗`);
console.log('------------------------------------------------------------\n');

if (failedTests > 0) {
  console.error('[FAILURE] Visibility Foundation test suite failed.');
  process.exit(1);
} else {
  console.log('[SUCCESS] All M08.2 Visibility Foundation tests passed cleanly!\n');
}
