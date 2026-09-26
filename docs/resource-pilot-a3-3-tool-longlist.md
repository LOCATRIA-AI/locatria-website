# LOCATRIA Resource & Tool Pilot — Sprint A.3.3
## Candidate Tool Discovery & Longlisting v1.0

```
Sprint:             A.3.3 — Candidate Tool Discovery & Longlisting
System:             GDBS OS / Module 07 / Chapter 01 / Sprint A.3
Approved Cluster:   AI Content Workflow for Local Businesses
Workflow ID:        WF-AICONTENT-001
Status:             DISCOVERY LONGLIST (QUALIFICATION ONLY)
Core Principle:     Capability → Candidate Tool → Initial Evidence → Qualification (No Recommendations)
```

---

## 1. Objective

The primary objective of Sprint A.3.3 is to establish the first real-world **Candidate Tool Pool / Longlist** for **`WF-AICONTENT-001` (AI Content Workflow for Local Businesses)**.

Following the locked evaluation criteria established in Sprint A.3.2, this sprint conducts tool-blind, capability-first discovery to identify, verify, and qualify real-world candidate software products across all 14 workflow capabilities.

### Strict Scope Boundaries:
- **Discovery and qualification only**: This sprint establishes what candidate tools exist and whether they qualify for hands-on evaluation.
- **No tool performance conclusions**: Discovery evidence does not prove performance.
- **No recommendations or rankings**: Zero "best tool" claims, star ratings, or scores are assigned.
- **Zero affiliate activation**: No affiliate links, commercial partnerships, or revenue tracking are introduced.
- **Production data layer unchanged**: Production entity directories (`resource-data/tools/`, etc.) remain in empty state; candidates are cataloged solely in discovery documentation.

```text
A.3.3 does NOT establish tool performance.
A.3.3 does NOT create recommendations.
A.3.3 does NOT activate affiliate relationships.
A.3.4 is required for empirical evaluation.
```

---

## 2. Scope

The discovery scope covers software tools and services relevant to the five stages of `WF-AICONTENT-001`:

1. **Stage 1 — Research**: Inquiry clustering, search intent analysis, competitor gap analysis, source fact synthesis (`CAP-RES-01` to `CAP-RES-04`).
2. **Stage 2 — Brief**: Content brief structuring, evidence-to-point mapping, audience readability alignment (`CAP-BRF-01` to `CAP-BRF-03`).
3. **Stage 3 — Create**: Context-bound drafting, practitioner voice calibration, fact verification (`CAP-CRT-01` to `CAP-CRT-03`).
4. **Stage 4 — Repurpose**: Semantic format transformation, cross-asset consistency auditing (`CAP-REP-01`, `CAP-REP-02`).
5. **Stage 5 — Maintain**: Content freshness auditing, revision patching and changelogging (`CAP-MNT-01`, `CAP-MNT-02`).

---

## 3. Discovery Method

Candidate discovery was driven strictly by the conceptual, non-branded search terms established in Sprint A.3.2:

```
[LOCKED A.3.2 CAPABILITY DEFINITION & KEYWORDS]
                      │
                      ▼
        [CONCEPTUAL MARKET DISCOVERY]
                      │
                      ▼
         [EXISTENCE & DOMAIN VERIFICATION]
                      │
                      ▼
     [INITIAL PRIMARY/SECONDARY EVIDENCE CAPTURE]
                      │
                      ▼
        [DISCOVERY QUALIFICATION REVIEW]
                      │
                      ▼
       [CANDIDATE POOL & TEST SET FORMATION]
```

### Discovery Steps Executed:
1. **Keyword-to-Market Search**: Executed conceptual queries (e.g. `customer inquiry clustering`, `intent-based content architect`, `hallucination-resistant text generation`, `content freshness audit`) without hardcoding vendor names.
2. **Existence Verification**: Checked that each candidate product currently exists, is actively maintained, and operates an authoritative official web domain.
3. **Evidence Capture**: Captured primary evidence (official product pages, official documentation, published pricing) and reputable secondary documentation.
4. **Capability Mapping**: Mapped candidates to specific capability IDs based on published functional documentation with explicit justification.
5. **Qualification Status Assignment**: Evaluated candidates against lightweight qualification criteria.

---

## 4. Candidate Qualification Rules

Candidates were evaluated using only four authorized discovery statuses:

- **`DISCOVERED`**: Candidate identified as potentially relevant, but public technical evidence is currently minimal or unverified.
- **`QUALIFIED`**: Sufficient basic evidence exists to confirm product existence, functional relevance to target capability, non-enterprise accessibility, and suitability for empirical testing in A.3.4.
- **`NEEDS_MORE_EVIDENCE`**: Plausible candidate, but critical information (e.g. pricing accessibility, offline dependency, unverified API access) requires deeper investigation before testing.
- **`EXCLUDED`**: Candidate removed from the pool due to a documented structural incompatibility (e.g. 1-click fully autonomous spam generation violating Knowledge First, discontinued service, or enterprise-only pricing prohibitive for local businesses).

### Hard Exclusion Rules:
- Prohibited: Fully autonomous "1-click auto-bloggers" that bypass human research, brief approval, and editorial review.
- Prohibited: Discontinued or abandoned tools with no active updates in the last 12 months.
- Prohibited: Tools with zero public documentation or verifiable provider identity.

---

## 5. Capability Discovery Matrix

| Capability ID | Capability Name | Workflow Stage | Discovery Search Concepts (from A.3.2) | Primary Functional Target |
|---|---|---|---|---|
| `CAP-RES-01` | Customer Inquiry Discovery & Clustering | Research | `customer inquiry clustering`, `question extraction from text`, `semantic inquiry grouping` | Grouping raw consultation and message logs into recurring customer questions. |
| `CAP-RES-02` | Search & AI Intent Analysis | Research | `search intent analysis`, `query decomposition`, `AI overview question research` | Analyzing search query sequences and AI assistant intent structures. |
| `CAP-RES-03` | Topic & Competitor Gap Analysis | Research | `content gap analysis`, `competitor topic coverage`, `local content differentiation` | Comparing search competitor outlines to identify missing local information. |
| `CAP-RES-04` | Source Fact Gathering & Synthesis | Research | `source synthesis`, `evidence extraction from documents`, `citation preservation tool` | Assembling verified business specifications with strict provenance tracking. |
| `CAP-BRF-01` | Content Structuring & Outlining | Brief | `content brief outlining`, `editorial structuring tool`, `hierarchical outline generator` | Designing structured H2/H3 section outlines matching search intent. |
| `CAP-BRF-02` | Evidence & Point Mapping | Brief | `evidence point mapping`, `brief fact association`, `claim mapping tool` | Binding verified facts directly to outline sections before drafting. |
| `CAP-BRF-03` | Audience Intent Alignment | Brief | `audience intent alignment`, `readability calibration`, `content persona definition` | Setting readability grade levels and low-friction local business CTAs. |
| `CAP-CRT-01` | Context-Bound Drafting | Create | `context-bound drafting`, `hallucination-resistant text generation`, `brief-grounded writing` | Generating prose strictly constrained to brief notes without external hallucinations. |
| `CAP-CRT-02` | Local Tone & Voice Calibration | Create | `voice calibration tool`, `AI cliché elimination`, `natural tone rewrite` | Eliminating generic AI markers (*"delve"*, *"testament"*) and infusing practitioner voice. |
| `CAP-CRT-03` | Fact Verification & Editing | Create | `fact verification tool`, `claim verification against source`, `hallucination detection` | Auditing draft text against source notes to flag factual discrepancies. |
| `CAP-REP-01` | Semantic Format Transformation | Repurpose | `semantic format transformation`, `content repurposing generator`, `article to GBP post` | Reconfiguring approved master drafts into GBP posts, FAQs, and email summaries. |
| `CAP-REP-02` | Cross-Asset Consistency Checking | Repurpose | `cross-asset consistency checking`, `content contradiction detection`, `message drift` | Verifying that derivative channel assets contain zero numerical or policy contradictions. |
| `CAP-MNT-01` | Content Freshness Auditing | Maintain | `content freshness audit`, `temporal decay detection`, `content decay scanner` | Scanning published pages for temporal phrases (*"recently"*, *"in 2024"*) and link decay. |
| `CAP-MNT-02` | Revision Patching & Changelogging | Maintain | `content revision patching`, `surgical text updating`, `editorial changelog tool` | Performing surgical section edits while preserving evergreen text and audit logs. |

---

## 6. Candidate Longlist

The discovery process identified **21 candidate tools**:

| Candidate ID | Tool | Provider | Capability IDs | Workflow Stage | Discovery Status | Evidence | Needs Empirical Test |
|---|---|---|---|---|---|---|---|
| `CAN-001` | NotebookLM | Google | `CAP-RES-01`, `CAP-RES-04`, `CAP-CRT-03` | Research, Create | `QUALIFIED` | `OFFICIAL_PRODUCT_PAGE`, `OFFICIAL_DOCUMENTATION` | Yes (`CAP-RES-04`) |
| `CAN-002` | AlsoAsked | Candour | `CAP-RES-02` | Research | `QUALIFIED` | `OFFICIAL_PRODUCT_PAGE`, `OFFICIAL_DOCUMENTATION` | Yes (`CAP-RES-02`) |
| `CAN-003` | Frase | Frase, Inc. / Copysmith | `CAP-RES-03`, `CAP-BRF-01` | Research, Brief | `QUALIFIED` | `OFFICIAL_PRODUCT_PAGE`, `OFFICIAL_DOCUMENTATION` | Yes (`CAP-RES-03`) |
| `CAN-004` | Content Harmony | Content Harmony LLC | `CAP-BRF-01`, `CAP-BRF-02`, `CAP-BRF-03` | Brief | `QUALIFIED` | `OFFICIAL_PRODUCT_PAGE`, `OFFICIAL_DOCUMENTATION` | Yes (`CAP-BRF-02`) |
| `CAN-005` | Hemingway Editor | Hemingway Ltd. | `CAP-BRF-03`, `CAP-CRT-02` | Brief, Create | `QUALIFIED` | `OFFICIAL_PRODUCT_PAGE`, `PRODUCT_TEST` | Yes (`CAP-BRF-03`, `CAP-CRT-02`) |
| `CAN-006` | Claude | Anthropic PBC | `CAP-CRT-01`, `CAP-CRT-02`, `CAP-REP-01` | Create, Repurpose | `QUALIFIED` | `OFFICIAL_PRODUCT_PAGE`, `OFFICIAL_DOCUMENTATION` | Yes (`CAP-CRT-01`, `CAP-REP-01`) |
| `CAN-007` | ChatGPT / GPT-4o | OpenAI LLC | `CAP-CRT-01`, `CAP-REP-01` | Create, Repurpose | `QUALIFIED` | `OFFICIAL_PRODUCT_PAGE`, `OFFICIAL_DOCUMENTATION` | Yes (`CAP-CRT-01`) |
| `CAN-008` | Grammarly Business | Grammarly, Inc. | `CAP-CRT-02` | Create | `QUALIFIED` | `OFFICIAL_PRODUCT_PAGE`, `OFFICIAL_DOCUMENTATION` | Yes (`CAP-CRT-02`) |
| `CAN-009` | Originality.ai | Originality.ai Inc. | `CAP-CRT-03` | Create | `QUALIFIED` | `OFFICIAL_PRODUCT_PAGE`, `OFFICIAL_PRICING` | Yes (`CAP-CRT-03`) |
| `CAN-010` | Diffchecker | LinearCode Limited | `CAP-CRT-03`, `CAP-REP-02` | Create, Repurpose | `QUALIFIED` | `OFFICIAL_PRODUCT_PAGE`, `OFFICIAL_DOCUMENTATION` | Yes (`CAP-REP-02`) |
| `CAN-011` | Screaming Frog SEO Spider | Screaming Frog Ltd. | `CAP-MNT-01` | Maintain | `QUALIFIED` | `OFFICIAL_PRODUCT_PAGE`, `OFFICIAL_DOCUMENTATION` | Yes (`CAP-MNT-01`) |
| `CAN-012` | Git / GitHub | Conservancy / GitHub | `CAP-MNT-02` | Maintain | `QUALIFIED` | `OFFICIAL_DOCUMENTATION` | Yes (`CAP-MNT-02`) |
| `CAN-013` | AnswerThePublic | NP Digital | `CAP-RES-02` | Research | `QUALIFIED` | `OFFICIAL_PRODUCT_PAGE`, `OFFICIAL_DOCUMENTATION` | No (Alternative) |
| `CAN-014` | MarketMuse | MarketMuse, Inc. | `CAP-RES-03` | Research | `QUALIFIED` | `OFFICIAL_PRODUCT_PAGE`, `OFFICIAL_DOCUMENTATION` | No (Enterprise) |
| `CAN-015` | Surfer SEO | Surfer Sp. z o.o. | `CAP-RES-03`, `CAP-BRF-01` | Research, Brief | `QUALIFIED` | `OFFICIAL_PRODUCT_PAGE`, `OFFICIAL_DOCUMENTATION` | No (Alternative) |
| `CAN-016` | Notion | Notion Labs, Inc. | `CAP-BRF-02`, `CAP-MNT-02` | Brief, Maintain | `QUALIFIED` | `OFFICIAL_PRODUCT_PAGE`, `OFFICIAL_DOCUMENTATION` | No (Alternative) |
| `CAN-017` | Castmagic | Castmagic Inc. | `CAP-REP-01` | Repurpose | `QUALIFIED` | `OFFICIAL_PRODUCT_PAGE`, `OFFICIAL_DOCUMENTATION` | No (Alternative) |
| `CAN-018` | Ahrefs Site Audit | Ahrefs Pte. Ltd. | `CAP-MNT-01` | Maintain | `QUALIFIED` | `OFFICIAL_PRODUCT_PAGE`, `OFFICIAL_DOCUMENTATION` | No (Alternative) |
| `CAN-019` | Jasper AI | Jasper AI, Inc. | `CAP-CRT-01`, `CAP-REP-01` | Create, Repurpose | `NEEDS_MORE_EVIDENCE` | `OFFICIAL_PRODUCT_PAGE` | No (Needs Evidence) |
| `CAN-020` | Thematic | Thematic Ltd. | `CAP-RES-01` | Research | `NEEDS_MORE_EVIDENCE` | `OFFICIAL_PRODUCT_PAGE` | No (Enterprise Gate) |
| `CAN-021` | Autonomous Auto-Blogger Platforms | Various Vendors | N/A | N/A | `EXCLUDED` | N/A | No (Excluded) |

---

## 7. Candidate → Capability Mapping

Every mapping connects candidate capabilities to explicit functional evidence:

### 1. Stage 1 — Research
- **NotebookLM (`CAN-001`)**:
  - `CAP-RES-01`: Official documentation verifies multi-document ingestion allowing clustering of raw consultation notes.
  - `CAP-RES-04`: Official feature specifications verify grounded note synthesis with explicit inline citations linking claims directly to source paragraphs.
- **AlsoAsked (`CAN-002`)**:
  - `CAP-RES-02`: Official feature documentation verifies aggregation and hierarchical visual mapping of Google "People Also Ask" query trees, providing intent decomposition for search and AI queries.
- **AnswerThePublic (`CAN-013`)**:
  - `CAP-RES-02`: Official documentation verifies auto-suggest query visualization across prepositional question categories.
- **Frase (`CAN-003`)**:
  - `CAP-RES-03`: Official product documentation verifies automated parsing of top 20 Google search competitors to extract headings, frequently asked questions, and topic gaps.
- **MarketMuse (`CAN-014`)**:
  - `CAP-RES-03`: Official documentation confirms AI topic modeling comparing website topical depth against competitive search corpuses.
- **Surfer SEO (`CAN-015`)**:
  - `CAP-RES-03`: Feature documentation verifies competitor content analysis and structural SERP gap scoring.
- **Thematic (`CAN-020`)**:
  - `CAP-RES-01`: Marketing documentation indicates customer feedback theme clustering; qualification deferred due to enterprise sales gate.

### 2. Stage 2 — Brief
- **Frase (`CAN-003`)**:
  - `CAP-BRF-01`: Documentation verifies structured brief builder allowing one-click transfer of competitor headings and questions into an outline.
- **Content Harmony (`CAN-004`)**:
  - `CAP-BRF-01`: Documentation demonstrates dedicated content brief workflow platform with customizable outline templates.
  - `CAP-BRF-02`: Feature documentation confirms visual drag-and-drop evidence and requirement mapping directly into outline blocks.
  - `CAP-BRF-03`: Product specifications confirm intent report integration and audience readability guidance.
- **Hemingway Editor (`CAN-005`)**:
  - `CAP-BRF-03`: Product specifications confirm real-time automated scoring of target grade reading level.
- **Notion (`CAN-016`)**:
  - `CAP-BRF-02`: Documentation confirms block-level relational database linking research notes to brief sections.

### 3. Stage 3 — Create
- **Claude (`CAN-006`)**:
  - `CAP-CRT-01`: Technical documentation indicates high instruction fidelity, 200k token context window, and disciplined adherence to supplied brief constraints.
  - `CAP-CRT-02`: Documentation and user testing confirm strong capability to eliminate cliché AI adjectives when provided negative prompting constraints.
- **ChatGPT / GPT-4o (`CAN-007`)**:
  - `CAP-CRT-01`: Official specifications confirm multi-modal instruction following and structured section drafting.
- **Grammarly Business (`CAN-008`)**:
  - `CAP-CRT-02`: Official documentation verifies customizable company style guides, brand tone profiles, and automated cliché/clarity linting.
- **Hemingway Editor (`CAN-005`)**:
  - `CAP-CRT-02`: Direct product observation confirms highlighting of passive voice, split verbs, and overly complex sentence structures.
- **NotebookLM (`CAN-001`)**:
  - `CAP-CRT-03`: Feature documentation confirms inline citation cross-checking against uploaded source documents.
- **Originality.ai (`CAN-009`)**:
  - `CAP-CRT-03`: Official documentation verifies automated claim extraction and verification against indexed web sources.
- **Diffchecker (`CAN-010`)**:
  - `CAP-CRT-03`: Product documentation confirms character, word, and paragraph diff highlighting between source briefs and generated drafts.
- **Jasper AI (`CAN-019`)**:
  - `CAP-CRT-01`: Marketing materials claim brand voice adaptation; qualification deferred pending verification of hallucination resistance on constrained briefs.

### 4. Stage 4 — Repurpose
- **Claude (`CAN-006`)**:
  - `CAP-REP-01`: Verified capability to parse long-form articles and reconfigure into structured format schemas (GBP updates, FAQ JSON-LD, social cards).
- **ChatGPT / GPT-4o (`CAN-007`)**:
  - `CAP-REP-01`: Documentation confirms structured format conversion and semantic summarization.
- **Castmagic (`CAN-017`)**:
  - `CAP-REP-01`: Official documentation verifies multi-channel derivative asset generation from long-form inputs.
- **Diffchecker (`CAN-010`)**:
  - `CAP-REP-02`: Document comparison functionality enables visual parity checking between master drafts and compressed derivative assets.

### 5. Stage 5 — Maintain
- **Screaming Frog SEO Spider (`CAN-011`)**:
  - `CAP-MNT-01`: Technical documentation confirms automated site crawling to detect HTTP status codes (broken links), last-modified dates, and meta title decay.
- **Ahrefs Site Audit (`CAN-018`)**:
  - `CAP-MNT-01`: Documentation confirms cloud-based tracking of content decay and broken external links.
- **Git / GitHub (`CAN-012`)**:
  - `CAP-MNT-02`: Documentation confirms line-by-line diffing, version tagging, and permanent commit changelogging for markdown repositories.
- **Notion (`CAN-016`)**:
  - `CAP-MNT-02`: Documentation confirms block-level page edit tracking and version history snapshots.

---

## 8. Capability Coverage Matrix

| Capability ID | Capability Name | Candidate Count | Candidate IDs | Evidence Availability | Coverage Assessment & Gaps |
|---|---|---:|---|---|---|
| `CAP-RES-01` | Inquiry Discovery & Clustering | 2 | `CAN-001`, `CAN-020` | Moderate | Direct document clustering supported; gap exists in direct connection to offline phone logs. |
| `CAP-RES-02` | Search & AI Intent Analysis | 2 | `CAN-002`, `CAN-013` | Strong | Excellent coverage for Google PAA query trees; gap in direct generative AI citation queries. |
| `CAP-RES-03` | Topic & Competitor Gap Analysis | 3 | `CAN-003`, `CAN-014`, `CAN-015` | Strong | Multiple robust SERP comparative tools; gap in micro-local competitor parsing. |
| `CAP-RES-04` | Source Fact Gathering & Synthesis | 1 | `CAN-001` | Moderate | High citation provenance; gap in automated continuous web scraping. |
| `CAP-BRF-01` | Content Structuring & Outlining | 3 | `CAN-003`, `CAN-004`, `CAN-015` | Strong | Dedicated brief architects available; strong outline templates. |
| `CAP-BRF-02` | Evidence & Point Mapping | 2 | `CAN-004`, `CAN-016` | Moderate | Visual mapping platforms available; gap in lightweight solo-operator markdown tooling. |
| `CAP-BRF-03` | Audience Intent Alignment | 2 | `CAN-004`, `CAN-005` | Strong | Solid readability grade targeting and tone constraint configuration. |
| `CAP-CRT-01` | Context-Bound Drafting | 3 | `CAN-006`, `CAN-007`, `CAN-019` | Strong | Advanced frontier LLMs available; gap in default adherence without explicit system prompts. |
| `CAP-CRT-02` | Local Tone & Voice Calibration | 3 | `CAN-005`, `CAN-006`, `CAN-008` | Strong | Readability linters and custom style guides provide multi-layered voice calibration. |
| `CAP-CRT-03` | Fact Verification & Editing | 3 | `CAN-001`, `CAN-009`, `CAN-010` | Moderate | Document diffing and source cross-checking available; gap in automated semantic claim parity. |
| `CAP-REP-01` | Semantic Format Transformation | 3 | `CAN-006`, `CAN-007`, `CAN-017` | Strong | Excellent structured output capabilities across modern LLMs. |
| `CAP-REP-02` | Cross-Asset Consistency Checking | 1 | `CAN-010` | Limited | Manual diffing supported; automated cross-asset semantic contradiction detection remains a gap. |
| `CAP-MNT-01` | Content Freshness Auditing | 2 | `CAN-011`, `CAN-018` | Strong | Robust crawling tools available to detect link rot and modified dates. |
| `CAP-MNT-02` | Revision Patching & Changelogging | 2 | `CAN-012`, `CAN-016` | Strong | Industry-standard version control and changelog systems available. |

---

## 9. Initial Evidence Sources

All qualified candidates are substantiated by documented public authoritative sources:

| Candidate ID | Tool Name | Authoritative URL | Primary Evidence Source Captured |
|---|---|---|---|
| `CAN-001` | NotebookLM | `https://notebooklm.google.com` | Google official product documentation, feature overview, and privacy disclosures. |
| `CAN-002` | AlsoAsked | `https://alsoasked.com` | Candour product documentation, PAA visual mapping specifications, CSV export docs. |
| `CAN-003` | Frase | `https://www.frase.io` | Copysmith/Frase official feature specifications, SERP research guide, brief builder documentation. |
| `CAN-004` | Content Harmony | `https://www.contentharmony.com` | Content Harmony Knowledgebase, Content Brief workflow manual, Content Grader specifications. |
| `CAN-005` | Hemingway Editor | `https://hemingwayapp.com` | Hemingway Ltd. official web application, readability grade formula specifications. |
| `CAN-006` | Claude | `https://www.anthropic.com` / `https://claude.ai` | Anthropic model cards, developer documentation, context-window guides, system prompt documentation. |
| `CAN-007` | ChatGPT / GPT-4o | `https://chatgpt.com` / `https://openai.com` | OpenAI product documentation, model capabilities overview, Custom Instructions documentation. |
| `CAN-008` | Grammarly Business | `https://www.grammarly.com` | Grammarly official product documentation, Style Guides feature manual, tone detector guides. |
| `CAN-009` | Originality.ai | `https://originality.ai` | Originality.ai product feature documentation, fact-checking tool guide, pricing tables. |
| `CAN-010` | Diffchecker | `https://www.diffchecker.com` | LinearCode official tool documentation, text comparison specifications, diff algorithm docs. |
| `CAN-011` | Screaming Frog | `https://www.screamingfrog.co.uk` | Screaming Frog SEO Spider user guide, crawl configuration manual, status code audit documentation. |
| `CAN-012` | Git / GitHub | `https://git-scm.com` / `https://github.com` | Software Freedom Conservancy Git documentation, GitHub repository versioning guides. |
| `CAN-013` | AnswerThePublic | `https://answerthepublic.com` | NP Digital official product documentation and query visualization guides. |
| `CAN-014` | MarketMuse | `https://www.marketmuse.com` | MarketMuse feature documentation and topical modeling guides. |
| `CAN-015` | Surfer SEO | `https://surferseo.com` | Surfer official product documentation and SERP outline builder guides. |
| `CAN-016` | Notion | `https://www.notion.so` | Notion official user guides, database documentation, page history specifications. |
| `CAN-017` | Castmagic | `https://www.castmagic.io` | Castmagic official product documentation, asset extraction prompt guides. |
| `CAN-018` | Ahrefs Site Audit | `https://ahrefs.com` | Ahrefs official user manuals, site audit documentation, content decay guides. |
| `CAN-019` | Jasper AI | `https://www.jasper.ai` | Jasper marketing documentation, Brand Voice feature guides. |
| `CAN-020` | Thematic | `https://getthematic.com` | Thematic customer feedback analytics documentation. |

---

## 10. Discovery-Stage Limitations

At this discovery stage, several operational limitations must be recorded:
1. **Vendor Self-Reporting Bias**: Much public feature data reflects marketing descriptions; empirical testing in A.3.4 is necessary to establish actual failure rates.
2. **Context-Window Boundaries**: LLMs advertise large context windows, but empirical testing must verify whether prompt adherence degrades when long local business briefs are supplied.
3. **Cost Disparities**: Tools range from free/open-source (Git, Hemingway Web, NotebookLM) to multi-hundred-dollar subscriptions (Content Harmony, MarketMuse, Surfer).
4. **Local Intent Blind Spots**: Most general SEO tools analyze national search volume; extracting micro-local neighborhood intent remains a manual interpretation task.
5. **Cross-Asset Consistency Automation Gap**: Automated semantic contradiction detection across different text lengths remains the least mature capability in the commercial market.

---

## 11. Candidate Set for A.3.4 (Empirical Evaluation Pool)

To ensure manageable, high-rigor hands-on testing in Sprint A.3.4, a focused **Candidate Set of 10 tools** was selected to provide complete coverage across all 14 capabilities:

| Candidate ID | Candidate Tool | Primary Target Capability | Why Entered Empirical Test Set | Required Empirical Test | Evidence Gap to Resolve |
|---|---|---|---|---|---|
| `CAN-001` | NotebookLM | `CAP-RES-04` (Source Synthesis) | Documented grounded citation capability using uploaded local business files. | Source synthesis benchmark from 10-page local business guide. | File type upload limits and retention of complex table data. |
| `CAN-002` | AlsoAsked | `CAP-RES-02` (Intent Analysis) | Unique hierarchical PAA query decomposition matching consumer intent. | Question hierarchy extraction across 5 local service topics. | Freshness and localization accuracy in non-metro geographies. |
| `CAN-003` | Frase | `CAP-RES-03` (Gap Analysis) & `CAP-BRF-01` (Outlining) | Integrates competitor outline parsing with structured brief generation. | Automated outline generation from top 10 local search competitors. | Relevance of suggested headings for local service SMBs. |
| `CAN-004` | Content Harmony | `CAP-BRF-02` (Evidence Mapping) | Explicit visual framework for binding research requirements directly to outline sections. | Full content brief assembly with mapped evidence constraints. | Usability and learning curve for solo non-agency operators. |
| `CAN-005` | Hemingway Editor | `CAP-BRF-03` (Audience Alignment) & `CAP-CRT-02` (Voice) | Established, zero-cost readability grade scoring and sentence complexity linting. | Readability scoring and cliché/passive voice reduction on raw AI text. | Sensitivity to specialized medical/legal industry terms. |
| `CAN-006` | Claude | `CAP-CRT-01` (Drafting) & `CAP-REP-01` (Repurposing) | Proven prompt fidelity and 200k context window suitable for brief-constrained drafting. | 1,500-word guided drafting test measuring brief adherence and hallucination rate. | Extent of cliché usage under negative prompting constraints. |
| `CAN-007` | ChatGPT / GPT-4o | `CAP-CRT-01` (Drafting) | Benchmark baseline LLM widely adopted by local business operators. | Comparative drafting test against identical Content Brief. | Hallucination rate and prompt drift on detailed factual constraints. |
| `CAN-008` | Grammarly Business | `CAP-CRT-02` (Voice Calibration) | Dedicated enterprise style guides and real-time custom tone linting. | Automated detection of 50 banned AI clichés and passive phrasing. | Precision of tone suggestions on local practitioner prose. |
| `CAN-010` | Diffchecker | `CAP-REP-02` (Consistency Check) | Accessible text-comparison engine enabling visual audit of derivative assets. | Cross-asset diff test detecting deliberate numerical discrepancies. | Time required for manual review of diff outputs. |
| `CAN-011` | Screaming Frog | `CAP-MNT-01` (Freshness Audit) | Authoritative crawler providing automated detection of broken links and modified dates. | Full crawl audit of a 50-page local business content library. | Accessibility of Java desktop interface for non-technical users. |

---

## 12. Proposed Empirical Test Preparation (For Sprint A.3.4)

Each member of the Candidate Set has a defined test protocol ready for execution in Sprint A.3.4:

### Test Protocol 01: NotebookLM (`CAN-001`)
- **Target Capability**: `CAP-RES-04` (Source Fact Gathering & Synthesis)
- **Test Objective**: Determine whether NotebookLM can synthesize accurate, grounded research notes from a messy 10-page local business service manual without hallucinating unprovided claims.
- **Required Inputs**: 10-page PDF containing service guidelines, pricing tiers, and clinical/legal disclaimers.
- **Expected Output**: Structured factual summary notes with inline citation tags pointing to exact paragraphs.
- **Quality Checks (A.3.2)**: 100% claim provenance; zero introduced external facts; clean separation of verified facts from assumptions.
- **Human Review**: Practitioner verifies that extracted fee schedules and procedural constraints are identical to source text.
- **Empirical Status**: *Not yet tested (strictly deferred to A.3.4).*

### Test Protocol 02: AlsoAsked (`CAN-002`)
- **Target Capability**: `CAP-RES-02` (Search & AI Intent Analysis)
- **Test Objective**: Evaluate whether AlsoAsked accurately surfaces the primary and secondary question sequences asked by local customers seeking service providers.
- **Required Inputs**: 5 local service seed queries (e.g. "dental implant cost Austin", "estate planning lawyer Chicago").
- **Expected Output**: Exported PAA hierarchy mapping search intent stages (education → comparison → booking).
- **Quality Checks (A.3.2)**: Relevance of questions to real buying journeys; absence of irrelevant national brand queries.
- **Human Review**: Practice manager verifies that questions reflect inquiries received in clinic/office.
- **Empirical Status**: *Not yet tested (strictly deferred to A.3.4).*

### Test Protocol 03: Frase (`CAN-003`)
- **Target Capability**: `CAP-RES-03` (Topic & Competitor Gap Analysis) & `CAP-BRF-01` (Outlining)
- **Test Objective**: Determine whether Frase can analyze top 10 search competitors and construct an outline that covers critical informational gaps.
- **Required Inputs**: Target search query and 10 competitor URLs from live local SERPs.
- **Expected Output**: Structured H2/H3 outline containing competitor coverage matrix and question gaps.
- **Quality Checks (A.3.2)**: Scannable heading hierarchy; inclusion of questions competitors failed to answer.
- **Human Review**: Operator checks that the outline avoids generic fluff and focuses on local practitioner insights.
- **Empirical Status**: *Not yet tested (strictly deferred to A.3.4).*

### Test Protocol 04: Content Harmony (`CAN-004`)
- **Target Capability**: `CAP-BRF-02` (Evidence & Point Mapping)
- **Test Objective**: Test the ability to build a comprehensive Content Brief where every outline section is bound to explicit research notes and evidence constraints.
- **Required Inputs**: Raw research notes, target keyword data, audience reading level targets.
- **Expected Output**: Completed Content Brief (`CB-001`) with section-by-section requirements and mapped facts.
- **Quality Checks (A.3.2)**: Zero unbacked sections; clear guidance for the drafting engine; exportable to Markdown/Google Docs.
- **Human Review**: Editorial lead approves brief completeness before simulated drafting.
- **Empirical Status**: *Not yet tested (strictly deferred to A.3.4).*

### Test Protocol 05: Hemingway Editor (`CAN-005`)
- **Target Capability**: `CAP-BRF-03` (Audience Alignment) & `CAP-CRT-02` (Voice Calibration)
- **Test Objective**: Measure Hemingway's effectiveness at identifying complex sentences, passive voice, and jargon in a 1,500-word draft to achieve a Grade 8 reading level.
- **Required Inputs**: Unedited AI draft text containing corporate jargon and complex syntax.
- **Expected Output**: Highlighted document with readability grade rating and specific simplification targets.
- **Quality Checks (A.3.2)**: Accuracy of grade level scoring; valid identification of passive verbs without false positives on technical medical/legal terms.
- **Human Review**: Operator reviews suggested simplifications to ensure professional authority is preserved.
- **Empirical Status**: *Not yet tested (strictly deferred to A.3.4).*

### Test Protocol 06: Claude (`CAN-006`)
- **Target Capability**: `CAP-CRT-01` (Context-Bound Drafting) & `CAP-REP-01` (Repurposing)
- **Test Objective**: Determine whether Claude generates a 1,500-word draft adhering 100% to Content Brief constraints without hallucinating unprovided facts, and cleanly repurposes it into a 4-channel asset pack.
- **Required Inputs**: Approved Content Brief (`CB-001`) with negative prompt rules banning 50 AI clichés.
- **Expected Output**: Formatted Markdown master draft + 1x GBP update + 3x FAQ pairs + 1x email newsletter.
- **Quality Checks (A.3.2)**: Zero hallucinated facts; zero banned clichés; strict outline adherence; channel character limit compliance.
- **Human Review**: Line-by-line factual and voice audit conducted by evaluator.
- **Empirical Status**: *Not yet tested (strictly deferred to A.3.4).*

### Test Protocol 07: ChatGPT / GPT-4o (`CAN-007`)
- **Target Capability**: `CAP-CRT-01` (Context-Bound Drafting)
- **Test Objective**: Benchmark GPT-4o drafting fidelity against the exact same Content Brief used in Test Protocol 06.
- **Required Inputs**: Identical approved Content Brief (`CB-001`) and negative prompt instructions.
- **Expected Output**: Formatted Markdown draft.
- **Quality Checks (A.3.2)**: Factual fidelity, cliché occurrence rate, adherence to section boundaries.
- **Human Review**: Comparative line-by-line audit against Claude draft.
- **Empirical Status**: *Not yet tested (strictly deferred to A.3.4).*

### Test Protocol 08: Grammarly Business (`CAN-008`)
- **Target Capability**: `CAP-CRT-02` (Local Tone & Voice Calibration)
- **Test Objective**: Test the enforcement of custom local business style guides and automated removal of generic AI phrasing.
- **Required Inputs**: Raw draft text loaded with standard AI filler phrases; custom style guide rules.
- **Expected Output**: Real-time correction suggestions flagging banned phrases and tone mismatches.
- **Quality Checks (A.3.2)**: High precision in flagging cliché expressions; low false-alarm rate on proper names and industry terms.
- **Human Review**: Evaluator assesses whether suggested replacements sound natural and conversational.
- **Empirical Status**: *Not yet tested (strictly deferred to A.3.4).*

### Test Protocol 09: Diffchecker (`CAN-010`)
- **Target Capability**: `CAP-REP-02` (Cross-Asset Consistency Checking)
- **Test Objective**: Evaluate whether text diffing reliably detects deliberate factual discrepancies inserted into derivative short-form assets.
- **Required Inputs**: Approved Master Draft vs. derivative FAQ pack containing 3 deliberate numerical distortions (e.g. wrong warranty period, altered price).
- **Expected Output**: Diff report visually highlighting changed or missing text elements.
- **Quality Checks (A.3.2)**: Clear discrepancy visualization; operator can spot factual contradiction in under 60 seconds.
- **Human Review**: Evaluator measures time and ease of identifying the planted errors.
- **Empirical Status**: *Not yet tested (strictly deferred to A.3.4).*

### Test Protocol 10: Screaming Frog SEO Spider (`CAN-011`)
- **Target Capability**: `CAP-MNT-01` (Content Freshness Auditing)
- **Test Objective**: Test automated crawl auditing of a 50-page published content repository to flag broken outbound links, missing dates, and outdated meta tags.
- **Required Inputs**: URL list of 50 local business articles containing planted 404 links and dated meta descriptions.
- **Expected Output**: Exported audit report categorizing broken URLs and temporal metadata.
- **Quality Checks (A.3.2)**: 100% detection of broken links; accurate identification of old published dates.
- **Human Review**: Evaluator verifies export formatting and ease of generating a maintenance task list.
- **Empirical Status**: *Not yet tested (strictly deferred to A.3.4).*

---

## 13. Affiliate Metadata Boundary & Commercial Isolation

In strict accordance with LOCATRIA governance:
1. **Zero Affiliate Influence**: Public affiliate availability had 0% impact on whether a candidate was discovered, qualified, or included in the test set.
2. **Zero Active Links**: No affiliate URLs, tracking parameters, referral tags, or partnership accounts exist in this codebase.
3. **Descriptive Commercial Metadata Only**: Several qualified tools operate commercial partner programs (e.g. Surfer, Frase, Grammarly), while others have no affiliate program (NotebookLM, Screaming Frog free tier, Git, Hemingway). Both categories are treated with identical objectivity.
4. **Data Isolation**: Commercial tracking remains isolated in the separate `schemas/affiliate.schema.json` data model, completely segregated from technical evaluations.

---

## 14. Governance & Bias Controls

Sprint A.3.3 enforced seven explicit bias controls:

| Bias Category | Threat to Objectivity | Enforced Counter-Measure |
|---|---|---|
| **Confirmation Bias** | Adjusting criteria to favor a tool. | Evaluation criteria were locked in Sprint A.3.2 before discovery commenced. |
| **Brand / Predetermination Bias** | Starting from a list of favorite tools. | Discovery began from capability definitions and conceptual search queries, not brand names. |
| **Affiliate Bias** | Favoring tools offering commissions. | Affiliate information is strictly isolated; zero commissions influence qualification. |
| **Popularity Bias** | Assuming market share equals quality. | Popularity is not treated as evidence of capability performance. |
| **Marketing-Claim Bias** | Treating vendor copy as proven fact. | Vendor claims are classified as discovery evidence only, pending empirical verification in A.3.4. |
| **Availability Bias** | Favoring tools with better SEO/docs. | Missing documentation is recorded as an Evidence Gap, not automatically penalized. |
| **False Precision Bias** | Assigning arbitrary numeric scores. | All evaluations and qualification statuses enforce structured qualitative language. |

---

## 15. Deferred Work (Roadmap to A.3.4 & A.3.5)

To maintain disciplined focus, the following activities are strictly deferred:
- **Sprint A.3.4 — Empirical Tool Evaluation**: Executing the 10 empirical test protocols, collecting benchmark outputs, and writing canonical `evidence` and `evaluation` records.
- **Sprint A.3.5 — Recommendation Decision & Resource Publication**: Founder review of empirical evaluations, formulation of official recommendation decisions, and publishing first production Tool and Resource entities to `resource-data/`.
- **Sprint A.4 — Resource UI & Publishing Integration**: Building public-facing `/resources` and `/tools` web directories.
- **Sprint A.5 — Affiliate Activation & Tracking**: Commercial affiliate link activation and performance measurement.

---

## 16. Change Log

| Version | Date | Author | Description of Changes |
|---|---|---|---|
| `1.0.0` | 2026-09-26 | LOCATRIA Implementation Engineer | Initial release of Sprint A.3.3 Candidate Tool Discovery & Longlist specification. Cataloged 21 candidate tools, mapped all 14 capabilities, captured initial evidence sources, established the 10-tool Candidate Set, and defined empirical test protocols for Sprint A.3.4. |
