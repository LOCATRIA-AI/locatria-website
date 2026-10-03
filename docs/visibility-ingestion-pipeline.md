# GDBS OS — LOCATRIA
# MODULE 08 — VISIBILITY GROWTH SYSTEM
# M08.2 BUILD-02 — Ingestion, Normalization & Audit Pipeline Specification v1.0

**Status:** IMPLEMENTED & VERIFIED  
**Architecture:** M08.2 LOCKED v1.0  
**Phase:** BUILD-02  
**Authority:** Founder  
**Lead Architect:** Antigravity  

---

## 1. Pipeline Overview

The **M08.2 Ingestion, Normalization & Audit Pipeline** provides a deterministic, repeatable, schema-validated, and auditable pipeline connecting raw observation sources to canonical M08.2 visibility records:

```text
Authoritative Evidence Source (S1–S6)
        ↓
Source Registration & SHA-256 Hashing
        ↓
Ingestion Batch Contract (ING-*)
        ↓
Deterministic Normalization Engine
        ↓
Schema Validation (Draft 2020-12 via Ajv2020)
        ↓
Referential & Evidence Integrity Validation
        ↓
Idempotency & Duplicate Identity Prevention
        ↓
Audit Logging (AUD-*)
        ↓
Canonical M08.2 Records (Observations & Visibility Evidence)
```

---

## 2. Core Governance & Epistemic Invariants

1. **Raw Source Distinction:** Normalized data never replaces or alters raw evidence. Provenance links (`source_id`, `raw_response_id`) are preserved 1:1.
2. **Immutable History:** Historical completed runs (`RUN-M08-1-T1-REF`) and existing observations/evidence are strictly immutable and cannot be overwritten (`E015 HISTORICAL_RECORD_MUTATION`).
3. **Frozen Prompt Integrity:** Incoming prompt wording for `PSET-M08-1-FIXED20` must match canonical text verbatim. Any drift triggers `E009 PROMPT_TEXT_MISMATCH`. Normalization MUST NOT rewrite prompt text.
4. **Observation Identity:** Exactly `1 Prompt × 1 Environment × 1 Measurement Run = 1 Observation`. Duplicate identity triggers `E007 DUPLICATE_OBSERVATION`.
5. **Zero Data Fabrication:** Missing URLs remain `null`. The pipeline strictly forbids constructing URLs from brand names or domains (`E014 URL_INTEGRITY_ERROR`).
6. **First-Class UNVERIFIED State:** Unverified retrieval or citation is never converted to `NO`, `FALSE`, or `0`.
7. **Zero Composite Score Policy:** Tolerates zero composite visibility scores, predictive scores, or aggregate rankings (`Invariant A03`).

---

## 3. Error Model (E001–E016)

| Code | Error Category | Description & Guardrail |
| :--- | :--- | :--- |
| **`E001`** | `SOURCE_NOT_FOUND` | Registered source file missing at specified path. |
| **`E002`** | `SOURCE_CHANGED` | Source file content hash differs from registered SHA-256 hash. |
| **`E003`** | `INVALID_FORMAT` | Ingestion payload does not conform to expected structural format. |
| **`E004`** | `SCHEMA_VALIDATION_FAILED` | Entity payload fails Draft 2020-12 schema validation. |
| **`E005`** | `MISSING_REQUIRED_FIELD` | Required identity or provenance field is missing. |
| **`E006`** | `INVALID_REFERENCE` | Referenced entity (Prompt, Environment, Run, Evidence) does not exist. |
| **`E007`** | `DUPLICATE_OBSERVATION` | Multiple records share identical `(run_id, environment_id, prompt_id)` tuple. |
| **`E008`** | `PROMPT_ID_MISMATCH` | Prompt ID format invalid or not found in registry. |
| **`E009`** | `PROMPT_TEXT_MISMATCH` | Incoming prompt text differs from frozen canonical benchmark text. |
| **`E010`** | `ENVIRONMENT_MISMATCH` | Environment alias cannot be resolved via deterministic alias table. |
| **`E011`** | `RUN_MISMATCH` | Measurement run mismatch or unlinked batch item. |
| **`E012`** | `EVIDENCE_PROVENANCE_MISSING` | Observation has no paired evidence or empty raw response. |
| **`E013`** | `INVALID_METRIC_STATE` | Metric state violates classification rules or includes composite score. |
| **`E014`** | `URL_INTEGRITY_ERROR` | Fabricated or malformed URL detected. |
| **`E015`** | `HISTORICAL_RECORD_MUTATION` | Attempt to mutate or insert into an immutable completed run. |
| **`E016`** | `NON_IDEMPOTENT_IMPORT` | Re-running ingestion yields divergent state or duplicate records. |

---

## 4. Deterministic Normalization Rules

1. **Environment Normalization:**
   - Input strings trimmed and lowercased.
   - Evaluated against `ENVIRONMENT_ALIAS_MAP`:
     - `chatgpt`, `chat gpt`, `gpt-4o` $\to$ `ENV-CHATGPT`
     - `gemini`, `google gemini`, `gemini-1.5-flash` $\to$ `ENV-GEMINI`
     - `perplexity`, `perplexity ai`, `sonar` $\to$ `ENV-PERPLEXITY`
   - Unknown alias throws `E010 ENVIRONMENT_MISMATCH`.
2. **Date Normalization:**
   - Converted to standard ISO 8601 UTC timestamp (`YYYY-MM-DDTHH:mm:ssZ`).
3. **URL Normalization:**
   - If URL is missing, 'URL not visible', 'null', or empty $\to$ set to `null`.
   - Never infer or manufacture a URL.
4. **Metric Normalization:**
   - Mention: `YES` or `NO`.
   - Citation Signal: `YES` or `NO`.
   - Verified Citation: `YES` or `NO`.
   - Retrieval: `YES`, `NO`, or `UNVERIFIED`.
   - Entity Recognition: `CORRECT`, `INCORRECT`, `PARTIAL`, `UNVERIFIED`, or `N/A`.
   - Context Accuracy: `ACCURATE`, `INACCURATE`, `PARTIAL`, `HALLUCINATED`, `UNVERIFIED`, or `N/A`.

---

## 5. Audit Trail & Provenance

Every ingestion batch executes under an Ingestion Contract (`schemas/visibility/ingestion-contract.schema.json`) and generates an immutable audit record in `visibility-data/audit/` detailing:
- Ingestion Batch ID (`ING-*`)
- Source ID & content hash
- Target Run ID
- Operator identity
- Start and completion timestamps
- Success, error, and warning counts
- Detailed error code arrays if validation fails.
