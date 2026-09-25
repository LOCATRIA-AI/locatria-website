# LOCATRIA Resource & Tool Data Model v1.0
## Canonical Schema & Validation Infrastructure Documentation

**Module:** GDBS OS — Module 07 (Chapter 01)  
**Layer:** Affiliate / Resource Layer  
**Standard:** JSON Schema Draft 2020-12 (`https://json-schema.org/draft/2020-12/schema`)  
**Status:** Approved & Implemented  

---

### 1. Purpose

The LOCATRIA Resource & Tool Data Model establishes a strict, canonical data contract for software tools, operational resources, empirical evidence, qualitative evaluations, contextual recommendations, affiliate relationships, and periodic reviews.

#### Architectural Principles:
1. **Knowledge First:** Problem before tool, workflow before recommendation.
2. **Decoupled Commercials:** Tool Entity ≠ Affiliate Link. A tool can be `RECOMMENDED` with `affiliate_available: false` and `status: "NONE"`. Affiliate status must **never** influence evaluation quality.
3. **No False Precision:** Strict prohibition against numeric scores, rankings, or ratings (e.g., `9.7/10`, `5 stars`, `#1 Tool`). Evaluations are multi-dimensional and qualitative.
4. **Evidence-Backed:** Tools cannot be evaluated or recommended without documented, verifiable empirical evidence.

---

### 2. Canonical Entity Types

| Entity Type | Schema File | Description |
| :--- | :--- | :--- |
| **`tool`** | `schemas/tool.schema.json` | Software tool entity, capabilities, supported workflows, and lifecycle status. |
| **`resource`** | `schemas/resource.schema.json` | Implementation guide, workflow resource, or tool profile. |
| **`evidence`** | `schemas/evidence.schema.json` | Documented empirical observation or test artifact supporting tool evaluation. |
| **`evaluation`** | `schemas/evaluation.schema.json` | Qualitative 8-dimensional evaluation without numeric scores. |
| **`recommendation`** | `schemas/recommendation.schema.json` | Contextual recommendation tied to target user, vertical, and workflow. |
| **`affiliate`** | `schemas/affiliate.schema.json` | Commercial tracking and disclosure metadata decoupled from evaluation. |
| **`review`** | `schemas/review.schema.json` | Periodic governance audits and lifecycle trigger reviews. |
| **`relationship`** | `schemas/relationship.schema.json` | Typed directional graph edges connecting entities. |

---

### 3. Schema Locations

All canonical schemas reside in the `schemas/` directory:
- `schemas/tool.schema.json`
- `schemas/resource.schema.json`
- `schemas/evidence.schema.json`
- `schemas/evaluation.schema.json`
- `schemas/recommendation.schema.json`
- `schemas/affiliate.schema.json`
- `schemas/review.schema.json`
- `schemas/relationship.schema.json`

Every schema complies with **JSON Schema Draft 2020-12** and enforces `additionalProperties: false`.

---

### 4. Status Vocabulary

#### Tool Lifecycle Statuses:
- `DISCOVERED`: Tool identified and registered in inventory.
- `UNDER_REVIEW`: Tool undergoing empirical testing.
- `EVALUATED`: Qualitative 8-dimension evaluation completed.
- `LISTED`: Approved for directory inclusion without explicit recommendation.
- `CONDITIONALLY_RECOMMENDED`: Recommended for specific narrow operational contexts.
- `RECOMMENDED`: Fully verified operational recommendation.
- `NOT_RECOMMENDED`: Evaluated and deemed unsuitable for local business workflows.
- `RETIRED`: Deprecated, sunset, or discontinued tool.

#### Recommendation Statuses:
- `RECOMMENDED`, `CONDITIONALLY_RECOMMENDED`, `LISTED`, `UNDER_REVIEW`, `NOT_RECOMMENDED`, `RETIRED`

#### Affiliate Statuses:
- `NONE`: No affiliate program exists or is used (*valid and common*).
- `PENDING`: Application submitted.
- `ACTIVE`: Approved and active affiliate link.
- `PAUSED`: Temporarily paused commercial tracking.
- `ENDED`: Relationship terminated.

#### Evidence Strength:
- `STRONG`, `MODERATE`, `LIMITED`, `UNKNOWN`

#### Review Triggers:
- `SCHEDULED`, `PRICE_CHANGE`, `FEATURE_CHANGE`, `AFFILIATE_CHANGE`, `USER_FEEDBACK`, `POLICY_CHANGE`, `SOURCE_CHANGE`, `OTHER`

---

### 5. Semantic & Governance Rules

The validation engine enforces 10 strict business rules:

| Rule ID | Rule Statement | Category |
| :--- | :--- | :--- |
| **RULE 001** | Tool must have a valid `official_url` with HTTP/HTTPS protocol. | `FORMAT_ERROR` |
| **RULE 002** | Tool cannot have status `EVALUATED` or `RECOMMENDED` without supporting evidence records. | `GOVERNANCE_ERROR` |
| **RULE 003** | Tool cannot be `RECOMMENDED` without a completed qualitative evaluation. | `GOVERNANCE_ERROR` |
| **RULE 004** | `RECOMMENDED` status requires a qualitative, non-empty recommendation rationale. | `GOVERNANCE_ERROR` |
| **RULE 005** | `affiliate: status = NONE` is valid and supported. | `SEMANTIC_ERROR` |
| **RULE 006** | Affiliate status must never determine or alter evaluation quality. | `GOVERNANCE_ERROR` |
| **RULE 007** | Affiliate commission or commercial terms cannot be an evaluation dimension. | `GOVERNANCE_ERROR` |
| **RULE 008** | No numeric tool scoring or ratings allowed (rejects `score`, `rating`, `ranking`, `winner`). | `SEMANTIC_ERROR` |
| **RULE 009** | `RETIRED` tools cannot have recommendation status `RECOMMENDED`. | `SEMANTIC_ERROR` |
| **RULE 010** | Every `RECOMMENDED` tool must have a valid `last_reviewed` date in `governance`. | `GOVERNANCE_ERROR` |

---

### 6. How to Add a New Entity

1. Create a JSON file in your data directory (e.g., `data/tools/my-tool.json`).
2. Include the mandatory root fields:
   ```json
   {
     "entity_type": "tool",
     "schema_version": "1.0",
     "tool_id": "my-tool-id",
     ...
   }
   ```
3. Ensure no forbidden fields (such as `score` or `affiliate_url` inside a tool entity) are present.
4. Run validation on your file:
   ```bash
   node validation/validate.js path/to/my-tool.json
   ```

---

### 7. Validation Commands

#### Validate a single entity file:
```bash
node validation/validate.js <path-to-file.json>
# Example:
node validation/validate.js validation/fixtures/valid/tool-valid.json
```

#### Run batch validation across all records:
```bash
# Via NPM scripts:
npm run validate:resources

# Via Node directly:
node validation/validate-all.js

# Validate a specific directory:
node validation/validate-all.js validation/fixtures/valid
```

Reports are automatically generated in `reports/validation/` with full timestamps and machine-readable summaries.
