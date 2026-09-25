/**
 * LOCATRIA Resource & Tool Data Model v1.0
 * Semantic & Governance Validation Rules Engine
 *
 * Enforces business rules, governance policies, and cross-entity constraints
 * that JSON Schema alone cannot express.
 */

'use strict';

const ERROR_CATEGORIES = {
  SCHEMA_ERROR: 'SCHEMA_ERROR',
  FIELD_ERROR: 'FIELD_ERROR',
  TYPE_ERROR: 'TYPE_ERROR',
  ENUM_ERROR: 'ENUM_ERROR',
  FORMAT_ERROR: 'FORMAT_ERROR',
  RELATIONSHIP_ERROR: 'RELATIONSHIP_ERROR',
  SEMANTIC_ERROR: 'SEMANTIC_ERROR',
  GOVERNANCE_ERROR: 'GOVERNANCE_ERROR'
};

/**
 * Maps standard Ajv error keywords to LOCATRIA Error Taxonomy.
 */
function mapAjvError(ajvError) {
  let category = ERROR_CATEGORIES.SCHEMA_ERROR;
  const keyword = ajvError.keyword;

  switch (keyword) {
    case 'required':
      category = ERROR_CATEGORIES.FIELD_ERROR;
      break;
    case 'type':
      category = ERROR_CATEGORIES.TYPE_ERROR;
      break;
    case 'enum':
    case 'const':
      category = ERROR_CATEGORIES.ENUM_ERROR;
      break;
    case 'format':
    case 'pattern':
      category = ERROR_CATEGORIES.FORMAT_ERROR;
      break;
    case 'additionalProperties':
      category = ERROR_CATEGORIES.SCHEMA_ERROR;
      break;
    default:
      category = ERROR_CATEGORIES.SCHEMA_ERROR;
  }

  const path = ajvError.instancePath || (ajvError.params && ajvError.params.missingProperty ? `/${ajvError.params.missingProperty}` : '/');
  return {
    category,
    path,
    message: ajvError.message || 'Schema validation error'
  };
}

/**
 * Validates entity-level semantic and governance rules.
 *
 * Rules implemented:
 * RULE 001 - Tool must have valid official_url (http/https).
 * RULE 004 - RECOMMENDED requires recommendation rationale.
 * RULE 005 - Affiliate = NONE is valid.
 * RULE 006 - Affiliate status must not determine evaluation.
 * RULE 007 - Affiliate commission must not be an evaluation dimension.
 * RULE 008 - No numeric tool scoring.
 * RULE 009 - RETIRED tools cannot become newly RECOMMENDED.
 * RULE 010 - Every RECOMMENDED tool must have last_reviewed.
 */
function validateSemanticAndGovernance(entity) {
  const errors = [];
  if (!entity || typeof entity !== 'object') {
    return [{
      category: ERROR_CATEGORIES.SCHEMA_ERROR,
      path: '/',
      message: 'Entity must be a valid JSON object'
    }];
  }

  const type = entity.entity_type;

  // RULE 008: No numeric tool scoring anywhere in any entity
  checkForNumericScoring(entity, '/', errors);

  switch (type) {
    case 'tool': {
      // RULE 001: Tool must have official_url with http/https
      if (entity.official_url) {
        if (!/^https?:\/\//i.test(entity.official_url)) {
          errors.push({
            category: ERROR_CATEGORIES.FORMAT_ERROR,
            path: '/official_url',
            message: 'RULE 001: Tool official_url must use HTTP or HTTPS protocol'
          });
        }
      }

      // RULE 008: Reject forbidden affiliate properties placed in Tool entity
      if (entity.affiliate_url || entity.affiliate_network || entity.affiliate_program) {
        errors.push({
          category: ERROR_CATEGORIES.SEMANTIC_ERROR,
          path: '/',
          message: 'RULE 008: Affiliate properties must not be placed inside Tool Entity. Use Affiliate Entity instead.'
        });
      }

      // RULE 010: Every RECOMMENDED tool must have last_reviewed in governance
      if (entity.lifecycle_status === 'RECOMMENDED') {
        const lastReviewed = entity.governance && entity.governance.last_reviewed;
        if (!lastReviewed || !/^\d{4}-\d{2}-\d{2}$/.test(lastReviewed)) {
          errors.push({
            category: ERROR_CATEGORIES.GOVERNANCE_ERROR,
            path: '/governance/last_reviewed',
            message: 'RULE 010: Every RECOMMENDED tool must have a valid last_reviewed date (YYYY-MM-DD)'
          });
        }
      }

      // Self-contained check for single tool entity with invalid affiliate settings
      if (entity.commercial && entity.commercial.affiliate_available === false) {
        // standalone note: cross-entity check handles tool vs affiliate entity
      }

      break;
    }

    case 'evaluation': {
      // RULE 007: Affiliate commission must not be an evaluation dimension
      if (entity.dimensions && typeof entity.dimensions === 'object') {
        const forbiddenTerms = ['commission', 'affiliate', 'payout', 'kickback', 'revenue_share'];
        Object.keys(entity.dimensions).forEach(dimKey => {
          const lowerKey = dimKey.toLowerCase();
          if (forbiddenTerms.some(term => lowerKey.includes(term))) {
            errors.push({
              category: ERROR_CATEGORIES.GOVERNANCE_ERROR,
              path: `/dimensions/${dimKey}`,
              message: `RULE 007: Affiliate commission or commercial terms cannot be an evaluation dimension (${dimKey})`
            });
          }
          const val = entity.dimensions[dimKey];
          if (typeof val === 'string' && forbiddenTerms.some(term => val.toLowerCase().includes(term))) {
            errors.push({
              category: ERROR_CATEGORIES.GOVERNANCE_ERROR,
              path: `/dimensions/${dimKey}`,
              message: `RULE 006: Affiliate commercial terms must not determine evaluation quality in dimension ${dimKey}`
            });
          }
        });
      }
      break;
    }

    case 'recommendation': {
      // RULE 004: RECOMMENDED requires recommendation rationale
      if (entity.status === 'RECOMMENDED') {
        if (!entity.rationale || typeof entity.rationale !== 'string' || entity.rationale.trim().length < 15) {
          errors.push({
            category: ERROR_CATEGORIES.GOVERNANCE_ERROR,
            path: '/rationale',
            message: 'RULE 004: Recommendation with status RECOMMENDED requires a meaningful qualitative rationale (minimum 15 characters)'
          });
        }

        // Standalone check: evidence_refs must not be empty for RECOMMENDED
        if (!Array.isArray(entity.evidence_refs) || entity.evidence_refs.length === 0) {
          errors.push({
            category: ERROR_CATEGORIES.GOVERNANCE_ERROR,
            path: '/evidence_refs',
            message: 'GOVERNANCE: Recommendation with status RECOMMENDED must provide at least one evidence_ref'
          });
        }
      }
      break;
    }

    case 'affiliate': {
      // RULE 005: Affiliate = NONE is valid
      // If affiliate_available is false, status must be NONE
      if (entity.affiliate_available === false && entity.status && entity.status !== 'NONE') {
        errors.push({
          category: ERROR_CATEGORIES.SEMANTIC_ERROR,
          path: '/status',
          message: `SEMANTIC: Affiliate entity declares affiliate_available = false but status is ${entity.status}. Status must be NONE.`
        });
      }
      break;
    }

    default:
      break;
  }

  return errors;
}

/**
 * RULE 008: Recursively checks for forbidden numeric scoring keywords or rating values.
 */
function checkForNumericScoring(obj, currentPath, errors) {
  if (!obj || typeof obj !== 'object') return;

  const forbiddenKeys = ['score', 'rating', 'ranking', 'winner', 'stars', 'grade'];
  const numericScorePattern = /\b([0-9]|10)\.?\d?\s*\/\s*10\b/i;

  Object.keys(obj).forEach(key => {
    const subPath = currentPath === '/' ? `/${key}` : `${currentPath}/${key}`;
    const lowerKey = key.toLowerCase();

    if (forbiddenKeys.includes(lowerKey)) {
      errors.push({
        category: ERROR_CATEGORIES.SEMANTIC_ERROR,
        path: subPath,
        message: `RULE 008: Forbidden numeric scoring property "${key}" detected. LOCATRIA strictly prohibits numeric tool scores or rankings.`
      });
    }

    const val = obj[key];
    if (typeof val === 'string' && numericScorePattern.test(val)) {
      errors.push({
        category: ERROR_CATEGORIES.SEMANTIC_ERROR,
        path: subPath,
        message: `RULE 008: False precision detected. Numeric score expression "${val}" violates qualitative evidence standards.`
      });
    }

    if (typeof val === 'object' && val !== null) {
      checkForNumericScoring(val, subPath, errors);
    }
  });
}

/**
 * Cross-entity referential and lifecycle integrity checks across a collection of records.
 *
 * Rules implemented:
 * RULE 002 - Tool cannot be EVALUATED without evidence.
 * RULE 003 - Tool cannot be RECOMMENDED without evaluation.
 * RULE 009 - RETIRED tools cannot become newly RECOMMENDED.
 * Cross-entity Affiliate: Tool affiliate_available = false but Affiliate status = ACTIVE.
 */
function validateCrossEntityCollection(records) {
  const errors = [];
  if (!Array.isArray(records) || records.length === 0) return errors;

  const toolsMap = new Map();
  const evidenceByTool = new Map();
  const evaluationsByTool = new Map();
  const recommendationsByTool = new Map();
  const affiliatesByTool = new Map();
  const allEntityIds = new Set();

  records.forEach((rec, idx) => {
    if (!rec || typeof rec !== 'object') return;
    const type = rec.entity_type ? rec.entity_type.toLowerCase() : '';
    let primaryId = null;
    switch (type) {
      case 'tool': primaryId = rec.tool_id; break;
      case 'resource': primaryId = rec.resource_id; break;
      case 'evidence': primaryId = rec.evidence_id; break;
      case 'evaluation': primaryId = rec.evaluation_id; break;
      case 'recommendation': primaryId = rec.recommendation_id; break;
      case 'affiliate': primaryId = rec.affiliate_id; break;
      case 'review': primaryId = rec.review_id; break;
      case 'relationship': primaryId = rec.relationship_id; break;
      default: primaryId = rec.id || rec.tool_id;
    }
    if (primaryId) allEntityIds.add(primaryId);

    if (type === 'tool' && rec.tool_id) {
      toolsMap.set(rec.tool_id, { record: rec, index: idx });
    } else if (type === 'evidence' && rec.tool_id) {
      if (!evidenceByTool.has(rec.tool_id)) evidenceByTool.set(rec.tool_id, []);
      evidenceByTool.get(rec.tool_id).push(rec);
    } else if (type === 'evaluation' && rec.tool_id) {
      if (!evaluationsByTool.has(rec.tool_id)) evaluationsByTool.set(rec.tool_id, []);
      evaluationsByTool.get(rec.tool_id).push(rec);
    } else if (type === 'recommendation' && rec.tool_id) {
      if (!recommendationsByTool.has(rec.tool_id)) recommendationsByTool.set(rec.tool_id, []);
      recommendationsByTool.get(rec.tool_id).push(rec);
    } else if (type === 'affiliate' && rec.tool_id) {
      if (!affiliatesByTool.has(rec.tool_id)) affiliatesByTool.set(rec.tool_id, []);
      affiliatesByTool.get(rec.tool_id).push(rec);
    }
  });

  // Cross-Check 1: RULE 002 & RULE 003 on Tools
  toolsMap.forEach(({ record: tool }, toolId) => {
    const status = tool.lifecycle_status;
    const evidenceList = evidenceByTool.get(toolId) || [];
    const evaluationList = evaluationsByTool.get(toolId) || [];

    if (['EVALUATED', 'RECOMMENDED', 'CONDITIONALLY_RECOMMENDED'].includes(status)) {
      // RULE 002: Tool cannot be EVALUATED without evidence
      if (evidenceList.length === 0) {
        errors.push({
          category: ERROR_CATEGORIES.GOVERNANCE_ERROR,
          entityId: toolId,
          path: '/lifecycle_status',
          message: `RULE 002: Tool "${toolId}" has status ${status} but lacks supporting evidence records.`
        });
      }

      // RULE 003: Tool cannot be RECOMMENDED without evaluation
      if (['RECOMMENDED', 'CONDITIONALLY_RECOMMENDED'].includes(status) && evaluationList.length === 0) {
        errors.push({
          category: ERROR_CATEGORIES.GOVERNANCE_ERROR,
          entityId: toolId,
          path: '/lifecycle_status',
          message: `RULE 003: Tool "${toolId}" has status ${status} but lacks a completed evaluation record.`
        });
      }
    }

    // Cross-Check 2: Tool commercial vs Affiliate record
    const affiliateRecords = affiliatesByTool.get(toolId) || [];
    if (tool.commercial && tool.commercial.affiliate_available === false) {
      affiliateRecords.forEach(aff => {
        if (aff.status === 'ACTIVE') {
          errors.push({
            category: ERROR_CATEGORIES.SEMANTIC_ERROR,
            entityId: aff.affiliate_id || toolId,
            path: '/status',
            message: `SEMANTIC: Tool "${toolId}" declares commercial.affiliate_available = false but affiliate entity "${aff.affiliate_id}" has status ACTIVE.`
          });
        }
      });
    }

    // Cross-Check 3: RULE 009 - RETIRED tool cannot have RECOMMENDED recommendation
    if (tool.lifecycle_status === 'RETIRED') {
      const recs = recommendationsByTool.get(toolId) || [];
      recs.forEach(rec => {
        if (rec.status === 'RECOMMENDED' || rec.status === 'CONDITIONALLY_RECOMMENDED') {
          errors.push({
            category: ERROR_CATEGORIES.SEMANTIC_ERROR,
            entityId: rec.recommendation_id || toolId,
            path: '/status',
            message: `RULE 009: Tool "${toolId}" is RETIRED and cannot have recommendation status ${rec.status}.`
          });
        }
      });
    }
  });

  // Cross-Check 4: Recommendation requires Evaluation
  recommendationsByTool.forEach((recs, toolId) => {
    const evals = evaluationsByTool.get(toolId) || [];
    recs.forEach(rec => {
      if (rec.status === 'RECOMMENDED' && evals.length === 0) {
        errors.push({
          category: ERROR_CATEGORIES.GOVERNANCE_ERROR,
          entityId: rec.recommendation_id || toolId,
          path: '/status',
          message: `GOVERNANCE: Recommendation "${rec.recommendation_id}" is RECOMMENDED but no corresponding Evaluation exists for tool "${toolId}".`
        });
      }
    });
  });

  // Cross-Check 5: Relationship Source and Target Integrity
  const knownArticles = getKnownArticles();
  const knownLearningPaths = getKnownLearningPaths();
  const relationships = records.filter(r => r && r.entity_type === 'relationship');

  relationships.forEach(rel => {
    // Check Source
    if (rel.source_type === 'article') {
      if (!knownArticles.includes(rel.source_id)) {
        errors.push({
          category: ERROR_CATEGORIES.RELATIONSHIP_ERROR,
          entityId: rel.relationship_id,
          path: '/source_id',
          message: `RELATIONSHIP_ERROR: Source article "${rel.source_id}" was not found in published articles.`
        });
      }
    } else if (rel.source_type === 'learning_path') {
      if (!knownLearningPaths.includes(rel.source_id)) {
        errors.push({
          category: ERROR_CATEGORIES.RELATIONSHIP_ERROR,
          entityId: rel.relationship_id,
          path: '/source_id',
          message: `RELATIONSHIP_ERROR: Source learning path "${rel.source_id}" was not found in learning paths database.`
        });
      }
    } else {
      if (!allEntityIds.has(rel.source_id)) {
        errors.push({
          category: ERROR_CATEGORIES.RELATIONSHIP_ERROR,
          entityId: rel.relationship_id,
          path: '/source_id',
          message: `RELATIONSHIP_ERROR: Source entity "${rel.source_id}" (${rel.source_type}) was not found in dataset.`
        });
      }
    }

    // Check Target
    if (rel.target_type === 'article') {
      if (!knownArticles.includes(rel.target_id)) {
        errors.push({
          category: ERROR_CATEGORIES.RELATIONSHIP_ERROR,
          entityId: rel.relationship_id,
          path: '/target_id',
          message: `RELATIONSHIP_ERROR: Target article "${rel.target_id}" was not found in published articles.`
        });
      }
    } else if (rel.target_type === 'learning_path') {
      if (!knownLearningPaths.includes(rel.target_id)) {
        errors.push({
          category: ERROR_CATEGORIES.RELATIONSHIP_ERROR,
          entityId: rel.relationship_id,
          path: '/target_id',
          message: `RELATIONSHIP_ERROR: Target learning path "${rel.target_id}" was not found in learning paths database.`
        });
      }
    } else {
      if (!allEntityIds.has(rel.target_id)) {
        errors.push({
          category: ERROR_CATEGORIES.RELATIONSHIP_ERROR,
          entityId: rel.relationship_id,
          path: '/target_id',
          message: `RELATIONSHIP_ERROR: Target entity "${rel.target_id}" (${rel.target_type}) was not found in dataset.`
        });
      }
    }
  });

  return errors;
}

let cachedArticles = null;
function getKnownArticles() {
  if (cachedArticles) return cachedArticles;
  try {
    const filePath = require('path').join(__dirname, '../js/published-articles-db.js');
    if (require('fs').existsSync(filePath)) {
      const code = require('fs').readFileSync(filePath, 'utf8');
      const win = {};
      new Function('window', code)(win);
      cachedArticles = (win.LocatriaPublishedArticles || []).map(a => a.id || a.slugUrl);
      return cachedArticles;
    }
  } catch (e) {
    // fallback
  }
  cachedArticles = [];
  return cachedArticles;
}

let cachedLearningPaths = null;
function getKnownLearningPaths() {
  if (cachedLearningPaths) return cachedLearningPaths;
  try {
    const filePath = require('path').join(__dirname, '../js/learning-paths-db.js');
    if (require('fs').existsSync(filePath)) {
      const code = require('fs').readFileSync(filePath, 'utf8');
      const win = {};
      new Function('window', code)(win);
      cachedLearningPaths = Object.keys(win.LocatriaLearningPaths || {});
      return cachedLearningPaths;
    }
  } catch (e) {
    // fallback
  }
  cachedLearningPaths = [];
  return cachedLearningPaths;
}

function validateRelationshipIntegrity(relationship, dataset = []) {
  return validateCrossEntityCollection([...dataset, relationship]).filter(e => e.category === ERROR_CATEGORIES.RELATIONSHIP_ERROR);
}

module.exports = {
  ERROR_CATEGORIES,
  mapAjvError,
  validateSemanticAndGovernance,
  validateCrossEntityCollection,
  validateRelationshipIntegrity,
  getKnownArticles,
  getKnownLearningPaths
};
