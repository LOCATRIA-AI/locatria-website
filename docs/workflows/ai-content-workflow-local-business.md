# Canonical Workflow Specification: WF-AICONTENT-001
# AI Content Workflow for Local Businesses

```
Workflow ID:        WF-AICONTENT-001
Workflow Name:      AI Content Workflow for Local Businesses
System Version:     v1.0 (GDBS OS / Module 07 / Sprint A.3.1)
Operating Model:    Founder + AI + System (Knowledge First)
Status:             CANONICAL PILOT SPECIFICATION
Target Cluster:     AI Content Workflow for Local Businesses
```

---

## 1. Executive Overview

`WF-AICONTENT-001` establishes a disciplined, repeatable, five-stage operational workflow for local business operators to research, plan, draft, repurpose, and maintain authoritative content.

The workflow explicitly rejects the "AI as a magical one-click copywriter" fallacy. Instead, it embeds AI as a capability-level accelerator within a human-governed system:

```
[STAGE 1: RESEARCH] ──► [STAGE 2: BRIEF] ──► [STAGE 3: CREATE] ──► [STAGE 4: REPURPOSE] ──► [STAGE 5: MAINTAIN]
   Customer Inquiries       Structured Plan         Context-Bound Draft       Multi-Channel Assets      Freshness Auditing
   & Search Gaps            & Core Thesis           & Verification            & Consistency Check        & Version Logging
```

---

## 2. Target User Definition

### 2.1 Role & Profile
The primary user represents a **Local Business Owner, Solo Practitioner, Office Manager, or In-House Generalist Marketer** (e.g., dental practice manager, boutique law firm partner, independent real estate broker, specialized trade contractor).

### 2.2 Operational Context
- **No Dedicated Content Team**: Does not have in-house copywriters, SEO directors, or agency retainers.
- **Time Constraints**: Has 60–90 minutes per week allocated to content and local marketing amidst core operational duties.
- **AI Literacy**: Experiments with consumer AI interfaces (e.g. typing raw prompts into chat windows), but frequently encounters generic, hallucinated, or robotic text.
- **Liability & Accuracy Boundaries**: Operates in real-world verticals where inaccurate statements, misleading claims, or outdated pricing carry professional, legal, or reputational risks.
- **Core Motivation**: Wants to reliably answer customer questions, demonstrate genuine local expertise, and gain visibility across search engines and AI answer engines (Google AI Overviews, ChatGPT Search, Perplexity) without operational friction.

---

## 3. Primary User Problem

### 3.1 Problem Statement
Local businesses need a repeatable, trustworthy method to research, plan, draft, repurpose, and maintain authoritative content without burning time, producing generic AI filler, or introducing factual inaccuracies.

### 3.2 Friction Analysis
1. **The "Blank Page & Random Prompt Trap"**: Operators open a blank chat prompt and type ad-hoc requests ("write a blog about our service"). The AI responds with generic, bland text devoid of local specifics, real customer pain points, or verifiable expertise.
2. **Unstructured Drafting Without a Brief**: Skipping the planning phase forces operators to spend hours rewriting or editing disorganized AI drafts, leading to fatigue and abandoned initiatives.
3. **Repurposing Bottlenecks**: Creating derivative assets (Google Business Profile updates, service page FAQs, social summaries) requires repetitive manual re-prompting, frequently introducing message drift and contradictory claims.
4. **Content Decay ("Publish & Forget")**: Published pages sit unreviewed for months or years. When service hours, prices, or regulatory guidelines change, the business has no systematic trigger to update existing content, resulting in misinformation across AI retrieval engines.

---

## 4. Desired Outcomes

- **Consistent Output**: A sustainable cadence of 1 high-value, verified content asset per week or bi-weekly.
- **Local Authority & Quality**: Content directly answers verified customer search inquiries with precise practitioner perspective.
- **Cognitive Load Reduction**: Clear, stage-by-stage boundaries eliminate prompt paralysis and cut drafting friction by 60–70%.
- **Cross-Channel Asset Multiplication**: A single core asset reliably yields 4–5 derivative assets (GBP updates, FAQs, summaries) with 100% factual consistency.
- **Evergreen Knowledge Maintenance**: Systematic review triggers prevent outdated information and maintain search/AI visibility over time.

---

## 5. Five-Stage Canonical Workflow Specification

### 5.1 STAGE 1 — RESEARCH

#### Objective
Discover and gather real customer questions, search intent patterns, topic gaps, and verifiable source facts before writing any copy.

#### Inputs
- Real customer inquiries (emails, phone inquiries, intake notes, consultation records).
- Search query data and search engine autocomplete/PPA patterns.
- Existing business documentation (service descriptions, price lists, clinic/firm policies).
- Competitor local coverage observations.

#### Activities
1. **Inquiry Harvesting**: Collect real customer questions received during recent customer interactions.
2. **Search Intent Classification**: Determine whether searchers seek high-level education, service comparisons, or immediate local booking details.
3. **Coverage Gap Identification**: Inspect existing local search results to identify unanswered sub-questions or poorly explained nuances.
4. **Source Fact Assembly**: Compile verified business facts, citations, and operational details into structured research notes.

#### Required Capabilities
- `CAP-RES-01`: Customer Inquiry Discovery & Clustering
- `CAP-RES-02`: Search & AI Intent Analysis
- `CAP-RES-03`: Topic & Competitor Gap Analysis
- `CAP-RES-04`: Source Fact Gathering & Synthesis

#### Stage Output
- **Research Notes & Evidence Document** containing:
  - Target customer problem statement.
  - Primary customer question and 3–5 related sub-questions.
  - Verified business facts, data points, and constraints.
  - Search intent classification (Informational / Evaluation / Local Service).

#### Quality Gate
- [ ] Questions originate from real customer inquiries, not hypothetical brainstorms.
- [ ] Every key fact is verified against business documentation or practitioner knowledge.
- [ ] Assumptions are explicitly separated from confirmed facts.

#### Operational Risks & Limitations
- *Risk*: AI models hallucinate industry statistics or legal/clinical claims.
- *Mitigation*: Human operator must provide or verify all proprietary business facts; AI is restricted to structuring and clustering.

---

### 5.2 STAGE 2 — BRIEF

#### Objective
Transform raw research notes and verified facts into a comprehensive, structured editorial brief that governs the drafting phase.

#### Inputs
- Research Notes & Evidence Document (from Stage 1).
- Business brand voice, perspective, and terminology rules.
- Target audience role and decision context.

#### Activities
1. **Core Thesis Formulation**: Establish the single primary lesson or solution the content provides.
2. **Outline Architecture**: Build a logical section hierarchy (H2 and H3 subheadings) that sequentially answers the customer's questions.
3. **Evidence & Point Mapping**: Map specific verified facts and practitioner insights directly into their corresponding outline sections.
4. **Takeaways & Call-to-Action Definition**: Define explicit reader takeaways and an appropriate, low-pressure next step (e.g. consult checklist, contact office).

#### Required Capabilities
- `CAP-BRF-01`: Content Structuring & Outlining
- `CAP-BRF-02`: Evidence & Point Mapping
- `CAP-BRF-03`: Audience Intent Alignment

#### Stage Output
- **Content Brief** (`CB-001`) containing:
  - Working Title Concept.
  - Target Reader Persona & Stage of Need.
  - Primary Problem & Core Thesis.
  - Section-by-Section Outline with mapped facts and evidence notes.
  - Key Takeaways list (3–5 bullet points).
  - Defined Call-to-Action (CTA).

#### Quality Gate
- [ ] The brief is completed and approved *before* drafting commences.
- [ ] Every outline section has mapped facts or practitioner notes; zero unbacked sections exist.
- [ ] Logical flow moves clearly from problem definition to practical resolution.

#### Operational Risks & Limitations
- *Risk*: Jumping straight into drafting without a brief, resulting in sprawling, unfocused text.
- *Mitigation*: Hard rule: No drafting without an approved Content Brief.

---

### 5.3 STAGE 3 — CREATE

#### Objective
Draft a comprehensive, highly readable, engaging, and verified first draft strictly adhering to the approved Content Brief.

#### Inputs
- Approved Content Brief (`CB-001`).
- Practitioner voice guidelines and forbidden phrase list (e.g. banning generic AI filler words).
- Business service specifications.

#### Activities
1. **Section-by-Section Drafting**: Generate prose section-by-section using the mapped brief notes, ensuring the text directly answers each sub-question.
2. **Voice & Tone Calibration**: Eliminate corporate jargon, overly promotional fluff, and robotic phrasing; infuse local practitioner perspective.
3. **Factual Verification Check**: Review generated text line-by-line against the source research notes to ensure zero introduced hallucinations.
4. **Structural Formatting**: Format draft with scannable headings, bullet points, callout boxes, and descriptive anchor links.

#### Required Capabilities
- `CAP-CRT-01`: Context-Bound Drafting
- `CAP-CRT-02`: Local Tone & Voice Calibration
- `CAP-CRT-03`: Fact Verification & Editing

#### Stage Output
- **Draft Content** (Complete, publication-ready article or guide in Markdown/HTML with verified claims, scannable structure, and practitioner sign-off).

#### Quality Gate
- [ ] Content strictly follows the approved brief structure without unprompted topic drift.
- [ ] All factual claims match the verified research notes.
- [ ] Reading level is clear, jargon-free, and natural.
- [ ] Human operator has read, verified, and approved the entire text.

#### Operational Risks & Limitations
- *Risk*: AI introduces plausible-sounding but inaccurate procedural or pricing statements.
- *Mitigation*: Human practitioner verification is a mandatory blocking checkpoint before publication.

---

### 5.4 STAGE 4 — REPURPOSE

#### Objective
Systematically transform the approved core article into derivative channel assets without introducing message drift or factual contradictions.

#### Inputs
- Approved Draft Content (from Stage 3).
- Channel format specifications:
  - Google Business Profile (GBP) Post (100–150 words, local update).
  - Standalone Service Page FAQ items (question + concise 50-word answer).
  - Client / Patient Email Summary (short newsletter blurb).
  - Social / LinkedIn Snippets (key takeaway cards).

#### Activities
1. **Core Takeaway Extraction**: Isolate key lessons, statistics, and answers from the master draft.
2. **Format Adaptation**: Reformat extracted takeaways into target channel constraints (character limits, tone variations).
3. **Consistency Verification**: Cross-reference all derivative drafts against the master article to verify that facts, numbers, and recommendations align 100%.

#### Required Capabilities
- `CAP-REP-01`: Semantic Format Transformation
- `CAP-REP-02`: Cross-Asset Consistency Checking

#### Stage Output
- **Repurposed Content Assets Pack**:
  - 1x GBP Update Post.
  - 2–3x Standalone FAQ pairs for service pages.
  - 1x Email Newsletter Blurb.
  - 2x Social Media Snippets.

#### Quality Gate
- [ ] Every derivative asset is traceable back to the approved core draft.
- [ ] Zero new, unverified claims were introduced during compression or format shifting.
- [ ] Links and call-to-actions point back to the authoritative core article or service page.

#### Operational Risks & Limitations
- *Risk*: Nuance loss during summarization leading to misleading short-form claims.
- *Mitigation*: Strict consistency check against the master draft before distribution.

---

### 5.5 STAGE 5 — MAINTAIN

#### Objective
Maintain long-term content accuracy, relevance, and AI search visibility through scheduled reviews and event-driven updates.

#### Inputs
- Published Content URL and source Markdown.
- Operational change triggers (pricing adjustments, staff changes, new equipment, updated business hours).
- External regulatory or industry updates.
- Performance and search/AI visibility feedback.

#### Activities
1. **Trigger Monitoring**: Check for scheduled review dates (e.g. 6-month or 12-month cycle) or operational event triggers.
2. **Freshness & Decay Audit**: Inspect text for temporal statements ("recently", "in 2024"), broken external links, or outdated procedures.
3. **Targeted Revision**: Surgically update affected sections while leaving sound evergreen explanations intact.
4. **Governance Logging**: Update metadata (`updatedAt`, `lastReviewed`, `reviewNotes`) to record the audit in the repository.

#### Required Capabilities
- `CAP-MNT-01`: Content Freshness Auditing
- `CAP-MNT-02`: Revision Patching & Changelogging

#### Stage Output
- **Updated / Maintained Content** (Refreshed article with updated timestamps, validated claims, and documented changelog).

#### Quality Gate
- [ ] Outdated facts, dates, and links have been updated or removed.
- [ ] Update changelog documents what changed and why.
- [ ] Governance recertification is recorded with reviewer identity.

#### Operational Risks & Limitations
- *Risk*: Content decay where old, inaccurate advice continues to be retrieved by search and AI assistants.
- *Mitigation*: Routine calendar-based audit triggers and event-driven update workflows.

---

## 6. Capability Map

This matrix details the required capabilities across all five stages **without reference to software products**:

| Capability ID | Capability Name | Workflow Stage | Purpose & Definition | Required Characteristics |
|---|---|---|---|---|
| `CAP-RES-01` | Customer Inquiry Discovery & Clustering | 1. Research | Extracts, parses, and groups real customer inquiries from unstructured text channels. | Semantic clustering, intent classification, noise filtering. |
| `CAP-RES-02` | Search & AI Intent Analysis | 1. Research | Analyzes how users formulate queries in search engines and AI assistants. | Query decomposition, intent categorization (info/trans/nav). |
| `CAP-RES-03` | Topic & Competitor Gap Analysis | 1. Research | Identifies missing information or thin coverage in local market search results. | Comparative analysis, topical depth evaluation, gap detection. |
| `CAP-RES-04` | Source Fact Gathering & Synthesis | 1. Research | Aggregates and organizes verified business specifications and citations. | Provenance tracking, separation of fact vs. assumption. |
| `CAP-BRF-01` | Content Structuring & Outlining | 2. Brief | Designs a logical, hierarchical content outline matching search intent. | Enforces heading levels (H2/H3), logical flow, scannability. |
| `CAP-BRF-02` | Evidence & Point Mapping | 2. Brief | Maps verified source data directly to designated sections of the outline. | 1:1 claim-to-evidence linkage, prevents unsupported sections. |
| `CAP-BRF-03` | Audience Intent Alignment | 2. Brief | Calibrates content depth, terminology, and objectives for the reader profile. | Readability targeting, terminology constraints, CTA alignment. |
| `CAP-CRT-01` | Context-Bound Drafting | 3. Create | Generates prose strictly adhering to brief constraints without hallucinating. | Constrained expansion, outline adherence, hallucination resistance. |
| `CAP-CRT-02` | Local Tone & Voice Calibration | 3. Create | Calibrates prose to match authentic practitioner tone and local community context. | Cliche elimination, conversational clarity, active voice. |
| `CAP-CRT-03` | Fact Verification & Editing | 3. Create | Inspects drafted copy for factual consistency, flow, and structural polish. | Discrepancy flagging, clarity optimization, flow verification. |
| `CAP-REP-01` | Semantic Format Transformation | 4. Repurpose | Adapts master narrative into structured formats (GBP post, FAQ pair, social). | Platform length compliance, meaning preservation, Q&A formatting. |
| `CAP-REP-02` | Cross-Asset Consistency Checking | 4. Repurpose | Verifies derivative assets against the master draft for factual parity. | Claim comparison, entity consistency checking, contradiction detection. |
| `CAP-MNT-01` | Content Freshness Auditing | 5. Maintain | Identifies stale data, outdated temporal references, and link decay. | Temporal phrase scanning, entity fact verification. |
| `CAP-MNT-02` | Revision Patching & Changelogging | 5. Maintain | Supports surgical section edits while recording audit history in metadata. | Surgical diffing, version tracking, governance metadata logging. |

---

## 7. Quality Gates Summary

Quality checks prevent downstream errors and ensure every asset is verified:

```
[RESEARCH GATE]       --> 100% verified customer questions & business facts. Zero ungrounded assumptions.
       ↓
[BRIEF GATE]          --> Completed brief with 1:1 evidence-to-section mapping before writing begins.
       ↓
[CREATE GATE]         --> Full human practitioner verification; zero unverified AI claims; authentic voice.
       ↓
[REPURPOSE GATE]      --> Strict cross-asset consistency; zero message drift from master draft.
       ↓
[MAINTAIN GATE]       --> Review trigger logged; stale claims updated; governance audit metadata recorded.
```

---

## 8. Operational Risk Management Matrix

| Risk Category | Stage | Root Cause | Consequence | Mitigation Strategy |
|---|---|---|---|---|
| **AI Hallucination** | Research & Create | LLM generating plausible-sounding but fictitious claims. | Inaccurate service claims; potential legal/health liability. | Human provides and verifies all core facts; AI restricted to constrained drafting. |
| **Generic Filler** | Create | Unconstrained prompts producing bland, repetitive corporate text. | Poor engagement; failure to rank in AI retrieval or search. | Content Brief with specific section instructions and practitioner anecdotes. |
| **Premature Drafting** | Brief | Operator skipping the brief to save time. | Disorganized drafts requiring extensive manual rewriting. | Mandatory quality gate: drafting is blocked until brief is approved. |
| **Message Drift** | Repurpose | Summarizing without checking against master content. | Conflicting instructions between website, social, and GBP. | Automated and human cross-referencing against the source article. |
| **Content Decay** | Maintain | "Publish and forget" mindset; no review cadence. | AI assistants quoting obsolete prices, hours, or procedures. | Automated calendar review triggers and event-driven update protocol. |

---

## 9. Human + AI Responsibility Matrix

Aligned with the **Founder + AI + System** operating paradigm:

```
┌─────────────────┬──────────────────────────────────────────┬──────────────────────────────────────────┐
│ Workflow Stage  │ AI System Responsibility (Assistant)     │ Human Operator Responsibility (Decider)  │
├─────────────────┼──────────────────────────────────────────┼──────────────────────────────────────────┤
│ 1. Research     │ Clusters inquiries, identifies query     │ Validates customer relevance; supplies   │
│                 │ variations, summarizes source material.  │ proprietary business specifications.     │
├─────────────────┼──────────────────────────────────────────┼──────────────────────────────────────────┤
│ 2. Brief        │ Formulates outline options, structures   │ Approves thesis, locks outline hierarchy,│
│                 │ brief template, arranges sections.       │ confirms strategic alignment.            │
├─────────────────┼──────────────────────────────────────────┼──────────────────────────────────────────┤
│ 3. Create       │ Expands brief notes into natural prose,  │ Line-by-line review, voice injection,    │
│                 │ drafts scannable explanations.           │ fact verification, final sign-off.       │
├─────────────────┼──────────────────────────────────────────┼──────────────────────────────────────────┤
│ 4. Repurpose    │ Reconfigures text into GBP posts, FAQs,   │ Verifies brevity, checks nuances,        │
│                 │ and social snippets.                     │ schedules/publishes to channels.         │
├─────────────────┼──────────────────────────────────────────┼──────────────────────────────────────────┤
│ 5. Maintain     │ Scans for temporal phrases, flags decay, │ Confirms operational changes, approves   │
│                 │ drafts section update patches.           │ revisions, signs governance log.         │
└─────────────────┴──────────────────────────────────────────┴──────────────────────────────────────────┘
```

---

## 10. Existing LOCATRIA Knowledge Connections

This pilot workflow builds directly upon the existing body of 38 published LOCATRIA knowledge articles:

| Workflow Stage | Article Production ID | Published Title | Relevance to Workflow |
|---|---|---|---|
| **End-to-End** | `how-to-build-simple-ai-content-workflow-local-business` | *How to Build a Simple AI Content Workflow for a Local Business* (Article #05) | The foundational framework and philosophy underpinning this canonical workflow. |
| **1. Research** | `ai-content-research-workflow-local-businesses` | *AI Content Research Workflow for Local Businesses* (Article #21) | Step-by-step methodology for customer-centric topic research. |
| **1. Research** | `ai-faq-research-workflow-local-businesses` | *AI FAQ Research Workflow for Local Businesses* (Article #23) | Extracting high-value questions from daily customer interactions. |
| **1. Research** | `ai-competitor-content-gap-analysis-workflow` | *AI Competitor Content Gap Analysis Workflow* (Article #28) | Identifying local market content gaps and underserved search queries. |
| **2. Brief** | `ai-content-brief-workflow-local-businesses` | *AI Content Brief Workflow for Local Businesses* (Article #22) | Canonical blueprinting structure: turning research into an executable brief. |
| **3. Create** | `ai-prompt-workflow-local-business-content-creation` | *AI Prompt Workflow for Local Business Content Creation* (Article #29) | Context-bound prompting techniques for accurate, human-reviewed drafting. |
| **4. Repurpose** | `ai-content-repurposing-workflow-local-businesses` | *AI Content Repurposing Workflow for Local Businesses* (Article #24) | Systematic transformation of single articles into multiple local channel assets. |
| **4. Repurpose** | `ai-content-repurposing-workflow-real-estate-businesses` | *AI Content Repurposing Workflow for Real Estate Businesses* (Article #19) | Specialized multi-channel asset extraction in real estate. |
| **4. Repurpose** | `ai-assisted-legal-content-repurposing-workflow` | *AI-Assisted Legal Content Repurposing Workflow* (Article #14) | High-compliance repurposing maintaining strict factual fidelity. |
| **5. Maintain** | `ai-content-update-workflow-local-businesses` | *AI Content Update Workflow for Local Businesses* (Article #27) | Trigger-based updating and freshness verification protocols. |
| **5. Maintain** | `ai-assisted-local-business-content-update-maintenance-workflow` | *How Local Businesses Can Use AI to Audit, Update, and Maintain Existing Content* (Article #33) | Scheduled maintenance calendar and operational decay mitigation. |

---

## 11. Upstream & Downstream Integration

```
[GDBS OS Module 07]
        │
        ▼
[Sprint A.1: Architecture v1.0]
        │
        ▼
[Sprint A.2: Canonical Schema & Data Layer v1.0]
        │
        ▼
[Sprint A.3.1: Pilot Problem & Workflow Definition (THIS ARTIFACT)]
        │  • Defined User, Problem, 5-Stage Workflow, & 14 Capabilities
        │  • Established Quality Gates & Human/AI Matrix
        │
        ▼  (STRICTLY DEFERRED TO NEXT SPRINTS)
[Sprint A.3.2: Capability Mapping & Evaluation Criteria]
        │  • Map capabilities to evaluation criteria (Problem Fit, Privacy, Cost, Usability)
        │
        ▼
[Sprint A.3.3: Candidate Tool Discovery & Longlisting]
        │  • Discover candidate tools matching required capabilities
        │
        ▼
[Sprint A.3.4: Empirical Evaluation & Evidence Collection]
        │  • Lab testing, benchmark verification, evaluation record creation
        │
        ▼
[Sprint A.3.5: Recommendation Decision & Resource Layer Publication]
           • First production Tool and Resource entities added to resource-data/
```
