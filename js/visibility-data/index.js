/**
 * LOCATRIA Visibility Operating System v1.0
 * Data Access Layer (DAL) — Module 08 / M08.2
 *
 * Single Source of Truth: Canonical entity records in visibility-data/.
 * Schemas: schemas/visibility/*.schema.json.
 *
 * Strict Governance & Epistemic Invariants:
 * - NO composite visibility score (tolerance = 0).
 * - Immutable historical records: Completed runs, observations, and raw evidence cannot be overwritten.
 * - AI cannot delete raw evidence or historical observations.
 * - Canonical intervention identity: T2-INT-01 strictly enforced.
 * - Zero data fabrication: Authentic empty states preserved.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const Ajv2020 = require('ajv/dist/2020');
const addFormats = require('ajv-formats');

const rootDir = path.resolve(__dirname, '../..');
const defaultBaseDir = path.join(rootDir, 'visibility-data');
const defaultSchemaDir = path.join(rootDir, 'schemas', 'visibility');

const ENTITY_FOLDERS = {
  prompt: 'prompts',
  prompt_set: 'prompt-sets',
  environment: 'environments',
  measurement_run: 'runs',
  observation: 'observations',
  visibility_evidence: 'evidence',
  audit_log: 'audit',
  source: 'sources',
  ingestion_batch: 'ingestions',
  diagnosis: 'diagnoses',
  opportunity: 'opportunities',
  priority_assessment: 'priorities',
  founder_decision: 'decisions',
  action: 'actions',
  experiment: 'experiments',
  intervention: 'interventions',
  verification: 'verifications',
  learning: 'learnings',
  system_rule_candidate: 'system-rule-candidates',
  governance_issue: 'governance',
  governance_exception: 'exceptions',
  operating_review: 'reviews',
  change_request: 'change-requests',
  system_rule: 'system-rules',
  control_state: 'control-state'
};

const ID_FIELDS = {
  prompt: 'prompt_id',
  prompt_set: 'prompt_set_id',
  environment: 'environment_id',
  measurement_run: 'run_id',
  observation: 'observation_id',
  visibility_evidence: 'evidence_id',
  audit_log: 'audit_id',
  source: 'source_id',
  ingestion_batch: 'ingestion_id',
  diagnosis: 'diagnosis_id',
  opportunity: 'opportunity_id',
  priority_assessment: 'priority_assessment_id',
  founder_decision: 'decision_id',
  action: 'action_id',
  experiment: 'experiment_id',
  intervention: 'intervention_id',
  verification: 'verification_id',
  learning: 'learning_id',
  system_rule_candidate: 'candidate_id',
  governance_issue: 'governance_id',
  governance_exception: 'exception_id',
  operating_review: 'review_id',
  change_request: 'change_request_id',
  system_rule: 'system_rule_id',
  control_state: 'control_state_id'
};

const SCHEMA_FILES = {
  prompt: 'prompt.schema.json',
  prompt_set: 'prompt-set.schema.json',
  environment: 'environment.schema.json',
  measurement_run: 'measurement-run.schema.json',
  observation: 'observation.schema.json',
  visibility_evidence: 'visibility-evidence.schema.json',
  audit_log: 'audit-log.schema.json',
  source: 'source.schema.json',
  ingestion_batch: 'ingestion-contract.schema.json',
  diagnosis: 'diagnosis.schema.json',
  opportunity: 'opportunity.schema.json',
  priority_assessment: 'priority-assessment.schema.json',
  founder_decision: 'founder-decision.schema.json',
  action: 'action.schema.json',
  experiment: 'experiment.schema.json',
  intervention: 'intervention.schema.json',
  verification: 'verification.schema.json',
  learning: 'learning.schema.json',
  system_rule_candidate: 'system-rule-candidate.schema.json',
  governance_issue: 'governance.schema.json',
  governance_exception: 'exception.schema.json',
  operating_review: 'review.schema.json',
  change_request: 'change-request.schema.json',
  system_rule: 'system-rule.schema.json',
  control_state: 'control-state.schema.json'
};

// Initialize Ajv Draft 2020-12
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

const compiledValidators = {};

function getValidator(entityType, schemaDir = defaultSchemaDir) {
  const normType = entityType.toLowerCase();
  if (compiledValidators[normType]) {
    return compiledValidators[normType];
  }

  const schemaFile = SCHEMA_FILES[normType];
  if (!schemaFile) {
    throw new Error(`Unknown entity type for schema validation: ${entityType}`);
  }

  const schemaPath = path.join(schemaDir, schemaFile);
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found: ${schemaPath}`);
  }

  const schemaContent = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  const validator = ajv.compile(schemaContent);
  compiledValidators[normType] = validator;
  return validator;
}

function getBaseDir(options = {}) {
  return options.baseDir ? path.resolve(options.baseDir) : defaultBaseDir;
}

/**
 * Validates entity against its JSON schema.
 */
function validateEntity(entityType, entityData, options = {}) {
  if (!entityType || !entityData) {
    return { valid: false, errors: ['Missing entityType or entityData'] };
  }

  // Check for forbidden composite score fields (Critical Negative Test J / Invariant A03)
  const forbiddenScoreFields = ['visibility_score', 'overall_score', 'AI_visibility_score', 'composite_score'];
  for (const field of forbiddenScoreFields) {
    if (entityData[field] !== undefined) {
      return {
        valid: false,
        errors: [`GOVERNANCE_ERROR: Composite visibility score field '${field}' is strictly forbidden by Invariant A03.`]
      };
    }
  }

  // Check for canonical intervention ID guardrail
  if (entityData.intervention_id && entityData.intervention_id === 'INT-T2-01') {
    return {
      valid: false,
      errors: [`GOVERNANCE_ERROR: Invalid intervention identity 'INT-T2-01'. Canonical identity must be 'T2-INT-01'.`]
    };
  }

  try {
    const validator = getValidator(entityType, options.schemaDir);
    const valid = validator(entityData);
    if (!valid) {
      return {
        valid: false,
        errors: validator.errors.map(err => `${err.instancePath || 'root'} ${err.message}`)
      };
    }
    return { valid: true, errors: [] };
  } catch (err) {
    return { valid: false, errors: [err.message] };
  }
}

/**
 * Loads a single entity record by type and ID.
 */
function loadEntity(entityType, entityId, options = {}) {
  if (!entityType || !entityId) return null;
  const normType = entityType.toLowerCase();
  const folder = ENTITY_FOLDERS[normType];
  if (!folder) return null;

  const baseDir = getBaseDir(options);
  const candidates = [
    path.join(baseDir, folder, `${entityId}.json`),
    path.join(baseDir, folder, `${entityId.toLowerCase()}.json`),
    path.join(baseDir, `${entityId}.json`),
    path.join(baseDir, `${entityId.toLowerCase()}.json`),
    path.join(baseDir, '_fixtures', `${entityId}.json`),
    path.join(baseDir, '_fixtures', `${entityId.toLowerCase()}.json`)
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      try {
        const data = JSON.parse(fs.readFileSync(candidate, 'utf8'));
        if (data.entity_type === normType) {
          return data;
        }
      } catch (err) {
        console.error(`Error reading entity from ${candidate}:`, err.message);
        return null;
      }
    }
  }

  // Scan directories (target folder + _fixtures) if filename does not match ID directly
  const searchDirs = [
    path.join(baseDir, folder),
    path.join(baseDir, '_fixtures')
  ];

  const idField = ID_FIELDS[normType];

  for (const dir of searchDirs) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
      for (const f of files) {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
          if (data.entity_type === normType && data[idField] === entityId) {
            return data;
          }
        } catch (_) {}
      }
    }
  }

  return null;
}

/**
 * Lists all entities of a given type.
 */
function listEntities(entityType, options = {}) {
  const normType = entityType.toLowerCase();
  const folder = ENTITY_FOLDERS[normType];
  if (!folder) return [];

  const baseDir = getBaseDir(options);
  const targetDir = path.join(baseDir, folder);
  if (!fs.existsSync(targetDir)) return [];

  const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.json'));
  const entities = [];

  for (const f of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(targetDir, f), 'utf8'));
      entities.push(data);
    } catch (err) {
      console.error(`Error parsing ${f}:`, err.message);
    }
  }

  if (options.includeFixtures) {
    const fixtureDir = path.join(baseDir, '_fixtures');
    if (fs.existsSync(fixtureDir)) {
      const fixtureFiles = fs.readdirSync(fixtureDir).filter(f => f.endsWith('.json'));
      for (const f of fixtureFiles) {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(fixtureDir, f), 'utf8'));
          if (data.entity_type === normType) {
            entities.push(data);
          }
        } catch (_) {}
      }
    }
  }

  return entities;
}

function listPrompts(options = {}) { return listEntities('prompt', options); }
function listPromptSets(options = {}) { return listEntities('prompt_set', options); }
function listEnvironments(options = {}) { return listEntities('environment', options); }
function listRuns(options = {}) { return listEntities('measurement_run', options); }
function listObservations(options = {}) { return listEntities('observation', options); }
function listEvidence(options = {}) { return listEntities('visibility_evidence', options); }
function listAuditLogs(options = {}) { return listEntities('audit_log', options); }
function listSources(options = {}) { return listEntities('source', options); }
function listIngestionBatches(options = {}) { return listEntities('ingestion_batch', options); }
function listDiagnoses(options = {}) { return listEntities('diagnosis', options); }
function listOpportunities(options = {}) { return listEntities('opportunity', options); }
function listPriorityAssessments(options = {}) { return listEntities('priority_assessment', options); }
function listFounderDecisions(options = {}) { return listEntities('founder_decision', options); }
function listActions(options = {}) { return listEntities('action', options); }
function listExperiments(options = {}) { return listEntities('experiment', options); }
function listInterventions(options = {}) { return listEntities('intervention', options); }
function listVerifications(options = {}) { return listEntities('verification', options); }
function listLearnings(options = {}) { return listEntities('learning', options); }
function listSystemRuleCandidates(options = {}) { return listEntities('system_rule_candidate', options); }
function listGovernanceIssues(options = {}) { return listEntities('governance_issue', options); }
function listExceptions(options = {}) { return listEntities('governance_exception', options); }
function listReviews(options = {}) { return listEntities('operating_review', options); }
function listChangeRequests(options = {}) { return listEntities('change_request', options); }
function listSystemRules(options = {}) { return listEntities('system_rule', options); }
function listControlStates(options = {}) { return listEntities('control_state', options); }

/**
 * Resolves entity relationships and references.
 */
function resolveRelationship(entityType, entityId, targetType, options = {}) {
  const entity = loadEntity(entityType, entityId, options);
  if (!entity) return null;

  const normSource = entityType.toLowerCase();
  const normTarget = targetType.toLowerCase();

  // Run -> PromptSet
  if (normSource === 'measurement_run' && normTarget === 'prompt_set') {
    return loadEntity('prompt_set', entity.prompt_set_id, options);
  }

  // Observation -> Run
  if (normSource === 'observation' && normTarget === 'measurement_run') {
    return loadEntity('measurement_run', entity.run_id, options);
  }

  // Observation -> Prompt
  if (normSource === 'observation' && normTarget === 'prompt') {
    return loadEntity('prompt', entity.prompt_id, options);
  }

  // Observation -> Environment
  if (normSource === 'observation' && normTarget === 'environment') {
    return loadEntity('environment', entity.environment_id, options);
  }

  // Observation -> Evidence
  if (normSource === 'observation' && normTarget === 'visibility_evidence') {
    const baseDir = getBaseDir(options);
    const searchDirs = [
      path.join(baseDir, 'evidence'),
      path.join(baseDir, '_fixtures')
    ];
    const matches = [];
    for (const d of searchDirs) {
      if (fs.existsSync(d)) {
        const files = fs.readdirSync(d).filter(f => f.endsWith('.json'));
        for (const f of files) {
          try {
            const data = JSON.parse(fs.readFileSync(path.join(d, f), 'utf8'));
            if (data.entity_type === 'visibility_evidence' && data.observation_id === entity.observation_id) {
              matches.push(data);
            }
          } catch (_) {}
        }
      }
    }
    return matches;
  }

  // Evidence -> Observation
  if (normSource === 'visibility_evidence' && normTarget === 'observation') {
    return loadEntity('observation', entity.observation_id, options);
  }

  // PromptSet -> Prompts
  if (normSource === 'prompt_set' && normTarget === 'prompt') {
    return (entity.prompt_ids || []).map(pid => loadEntity('prompt', pid, options)).filter(Boolean);
  }

  // Diagnosis -> Observation
  if (normSource === 'diagnosis' && normTarget === 'observation') {
    return (entity.observation_refs || []).map(id => loadEntity('observation', id, options)).filter(Boolean);
  }

  // Diagnosis -> Visibility Evidence
  if (normSource === 'diagnosis' && normTarget === 'visibility_evidence') {
    return (entity.evidence_refs || []).map(id => loadEntity('visibility_evidence', id, options)).filter(Boolean);
  }

  // Diagnosis -> Environment
  if (normSource === 'diagnosis' && normTarget === 'environment') {
    return (entity.environment_refs || []).map(id => loadEntity('environment', id, options)).filter(Boolean);
  }

  // Diagnosis -> Measurement Run
  if (normSource === 'diagnosis' && normTarget === 'measurement_run') {
    return (entity.run_refs || []).map(id => loadEntity('measurement_run', id, options)).filter(Boolean);
  }

  // Opportunity -> Diagnosis
  if (normSource === 'opportunity' && normTarget === 'diagnosis') {
    return (entity.diagnosis_refs || []).map(id => loadEntity('diagnosis', id, options)).filter(Boolean);
  }

  // Opportunity -> Observation (via direct refs or referenced diagnoses)
  if (normSource === 'opportunity' && normTarget === 'observation') {
    const direct = (entity.observation_refs || []).map(id => loadEntity('observation', id, options)).filter(Boolean);
    if (direct.length > 0) return direct;
    const diagObsIds = new Set();
    for (const dId of (entity.diagnosis_refs || [])) {
      const d = loadEntity('diagnosis', dId, options);
      if (d && d.observation_refs) {
        d.observation_refs.forEach(id => diagObsIds.add(id));
      }
    }
    return Array.from(diagObsIds).map(id => loadEntity('observation', id, options)).filter(Boolean);
  }

  // Opportunity -> Visibility Evidence (via direct refs or referenced diagnoses)
  if (normSource === 'opportunity' && normTarget === 'visibility_evidence') {
    const direct = (entity.evidence_refs || []).map(id => loadEntity('visibility_evidence', id, options)).filter(Boolean);
    if (direct.length > 0) return direct;
    const diagEvdIds = new Set();
    for (const dId of (entity.diagnosis_refs || [])) {
      const d = loadEntity('diagnosis', dId, options);
      if (d && d.evidence_refs) {
        d.evidence_refs.forEach(id => diagEvdIds.add(id));
      }
    }
    return Array.from(diagEvdIds).map(id => loadEntity('visibility_evidence', id, options)).filter(Boolean);
  }

  // Priority Assessment -> Opportunity
  if (normSource === 'priority_assessment' && normTarget === 'opportunity') {
    return loadEntity('opportunity', entity.opportunity_id, options);
  }

  // Priority Assessment -> Visibility Evidence
  if (normSource === 'priority_assessment' && normTarget === 'visibility_evidence') {
    if (Array.isArray(entity.evidence_refs) && entity.evidence_refs.length > 0) {
      return entity.evidence_refs.map(id => loadEntity('visibility_evidence', id, options)).filter(Boolean);
    }
    return resolveRelationship('opportunity', entity.opportunity_id, 'visibility_evidence', options);
  }

  // Founder Decision -> Priority Assessment
  if (normSource === 'founder_decision' && normTarget === 'priority_assessment') {
    return loadEntity('priority_assessment', entity.priority_assessment_id, options);
  }

  // Founder Decision -> Opportunity
  if (normSource === 'founder_decision' && normTarget === 'opportunity') {
    return loadEntity('opportunity', entity.opportunity_id, options);
  }

  // Founder Decision -> Diagnosis
  if (normSource === 'founder_decision' && normTarget === 'diagnosis') {
    return resolveRelationship('opportunity', entity.opportunity_id, 'diagnosis', options);
  }

  // Founder Decision -> Observation
  if (normSource === 'founder_decision' && normTarget === 'observation') {
    return resolveRelationship('opportunity', entity.opportunity_id, 'observation', options);
  }

  // Founder Decision -> Visibility Evidence
  if (normSource === 'founder_decision' && normTarget === 'visibility_evidence') {
    if (Array.isArray(entity.evidence_refs) && entity.evidence_refs.length > 0) {
      return entity.evidence_refs.map(id => loadEntity('visibility_evidence', id, options)).filter(Boolean);
    }
    return resolveRelationship('opportunity', entity.opportunity_id, 'visibility_evidence', options);
  }

  // Action -> Opportunity
  if (normSource === 'action' && normTarget === 'opportunity') {
    return loadEntity('opportunity', entity.opportunity_id, options);
  }

  // Action -> Founder Decision
  if (normSource === 'action' && normTarget === 'founder_decision') {
    return loadEntity('founder_decision', entity.founder_decision_id, options);
  }

  // Action -> Priority Assessment
  if (normSource === 'action' && normTarget === 'priority_assessment') {
    const decision = loadEntity('founder_decision', entity.founder_decision_id, options);
    if (!decision) return null;
    return loadEntity('priority_assessment', decision.priority_assessment_id, options);
  }

  // Action -> Dependencies
  if (normSource === 'action' && normTarget === 'action') {
    return (entity.dependency_refs || []).map(id => loadEntity('action', id, options)).filter(Boolean);
  }

  // Action -> Visibility Evidence
  if (normSource === 'action' && normTarget === 'visibility_evidence') {
    return resolveRelationship('opportunity', entity.opportunity_id, 'visibility_evidence', options);
  }

  // Action -> Diagnosis
  if (normSource === 'action' && normTarget === 'diagnosis') {
    return resolveRelationship('opportunity', entity.opportunity_id, 'diagnosis', options);
  }

  // Action -> Observation
  if (normSource === 'action' && normTarget === 'observation') {
    return resolveRelationship('opportunity', entity.opportunity_id, 'observation', options);
  }

  // Experiment -> Opportunity
  if (normSource === 'experiment' && normTarget === 'opportunity') {
    return loadEntity('opportunity', entity.opportunity_id, options);
  }

  // Experiment -> Founder Decision
  if (normSource === 'experiment' && normTarget === 'founder_decision') {
    return loadEntity('founder_decision', entity.founder_decision_id, options);
  }

  // Experiment -> Intervention
  if (normSource === 'experiment' && normTarget === 'intervention') {
    return loadEntity('intervention', entity.intervention_id, options);
  }

  // Experiment -> Measurement Run (reference run)
  if (normSource === 'experiment' && normTarget === 'measurement_run') {
    return loadEntity('measurement_run', entity.reference_run_id, options);
  }

  // Experiment -> Prompt Set
  if (normSource === 'experiment' && normTarget === 'prompt_set') {
    return loadEntity('prompt_set', entity.prompt_set_id, options);
  }

  // Experiment -> Environment
  if (normSource === 'experiment' && normTarget === 'environment') {
    return (entity.environments || []).map(id => loadEntity('environment', id, options)).filter(Boolean);
  }

  // Experiment -> Visibility Evidence
  if (normSource === 'experiment' && normTarget === 'visibility_evidence') {
    return resolveRelationship('opportunity', entity.opportunity_id, 'visibility_evidence', options);
  }

  // Experiment -> Diagnosis
  if (normSource === 'experiment' && normTarget === 'diagnosis') {
    return resolveRelationship('opportunity', entity.opportunity_id, 'diagnosis', options);
  }

  // Experiment -> Observation
  if (normSource === 'experiment' && normTarget === 'observation') {
    return resolveRelationship('opportunity', entity.opportunity_id, 'observation', options);
  }

  // Verification -> Subject (Action or Experiment)
  if (normSource === 'verification' && (normTarget === 'action' || normTarget === 'experiment')) {
    const subjectNormType = entity.subject_type === 'ACTION' ? 'action' : 'experiment';
    if (normTarget === subjectNormType) {
      return loadEntity(subjectNormType, entity.subject_id, options);
    }
    return null;
  }

  // Verification -> Founder Decision
  if (normSource === 'verification' && normTarget === 'founder_decision') {
    return loadEntity('founder_decision', entity.founder_decision_id, options);
  }

  // Verification -> Evidence
  if (normSource === 'verification' && normTarget === 'visibility_evidence') {
    return (entity.evidence_refs || []).map(id => loadEntity('visibility_evidence', id, options)).filter(Boolean);
  }

  // Learning -> Verification
  if (normSource === 'learning' && normTarget === 'verification') {
    return (entity.source_verification_refs || []).map(id => loadEntity('verification', id, options)).filter(Boolean);
  }

  // Learning -> Evidence
  if (normSource === 'learning' && normTarget === 'visibility_evidence') {
    return (entity.evidence_refs || []).map(id => loadEntity('visibility_evidence', id, options)).filter(Boolean);
  }

  // SystemRuleCandidate -> Learning
  if (normSource === 'system_rule_candidate' && normTarget === 'learning') {
    return (entity.source_learning_refs || []).map(id => loadEntity('learning', id, options)).filter(Boolean);
  }

  // SystemRuleCandidate -> Evidence
  if (normSource === 'system_rule_candidate' && normTarget === 'visibility_evidence') {
    return (entity.evidence_refs || []).map(id => loadEntity('visibility_evidence', id, options)).filter(Boolean);
  }

  // SystemRule -> Learning
  if (normSource === 'system_rule' && normTarget === 'learning') {
    return (entity.source_learning_refs || []).map(id => loadEntity('learning', id, options)).filter(Boolean);
  }

  // SystemRule -> Evidence
  if (normSource === 'system_rule' && normTarget === 'visibility_evidence') {
    return (entity.evidence_refs || []).map(id => loadEntity('visibility_evidence', id, options)).filter(Boolean);
  }

  // GovernanceIssue -> Evidence
  if (normSource === 'governance_issue' && normTarget === 'visibility_evidence') {
    return (entity.evidence_refs || []).map(id => loadEntity('visibility_evidence', id, options)).filter(Boolean);
  }

  // GovernanceException -> Subject
  if (normSource === 'governance_exception' && normTarget === 'subject') {
    const subType = (entity.subject_type || '').toLowerCase();
    return loadEntity(subType, entity.subject_id, options);
  }

  // OperatingReview -> Evidence
  if (normSource === 'operating_review' && normTarget === 'visibility_evidence') {
    return (entity.evidence_refs || []).map(id => loadEntity('visibility_evidence', id, options)).filter(Boolean);
  }

  // ChangeRequest -> Evidence
  if (normSource === 'change_request' && normTarget === 'visibility_evidence') {
    return (entity.evidence_refs || []).map(id => loadEntity('visibility_evidence', id, options)).filter(Boolean);
  }

  return null;
}

/**
 * Saves an entity to canonical storage with immutability and governance guards.
 */
function saveEntity(entityType, entityData, options = {}) {
  const normType = entityType.toLowerCase();
  const folder = ENTITY_FOLDERS[normType];
  const idField = ID_FIELDS[normType];

  if (!folder || !idField) {
    throw new Error(`Unknown entity type: ${entityType}`);
  }

  const entityId = entityData[idField];
  if (!entityId) {
    throw new Error(`Entity missing required ID field: ${idField}`);
  }

  // Immutability Check: Existing immutable records can never be overwritten
  const existing = loadEntity(normType, entityId, options);
  if (existing) {
    // Negative Test C & Invariant A06:
    const isExceptionExpiring = normType === 'governance_exception' && existing.status === 'APPROVED' && entityData.status === 'EXPIRED';
    const isRuleRetiring = normType === 'system_rule' && existing.status === 'ACTIVE' && entityData.status === 'RETIRED';

    if ((existing.is_immutable === true && !isExceptionExpiring && !isRuleRetiring) || normType === 'observation' || normType === 'visibility_evidence') {
      throw new Error(`IMMUTABILITY_VIOLATION: Entity '${entityId}' of type '${normType}' is immutable and cannot be overwritten.`);
    }
    if (normType === 'measurement_run' && existing.status === 'COMPLETED') {
      throw new Error(`IMMUTABILITY_VIOLATION: Completed measurement run '${entityId}' is immutable and cannot be overwritten.`);
    }
    if (normType === 'diagnosis' && (existing.status === 'VALIDATED' || existing.is_immutable === true)) {
      throw new Error(`IMMUTABILITY_VIOLATION: Validated or immutable diagnosis '${entityId}' cannot be overwritten.`);
    }
    if (normType === 'opportunity' && (existing.status === 'QUALIFIED' || existing.is_immutable === true)) {
      throw new Error(`IMMUTABILITY_VIOLATION: Qualified or immutable opportunity '${entityId}' cannot be overwritten.`);
    }
    if (normType === 'priority_assessment') {
      if (existing.is_immutable === true) {
        throw new Error(`IMMUTABILITY_VIOLATION: Immutable priority assessment '${entityId}' cannot be overwritten.`);
      }
      const allDecisions = listEntities('founder_decision', { ...options, includeFixtures: true });
      const referencingDecision = allDecisions.find(d => d.priority_assessment_id === existing.priority_assessment_id);
      if (referencingDecision && referencingDecision.status === 'DECIDED') {
        throw new Error(`IMMUTABILITY_VIOLATION: Priority assessment '${entityId}' is referenced by finalized Founder Decision '${referencingDecision.decision_id}' and cannot be mutated.`);
      }
    }
    if (normType === 'founder_decision') {
      if (existing.status === 'DECIDED' || existing.is_immutable === true) {
        throw new Error(`IMMUTABILITY_VIOLATION: Finalized Founder Decision '${entityId}' is immutable and cannot be overwritten.`);
      }
    }
    if (normType === 'action') {
      if (existing.is_immutable === true || existing.status === 'READY_FOR_VERIFICATION') {
        throw new Error(`IMMUTABILITY_VIOLATION: Action '${entityId}' is immutable and cannot be overwritten.`);
      }
    }
    if (normType === 'experiment') {
      if (existing.is_immutable === true || existing.status === 'READY_FOR_VERIFICATION') {
        throw new Error(`IMMUTABILITY_VIOLATION: Experiment '${entityId}' is immutable and cannot be overwritten.`);
      }
    }
    if (normType === 'intervention') {
      if (existing.is_immutable === true || existing.intervention_id === 'T2-INT-01') {
        throw new Error(`IMMUTABILITY_VIOLATION: Canonical intervention '${entityId}' is immutable and cannot be overwritten.`);
      }
    }
    if (normType === 'verification') {
      if (existing.is_immutable === true || existing.status === 'VERIFIED') {
        throw new Error(`IMMUTABILITY_VIOLATION: Verified record '${entityId}' is immutable and cannot be overwritten.`);
      }
    }
    if (normType === 'learning') {
      if (existing.is_immutable === true || existing.status === 'VALIDATED') {
        throw new Error(`IMMUTABILITY_VIOLATION: Validated learning '${entityId}' is immutable and cannot be overwritten.`);
      }
    }
    if (normType === 'system_rule_candidate') {
      if (existing.is_immutable === true || existing.status === 'APPROVED') {
        throw new Error(`IMMUTABILITY_VIOLATION: Approved system rule candidate '${entityId}' is immutable and cannot be overwritten without revision.`);
      }
    }
    if (normType === 'system_rule') {
      if (existing.status === 'RETIRED' || existing.status === 'REJECTED') {
        throw new Error(`IMMUTABILITY_VIOLATION: Retired or rejected system rule '${entityId}' cannot be modified.`);
      }
      if (existing.status === 'ACTIVE' && entityData.status !== 'RETIRED') {
        throw new Error(`IMMUTABILITY_VIOLATION: Active system rule '${entityId}' is immutable and can only be retired.`);
      }
    }
    if (normType === 'governance_issue') {
      if (existing.is_immutable === true || existing.status === 'CLOSED') {
        throw new Error(`IMMUTABILITY_VIOLATION: Closed governance issue '${entityId}' is immutable and cannot be overwritten.`);
      }
    }
    if (normType === 'governance_exception') {
      if (existing.status === 'EXPIRED' || existing.status === 'REJECTED') {
        throw new Error(`IMMUTABILITY_VIOLATION: Expired or rejected exception '${entityId}' cannot be modified.`);
      }
      if (existing.status === 'APPROVED' && entityData.status !== 'EXPIRED') {
        throw new Error(`IMMUTABILITY_VIOLATION: Approved exception '${entityId}' is immutable and can only be expired.`);
      }
    }
    if (normType === 'environment') {
      if (existing.environment_id === 'ENV-CHATGPT' || existing.environment_id === 'ENV-GEMINI' || existing.environment_id === 'ENV-PERPLEXITY') {
        throw new Error(`IMMUTABILITY_VIOLATION: Canonical environment '${entityId}' is immutable and cannot be overwritten.`);
      }
    }
    if (normType === 'operating_review') {
      if (existing.is_immutable === true || existing.status === 'COMPLETED') {
        throw new Error(`IMMUTABILITY_VIOLATION: Completed operating review '${entityId}' is immutable and cannot be overwritten.`);
      }
    }
    if (normType === 'change_request') {
      if (existing.is_immutable === true || existing.status === 'APPROVED' || existing.status === 'IMPLEMENTED' || existing.status === 'VERIFIED') {
        throw new Error(`IMMUTABILITY_VIOLATION: Approved or implemented change request '${entityId}' is immutable and cannot be overwritten.`);
      }
    }
    if (normType === 'prompt_set') {
      if (existing.is_immutable === true || existing.prompt_set_id === 'PSET-M08-1-FIXED20') {
        throw new Error(`IMMUTABILITY_VIOLATION: Frozen prompt set '${entityId}' is immutable and cannot be overwritten.`);
      }
    }
    if (normType === 'prompt') {
      if (existing.is_immutable === true || (existing.prompt_id && /^P(0[1-9]|1[0-9]|20)$/.test(existing.prompt_id))) {
        throw new Error(`IMMUTABILITY_VIOLATION: Frozen benchmark prompt '${entityId}' is immutable and cannot be overwritten.`);
      }
    }
  }

  // Schema validation
  const validation = validateEntity(normType, entityData, options);
  if (!validation.valid) {
    throw new Error(`SCHEMA_VALIDATION_ERROR: ${validation.errors.join('; ')}`);
  }

  // Check relationship integrity where applicable
  if (normType === 'measurement_run' && entityData.prompt_set_id) {
    const pset = loadEntity('prompt_set', entityData.prompt_set_id, options);
    if (!pset) {
      throw new Error(`RELATIONSHIP_ERROR: Referenced prompt_set_id '${entityData.prompt_set_id}' does not exist.`);
    }
  }

  if (normType === 'observation') {
    const run = loadEntity('measurement_run', entityData.run_id, options);
    if (!run) {
      throw new Error(`RELATIONSHIP_ERROR: Referenced run_id '${entityData.run_id}' does not exist.`);
    }
    const prompt = loadEntity('prompt', entityData.prompt_id, options);
    if (!prompt) {
      throw new Error(`RELATIONSHIP_ERROR: Referenced prompt_id '${entityData.prompt_id}' does not exist.`);
    }
    const env = loadEntity('environment', entityData.environment_id, options);
    if (!env) {
      throw new Error(`RELATIONSHIP_ERROR: Referenced environment_id '${entityData.environment_id}' does not exist.`);
    }
  }

  if (normType === 'visibility_evidence' && entityData.observation_id) {
    const obs = loadEntity('observation', entityData.observation_id, options);
    if (!obs) {
      throw new Error(`RELATIONSHIP_ERROR: Referenced observation_id '${entityData.observation_id}' does not exist.`);
    }
  }

  if (normType === 'diagnosis') {
    for (const obsId of (entityData.observation_refs || [])) {
      const obs = loadEntity('observation', obsId, options);
      if (!obs) {
        throw new Error(`RELATIONSHIP_ERROR: Referenced observation_id '${obsId}' does not exist.`);
      }
    }
    for (const evdId of (entityData.evidence_refs || [])) {
      const evd = loadEntity('visibility_evidence', evdId, options);
      if (!evd) {
        throw new Error(`RELATIONSHIP_ERROR: Referenced evidence_id '${evdId}' does not exist.`);
      }
    }
    for (const envId of (entityData.environment_refs || [])) {
      const env = loadEntity('environment', envId, options);
      if (!env) {
        throw new Error(`RELATIONSHIP_ERROR: Referenced environment_id '${envId}' does not exist.`);
      }
    }
    for (const runId of (entityData.run_refs || [])) {
      const run = loadEntity('measurement_run', runId, options);
      if (!run) {
        throw new Error(`RELATIONSHIP_ERROR: Referenced run_id '${runId}' does not exist.`);
      }
    }
  }

  if (normType === 'opportunity') {
    for (const diagId of (entityData.diagnosis_refs || [])) {
      const diag = loadEntity('diagnosis', diagId, options);
      if (!diag) {
        throw new Error(`RELATIONSHIP_ERROR: Referenced diagnosis_id '${diagId}' does not exist.`);
      }
      if (entityData.status === 'QUALIFIED' || entityData.qualification_state === 'QUALIFIED') {
        if (diag.status !== 'VALIDATED') {
          throw new Error(`GATE_ERROR: Cannot qualify opportunity '${entityId}'. Referenced diagnosis '${diagId}' is in status '${diag.status}' (must be 'VALIDATED').`);
        }
      }
    }
  }

  if (normType === 'priority_assessment') {
    if (!entityData.opportunity_id) {
      throw new Error(`RELATIONSHIP_ERROR: Priority assessment missing required opportunity_id.`);
    }
    const opp = loadEntity('opportunity', entityData.opportunity_id, options);
    if (!opp) {
      throw new Error(`RELATIONSHIP_ERROR: Referenced opportunity_id '${entityData.opportunity_id}' does not exist.`);
    }
    if (opp.status !== 'QUALIFIED' && opp.qualification_state !== 'QUALIFIED') {
      throw new Error(`GATE_ERROR: Cannot assess priority for opportunity '${entityData.opportunity_id}'. Opportunity is in status '${opp.status}' (must be 'QUALIFIED').`);
    }
    if (Array.isArray(entityData.evidence_refs)) {
      for (const evdId of entityData.evidence_refs) {
        const evd = loadEntity('visibility_evidence', evdId, options);
        if (!evd) {
          throw new Error(`RELATIONSHIP_ERROR: Referenced evidence_id '${evdId}' does not exist.`);
        }
      }
    }
  }

  if (normType === 'founder_decision') {
    if (!entityData.opportunity_id) {
      throw new Error(`RELATIONSHIP_ERROR: Founder decision missing required opportunity_id.`);
    }
    const opp = loadEntity('opportunity', entityData.opportunity_id, options);
    if (!opp) {
      throw new Error(`RELATIONSHIP_ERROR: Referenced opportunity_id '${entityData.opportunity_id}' does not exist.`);
    }
    if (opp.status !== 'QUALIFIED' && opp.qualification_state !== 'QUALIFIED') {
      throw new Error(`GATE_ERROR: Cannot create Founder decision for unvalidated/unqualified opportunity '${entityData.opportunity_id}'.`);
    }
    if (!entityData.priority_assessment_id) {
      throw new Error(`RELATIONSHIP_ERROR: Founder decision missing required priority_assessment_id.`);
    }
    const pas = loadEntity('priority_assessment', entityData.priority_assessment_id, options);
    if (!pas) {
      throw new Error(`RELATIONSHIP_ERROR: Referenced priority_assessment_id '${entityData.priority_assessment_id}' does not exist.`);
    }
    if (Array.isArray(entityData.evidence_refs)) {
      for (const evdId of entityData.evidence_refs) {
        const evd = loadEntity('visibility_evidence', evdId, options);
        if (!evd) {
          throw new Error(`RELATIONSHIP_ERROR: Referenced evidence_id '${evdId}' does not exist.`);
        }
      }
    }
  }

  if (normType === 'action') {
    if (!entityData.opportunity_id) {
      throw new Error(`RELATIONSHIP_ERROR: Action missing required opportunity_id.`);
    }
    const opp = loadEntity('opportunity', entityData.opportunity_id, options);
    if (!opp) {
      throw new Error(`RELATIONSHIP_ERROR: Referenced opportunity_id '${entityData.opportunity_id}' does not exist.`);
    }
    if (opp.status !== 'QUALIFIED' && opp.qualification_state !== 'QUALIFIED') {
      throw new Error(`GATE_ERROR: Cannot create Action for unvalidated/unqualified opportunity '${entityData.opportunity_id}'.`);
    }

    if (!entityData.founder_decision_id) {
      throw new Error(`RELATIONSHIP_ERROR: Action missing required founder_decision_id.`);
    }
    const dec = loadEntity('founder_decision', entityData.founder_decision_id, options);
    if (!dec) {
      throw new Error(`RELATIONSHIP_ERROR: Referenced founder_decision_id '${entityData.founder_decision_id}' does not exist.`);
    }
    if (dec.status !== 'DECIDED') {
      throw new Error(`GATE_ERROR: Founder Decision '${entityData.founder_decision_id}' is '${dec.status}' (must be 'DECIDED').`);
    }

    const implementationStates = ['READY_FOR_IMPLEMENTATION', 'IN_PROGRESS', 'IMPLEMENTED', 'READY_FOR_VERIFICATION'];
    if (implementationStates.includes(entityData.status)) {
      if (dec.decision !== 'APPROVE') {
        throw new Error(`GATE_ERROR: Cannot transition action to '${entityData.status}'. Founder Decision '${entityData.founder_decision_id}' is '${dec.decision}' (must be 'APPROVE').`);
      }
      if (Array.isArray(entityData.dependency_refs) && entityData.dependency_refs.length > 0) {
        for (const depId of entityData.dependency_refs) {
          const depAction = loadEntity('action', depId, options);
          if (!depAction) {
            throw new Error(`RELATIONSHIP_ERROR: Referenced dependency action '${depId}' does not exist.`);
          }
          if (depAction.status !== 'IMPLEMENTED' && depAction.status !== 'READY_FOR_VERIFICATION') {
            throw new Error(`BLOCKING_DEPENDENCY: Action '${entityId}' cannot be '${entityData.status}' because prerequisite dependency '${depId}' is in status '${depAction.status}' (must be 'IMPLEMENTED').`);
          }
        }
      }
    }
  }

  if (normType === 'experiment') {
    if (!entityData.opportunity_id) {
      throw new Error(`RELATIONSHIP_ERROR: Experiment missing required opportunity_id.`);
    }
    const opp = loadEntity('opportunity', entityData.opportunity_id, options);
    if (!opp) {
      throw new Error(`RELATIONSHIP_ERROR: Referenced opportunity_id '${entityData.opportunity_id}' does not exist.`);
    }
    if (opp.status !== 'QUALIFIED' && opp.qualification_state !== 'QUALIFIED') {
      throw new Error(`GATE_ERROR: Cannot create Experiment for unvalidated/unqualified opportunity '${entityData.opportunity_id}'.`);
    }

    if (!entityData.founder_decision_id) {
      throw new Error(`RELATIONSHIP_ERROR: Experiment missing required founder_decision_id.`);
    }
    const dec = loadEntity('founder_decision', entityData.founder_decision_id, options);
    if (!dec) {
      throw new Error(`RELATIONSHIP_ERROR: Referenced founder_decision_id '${entityData.founder_decision_id}' does not exist.`);
    }
    if (dec.status !== 'DECIDED') {
      throw new Error(`GATE_ERROR: Founder Decision '${entityData.founder_decision_id}' is '${dec.status}' (must be 'DECIDED').`);
    }

    if (!entityData.reference_run_id) {
      throw new Error(`RELATIONSHIP_ERROR: Experiment missing required reference_run_id.`);
    }
    const run = loadEntity('measurement_run', entityData.reference_run_id, options);
    if (!run) {
      throw new Error(`RELATIONSHIP_ERROR: Referenced reference_run_id '${entityData.reference_run_id}' does not exist.`);
    }

    if (!entityData.intervention_id) {
      throw new Error(`RELATIONSHIP_ERROR: Experiment missing required intervention_id.`);
    }
    const intervention = loadEntity('intervention', entityData.intervention_id, options);
    if (!intervention) {
      throw new Error(`RELATIONSHIP_ERROR: Referenced intervention_id '${entityData.intervention_id}' does not exist.`);
    }

    if (!entityData.prompt_set_id) {
      throw new Error(`RELATIONSHIP_ERROR: Experiment missing required prompt_set_id.`);
    }
    const pset = loadEntity('prompt_set', entityData.prompt_set_id, options);
    if (!pset) {
      throw new Error(`RELATIONSHIP_ERROR: Referenced prompt_set_id '${entityData.prompt_set_id}' does not exist.`);
    }

    for (const envId of (entityData.environments || [])) {
      const env = loadEntity('environment', envId, options);
      if (!env) {
        throw new Error(`RELATIONSHIP_ERROR: Referenced environment '${envId}' does not exist.`);
      }
    }

    const implementationStates = ['READY_FOR_IMPLEMENTATION', 'IN_PROGRESS', 'IMPLEMENTED', 'READY_FOR_VERIFICATION'];
    if (implementationStates.includes(entityData.status)) {
      if (dec.decision !== 'APPROVE') {
        throw new Error(`GATE_ERROR: Cannot transition experiment to '${entityData.status}'. Founder Decision '${entityData.founder_decision_id}' is '${dec.decision}' (must be 'APPROVE').`);
      }
    }
  }

  if (normType === 'intervention') {
    if (entityId === 'INT-T2-01') {
      throw new Error(`GOVERNANCE_ERROR: Invalid intervention identity 'INT-T2-01'. Canonical historical identity must be 'T2-INT-01'.`);
    }
  }

  if (normType === 'verification') {
    if (!entityData.subject_type || !entityData.subject_id) {
      throw new Error(`RELATIONSHIP_ERROR: Verification requires subject_type and subject_id.`);
    }
    const subjectNormType = entityData.subject_type === 'ACTION' ? 'action' : 'experiment';
    const subject = loadEntity(subjectNormType, entityData.subject_id, options);
    if (!subject) {
      throw new Error(`RELATIONSHIP_ERROR: Referenced subject '${entityData.subject_id}' of type '${entityData.subject_type}' does not exist.`);
    }
    if (subject.status !== 'READY_FOR_VERIFICATION') {
      throw new Error(`GATE_ERROR: Cannot verify subject '${entityData.subject_id}'. Subject is in status '${subject.status}' (must be 'READY_FOR_VERIFICATION').`);
    }

    if (!entityData.founder_decision_id) {
      throw new Error(`RELATIONSHIP_ERROR: Verification requires founder_decision_id.`);
    }
    const dec = loadEntity('founder_decision', entityData.founder_decision_id, options);
    if (!dec) {
      throw new Error(`RELATIONSHIP_ERROR: Referenced founder_decision_id '${entityData.founder_decision_id}' does not exist.`);
    }
    if (dec.status !== 'DECIDED' || dec.decision !== 'APPROVE') {
      throw new Error(`GATE_ERROR: Cannot verify subject when Founder Decision '${entityData.founder_decision_id}' is '${dec.decision}' (must be 'DECIDED' and 'APPROVE').`);
    }

    if (!Array.isArray(entityData.evidence_refs) || entityData.evidence_refs.length === 0) {
      throw new Error(`VALIDATION_ERROR: Verification requires at least one evidence_ref.`);
    }
    for (const evdId of entityData.evidence_refs) {
      const evd = loadEntity('visibility_evidence', evdId, options);
      if (!evd) {
        throw new Error(`RELATIONSHIP_ERROR: Referenced evidence '${evdId}' does not exist.`);
      }
    }

    for (const psetId of (entityData.prompt_set_refs || [])) {
      const pset = loadEntity('prompt_set', psetId, options);
      if (!pset) {
        throw new Error(`RELATIONSHIP_ERROR: Referenced prompt_set '${psetId}' does not exist.`);
      }
    }
    for (const envId of (entityData.environment_refs || [])) {
      const env = loadEntity('environment', envId, options);
      if (!env) {
        throw new Error(`RELATIONSHIP_ERROR: Referenced environment '${envId}' does not exist.`);
      }
    }

    if (entityData.protocol_deviation === true && (!entityData.deviation_reason || entityData.deviation_reason.trim().length === 0)) {
      throw new Error(`VALIDATION_ERROR: Verification with protocol_deviation=true requires explicit deviation_reason.`);
    }
  }

  if (normType === 'learning') {
    if (!Array.isArray(entityData.source_verification_refs) || entityData.source_verification_refs.length === 0) {
      throw new Error(`VALIDATION_ERROR: Learning requires at least one source_verification_ref.`);
    }
    for (const vfyId of entityData.source_verification_refs) {
      const vfy = loadEntity('verification', vfyId, options);
      if (!vfy) {
        throw new Error(`RELATIONSHIP_ERROR: Referenced verification '${vfyId}' does not exist.`);
      }
      if (vfy.status !== 'VERIFIED') {
        throw new Error(`GATE_ERROR: Cannot derive Learning '${entityId}'. Source verification '${vfyId}' is in status '${vfy.status}' (must be 'VERIFIED').`);
      }
    }

    if (!Array.isArray(entityData.evidence_refs) || entityData.evidence_refs.length === 0) {
      throw new Error(`VALIDATION_ERROR: Learning requires at least one evidence_ref.`);
    }
    for (const evdId of entityData.evidence_refs) {
      const evd = loadEntity('visibility_evidence', evdId, options);
      if (!evd) {
        throw new Error(`RELATIONSHIP_ERROR: Referenced evidence '${evdId}' does not exist.`);
      }
    }
  }

  if (normType === 'system_rule_candidate') {
    if (!Array.isArray(entityData.source_learning_refs) || entityData.source_learning_refs.length === 0) {
      throw new Error(`VALIDATION_ERROR: System rule candidate requires at least one source_learning_ref.`);
    }
    for (const lrnId of entityData.source_learning_refs) {
      const lrn = loadEntity('learning', lrnId, options);
      if (!lrn) {
        throw new Error(`RELATIONSHIP_ERROR: Referenced learning '${lrnId}' does not exist.`);
      }
      if (lrn.status !== 'VALIDATED') {
        throw new Error(`GATE_ERROR: Cannot create System Rule Candidate '${entityId}'. Source learning '${lrnId}' is in status '${lrn.status}' (must be 'VALIDATED').`);
      }
    }

    if (!Array.isArray(entityData.evidence_refs) || entityData.evidence_refs.length === 0) {
      throw new Error(`VALIDATION_ERROR: System rule candidate requires at least one evidence_ref.`);
    }
    for (const evdId of entityData.evidence_refs) {
      const evd = loadEntity('visibility_evidence', evdId, options);
      if (!evd) {
        throw new Error(`RELATIONSHIP_ERROR: Referenced evidence '${evdId}' does not exist.`);
      }
    }
  }

  if (normType === 'system_rule') {
    if (!Array.isArray(entityData.source_learning_refs) || entityData.source_learning_refs.length === 0) {
      throw new Error(`VALIDATION_ERROR: System rule requires at least one source_learning_ref.`);
    }
    for (const lrnId of entityData.source_learning_refs) {
      const lrn = loadEntity('learning', lrnId, options);
      if (!lrn) {
        throw new Error(`RELATIONSHIP_ERROR: Referenced learning '${lrnId}' does not exist.`);
      }
      if (lrn.status !== 'VALIDATED') {
        throw new Error(`GATE_ERROR: Cannot create System Rule '${entityId}'. Source learning '${lrnId}' is in status '${lrn.status}' (must be 'VALIDATED').`);
      }
    }
    if (!Array.isArray(entityData.evidence_refs) || entityData.evidence_refs.length === 0) {
      throw new Error(`VALIDATION_ERROR: System rule requires at least one evidence_ref.`);
    }
    for (const evdId of entityData.evidence_refs) {
      const evd = loadEntity('visibility_evidence', evdId, options);
      if (!evd) {
        throw new Error(`RELATIONSHIP_ERROR: Referenced evidence '${evdId}' does not exist.`);
      }
    }
    if ((entityData.status === 'ACTIVE' || entityData.status === 'FOUNDER_APPROVED') && entityData.approved_by !== 'FOUNDER') {
      throw new Error(`AUTHORITY_ERROR: System Rule '${entityId}' requires explicit Founder approval (approved_by must be 'FOUNDER').`);
    }
  }

  if (normType === 'governance_issue') {
    if (entityData.status === 'CLOSED' || entityData.status === 'RESOLVED') {
      if (!entityData.resolution || typeof entityData.resolution !== 'string' || entityData.resolution.trim().length === 0) {
        throw new Error(`GOVERNANCE_ERROR: Cannot close or resolve governance issue '${entityId}' without explicit resolution record.`);
      }
    }
    if (Array.isArray(entityData.evidence_refs)) {
      for (const evdId of entityData.evidence_refs) {
        const evd = loadEntity('visibility_evidence', evdId, options);
        if (!evd) {
          throw new Error(`RELATIONSHIP_ERROR: Referenced evidence '${evdId}' does not exist.`);
        }
      }
    }
  }

  if (normType === 'governance_exception') {
    if (entityData.status === 'APPROVED' && entityData.approved_by !== 'FOUNDER') {
      throw new Error(`AUTHORITY_ERROR: Governance Exception '${entityId}' requires explicit Founder approval.`);
    }
  }

  if (normType === 'change_request') {
    if (entityData.status === 'APPROVED' && entityData.approved_by !== 'FOUNDER') {
      throw new Error(`AUTHORITY_ERROR: Change Request '${entityId}' requires explicit Founder approval.`);
    }
    if (!entityData.reason || entityData.reason.trim().length < 5) {
      throw new Error(`VALIDATION_ERROR: Change Request '${entityId}' requires a clear reason.`);
    }
    if (!entityData.impact || entityData.impact.trim().length < 5) {
      throw new Error(`VALIDATION_ERROR: Change Request '${entityId}' requires an impact assessment.`);
    }
    if (!entityData.rollback || entityData.rollback.trim().length < 5) {
      throw new Error(`VALIDATION_ERROR: Change Request '${entityId}' requires a rollback plan.`);
    }
  }

  const baseDir = getBaseDir(options);
  const targetDir = options.isFixture ? path.join(baseDir, '_fixtures') : path.join(baseDir, folder);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const filePath = path.join(targetDir, `${entityId.toLowerCase()}.json`);
  fs.writeFileSync(filePath, JSON.stringify(entityData, null, 2), 'utf8');

  // Audit logging
  if (options.recordAudit !== false && normType !== 'audit_log') {
    recordAuditLog({
      audit_id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      actor: options.actor || 'SYSTEM',
      actor_type: options.actor_type || 'SYSTEM',
      action: existing ? 'UPDATE' : 'CREATE',
      entity_type_target: normType,
      entity_id: entityId,
      before: existing || null,
      after: entityData,
      timestamp: new Date().toISOString(),
      reason: options.reason || (existing ? 'Entity update' : 'Entity creation')
    }, options);
  }

  return entityData;
}

/**
 * Deletes an entity with strict AI guardrails and immutability protection.
 */
function deleteEntity(entityType, entityId, options = {}) {
  const normType = entityType.toLowerCase();
  const folder = ENTITY_FOLDERS[normType];
  if (!folder) throw new Error(`Unknown entity type: ${entityType}`);

  // Critical Negative Test B & AI Guardrail (Section 25):
  // AI MUST NOT delete raw evidence, historical observations, diagnoses, opportunities, priority assessments, founder decisions, actions, experiments, interventions, or governance entities
  if (options.actor_type === 'AI_ADVISOR') {
    if (
      normType === 'visibility_evidence' ||
      normType === 'observation' ||
      normType === 'measurement_run' ||
      normType === 'diagnosis' ||
      normType === 'opportunity' ||
      normType === 'priority_assessment' ||
      normType === 'founder_decision' ||
      normType === 'action' ||
      normType === 'experiment' ||
      normType === 'intervention' ||
      normType === 'verification' ||
      normType === 'learning' ||
      normType === 'system_rule_candidate' ||
      normType === 'governance_issue' ||
      normType === 'governance_exception' ||
      normType === 'operating_review' ||
      normType === 'change_request' ||
      normType === 'system_rule' ||
      normType === 'control_state' ||
      normType === 'environment' ||
      normType === 'prompt' ||
      normType === 'prompt_set'
    ) {
      throw new Error(`PERMISSION_DENIED: AI_ADVISOR is strictly prohibited from deleting raw evidence, observations, measurement runs, diagnoses, opportunities, priority assessments, founder decisions, actions, experiments, interventions, verifications, learnings, system rule candidates, governance issues, exceptions, reviews, change requests, system rules, environments, prompts, or prompt sets.`);
    }
  }

  const existing = loadEntity(normType, entityId, options);
  if (!existing) {
    return false;
  }

  // Canonical immutability protection:
  if (normType === 'environment' && (entityId === 'ENV-CHATGPT' || entityId === 'ENV-GEMINI' || entityId === 'ENV-PERPLEXITY')) {
    throw new Error(`IMMUTABILITY_VIOLATION: Canonical environment '${entityId}' is immutable and cannot be deleted.`);
  }
  if (normType === 'prompt_set' && entityId === 'PSET-M08-1-FIXED20') {
    throw new Error(`IMMUTABILITY_VIOLATION: Frozen prompt set '${entityId}' is immutable and cannot be deleted.`);
  }
  if (normType === 'prompt' && /^P(0[1-9]|1[0-9]|20)$/.test(entityId)) {
    throw new Error(`IMMUTABILITY_VIOLATION: Frozen prompt '${entityId}' is immutable and cannot be deleted.`);
  }

  // Immutability protection:
  if (existing.is_immutable === true) {
    throw new Error(`IMMUTABILITY_VIOLATION: Immutable entity '${entityId}' cannot be deleted.`);
  }

  const baseDir = getBaseDir(options);
  const candidates = [
    path.join(baseDir, folder, `${entityId}.json`),
    path.join(baseDir, folder, `${entityId.toLowerCase()}.json`),
    path.join(baseDir, '_fixtures', `${entityId}.json`),
    path.join(baseDir, '_fixtures', `${entityId.toLowerCase()}.json`)
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) {
      fs.unlinkSync(c);
      return true;
    }
  }

  return false;
}

/**
 * Records an audit log entry.
 */
function recordAuditLog(entry, options = {}) {
  const baseDir = getBaseDir(options);
  const auditDir = path.join(baseDir, 'audit');
  if (!fs.existsSync(auditDir)) {
    fs.mkdirSync(auditDir, { recursive: true });
  }

  const auditId = entry.audit_id || `AUD-${Date.now()}`;
  const fullEntry = {
    entity_type: 'audit_log',
    schema_version: '1.0.0',
    audit_id: auditId,
    actor: entry.actor || 'SYSTEM',
    actor_type: entry.actor_type || 'SYSTEM',
    action: entry.action || 'LOG',
    entity_type_target: entry.entity_type_target,
    entity_id: entry.entity_id,
    before: entry.before || null,
    after: entry.after || null,
    timestamp: entry.timestamp || new Date().toISOString(),
    reason: entry.reason || 'Audit log record'
  };

  const validation = validateEntity('audit_log', fullEntry, options);
  if (!validation.valid) {
    console.error(`Audit log validation error:`, validation.errors);
  }

  const filePath = path.join(auditDir, `${auditId.toLowerCase()}.json`);
  fs.writeFileSync(filePath, JSON.stringify(fullEntry, null, 2), 'utf8');
  return fullEntry;
}

function assertValidInterventionId(interventionId) {
  if (!interventionId) return;
  const regex = /^T2-INT-\d{2,}$/;
  if (!regex.test(interventionId)) {
    throw new Error(`Invalid intervention identifier '${interventionId}'. Must match T2-INT-\\d+ (e.g. T2-INT-01). INT-T2-01 is strictly prohibited.`);
  }
}

function checkImmutability(existingEntity, updatedEntity) {
  if (existingEntity && existingEntity.is_immutable === true) {
    throw new Error(`IMMUTABILITY_VIOLATION: Cannot mutate immutable entity '${existingEntity.id || existingEntity.run_id || existingEntity.observation_id || existingEntity.evidence_id}'.`);
  }
  if (existingEntity && existingEntity.status === 'COMPLETED') {
    throw new Error(`IMMUTABILITY_VIOLATION: Cannot mutate completed entity '${existingEntity.run_id}'.`);
  }
}

module.exports = {
  loadEntity,
  listEntities,
  listPrompts,
  listPromptSets,
  listEnvironments,
  listRuns,
  listObservations,
  listEvidence,
  listAuditLogs,
  listSources,
  listIngestionBatches,
  listDiagnoses,
  listOpportunities,
  listPriorityAssessments,
  listFounderDecisions,
  listActions,
  listExperiments,
  listInterventions,
  listVerifications,
  listLearnings,
  listSystemRuleCandidates,
  listGovernanceIssues,
  listExceptions,
  listReviews,
  listChangeRequests,
  listSystemRules,
  listControlStates,
  validateEntity,
  resolveRelationship,
  saveEntity,
  deleteEntity,
  recordAuditLog,
  getBaseDir,
  checkImmutability,
  assertValidInterventionId
};

