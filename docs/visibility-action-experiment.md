# LOCATRIA Visibility Operating System v1.0
## Action & Experimentation Foundation Specification (M08.2 / BUILD-05)

**Status:** IMPLEMENTED & VERIFIED  
**Architecture:** M08.2 LOCKED v1.0  
**Domain Layer:** Execution & Controlled Implementation  
**Epistemic Chain Position:** Post-Founder Decision → Pre-Verification/Learning  

---

## 1. Architectural Purpose & Boundaries

The **Action & Experimentation Foundation (BUILD-05)** establishes the strictly governed execution layer connecting approved Founder Decisions to controlled implementation in the LOCATRIA Visibility Operating System:

```text
Qualified Opportunity
        ↓
Priority Assessment
        ↓
Priority Recommendation
        ↓
Founder Review
        ↓
Founder Decision (APPROVE / DEFER / REJECT / REQUEST_MORE_EVIDENCE)
        ↓
[FOUNDER DECISION GATE]
        ↓
Action / Experiment / Intervention
        ↓
Implementation States (READY_FOR_IMPLEMENTATION → IN_PROGRESS → IMPLEMENTED → READY_FOR_VERIFICATION)
        ↓
[FROZEN / IMMUTABLE HANDOFF]
        ↓
[BUILD-06: Verification & Learning]
```

### Strict Ontological Distinctions

Under M08.2 architecture, the execution entities are fundamentally distinct:

| Entity | Epistemic Nature | Primary Question Answered | Governance Authority |
|---|---|---|---|
| **Opportunity** | Potential leverage | *Where does validated diagnostic evidence justify strategic focus?* | Founder (Qualification) |
| **Priority Assessment** | Structured evaluation | *How does this opportunity score across 6 categorical dimensions?* | Operator / Advisory |
| **Priority Recommendation** | Advisory signal | *What urgency tier (P0–P3) is explainably justified?* | Rule Engine (Zero score) |
| **Founder Decision** | Strategic authority | *Does the business authorize capital/time allocation?* | Founder Exclusively |
| **Action** | Operational task | *What specific changes must be implemented to capture the opportunity?* | Human Operator |
| **Experiment** | Empirical hypothesis | *What hypothesis is evaluated under frozen protocol and controlled variables?* | Human Operator |
| **Intervention** | Empirical modification | *What exact change is introduced into the environment/content surface?* | Human Operator |

---

## 2. Invariants & Governance Rules

The execution layer operates under twelve inviolable architectural invariants:

- **E01 — Opportunity Qualification Prerequisite:** An Action or Experiment can only reference an Opportunity in `QUALIFIED` status. Drafted or unvalidated opportunities are rejected (`GATE_ERROR`).
- **E02 — Founder Decision Gate:** An Action or Experiment can only enter implementation states (`READY_FOR_IMPLEMENTATION`, `IN_PROGRESS`, `IMPLEMENTED`, `READY_FOR_VERIFICATION`) if the referenced Founder Decision is `DECIDED` and `decision === 'APPROVE'`.
- **E03 — Non-Approval Blocking:** If Founder Decision is `DEFER`, `REJECT`, or `REQUEST_MORE_EVIDENCE`, advancement into implementation states throws `GATE_ERROR`.
- **E04 — Blocking Dependency Semantics:** Dependencies (`dependency_refs`) express strict execution prerequisites, NOT priority or urgency. An Action cannot enter `READY_FOR_IMPLEMENTATION` or `IN_PROGRESS` unless all prerequisite dependency actions are in `IMPLEMENTED` or `READY_FOR_VERIFICATION`. Otherwise, the action enters or remains `BLOCKED`.
- **E05 — AI Authority Restriction:** The `AI_ADVISOR` role is strictly advisory. AI cannot authorize, approve, or advance Actions or Experiments into implementation states. Only the Founder or an authorized Human Operator can transition execution states.
- **E06 — Zero Automatic Deployment / Silence ≠ Approval:** The system never automatically transitions decisions to actions or executes deployments. Explicit human or founder commands are required at every transition.
- **E07 — Experiment Rigor & Mandatory Rollback Plan:** Every Experiment requires an explicit hypothesis, reference run, intervention, frozen protocol version, target environments, variables, confounders, success observation, verification method, and a concrete rollback plan (minimum 10 characters).
- **E08 — Canonical Historical Intervention Identity:** The canonical identity `T2-INT-01` must remain exact and immutable across all storage and schema layers. Any attempt to use `INT-T2-01` is strictly rejected (`GOVERNANCE_ERROR`).
- **E09 — Zero Composite & Outcome Scores:** Tolerance = 0 for `outcome_score`, `verification_score`, `learning_score`, `composite_score`, `confidence_score`, `auto_deployed`, or hidden execution rankings.
- **E10 — Zero BUILD-06 Scope Leakage:** Execution stops at `READY_FOR_VERIFICATION`. Once reached, records become immutable and frozen, awaiting BUILD-06 verification protocols. Any attempt to transition to `VERIFIED`, `SUCCESSFUL`, or `FAILED` in BUILD-05 is rejected (`SCOPE_ERROR`).
- **E11 — Full Epistemic Traceability:** Complete evidence chain traversers link every Action and Experiment back to Founder Decision, Priority Assessment, Opportunity, Diagnoses, Observations, Evidence, and Measurement Runs.
- **E12 — Execution Conflict Detection:** The conflict engine detects concurrently running Actions or Experiments sharing identical opportunities, interventions, or prompt sets and environments.

---

## 3. Entity Schemas & Lifecycles

### 3.1 Action Lifecycle

```text
       ┌───────────┐
       │  DRAFTED  │
       └─────┬─────┘
             │ (Founder Decision = APPROVE & Dependencies Satisfied)
             ▼
┌─────────────────────────┐     (Unsatisfied Dependency)     ┌───────────┐
│ READY_FOR_IMPLEMENTATION│ ◄───────────────────────────────┤  BLOCKED  │
└────────────┬────────────┘                                  └─────▲─────┘
             │                                                     │
             ▼                                                     │
       ┌───────────┐                                               │
       │IN_PROGRESS├───────────────────────────────────────────────┘
       └─────┬─────┘
             │ (Changes verified locally)
             ▼
       ┌───────────┐
       │IMPLEMENTED│
       └─────┬─────┘
             │ (Handoff to verification)
             ▼
┌─────────────────────────┐
│ READY_FOR_VERIFICATION  │  (IMMUTABLE / FROZEN FOR BUILD-06)
└─────────────────────────┘
```

Any non-terminal status may transition to `CANCELLED` if strategic priorities shift.

### 3.2 Experiment Lifecycle

```text
       ┌───────────┐
       │  DRAFTED  │
       └─────┬─────┘
             │ (Founder Decision = APPROVE & Valid Protocol / Rollback Plan)
             ▼
┌─────────────────────────┐
│ READY_FOR_IMPLEMENTATION│
└────────────┬────────────┘
             │
             ▼
       ┌───────────┐
       │IN_PROGRESS│
       └─────┬─────┘
             │ (Intervention deployed to test surface)
             ▼
       ┌───────────┐
       │IMPLEMENTED│
       └─────┬─────┘
             │ (Ready for post-intervention run)
             ▼
┌─────────────────────────┐
│ READY_FOR_VERIFICATION  │  (IMMUTABLE / FROZEN FOR BUILD-06)
└─────────────────────────┘
```

### 3.3 Intervention Lifecycle

```text
       ┌───────────┐
       │  PLANNED  │
       └─────┬─────┘
             │ (Intervention deployed)
             ▼
       ┌───────────┐
       │  ACTIVE   ├──────────────┐
       └─────┬─────┘              │
             │ (Rollback triggered)│ (Superseded by new intervention)
             ▼                    ▼
       ┌───────────┐        ┌────────────┐
       │ROLLED_BACK│        │ SUPERSEDED │
       └───────────┘        └────────────┘
```

---

## 4. API Reference (`js/visibility-execution/index.js`)

### Creation
- `createAction(data, options)`: Validates opportunity qualification, Founder Decision Gate, and dependency satisfaction; creates canonical Action entity.
- `createExperiment(data, options)`: Validates hypothesis, reference run, intervention, prompt set, environments, and rollback plan; creates canonical Experiment entity.
- `createIntervention(data, options)`: Validates target, baseline, intended change, and reversibility; guards canonical identity `T2-INT-01`.

### Lifecycle Transitions
- `transitionActionStatus(actionId, targetStatus, context, options)`: Validates state transitions, enforces Founder Decision Gate, verifies blocking dependencies, rejects AI execution authority, and freezes records upon reaching `READY_FOR_VERIFICATION`.
- `transitionExperimentStatus(experimentId, targetStatus, context, options)`: Validates experiment state progression, verifies rollback plan existence, and enforces immutability.
- `transitionInterventionStatus(interventionId, targetStatus, context, options)`: Manages empirical modification states (`PLANNED` → `ACTIVE` → `ROLLED_BACK` / `SUPERSEDED`).

### Traceability & Conflict Detection
- `traceActionEvidenceChain(actionId, options)`: Traverses Action → Founder Decision → Priority Assessment → Opportunity → Diagnoses → Observations → Evidence → Runs.
- `traceExperimentEvidenceChain(experimentId, options)`: Traverses Experiment → Founder Decision → Opportunity → Intervention → Reference Run → Prompt Set → Environments.
- `detectExecutionConflicts(candidate, options)`: Identifies concurrent operations targeting the same opportunities, interventions, or environments.

---

## 5. Verification & Testing

The BUILD-05 execution foundation is validated by a 46-test comprehensive suite (`validation/test-visibility-execution.js`):
- **T01–T20 (20 Positive Tests):** Complete Action, Experiment, and Intervention lifecycles, dependency unblocking, traceability traversers, conflict detection, and immutability guards.
- **N01–N25 (25 Negative Tests):** Rejection of unvalidated opportunities, unapproved decisions, missing rollback plans, blocking dependency violations, AI advisor execution attempts, forbidden score fields, and BUILD-06 scope leakage.
- **H01 (Historical Integrity Check):** Verifies zero mutation to production historical dataset (T1 run, 60 observations, 60 evidence records, 20 prompts intact).
