# LOCATRIA Resource Operating Dashboard v1.0

**Module**: 07 — Content & Knowledge Operating System  
**Chapter**: 01 — Content Production System  
**Sprint**: A.4.6 — Resource Operating Dashboard v1.0  
**Status**: APPROVED & VALIDATED  
**Audience**: Founder, Operator, Governance Reviewers  

---

> **CORE GOVERNANCE PRINCIPLE**  
> The Resource Operating Dashboard is a **READ / OPERATE control surface**. It does not replace, redesign, or alter the canonical systems established in A.4.1 (Lifecycle Governance), A.4.2 (Affiliate Operations), A.4.3 (Content Production), A.4.4 (Measurement), or A.4.5 (Review & Improvement Loop).  
> **The dashboard consumes canonical data; it never manufactures editorial decisions, rankings, or synthetic metrics.**

---

## 1. Purpose

The Resource Operating Dashboard provides the Founder and Operator with an authoritative single-pane-of-glass overview of the LOCATRIA Knowledge & Resource Operating System.

The dashboard answers seven operational questions:
1. **What resources and tools currently exist?** (Portfolio & tool inventory)
2. **What is their current lifecycle and recommendation state?** (State views without rankings)
3. **Is there real empirical measurement data yet?** (Telemetry state & quality breakdown)
4. **Are there review candidates requiring attention?** (Review queue state)
5. **What decisions and actions are pending?** (Prioritized Founder queue)
6. **Are there governance or commercial integrity issues?** (Categorical compliance panel)
7. **What requires human attention next?** (Action Center with direct entity links)

The dashboard is **NOT**:
- A generic analytics dashboard or vanity metrics tracker
- An affiliate revenue optimization dashboard
- A product comparison or recommendation ranking engine ("Best Tools", "Top Picks", "#1 Winner")
- A BI replacement
- An automatic editorial decision engine

---

## 2. Dashboard Architecture

The dashboard is constructed on a strictly decoupled pipeline:

```text
┌────────────────────────────────────────────────────────┐
│              CANONICAL DATA LAYER                      │
│ (resource-data/tools, resources, evaluations, etc.)     │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             EXISTING DAL & INDEX GENERATOR             │
│ (js/resource-data/index.js, resource-data/index/)       │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             DASHBOARD DATA ADAPTER                     │
│ (validation/resource-dashboard.js)                      │
│ - Derives 10 canonical read-only View Models           │
│ - Enforces Zero-Score & Decoupling Invariants           │
│ - Provides Search & Multi-criteria Filtering           │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│          FOUNDER OPERATING DASHBOARD UI                │
│ (resource-dashboard.html & js/resource-dashboard)      │
│ - Interactive client filtering & search                │
│ - Authentic empty-state handling                       │
│ - WCAG-accessible, responsive design system            │
└────────────────────────────────────────────────────────┘
```

---

## 3. Data Sources & Source of Truth

The dashboard reads directly from the canonical data layer without maintaining a secondary database or duplicate JSON stores:

| Entity Type | Canonical Directory | Current Baseline Count | Single Source of Truth |
|---|---|:---:|---|
| **Tools** | `resource-data/tools/` | 10 | Tool entity records |
| **Resources** | `resource-data/resources/` | 4 | Published resource guides & profiles |
| **Evaluations** | `resource-data/evaluations/` | 10 | Empirical laboratory benchmarks |
| **Recommendations** | `resource-data/recommendations/` | 10 | Editorial recommendation decisions |
| **Evidence** | `resource-data/evidence/` | 10 | Grounded evaluation evidence |
| **Relationships** | `resource-data/relationships/` | 10 | Directed graph entity bindings |
| **Affiliates** | `resource-data/affiliates/` | 10 | Commercial operations & disclosures |
| **Reviews** | `resource-data/reviews/` | 0 | Review candidates & audit decisions |
| **Measurements** | `resource-data/measurements/` | 0 | Empirical interaction telemetry |

---

## 4. View Models

The dashboard adapter (`validation/resource-dashboard.js`) derives ten read-only view models. These view models are purely projections for display and do not constitute new canonical entities:

1. `PortfolioSummary`: Top-level inventory counts and snapshot timestamp.
2. `ResourcePortfolioView`: Published resources broken down by canonical type.
3. `ToolStateView`: Complete tool inventory joined with current recommendation states.
4. `MeasurementSummary`: Telemetry record status, quality distribution, and layer breakdown.
5. `UserVsCommercialLedgers`: Strictly partitioned User Value and Commercial Activity ledgers.
6. `ReviewQueueView`: Review candidates categorized by lifecycle state.
7. `DecisionHistoryView`: Historical audit log extracted from entity governance changelogs.
8. `GovernanceHealthView`: Categorical operational compliance checks.
9. `CommercialStatusView`: 4-way separation of vendor programs, relationships, activations, and recommendations.
10. `FounderActionCenterView`: Prioritized operational tasks requiring human attention.

---

## 5. SECTION 01 & 02 — Portfolio Views

### Section 01: Operating Overview
Displays verified entity counts directly from the DAL:
- **10 Tools** (Audited and classified)
- **4 Resources** (Published)
- **10 Evaluations** (Empirically benchmarked)
- **10 Recommendations** (Context-bound)
- **10 Evidence Records** (Grounded citations)
- **10 Relationships** (Graph connections)
- **0 Reviews** (Queue clear)
- **0 Measurements** (Awaiting real traffic)
- **0 Active Affiliates** (Commercial independence preserved)

### Section 02: Resource Portfolio
Presents published resources categorized by architectural type:
- `RESOURCE_GUIDE`: High-level operational roadmap (`RES-GUIDE-001`).
- `WORKFLOW_RESOURCE`: Step-by-step end-to-end framework (`RES-WORKFLOW-001`).
- `TOOL_PROFILE`: Deep empirical tool analysis (`RES-PROFILE-CLAUDE`, `RES-PROFILE-NOTEBOOKLM`).

*Strict Rule:* No resource scoring, rankings, or "Most Popular" badges.

---

## 6. SECTION 03 — Tool & Recommendation State

Displays the canonical 10-tool inventory joined with current recommendation status:

| Tool ID | Tool Name | Provider | Primary Capability | Recommendation Status | Commercial Pricing |
|---|---|---|---|---|---|
| `TOOL-CAN-001` | NotebookLM | Google | CAP-RES-04 | `CONDITIONALLY_RECOMMENDED` | FREE |
| `TOOL-CAN-002` | AlsoAsked | AlsoAsked Ltd. | CAP-RES-01 | `LISTED` | FREEMIUM |
| `TOOL-CAN-003` | Frase | Frase Inc. | CAP-BRF-01 | `LISTED` | SUBSCRIPTION |
| `TOOL-CAN-004` | Content Harmony | Content Harmony | CAP-BRF-01 | `CONDITIONALLY_RECOMMENDED` | SUBSCRIPTION |
| `TOOL-CAN-005` | Hemingway Editor | Hemingway Ltd. | CAP-CRT-02 | `CONDITIONALLY_RECOMMENDED` | FREE / DESKTOP |
| `TOOL-CAN-006` | Claude (3.5 Sonnet) | Anthropic | CAP-CRT-01 | `RECOMMENDED` | FREEMIUM ($20/mo Pro) |
| `TOOL-CAN-007` | ChatGPT / GPT-4o | OpenAI | CAP-CRT-01 | `CONDITIONALLY_RECOMMENDED` | FREEMIUM ($20/mo) |
| `TOOL-CAN-008` | Grammarly Business | Grammarly Inc. | CAP-CRT-02 | `LISTED` | FREEMIUM ($12/mo) |
| `TOOL-CAN-010` | Diffchecker | Diffchecker | CAP-MNT-01 | `CONDITIONALLY_RECOMMENDED` | FREEMIUM |
| `TOOL-CAN-011` | Screaming Frog | Screaming Frog Ltd. | CAP-MNT-01 | `CONDITIONALLY_RECOMMENDED` | FREEMIUM |

*Strict Rule:* State view only. No "Best Tool", "Winner", or rank ordering.

---

## 7. SECTION 04 & 05 — Measurement Views & Two-Ledger Partitioning

### Section 04: Measurement Overview
Telemetry is structured across four canonical layers:
- `REACH` (Impressions, visits)
- `ENGAGEMENT` (Dwell time, scroll depth, section interaction)
- `USER_VALUE` (Learning path progression, tool views, outbound official clicks, feedback)
- `COMMERCIAL` (Affiliate link clicks, conversions, revenue)

### Authentic Empty-State
When `resource-data/measurements/` contains 0 records, the dashboard displays:
> **NO MEASUREMENT DATA AVAILABLE**  
> The measurement system is ready, but no real telemetry has been recorded yet. No synthetic data or fabricated charts are displayed.

### Section 05: Two-Ledger Partitioning
Preserves the A.4.4 invariant: **User Value precedes Commercial Value.**
- **User Value Ledger**: Priority ledger tracking practical utility for local business practitioners.
- **Commercial Activity Ledger**: Secondary ledger tracking monetization events.
- **Combined Score Disallowed**: Under no circumstances are user actions and affiliate dollars aggregated into a single "performance score".

---

## 8. SECTION 06 — Review Queue

Consumes the A.4.5 Review Candidate framework. Tracks review candidates across six lifecycle states:
- `OPEN` — Detected trigger/signal pending triage.
- `IN_REVIEW` — Under active diagnostic review.
- `DECISION_REQUIRED` — AI diagnosis completed; awaiting Founder authorization.
- `RESOLVED` — Action taken and verified.
- `CLOSED` — Candidate concluded with documentation.
- `DISMISSED` — Deemed non-actionable or false anomaly.

*Authentic Baseline:* In current production baseline, 0 review candidates exist (`NO_OPEN_CANDIDATES`).

---

## 9. SECTION 07 — Decision & Action History

Maintains an immutable historical audit trail by consolidating governance logs across tools, resources, and reviews:
- Preserves all 8 canonical decision outcomes: `NO_ACTION`, `MONITOR`, `UPDATE`, `DOWNGRADE`, `RETIRE`, `RE_EVALUATE`, `RESEARCH_MORE`, `COMMERCIAL_UPDATE`.
- Records: Date, Entity ID, Entity Name, Trigger, Decision Outcome, Rationale, Reviewer, Previous State, and New State.
- Strictly read-only; historical transitions cannot be overwritten.

---

## 10. SECTION 08 — Governance Health Panel

Monitors system integrity using **categorical health states** (`OK`, `ATTENTION`, `ACTION_REQUIRED`, `INSUFFICIENT_DATA`), strictly rejecting any numeric "governance score":

| Check ID | Condition Monitored | Baseline Count | State | Operational Diagnostic |
|---|---|:---:|:---:|---|
| `GOV-CHK-01` | Tools Without Required Evidence | 0 | `OK` | All 10 tools have empirical benchmark records |
| `GOV-CHK-02` | Recommendations Missing Fields | 0 | `OK` | All 10 recommendations have valid status & rationale |
| `GOV-CHK-03` | Deprecated / RETIRED Tools | 0 | `OK` | Zero deprecated tools in current production baseline |
| `GOV-CHK-04` | Affiliate Verification Due | 0 | `OK` | All 10 affiliate profiles verified with audit timestamps |
| `GOV-CHK-05` | Commercial Independence | 10 | `OK` | 10/10 tools remain NOT_ACTIVATED / NOT_CONTRACTED |
| `GOV-CHK-06` | Open Review Candidates | 0 | `OK` | Review queue clear; 0 open candidates |
| `GOV-CHK-07` | Telemetry Baseline | 0 | `INSUFFICIENT_DATA` | Telemetry awaiting real production visitor traffic |

---

## 11. SECTION 09 — Commercial & Affiliate Separation

Enforces the four-way decoupling matrix established in A.4.2:
$$\text{Vendor Program Availability} \neq \text{LOCATRIA Relationship} \neq \text{Activation Status} \neq \text{Recommendation Status}$$

In current production:
- 4 vendors offer public affiliate programs (AlsoAsked, Frase, Content Harmony, Grammarly).
- 6 vendors have no affiliate program or non-contracted status.
- **LOCATRIA relationship is 100% `NOT_CONTRACTED` across all 10 tools.**
- **Affiliate activation status is 100% `NOT_ACTIVATED` across all 10 tools.**
- Commercial availability has zero correlation with recommendation status.

---

## 12. SECTION 10 — Founder Action Center

Provides an actionable operational queue for the Founder:
- Categorizes items into: `REVIEW_REQUIRED`, `EVIDENCE_REQUIRED`, `RE_EVALUATION_REQUIRED`, `GOVERNANCE_ATTENTION`, `COMMERCIAL_UPDATE`, `CONTENT_UPDATE`, `INSUFFICIENT_DATA`.
- Provides direct entity references and required operational steps.
- **Enforces Human Authority:** The dashboard never automatically triggers updates, downgrades, retirements, or affiliate activations. The Founder remains the sole decision authority.

---

## 13. Empty-State Handling Policy

Empty states are treated as legitimate, first-class production states:
1. **Empty Measurements**: Displayed as `INSUFFICIENT_DATA` with explicit explanatory copy. No synthetic trendlines or mock bar charts.
2. **Empty Review Queue**: Displayed as `NO_OPEN_CANDIDATES`. Confirms operational health.
3. **Empty Commercial Activity**: Displayed as `NO_COMMERCIAL_ACTIVITY`. Confirms 100% editorial neutrality.

---

## 14. No-Score & No-Ranking Policy

To protect editorial independence and prevent vanity metric traps, the dashboard enforces an absolute ban on numeric scoring and ranking:
- **No Resource Scores**
- **No Tool Scores or Ratings (★ / 10 / 100)**
- **No Recommendation Scores**
- **No Governance Scores**
- **No Affiliate / Revenue Rankings**
- **No "Winner", "Best Pick", or "Top Tool" badges**

All dashboard views present **states**, **categorical conditions**, and **factual counts**.

---

## 15. Testing & Verification

The dashboard engine and UI are verified by automated test suite [`validation/test-resource-dashboard.js`](file:///c:/Users/admin/OneDrive%20-%20C%C3%94NG%20TY%20CP%20TPDD%20NUTRINEST/Documents/GDBS%20OS/19%20Locatria%20website/validation/test-resource-dashboard.js) covering 14 test scenarios:
1. Dashboard loads with current production data.
2. Canonical entity counts match real files (10 tools, 4 resources, 0 reviews, 0 measurements).
3. Empty measurement state handled authentically without synthetic data.
4. Empty review state handled authentically.
5. Affiliate state separated from recommendation state (4-way distinction).
6. Measurement data cannot modify recommendation status.
7. Commercial activity cannot modify recommendation status.
8. Review candidate lifecycle states supported (all 6 states).
9. Historical decisions preserved as read-only immutable audit log.
10. Strict zero-score / no-ranking invariant verified.
11. Orphaned and invalid entities handled gracefully with safe fallbacks.
12. Zero data fabrication verified across measurements, reviews, and revenue.
13. Universal search returns canonical entity references across tools and resources.
14. Founder Action Center enforces human authority and proper task categorization.

---

## 16. Future Extension Boundaries

Future sprints expanding the operating dashboard must adhere to these boundaries:
- **Do not connect external tracking scripts** without explicit governance approval and privacy review.
- **Do not introduce automatic editorial heuristics** (e.g. auto-downgrading tools on traffic drop).
- **Do not build commission optimization algorithms** or revenue-driven tool placements.
- **Do not bypass the canonical data layer** (all reads must flow through `resource-data/` and the DAL).
- **Do not remove human sign-off** from the Founder Action Center.
