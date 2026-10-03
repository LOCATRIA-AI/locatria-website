# LOCATRIA Visibility Operating System (M08.2)
## Prioritization & Founder Decision Foundation Specification v1.0

**Status:** ARCHITECTURE LOCKED  
**Module:** M08.2 Visibility Operating System  
**Layer:** Prioritization & Governance Layer (BUILD-04)  
**Authority:** Founder  
**Primary Implementer:** Antigravity  

---

## 1. Executive Summary & Epistemic Principle

The **Prioritization & Founder Decision Foundation** establishes the controlled governance layer that evaluates qualified visibility opportunities and presents structured priority recommendations for authoritative Founder Decision.

The fundamental epistemic chain is:
```text
Qualified Opportunity
        ↓
Priority Assessment
        ↓
Priority Recommendation
        ↓
Founder Review
        ↓
Founder Decision
        ↓
[BUILD-05] Action / Experiment
```

### Strict Architectural Separation
$$\text{Opportunity} \neq \text{Priority Assessment} \neq \text{Priority Recommendation} \neq \text{Founder Decision} \neq \text{Action}$$

- **Zero Composite Scores:** No weighted averages, ranking scores, or composite indexes (`priority_score`, `visibility_score`, etc.) are permitted.
- **Categorical Only:** Prioritization is structured categorically across six explicit dimensions.
- **Human Authority Invariant:** The system may recommend; the Founder decides. Autonomous AI approvals, silent default approvals, and synthetic rankings are strictly prohibited.

---

## 2. Core Entities & Identifiers

### 2.1 Priority Assessment (`PRIO-<domain>-<seq>`)
- **Naming Pattern:** `^PRIO-[A-Za-z0-9_-]+$` (e.g., `PRIO-VIS-001`).
- **Schema:** `schemas/visibility/priority-assessment.schema.json`.
- **Storage:** `visibility-data/priorities/<priority_assessment_id>.json`.
- **Precondition:** Can **only** be created for an Opportunity in `QUALIFIED` status.

### 2.2 Founder Decision (`DEC-<domain>-<seq>`)
- **Naming Pattern:** `^DEC-[A-Za-z0-9_-]+$` (e.g., `DEC-VIS-001`).
- **Schema:** `schemas/visibility/founder-decision.schema.json`.
- **Storage:** `visibility-data/decisions/<decision_id>.json`.
- **Precondition:** Requires an active `priority_assessment_id` and a `QUALIFIED` opportunity.

---

## 3. Prioritization Dimensions & Categorical Model

The six canonical prioritization dimensions and their controlled categories are:

| Dimension | Controlled Values | Requirement |
| :--- | :--- | :--- |
| **Impact** | `HIGH`, `MEDIUM`, `LOW`, `UNKNOWN` | Requires explicit `impact_basis` |
| **Evidence Strength** | `HIGH`, `MEDIUM`, `LOW`, `INSUFFICIENT` | Requires explicit `evidence_strength_basis` |
| **Feasibility** | `HIGH`, `MEDIUM`, `LOW`, `UNKNOWN` | Requires explicit `feasibility_basis` |
| **Urgency** | `HIGH`, `MEDIUM`, `LOW`, `UNKNOWN` | Requires explicit `urgency_basis` |
| **Dependency** | `BLOCKING`, `SIGNIFICANT`, `MINOR`, `NONE`, `UNKNOWN` | Requires explicit `dependency_basis` |
| **Strategic Relevance** | `HIGH`, `MEDIUM`, `LOW`, `UNKNOWN` | Requires explicit `strategic_relevance_basis` |

---

## 4. Priority Recommendation Rule Engine

The recommendation engine evaluates dimensions using transparent, deterministic rules without numeric scoring:

- **P0 (Critical / Prerequisite):**
  Triggered when `dependency === 'BLOCKING'` OR (`strategic_relevance === 'HIGH'` AND `urgency === 'HIGH'` AND `evidence_strength !== 'INSUFFICIENT'` AND `feasibility !== 'LOW'`).
- **P1 (High Priority Candidate):**
  Triggered when `impact === 'HIGH'` AND `evidence_strength` in `['HIGH', 'MEDIUM']` AND `feasibility` in `['HIGH', 'MEDIUM']`.
- **P2 (Normal Priority):**
  Triggered when `impact === 'MEDIUM'` OR (`impact === 'HIGH'` AND `feasibility === 'LOW'`).
- **P3 (Defer Candidate):**
  Triggered when `urgency === 'LOW'` OR `feasibility === 'LOW'` OR `impact === 'LOW'`.
- **RECOMMENDATION_UNCERTAIN:**
  Triggered when `evidence_strength === 'INSUFFICIENT'` OR `impact === 'UNKNOWN'`. Suggests `REQUEST_MORE_EVIDENCE`.

### Coexistence Principle
Multiple opportunities may share the same priority (e.g., three P1 opportunities). The system does not force an artificial single winner.

---

## 5. Founder Decision Governance

### 5.1 Controlled Decisions
- `APPROVE`: Authorizes opportunity to proceed to Action/Experiment design (BUILD-05).
- `DEFER`: Delays execution to a future cycle without invalidating the opportunity.
- `REJECT`: Rejects the opportunity from further consideration.
- `REQUEST_MORE_EVIDENCE`: Directs operators to perform additional empirical runs.

### 5.2 Recommendation vs Decision Separation & Override Traceability
- `recommendation` and `decision` are stored as discrete fields.
- If Founder Decision differs from recommendation (e.g., P1 recommendation deferred or P2 approved), an explicit `decision_reason` is mandatory.

### 5.3 AI Authority Restrictions
- Actor `AI_ADVISOR` is strictly prohibited from finalizing Founder Decisions.
- AI cannot masquerade as Founder.
- Silence is never interpreted as approval.

---

## 6. Full Decision Evidence Traceability

The complete provenance chain is traversed deterministically:
```text
Founder Decision (DEC-...)
  └── Priority Assessment (PRIO-...)
        └── Opportunity (OPP-...)
              └── Diagnosis (DIAG-...)
                    ├── Observation (OBS-...)
                    │     ├── Prompt (P...)
                    │     ├── Environment (ENV-...)
                    │     └── Measurement Run (RUN-...)
                    └── Visibility Evidence (EVD-...)
                          └── Source Raw Excerpt / File
```
If any link is broken, `traceDecisionEvidenceChain()` flags `broken_links` and blocks verification.
