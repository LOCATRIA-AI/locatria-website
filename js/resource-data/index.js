/**
 * LOCATRIA Resource Data Layer v1.0
 * Data Access Layer (DAL)
 *
 * Provides a clean, reusable programmatic interface for loading, listing,
 * and resolving Resource & Tool canonical entities and relationships.
 *
 * Single Source of Truth: Canonical entity JSON files in resource-data/.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');
const defaultBaseDir = path.join(rootDir, 'resource-data');

const ENTITY_FOLDERS = {
  tool: 'tools',
  resource: 'resources',
  evidence: 'evidence',
  evaluation: 'evaluations',
  recommendation: 'recommendations',
  affiliate: 'affiliates',
  review: 'reviews',
  relationship: 'relationships',
  measurement: 'measurements'
};

const ID_FIELDS = {
  tool: 'tool_id',
  resource: 'resource_id',
  evidence: 'evidence_id',
  evaluation: 'evaluation_id',
  recommendation: 'recommendation_id',
  affiliate: 'affiliate_id',
  review: 'review_id',
  relationship: 'relationship_id',
  measurement: 'measurement_id'
};

/**
 * Normalizes base directory option.
 */
function getBaseDir(options = {}) {
  return options.baseDir ? path.resolve(options.baseDir) : defaultBaseDir;
}

/**
 * Loads a single entity record by type and ID.
 * Returns the entity object if found, or null if not found.
 */
function loadEntity(entityType, entityId, options = {}) {
  if (!entityType || !entityId) return null;
  const type = entityType.toLowerCase();
  const folder = ENTITY_FOLDERS[type];
  if (!folder) return null;

  const baseDir = getBaseDir(options);

  // Search paths:
  // 1. Direct match in type folder (e.g. tools/TOOL-001.json or tools/tool-001.json)
  // 2. Direct match in _fixtures/ (e.g. _fixtures/tool-001.json)
  // 3. Scan directory if filenames differ from ID
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
        const raw = fs.readFileSync(candidate, 'utf8');
        const entity = JSON.parse(raw);
        const idField = ID_FIELDS[type];
        if (entity && entity.entity_type === type && (!idField || entity[idField] === entityId)) {
          return entity;
        }
      } catch (err) {
        // Continue searching candidates
      }
    }
  }

  // Scan type folder if direct file match failed
  const searchDirs = [
    path.join(baseDir, folder),
    path.join(baseDir, '_fixtures'),
    baseDir
  ];

  const idField = ID_FIELDS[type];
  for (const dir of searchDirs) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && !f.endsWith('.schema.json') && !f.endsWith('-index.json') && f !== 'resource-data-manifest.json');
      for (const file of files) {
        try {
          const filePath = path.join(dir, file);
          const raw = fs.readFileSync(filePath, 'utf8');
          const entity = JSON.parse(raw);
          if (entity && entity.entity_type === type && entity[idField] === entityId) {
            return entity;
          }
        } catch (err) {
          // ignore parse errors during search
        }
      }
    }
  }

  return null;
}

/**
 * Resolves an entity with graceful error handling.
 * Returns { ok: true, entity } or { ok: false, error: Error }.
 */
function resolveEntity(entityType, entityId, options = {}) {
  const entity = loadEntity(entityType, entityId, options);
  if (!entity) {
    const error = new Error(`Entity "${entityId}" of type "${entityType}" was not found.`);
    error.code = 'ENTITY_NOT_FOUND';
    error.entityType = entityType;
    error.entityId = entityId;
    return { ok: false, entity: null, error };
  }
  return { ok: true, entity, error: null };
}

/**
 * Lists all entities of a given type.
 */
function listEntities(entityType, options = {}) {
  const type = entityType.toLowerCase();
  const folder = ENTITY_FOLDERS[type];
  if (!folder) return [];

  const baseDir = getBaseDir(options);
  const items = [];
  const seenIds = new Set();
  const idField = ID_FIELDS[type];

  const searchDirs = [path.join(baseDir, folder)];
  if (options.includeFixtures) {
    searchDirs.push(path.join(baseDir, '_fixtures'));
  }

  // If baseDir itself is _fixtures or another specific folder without subfolders
  if (!fs.existsSync(path.join(baseDir, folder)) && fs.existsSync(baseDir)) {
    searchDirs.push(baseDir);
  }

  for (const dir of searchDirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && !f.endsWith('.schema.json') && !f.endsWith('-index.json') && f !== 'resource-data-manifest.json');
    for (const file of files) {
      try {
        const fullPath = path.join(dir, file);
        const raw = fs.readFileSync(fullPath, 'utf8');
        const entity = JSON.parse(raw);
        if (entity && entity.entity_type === type) {
          const id = entity[idField] || file;
          if (!seenIds.has(id)) {
            seenIds.add(id);
            items.push(entity);
          }
        }
      } catch (err) {
        // Skip invalid files
      }
    }
  }

  return items;
}

// Typed entity loaders
const loadTool = (id, opts) => loadEntity('tool', id, opts);
const loadResource = (id, opts) => loadEntity('resource', id, opts);
const loadEvidence = (id, opts) => loadEntity('evidence', id, opts);
const loadEvaluation = (id, opts) => loadEntity('evaluation', id, opts);
const loadRecommendation = (id, opts) => loadEntity('recommendation', id, opts);
const loadAffiliate = (id, opts) => loadEntity('affiliate', id, opts);
const loadReview = (id, opts) => loadEntity('review', id, opts);
const loadRelationship = (id, opts) => loadEntity('relationship', id, opts);
const loadMeasurement = (id, opts) => loadEntity('measurement', id, opts);

// Typed entity listers
const listTools = (opts) => listEntities('tool', opts);
const listResources = (opts) => listEntities('resource', opts);
const listEvidence = (opts) => listEntities('evidence', opts);
const listEvaluations = (opts) => listEntities('evaluation', opts);
const listRecommendations = (opts) => listEntities('recommendation', opts);
const listAffiliates = (opts) => listEntities('affiliate', opts);
const listReviews = (opts) => listEntities('review', opts);
const listRelationships = (opts) => listEntities('relationship', opts);
const listMeasurements = (opts) => listEntities('measurement', opts);

/**
 * Finds relationships matching optional sourceId, targetId, or relationshipType.
 */
function findRelationships(filter = {}, options = {}) {
  const allRels = listRelationships(options);
  return allRels.filter(rel => {
    if (filter.sourceId && rel.source_id !== filter.sourceId) return false;
    if (filter.targetId && rel.target_id !== filter.targetId) return false;
    if (filter.type && rel.relationship_type !== filter.type) return false;
    return true;
  });
}

/**
 * Finds all relationships connected to a specific entity as source or target.
 */
function findRelatedEntities(entityId, options = {}) {
  const allRels = listRelationships(options);
  return allRels.filter(rel => rel.source_id === entityId || rel.target_id === entityId);
}

/**
 * Resolves a relationship and loads both its source and target entities.
 * Fails gracefully with clear error information if any entity is missing.
 */
function resolveRelationship(relationshipId, options = {}) {
  const rel = loadRelationship(relationshipId, options);
  if (!rel) {
    const error = new Error(`Relationship "${relationshipId}" was not found.`);
    error.code = 'RELATIONSHIP_NOT_FOUND';
    return { ok: false, error, relationship: null, source: null, target: null };
  }

  const source = loadEntity(rel.source_type, rel.source_id, options);
  const target = loadEntity(rel.target_type, rel.target_id, options);

  if (!source) {
    const error = new Error(`Source entity "${rel.source_id}" (${rel.source_type}) not found for relationship "${relationshipId}".`);
    error.code = 'SOURCE_NOT_FOUND';
    return { ok: false, error, relationship: rel, source: null, target };
  }

  if (!target) {
    const error = new Error(`Target entity "${rel.target_id}" (${rel.target_type}) not found for relationship "${relationshipId}".`);
    error.code = 'TARGET_NOT_FOUND';
    return { ok: false, error, relationship: rel, source, target: null };
  }

  return { ok: true, error: null, relationship: rel, source, target };
}

module.exports = {
  ENTITY_FOLDERS,
  ID_FIELDS,
  loadEntity,
  resolveEntity,
  listEntities,
  loadTool,
  loadResource,
  loadEvidence,
  loadEvaluation,
  loadRecommendation,
  loadAffiliate,
  loadReview,
  loadRelationship,
  loadMeasurement,
  listTools,
  listResources,
  listEvidence,
  listEvaluations,
  listRecommendations,
  listAffiliates,
  listReviews,
  listRelationships,
  listMeasurements,
  findRelationships,
  findRelatedEntities,
  resolveRelationship
};
