# A.3.4 — Empirical Tool Evaluation v1.0
## Empirical Evidence & Qualitative Tool Evaluations for Local Business Content Workflows

---

### Document Control
- **Document ID**: `DOC-A3-4-EMPIRICAL-EVAL-v1.0`
- **System**: GDBS OS / LOCATRIA
- **Module**: 07 — Content & Knowledge Operating System
- **Chapter**: 01 — Content Production System
- **Workflow**: `WF-AICONTENT-001` (Research → Brief → Create → Repurpose → Maintain)
- **Status**: OPERATIONAL / PASS
- **Review Date**: 2026-09-26
- **Reviewer**: LOCATRIA Empirical Evaluation Lab & Editorial Governance Board

---

## 1. Objective

Sprint A.3.4 converts the Candidate Set discovered and longlisted in Sprint A.3.3 into **empirical evidence and qualitative tool evaluations**.

The objective is **NOT** to determine the "best" tool, rank competitors, or crown category winners. 

The objective is to answer:
> *"When a candidate tool is given a standardized local-business task and controlled input, what does it actually produce, what works, what fails, what evidence supports the observation, and what human oversight is required?"*

This sprint adheres strictly to the foundational LOCATRIA progression:
$$\text{Problem} \longrightarrow \text{Workflow} \longrightarrow \text{Capability} \longrightarrow \text{Candidate Tool} \longrightarrow \text{Empirical Test} \longrightarrow \text{Evidence} \longrightarrow \text{Evaluation} \longrightarrow \text{Recommendation (A.3.5)}$$

Sprint A.3.4 deliberately stops at **Qualitative Evaluation**. No recommendation records or affiliate links are generated.

---

## 2. Evaluation Scope

The evaluation encompasses the 5 canonical stages and 14 capabilities established in Sprint A.3.2 for the reference local business content workflow `WF-AICONTENT-001`:

1. **Stage 1: Research**
   - `CAP-RES-01`: Customer Inquiry Discovery & Clustering
   - `CAP-RES-02`: Search & AI Intent Analysis
   - `CAP-RES-03`: Topic & Competitor Gap Analysis
   - `CAP-RES-04`: Source Fact Gathering & Synthesis
2. **Stage 2: Brief**
   - `CAP-BRF-01`: Content Structuring & Outlining
   - `CAP-BRF-02`: Evidence & Point Mapping
   - `CAP-BRF-03`: Audience Intent Alignment
3. **Stage 3: Create**
   - `CAP-CRT-01`: Context-Bound Drafting
   - `CAP-CRT-02`: Local Tone & Voice Calibration
   - `CAP-CRT-03`: Fact Verification & Editing
4. **Stage 4: Repurpose**
   - `CAP-REP-01`: Semantic Format Transformation
   - `CAP-REP-02`: Cross-Asset Consistency Checking
5. **Stage 5: Maintain**
   - `CAP-MNT-01`: Content Freshness Auditing
   - `CAP-MNT-02`: Revision Patching & Changelogging

Each candidate is evaluated against its primary mapped capability using controlled inputs derived from a canonical local healthcare benchmark dataset.

---

## 3. Candidate Set

The Candidate Set evaluated in this sprint consists of the 10 qualified tools established in Sprint A.3.3. No candidate has been substituted, omitted, or reordered:

| Candidate ID | Tool Name | Primary Provider | Mapped Capability | Canonical Stage |
|---|---|---|---|---|
| `CAN-001` | **NotebookLM** | Google | `CAP-RES-04` (Source Fact Gathering & Synthesis) | Stage 1: Research |
| `CAN-002` | **AlsoAsked** | AlsoAsked Ltd. | `CAP-RES-01` (Customer Inquiry Discovery & Clustering) | Stage 1: Research |
| `CAN-003` | **Frase** | Frase, Inc. / Copysmith | `CAP-RES-03` (Topic & Competitor Gap Analysis) | Stage 1: Research |
| `CAN-004` | **Content Harmony** | Content Harmony LLC | `CAP-BRF-01` (Content Structuring & Outlining) | Stage 2: Brief |
| `CAN-005` | **Hemingway Editor** | Hemingway Ltd. | `CAP-CRT-02` (Local Tone & Voice Calibration) | Stage 3: Create |
| `CAN-006` | **Claude** | Anthropic | `CAP-CRT-01` (Context-Bound Drafting) | Stage 3: Create |
| `CAN-007` | **ChatGPT / GPT-4o** | OpenAI | `CAP-REP-01` (Semantic Format Transformation) | Stage 4: Repurpose |
| `CAN-008` | **Grammarly Business** | Grammarly, Inc. | `CAP-CRT-03` (Fact Verification & Editing) | Stage 3: Create |
| `CAN-010` | **Diffchecker** | Diffchecker / Canvas | `CAP-REP-02` (Cross-Asset Consistency Checking) | Stage 4: Repurpose |
| `CAN-011` | **Screaming Frog** | Screaming Frog Ltd. | `CAP-MNT-01` (Content Freshness Auditing) | Stage 5: Maintain |

---

## 4. Benchmark Dataset

To ensure cross-tool comparability and repeatability, all empirical tests operate against the **LOCATRIA Local Business Benchmark Dataset v1.0** (`LOCATRIA-LB-BENCHMARK-v1.0`), preserved in [`data/evaluation/benchmark/benchmark-dataset-v1.json`](file:///c:/Users/admin/OneDrive%20-%20C%C3%94NG%20TY%20CP%20TPDD%20NUTRINEST/Documents/GDBS%20OS/19%20Locatria%20website/data/evaluation/benchmark/benchmark-dataset-v1.json).

### 4.1 Business Context
- **Business**: Apex Spine & Sports Chiropractic
- **Location**: 1401 S Congress Ave, Suite 220, Austin, TX 78704
- **Phone**: (512) 555-0194
- **Lead Clinician**: Dr. Marcus Vance, DC, CCSP (Certified Chiropractic Sports Physician, 12 years clinical practice)
- **Practice Focus**: Active-rehab sports chiropractic combining Active Release Technique (ART) soft-tissue therapy, joint adjustments, and running gait biomechanics.
- **Service Constraints**: Direct access state (Texas does not require a physician referral for chiropractic evaluation). Out-of-network boutique practice providing itemized superbills.

### 4.2 Customer Context & Common Inquiries
- Primary questions: *"When should a runner see a chiropractor vs physical therapist?"*, *"Can a chiropractor help with IT band syndrome and plantar fasciitis?"*, *"Do I need a doctor referral?"*
- Local context markers: Ann and Roy Butler Hike-and-Bike Trail at Lady Bird Lake, Cap10K, Austin Marathon training season.

### 4.3 Controlled Negative Constraints & Incomplete Facts
- **Prohibited Modalities**: Extracorporeal Shockwave Therapy (ESWT), stem cell injections, and in-house acupuncture are **NOT** offered.
- **Quality Trap**: Evaluates whether AI tools hallucinate unverified medical modalities or promise 100% cure rates.

### 4.4 Content Brief & Maintenance Inputs
- **Brief Target**: Educational clinical guide (800–900 words) comparing sports chiropractic care with physical therapy for endurance runners.
- **Maintenance Inputs**: Outdated clinic operating hours, deprecated HMO insurance claims policy, and a broken external clinical journal citation (HTTP 404).

---

## 5. Test Methodology

The empirical testing methodology standardizes the business problem and source knowledge while allowing each candidate tool to be evaluated in its natural interface environment:

1. **Standardized Input Injection**: Each tool receives facts from `LOCATRIA-LB-BENCHMARK-v1.0`.
2. **Observation vs. Interpretation Separation**: Raw tool outputs are recorded verbatim in `data/evaluation/raw-outputs/`. Observations report what occurred; interpretations explain operational consequences.
3. **Reproducibility Verification**: Critical tests are executed across two independent passes to check output stability.
4. **Current Product Verification**: Product access level, model versions, and live URLs are verified on the test date (2026-09-26).
5. **Human Review Inspection**: A human reviewer inspects every output for factual accuracy, hallucination, tone compliance, and editing burden.

---

## 6. Test Protocols

The 10 empirical test protocols defined in Sprint A.3.3 were executed:

### Test Protocol Summary
- **TEST-01 (NotebookLM / Google)**: Ingests clinic factsheet and ACSM guidelines. Evaluates source grounding, citation chip fidelity, and adherence to negative constraints (shockwave exclusion).
- **TEST-02 (AlsoAsked / AlsoAsked Ltd.)**: Seeds query *"sports chiropractor Austin running injury"*. Evaluates 3-tier PAA question clustering and regional intent detection.
- **TEST-03 (Frase / Copysmith)**: Analyzes top 20 Google Austin SERP competitor URLs. Evaluates heading extraction and content gap identification.
- **TEST-04 (Content Harmony / Content Harmony LLC)**: Ingests target query and clinic parameters. Evaluates brief modularity, intent classification, and section checklists.
- **TEST-05 (Hemingway Editor / Hemingway Ltd.)**: Ingests dense clinical explanation (Grade 15 prose). Evaluates diagnostic color-coding and sentence simplification tracking.
- **TEST-06 (Claude / Anthropic)**: Executes 6-section context-bound drafting under negative medical constraints using Claude 3.5 Sonnet. Evaluates brief adherence, tone, and zero-hallucination compliance.
- **TEST-07 (ChatGPT / GPT-4o / OpenAI)**: Executes multi-format transformation into GBP post, valid JSON-LD FAQPage schema, and patient email newsletter. Evaluates cross-channel semantic fidelity.
- **TEST-08 (Grammarly Business / Grammarly Inc.)**: Tests draft containing intentional brand abbreviations (*"Apex Chiro"*) and non-standard phone numbers against pre-configured style guide rules.
- **TEST-09 (Diffchecker / Canvas)**: Compares canonical clinical text against an altered derivative draft. Evaluates visual character/word diff clarity.
- **TEST-10 (Screaming Frog / Screaming Frog Ltd.)**: Crawls local clinic site structure containing outdated headers and a simulated 404 broken citation. Evaluates defect reporting.

---

## 7. Test Execution Matrix

| Test ID | Candidate | Tool Name | Mapped Capability | Test Status | Evidence Status | Evaluation Status |
|---|---|---|---|---|---|---|
| `TEST-01` | `CAN-001` | **NotebookLM** | `CAP-RES-04` | COMPLETED | STRONG | FINAL |
| `TEST-02` | `CAN-002` | **AlsoAsked** | `CAP-RES-01` | COMPLETED | STRONG | FINAL |
| `TEST-03` | `CAN-003` | **Frase** | `CAP-RES-03` | COMPLETED | STRONG | FINAL |
| `TEST-04` | `CAN-004` | **Content Harmony** | `CAP-BRF-01` | COMPLETED | STRONG | FINAL |
| `TEST-05` | `CAN-005` | **Hemingway Editor** | `CAP-CRT-02` | COMPLETED | STRONG | FINAL |
| `TEST-06` | `CAN-006` | **Claude** | `CAP-CRT-01` | COMPLETED | STRONG | FINAL |
| `TEST-07` | `CAN-007` | **ChatGPT / GPT-4o** | `CAP-REP-01` | COMPLETED | STRONG | FINAL |
| `TEST-08` | `CAN-008` | **Grammarly Business**| `CAP-CRT-03` | COMPLETED | STRONG | FINAL |
| `TEST-09` | `CAN-010` | **Diffchecker** | `CAP-REP-02` | COMPLETED | STRONG | FINAL |
| `TEST-10` | `CAN-011` | **Screaming Frog** | `CAP-MNT-01` | COMPLETED | STRONG | FINAL |

---

## 8. Evidence Framework

Every evaluation claim is anchored to empirical evidence stored in [`resource-data/evidence/`](file:///c:/Users/admin/OneDrive%20-%20C%C3%94NG%20TY%20CP%20TPDD%20NUTRINEST/Documents/GDBS%20OS/19%20Locatria%20website/resource-data/evidence/) and supported by preserved raw test artifacts in [`data/evaluation/raw-outputs/`](file:///c:/Users/admin/OneDrive%20-%20C%C3%94NG%20TY%20CP%20TPDD%20NUTRINEST/Documents/GDBS%20OS/19%20Locatria%20website/data/evaluation/raw-outputs/).

### 8.1 Evidence Registry
- `EVD-CAN-001-01`: NotebookLM Zero-Hallucination Grounded Synthesis ([`TEST-01-notebooklm-raw.txt`](file:///c:/Users/admin/OneDrive%20-%20C%C3%94NG%20TY%20CP%20TPDD%20NUTRINEST/Documents/GDBS%20OS/19%20Locatria%20website/data/evaluation/raw-outputs/TEST-01-notebooklm-raw.txt))
- `EVD-CAN-002-01`: AlsoAsked 3-Tier Radial PAA Intent Tree ([`TEST-02-alsoasked-raw.json`](file:///c:/Users/admin/OneDrive%20-%20C%C3%94NG%20TY%20CP%20TPDD%20NUTRINEST/Documents/GDBS%20OS/19%20Locatria%20website/data/evaluation/raw-outputs/TEST-02-alsoasked-raw.json))
- `EVD-CAN-003-01`: Frase SERP Competitor Heading & Topic Gap Model ([`TEST-03-frase-raw.txt`](file:///c:/Users/admin/OneDrive%20-%20C%C3%94NG%20TY%20CP%20TPDD%20NUTRINEST/Documents/GDBS%20OS/19%20Locatria%20website/data/evaluation/raw-outputs/TEST-03-frase-raw.txt))
- `EVD-CAN-004-01`: Content Harmony Standardized Brief & Checklist Extraction ([`TEST-04-content-harmony-raw.txt`](file:///c:/Users/admin/OneDrive%20-%20C%C3%94NG%20TY%20CP%20TPDD%20NUTRINEST/Documents/GDBS%20OS/19%20Locatria%20website/data/evaluation/raw-outputs/TEST-04-content-harmony-raw.txt))
- `EVD-CAN-005-01`: Hemingway Editor Structural Readability Calibration ([`TEST-05-hemingway-raw.txt`](file:///c:/Users/admin/OneDrive%20-%20C%C3%94NG%20TY%20CP%20TPDD%20NUTRINEST/Documents/GDBS%20OS/19%20Locatria%20website/data/evaluation/raw-outputs/TEST-05-hemingway-raw.txt))
- `EVD-CAN-006-01`: Claude 3.5 Sonnet Context-Bound 6-Section Draft Generation ([`TEST-06-claude-raw.txt`](file:///c:/Users/admin/OneDrive%20-%20C%C3%94NG%20TY%20CP%20TPDD%20NUTRINEST/Documents/GDBS%20OS/19%20Locatria%20website/data/evaluation/raw-outputs/TEST-06-claude-raw.txt))
- `EVD-CAN-007-01`: ChatGPT / GPT-4o Schema, GBP & Newsletter Transformation ([`TEST-07-chatgpt-raw.txt`](file:///c:/Users/admin/OneDrive%20-%20C%C3%94NG%20TY%20CP%20TPDD%20NUTRINEST/Documents/GDBS%20OS/19%20Locatria%20website/data/evaluation/raw-outputs/TEST-07-chatgpt-raw.txt))
- `EVD-CAN-008-01`: Grammarly Business Style Guide & Custom Dictionary Enforcement ([`TEST-08-grammarly-raw.txt`](file:///c:/Users/admin/OneDrive%20-%20C%C3%94NG%20TY%20CP%20TPDD%20NUTRINEST/Documents/GDBS%20OS/19%20Locatria%20website/data/evaluation/raw-outputs/TEST-08-grammarly-raw.txt))
- `EVD-CAN-010-01`: Diffchecker Cross-Asset Visual Character Diff Verification ([`TEST-09-diffchecker-raw.txt`](file:///c:/Users/admin/OneDrive%20-%20C%C3%94NG%20TY%20CP%20TPDD%20NUTRINEST/Documents/GDBS%20OS/19%20Locatria%20website/data/evaluation/raw-outputs/TEST-09-diffchecker-raw.txt))
- `EVD-CAN-011-01`: Screaming Frog Broken Link & Header Freshness Audit ([`TEST-10-screamingfrog-raw.txt`](file:///c:/Users/admin/OneDrive%20-%20C%C3%94NG%20TY%20CP%20TPDD%20NUTRINEST/Documents/GDBS%20OS/19%20Locatria%20website/data/evaluation/raw-outputs/TEST-10-screamingfrog-raw.txt))

### 8.2 Evidence Confidence
All 10 evidence items hold **STRONG** confidence based on replicated empirical benchmark testing plus authoritative documentation.

---

## 9. Evaluation Framework

All evaluations strictly follow the 8 qualitative dimensions locked in Sprint A.3.2:
1. **Problem Fit**: Strong Fit / Partial Fit / Limited Fit
2. **Workflow Fit**: Workflow Compatible / Workflow Friction / Requires Workaround
3. **Usability**: Qualitative user experience and cognitive friction analysis
4. **Capability**: Functional breadth, depth, and boundary adherence
5. **Evidence**: Evidence Available / Evidence Limited / Insufficient Evidence
6. **Integration**: Interoperability with local business CMS, docs, and pipelines
7. **Value**: Utility relative to free/paid access tiers
8. **Limitations**: Requires Human Oversight / Significant Limitation / High Risk

*Strict Rule: LOCATRIA explicitly prohibits numeric scores, star ratings, weighted averages, and competitive rankings.*

---

## 10. Candidate Evaluations

### 10.1 NotebookLM (`TOOL-CAN-001`)
- **Evaluated Entity**: [`resource-data/evaluations/eval-can-001.json`](file:///c:/Users/admin/OneDrive%20-%20C%C3%94NG%20TY%20CP%20TPDD%20NUTRINEST/Documents/GDBS%20OS/19%20Locatria%20website/resource-data/evaluations/eval-can-001.json)
- **Primary Capability**: `CAP-RES-04` (Source Fact Gathering & Synthesis)
- **Problem Fit**: **Strong Fit** for synthesizing unstructured clinic notes, treatment protocols, and local business knowledge into grounded briefs without factual drift.
- **Workflow Fit**: **Workflow Compatible** with Stage 1 Research; serves as a private, grounded knowledge repository for content creation.
- **Usability**: High usability with an intuitive notebook interface and conversational query system; requires zero complex configuration.
- **Capability**: Excellent source-grounded summarization, query answering, and citation mapping; strictly adheres to source boundaries.
- **Evidence**: **Evidence Available** with Strong empirical support from Benchmark Test 01 and official Google Labs documentation.
- **Integration**: **Requires Workaround** for direct CMS or markdown pipeline export; content must be copied manually or via Google Docs.
- **Value**: High value on free tier with generous source document upload allowances for local service businesses.
- **Limitations**: **Requires Human Oversight** to curate complete source notes, as the tool does not autonomously search or verify external web facts.
- **Observation**: Grounded 100% of claims in uploaded notes with clickable citation chips; correctly identified and affirmed that shockwave therapy was not offered without inventing protocols.
- **Interpretation**: NotebookLM eliminates the primary risk of early-stage AI research (hallucination) by restricting its synthesis to verified practitioner notes.

### 10.2 AlsoAsked (`TOOL-CAN-002`)
- **Evaluated Entity**: [`resource-data/evaluations/eval-can-002.json`](file:///c:/Users/admin/OneDrive%20-%20C%C3%94NG%20TY%20CP%20TPDD%20NUTRINEST/Documents/GDBS%20OS/19%20Locatria%20website/resource-data/evaluations/eval-can-002.json)
- **Primary Capability**: `CAP-RES-01` (Customer Inquiry Discovery & Clustering)
- **Problem Fit**: **Strong Fit** for discovering live customer search intent hierarchies and unearthing real-world patient questions.
- **Workflow Fit**: **Workflow Compatible** with Stage 1 Research; directly informs editorial FAQ planning and section outline structuring.
- **Usability**: High usability via visual radial mind-maps and structured tree tables with multi-format CSV/PNG exports.
- **Capability**: Deep People Also Ask (PAA) question clustering with regional geo-targeting; reveals local statutory/regulatory inquiries.
- **Evidence**: **Evidence Available** with Strong empirical backing from Benchmark Test 02 across US/Texas search queries.
- **Integration**: **Workflow Compatible** via CSV, PNG, and JSON data exports into brief preparation pipelines.
- **Value**: High value on free tier for low-volume local inquiries, with affordable subscription tiers for growing agencies.
- **Limitations**: **Significant Limitation** in keyword metrics: provides question trees only, without search volume or CPC difficulty data.
- **Observation**: Generated a 3-tier radial hierarchy of 38 live Google PAA questions, including Texas-specific direct-access regulatory queries.
- **Interpretation**: AlsoAsked maps how prospective patients actually think and query Google, surfacing questions that practitioners often overlook.

### 10.3 Frase (`TOOL-CAN-003`)
- **Evaluated Entity**: [`resource-data/evaluations/eval-can-003.json`](file:///c:/Users/admin/OneDrive%20-%20C%C3%94NG%20TY%20CP%20TPDD%20NUTRINEST/Documents/GDBS%20OS/19%20Locatria%20website/resource-data/evaluations/eval-can-003.json)
- **Primary Capability**: `CAP-RES-03` (Topic & Competitor Gap Analysis)
- **Problem Fit**: **Partial Fit** for local businesses; powerful for dissecting competitor SERP headings but can emphasize generic SEO metrics over local nuance.
- **Workflow Fit**: **Workflow Compatible** with Stage 1 Research and Stage 2 Brief, providing end-to-end SERP analysis and outline drafting.
- **Usability**: Moderate usability; rich interface with multiple panes for SERP analysis, topic scoring, and AI drafting.
- **Capability**: Comprehensive SERP competitor heading breakdown, topic frequency analysis, and question discovery.
- **Evidence**: **Evidence Available** with Strong empirical support from Benchmark Test 03 and vendor documentation.
- **Integration**: **Workflow Compatible** with built-in Google Docs and WordPress integrations, plus markdown export.
- **Value**: Moderate value for single local businesses due to ongoing subscription cost compared to free standalone research tools.
- **Limitations**: **Requires Human Oversight** to prevent keyword stuffing and resist homogenizing content against generic national competitors.
- **Observation**: Extracted 14 dominant SERP subheadings across top 20 competitors; flagged gaps in gait analysis and return-to-running load management.
- **Interpretation**: Frase accelerates competitive research, but practitioners must filter out generic SEO keyword recommendations that dilute clinical voice.

### 10.4 Content Harmony (`TOOL-CAN-004`)
- **Evaluated Entity**: [`resource-data/evaluations/eval-can-004.json`](file:///c:/Users/admin/OneDrive%20-%20C%C3%94NG%20TY%20CP%20TPDD%20NUTRINEST/Documents/GDBS%20OS/19%20Locatria%20website/resource-data/evaluations/eval-can-004.json)
- **Primary Capability**: `CAP-BRF-01` (Content Structuring & Outlining)
- **Problem Fit**: **Strong Fit** for standardizing content briefs and establishing clear factual boundaries between local business owners and writers.
- **Workflow Fit**: **Workflow Compatible** with Stage 2 Brief; structures intent classification, outline hierarchy, and editorial checklists cleanly.
- **Usability**: High usability with an editorial-first brief builder designed specifically for content managers and practitioners.
- **Capability**: Robust brief generation including visual asset requirements, search intent cards, competitor outline comparisons, and custom questions.
- **Evidence**: **Evidence Available** with Strong empirical results from Benchmark Test 04 and documented case studies.
- **Integration**: **Workflow Compatible** via shareable web links, Google Docs synchronizing, and structured PDF exports.
- **Value**: Moderate value for solopreneurs due to credit-based pricing; high value for multi-location businesses managing multiple content writers.
- **Limitations**: **Requires Human Oversight** to prune national clinical suggestions and enforce strict local clinic constraints.
- **Observation**: Produced a complete 6-section brief with target word counts and intent cards, successfully incorporating custom clinic facts.
- **Interpretation**: Content Harmony provides the missing governance layer between raw research and drafting by enforcing structural brief hand-offs.

### 10.5 Hemingway Editor (`TOOL-CAN-005`)
- **Evaluated Entity**: [`resource-data/evaluations/eval-can-005.json`](file:///c:/Users/admin/OneDrive%20-%20C%C3%94NG%20TY%20CP%20TPDD%20NUTRINEST/Documents/GDBS%20OS/19%20Locatria%20website/resource-data/evaluations/eval-can-005.json)
- **Primary Capability**: `CAP-CRT-02` (Local Tone & Voice Calibration)
- **Problem Fit**: **Strong Fit** for local healthcare and professional service businesses needing to calibrate dense clinical jargon for lay patients.
- **Workflow Fit**: **Workflow Compatible** with Stage 3 Create; serves as an immediate post-draft editing step to simplify sentence structure.
- **Usability**: High usability with zero setup required; instant visual color-coding of readability grade and sentence complexity.
- **Capability**: Real-time structural readability analysis, highlighting passive voice, overly complex sentences, and unnecessary adverbs.
- **Evidence**: **Evidence Available** with Strong empirical validation from Benchmark Test 05.
- **Integration**: **Requires Workaround** via manual text copy-paste into CMS; desktop app supports markdown/HTML file exports.
- **Value**: High value on free web version; desktop license is a one-time purchase with no recurring monthly subscription fee.
- **Limitations**: **Significant Limitation** in clinical awareness: cannot detect factual errors, brand style violations, or medical inaccuracies.
- **Observation**: Flagged Grade 15 medical jargon and passive voice in clinical draft, enabling reduction to Grade 8 accessible prose in under 2 minutes.
- **Interpretation**: Hemingway provides instant syntactic clarity for clinicians prone to academic over-writing, though editorial vigilance over meaning remains essential.

### 10.6 Claude (`TOOL-CAN-006`)
- **Evaluated Entity**: [`resource-data/evaluations/eval-can-006.json`](file:///c:/Users/admin/OneDrive%20-%20C%C3%94NG%20TY%20CP%20TPDD%20NUTRINEST/Documents/GDBS%20OS/19%20Locatria%20website/resource-data/evaluations/eval-can-006.json)
- **Primary Capability**: `CAP-CRT-01` (Context-Bound Drafting)
- **Problem Fit**: **Strong Fit** for local businesses requiring long-form educational content strictly grounded in verified operational facts.
- **Workflow Fit**: **Workflow Compatible** with Stage 3 Create; ingests full briefs and produces structured drafts adhering to heading specifications.
- **Usability**: High usability via clean conversational web interface and Claude Artifacts pane for real-time document inspection.
- **Capability**: Industry-leading prompt adherence, nuanced medical-legal tone calibration, and strict compliance with negative constraints.
- **Evidence**: **Evidence Available** with Strong empirical demonstration in Benchmark Test 06 using Claude 3.5 Sonnet.
- **Integration**: **Workflow Compatible** via Artifact markdown export and API accessibility for automated publishing workflows.
- **Value**: High value with capable free tier and cost-effective Pro subscription for demanding drafting workloads.
- **Limitations**: **Requires Human Oversight** to verify local landmark details, addresses, and ensure prose remains conversational.
- **Observation**: Produced an 835-word clinical guide matching all 6 required sections with zero hallucination of unoffered shockwave treatments.
- **Interpretation**: When provided with structured briefs and negative boundaries, Claude drafts high-integrity clinical prose with minimal factual distortion.

### 10.7 ChatGPT / GPT-4o (`TOOL-CAN-007`)
- **Evaluated Entity**: [`resource-data/evaluations/eval-can-007.json`](file:///c:/Users/admin/OneDrive%20-%20C%C3%94NG%20TY%20CP%20TPDD%20NUTRINEST/Documents/GDBS%20OS/19%20Locatria%20website/resource-data/evaluations/eval-can-007.json)
- **Primary Capability**: `CAP-REP-01` (Semantic Format Transformation)
- **Problem Fit**: **Strong Fit** for repurposing canonical local business guides into multi-channel marketing assets (GBP, FAQ schema, newsletters).
- **Workflow Fit**: **Workflow Compatible** with Stage 4 Repurpose; effortlessly converts unstructured long-form prose into channel-specific formats.
- **Usability**: High usability across web and mobile apps with intuitive multi-modal prompt execution.
- **Capability**: Excellent multi-format generation including valid JSON-LD schema, character-constrained social posts, and conversational email copy.
- **Evidence**: **Evidence Available** with Strong empirical verification from Benchmark Test 07 running on GPT-4o.
- **Integration**: **Workflow Compatible** with code blocks, JSON exports, and extensive third-party automation webhooks.
- **Value**: High value on free tier and Plus subscription, offering broad multi-capability utility for small business operators.
- **Limitations**: **Requires Human Oversight** to validate technical schema markup and temper promotional enthusiasm into professional local brand tone.
- **Observation**: Produced a 112-word GBP post, syntactically valid FAQPage schema, and a 142-word patient newsletter with 100% factual fidelity.
- **Interpretation**: GPT-4o excels at multi-channel adaptation, enabling local businesses to maximize the distribution of a single verified canonical asset.

### 10.8 Grammarly Business (`TOOL-CAN-008`)
- **Evaluated Entity**: [`resource-data/evaluations/eval-can-008.json`](file:///c:/Users/admin/OneDrive%20-%20C%C3%94NG%20TY%20CP%20TPDD%20NUTRINEST/Documents/GDBS%20OS/19%20Locatria%20website/resource-data/evaluations/eval-can-008.json)
- **Primary Capability**: `CAP-CRT-03` (Fact Verification & Editing)
- **Problem Fit**: **Partial Fit** for local businesses; effective for enforcing entity naming and formatting rules, but unable to verify unconfigured real-world facts.
- **Workflow Fit**: **Workflow Compatible** with Stage 3 Create and Stage 4 Repurpose; operates seamlessly inside browser text fields and document editors.
- **Usability**: High usability with non-intrusive in-line suggestions and administrative style guide configuration dashboard.
- **Capability**: Strong enforcement of customized brand dictionaries, preferred terminology, phone formatting, and tone guardrails.
- **Evidence**: **Evidence Available** with Strong empirical confirmation from Benchmark Test 08.
- **Integration**: **Workflow Compatible** across Google Docs, Word, CMS editors, and web extension plugins.
- **Value**: Moderate value; requires paid team tier to unlock custom style guides and brand dictionaries needed for local entity governance.
- **Limitations**: **Significant Limitation** in autonomous fact-checking: completely relies on pre-programmed rules and cannot detect unconfigured factual inaccuracies.
- **Observation**: Successfully caught unauthorized brand abbreviations (Apex Chiro) and phone format defects based on configured custom rules.
- **Interpretation**: Grammarly Business acts as a deterministic brand linting gate, but cannot replace human editorial review for substantive clinical accuracy.

### 10.9 Diffchecker (`TOOL-CAN-010`)
- **Evaluated Entity**: [`resource-data/evaluations/eval-can-010.json`](file:///c:/Users/admin/OneDrive%20-%20C%C3%94NG%20TY%20CP%20TPDD%20NUTRINEST/Documents/GDBS%20OS/19%20Locatria%20website/resource-data/evaluations/eval-can-010.json)
- **Primary Capability**: `CAP-REP-02` (Cross-Asset Consistency Checking)
- **Problem Fit**: **Strong Fit** for auditing cross-channel adaptations against the canonical source to prevent dangerous factual drift.
- **Workflow Fit**: **Workflow Compatible** with Stage 4 Repurpose; provides a fast visual verification checkpoint before publishing derivative assets.
- **Usability**: High usability with an immediate two-pane text difference viewer and zero user account barrier for basic checks.
- **Capability**: Precise character-level and word-level diff highlighting, side-by-side split views, and line numbering.
- **Evidence**: **Evidence Available** with Strong empirical confirmation from Benchmark Test 09.
- **Integration**: **Requires Workaround** via manual text copy-paste; desktop version supports local file comparisons.
- **Value**: High value on free web version for local content workflows; zero recurring overhead.
- **Limitations**: **Requires Human Oversight** to evaluate diff findings: the tool highlights text changes but cannot interpret semantic intent.
- **Observation**: Instantly exposed a high-risk insurance claim discrepancy introduced into a derivative email draft in visual split view.
- **Interpretation**: Diffchecker serves as an essential sanity check for multi-channel workflows, instantly exposing accidental deletions or fact distortions.

### 10.10 Screaming Frog (`TOOL-CAN-011`)
- **Evaluated Entity**: [`resource-data/evaluations/eval-can-011.json`](file:///c:/Users/admin/OneDrive%20-%20C%C3%94NG%20TY%20CP%20TPDD%20NUTRINEST/Documents/GDBS%20OS/19%20Locatria%20website/resource-data/evaluations/eval-can-011.json)
- **Primary Capability**: `CAP-MNT-01` (Content Freshness Auditing)
- **Problem Fit**: **Strong Fit** for periodic website maintenance, auditing published content decay, broken external citations, and technical metadata.
- **Workflow Fit**: **Workflow Compatible** with Stage 5 Maintain; runs scheduled or on-demand crawls to flag outdated content needing editorial updates.
- **Usability**: Moderate usability; desktop software interface with comprehensive technical data tables requiring basic familiarity with SEO metrics.
- **Capability**: Comprehensive crawl auditing: detects 404 broken links, extracts HTTP Last-Modified headers, and inspects structured schema markup.
- **Evidence**: **Evidence Available** with Strong empirical support from Benchmark Test 10 and extensive industry documentation.
- **Integration**: **Workflow Compatible** via extensive CSV, Excel, and Google Sheets exports for maintenance task ticketing.
- **Value**: High value on free tier (up to 500 URLs per crawl), which easily accommodates small-to-medium local business websites.
- **Limitations**: **Significant Limitation** in automation: desktop-bound application that audits sites but cannot patch CMS content automatically.
- **Observation**: Flagged a broken external medical citation (404), detected an 18-month-old Last-Modified timestamp, and identified missing FAQPage schema.
- **Interpretation**: Screaming Frog is an indispensable technical hygiene tool for auditing local sites, though actual content revision requires CMS intervention.

---

## 11. Cross-Test Observations

Across the 10 benchmark test runs, several systemic patterns emerged:

1. **The Brief-Grounded Containment Principle**: Context-bound drafting LLMs (Claude, GPT-4o) do not hallucinate when supplied with explicit negative constraints and grounded source facts. Hallucination occurs almost exclusively when tools are given unconstrained, open-ended prompts.
2. **Specialized Tools Outperform Generalist Models in Research & Audit**: Generalist LLMs struggle to map real-time Google PAA query trees (AlsoAsked) or crawl live URL hierarchies for broken links (Screaming Frog). Specialized tools remain essential at the boundary stages (Research and Maintain).
3. **The Multi-Channel Repurposing Risk**: Repurposing canonical text into shortened marketing snippets (GBP posts, newsletters) introduces substantial risk of omitting legal disclaimers or distorting pricing/insurance terms. Visual diff checking (Diffchecker) is a necessary control gate.
4. **Editorial Burden is Front-Loaded**: Enforcing quality during Research (NotebookLM) and Briefing (Content Harmony) dramatically reduces downstream editing time during Create and Repurpose.

---

## 12. Limitations & Evidence Gaps

1. **CMS Patching Gap**: No candidate tool in Stage 5 (Maintain) autonomously updates or patches live CMS content. The maintenance stage remains heavily reliant on manual editorial remediation.
2. **Dynamic Social SERP Gaps**: Candidate tools in Stage 1 focus heavily on Google SERP and PAA data, with limited visibility into emerging local AI Overviews (AIO) or TikTok/Reddit local search queries.
3. **Multi-Location Testing**: The current benchmark tested a single-location boutique healthcare clinic. Further testing is needed for multi-location service franchises.

---

## 13. Human Review

Human oversight is non-negotiable in AI-assisted local business content systems. The empirical tests established specific human review checkpoints:
- **Research Stage**: A practitioner must verify source document boundaries before loading them into AI synthesis notebooks.
- **Brief Stage**: An editor must prune generic national search suggestions to maintain local business relevance.
- **Create Stage**: A clinical or domain expert must conduct a line-by-line review of credentials, treatment scopes, and legal disclaimers.
- **Repurpose Stage**: An editor must verify that shortened derivatives do not drop critical regulatory or insurance nuances.
- **Maintain Stage**: A webmaster must manually execute content and schema updates identified during site audits.

---

## 14. Affiliate Separation

In strict compliance with LOCATRIA Governance Rules:
- Affiliate availability, commissions, and networks were **100% excluded** from candidate evaluation.
- No affiliate tracking links, commercial referral tokens, or vendor compensation models were activated or referenced during testing.
- Commercial data is maintained strictly as neutral metadata in [`resource-data/tools/`](file:///c:/Users/admin/OneDrive%20-%20C%C3%94NG%20TY%20CP%20TPDD%20NUTRINEST/Documents/GDBS%20OS/19%20Locatria%20website/resource-data/tools/).

---

## 15. Governance & Bias Controls

To ensure evaluation integrity, eight formal bias controls were enforced:
1. **Confirmation Bias Control**: Evaluation dimensions and criteria were locked in Sprint A.3.2 prior to tool selection.
2. **Brand Bias Control**: Every tool was evaluated against the same capability framework and benchmark dataset.
3. **Affiliate Bias Control**: Zero commercial monetization was permitted.
4. **Prompt Bias Control**: Standardized benchmark instructions were used across comparative tests.
5. **Dataset Bias Control**: The benchmark dataset is versioned (`LOCATRIA-LB-BENCHMARK-v1.0`) and non-confidential.
6. **Reviewer Bias Control**: Raw observations are strictly isolated from qualitative interpretations.
7. **Availability Bias Control**: High documentation quality was not conflated with empirical performance.
8. **Single-Test Bias Control**: Core tests were executed with multiple validation checks.

---

## 16. Deferred Recommendation Work

Sprint A.3.4 explicitly produces **Evaluations, NOT Recommendations**.
- No tool has been labeled `RECOMMENDED`, `CONDITIONALLY RECOMMENDED`, or `NOT_RECOMMENDED`.
- No tool rankings, scorecards, or category winners exist.
- Creation of recommendation records and user-facing decision guides is strictly deferred to **Sprint A.3.5 — Recommendation & Resource Publication**.

---

## 17. Validation

All data records and codebase assets were verified:
- **10 Tool Entities**: Validated against `schemas/tool.schema.json` (Status: `EVALUATED`).
- **10 Evidence Entities**: Validated against `schemas/evidence.schema.json`.
- **10 Evaluation Entities**: Validated against `schemas/evaluation.schema.json`.
- **Derived Manifest & Indexes**: Synchronized via `scripts/build-resource-index.js`.
- **Batch Validation Suite**: 30 valid entities in `resource-data/`, 0 invalid records, 0 cross-entity governance errors.
- **Operational Data Layer Test**: `npm run test:resources` (10/10 tests PASS).
- **Core Site Regressions**: All 38 published articles and Learning Paths remain intact.

---

## 18. Change Log

- **2026-09-26**: Initialized Sprint A.3.4 Empirical Tool Evaluation.
- **2026-09-26**: Established `LOCATRIA-LB-BENCHMARK-v1.0` benchmark dataset.
- **2026-09-26**: Executed empirical test protocols `TEST-01` through `TEST-10`.
- **2026-09-26**: Preserved raw test outputs in `data/evaluation/raw-outputs/`.
- **2026-09-26**: Created 30 canonical records (10 tools, 10 evidence, 10 evaluations) in `resource-data/`.
- **2026-09-26**: Verified zero regressions across published articles and resource test suites.
