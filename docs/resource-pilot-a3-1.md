# LOCATRIA Resource & Tool Pilot — Sprint A.3.1
## Pilot Problem & Workflow Definition v1.0

```
Sprint:             A.3.1 — Pilot Problem & Workflow Definition
System:             GDBS OS / Module 07 / Chapter 01 / Sprint A.3
Approved Cluster:   AI Content Workflow for Local Businesses
Workflow ID:        WF-AICONTENT-001
Status:             APPROVED FOR PILOT STAGING
Core Principle:     Problem → Workflow → Capability (Tool Research Deferred)
```

---

## 1. Executive Summary

Sprint A.3.1 establishes the foundational definition for LOCATRIA's first real Resource & Tool pilot: **AI Content Workflow for Local Businesses**.

Following the core principle of **Knowledge First**, this sprint strictly avoids starting with tools or software products. Before asking *"Which AI tool should LOCATRIA recommend?"*, this specification rigorously answers:
1. **Who is the user?** A resource-constrained local business operator or solo marketer.
2. **What problem are they solving?** Producing trustworthy, locally relevant content consistently without falling into the "blank page & random prompt trap" or publishing hallucinated AI filler.
3. **What workflow solves it?** The canonical five-stage process: **Research → Brief → Create → Repurpose → Maintain**.
4. **What capabilities are required?** 14 discrete, tool-agnostic operational capabilities.

This specification anchors the upcoming tool research phase (Sprint A.3.2 / A.3.3) by establishing objective, workflow-driven evaluation criteria.

---

## 2. Answers to the 10 Core Architectural Questions

| Question | Architectural Answer |
|---|---|
| **1. Who is the target user?** | A local business owner, solo practitioner, office manager, or small team marketer with 60–90 minutes per week for content, no dedicated writing team, and strict professional liability standards. |
| **2. What problem are they trying to solve?** | Creating authoritative, accurate, locally relevant content predictably without wasting hours editing generic AI drafts or letting published content decay into obsolescence. |
| **3. What outcome are they trying to achieve?** | Sustainable cadence (1 verified asset/week), authentic local authority, 60–70% reduction in drafting friction, multi-channel asset multiplication, and evergreen accuracy across search and AI engines. |
| **4. What workflow are they following?** | The canonical 5-stage pipeline: **Research → Brief → Create → Repurpose → Maintain** (`WF-AICONTENT-001`). |
| **5. What happens at each stage?** | Customer inquiry harvesting & intent analysis (Research) → Blueprinting outline & evidence mapping (Brief) → Context-bound drafting & practitioner verification (Create) → Structured cross-channel adaptation (Repurpose) → Scheduled freshness auditing & patching (Maintain). |
| **6. What inputs are required?** | Real customer questions, verified business specifications, brand voice rules, channel length limits, and operational change triggers. |
| **7. What outputs are produced?** | Research Notes Document, Content Brief, Publication-Ready Master Draft, Repurposed Asset Pack (GBP/FAQ/Email/Social), and Maintained/Changelogged Content. |
| **8. What capabilities are required?** | 14 discrete capabilities spanning inquiry clustering, intent analysis, outline structuring, evidence mapping, constrained drafting, tone calibration, format adaptation, consistency verification, and freshness auditing. |
| **9. What constraints exist?** | Zero tolerance for regulatory/clinical/legal misinformation; zero developer/coding requirements; strict time budget (1–2 hours); no complex multi-tool automation setups. |
| **10. What should later tool research evaluate?** | How well a candidate tool executes the specific required capabilities (`CAP-RES-01` to `CAP-MNT-02`) under privacy, cost, ease-of-use, and workflow compatibility constraints. |

---

## 3. Critical Principle: Problem → Workflow → Capability → Tool

LOCATRIA operates on an unwavering sequence:

```
[1. USER PROBLEM]
        │
        ▼
[2. WORKFLOW]
        │
        ▼
[3. REQUIRED CAPABILITIES]
        │
        ▼  (STRICT SPRINT A.3.1 BOUNDARY)
─────────────────────────────────────────────
        ▼  (DEFERRED TO A.3.2 / A.3.3)
[4. CANDIDATE TOOLS]
        │
        ▼  (DEFERRED TO A.3.4)
[5. EMPIRICAL EVALUATION & EVIDENCE]
        │
        ▼  (DEFERRED TO A.3.5)
[6. RECOMMENDATION & AFFILIATE LAYER]
```

### Why We Never Start with the Tool:
1. Starting with a tool forces the business to invent problems to justify software subscriptions.
2. Tools change rapidly, but fundamental human problems and business workflows remain stable.
3. Separating capabilities from tools prevents vendor lock-in and protects editorial neutrality.
4. Affiliate relationships can never taint evaluations when capabilities are defined before products are evaluated.

---

## 4. Pilot Cluster: AI Content Workflow for Local Businesses

The pilot focuses on a **common workflow layer** applicable across multiple local business verticals:
- **General Local Services**: Contractors, consultants, repair shops, agencies.
- **Dental & Medical Clinics**: Patient education, treatment FAQs, local service explanations.
- **Law Firms**: Client intake explanations, practice area FAQs, regulatory guidance.
- **Real Estate Agencies**: Neighborhood guides, buyer/seller process breakdowns, market updates.

By establishing the common workflow layer in A.3.1, vertical-specific pilot adaptations can be introduced later without rewriting core infrastructure.

---

## 5. Target User Profile

- **Role**: Local business owner, solo practitioner, practice manager, or in-house marketing coordinator.
- **Core Responsibilities**: Manages client acquisition, website content, search presence, and Google Business Profile alongside primary business operations.
- **Content Demands**: Needs to explain complex local services, answer repetitive prospective client questions, demonstrate professional competence, and establish visibility in Google AI Overviews, Search, and local directories.
- **Workflow Constraints**:
  - Time allocation: Maximum 60–90 minutes per piece.
  - Cognitive bandwidth: High task-switching; cannot maintain complex multi-app pipelines.
  - Technical threshold: Non-developer; requires accessible web interfaces or document editors.
- **AI Adoption Reality**: Has attempted using ChatGPT, Claude, or generic AI writing assistants. Experiences frustration with "robotic" sounding text, hallucinated details, lack of local flavor, and the time spent manually editing poor drafts.
- **Operational & Legal Boundaries**: Operates under strict professional liability (e.g. ethical legal advertising rules, medical accuracy requirements, real estate disclosures). Cannot afford unverified AI claims.

---

## 6. Primary User Problem

### 6.1 Statement
Local businesses need a repeatable, trustworthy method to research, plan, draft, repurpose, and maintain authoritative content without burning operational time, producing generic AI filler, or introducing factual inaccuracies.

### 6.2 The Anatomy of Content Friction
```
Raw Idea / Prompt ──► Generic AI Generation ──► Frustrated Operator Rewriting ──► Inconsistent / Abandoned Content
       ▲                                                                                       │
       └────────────────────────── THE WRONG CYCLE (TOOL-FIRST) ──────────────────────────────┘
```

1. **Current Friction**:
   - Operators sit down with a blank screen, open an AI chat, and type a vague prompt.
   - The AI generates generic, formulaic paragraphs loaded with clichés (*"In today's fast-paced world..."*, *"delve into"*, *"game-changer"*).
   - The operator spends 2 hours editing the draft to remove errors and add actual business facts.
   - Exhausted, the operator posts the blog and abandons repurposing for GBP or social channels.
   - Six months later, the post is outdated, but no review system exists to flag it.
2. **Why It Exists**:
   - Lack of an intermediate planning stage (Brief).
   - Treating AI as an autonomous author instead of a constrained drafting engine.
   - Disconnecting content creation from everyday customer inquiries.
3. **Consequences**:
   - Wasted hours, low conversion, search engine penalties for unhelpful content, and absence from AI Overview answer boxes.
4. **Desired Improvement**:
   - A structured, staged assembly line where AI handles tedious structuring and drafting under strict human factual control.

---

## 7. Desired Outcomes

1. **Predictable Cadence**: One high-quality, verified content piece produced every 1–2 weeks in under 90 minutes.
2. **Authentic Local Authority**: Content reflects real practitioner knowledge and directly answers questions local customers actually ask.
3. **60–70% Time Savings**: Elimination of "prompt paralysis" through structured inputs and briefs.
4. **1-to-5 Asset Multiplication**: Every master article seamlessly produces 1 GBP update, 2–3 service FAQs, 1 newsletter blurb, and social snippets with zero message drift.
5. **Evergreen Relevance**: Systematic audit protocol ensuring no obsolete claims remain published.

---

## 8. Five-Stage Canonical Workflow Architecture

The pilot implements canonical workflow **`WF-AICONTENT-001`**:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    WF-AICONTENT-001 PIPELINE                                     │
├─────────────────┬─────────────────┬─────────────────┬──────────────────┬─────────────────────────┤
│ 1. RESEARCH     │ 2. BRIEF        │ 3. CREATE       │ 4. REPURPOSE     │ 5. MAINTAIN             │
├─────────────────┼─────────────────┼─────────────────┼──────────────────┼─────────────────────────┤
│ Customer Qs     │ Content Brief   │ Context-Bound   │ Multi-Channel    │ Scheduled Reviews       │
│ Intent Gaps     │ Outline & Map   │ Drafting        │ Adaptation       │ Freshness Audits        │
│ Verified Facts  │ Human Approval  │ Practitioner QC │ Consistency Check│ Version Changelog       │
├─────────────────┼─────────────────┼─────────────────┼──────────────────┼─────────────────────────┤
│ OUTPUT:         │ OUTPUT:         │ OUTPUT:         │ OUTPUT:          │ OUTPUT:                 │
│ Research Notes  │ Approved Brief  │ Verified Master │ Asset Pack       │ Updated Evergreen       │
│ & Evidence Doc  │ (CB-001)        │ Draft           │ (GBP/FAQ/Email)  │ Content & Metadata      │
└─────────────────┴─────────────────┴─────────────────┴──────────────────┴─────────────────────────┘
```

### Detailed Stage Breakdown:

### Stage 1: RESEARCH
- **Objective**: Identify verified customer questions, search intent patterns, topic gaps, and source facts.
- **Inputs**: Real customer emails, phone logs, consultation questions, search query suggestions, business documentation.
- **Activities**: Inquiry clustering, intent categorization, competitor gap scanning, factual source compilation.
- **Outputs**: `Research Notes & Evidence Document`.
- **Quality Gate**: Questions must reflect verified customer inquiries; all business facts must have proven source documentation.

### Stage 2: BRIEF
- **Objective**: Convert raw research into a structured, single-page editorial blueprint before drafting begins.
- **Inputs**: Research Notes & Evidence Document, brand tone guidelines, target audience context.
- **Activities**: Core thesis formulation, H2/H3 outline structuring, 1:1 fact-to-section mapping, CTA definition.
- **Outputs**: `Content Brief` (e.g. `CB-001`).
- **Quality Gate**: Brief must be approved *prior* to drafting; every section must have mapped source evidence; no ambiguous sections.

### Stage 3: CREATE
- **Objective**: Draft a clear, scannable, engaging first draft strictly following the approved brief.
- **Inputs**: Approved Content Brief, business voice guidelines, terminology glossary.
- **Activities**: Section-by-section constrained drafting, cliché removal, practitioner voice infusion, line-by-line factual review.
- **Outputs**: `Publication-Ready Master Draft`.
- **Quality Gate**: Draft strictly follows the brief outline; 100% of claims match source facts; human operator has read and approved every sentence.

### Stage 4: REPURPOSE
- **Objective**: Reconfigure the master article into derivative channel formats without introducing message drift or factual contradictions.
- **Inputs**: Approved Master Draft, destination platform specifications (GBP, FAQ, Newsletter, Social).
- **Activities**: Takeaway extraction, format adaptation, length calibration, cross-asset consistency verification.
- **Outputs**: `Repurposed Content Asset Pack` (1 GBP post, 2–3 service page FAQ pairs, 1 email blurb, 2 social cards).
- **Quality Gate**: Every derivative asset links back to master draft; zero new unverified claims introduced; tone fits target channel.

### Stage 5: MAINTAIN
- **Objective**: Prevent content decay and preserve long-term AI search visibility through scheduled and event-driven updates.
- **Inputs**: Published article URL/markdown, operational change notices (prices, hours, services), freshness audit logs.
- **Activities**: Review trigger monitoring, temporal decay scanning ("recently", "in 2024"), targeted section patching, metadata update.
- **Outputs**: `Updated Content & Governance Changelog`.
- **Quality Gate**: Stale facts/links corrected; changelog notes recorded; governance recertification signed.

---

## 9. Capability Map (Tool-Agnostic)

The 14 required capabilities defined in `WF-AICONTENT-001`:

```
STAGE 1: RESEARCH
  ├── CAP-RES-01: Customer Inquiry Discovery & Clustering
  ├── CAP-RES-02: Search & AI Intent Analysis
  ├── CAP-RES-03: Topic & Competitor Gap Analysis
  └── CAP-RES-04: Source Fact Gathering & Synthesis

STAGE 2: BRIEF
  ├── CAP-BRF-01: Content Structuring & Outlining
  ├── CAP-BRF-02: Evidence & Point Mapping
  └── CAP-BRF-03: Audience Intent Alignment

STAGE 3: CREATE
  ├── CAP-CRT-01: Context-Bound Drafting
  ├── CAP-CRT-02: Local Tone & Voice Calibration
  └── CAP-CRT-03: Fact Verification & Editing

STAGE 4: REPURPOSE
  ├── CAP-REP-01: Semantic Format Transformation
  └── CAP-REP-02: Cross-Asset Consistency Checking

STAGE 5: MAINTAIN
  ├── CAP-MNT-01: Content Freshness Auditing
  └── CAP-MNT-02: Revision Patching & Changelogging
```

---

## 10. Capability vs. Tool Boundary

This boundary is fundamental to LOCATRIA's architecture:

```
┌───────────────────────────────────────────────┬──────────────────────────────────────────────┐
│ CAPABILITY (Sprint A.3.1 Boundary)            │ TOOL (Deferred to Sprint A.3.3)              │
├───────────────────────────────────────────────┼──────────────────────────────────────────────┤
│ Abstract operational requirement              │ Concrete software product or implementation  │
│ Stable over years                             │ Volatile; features and pricing change weekly  │
│ Defines WHAT needs to be done                 │ Implements HOW it is executed                │
│ Evaluated against user workflow fit           │ Evaluated against capability satisfaction    │
│ Zero commercial affiliation possible          │ Potential commercial metadata (Affiliate)     │
│ Example: "Semantic Format Transformation"     │ Example: "Product X", "Product Y", or script │
└───────────────────────────────────────────────┴──────────────────────────────────────────────┘
```

> **Strict Rule**: No software products, vendors, or tools are selected, scored, or listed in Sprint A.3.1.

---

## 11. Quality Gates (Non-Numeric)

Quality is enforced through binary, objective verification gates rather than arbitrary numeric scores:

1. **Research Gate**: Are inquiries drawn from real customer touchpoints? Are all facts verifiable against business documentation?
2. **Brief Gate**: Is the brief approved before drafting begins? Is there 1:1 evidence mapping for every outline section?
3. **Creation Gate**: Did drafting adhere strictly to the outline? Did the human practitioner review and verify all claims?
4. **Repurposing Gate**: Do all derivative assets match the master draft with zero message drift?
5. **Maintenance Gate**: Was a review trigger logged? Were temporal phrases and broken links resolved? Was metadata updated?

---

## 12. Operational Risks & Mitigation

| Operational Risk | Stage | Manifestation | Mitigation Protocol |
|---|---|---|---|
| **AI Hallucination** | Research & Create | Plausible but incorrect medical, legal, or pricing claims. | Human supplies all core facts; AI restricted to constrained drafting; human verification gate. |
| **Robotic / Generic Tone** | Create | Bland corporate text that fails to engage or rank. | Content Brief with specific section instructions and practitioner anecdotes. |
| **Premature Drafting** | Brief | Jumping straight into generation without a brief. | Hard rule: Drafting is blocked until Content Brief is formally approved. |
| **Context Compression Loss** | Repurpose | Misleading short-form summaries that omit critical nuances. | Cross-asset consistency verification comparing short-form claims to master draft. |
| **Content Decay** | Maintain | Obsolete claims remaining live on website and cited by AI. | Calendar-based review triggers and event-driven update protocol. |

---

## 13. Human + AI Responsibility Matrix

Operating model: **Founder + AI + System**

```
┌───────────────────┬───────────────────────────────────────┬───────────────────────────────────────┐
│ Workflow Stage    │ AI System Role (Assistant)            │ Human Practitioner Role (Decider)     │
├───────────────────┼───────────────────────────────────────┼───────────────────────────────────────┤
│ 1. Research       │ Groups inquiries, finds query nuances │ Confirms customer priority, provides  │
│                   │ and related search questions.         │ proprietary business specifications.  │
├───────────────────┼───────────────────────────────────────┼───────────────────────────────────────┤
│ 2. Brief          │ Generates outline options and formats │ Approves core thesis, finalizes       │
│                   │ structured brief blueprint.           │ outline hierarchy and CTA.            │
├───────────────────┼───────────────────────────────────────┼───────────────────────────────────────┤
│ 3. Create         │ Expands brief points into natural,    │ Line-by-line verification, injects    │
│                   │ scannable draft prose.                │ practitioner voice, signs off.        │
├───────────────────┼───────────────────────────────────────┼───────────────────────────────────────┤
│ 4. Repurpose      │ Formats text into GBP updates, FAQs,  │ Verifies channel suitability, checks  │
│                   │ and social snippets.                  │ nuance retention, approves publishing.│
├───────────────────┼───────────────────────────────────────┼───────────────────────────────────────┤
│ 5. Maintain       │ Scans text for temporal decay and     │ Validates operational changes,        │
│                   │ drafts surgical update patches.       │ approves edits, signs governance log. │
└───────────────────┴───────────────────────────────────────┴───────────────────────────────────────┘
```

---

## 14. Connection to Existing LOCATRIA Knowledge

The pilot workflow directly builds upon 11 existing published articles in `content/`:

1. **Foundational Architecture**:
   - `how-to-build-simple-ai-content-workflow-local-business` (Article #05): The end-to-end framework for local businesses.
2. **Research Nodes**:
   - `ai-content-research-workflow-local-businesses` (Article #21): Customer-focused research methodology.
   - `ai-faq-research-workflow-local-businesses` (Article #23): Harvesting questions from daily interactions.
   - `ai-competitor-content-gap-analysis-workflow` (Article #28): Spotting underserved local search queries.
3. **Brief Node**:
   - `ai-content-brief-workflow-local-businesses` (Article #22): The canonical content brief template and rules.
4. **Creation Node**:
   - `ai-prompt-workflow-local-business-content-creation` (Article #29): Context-bound prompting techniques for drafting.
5. **Repurposing Nodes**:
   - `ai-content-repurposing-workflow-local-businesses` (Article #24): Systematic derivative asset generation.
   - `ai-content-repurposing-workflow-real-estate-businesses` (Article #19): Real estate multi-channel repurposing.
   - `ai-assisted-legal-content-repurposing-workflow` (Article #14): High-compliance legal repurposing.
6. **Maintenance Nodes**:
   - `ai-content-update-workflow-local-businesses` (Article #27): Trigger-based updating workflows.
   - `ai-assisted-local-business-content-update-maintenance-workflow` (Article #33): Routine content audit procedures.

---

## 15. Deferred Roadmap to A.3.2 – A.3.5

The completion of Sprint A.3.1 unlocks subsequent pilot phases:

- **Sprint A.3.2 — Capability Mapping & Evaluation Criteria**: Define concrete evaluation criteria (Problem Fit, Privacy, Cost, Usability) for each of the 14 capabilities.
- **Sprint A.3.3 — Candidate Tool Discovery & Longlisting**: Identify real candidate software tools that support these capabilities.
- **Sprint A.3.4 — Empirical Evaluation & Evidence Collection**: Conduct rigorous benchmark testing, collect empirical evidence, and draft canonical Evaluation records.
- **Sprint A.3.5 — Recommendation Decision & Resource Layer Publication**: Publish the first production Tool, Resource, Evaluation, and Recommendation records into `resource-data/`.
