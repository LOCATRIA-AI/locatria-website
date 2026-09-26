# LOCATRIA Resource & Tool Pilot — Sprint A.3.2
## Capability Mapping & Evaluation Criteria v1.0

```
Sprint:             A.3.2 — Capability Mapping & Evaluation Criteria
System:             GDBS OS / Module 07 / Chapter 01 / Sprint A.3
Approved Cluster:   AI Content Workflow for Local Businesses
Workflow ID:        WF-AICONTENT-001
Status:             CANONICAL SPECIFICATION (TOOL-BLIND)
Core Principle:     Problem → Workflow → Capability → Evaluation Criteria (Tools Strictly Deferred)
```

---

## 1. Executive Summary

Sprint A.3.2 establishes the canonical **Capability Mapping & Evaluation Criteria v1.0** for LOCATRIA's first Resource & Tool pilot: **AI Content Workflow for Local Businesses** (`WF-AICONTENT-001`).

This specification operationalizes the critical principle:
$$\text{Problem} \longrightarrow \text{Workflow} \longrightarrow \text{Capability} \longrightarrow \text{Evaluation Criteria} \longrightarrow \text{Candidate Tools (A.3.3)}$$

### The Tool-Blind Rule:
In strict adherence to the **Knowledge First** and **Founder + AI + System** architecture:
- **No commercial software products** (e.g. ChatGPT, Claude, Gemini, Perplexity, Jasper, Surfer, SEMrush) were researched, evaluated, or named.
- **No tool shortlists or vendor comparisons** were created.
- **No numeric scoring or ranking formulas** were introduced.
- **Zero commercial or affiliate considerations** were permitted to influence criteria.

By defining the objective rules of evaluation *before* discovering candidate tools in Sprint A.3.3, LOCATRIA guarantees complete editorial independence, prevents confirmation bias, and protects against commercial distortion.

---

## 2. Capability vs. Tool Feature Distinction

A fundamental tenet of LOCATRIA’s data model is the strict separation between what a user needs to accomplish (**Capability**) and what a vendor builds into software (**Feature**):

```
┌───────────────────────────────────────────────┬──────────────────────────────────────────────┐
│ CAPABILITY (User Need & Workflow Requirement) │ TOOL FEATURE (Vendor Implementation)         │
├───────────────────────────────────────────────┼──────────────────────────────────────────────┤
│ "Source Fact Gathering & Synthesis"           │ "Web browsing plugin" or "File upload"       │
│ Defines WHAT operational outcome must occur   │ Describes HOW a particular vendor executes it │
│ Enduring over years across technology shifts  │ Fleeting; changes with weekly product updates│
│ Evaluated against workflow utility & evidence │ Evaluated against capability satisfaction    │
│ Completely tool-agnostic and unmonetized      │ Often tied to pricing tiers and subscriptions │
└───────────────────────────────────────────────┴──────────────────────────────────────────────┘
```

The evaluation framework specifies **what evidence demonstrates that a capability is effectively fulfilled**, never whether a product advertises a shiny feature.

---

## 3. The 8 Approved Evaluation Dimensions

All evaluations must be conducted qualitatively across the 8 canonical dimensions approved in Sprint A.1 and codified in Sprint A.2 (`schemas/evaluation.schema.json`):

```
                     ┌─────────────────────────────┐
                     │     1. PROBLEM FIT          │
                     ├─────────────────────────────┤
                     │     2. WORKFLOW FIT         │
                     ├─────────────────────────────┤
                     │     3. USABILITY            │
                     ├─────────────────────────────┤
                     │     4. CAPABILITY           │
                     ├─────────────────────────────┤
                     │     5. EVIDENCE             │
                     ├─────────────────────────────┤
                     │     6. INTEGRATION          │
                     ├─────────────────────────────┤
                     │     7. VALUE                │
                     ├─────────────────────────────┤
                     │     8. LIMITATIONS          │
                     └─────────────────────────────┘
```

### Operational Definitions:

1. **Problem Fit**: Does the capability meaningfully resolve the identified local business problem? Evaluates genuine relevance, context preservation, and practical usefulness for non-enterprise operators.
2. **Workflow Fit**: How seamlessly does the capability slot into the canonical five-stage workflow? Evaluates stage handoffs, input/output compatibility, repeatability, and reduction of task-switching friction.
3. **Usability**: Can the intended operator effectively execute the capability? Evaluates interface clarity, non-technical accessibility, learning curve, and the ease of conducting human oversight.
4. **Capability**: How reliably and accurately is the functional task performed? Evaluates depth of output, semantic fidelity, hallucination resistance, and adherence to operational constraints.
5. **Evidence**: What empirical artifacts substantiate the evaluation? Evaluates documentation quality, benchmark test reproducibility, observed error rates, and evidence freshness.
6. **Integration**: How readily can inputs and outputs transition between tools and human workflows? Evaluates standard formats (Markdown, CSV, JSON, clipboard), avoiding lock-in.
7. **Value**: Does the capability provide practical return relative to operational effort, time expenditure, and financial cost? *(Affiliate commissions are strictly prohibited from this dimension).*
8. **Limitations**: What unavoidable boundaries, failure modes, privacy risks, or regional constraints restrict usage? *(Documenting limitations is mandatory for every evaluation).*

### The Prohibition of Numeric Scoring:
LOCATRIA strictly rejects false precision. There are **no 1–10 scores, no percentages, no star ratings, and no weighted composite algorithms**. 

Evaluations use standardized qualitative judgments:
- **Fit**: `Strong Fit` | `Partial Fit` | `Limited Fit`
- **Workflow**: `Workflow Compatible` | `Workflow Friction` | `Requires Workaround`
- **Evidence**: `Evidence Available` | `Evidence Limited` | `Insufficient Evidence`
- **Governance**: `Requires Human Oversight` | `Significant Limitation` | `High Risk`

---

## 4. Evidence Framework & Qualitative Strength Model

### 4.1 Approved Evidence Types
Aligned with `schemas/evidence.schema.json`:
- `OFFICIAL_DOCUMENTATION`: Technical manuals, API specs, developer documentation.
- `OFFICIAL_PRODUCT_PAGE`: Vendor service descriptions and specifications.
- `OFFICIAL_PRICING`: Published pricing tables, tier limits, and billing terms.
- `PRODUCT_TEST`: Hands-on empirical benchmark testing conducted by LOCATRIA evaluators.
- `CASE_STUDY`: Documented real-world local business implementation observations.
- `THIRD_PARTY_RESEARCH`: Independent academic or industry research evaluations.
- `USER_DOCUMENTATION`: Community-generated guides and verified user feedback.
- `OTHER`: Auxiliary factual artifacts.

### 4.2 Qualitative Evidence Strength Scale
Evidence strength measures **the rigor of the empirical data**, completely independent of whether the tool performs well:

```
┌───────────┬──────────────────────────────────────────────────────────────────────────────────┐
│ STRENGTH  │ OPERATIONAL DEFINITION                                                           │
├───────────┼──────────────────────────────────────────────────────────────────────────────────┤
│ HIGH      │ Replicated empirical testing (PRODUCT_TEST) supported by official documentation  │
│           │ with verifiable, deterministic results and documented methodology.              │
├───────────┼──────────────────────────────────────────────────────────────────────────────────┤
│ MEDIUM    │ Clear official documentation or reputable third-party benchmarks with limited    │
│           │ direct hands-on replication.                                                     │
├───────────┼──────────────────────────────────────────────────────────────────────────────────┤
│ LOW       │ Secondary marketing claims, anecdotal reports, or unverified community posts.    │
├───────────┼──────────────────────────────────────────────────────────────────────────────────┤
│ UNKNOWN   │ Insufficient evidence collected; capability behavior unverified.                 │
└───────────┴──────────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Decoupling Evidence Strength from Tool Evaluation
Evaluators must never describe a capability as "strongly recommended" if the evidence is only LOW or UNKNOWN. When evidence is limited, the finding must state: *"Evaluation Confidence: Low due to limited empirical test data."*

---

## 5. Canonical Capability Map (All 14 Capabilities)

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

### STAGE 1: RESEARCH

#### 5.1 CAP-RES-01 — Customer Inquiry Discovery & Clustering
- **Capability ID**: `CAP-RES-01`
- **Workflow Stage**: Stage 1 — Research
- **Qualitative Priority**: Core Workflow Capability
- **Problem Addressed**: Local business content often fails because it answers hypothetical topics rather than the actual questions prospective customers ask during calls, consults, and intake.
- **Operational Definition**: The ability to parse unstructured customer interaction text (emails, CRM notes, inquiry logs, call transcripts), identify recurring questions, and cluster them into coherent informational topics.
- **User Outcome**: The operator obtains a prioritized list of real customer questions without manually reading through hundreds of raw messages.
- **Required Inputs**: Raw customer communication logs, consultation notes, intake inquiries, or FAQ submissions.
- **Expected Outputs**: Clustered inquiry themes, prioritized question list, raw customer phrasing samples.
- **Required Characteristics**: Multi-message semantic clustering, noise elimination, retention of exact customer colloquial vocabulary.
- **Failure Modes**: Hallucinating customer pain points not present in source text; over-abstracting inquiries into vague generic concepts; ignoring niche but high-conversion questions.
- **Quality Checks**: Every clustered question must trace back to at least one real interaction snippet; clusters must be distinct and non-overlapping.
- **Dependencies**: None (initiating capability).
- **Human Oversight**: Operator validates that identified clusters reflect high-value business inquiries rather than administrative noise (e.g. "where do I park?").
- **Evaluation Criteria (8 Dimensions)**:
  - *Problem Fit*: Does it extract authentic local client concerns rather than generic industry topics?
  - *Workflow Fit*: Do clustered outputs cleanly hand off to search intent analysis (`CAP-RES-02`)?
  - *Usability*: Can a non-technical manager paste raw message logs without syntax configuration?
  - *Capability*: How accurately does it group semantically identical questions phrased differently?
  - *Evidence*: Replicated testing on sample inquiry sets of varying volume and formatting.
  - *Integration*: Supports plain text, CSV, and clipboard import/export.
  - *Value*: Saves 60+ minutes of manual log review per content cycle.
  - *Limitations*: Context window size limits; privacy constraints handling sensitive customer data.
- **Evidence Requirements**:
  - *Minimum*: Official documentation confirming semantic clustering capabilities.
  - *Preferred*: Empirical test (`PRODUCT_TEST`) on a benchmark of 50 messy local customer inquiries.
  - *Evidence Gap*: Ability to handle proprietary offline communication formats.
- **Tool Discovery Keywords**: `customer inquiry clustering`, `question extraction from text`, `semantic inquiry grouping`, `customer pain point analysis`, `unstructured feedback clustering`.

---

#### 5.2 CAP-RES-02 — Search & AI Intent Analysis
- **Capability ID**: `CAP-RES-02`
- **Workflow Stage**: Stage 1 — Research
- **Qualitative Priority**: Core Workflow Capability
- **Problem Addressed**: Operators do not know whether a customer question represents an informational research query, a vendor comparison, or a high-urgency local transaction.
- **Operational Definition**: The ability to analyze customer search terms and questions to classify search intent, identify related sub-questions, and surface how modern AI assistants and search engines structure answers for that topic.
- **User Outcome**: The operator understands the explicit intent behind the topic and knows what related questions must be answered to achieve search and AI visibility.
- **Required Inputs**: Customer question topics (from `CAP-RES-01`), seed keywords, local market geography.
- **Expected Outputs**: Intent classification (Informational / Commercial Evaluation / Local Transactional), related entity concepts, searcher question variations.
- **Required Characteristics**: Distinguishes informational intent from transactional intent; surfaces multi-turn question sequences; captures local geographic modifiers.
- **Failure Modes**: Misclassifying research queries as sales pitches; generating irrelevant high-volume national queries that ignore local context.
- **Quality Checks**: Intent classification accurately aligns with the customer's buying cycle stage; related questions are directly relevant to the core topic.
- **Dependencies**: Inputs from `CAP-RES-01`.
- **Human Oversight**: Operator verifies that the identified intent matches their service delivery model.
- **Evaluation Criteria (8 Dimensions)**:
  - *Problem Fit*: Does it reveal how local searchers actually query AI and search engines?
  - *Workflow Fit*: Outputs feed directly into topic gap analysis (`CAP-RES-03`) and brief outlining (`CAP-BRF-01`).
  - *Usability*: Presents clear intent categories without requiring advanced SEO jargon literacy.
  - *Capability*: Depth of query variation discovery and intent disambiguation accuracy.
  - *Evidence*: Comparison of suggested query variations against live search and AI answer engines.
  - *Integration*: Exports structured question hierarchies in Markdown or CSV.
  - *Value*: Prevents publishing content that targets the wrong customer decision stage.
  - *Limitations*: Regional query data scarcity in micro-local or niche markets.
- **Evidence Requirements**:
  - *Minimum*: Documented query decomposition and intent classification methodology.
  - *Preferred*: Benchmark test (`PRODUCT_TEST`) comparing intent accuracy across 20 local service queries.
  - *Evidence Gap*: Real-time visibility into proprietary generative AI retrieval query formulations.
- **Tool Discovery Keywords**: `search intent analysis`, `query decomposition`, `AI overview question research`, `question variation discovery`, `local search intent classification`.

---

#### 5.3 CAP-RES-03 — Topic & Competitor Gap Analysis
- **Capability ID**: `CAP-RES-03`
- **Workflow Stage**: Stage 1 — Research
- **Qualitative Priority**: Supporting Capability
- **Problem Addressed**: Local business content often duplicates existing competitor articles without adding differentiated value, resulting in poor ranking and low user engagement.
- **Operational Definition**: The ability to compare existing top-ranking web and AI resources for a given question against business capabilities to identify unanswered sub-questions, thin explanations, and unique practitioner angles.
- **User Outcome**: The operator discovers the exact information gaps they must fill to create content superior to existing local search results.
- **Required Inputs**: Target customer questions (from `CAP-RES-02`), competitor URLs, local search result listings.
- **Expected Outputs**: Topic coverage matrix, identified content gaps, missing local practitioner nuances, recommended differentiation angles.
- **Required Characteristics**: Multi-source comparative analysis, identification of superficial explanations, extraction of unaddressed edge cases.
- **Failure Modes**: Encouraging blind copying of competitor outlines; prioritizing keyword frequency over genuine informational depth.
- **Quality Checks**: Identified gaps represent meaningful customer concerns rather than trivial missing keywords.
- **Dependencies**: Inputs from `CAP-RES-02`.
- **Human Oversight**: Operator decides whether an identified gap is strategically relevant to their practice.
- **Evaluation Criteria (8 Dimensions)**:
  - *Problem Fit*: Identifies genuine informational deficits in local results rather than vanity metrics.
  - *Workflow Fit*: Feeds differentiation points directly into the Content Brief (`CAP-BRF-01`).
  - *Usability*: Summarizes competitor coverage gaps in scannable, actionable bullet points.
  - *Capability*: Ability to discern substantive conceptual gaps from minor phrasing differences.
  - *Evidence*: Verification of identified gaps against live search engine results.
  - *Integration*: Ability to ingest competitor URLs or plain text summaries.
  - *Value*: Ensures new content has a clear competitive reason to rank and be cited by AI engines.
  - *Limitations*: Inability to parse dynamic JavaScript websites or paywalled industry pages.
- **Evidence Requirements**:
  - *Minimum*: Vendor documentation explaining competitive content comparison features.
  - *Preferred*: Controlled test (`PRODUCT_TEST`) analyzing 5 competitive local service pages.
  - *Evidence Gap*: Depth of analysis on multi-location directory aggregators.
- **Tool Discovery Keywords**: `content gap analysis`, `competitor topic coverage`, `local content differentiation`, `search result comparative analysis`, `topical depth evaluation`.

---

#### 5.4 CAP-RES-04 — Source Fact Gathering & Synthesis
- **Capability ID**: `CAP-RES-04`
- **Workflow Stage**: Stage 1 — Research
- **Qualitative Priority**: Core Workflow Capability
- **Problem Addressed**: Content created with AI frequently relies on ungrounded assumptions or hallucinated data because factual sources were never assembled prior to drafting.
- **Operational Definition**: The ability to collect, verify, and organize factual source material (business specifications, fee schedules, clinical guidelines, regulatory citations, verified statistics) into structured research notes with strict provenance tracking.
- **User Outcome**: The content creator operates from a verified, traceable evidence base that prevents downstream factual errors.
- **Required Inputs**: Official business documentation, practitioner notes, verified third-party research links, regulatory guidance.
- **Expected Outputs**: Structured Research Notes & Evidence Document, list of verified facts with provenance URLs/notes, explicit list of unverified assumptions.
- **Required Characteristics**: Source provenance preservation, strict separation of fact vs. assumption, structured quote/data extraction.
- **Failure Modes**: Mixing unverified web claims with official business data; losing source URLs; misquoting technical specifications.
- **Quality Checks**: Every critical factual claim (pricing, protocols, timelines) has a verifiable source citation.
- **Dependencies**: Feeds into all Stage 2 (Brief) and Stage 3 (Create) capabilities.
- **Human Oversight**: Mandatory human verification of all proprietary business parameters and legal/clinical claims.
- **Evaluation Criteria (8 Dimensions)**:
  - *Problem Fit*: Directly eliminates the root cause of AI hallucinations by grounding research in verified facts.
  - *Workflow Fit*: Produces research notes that map 1:1 into the Content Brief (`CAP-BRF-02`).
  - *Usability*: Allows clean copy-pasting or file upload of internal business notes and PDFs.
  - *Capability*: Synthesizes multi-page source documents into concise factual bullet points without distortion.
  - *Evidence*: Provenance retention test comparing synthesized outputs against source documents.
  - *Integration*: Clean text/Markdown export with preserved markdown links and citations.
  - *Value*: Saves hours of fact-checking during post-draft editing.
  - *Limitations*: File upload size limits; OCR errors on scanned PDF documents.
- **Evidence Requirements**:
  - *Minimum*: Official documentation demonstrating source synthesis and citation retention.
  - *Preferred*: Test run (`PRODUCT_TEST`) synthesizing a complex 10-page local business service guide.
  - *Evidence Gap*: Proprietary data retention policies and training data exclusion guarantees.
- **Tool Discovery Keywords**: `source synthesis`, `evidence extraction from documents`, `fact gathering research`, `citation preservation tool`, `source-grounded research notes`.

---

### STAGE 2: BRIEF

#### 5.5 CAP-BRF-01 — Content Structuring & Outlining
- **Capability ID**: `CAP-BRF-01`
- **Workflow Stage**: Stage 2 — Brief
- **Qualitative Priority**: Core Workflow Capability
- **Problem Addressed**: Skipping outline design leads to rambling, unfocused drafts that fail to answer customer questions logically.
- **Operational Definition**: The ability to transform research questions and insights into a hierarchical, logical editorial structure (H2 and H3 headings) designed to resolve customer search intent sequentially.
- **User Outcome**: The operator possesses a comprehensive structural blueprint before writing a single sentence of prose.
- **Required Inputs**: Research Notes & Evidence Document (from Stage 1), target audience persona.
- **Expected Outputs**: Hierarchical section outline (H2/H3), section purpose statements, transition logic.
- **Required Characteristics**: Enforces logical narrative progression (Problem → Cause → Solution → Verification → Next Steps); creates scannable headers; prevents circular topic overlap.
- **Failure Modes**: Generating generic 5-paragraph essay structures; creating repetitive subheadings; skipping critical intermediate questions.
- **Quality Checks**: Outline logically addresses the primary customer question; each section has a distinct operational objective.
- **Dependencies**: Requires Research Notes (`CAP-RES-01` to `CAP-RES-04`).
- **Human Oversight**: Operator reviews and approves the structural flow and section angles.
- **Evaluation Criteria (8 Dimensions)**:
  - *Problem Fit*: Formulates an actionable, practical guide structure rather than theoretical fluff.
  - *Workflow Fit*: Handoff seamlessly into evidence mapping (`CAP-BRF-02`) and drafting (`CAP-CRT-01`).
  - *Usability*: Simple outline reordering (drag-and-drop or clean markdown outline manipulation).
  - *Capability*: Generates logical, domain-appropriate structural hierarchies tailored to service workflows.
  - *Evidence*: Comparative evaluation of generated outlines against high-performing editorial blueprints.
  - *Integration*: Exports markdown headings (`##`, `###`) directly to standard editors.
  - *Value*: Eliminates writer's block and structural rewrites during the drafting phase.
  - *Limitations*: Tendency to generate bloated 15-section outlines when a concise 5-section outline is needed.
- **Evidence Requirements**:
  - *Minimum*: Documentation of outline generation and structuring features.
  - *Preferred*: Benchmark test (`PRODUCT_TEST`) generating outlines for 5 distinct local service workflows.
  - *Evidence Gap*: Handling constraints on total section count and reading time.
- **Tool Discovery Keywords**: `content brief outlining`, `editorial structuring tool`, `hierarchical outline generator`, `intent-based content architect`, `scannable heading structure`.

---

#### 5.6 CAP-BRF-02 — Evidence & Point Mapping
- **Capability ID**: `CAP-BRF-02`
- **Workflow Stage**: Stage 2 — Brief
- **Qualitative Priority**: Core Workflow Capability
- **Problem Addressed**: Drafts drift into unsupported claims because facts collected during research are not assigned to specific sections of the outline.
- **Operational Definition**: The ability to associate specific verified facts, data points, practitioner quotes, and regulatory citations directly to designated sections of the content outline.
- **User Outcome**: Each outline section contains exact, bulleted factual constraints that dictate what the drafting engine is allowed to write.
- **Required Inputs**: Structured outline (from `CAP-BRF-01`), Research Notes & Evidence (from `CAP-RES-04`).
- **Expected Outputs**: Mapped Content Brief where every heading contains explicit facts, constraints, and source citations.
- **Required Characteristics**: 1:1 claim-to-evidence association, enforcement of section evidence completeness, explicit boundary notes.
- **Failure Modes**: Leaving sections empty without mapped evidence; attaching irrelevant facts to wrong sections; losing source links during mapping.
- **Quality Checks**: Zero outline sections exist without mapped facts or practitioner notes; zero unbacked claims are queued for drafting.
- **Dependencies**: Requires `CAP-BRF-01` and `CAP-RES-04`.
- **Human Oversight**: Operator ensures proprietary business data and practitioner quotes are assigned to the correct sections.
- **Evaluation Criteria (8 Dimensions)**:
  - *Problem Fit*: Enforces evidence-first discipline before drafting begins.
  - *Workflow Fit*: Directly feeds the prompt/context boundaries for `CAP-CRT-01`.
  - *Usability*: Clear visual or markdown association between headings and evidence bullets.
  - *Capability*: Accurately maps disparate research points to the most relevant conceptual section.
  - *Evidence*: Test measuring evidence retention when transferring points from research to brief.
  - *Integration*: Clean markdown format compatibility.
  - *Value*: Prevents drafting hallucinations by establishing hard factual boundaries upfront.
  - *Limitations*: Risk of over-constraining creative section transitions if mapping is too rigid.
- **Evidence Requirements**:
  - *Minimum*: Documentation showing support for constrained note attachment to outlines.
  - *Preferred*: Hands-on test (`PRODUCT_TEST`) building a fully mapped brief from raw notes.
  - *Evidence Gap*: UI support for tracking unused research notes.
- **Tool Discovery Keywords**: `evidence point mapping`, `brief fact association`, `claim mapping tool`, `structured brief blueprinting`, `evidence-grounded outline`.

---

#### 5.7 CAP-BRF-03 — Audience Intent Alignment
- **Capability ID**: `CAP-BRF-03`
- **Workflow Stage**: Stage 2 — Brief
- **Qualitative Priority**: Supporting Capability
- **Problem Addressed**: Content often misses the mark by pitching at the wrong technical level, using inaccessible jargon, or proposing unrealistic calls-to-action.
- **Operational Definition**: The ability to define and calibrate the reading level, technical terminology boundaries, customer emotional state, and conversion objective within the brief.
- **User Outcome**: The brief clearly specifies who the reader is, what they already know, what jargon is forbidden, and what next step they should take.
- **Required Inputs**: Target customer role, service pricing tier, decision urgency level.
- **Expected Outputs**: Audience specification block, terminology constraints list, target reading level, defined low-friction Call-to-Action (CTA).
- **Required Characteristics**: Grade-level readability targeting (e.g. Grade 7–9 for consumer local services); glossary of terms requiring explanation; context-appropriate CTA definition.
- **Failure Modes**: Recommending high-pressure sales CTAs on top-of-funnel educational articles; assuming advanced industry knowledge in everyday consumers.
- **Quality Checks**: Reading level target is appropriate for consumer audience; CTA represents a logical, helpful next step rather than an aggressive sales pitch.
- **Dependencies**: Inputs from `CAP-RES-02`.
- **Human Oversight**: Operator confirms that the CTA aligns with actual clinic/firm booking procedures.
- **Evaluation Criteria (8 Dimensions)**:
  - *Problem Fit*: Prevents alienating prospective local customers with clinical or legal jargon.
  - *Workflow Fit*: Embedded directly into the header metadata of the Content Brief.
  - *Usability*: Simple configuration of tone, target persona, and reading level parameters.
  - *Capability*: Accurately translates demographic/audience context into explicit stylistic drafting instructions.
  - *Evidence*: Readability score verification on resulting test drafts.
  - *Integration*: Passes instructions smoothly into drafting prompt context.
  - *Value*: Improves conversion rates by meeting customers at their exact level of understanding.
  - *Limitations*: Tendency of generic AI tools to produce patronizing language when told to "simplify".
- **Evidence Requirements**:
  - *Minimum*: Documentation of audience persona and readability targeting capabilities.
  - *Preferred*: Test (`PRODUCT_TEST`) calibrating a technical medical/legal topic for a lay consumer.
  - *Evidence Gap*: Fine-grained control over local colloquialisms and regional idioms.
- **Tool Discovery Keywords**: `audience intent alignment`, `readability calibration`, `content persona definition`, `ethical call to action mapping`, `terminology boundary setting`.

---

### STAGE 3: CREATE

#### 5.8 CAP-CRT-01 — Context-Bound Drafting
- **Capability ID**: `CAP-CRT-01`
- **Workflow Stage**: Stage 3 — Create
- **Qualitative Priority**: Core Workflow Capability
- **Problem Addressed**: Unconstrained AI text generation hallucinates details, drifts off-topic, and writes generic fluff rather than adhering to the specific evidence assembled in the brief.
- **Operational Definition**: The ability to generate clear, structured, engaging prose strictly bound to the instructions, facts, and outline sections provided in the approved Content Brief, without introducing unverified external claims.
- **User Outcome**: The operator receives an initial draft that mirrors the brief 1:1, requiring minimal editing and zero fact-checking of fabricated data.
- **Required Inputs**: Approved Content Brief (`CB-001`) with mapped evidence (from `CAP-BRF-02`), brand voice rules.
- **Expected Outputs**: Complete, publication-ready first draft in Markdown or document format.
- **Required Characteristics**: High prompt adherence, refusal to extrapolate beyond provided facts, section-by-section execution, structured formatting (lists, bolding, callouts).
- **Failure Modes**: Hallucinating unprovided statistics; ignoring section word counts; introducing unsolicited advice; skipping complex sections.
- **Quality Checks**: Every claim in the draft can be traced directly to an evidence bullet in the brief; no external facts were fabricated.
- **Dependencies**: Requires approved Content Brief (`CAP-BRF-01` & `CAP-BRF-02`).
- **Human Oversight**: Mandatory line-by-line practitioner review before any publication.
- **Evaluation Criteria (8 Dimensions)**:
  - *Problem Fit*: Solves the primary drafting bottleneck without creating an editing nightmare.
  - *Workflow Fit*: Ingests the brief directly and outputs formatted text ready for review.
  - *Usability*: Allows iterative section-by-section generation or full-document generation with clear checkpoints.
  - *Capability*: Degree of strict adherence to mapped facts; resistance to ungrounded hallucinations.
  - *Evidence*: Hallucination rate test measuring introduced factual claims absent from the brief.
  - *Integration*: Clean Markdown output with preserved header hierarchy (`#`, `##`, `###`).
  - *Value*: Cuts drafting time from 3–4 hours down to 20–30 minutes.
  - *Limitations*: Risk of overly dry or robotic tone if constraints are applied without stylistic guidance.
- **Evidence Requirements**:
  - *Minimum*: Documentation on prompt fidelity, system prompts, and context-window grounding.
  - *Preferred*: Empirical test (`PRODUCT_TEST`) drafting a 1,500-word guide from a complex brief, measuring factual fidelity.
  - *Evidence Gap*: Long-context drift on articles exceeding 3,000 words.
- **Tool Discovery Keywords**: `context-bound drafting`, `hallucination-resistant text generation`, `brief-grounded writing`, `constrained LLM drafting`, `section-by-section content generation`.

---

#### 5.9 CAP-CRT-02 — Local Tone & Voice Calibration
- **Capability ID**: `CAP-CRT-02`
- **Workflow Stage**: Stage 3 — Create
- **Qualitative Priority**: Core Workflow Capability
- **Problem Addressed**: AI-generated text is notoriously recognizable by formulaic clichés (*"delve"*, *"testament"*, *"tapestry"*, *"game-changer"*), damaging credibility and signaling low-effort automation to both readers and search engines.
- **Operational Definition**: The ability to shape drafted text to reflect an authentic, authoritative local practitioner voice, eliminating generic marketing jargon and infusing practical, direct conversational phrasing.
- **User Outcome**: Content reads as if written by an experienced local professional, establishing immediate trust with prospective clients.
- **Required Inputs**: Raw draft text, negative phrase list (banned words), practitioner tone profile (e.g., authoritative, empathetic, straightforward).
- **Expected Outputs**: Stylistically polished draft free of cliché AI markers, characterized by active verbs, natural rhythm, and authentic phrasing.
- **Required Characteristics**: Automated detection and removal of standard AI filler words; sentence length variety; active voice enforcement; natural transition phrasing.
- **Failure Modes**: Over-correcting into slang or overly casual language; retaining robotic parallelism across paragraphs; losing professional dignity in high-compliance fields.
- **Quality Checks**: Text passes a banned-phrase check; reading cadence sounds natural when read aloud; sounds like a practitioner, not a marketer.
- **Dependencies**: Operates on drafts produced by `CAP-CRT-01`.
- **Human Oversight**: Operator performs final voice check and injects personal or clinic anecdotes.
- **Evaluation Criteria (8 Dimensions)**:
  - *Problem Fit*: Ensures local business content builds genuine community trust rather than looking like automated spam.
  - *Workflow Fit*: Functions as an immediate stylistic pass during or right after initial drafting.
  - *Usability*: Simple configuration of banned phrases and voice personas.
  - *Capability*: Ability to consistently eliminate subtle AI linguistic fingerprints without flattening nuance.
  - *Evidence*: Stylistic analysis testing frequency of 50 common AI marker words before and after calibration.
  - *Integration*: Real-time linting or single-pass document rewriting.
  - *Value*: Saves 45+ minutes of manual line editing and rewriting per article.
  - *Limitations*: Nuanced balance between eliminating clichés and maintaining formal clinical/legal rigor.
- **Evidence Requirements**:
  - *Minimum*: Documentation on custom style enforcement and negative prompting capabilities.
  - *Preferred*: Benchmark test (`PRODUCT_TEST`) running calibration on 5 heavily cliché-ridden AI drafts.
  - *Evidence Gap*: Multi-language or regional dialect voice calibration.
- **Tool Discovery Keywords**: `voice calibration tool`, `AI cliché elimination`, `natural tone rewrite`, `practitioner voice shaping`, `content style linting`.

---

#### 5.10 CAP-CRT-03 — Fact Verification & Editing
- **Capability ID**: `CAP-CRT-03`
- **Workflow Stage**: Stage 3 — Create
- **Qualitative Priority**: Core Workflow Capability
- **Problem Addressed**: Human operators can miss subtle factual inaccuracies or hallucinated claims buried in lengthy AI-generated paragraphs during manual proofreading.
- **Operational Definition**: The ability to cross-reference every factual claim, numerical figure, and procedural instruction in a draft against the original research notes, highlighting potential discrepancies for human review.
- **User Outcome**: The operator can audit a draft in minutes, with clear visual flags indicating verified claims versus unbacked assertions.
- **Required Inputs**: Completed draft, original Research Notes & Evidence Document (from `CAP-RES-04`).
- **Expected Outputs**: Verification report highlighting verified claims, unbacked statements, potential contradictions, and readability warnings.
- **Required Characteristics**: Sentence-level claim decomposition, bidirectional fact verification against source notes, discrepancy flagging.
- **Failure Modes**: False positives on harmless figures of speech; failing to detect subtle numeric distortions (e.g. changing "$500 to $1,500" to "under $500"); approving claims based on general training data rather than the provided source notes.
- **Quality Checks**: All flagged claims are resolved by the operator; zero unverified assertions remain in published text.
- **Dependencies**: Requires outputs from `CAP-CRT-01` and `CAP-RES-04`.
- **Human Oversight**: Human operator makes the final determination on every flagged discrepancy.
- **Evaluation Criteria (8 Dimensions)**:
  - *Problem Fit*: Provides the ultimate safety net against professional liability and AI hallucinations.
  - *Workflow Fit*: Serves as the formal quality checkpoint before finalizing the master draft.
  - *Usability*: Clear highlighting or diff view showing source fact vs. draft claim.
  - *Capability*: Precision and recall in identifying unbacked or distorted claims.
  - *Evidence*: Controlled benchmark test introducing 10 deliberate factual errors into a draft and measuring detection rate.
  - *Integration*: Inline document commenting or side-by-side verification report.
  - *Value*: Delivers peace of mind and reduces liability in medical, legal, and financial local services.
  - *Limitations*: Struggles with semantic parity when claims are heavily reworded or paraphrased.
- **Evidence Requirements**:
  - *Minimum*: Documentation detailing factual cross-checking or verification mechanisms.
  - *Preferred*: Test run (`PRODUCT_TEST`) testing detection of synthetic factual errors across 3 local business drafts.
  - *Evidence Gap*: Real-time automated verification against external private databases.
- **Tool Discovery Keywords**: `fact verification tool`, `claim verification against source`, `hallucination detection in drafts`, `editorial proofreading assistant`, `factual discrepancy flagging`.

---

### STAGE 4: REPURPOSE

#### 5.11 CAP-REP-01 — Semantic Format Transformation
- **Capability ID**: `CAP-REP-01`
- **Workflow Stage**: Stage 4 — Repurpose
- **Qualitative Priority**: Core Workflow Capability
- **Problem Addressed**: Creating derivative channel assets (Google Business Profile updates, service page FAQs, social summaries, client emails) requires tedious manual rewriting, causing operators to abandon multi-channel distribution.
- **Operational Definition**: The ability to extract core insights from an approved master article and reformat them into structured, platform-compliant derivative formats while strictly preserving original meaning, facts, and entity names.
- **User Outcome**: A single approved article automatically yields an entire pack of verified channel assets in seconds without message drift.
- **Required Inputs**: Approved Master Draft (from Stage 3), target platform format constraints (GBP character limits, FAQ schema structures, email lengths).
- **Expected Outputs**: Repurposed Content Asset Pack (1 GBP Post, 2–3 FAQ pairs with Q&A schema formatting, 1 email blurb, 2 short-form social posts).
- **Required Characteristics**: Multi-format structural adaptation, platform character limit compliance, semantic compression without nuance loss, retention of key local entities (NAP details, service names).
- **Failure Modes**: Truncating sentences mid-thought to meet character limits; changing factual nuances during summarization; writing promotional clickbait that contradicts the educational master article.
- **Quality Checks**: Every derivative asset accurately reflects the master article's claims; character limits strictly respected; appropriate CTA included.
- **Dependencies**: Requires approved Master Draft from `CAP-CRT-01` / `CAP-CRT-03`.
- **Human Oversight**: Operator reviews and approves the asset pack before publishing/scheduling.
- **Evaluation Criteria (8 Dimensions)**:
  - *Problem Fit*: Multiplies the ROI of a single content effort by populating all local business channels.
  - *Workflow Fit*: Takes the master draft as input and directly outputs ready-to-publish derivative files.
  - *Usability*: Generates the complete multi-channel pack in a single command or template execution.
  - *Capability*: Accuracy in extracting the true core takeaways without introducing new, unverified assertions.
  - *Evidence*: Verification of character limit compliance and factual parity across 10 generated asset packs.
  - *Integration*: Exports markdown, plain text, and HTML/JSON-LD for FAQs.
  - *Value*: Saves 60–90 minutes of manual repurposing per content piece.
  - *Limitations*: Different social platforms require different visual formatting that text-only tools cannot fulfill.
- **Evidence Requirements**:
  - *Minimum*: Documentation on multi-format transformation, summarization, and template adaptation.
  - *Preferred*: Empirical test (`PRODUCT_TEST`) transforming a 2,000-word guide into a 4-channel asset pack.
  - *Evidence Gap*: Direct API publishing to Google Business Profile or social channels.
- **Tool Discovery Keywords**: `semantic format transformation`, `content repurposing generator`, `article to GBP post`, `FAQ extraction tool`, `multi-channel content adaptation`.

---

#### 5.12 CAP-REP-02 — Cross-Asset Consistency Checking
- **Capability ID**: `CAP-REP-02`
- **Workflow Stage**: Stage 4 — Repurpose
- **Qualitative Priority**: Supporting Capability
- **Problem Addressed**: Summarizing and compressing content for different channels frequently introduces contradictions (e.g. stating a price or timeframe on GBP that contradicts the website service guide).
- **Operational Definition**: The ability to cross-compare all derivative assets (GBP updates, FAQs, social snippets, emails) against the approved master article to verify that key facts, numbers, dates, and recommendations remain 100% consistent across channels.
- **User Outcome**: The operator distributes multi-channel content with total confidence that no contradictory claims exist across their public footprint.
- **Required Inputs**: Repurposed Content Asset Pack (from `CAP-REP-01`), approved Master Draft.
- **Expected Outputs**: Consistency Audit Report confirming 100% claim alignment or highlighting specific discrepancies between channels.
- **Required Characteristics**: Multi-text entity extraction, numerical claim parity checking, contradiction detection across disparate text lengths.
- **Failure Modes**: Ignoring contradictory caveats omitted during shortening; false alarms on intentional stylistic variations.
- **Quality Checks**: Zero numerical or policy contradictions exist between derivative assets and the master guide.
- **Dependencies**: Requires outputs from `CAP-REP-01`.
- **Human Oversight**: Operator makes final correction on any identified cross-asset contradiction.
- **Evaluation Criteria (8 Dimensions)**:
  - *Problem Fit*: Protects business integrity across search engines and AI knowledge graphs.
  - *Workflow Fit*: Acts as the automated quality gate before scheduling multi-channel posts.
  - *Usability*: Simple pass/fail status with side-by-side discrepancy highlights.
  - *Capability*: Sensitivity in detecting subtle contradictions introduced during text compression.
  - *Evidence*: Test introducing intentional numerical discrepancies into derivative assets to measure detection rate.
  - *Integration*: Compares text batches directly within the workspace.
  - *Value*: Prevents public embarrassment and customer disputes resulting from conflicting channel data.
  - *Limitations*: Computationally intensive when comparing dozens of micro-assets simultaneously.
- **Evidence Requirements**:
  - *Minimum*: Documentation explaining cross-text contradiction or consistency detection features.
  - *Preferred*: Test run (`PRODUCT_TEST`) validating consistency across 5 complex multi-asset packs.
  - *Evidence Gap*: Automated cross-referencing against live, already-published social media feeds.
- **Tool Discovery Keywords**: `cross-asset consistency checking`, `content contradiction detection`, `multi-channel parity audit`, `semantic consistency verification`, `message drift prevention`.

---

### STAGE 5: MAINTAIN

#### 5.13 CAP-MNT-01 — Content Freshness Auditing
- **Capability ID**: `CAP-MNT-01`
- **Workflow Stage**: Stage 5 — Maintain
- **Qualitative Priority**: Core Workflow Capability
- **Problem Addressed**: Published content silently decays over time as business hours, pricing, staff, technologies, and regulations change, resulting in outdated information being indexed and retrieved by AI assistants.
- **Operational Definition**: The ability to scan existing published content on a scheduled or event-driven basis to detect temporal decay markers ("last year", "recently", outdated years), verify external link status, and flag potential conflicts with updated business parameters.
- **User Outcome**: The operator receives an automated alert indicating exactly which sections of published articles require updating, preventing content obsolescence.
- **Required Inputs**: Published content repository (Markdown files or URLs), updated business parameters, current calendar year.
- **Expected Outputs**: Freshness Audit Report highlighting outdated temporal phrases, broken links, superseded service details, and recertification urgency status.
- **Required Characteristics**: Temporal phrase pattern detection; link liveness verification; entity consistency checking against current business facts.
- **Failure Modes**: Missing subtle procedural changes that don't contain explicit date stamps; flagging harmless historical references.
- **Quality Checks**: Every temporal statement is verified; all links respond with valid HTTP status codes; audit timestamp is recorded.
- **Dependencies**: Operates on live published content inventory.
- **Human Oversight**: Operator confirms whether flagged sections require updates or remain accurate.
- **Evaluation Criteria (8 Dimensions)**:
  - *Problem Fit*: Directly tackles the widespread "publish and forget" failure mode in local business SEO.
  - *Workflow Fit*: Triggers Stage 5 maintenance workflows and feeds into surgical patching (`CAP-MNT-02`).
  - *Usability*: Provides a clear, prioritized checklist of articles needing attention.
  - *Capability*: Accuracy in distinguishing temporal claims needing updates from permanent historical context.
  - *Evidence*: Benchmark test running freshness audits across a sample of 2-year-old local business articles.
  - *Integration*: Scans local markdown repositories or live website URLs.
  - *Value*: Maintains search rankings and AI visibility without requiring full article rewrites.
  - *Limitations*: Cannot know internal business changes (e.g. dropped insurance plans) unless provided updated parameters.
- **Evidence Requirements**:
  - *Minimum*: Documentation describing content freshness, decay scanning, or link monitoring capabilities.
  - *Preferred*: Controlled test (`PRODUCT_TEST`) auditing 10 dated local service articles for temporal decay.
  - *Evidence Gap*: Integration with search engine indexing APIs to track real-time ranking decay.
- **Tool Discovery Keywords**: `content freshness audit`, `temporal decay detection`, `content decay scanner`, `outdated information checker`, `website maintenance audit`.

---

#### 5.14 CAP-MNT-02 — Revision Patching & Changelogging
- **Capability ID**: `CAP-MNT-02`
- **Workflow Stage**: Stage 5 — Maintain
- **Qualitative Priority**: Supporting Capability
- **Problem Addressed**: When updating an article, operators often rewrite entire pieces from scratch, wasting time and risking the accidental deletion of sound, high-ranking evergreen explanations.
- **Operational Definition**: The ability to perform surgical updates to specific outdated sections of an article, refresh metadata (`updatedAt`, `lastReviewed`), update affected derivative FAQ/GBP assets, and document a structured governance changelog.
- **User Outcome**: The operator updates existing content in 15 minutes, preserving sound evergreen text while logging full governance recertification.
- **Required Inputs**: Existing article markdown, Freshness Audit Report (from `CAP-MNT-01`), updated factual data.
- **Expected Outputs**: Patched article markdown, updated frontmatter metadata, structured changelog record (`change_notes`, `reviewer`, `date`).
- **Required Characteristics**: Surgical section replacement without altering surrounding text; automated metadata timestamp updates; structured changelog formatting.
- **Failure Modes**: Accidental formatting corruption during partial rewriting; failing to update derivative assets when core facts change; omitting governance notes.
- **Quality Checks**: Only outdated sections were modified; evergreen sections remain untouched; metadata accurately reflects update date and reviewer.
- **Dependencies**: Requires outputs from `CAP-MNT-01`.
- **Human Oversight**: Operator reviews and approves the revision patch and signs off on the changelog entry.
- **Evaluation Criteria (8 Dimensions)**:
  - *Problem Fit*: Makes content maintenance practical and low-friction for busy local operators.
  - *Workflow Fit*: Directly updates canonical content records in `content/` and `resource-data/`.
  - *Usability*: Clean diff preview showing exact before-and-after text changes.
  - *Capability*: Seamlessly integrates updated facts into existing prose without awkward tonal shifts.
  - *Evidence*: Verification of clean markdown patching and changelog preservation across test articles.
  - *Integration*: Compatible with Git diffs, standard markdown frontmatter, and CMS fields.
  - *Value*: Extends the active commercial lifespan of content assets from months to years.
  - *Limitations*: Substantial structural overhauls may require a full brief-driven rewrite rather than a patch.
- **Evidence Requirements**:
  - *Minimum*: Documentation on targeted text editing, version control, or changelogging support.
  - *Preferred*: Test run (`PRODUCT_TEST`) performing surgical factual updates on 3 local business guides.
  - *Evidence Gap*: Automated synchronization with external multi-location CMS deployments.
- **Tool Discovery Keywords**: `content revision patching`, `surgical text updating`, `editorial changelog tool`, `content version maintenance`, `governance update logger`.

---

## 6. Capability Dependencies & Interaction Model

The 14 capabilities interact through clear, staged handoffs, supporting both linear production and iterative refinement:

```
[STAGE 1: RESEARCH]
  CAP-RES-01 (Inquiry Clustering)
        │
        ▼
  CAP-RES-02 (Search/AI Intent) ──► CAP-RES-03 (Topic Gaps)
        │                                  │
        └─────────────────┬────────────────┘
                          ▼
             CAP-RES-04 (Fact Synthesis)
                          │
══════════════════════════╪══════════════════════════════ [HANDOFF 1: Research Notes]
                          ▼
[STAGE 2: BRIEF]
  CAP-BRF-01 (Outlining) ◄─── CAP-BRF-03 (Audience Intent)
        │
        ▼
  CAP-BRF-02 (Evidence Mapping)
                          │
══════════════════════════╪══════════════════════════════ [HANDOFF 2: Approved Content Brief]
                          ▼
[STAGE 3: CREATE]
  CAP-CRT-01 (Context-Bound Drafting)
        │
        ▼
  CAP-CRT-02 (Voice Calibration)
        │
        ▼
  CAP-CRT-03 (Fact Verification & Editing)
                          │
══════════════════════════╪══════════════════════════════ [HANDOFF 3: Master Draft]
                          ▼
[STAGE 4: REPURPOSE]
  CAP-REP-01 (Format Transformation) ──► CAP-REP-02 (Consistency Check)
                          │
══════════════════════════╪══════════════════════════════ [HANDOFF 4: Published Inventory]
                          ▼
[STAGE 5: MAINTAIN]
  CAP-MNT-01 (Freshness Audit) ──► CAP-MNT-02 (Revision Patching)
```

---

## 7. Capability Priority Matrix

To guide evaluation rigor without relying on artificial numerical scores, capabilities are categorized into three qualitative operational tiers:

| Operational Priority | Capabilities Included | Rationale |
|---|---|---|
| **Tier 1: Core Workflow Capabilities** | `CAP-RES-01`, `CAP-RES-02`, `CAP-RES-04`, `CAP-BRF-01`, `CAP-BRF-02`, `CAP-CRT-01`, `CAP-CRT-02`, `CAP-CRT-03`, `CAP-REP-01`, `CAP-MNT-01` | Essential to the integrity of the Knowledge First workflow. Without these capabilities, content creation collapses into ungrounded prompts, hallucinated claims, or operational decay. |
| **Tier 2: Supporting Capabilities** | `CAP-RES-03`, `CAP-BRF-03`, `CAP-REP-02`, `CAP-MNT-02` | Substantially enhance efficiency, competitive differentiation, cross-channel accuracy, and long-term maintainability, but the core workflow can function manually if absent. |
| **Tier 3: Optional Enhancements** | *(None in Pilot v1.0)* | Advanced multi-language adaptation, enterprise CMS syndication, and visual asset generation are strictly deferred beyond Pilot v1.0. |

---

## 8. Privacy, Security, and Commercial Governance

### 8.1 Privacy as a Capability Limitation, Not a Global Dimension
Privacy and security are **not** created as a separate ninth dimension. Instead, privacy is evaluated as an explicit constraint within **Usability**, **Limitations**, and **Workflow Fit**:
- In high-compliance verticals (legal client intake, dental patient records), any tool fulfilling `CAP-RES-01` (Customer Inquiry Discovery) must guarantee that customer data is not stored permanently or used for public LLM training.
- In general commercial verticals, standard data privacy compliance (GDPR/CCPA compliant storage) is sufficient.
- *Strict Rule*: Evaluators must document data retention and training opt-out status under **Dimension 8 (Limitations)** for every candidate tool.

### 8.2 Commercial Independence & Affiliate Separation
- Pricing models (Free plan, Freemium, Subscription, Usage tiers) are descriptive data points captured under **Commercial Information**, but they do **not** determine Problem Fit, Capability, or Evidence strength.
- **Affiliate commission is NEVER an evaluation criterion**.
- Affiliate status (`NONE`, `PENDING`, `ACTIVE`) remains isolated in the separate `affiliate` data entity (`schemas/affiliate.schema.json`), preserving complete decoupling between technical evaluation and commercial monetization.

---

## 9. Recommendation Readiness Protocol

Before any future candidate tool discovered in Sprint A.3.3 can be recommended in Sprint A.3.5, it must satisfy all **10 Recommendation Readiness Gates**:

```
[GATE 01] Target User Profile is explicitly defined.
[GATE 02] Specific Business Problem is documented.
[GATE 03] Workflow Stage is identified (Research, Brief, Create, Repurpose, Maintain).
[GATE 04] Specific Capability ID is assigned (e.g. CAP-RES-04).
[GATE 05] Empirical Evidence exists with strength HIGH or MEDIUM (replicated PRODUCT_TEST).
[GATE 06] Formal Evaluation is completed across all 8 dimensions without numeric scores.
[GATE 07] Concrete Limitations and failure modes are explicitly documented.
[GATE 08] Recommendation Rationale is documented explaining why it fits this workflow.
[GATE 09] Reviewer identity and Governance Review Date are recorded.
[GATE 10] Tool does NOT hold RETIRED status (Rule 009).
```

---

## 10. Human + AI Responsibilities in Evaluation

Following **Founder + AI + System**:

```
┌───────────────────────────────────────────────┬──────────────────────────────────────────────┐
│ AI SYSTEM ROLE (Research & Compilation)       │ HUMAN OPERATOR / FOUNDER (Decider)           │
├───────────────────────────────────────────────┼──────────────────────────────────────────────┤
│ Scans vendor documentation and pricing pages  │ Verifies accuracy of documentation findings   │
│ Assembles test datasets and benchmark prompts │ Conducts hands-on product testing            │
│ Organizes empirical test outputs into tables  │ Evaluates qualitative nuances and friction   │
│ Flags potential limitations and failure modes │ Makes final judgment on Problem/Workflow fit  │
│ Drafts standardized evaluation records        │ Holds sole authority to approve recommendations│
│ Checks cross-entity relationship integrity    │ Decides whether evidence is sufficient        │
└───────────────────────────────────────────────┴──────────────────────────────────────────────┘
```

> **Hard Governance Rule**: AI systems may assist in data compilation and draft preparation, but AI will **never** autonomously decide a "best tool" or issue a recommendation.

---

## 11. Upstream & Downstream Integration Roadmap

```
[Sprint A.3.1: Pilot Problem & Workflow Definition]
        │  • Established 5-Stage Workflow (WF-AICONTENT-001)
        │  • Defined User, Problem, and Outcomes
        ▼
[Sprint A.3.2: Capability Mapping & Evaluation Criteria (THIS SPECIFICATION)]
        │  • Mapped 14 Tool-Agnostic Capabilities with 16 Attributes
        │  • Codified 8 Qualitative Dimensions & Evidence Strength Model
        │  • Defined Discovery Keywords & Recommendation Readiness Gates
        ▼  (STRICTLY DEFERRED TO NEXT SPRINTS)
[Sprint A.3.3: Candidate Tool Discovery & Longlisting]
        │  • Execute search queries using capability discovery keywords
        │  • Longlist candidate tools matching required capabilities
        ▼
[Sprint A.3.4: Empirical Evaluation & Evidence Collection]
        │  • Conduct hands-on product tests (`PRODUCT_TEST`)
        │  • Collect documentation and pricing evidence
        │  • Populate canonical `evidence` and `evaluation` records
        ▼
[Sprint A.3.5: Recommendation Decision & Resource Layer Publication]
           • Founder reviews evaluations and issues formal recommendations
           • Publish first production Tool, Resource, and Recommendation records
```
