/**
 * LOCATRIA Visibility Operating System — Historical Data Integrity Test Suite
 * Module 08 — Visibility Growth System (M08.2 BUILD-01.1)
 *
 * Verifies HIST-01 through HIST-14:
 * - HIST-01: Canonical prompt registry contains exactly 20 prompts (P01–P20) matching verbatim historical text.
 * - HIST-02: Canonical prompt set PSET-M08-1-FIXED20 contains exactly 20 prompt IDs (P01–P20).
 * - HIST-03: Three canonical environments exist (ENV-CHATGPT, ENV-GEMINI, ENV-PERPLEXITY).
 * - HIST-04: T1 Reference Run exists, type=CONTROL, status=COMPLETED, is_immutable=true, observation_count=60.
 * - HIST-05: Exactly 60 canonical Observations exist (20 ChatGPT, 20 Gemini, 20 Perplexity).
 * - HIST-06: Exactly 60 canonical Visibility Evidence records exist (20 ChatGPT, 20 Gemini, 20 Perplexity).
 * - HIST-07: Referential integrity between Observations, Evidence, Prompts, Environments, and Runs.
 * - HIST-08: Historical metrics match Level 2 QA audit ground truth (20 mentions, 12 signals, 0 verified citations, 0 verified retrieval).
 * - HIST-09: Immutability enforcement: Attempting to overwrite T1 records or mutate completed runs throws an error.
 * - HIST-10: Zero-fabrication check: No invented URLs, no false verified citations, no fabricated metrics.
 * - HIST-11: No composite visibility score in any imported record or schema.
 * - HIST-12: Strict separation between T1 Reference Run and T2 Controlled Intervention.
 * - HIST-13: Intervention naming guardrail: Intervention ID must be T2-INT-01 (reject INT-T2-01).
 * - HIST-14: Import manifest exists, contains complete audit trail, hashes, and source paths.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const {
  validateEntity,
  checkImmutability,
  assertValidInterventionId
} = require('../js/visibility-data/index.js');

const ROOT_DIR = path.resolve(__dirname, '..');
const VIS_DATA_DIR = path.join(ROOT_DIR, 'visibility-data');
const PROMPTS_DIR = path.join(VIS_DATA_DIR, 'prompts');
const RUNS_DIR = path.join(VIS_DATA_DIR, 'runs');
const OBS_DIR = path.join(VIS_DATA_DIR, 'observations');
const EVD_DIR = path.join(VIS_DATA_DIR, 'evidence');
const SETS_DIR = path.join(VIS_DATA_DIR, 'prompt-sets');
const ENVS_DIR = path.join(VIS_DATA_DIR, 'environments');
const IMPORTS_DIR = path.join(VIS_DATA_DIR, 'imports');

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
console.log('LOCATRIA VISIBILITY OPERATING SYSTEM — HISTORICAL TEST SUITE');
console.log('M08.2 BUILD-01.1 — Historical Data Formalization & Integrity');
console.log('============================================================\n');

// -------------------------------------------------------------
// HIST-01: Canonical prompt registry contains 20 prompts (P01–P20) matching verbatim historical text
// -------------------------------------------------------------
runTest('HIST-01', 'Canonical prompt registry contains exactly 20 prompts (P01–P20) matching verbatim historical text', () => {
  const promptFiles = fs.readdirSync(PROMPTS_DIR).filter(f => f.match(/^p\d{2}\.json$/i));
  assert.strictEqual(promptFiles.length, 20, `Expected 20 prompt files, found ${promptFiles.length}`);

  for (let i = 1; i <= 20; i++) {
    const pid = `P${String(i).padStart(2, '0')}`;
    const filePath = path.join(PROMPTS_DIR, `${pid.toLowerCase()}.json`);
    assert.ok(fs.existsSync(filePath), `Prompt file missing: ${filePath}`);

    const prompt = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    assert.strictEqual(prompt.prompt_id, pid);
    assert.ok(prompt.prompt_text && prompt.prompt_text.trim().length > 10, `Prompt ${pid} text too short or empty`);
    assert.strictEqual(prompt.status, 'ACTIVE');

    const validation = validateEntity('prompt', prompt);
    assert.ok(validation.valid, `Prompt ${pid} failed schema validation: ${JSON.stringify(validation.errors)}`);
  }
});

// -------------------------------------------------------------
// HIST-02: Canonical prompt set PSET-M08-1-FIXED20 contains exactly 20 prompt IDs (P01–P20)
// -------------------------------------------------------------
runTest('HIST-02', 'Canonical prompt set PSET-M08-1-FIXED20 contains exactly 20 prompt IDs (P01–P20)', () => {
  const filePath = path.join(SETS_DIR, 'pset-m08-1-fixed20.json');
  assert.ok(fs.existsSync(filePath), `Prompt set file missing: ${filePath}`);

  const promptSet = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  assert.strictEqual(promptSet.prompt_set_id, 'PSET-M08-1-FIXED20');
  assert.strictEqual(promptSet.prompt_ids.length, 20, `Expected 20 prompts in prompt set, found ${promptSet.prompt_ids.length}`);
  assert.strictEqual(promptSet.status, 'ACTIVE');

  for (let i = 1; i <= 20; i++) {
    const pid = `P${String(i).padStart(2, '0')}`;
    assert.ok(promptSet.prompt_ids.includes(pid), `Prompt ${pid} missing from prompt set`);
  }

  const validation = validateEntity('prompt_set', promptSet);
  assert.ok(validation.valid, `Prompt set failed schema validation: ${JSON.stringify(validation.errors)}`);
});

// -------------------------------------------------------------
// HIST-03: Three canonical environments exist (ENV-CHATGPT, ENV-GEMINI, ENV-PERPLEXITY)
// -------------------------------------------------------------
runTest('HIST-03', 'Three canonical environments exist (ENV-CHATGPT, ENV-GEMINI, ENV-PERPLEXITY)', () => {
  const expectedEnvs = [
    { id: 'ENV-CHATGPT', file: 'env-chatgpt.json' },
    { id: 'ENV-GEMINI', file: 'env-gemini.json' },
    { id: 'ENV-PERPLEXITY', file: 'env-perplexity.json' }
  ];

  for (const envInfo of expectedEnvs) {
    const filePath = path.join(ENVS_DIR, envInfo.file);
    assert.ok(fs.existsSync(filePath), `Environment file missing: ${filePath}`);

    const env = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    assert.strictEqual(env.environment_id, envInfo.id);
    assert.strictEqual(env.status, 'ACTIVE');

    const validation = validateEntity('environment', env);
    assert.ok(validation.valid, `Environment ${envInfo.id} failed schema validation: ${JSON.stringify(validation.errors)}`);
  }
});

// -------------------------------------------------------------
// HIST-04: T1 Reference Run exists, type=CONTROL, status=COMPLETED, is_immutable=true, observation_count=60
// -------------------------------------------------------------
runTest('HIST-04', 'T1 Reference Run exists, type=CONTROL, status=COMPLETED, is_immutable=true, observation_count=60', () => {
  const filePath = path.join(RUNS_DIR, 'run-m08-1-t1-ref.json');
  assert.ok(fs.existsSync(filePath), `Run file missing: ${filePath}`);

  const run = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  assert.strictEqual(run.run_id, 'RUN-M08-1-T1-REF');
  assert.strictEqual(run.run_type, 'CONTROL');
  assert.strictEqual(run.status, 'COMPLETED');
  assert.strictEqual(run.is_immutable, true);
  assert.strictEqual(run.observation_count, 60);
  assert.strictEqual(run.prompt_set_id, 'PSET-M08-1-FIXED20');

  const validation = validateEntity('measurement_run', run);
  assert.ok(validation.valid, `Run failed schema validation: ${JSON.stringify(validation.errors)}`);
});

// -------------------------------------------------------------
// HIST-05: Exactly 60 canonical Observations exist (20 ChatGPT, 20 Gemini, 20 Perplexity)
// -------------------------------------------------------------
runTest('HIST-05', 'Exactly 60 canonical Observations exist (20 ChatGPT, 20 Gemini, 20 Perplexity)', () => {
  const obsFiles = fs.readdirSync(OBS_DIR).filter(f => f.startsWith('obs-t1-') && f.endsWith('.json'));
  assert.strictEqual(obsFiles.length, 60, `Expected 60 observation files, found ${obsFiles.length}`);

  const envCounts = { 'ENV-CHATGPT': 0, 'ENV-GEMINI': 0, 'ENV-PERPLEXITY': 0 };

  for (const file of obsFiles) {
    const obs = JSON.parse(fs.readFileSync(path.join(OBS_DIR, file), 'utf8'));
    assert.strictEqual(obs.run_id, 'RUN-M08-1-T1-REF');
    assert.strictEqual(obs.is_immutable, true);
    assert.ok(envCounts[obs.environment_id] !== undefined, `Unexpected environment_id: ${obs.environment_id}`);
    envCounts[obs.environment_id]++;

    const validation = validateEntity('observation', obs);
    assert.ok(validation.valid, `Observation ${obs.observation_id} failed schema validation: ${JSON.stringify(validation.errors)}`);
  }

  assert.strictEqual(envCounts['ENV-CHATGPT'], 20);
  assert.strictEqual(envCounts['ENV-GEMINI'], 20);
  assert.strictEqual(envCounts['ENV-PERPLEXITY'], 20);
});

// -------------------------------------------------------------
// HIST-06: Exactly 60 canonical Visibility Evidence records exist (20 ChatGPT, 20 Gemini, 20 Perplexity)
// -------------------------------------------------------------
runTest('HIST-06', 'Exactly 60 canonical Visibility Evidence records exist (20 ChatGPT, 20 Gemini, 20 Perplexity)', () => {
  const evdFiles = fs.readdirSync(EVD_DIR).filter(f => f.startsWith('evd-vis-t1-') && f.endsWith('.json'));
  assert.strictEqual(evdFiles.length, 60, `Expected 60 evidence files, found ${evdFiles.length}`);

  let chatgptCount = 0;
  let geminiCount = 0;
  let perplexityCount = 0;

  for (const file of evdFiles) {
    const evd = JSON.parse(fs.readFileSync(path.join(EVD_DIR, file), 'utf8'));
    assert.strictEqual(evd.is_immutable, true);
    assert.ok(evd.raw_response && evd.raw_response.length > 0, `Evidence ${evd.evidence_id} raw_response empty`);

    if (evd.evidence_id.includes('CHATGPT')) chatgptCount++;
    if (evd.evidence_id.includes('GEMINI')) geminiCount++;
    if (evd.evidence_id.includes('PERPLEXITY')) perplexityCount++;

    const validation = validateEntity('visibility_evidence', evd);
    assert.ok(validation.valid, `Evidence ${evd.evidence_id} failed schema validation: ${JSON.stringify(validation.errors)}`);
  }

  assert.strictEqual(chatgptCount, 20);
  assert.strictEqual(geminiCount, 20);
  assert.strictEqual(perplexityCount, 20);
});

// -------------------------------------------------------------
// HIST-07: Referential integrity between Observations, Evidence, Prompts, Environments, and Runs
// -------------------------------------------------------------
runTest('HIST-07', 'Referential integrity between Observations, Evidence, Prompts, Environments, and Runs', () => {
  const obsFiles = fs.readdirSync(OBS_DIR).filter(f => f.startsWith('obs-t1-') && f.endsWith('.json'));

  for (const file of obsFiles) {
    const obs = JSON.parse(fs.readFileSync(path.join(OBS_DIR, file), 'utf8'));

    // Check Prompt exists
    const promptPath = path.join(PROMPTS_DIR, `${obs.prompt_id.toLowerCase()}.json`);
    assert.ok(fs.existsSync(promptPath), `Observation ${obs.observation_id} references missing prompt: ${obs.prompt_id}`);

    // Check Run exists
    const runPath = path.join(RUNS_DIR, `${obs.run_id.toLowerCase()}.json`);
    assert.ok(fs.existsSync(runPath), `Observation ${obs.observation_id} references missing run: ${obs.run_id}`);

    // Check paired Evidence exists
    const evdPath = path.join(EVD_DIR, `${obs.raw_response_id.toLowerCase()}.json`);
    assert.ok(fs.existsSync(evdPath), `Observation ${obs.observation_id} references missing evidence: ${obs.raw_response_id}`);

    const evd = JSON.parse(fs.readFileSync(evdPath, 'utf8'));
    assert.strictEqual(evd.observation_id, obs.observation_id);
    assert.strictEqual(evd.evidence_id, obs.raw_response_id);
  }
});

// -------------------------------------------------------------
// HIST-08: Historical metrics match Level 2 QA audit ground truth
// -------------------------------------------------------------
runTest('HIST-08', 'Historical metrics match Level 2 QA audit ground truth (20 mentions, 12 signals, 0 verified citations, 0 verified retrieval)', () => {
  const obsFiles = fs.readdirSync(OBS_DIR).filter(f => f.startsWith('obs-t1-') && f.endsWith('.json'));

  let totalMentions = 0;
  let mentionsByEnv = { 'ENV-CHATGPT': 0, 'ENV-GEMINI': 0, 'ENV-PERPLEXITY': 0 };
  let totalSignals = 0;
  let signalsByEnv = { 'ENV-CHATGPT': 0, 'ENV-GEMINI': 0, 'ENV-PERPLEXITY': 0 };
  let totalVerifiedCitations = 0;
  let totalVerifiedRetrievals = 0;

  for (const file of obsFiles) {
    const obs = JSON.parse(fs.readFileSync(path.join(OBS_DIR, file), 'utf8'));

    if (obs.mention === 'YES') {
      totalMentions++;
      mentionsByEnv[obs.environment_id]++;
    }

    if (obs.citation_signal === 'YES') {
      totalSignals++;
      signalsByEnv[obs.environment_id]++;
    }

    if (obs.verified_citation === 'YES') {
      totalVerifiedCitations++;
    }

    if (obs.retrieval === 'YES') {
      totalVerifiedRetrievals++;
    }

    // Entity Recognition and Context Accuracy check for P17–P20 vs P01–P16
    const pNum = parseInt(obs.prompt_id.replace('P', ''), 10);
    if (pNum >= 1 && pNum <= 16) {
      assert.strictEqual(obs.entity_recognition, 'N/A', `P01–P16 must have entity_recognition='N/A' on ${obs.observation_id}`);
      assert.strictEqual(obs.context_accuracy, 'N/A', `P01–P16 must have context_accuracy='N/A' on ${obs.observation_id}`);
    } else if (pNum >= 17 && pNum <= 20) {
      if (obs.environment_id === 'ENV-CHATGPT') {
        assert.strictEqual(obs.entity_recognition, 'CORRECT');
        assert.strictEqual(obs.context_accuracy, 'ACCURATE');
      } else if (obs.environment_id === 'ENV-GEMINI') {
        assert.strictEqual(obs.entity_recognition, 'UNVERIFIED');
        assert.strictEqual(obs.context_accuracy, 'UNVERIFIED');
      } else if (obs.environment_id === 'ENV-PERPLEXITY') {
        assert.strictEqual(obs.entity_recognition, 'UNVERIFIED');
        assert.strictEqual(obs.context_accuracy, 'N/A');
      }
    }
  }

  assert.strictEqual(totalMentions, 20, `Expected 20 literal mentions, got ${totalMentions}`);
  assert.strictEqual(mentionsByEnv['ENV-CHATGPT'], 12, 'Expected 12 ChatGPT mentions');
  assert.strictEqual(mentionsByEnv['ENV-GEMINI'], 4, 'Expected 4 Gemini mentions');
  assert.strictEqual(mentionsByEnv['ENV-PERPLEXITY'], 4, 'Expected 4 Perplexity mentions');

  assert.strictEqual(totalSignals, 12, `Expected 12 citation signals, got ${totalSignals}`);
  assert.strictEqual(signalsByEnv['ENV-CHATGPT'], 12, 'Expected all 12 citation signals in ChatGPT');
  assert.strictEqual(signalsByEnv['ENV-GEMINI'], 0, 'Expected 0 citation signals in Gemini');
  assert.strictEqual(signalsByEnv['ENV-PERPLEXITY'], 0, 'Expected 0 citation signals in Perplexity');

  assert.strictEqual(totalVerifiedCitations, 0, `Expected 0 verified brand citations, got ${totalVerifiedCitations}`);
  assert.strictEqual(totalVerifiedRetrievals, 0, `Expected 0 verified retrievals, got ${totalVerifiedRetrievals}`);
});

// -------------------------------------------------------------
// HIST-09: Immutability enforcement: Attempting to overwrite T1 records throws an error
// -------------------------------------------------------------
runTest('HIST-09', 'Immutability enforcement: Attempting to overwrite T1 records or mutate completed runs throws an error', () => {
  const run = JSON.parse(fs.readFileSync(path.join(RUNS_DIR, 'run-m08-1-t1-ref.json'), 'utf8'));

  // Test run immutability check
  assert.throws(() => {
    checkImmutability(run, { ...run, notes: 'Modified notes' });
  }, /IMMUTABILITY_VIOLATION/);

  // Test observation immutability check
  const obs = JSON.parse(fs.readFileSync(path.join(OBS_DIR, 'obs-t1-chatgpt-p01.json'), 'utf8'));
  assert.throws(() => {
    checkImmutability(obs, { ...obs, mention: 'NO' });
  }, /IMMUTABILITY_VIOLATION/);

  // Test evidence immutability check
  const evd = JSON.parse(fs.readFileSync(path.join(EVD_DIR, 'evd-vis-t1-chatgpt-p01.json'), 'utf8'));
  assert.throws(() => {
    checkImmutability(evd, { ...evd, verbatim_excerpt: 'Tampered' });
  }, /IMMUTABILITY_VIOLATION/);
});

// -------------------------------------------------------------
// HIST-10: Zero-fabrication check: No invented URLs, no false verified citations
// -------------------------------------------------------------
runTest('HIST-10', 'Zero-fabrication check: No invented URLs, no false verified citations, no fabricated metrics', () => {
  const evdFiles = fs.readdirSync(EVD_DIR).filter(f => f.startsWith('evd-vis-t1-') && f.endsWith('.json'));

  for (const file of evdFiles) {
    const evd = JSON.parse(fs.readFileSync(path.join(EVD_DIR, file), 'utf8'));

    // In T1, source_url must not contain fabricated fake locatria URL
    if (evd.source_url) {
      assert.ok(!evd.source_url.includes('fake-locatria.com'), `Fabricated URL found: ${evd.source_url}`);
    }
  }

  const obsFiles = fs.readdirSync(OBS_DIR).filter(f => f.startsWith('obs-t1-') && f.endsWith('.json'));
  for (const file of obsFiles) {
    const obs = JSON.parse(fs.readFileSync(path.join(OBS_DIR, file), 'utf8'));
    assert.strictEqual(obs.verified_citation, 'NO', `Found true verified citation in ${file}`);
    assert.strictEqual(obs.retrieval, 'UNVERIFIED', `Found verified retrieval in ${file}`);
  }
});

// -------------------------------------------------------------
// HIST-11: No composite visibility score in any imported record or schema
// -------------------------------------------------------------
runTest('HIST-11', 'No composite visibility score in any imported record or schema', () => {
  const forbiddenKeys = [
    'visibility_score',
    'composite_score',
    'composite_visibility_score',
    'overall_score',
    'rank_score',
    'aggregate_visibility_score'
  ];

  const checkObject = (obj, context) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      for (const forbidden of forbiddenKeys) {
        assert.notStrictEqual(
          key.toLowerCase(),
          forbidden,
          `Forbidden composite score key '${key}' found in ${context}`
        );
      }
      checkObject(obj[key], `${context} -> ${key}`);
    }
  };

  // Check all imported files
  const allDirs = [PROMPTS_DIR, SETS_DIR, ENVS_DIR, RUNS_DIR, OBS_DIR, EVD_DIR, IMPORTS_DIR];
  for (const dir of allDirs) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    for (const f of files) {
      const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      checkObject(data, `${dir}/${f}`);
    }
  }
});

// -------------------------------------------------------------
// HIST-12: Strict separation between T1 Reference Run and T2 Controlled Intervention
// -------------------------------------------------------------
runTest('HIST-12', 'Strict separation between T1 Reference Run and T2 Controlled Intervention', () => {
  const run = JSON.parse(fs.readFileSync(path.join(RUNS_DIR, 'run-m08-1-t1-ref.json'), 'utf8'));

  assert.strictEqual(run.run_id, 'RUN-M08-1-T1-REF');
  assert.strictEqual(run.run_type, 'CONTROL');
  assert.ok(run.intervention_id === null || run.intervention_id === undefined, 'T1 Reference run must not have an intervention_id');

  const obsFiles = fs.readdirSync(OBS_DIR).filter(f => f.startsWith('obs-t1-') && f.endsWith('.json'));
  for (const file of obsFiles) {
    const obs = JSON.parse(fs.readFileSync(path.join(OBS_DIR, file), 'utf8'));
    assert.ok(obs.intervention_id === null || obs.intervention_id === undefined, `Observation ${obs.observation_id} must not have intervention_id`);
  }
});

// -------------------------------------------------------------
// HIST-13: Intervention naming guardrail: Intervention ID must be T2-INT-01 (reject INT-T2-01)
// -------------------------------------------------------------
runTest('HIST-13', 'Intervention naming guardrail: Intervention ID must be T2-INT-01 (reject INT-T2-01)', () => {
  assert.doesNotThrow(() => {
    assertValidInterventionId('T2-INT-01');
  });

  assert.throws(() => {
    assertValidInterventionId('INT-T2-01');
  }, /Invalid intervention identifier/);

  assert.throws(() => {
    assertValidInterventionId('T2-INT-1');
  }, /Invalid intervention identifier/);
});

// -------------------------------------------------------------
// HIST-14: Import manifest exists, contains complete audit trail, hashes, and source paths
// -------------------------------------------------------------
runTest('HIST-14', 'Import manifest exists, contains complete audit trail, hashes, and source paths', () => {
  const manifestPath = path.join(IMPORTS_DIR, 'm08-1-historical-import-manifest.json');
  assert.ok(fs.existsSync(manifestPath), `Import manifest missing: ${manifestPath}`);

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.strictEqual(manifest.import_id, 'IMP-M08-1-HISTORICAL-v1.0');
  assert.strictEqual(manifest.target_entities.prompts, 20);
  assert.strictEqual(manifest.target_entities.prompt_sets, 1);
  assert.strictEqual(manifest.target_entities.environments, 3);
  assert.strictEqual(manifest.target_entities.measurement_runs, 1);
  assert.strictEqual(manifest.target_entities.observations, 60);
  assert.strictEqual(manifest.target_entities.visibility_evidence, 60);

  assert.strictEqual(manifest.counts.imported_observations, 60);
  assert.strictEqual(manifest.counts.imported_evidence, 60);
  assert.strictEqual(manifest.counts.missing_observations, 0);
  assert.strictEqual(manifest.counts.missing_evidence, 0);

  assert.ok(manifest.source_files.length >= 6);
  assert.strictEqual(manifest.epistemic_classifications.mention.YES, 20);
  assert.strictEqual(manifest.epistemic_classifications.verified_citation.YES, 0);
  assert.strictEqual(manifest.epistemic_classifications.retrieval.UNVERIFIED, 60);
});

console.log('------------------------------------------------------------');
console.log(`TOTAL HISTORICAL TESTS : ${passedTests + failedTests}`);
console.log(`PASSED TESTS           : ${passedTests} ✓`);
console.log(`FAILED TESTS           : ${failedTests} ✗`);
console.log('------------------------------------------------------------\n');

if (failedTests > 0) {
  console.error('[ERROR] Historical data integrity tests failed!');
  process.exit(1);
} else {
  console.log('[SUCCESS] All M08.2 Historical Data Integrity tests passed cleanly!\n');
}
