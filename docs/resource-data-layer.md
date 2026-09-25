# LOCATRIA Resource Data Layer v1.0
## Operational Specification & Architecture Documentation

---

## 1. Purpose

The LOCATRIA Resource Data Layer operationalizes the Resource & Tool Data Model (Module 07 / Chapter 01 / Sprint A.2) inside the production codebase.

It establishes a structured, file-based, Git-native operational home for:
- Tools (`tools/`)
- Resources (`resources/`)
- Evidence records (`evidence/`)
- Evaluation records (`evaluations/`)
- Recommendation records (`recommendations/`)
- Affiliate metadata records (`affiliates/`)
- Review records (`reviews/`)
- Typed relationship records (`relationships/`)

This operational layer prepares LOCATRIA for the upcoming **Sprint A.3 Real Resource/Tool Pilot** without introducing infrastructure overhead, server dependencies, external databases, or premature UI components.

---

## 2. Architecture

The LOCATRIA Resource & Tool system adheres strictly to the **Knowledge First** operational philosophy. Knowledge and user problems always precede tools, recommendations, and monetization.

```
KNOWLEDGE
   ↓
USER PROBLEM
   ↓
WORKFLOW
   ↓
CAPABILITY
   ↓
RESOURCE
   ↓
TOOL ENTITY
   ↓
EVIDENCE
   ↓
EVALUATION
   ↓
RECOMMENDATION
   ↓
AFFILIATE
   ↓
TRACKING / MEASUREMENT
   ↓
REVIEW
   ↓
IMPROVE
```

> **Core Principle:** Affiliate is a secondary commercial metadata layer, never the foundation of the Resource system. Tools are evaluated and recommended on verifiable utility and evidence—never on affiliate availability or commission structure.

---

## 3. Folder Structure

The Resource Data Layer is located at `resource-data/` in the repository root:

```
resource-data/
├── tools/                  # Canonical Tool entity JSON records
│   └── .gitkeep
├── resources/              # Canonical Resource entity JSON records
│   └── .gitkeep
├── evidence/               # Verifiable test & benchmark Evidence records
│   └── .gitkeep
├── evaluations/            # Multi-dimensional qualitative Evaluation records
│   └── .gitkeep
├── recommendations/        # Formal editorial Recommendation records
│   └── .gitkeep
├── affiliates/             # Commercial Affiliate metadata records
│   └── .gitkeep
├── reviews/                # Periodic Governance Review records
│   └── .gitkeep
├── relationships/          # Typed cross-entity Relationship records
│   └── .gitkeep
├── index/                  # Derived lightweight navigation & discovery indexes
│   ├── tools-index.json
│   ├── resources-index.json
│   ├── evidence-index.json
│   ├── evaluations-index.json
│   ├── recommendations-index.json
│   ├── affiliates-index.json
│   ├── reviews-index.json
│   └── relationships-index.json
├── _fixtures/              # Seed test fixtures for validation and testing
│   ├── tool-001.json
│   ├── resource-001.json
│   ├── evidence-001.json
│   ├── evaluation-001.json
│   ├── recommendation-001.json
│   ├── affiliate-001.json
│   ├── review-001.json
│   └── relationship-001.json
└── resource-data-manifest.json # Top-level data layer manifest
```

---

## 4. Entity Types

The Resource Data Layer defines 8 first-class canonical entity types:

1. **Tool (`tool`)**: A software application, SaaS platform, CLI, or automation script that executes technical capabilities.
2. **Resource (`resource`)**: A workflow guide, checklist, template, dataset, or documentation asset that guides implementation.
3. **Evidence (`evidence`)**: Verifiable empirical observations, benchmark tests, or official product documentation.
4. **Evaluation (`evaluation`)**: Multi-dimensional qualitative assessment across problem fit, workflow fit, usability, capability, evidence, integration, value, and limitations.
5. **Recommendation (`recommendation`)**: Formal decision declaring recommendation status, target user/vertical context, rationale, and prerequisites.
6. **Affiliate (`affiliate`)**: Commercial metadata tracking affiliate availability, status, and disclosure rules (strictly separated from evaluation).
7. **Review (`review`)**: Scheduled or triggered periodic governance audits ensuring ongoing freshness and accuracy.
8. **Relationship (`relationship`)**: Explicit, typed, directional links connecting tools, resources, articles, learning paths, and governance entities.

---

## 5. ID Conventions

All entity IDs adhere to predictable, human-readable canonical prefixes:

| Entity Type | Canonical Prefix | Example ID | Filename Convention |
|---|---|---|---|
| Tool | `TOOL-` | `TOOL-001` | `tools/tool-001.json` |
| Resource | `RES-` | `RES-001` | `resources/resource-001.json` |
| Evidence | `EVD-` | `EVD-001` | `evidence/evidence-001.json` |
| Evaluation | `EVAL-` | `EVAL-001` | `evaluations/evaluation-001.json` |
| Recommendation | `REC-` | `REC-001` | `recommendations/recommendation-001.json` |
| Affiliate | `AFF-` | `AFF-001` | `affiliates/affiliate-001.json` |
| Review | `REV-` | `REV-001` | `reviews/review-001.json` |
| Relationship | `REL-` | `REL-001` | `relationships/relationship-001.json` |

### ID Principles:
- **Unique**: No ID collision across the entire repository.
- **Stable**: IDs never change once published.
- **Human-Readable**: Quickly identifiable in code, logs, and Git diffs.
- **Never Reused**: Retired entity IDs remain retired permanently.
- **Independent**: Decoupled from marketing names or URLs.

---

## 6. Canonical Source of Truth

The individual JSON files in `resource-data/` are the **Single Source of Truth** for the Resource Layer.

- Index files in `resource-data/index/` and `resource-data-manifest.json` are **derived artifacts**, automatically compiled from canonical entity records.
- Article JSON and published database records remain the single source of truth for Articles.
- The Data Access Layer loads canonical records directly, ensuring 100% data consistency.

```
Canonical Entity Files (resource-data/*/*.json)  <-- SINGLE SOURCE OF TRUTH
                      │
                      ▼
         build-resource-index.js
                      │
                      ▼
        Derived Indexes (resource-data/index/*.json)
                      │
                      ▼
            Consumers / Data Access Layer
```

---

## 7. Indexes

Lightweight indexes in `resource-data/index/` provide high-performance discovery and summary metadata without duplicating complete entity payloads:

- `tools-index.json`: `tool_id`, `tool_name`, `provider`, `lifecycle_status`, `path`
- `resources-index.json`: `resource_id`, `resource_title`, `resource_type`, `lifecycle_status`, `path`
- `evidence-index.json`: `evidence_id`, `tool_id`, `evidence_type`, `confidence`, `path`
- `evaluations-index.json`: `evaluation_id`, `tool_id`, `evaluated_at`, `summary`, `path`
- `recommendations-index.json`: `recommendation_id`, `tool_id`, `status`, `path`
- `affiliates-index.json`: `affiliate_id`, `tool_id`, `status`, `affiliate_available`, `path`
- `reviews-index.json`: `review_id`, `tool_id`, `review_date`, `status`, `path`
- `relationships-index.json`: `relationship_id`, `source_type`, `source_id`, `relationship_type`, `target_type`, `target_id`, `path`

Indexes are deterministically ordered by primary ID and contain no unstable execution timestamps.

---

## 8. Relationships

Relationships represent explicit, directional, typed connections between entities.

### Allowed Relationship Types:
- `ADDRESSES`: Tool/Resource addresses a specific local business problem.
- `LEADS_TO`: Completing an entity workflow transitions to another node.
- `SUPPORTS`: Tool supports a workflow stage or Resource.
- `REQUIRES`: Tool or Recommendation requires prerequisites or capabilities.
- `REFERENCES`: Contextual citation of an Article, Guide, or external source.
- `USES`: Resource or workflow utilizes a specific Tool.
- `HAS_EVALUATION`: Tool has an associated Evaluation record.
- `HAS_AFFILIATE`: Tool has associated Affiliate commercial metadata.
- `HAS_RECOMMENDATION`: Tool has a formal Recommendation record.
- `HAS_REVIEW`: Tool has an ongoing Governance Review record.
- `SUPPORTED_BY`: Tool or Recommendation is supported by an Evidence benchmark.
- `RELATED_TO`: Generic bidirectional relationship.

---

## 9. Validation

Validation is handled by the multi-tier validation engine:

1. **AJV Draft 2020-12 Schema Validation**: Validates syntax, types, patterns, formats, and required properties against `schemas/*.schema.json`.
2. **Semantic Rules Engine (`validation/validation-rules.js`)**: Enforces business logic (e.g. `RULE 008`: No numeric tool rankings, `RULE 005`: Affiliate status constraints).
3. **Governance Rules Engine**: Enforces editorial requirements (e.g. `RULE 002`: Evidence required before Evaluation, `RULE 003`: Evaluation required before Recommendation).
4. **Cross-Entity & Relationship Integrity Engine**: Verifies that relationship `source_id` and `target_id` reference existing, valid entities, articles, or learning paths.

---

## 10. Data Access Layer

The Data Access Layer (`js/resource-data/index.js`) provides a standardized API for programmatic interactions:

```javascript
const {
  loadTool,
  loadResource,
  listTools,
  listResources,
  resolveRelationship,
  resolveEntity
} = require('./js/resource-data');

// Load a specific tool
const tool = loadTool('TOOL-001');

// List all tools (optionally specifying base directory or test fixtures)
const tools = listTools({ baseDir: 'resource-data/_fixtures' });

// Resolve a relationship and its connected source and target entities
const resolution = resolveRelationship('REL-001', { baseDir: 'resource-data/_fixtures' });
if (resolution.ok) {
  console.log(resolution.source); // Tool entity
  console.log(resolution.target); // Evidence entity
}

// Graceful resolution of nonexistent entity
const result = resolveEntity('tool', 'NONEXISTENT-TOOL');
if (!result.ok) {
  console.error(result.error.code); // 'ENTITY_NOT_FOUND'
}
```

---

## 11. Lifecycle

Entity lifecycles represent rigorous editorial states:

### Tool Lifecycle:
- `DISCOVERED`: Candidate tool identified; unreviewed.
- `UNDER_REVIEW`: Active evidence collection and evaluation underway.
- `EVALUATED`: Qualitative evaluation completed.
- `LISTED`: Documented in knowledge base without active endorsement.
- `CONDITIONALLY_RECOMMENDED`: Endorsed for specific narrow verticals or constraints.
- `RECOMMENDED`: Fully validated for standard production workflows.
- `NOT_RECOMMENDED`: Evaluated and rejected due to privacy, cost, or poor fit.
- `RETIRED`: Deprecated, discontinued, or superseded.

### Recommendation Status:
`RECOMMENDED` | `CONDITIONALLY_RECOMMENDED` | `LISTED` | `UNDER_REVIEW` | `NOT_RECOMMENDED` | `RETIRED`

### Affiliate Status:
`NONE` | `PENDING` | `ACTIVE` | `PAUSED` | `ENDED`

---

## 12. Governance Rules

The Resource Data Layer strictly enforces the 16 core governance policies:

1. **Knowledge First**: Knowledge and methodology always precede tool selection.
2. **Problem Before Tool**: Every tool record must specify the primary problem it solves.
3. **Workflow Before Recommendation**: Tools are evaluated in the context of specific workflows.
4. **Evidence Before Recommendation**: A tool cannot be RECOMMENDED without valid Evidence (`RULE 002`).
5. **Evaluation Before Recommendation**: A tool cannot be RECOMMENDED without an Evaluation (`RULE 003`).
6. **Affiliate Is Never an Evaluation Criterion**: Affiliate presence or rate has 0% bearing on evaluation.
7. **Affiliate=NONE Is Valid**: Tools without monetization are first-class citizens.
8. **No False Precision**: No synthetic decimal scores (e.g. "9.4/10").
9. **No Numeric Scoring / Rankings**: Explicitly prohibited (`RULE 008`).
10. **No "Best Tool" Claims**: All recommendations are context-bound.
11. **Context Required**: Recommendation requires defined user and vertical context.
12. **Rationale Required**: Must document why a tool is recommended.
13. **Last Reviewed Required**: Recommended tools require recent governance recertification.
14. **Retired Tools Cannot Be Recommended**: Deprecated tools cannot hold active recommendations (`RULE 009`).
15. **Affiliate Metadata Separated**: Commercial tracking lives in separate records from technical reviews.
16. **Founder Retains Final Authority**: AI assists evaluation, but the Founder retains final editorial approval.

---

## 13. How to Add a New Entity

1. Determine the entity type (`tool`, `resource`, etc.) and assign the next sequential ID (e.g., `TOOL-002`).
2. Create a new JSON record under `resource-data/<entity-folder>/<id-lowercase>.json` (e.g., `resource-data/tools/tool-002.json`).
3. Follow the schema properties defined in `schemas/<entity-type>.schema.json`.
4. Validate the entity:
   ```bash
   node validation/validate.js resource-data/tools/tool-002.json
   ```
5. Rebuild the derived index:
   ```bash
   npm run build:resource-index
   ```
6. Run the operational validation suite:
   ```bash
   npm run test:resources
   ```

---

## 14. How to Validate

LOCATRIA provides three validation scripts:

```bash
# Validate a single entity file
npm run validate:resource resource-data/tools/tool-001.json

# Validate all resource fixtures and records
npm run validate:resources

# Run the 10-point operational Resource Data Layer test suite
npm run test:resources
```

---

## 15. How to Retire an Entity

1. Open the canonical entity file in `resource-data/tools/` or `resource-data/resources/`.
2. Update `lifecycle_status` to `"RETIRED"`.
3. In `governance`, update `last_reviewed`, set `review_status` to `"APPROVED"`, and document the retirement rationale in `change_notes`.
4. If a corresponding Recommendation record exists, update its `status` to `"RETIRED"`. Note that `RULE 009` will fail validation if a RETIRED tool has an active recommendation.
5. Rebuild the resource index: `npm run build:resource-index`.
6. Run validation: `npm run test:resources`.

---

## 16. Intentionally Deferred Items

To maintain disciplined focus and prevent over-engineering, the following items are intentionally **NOT** implemented in Sprint A.2.3:

- **No Real Commercial Tools**: No ChatGPT, Claude, SEMrush, or other commercial selections (deferred to Sprint A.3 Pilot).
- **No Real Affiliate Links**: Zero commercial links, affiliate tracking IDs, or partner accounts (deferred to Sprint A.5).
- **No Resource UI**: No public `/resources` or `/tools` frontend pages (deferred to Sprint A.4).
- **No Database Servers**: No PostgreSQL, Supabase, Firebase, or MongoDB (file-based data layer is complete and sufficient).
- **No Automated Ranking Engines**: No algorithmic "top tools" or scoring widgets.
- **Zero Article Changes**: Articles #01 through #38 remain completely untouched and authoritative.
