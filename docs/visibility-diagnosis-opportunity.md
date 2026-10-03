# LOCATRIA Visibility Operating System (M08.2)
## Diagnosis & Opportunity Foundation Specification v1.0

**Status:** ARCHITECTURE LOCKED  
**Module:** M08.2 Visibility Operating System  
**Layer:** Domain Layer (BUILD-03)  
**Authority:** Founder  
**Primary Implementer:** Antigravity  

---

## 1. Executive Summary & Epistemic Purpose

The **Diagnosis & Opportunity Foundation** establishes the controlled domain layer that transforms empirical observations and evidence into structured diagnostic insights and validated visibility opportunities.

The fundamental epistemic chain is:
```text
Observation → Evidence → Diagnosis → Opportunity
```

### Strict Scope & Separation of Concerns

To prevent premature action, strategic bias, and unauthorized automation, the architecture enforces an invariant separation of concerns:

$$\text{Observation} \neq \text{Evidence} \neq \text{Diagnosis} \neq \text{Opportunity} \neq \text{Priority} \neq \text{Action} \neq \text{Founder Decision}$$

- **Observation**: What the AI engine returned for a given prompt and environment.
- **Evidence**: Ground-truth excerpt, snippet, or citation status supporting the observation.
- **Diagnosis**: Epistemic analysis identifying the specific failure mode or pattern supported by evidence.
- **Opportunity**: Actionable possibility opened by a validated diagnosis.
- **Priority (BUILD-04)**: Strategic urgency and resource allocation (out of scope for BUILD-03).
- **Action (BUILD-05)**: Implementation tasks and experiments (out of scope for BUILD-03).
- **Founder Decision**: Exclusive strategic authority of the Founder.

---

## 2. Core Entities & Identifiers

### 2.1 Diagnosis Entity (`DIAG-<domain>-<sequence>`)
- **Naming Pattern:** `^DIAG-[A-Za-z0-9_-]+$` (e.g., `DIAG-VIS-001`).
- **Identifier Invariant:** Diagnosis IDs are **never** derived from observation IDs (`OBS-*`) or evidence IDs (`EVD-*`).
- **Storage:** `visibility-data/diagnoses/<diagnosis_id>.json`.
- **Schema:** `schemas/visibility/diagnosis.schema.json`.

### 2.2 Opportunity Entity (`OPP-<domain>-<sequence>`)
- **Naming Pattern:** `^OPP-[A-Za-z0-9_-]+$` (e.g., `OPP-VIS-001`).
- **Identifier Invariant:** Opportunity IDs are generated independently from diagnosis IDs.
- **Storage:** `visibility-data/opportunities/<opportunity_id>.json`.
- **Schema:** `schemas/visibility/opportunity.schema.json`.

---

## 3. Problem Taxonomy (V1–V7)

All Diagnoses and Opportunities must categorize their empirical focus using the locked 7-point Visibility Taxonomy:

| Code | Taxonomy Class | Definition |
| :--- | :--- | :--- |
| **V1** | `V1_DISCOVERY` | Entity or brand is completely omitted from AI responses in relevant category queries. |
| **V2** | `V2_RETRIEVAL` | Canonical documents or source URLs are not indexed, retrieved, or surfaced by AI search systems. |
| **V3** | `V3_CITATION` | Content is mentioned or synthesized, but source citation URL is omitted or unverified. |
| **V4** | `V4_ENTITY` | Entity identity, core attributes, or canonical brand naming are conflated or distorted. |
| **V5** | `V5_CONTEXT` | Surfaced information is contextually incomplete, stale, misleading, or inaccurate. |
| **V6** | `V6_COVERAGE` | Core topical cluster or prompt subset suffers systematic omission across multiple queries. |
| **V7** | `V7_ENVIRONMENT` | Discrepancy, failure mode, or hallucination pattern unique to a single AI engine architecture. |

---

## 4. Confidence States & Uncertainty Invariants

Confidence in M08.2 describes **evidence sufficiency**, never business importance, urgency, or priority:

- `HIGH`: Multi-observation corroboration across full run; zero conflicting evidence.
- `MEDIUM`: Moderate corroboration; isolated edge cases present.
- `LOW`: Limited observation count or conflicting signals across runs.
- `UNVERIFIED`: Preliminary signal requiring further controlled measurement.

### Epistemic Rule (D05):
Any diagnosis with confidence `LOW` or `UNVERIFIED` **must** include an explicit `uncertainty_statement` detailing what is unknown or why evidence is currently incomplete.

---

## 5. Lifecycle State Machines & Gates

### 5.1 Diagnosis Lifecycle
```text
[ DETECTED ] ──> [ UNDER_REVIEW ] ──> [ VALIDATED ] (Immutable)
       │                 │
       │                 ├──> [ NEED_MORE_EVIDENCE ] ──> [ UNDER_REVIEW ]
       │                 │
       └──> [ REJECTED ] └──> [ REJECTED ]
```

### 5.2 Opportunity Lifecycle
```text
[ DETECTED ] ──> [ DRAFTED ] ──> [ QUALIFYING ] ──> [ QUALIFIED ] (Immutable)
       │                 │                │
       └──> [ REJECTED ] └──> [ REJECTED ]└──> [ REJECTED ]
```

### 5.3 The Diagnosis → Opportunity Gate (Rule D12)
An Opportunity **cannot** transition to `QUALIFIED` unless **all** referenced Diagnoses are in `VALIDATED` status.
$$\text{Status}(\text{Diagnosis}) = \text{VALIDATED} \quad \forall \, d \in \text{diagnosis\_refs} \iff \text{Status}(\text{Opportunity}) \to \text{QUALIFIED}$$
Attempting to qualify an opportunity referencing unvalidated, under-review, or rejected diagnoses triggers a hard `GATE_ERROR`.

---

## 6. AI Authority Restrictions

In accordance with Section 25 AI Governance Guardrails:
1. **AI Cannot Validate Diagnoses (Rule D07):** Actor `AI_ADVISOR` is strictly blocked from setting Diagnosis status to `VALIDATED`. Transitioning to `VALIDATED` requires human authority (`FOUNDER` or authorized human operator).
2. **AI Cannot Qualify Opportunities (Rule D14):** Actor `AI_ADVISOR` is strictly blocked from qualifying Opportunities.
3. **AI Cannot Delete Entities:** Actor `AI_ADVISOR` is strictly blocked from deleting Diagnoses, Opportunities, Raw Evidence, Observations, or Runs.

---

## 7. Traceability Traverser (Rule D16)

The domain engine provides full two-way deterministic graph traversal:

```text
Opportunity (OPP-...)
  └── Diagnosis (DIAG-...)
        ├── Observation (OBS-...)
        │     ├── Prompt (P...)
        │     ├── Environment (ENV-...)
        │     └── Measurement Run (RUN-...)
        └── Visibility Evidence (EVD-...)
              └── Source Raw Excerpt / File
```

Any broken reference or orphan link is detected and flagged by `traceEvidenceChain()` and `traceDiagnosisEvidenceChain()`.
