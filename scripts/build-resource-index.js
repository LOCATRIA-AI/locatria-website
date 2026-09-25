#!/usr/bin/env node
/**
 * LOCATRIA Resource & Tool Data Layer v1.0
 * Lightweight Deterministic Index & Manifest Generator
 *
 * Scans canonical entity records and compiles lightweight derived indexes
 * and a top-level manifest. All outputs are deterministic to prevent
 * noisy Git diffs.
 *
 * Usage:
 *   node scripts/build-resource-index.js [--dir <path>]
 */

'use strict';

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const defaultBaseDir = path.join(rootDir, 'resource-data');

const ENTITY_CONFIG = {
  tool: {
    folder: 'tools',
    indexFile: 'tools-index.json',
    indexType: 'TOOL_INDEX',
    idKey: 'tool_id',
    extract: (entity, relPath) => ({
      tool_id: entity.tool_id,
      tool_name: entity.tool_name || '',
      provider: entity.provider || '',
      lifecycle_status: entity.lifecycle_status || '',
      path: relPath.replace(/\\/g, '/')
    })
  },
  resource: {
    folder: 'resources',
    indexFile: 'resources-index.json',
    indexType: 'RESOURCE_INDEX',
    idKey: 'resource_id',
    extract: (entity, relPath) => ({
      resource_id: entity.resource_id,
      resource_title: entity.resource_title || '',
      resource_type: entity.resource_type || '',
      lifecycle_status: entity.lifecycle_status || 'ACTIVE',
      path: relPath.replace(/\\/g, '/')
    })
  },
  evidence: {
    folder: 'evidence',
    indexFile: 'evidence-index.json',
    indexType: 'EVIDENCE_INDEX',
    idKey: 'evidence_id',
    extract: (entity, relPath) => ({
      evidence_id: entity.evidence_id,
      tool_id: entity.tool_id || '',
      evidence_type: entity.evidence_type || '',
      confidence: entity.confidence || (entity.evidence_strength ? entity.evidence_strength : ''),
      path: relPath.replace(/\\/g, '/')
    })
  },
  evaluation: {
    folder: 'evaluations',
    indexFile: 'evaluations-index.json',
    indexType: 'EVALUATION_INDEX',
    idKey: 'evaluation_id',
    extract: (entity, relPath) => ({
      evaluation_id: entity.evaluation_id,
      tool_id: entity.tool_id || '',
      evaluated_at: entity.evaluated_at || entity.evaluation_date || '',
      summary: entity.summary || entity.overall_assessment || '',
      path: relPath.replace(/\\/g, '/')
    })
  },
  recommendation: {
    folder: 'recommendations',
    indexFile: 'recommendations-index.json',
    indexType: 'RECOMMENDATION_INDEX',
    idKey: 'recommendation_id',
    extract: (entity, relPath) => ({
      recommendation_id: entity.recommendation_id,
      tool_id: entity.tool_id || '',
      status: entity.status || '',
      path: relPath.replace(/\\/g, '/')
    })
  },
  affiliate: {
    folder: 'affiliates',
    indexFile: 'affiliates-index.json',
    indexType: 'AFFILIATE_INDEX',
    idKey: 'affiliate_id',
    extract: (entity, relPath) => ({
      affiliate_id: entity.affiliate_id,
      tool_id: entity.tool_id || '',
      status: entity.status || 'NONE',
      affiliate_available: Boolean(entity.affiliate_available),
      path: relPath.replace(/\\/g, '/')
    })
  },
  review: {
    folder: 'reviews',
    indexFile: 'reviews-index.json',
    indexType: 'REVIEW_INDEX',
    idKey: 'review_id',
    extract: (entity, relPath) => ({
      review_id: entity.review_id,
      tool_id: entity.tool_id || '',
      review_date: entity.review_date || '',
      status: entity.status || 'CURRENT',
      path: relPath.replace(/\\/g, '/')
    })
  },
  relationship: {
    folder: 'relationships',
    indexFile: 'relationships-index.json',
    indexType: 'RELATIONSHIP_INDEX',
    idKey: 'relationship_id',
    extract: (entity, relPath) => ({
      relationship_id: entity.relationship_id,
      source_type: entity.source_type,
      source_id: entity.source_id,
      relationship_type: entity.relationship_type,
      target_type: entity.target_type,
      target_id: entity.target_id,
      path: relPath.replace(/\\/g, '/')
    })
  }
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Recursively scans directory for JSON files, skipping index/, manifests, and non-records.
 */
function scanJsonRecords(dir, rootBase, options = {}) {
  const records = [];
  if (!fs.existsSync(dir)) return records;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (
        entry.name === 'index' ||
        entry.name === 'node_modules' ||
        entry.name === '.git' ||
        (!options.includeFixtures && entry.name.startsWith('_'))
      ) {
        continue;
      }
      records.push(...scanJsonRecords(fullPath, rootBase, options));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      if (entry.name === 'resource-data-manifest.json' || entry.name.endsWith('-index.json') || entry.name.endsWith('.schema.json')) {
        continue;
      }
      try {
        const raw = fs.readFileSync(fullPath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.entity_type) {
          const relPath = path.relative(rootDir, fullPath);
          records.push({ entity: parsed, fullPath, relPath });
        }
      } catch (err) {
        console.warn(`Warning: Could not parse JSON file at ${fullPath}: ${err.message}`);
      }
    }
  }
  return records;
}

/**
 * Builds derived indexes and top-level manifest.
 */
function buildResourceIndex(baseDir = defaultBaseDir, options = {}) {
  const indexDir = path.join(baseDir, 'index');
  ensureDir(indexDir);

  const scanned = scanJsonRecords(baseDir, baseDir, options);

  const grouped = {
    tool: [],
    resource: [],
    evidence: [],
    evaluation: [],
    recommendation: [],
    affiliate: [],
    review: [],
    relationship: []
  };

  scanned.forEach(({ entity, relPath }) => {
    const type = entity.entity_type ? entity.entity_type.toLowerCase() : null;
    if (type && grouped[type]) {
      const cfg = ENTITY_CONFIG[type];
      const item = cfg.extract(entity, relPath);
      grouped[type].push(item);
    }
  });

  const generatedFiles = [];

  // Generate each entity index
  Object.keys(ENTITY_CONFIG).forEach(type => {
    const cfg = ENTITY_CONFIG[type];
    const items = grouped[type] || [];

    // Deterministic sort by primary ID
    items.sort((a, b) => {
      const idA = a[cfg.idKey] || '';
      const idB = b[cfg.idKey] || '';
      return idA.localeCompare(idB);
    });

    const indexContent = {
      entity_type: cfg.indexType,
      schema_version: '1.0',
      items
    };

    const outPath = path.join(indexDir, cfg.indexFile);
    fs.writeFileSync(outPath, JSON.stringify(indexContent, null, 2) + '\n', 'utf8');
    generatedFiles.push(outPath);
  });

  // Generate top-level manifest
  const manifest = {
    system: 'LOCATRIA',
    layer: 'RESOURCE_DATA',
    schema_version: '1.0',
    data_layer_version: '1.0',
    status: 'OPERATIONAL',
    entity_counts: {
      tools: grouped.tool.length,
      resources: grouped.resource.length,
      evidence: grouped.evidence.length,
      evaluations: grouped.evaluation.length,
      recommendations: grouped.recommendation.length,
      affiliates: grouped.affiliate.length,
      reviews: grouped.review.length,
      relationships: grouped.relationship.length
    }
  };

  const manifestPath = path.join(baseDir, 'resource-data-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  generatedFiles.push(manifestPath);

  return {
    manifest,
    generatedFiles,
    entityCounts: manifest.entity_counts
  };
}

if (require.main === module) {
  let targetDir = defaultBaseDir;
  const dirArgIndex = process.argv.indexOf('--dir');
  if (dirArgIndex !== -1 && process.argv[dirArgIndex + 1]) {
    targetDir = path.resolve(process.argv[dirArgIndex + 1]);
  }

  console.log('============================================================');
  console.log('LOCATRIA RESOURCE DATA LAYER INDEX & MANIFEST BUILDER');
  console.log('============================================================');
  console.log(`Target Directory: ${path.relative(rootDir, targetDir) || '.'}\n`);

  const { manifest, generatedFiles } = buildResourceIndex(targetDir);

  console.log('ENTITY COUNTS:');
  Object.entries(manifest.entity_counts).forEach(([k, v]) => {
    console.log(`  ${k.padEnd(16)}: ${v}`);
  });

  console.log(`\nGENERATED ${generatedFiles.length} FILES:`);
  generatedFiles.forEach(f => {
    console.log(`  - ${path.relative(rootDir, f)}`);
  });

  console.log('\nINDEX BUILD COMPLETE: STATUS OPERATIONAL ✓');
  console.log('============================================================\n');
}

module.exports = {
  ENTITY_CONFIG,
  buildResourceIndex
};
