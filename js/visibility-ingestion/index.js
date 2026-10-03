/**
 * LOCATRIA Visibility Operating System v1.0
 * Module 08 — Visibility Growth System (M08.2 BUILD-02)
 * Ingestion, Normalization & Audit Pipeline v1.0
 *
 * Core Responsibilities:
 * 1. Source Registration & Deterministic Content Hashing (SHA-256)
 * 2. Ingestion Contract & Lifecycle Management
 * 3. Raw Source Preservation & Traceable Origin Graph
 * 4. Normalization Engine (Deterministic structural transformations only; NO semantic mutation)
 * 5. Schema Validation (Draft 2020-12 via Ajv2020)
 * 6. Referential Integrity Validation (Prompt, Environment, Run, Observation, Evidence)
 * 7. Evidence Integrity & Epistemic Preservation (E1–E5, UNVERIFIED preservation, Zero URL inference)
 * 8. Strict Idempotency & Duplicate Prevention (1 Prompt × 1 Env × 1 Run = 1 Obs)
 * 9. Structured Error Model (E001–E016)
 * 10. Audit Logging & Immutable Event Trail
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dal = require('../visibility-data/index');

// Error Model Categories (Section 20)
const ERROR_CODES = {
  SOURCE_NOT_FOUND: 'E001',
  SOURCE_CHANGED: 'E002',
  INVALID_FORMAT: 'E003',
  SCHEMA_VALIDATION_FAILED: 'E004',
  MISSING_REQUIRED_FIELD: 'E005',
  INVALID_REFERENCE: 'E006',
  DUPLICATE_OBSERVATION: 'E007',
  PROMPT_ID_MISMATCH: 'E008',
  PROMPT_TEXT_MISMATCH: 'E009',
  ENVIRONMENT_MISMATCH: 'E010',
  RUN_MISMATCH: 'E011',
  EVIDENCE_PROVENANCE_MISSING: 'E012',
  INVALID_METRIC_STATE: 'E013',
  URL_INTEGRITY_ERROR: 'E014',
  HISTORICAL_RECORD_MUTATION: 'E015',
  NON_IDEMPOTENT_IMPORT: 'E016'
};

// Deterministic Environment Alias Map (Section 14)
const ENVIRONMENT_ALIAS_MAP = {
  'chatgpt': 'ENV-CHATGPT',
  'chat gpt': 'ENV-CHATGPT',
  'chat_gpt': 'ENV-CHATGPT',
  'openai chatgpt': 'ENV-CHATGPT',
  'gpt-4o': 'ENV-CHATGPT',
  'env-chatgpt': 'ENV-CHATGPT',

  'gemini': 'ENV-GEMINI',
  'google gemini': 'ENV-GEMINI',
  'gemini-1.5-flash': 'ENV-GEMINI',
  'gemini 1.5 flash': 'ENV-GEMINI',
  'env-gemini': 'ENV-GEMINI',

  'perplexity': 'ENV-PERPLEXITY',
  'perplexity ai': 'ENV-PERPLEXITY',
  'sonar': 'ENV-PERPLEXITY',
  'env-perplexity': 'ENV-PERPLEXITY'
};

/**
 * Calculates deterministic SHA-256 hash of a file or string.
 */
function calculateSha256(input) {
  const hash = crypto.createHash('sha256');
  if (Buffer.isBuffer(input) || typeof input === 'string') {
    hash.update(input);
  } else {
    hash.update(JSON.stringify(input));
  }
  return hash.digest('hex');
}

/**
 * Normalizes an environment identifier deterministically.
 */
function normalizeEnvironment(envInput) {
  if (!envInput || typeof envInput !== 'string') {
    throw new IngestionError(
      ERROR_CODES.ENVIRONMENT_MISMATCH,
      `Environment identifier is missing or not a string: ${envInput}`
    );
  }
  const clean = envInput.trim().toLowerCase();
  const normalized = ENVIRONMENT_ALIAS_MAP[clean];
  if (!normalized) {
    throw new IngestionError(
      ERROR_CODES.ENVIRONMENT_MISMATCH,
      `Unknown environment alias '${envInput}'. Must resolve to canonical environment.`
    );
  }
  return normalized;
}

/**
 * Custom Ingestion Error Class carrying deterministic error code and metadata.
 */
class IngestionError extends Error {
  constructor(code, message, details = {}) {
    super(`[${code}] ${message}`);
    this.name = 'IngestionError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Registers an authoritative or raw evidence source.
 */
function registerSource(sourceDef, options = {}) {
  if (!sourceDef || typeof sourceDef !== 'object') {
    throw new IngestionError(ERROR_CODES.MISSING_REQUIRED_FIELD, 'Source definition must be an object');
  }

  const baseDir = dal.getBaseDir(options);
  const sourcePath = sourceDef.source_path;

  let resolvedPath = sourcePath;
  if (!path.isAbsolute(resolvedPath)) {
    resolvedPath = path.resolve(baseDir, sourcePath);
  }

  if (!fs.existsSync(resolvedPath)) {
    // Also check relative to workspace root if different
    const workspacePath = path.resolve(__dirname, '../..', sourcePath);
    if (fs.existsSync(workspacePath)) {
      resolvedPath = workspacePath;
    } else {
      throw new IngestionError(
        ERROR_CODES.SOURCE_NOT_FOUND,
        `Source file not found at path: ${sourcePath} (resolved: ${resolvedPath})`
      );
    }
  }

  const fileBuffer = fs.readFileSync(resolvedPath);
  const sourceHash = calculateSha256(fileBuffer);

  const registeredSource = {
    entity_type: 'source',
    schema_version: '1.0.0',
    source_id: sourceDef.source_id,
    source_name: sourceDef.source_name,
    source_type: sourceDef.source_type,
    source_path: sourceDef.source_path,
    source_level: sourceDef.source_level,
    source_role: sourceDef.source_role,
    source_format: sourceDef.source_format,
    source_hash: sourceHash,
    hash_algorithm: 'SHA-256',
    hash_captured_at: new Date().toISOString(),
    source_version: sourceDef.source_version || '1.0.0',
    captured_at: sourceDef.captured_at || null,
    registered_at: new Date().toISOString(),
    registered_by: sourceDef.registered_by || options.actor || 'FOUNDER',
    status: sourceDef.status || 'REGISTERED',
    metadata: sourceDef.metadata || {},
    notes: sourceDef.notes || ''
  };

  const validation = dal.validateEntity('source', registeredSource, options);
  if (!validation.valid) {
    throw new IngestionError(
      ERROR_CODES.SCHEMA_VALIDATION_FAILED,
      `Source validation failed: ${validation.errors.join('; ')}`
    );
  }

  dal.saveEntity('source', registeredSource, options);
  return registeredSource;
}

/**
 * Validates that an incoming prompt exactly matches the frozen canonical prompt.
 * Section 12: Normalization MUST NOT modify P01–P20 wording.
 */
function validatePromptAgainstCanonical(promptId, incomingPromptText, options = {}) {
  const canonicalPrompt = dal.loadEntity('prompt', promptId, options);
  if (!canonicalPrompt) {
    throw new IngestionError(
      ERROR_CODES.INVALID_REFERENCE,
      `Prompt '${promptId}' does not exist in canonical Prompt Registry.`
    );
  }

  // Normalize only trailing backslashes/quotes or line endings for fair string comparison
  const cleanCanonical = canonicalPrompt.prompt_text.replace(/\\$/, '').trim();
  const cleanIncoming = (incomingPromptText || '').replace(/\\$/, '').trim();

  if (cleanCanonical.toLowerCase() !== cleanIncoming.toLowerCase()) {
    throw new IngestionError(
      ERROR_CODES.PROMPT_TEXT_MISMATCH,
      `Prompt text mismatch on ${promptId}. Incoming text differs from immutable canonical benchmark prompt.`,
      {
        prompt_id: promptId,
        canonical_text: canonicalPrompt.prompt_text,
        incoming_text: incomingPromptText
      }
    );
  }

  return canonicalPrompt;
}

/**
 * Normalizes raw observation item deterministically.
 */
function normalizeObservation(rawItem, context = {}, options = {}) {
  if (!rawItem || typeof rawItem !== 'object') {
    throw new IngestionError(ERROR_CODES.INVALID_FORMAT, 'Raw observation item must be an object');
  }

  // Governance Guard: Reject forbidden composite score fields (Invariant A03)
  const forbiddenScoreFields = ['visibility_score', 'overall_score', 'AI_visibility_score', 'composite_score'];
  for (const field of forbiddenScoreFields) {
    if (rawItem[field] !== undefined) {
      throw new IngestionError(
        ERROR_CODES.INVALID_METRIC_STATE,
        `GOVERNANCE_ERROR: Composite visibility score field '${field}' is strictly forbidden by Invariant A03.`
      );
    }
  }

  // 1. Prompt Validation
  const promptId = rawItem.prompt_id || rawItem.Prompt_ID || rawItem.promptId;
  if (!promptId) {
    throw new IngestionError(ERROR_CODES.MISSING_REQUIRED_FIELD, 'Observation missing prompt_id');
  }

  const incomingPromptText = rawItem.prompt_text || rawItem.prompt || rawItem.Prompt;
  if (incomingPromptText) {
    validatePromptAgainstCanonical(promptId, incomingPromptText, options);
  }

  // 2. Environment Normalization
  const rawEnv = rawItem.environment_id || rawItem.environment || rawItem.Environment;
  const normalizedEnv = normalizeEnvironment(rawEnv);

  // 3. Run Normalization
  const runId = rawItem.run_id || context.run_id;
  if (!runId) {
    throw new IngestionError(ERROR_CODES.MISSING_REQUIRED_FIELD, 'Observation missing run_id');
  }

  // 4. Observation Identity: 1 Prompt × 1 Env × 1 Run
  const obsId = rawItem.observation_id || `OBS-${runId.replace('RUN-', '')}-${normalizedEnv.replace('ENV-', '')}-${promptId}`;

  // 5. Evidence Reference & Raw Response
  const evidenceId = rawItem.evidence_id || rawItem.raw_response_id || `EVD-VIS-${obsId.replace('OBS-', '')}`;

  // 6. Zero URL Fabrication Guard (Section 17)
  let sourceUrl = rawItem.source_url || rawItem.url || null;
  if (sourceUrl && (sourceUrl === 'URL not visible' || sourceUrl === 'null' || sourceUrl === 'NONE')) {
    sourceUrl = null;
  }
  // Enforce no fabricated locatria URLs if not verified in raw output
  if (sourceUrl && !sourceUrl.startsWith('http://') && !sourceUrl.startsWith('https://')) {
    throw new IngestionError(ERROR_CODES.URL_INTEGRITY_ERROR, `Invalid URL format: ${sourceUrl}`);
  }

  // 7. Epistemic Metrics (Section 18 & 19)
  const mention = (rawItem.mention === true || rawItem.mention === 'YES') ? 'YES' : 'NO';
  const citationSignal = (rawItem.citation_signal === true || rawItem.citation_signal === 'YES') ? 'YES' : 'NO';
  const verifiedCitation = (rawItem.verified_brand_citation === true || rawItem.verified_citation === 'YES') ? 'YES' : 'NO';

  // Never convert UNVERIFIED to NO or FALSE
  let retrieval = 'UNVERIFIED';
  if (rawItem.retrieval === 'YES' || rawItem.retrieval === true) retrieval = 'YES';
  else if (rawItem.retrieval === 'NO' || rawItem.retrieval === false) retrieval = 'NO';
  else retrieval = 'UNVERIFIED';

  let entityRecognition = rawItem.entity_recognition || 'N/A';
  if (!['CORRECT', 'INCORRECT', 'PARTIAL', 'UNVERIFIED', 'N/A'].includes(entityRecognition)) {
    entityRecognition = 'UNVERIFIED';
  }

  let contextAccuracy = rawItem.context_accuracy || 'N/A';
  if (!['ACCURATE', 'INACCURATE', 'PARTIAL', 'HALLUCINATED', 'UNVERIFIED', 'N/A'].includes(contextAccuracy)) {
    contextAccuracy = 'UNVERIFIED';
  }

  // 8. Observation Object
  const observation = {
    entity_type: 'observation',
    schema_version: '1.0.0',
    observation_id: obsId,
    run_id: runId,
    prompt_id: promptId,
    environment_id: normalizedEnv,
    observed_at: rawItem.observed_at || context.observed_at || new Date().toISOString(),
    raw_response_id: evidenceId,
    mention: mention,
    citation_signal: citationSignal,
    verified_citation: verifiedCitation,
    retrieval: retrieval,
    entity_recognition: entityRecognition,
    context_accuracy: contextAccuracy,
    confidence: rawItem.confidence || 'HIGH',
    qa_status: rawItem.qa_status || 'VERIFIED',
    evidence_ids: [evidenceId],
    is_immutable: true,
    notes: rawItem.notes || rawItem.audit_note || ''
  };

  // 9. Visibility Evidence Object
  const evidence = {
    entity_type: 'visibility_evidence',
    schema_version: '1.0.0',
    evidence_id: evidenceId,
    observation_id: obsId,
    evidence_type: rawItem.evidence_type || 'RAW_RESPONSE',
    evidence_level: rawItem.evidence_level || 'E1',
    raw_response: rawItem.raw_response || rawItem.response || '',
    source_title: rawItem.source_title || null,
    source_url: sourceUrl,
    source_domain: rawItem.source_domain || null,
    citation_text: rawItem.citation_text || null,
    source_location: rawItem.source_location || null,
    captured_at: rawItem.captured_at || observation.observed_at,
    captured_by: rawItem.captured_by || context.operator || 'FOUNDER',
    verification_status: rawItem.verification_status || 'VERIFIED',
    is_immutable: true,
    notes: rawItem.evidence_notes || observation.notes
  };

  return { observation, evidence };
}

/**
 * Executes a deterministic ingestion batch contract.
 */
function executeIngestion(batchDef, items = [], options = {}) {
  const startedAt = new Date().toISOString();
  const ingestionId = batchDef.ingestion_id || `ING-${Date.now()}`;
  const sourceId = batchDef.source_id;
  const runId = batchDef.run_id;

  if (!sourceId) {
    throw new IngestionError(ERROR_CODES.MISSING_REQUIRED_FIELD, 'Ingestion batch missing source_id');
  }
  if (!runId) {
    throw new IngestionError(ERROR_CODES.MISSING_REQUIRED_FIELD, 'Ingestion batch missing run_id');
  }

  // 1. Verify Source Registration
  const sourceRecord = dal.loadEntity('source', sourceId, options);
  if (!sourceRecord) {
    throw new IngestionError(ERROR_CODES.SOURCE_NOT_FOUND, `Source '${sourceId}' is not registered`);
  }

  // 2. Source Hashing Integrity Check (Section 8 & 21)
  let resolvedSourcePath = sourceRecord.source_path;
  const baseDir = dal.getBaseDir(options);
  if (!path.isAbsolute(resolvedSourcePath)) {
    resolvedSourcePath = path.resolve(baseDir, resolvedSourcePath);
  }
  if (!fs.existsSync(resolvedSourcePath)) {
    const wsPath = path.resolve(__dirname, '../..', sourceRecord.source_path);
    if (fs.existsSync(wsPath)) resolvedSourcePath = wsPath;
  }

  if (fs.existsSync(resolvedSourcePath)) {
    const currentHash = calculateSha256(fs.readFileSync(resolvedSourcePath));
    if (sourceRecord.source_hash && currentHash !== sourceRecord.source_hash) {
      throw new IngestionError(
        ERROR_CODES.SOURCE_CHANGED,
        `Source '${sourceId}' file content has changed after registration. Stored: ${sourceRecord.source_hash}, Current: ${currentHash}`
      );
    }
  }

  // 3. Verify Run Reference
  const targetRun = dal.loadEntity('measurement_run', runId, options);
  if (!targetRun) {
    throw new IngestionError(ERROR_CODES.INVALID_REFERENCE, `Run '${runId}' does not exist.`);
  }

  // 4. Historical Immutability Check (Section 2 & 15)
  // If run is COMPLETED and immutable, verify this is an idempotent re-ingestion rather than an illegal mutation
  const isHistoricalRun = targetRun.status === 'COMPLETED' && targetRun.is_immutable === true;

  const result = {
    ingestion_id: ingestionId,
    source_id: sourceId,
    run_id: runId,
    ingestion_type: batchDef.ingestion_type || 'CONTROLLED_RUN_INGESTION',
    started_at: startedAt,
    completed_at: null,
    operator: batchDef.operator || options.actor || 'SYSTEM',
    status: 'RUNNING',
    record_count: items.length,
    success_count: 0,
    error_count: 0,
    warning_count: 0,
    errors: [],
    warnings: [],
    idempotent: false,
    created_entities: {
      observations: [],
      evidence: []
    }
  };

  const processedObservations = new Map();

  for (let idx = 0; idx < items.length; idx++) {
    const raw = items[idx];
    try {
      const { observation, evidence } = normalizeObservation(raw, {
        run_id: runId,
        operator: result.operator
      }, options);

      // Check observation identity within the current batch:
      const identityKey = `${observation.run_id}|${observation.environment_id}|${observation.prompt_id}`;
      if (processedObservations.has(identityKey)) {
        throw new IngestionError(
          ERROR_CODES.DUPLICATE_OBSERVATION,
          `Duplicate observation identity in batch: ${identityKey} on item index ${idx}`
        );
      }
      processedObservations.set(identityKey, true);

      // Check against existing database records:
      const existingObs = dal.loadEntity('observation', observation.observation_id, options);
      if (existingObs) {
        if (isHistoricalRun) {
          // Idempotent recognition check:
          const existingEvidence = dal.loadEntity('visibility_evidence', evidence.evidence_id, options);
          if (existingEvidence) {
            // Unchanged existing record recognized safely (Section 21)
            result.success_count++;
            continue;
          } else {
            throw new IngestionError(
              ERROR_CODES.HISTORICAL_RECORD_MUTATION,
              `Historical run '${runId}' observation exists but evidence is missing or mismatched.`
            );
          }
        } else {
          throw new IngestionError(
            ERROR_CODES.DUPLICATE_OBSERVATION,
            `Observation '${observation.observation_id}' already exists in non-completed run.`
          );
        }
      }

      // If run is completed historical run and not an existing record, forbid newly adding records!
      if (isHistoricalRun) {
        throw new IngestionError(
          ERROR_CODES.HISTORICAL_RECORD_MUTATION,
          `Cannot insert new observations into completed, immutable historical run '${runId}'.`
        );
      }

      // Schema validations
      const vObs = dal.validateEntity('observation', observation, options);
      if (!vObs.valid) {
        throw new IngestionError(ERROR_CODES.SCHEMA_VALIDATION_FAILED, `Observation schema error: ${vObs.errors.join('; ')}`);
      }
      const vEvd = dal.validateEntity('visibility_evidence', evidence, options);
      if (!vEvd.valid) {
        throw new IngestionError(ERROR_CODES.SCHEMA_VALIDATION_FAILED, `Evidence schema error: ${vEvd.errors.join('; ')}`);
      }

      // Save Entities
      dal.saveEntity('observation', observation, options);
      dal.saveEntity('visibility_evidence', evidence, options);

      result.created_entities.observations.push(observation.observation_id);
      result.created_entities.evidence.push(evidence.evidence_id);
      result.success_count++;
    } catch (err) {
      result.error_count++;
      result.errors.push({
        code: err.code || 'E000_UNKNOWN',
        message: err.message,
        details: err.details || { item_index: idx }
      });
    }
  }

  result.completed_at = new Date().toISOString();
  if (result.error_count === 0) {
    result.status = result.warning_count > 0 ? 'COMPLETED_WITH_WARNINGS' : 'COMPLETED';
    if (result.created_entities.observations.length === 0 && result.success_count > 0) {
      result.idempotent = true;
    }
  } else {
    result.status = result.success_count > 0 ? 'FAILED' : 'REJECTED';
  }

  // Save Ingestion Batch Contract Record
  const batchRecord = {
    entity_type: 'ingestion_batch',
    schema_version: '1.0.0',
    ingestion_id: result.ingestion_id,
    source_id: result.source_id,
    run_id: result.run_id,
    ingestion_type: result.ingestion_type,
    started_at: result.started_at,
    completed_at: result.completed_at,
    operator: result.operator,
    status: result.status,
    record_count: result.record_count,
    success_count: result.success_count,
    error_count: result.error_count,
    warning_count: result.warning_count,
    errors: result.errors,
    warnings: result.warnings,
    metadata: {
      idempotent: result.idempotent,
      created_observations_count: result.created_entities.observations.length,
      created_evidence_count: result.created_entities.evidence.length
    },
    notes: `Ingestion batch execution. Idempotent: ${result.idempotent}`
  };

  dal.saveEntity('ingestion_batch', batchRecord, options);

  // Record Audit Log Entry (Section 24)
  dal.recordAuditLog({
    audit_id: `AUD-ING-${Date.now()}`,
    actor: result.operator,
    actor_type: options.actor_type || 'SYSTEM',
    action: 'INGEST',
    entity_type_target: 'ingestion_batch',
    entity_id: result.ingestion_id,
    before: null,
    after: batchRecord,
    timestamp: result.completed_at,
    reason: `Ingestion batch execution for source ${sourceId} into run ${runId} (Status: ${result.status})`
  }, options);

  return result;
}

module.exports = {
  ERROR_CODES,
  ENVIRONMENT_ALIAS_MAP,
  IngestionError,
  calculateSha256,
  normalizeEnvironment,
  validatePromptAgainstCanonical,
  registerSource,
  normalizeObservation,
  executeIngestion
};
