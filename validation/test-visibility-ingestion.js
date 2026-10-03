/**
 * LOCATRIA Visibility Operating System v1.0
 * Module 08 — Visibility Growth System (M08.2 BUILD-02)
 * Ingestion, Normalization & Audit Pipeline Test Suite
 *
 * Verifies Tests A through O (Section 22):
 * - Test A: T1 source can be recognized and loaded
 * - Test B: T1 P01–P20 match canonical frozen prompts verbatim
 * - Test C: All 3 environments map correctly through alias table
 * - Test D: 60 T1 observations remain exactly 60
 * - Test E: 60 T1 evidence records remain 1:1 traceable
 * - Test F: No duplicate observation identity exists
 * - Test G: T1 remains strictly separate from T2
 * - Test H: T2 remains associated with T2-INT-01 (rejects INT-T2-01)
 * - Test I: UNVERIFIED states remain unchanged as valid first-class states
 * - Test J: URLs are never inferred from brand or domain
 * - Test K: Re-running ingestion is idempotent (no duplicates, no mutation)
 * - Test L: A deliberately altered source is detected (E002 SOURCE_CHANGED)
 * - Test M: A prompt wording mismatch is detected (E009 PROMPT_TEXT_MISMATCH)
 * - Test N: A duplicate observation is rejected (E007 DUPLICATE_OBSERVATION)
 * - Test O: A missing provenance reference is rejected (E006 INVALID_REFERENCE)
 * - Test P: Historical mutation attempt on completed run is blocked (E015 HISTORICAL_RECORD_MUTATION)
 * - Test Q: Composite visibility score rejection invariant preserved
 */

'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const dal = require('../js/visibility-data/index');
const {
  ERROR_CODES,
  ENVIRONMENT_ALIAS_MAP,
  IngestionError,
  calculateSha256,
  normalizeEnvironment,
  validatePromptAgainstCanonical,
  registerSource,
  normalizeObservation,
  executeIngestion
} = require('../js/visibility-ingestion/index');

let passedTests = 0;
let failedTests = 0;

function runTest(testId, description, fn) {
  try {
    fn();
    console.log(`  [PASS] ${testId}: ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] ${testId}: ${description}`);
    console.error(`         Error: ${err.message}`);
    failedTests++;
  }
}

console.log('============================================================');
console.log('LOCATRIA VISIBILITY OPERATING SYSTEM — INGESTION TEST SUITE');
console.log('M08.2 BUILD-02 — Ingestion, Normalization & Audit Pipeline');
console.log('============================================================\n');

// -------------------------------------------------------------
// Test A: T1 source can be recognized and loaded
// -------------------------------------------------------------
runTest('Test A', 'T1 source can be recognized, registered, and validated', () => {
  const source = dal.loadEntity('source', 'SRC-M08-1-T1-CHATGPT-RAW');
  assert.ok(source, 'T1 ChatGPT raw source must exist');
  assert.strictEqual(source.entity_type, 'source');
  assert.strictEqual(source.source_level, 'S2');
  assert.strictEqual(source.source_role, 'T1_CONTROL_SOURCE');
  assert.ok(source.source_hash && source.source_hash.length === 64, 'Source hash must be 64-character SHA-256');

  const vSource = dal.validateEntity('source', source);
  assert.ok(vSource.valid, `Source failed schema validation: ${JSON.stringify(vSource.errors)}`);
});

// -------------------------------------------------------------
// Test B: T1 P01–P20 match canonical frozen prompts verbatim
// -------------------------------------------------------------
runTest('Test B', 'T1 P01–P20 match canonical frozen prompts verbatim without wording drift', () => {
  const promptSet = dal.loadEntity('prompt_set', 'PSET-M08-1-FIXED20');
  assert.ok(promptSet, 'PSET-M08-1-FIXED20 must exist');
  assert.strictEqual(promptSet.prompt_ids.length, 20);

  for (const pid of promptSet.prompt_ids) {
    const prompt = dal.loadEntity('prompt', pid);
    assert.ok(prompt, `Prompt ${pid} must exist`);
    assert.ok(prompt.prompt_text && prompt.prompt_text.length > 10);
    // Validate prompt text against canonical DAL loader
    const matchedPrompt = validatePromptAgainstCanonical(pid, prompt.prompt_text);
    assert.strictEqual(matchedPrompt.prompt_id, pid);
  }
});

// -------------------------------------------------------------
// Test C: All 3 environments map correctly through alias table
// -------------------------------------------------------------
runTest('Test C', 'All 3 environments map correctly through deterministic alias table', () => {
  assert.strictEqual(normalizeEnvironment('chatgpt'), 'ENV-CHATGPT');
  assert.strictEqual(normalizeEnvironment('ChatGPT'), 'ENV-CHATGPT');
  assert.strictEqual(normalizeEnvironment('CHAT GPT'), 'ENV-CHATGPT');
  assert.strictEqual(normalizeEnvironment('gpt-4o'), 'ENV-CHATGPT');

  assert.strictEqual(normalizeEnvironment('gemini'), 'ENV-GEMINI');
  assert.strictEqual(normalizeEnvironment('Google Gemini'), 'ENV-GEMINI');
  assert.strictEqual(normalizeEnvironment('gemini-1.5-flash'), 'ENV-GEMINI');

  assert.strictEqual(normalizeEnvironment('perplexity'), 'ENV-PERPLEXITY');
  assert.strictEqual(normalizeEnvironment('Perplexity AI'), 'ENV-PERPLEXITY');
  assert.strictEqual(normalizeEnvironment('sonar'), 'ENV-PERPLEXITY');

  // Unknown environment alias must throw E010
  assert.throws(() => {
    normalizeEnvironment('unknown-llm-engine');
  }, (err) => err.code === ERROR_CODES.ENVIRONMENT_MISMATCH);
});

// -------------------------------------------------------------
// Test D: 60 T1 observations remain exactly 60
// -------------------------------------------------------------
runTest('Test D', '60 T1 observations remain exactly 60 in canonical storage', () => {
  const observations = dal.listObservations().filter(o => o.run_id === 'RUN-M08-1-T1-REF');
  assert.strictEqual(observations.length, 60, `Expected 60 observations, found ${observations.length}`);

  const counts = { 'ENV-CHATGPT': 0, 'ENV-GEMINI': 0, 'ENV-PERPLEXITY': 0 };
  for (const obs of observations) {
    assert.ok(counts[obs.environment_id] !== undefined);
    counts[obs.environment_id]++;
    assert.strictEqual(obs.is_immutable, true);
  }
  assert.strictEqual(counts['ENV-CHATGPT'], 20);
  assert.strictEqual(counts['ENV-GEMINI'], 20);
  assert.strictEqual(counts['ENV-PERPLEXITY'], 20);
});

// -------------------------------------------------------------
// Test E: 60 T1 evidence records remain 1:1 traceable
// -------------------------------------------------------------
runTest('Test E', '60 T1 evidence records remain 1:1 traceable to observations', () => {
  const observations = dal.listObservations().filter(o => o.run_id === 'RUN-M08-1-T1-REF');
  const evidenceList = dal.listEvidence().filter(e => e.evidence_id.startsWith('EVD-VIS-T1-'));

  assert.strictEqual(evidenceList.length, 60);

  for (const obs of observations) {
    const evd = dal.loadEntity('visibility_evidence', obs.raw_response_id);
    assert.ok(evd, `Evidence ${obs.raw_response_id} missing for obs ${obs.observation_id}`);
    assert.strictEqual(evd.observation_id, obs.observation_id);
    assert.ok(evd.raw_response && evd.raw_response.length > 0);
  }
});

// -------------------------------------------------------------
// Test F: No duplicate observation identity exists
// -------------------------------------------------------------
runTest('Test F', 'No duplicate observation identity exists in canonical storage', () => {
  const observations = dal.listObservations().filter(o => o.run_id === 'RUN-M08-1-T1-REF');
  const seenIdentities = new Set();

  for (const obs of observations) {
    const key = `${obs.run_id}|${obs.environment_id}|${obs.prompt_id}`;
    assert.ok(!seenIdentities.has(key), `Duplicate observation identity found: ${key}`);
    seenIdentities.add(key);
  }

  assert.strictEqual(seenIdentities.size, 60);
});

// -------------------------------------------------------------
// Test G: T1 remains strictly separate from T2
// -------------------------------------------------------------
runTest('Test G', 'T1 Reference run remains strictly separate from T2 intervention', () => {
  const runT1 = dal.loadEntity('measurement_run', 'RUN-M08-1-T1-REF');
  assert.ok(runT1);
  assert.strictEqual(runT1.run_type, 'CONTROL');
  assert.strictEqual(runT1.intervention_id, null);

  const observations = dal.listObservations().filter(o => o.run_id === 'RUN-M08-1-T1-REF');
  for (const obs of observations) {
    assert.ok(obs.intervention_id === null || obs.intervention_id === undefined);
  }
});

// -------------------------------------------------------------
// Test H: T2 remains associated with T2-INT-01 (rejects INT-T2-01)
// -------------------------------------------------------------
runTest('Test H', 'T2 remains associated with canonical T2-INT-01 (rejects INT-T2-01)', () => {
  assert.doesNotThrow(() => {
    dal.assertValidInterventionId('T2-INT-01');
  });

  assert.throws(() => {
    dal.assertValidInterventionId('INT-T2-01');
  }, /Invalid intervention identifier/);
});

// -------------------------------------------------------------
// Test I: UNVERIFIED states remain unchanged as valid first-class states
// -------------------------------------------------------------
runTest('Test I', 'UNVERIFIED states remain unchanged as valid first-class states', () => {
  const observations = dal.listObservations().filter(o => o.run_id === 'RUN-M08-1-T1-REF');

  for (const obs of observations) {
    assert.strictEqual(obs.retrieval, 'UNVERIFIED', 'All T1 retrievals must be UNVERIFIED');
  }

  // Normalization must preserve UNVERIFIED without converting to NO or FALSE
  const normalized = normalizeObservation({
    prompt_id: 'P01',
    environment: 'ChatGPT',
    run_id: 'RUN-TEST-001',
    retrieval: 'UNVERIFIED'
  });
  assert.strictEqual(normalized.observation.retrieval, 'UNVERIFIED');
});

// -------------------------------------------------------------
// Test J: URLs are never inferred from brand or domain
// -------------------------------------------------------------
runTest('Test J', 'URLs are never inferred from brand or domain (zero data fabrication)', () => {
  const normalized = normalizeObservation({
    prompt_id: 'P01',
    environment: 'ChatGPT',
    run_id: 'RUN-TEST-001',
    source_title: 'LOCATRIA Knowledge Base',
    source_domain: 'locatria.com',
    source_url: 'URL not visible'
  });

  // source_url must be null, never constructed as https://locatria.com
  assert.strictEqual(normalized.evidence.source_url, null);

  // Invalid URL format throws URL_INTEGRITY_ERROR
  assert.throws(() => {
    normalizeObservation({
      prompt_id: 'P01',
      environment: 'ChatGPT',
      run_id: 'RUN-TEST-001',
      source_url: 'not-a-valid-url'
    });
  }, (err) => err.code === ERROR_CODES.URL_INTEGRITY_ERROR);
});

// -------------------------------------------------------------
// Test K: Re-running ingestion is idempotent
// -------------------------------------------------------------
runTest('Test K', 'Re-running ingestion is idempotent (recognizes existing records without duplicate)', () => {
  // Build items matching existing T1 records
  const existingObservations = dal.listObservations().filter(o => o.run_id === 'RUN-M08-1-T1-REF').slice(0, 3);
  const items = existingObservations.map(o => {
    const evd = dal.loadEntity('visibility_evidence', o.raw_response_id);
    return {
      prompt_id: o.prompt_id,
      environment: o.environment_id,
      run_id: o.run_id,
      observation_id: o.observation_id,
      evidence_id: o.raw_response_id,
      raw_response: evd.raw_response,
      mention: o.mention,
      citation_signal: o.citation_signal,
      verified_citation: o.verified_citation,
      retrieval: o.retrieval
    };
  });

  const batchResult = executeIngestion({
    ingestion_id: 'ING-IDEMPOTENT-TEST',
    source_id: 'SRC-M08-1-T1-CHATGPT-RAW',
    run_id: 'RUN-M08-1-T1-REF',
    ingestion_type: 'VERIFICATION_RE-INGESTION',
    operator: 'FOUNDER'
  }, items);

  assert.strictEqual(batchResult.status, 'COMPLETED');
  assert.strictEqual(batchResult.success_count, 3);
  assert.strictEqual(batchResult.error_count, 0);
  assert.strictEqual(batchResult.idempotent, true);
  assert.strictEqual(batchResult.created_entities.observations.length, 0);
});

// -------------------------------------------------------------
// Test L: A deliberately altered source is detected (E002 SOURCE_CHANGED)
// -------------------------------------------------------------
runTest('Test L', 'A deliberately altered source is detected (E002 SOURCE_CHANGED)', () => {
  // Test with registered source pointing to a temporary modified file
  const testSourceDef = {
    source_id: 'SRC-TEST-TAMPER-CHECK',
    source_name: 'Tamper Detection Test Source',
    source_type: 'RAW_MODEL_RESPONSE_EXPORT',
    source_path: 'package.json', // real file
    source_level: 'S1',
    source_role: 'HISTORICAL_ARCHIVE',
    source_format: 'JSON',
    status: 'ACTIVE'
  };

  const registered = registerSource(testSourceDef);
  assert.ok(registered.source_hash);

  // In memory, mutate source hash to simulate file tampering
  const tamperedSource = {
    ...registered,
    source_hash: '0000000000000000000000000000000000000000000000000000000000000000'
  };
  dal.saveEntity('source', tamperedSource);

  assert.throws(() => {
    executeIngestion({
      ingestion_id: 'ING-TAMPER-TEST',
      source_id: 'SRC-TEST-TAMPER-CHECK',
      run_id: 'RUN-M08-1-T1-REF'
    }, []);
  }, (err) => err.code === ERROR_CODES.SOURCE_CHANGED);

  // Clean up fixture entity
  dal.deleteEntity('source', 'SRC-TEST-TAMPER-CHECK');
});

// -------------------------------------------------------------
// Test M: A prompt wording mismatch is detected (E009 PROMPT_TEXT_MISMATCH)
// -------------------------------------------------------------
runTest('Test M', 'A prompt wording mismatch is detected (E009 PROMPT_TEXT_MISMATCH)', () => {
  assert.throws(() => {
    validatePromptAgainstCanonical('P01', 'What is AI visibility for multinational corporations?');
  }, (err) => err.code === ERROR_CODES.PROMPT_TEXT_MISMATCH);

  assert.throws(() => {
    normalizeObservation({
      prompt_id: 'P02',
      prompt_text: 'How do AI search engines discover local businesses?', // Candidate Set 1 mismatch
      environment: 'ChatGPT',
      run_id: 'RUN-TEST-001'
    });
  }, (err) => err.code === ERROR_CODES.PROMPT_TEXT_MISMATCH);
});

// -------------------------------------------------------------
// Test N: A duplicate observation is rejected (E007 DUPLICATE_OBSERVATION)
// -------------------------------------------------------------
runTest('Test N', 'A duplicate observation in the same batch is rejected (E007)', () => {
  const duplicateBatch = [
    { prompt_id: 'P01', environment: 'ChatGPT', run_id: 'RUN-M08-1-T1-REF' },
    { prompt_id: 'P01', environment: 'ChatGPT', run_id: 'RUN-M08-1-T1-REF' }
  ];

  const result = executeIngestion({
    ingestion_id: 'ING-DUP-TEST',
    source_id: 'SRC-M08-1-T1-CHATGPT-RAW',
    run_id: 'RUN-M08-1-T1-REF'
  }, duplicateBatch);

  assert.ok(['FAILED', 'REJECTED'].includes(result.status));
  assert.ok(result.errors.some(e => e.code === ERROR_CODES.DUPLICATE_OBSERVATION));
});

// -------------------------------------------------------------
// Test O: A missing provenance reference is rejected (E006 INVALID_REFERENCE)
// -------------------------------------------------------------
runTest('Test O', 'A missing run or prompt reference is rejected (E006)', () => {
  assert.throws(() => {
    executeIngestion({
      ingestion_id: 'ING-INVALID-REF-TEST',
      source_id: 'SRC-M08-1-T1-CHATGPT-RAW',
      run_id: 'RUN-NON-EXISTENT-XYZ'
    }, []);
  }, (err) => err.code === ERROR_CODES.INVALID_REFERENCE);

  assert.throws(() => {
    validatePromptAgainstCanonical('P99_NON_EXISTENT', 'Some text');
  }, (err) => err.code === ERROR_CODES.INVALID_REFERENCE);
});

// -------------------------------------------------------------
// Test P: Historical mutation attempt on completed run is blocked (E015)
// -------------------------------------------------------------
runTest('Test P', 'Historical mutation attempt on completed run is blocked (E015)', () => {
  // Attempting to newly inject a new observation into RUN-M08-1-T1-REF
  const result = executeIngestion({
    ingestion_id: 'ING-MUTATION-ATTEMPT',
    source_id: 'SRC-M08-1-T1-CHATGPT-RAW',
    run_id: 'RUN-M08-1-T1-REF'
  }, [
    {
      observation_id: 'OBS-T1-CHATGPT-NEW-UNAUTHORIZED',
      prompt_id: 'P01',
      environment: 'ChatGPT',
      raw_response: 'Unauthorized injected response'
    }
  ]);

  assert.strictEqual(result.status, 'REJECTED');
  assert.ok(result.errors.some(e => e.code === ERROR_CODES.HISTORICAL_RECORD_MUTATION));
});

// -------------------------------------------------------------
// Test Q: Composite visibility score rejection invariant preserved
// -------------------------------------------------------------
runTest('Test Q', 'Composite visibility score rejection invariant preserved (Invariant A03)', () => {
  assert.throws(() => {
    normalizeObservation({
      prompt_id: 'P01',
      environment: 'ChatGPT',
      run_id: 'RUN-TEST-001',
      composite_score: 95.5 // strictly forbidden
    });
  }, /GOVERNANCE_ERROR/);
});

console.log('------------------------------------------------------------');
console.log(`TOTAL INGESTION TESTS  : ${passedTests + failedTests}`);
console.log(`PASSED TESTS           : ${passedTests} ✓`);
console.log(`FAILED TESTS           : ${failedTests} ✗`);
console.log('------------------------------------------------------------\n');

if (failedTests > 0) {
  console.error('[ERROR] Ingestion pipeline tests failed!');
  process.exit(1);
} else {
  console.log('[SUCCESS] All M08.2 Ingestion, Normalization & Audit Pipeline tests passed cleanly!\n');
}
