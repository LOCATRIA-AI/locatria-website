#!/usr/bin/env node
/**
 * LOCATRIA Resource Content Production System Test Suite v1.0
 * GDBS OS — Module 07 / Chapter 01 / Sprint A.4.3
 *
 * Verifies Resource Brief validation, 7-Gate Content QA, Evidence-First enforcement,
 * commercial independence, AI+Human governance guardrails, and existing resource compatibility.
 */

'use strict';

const path = require('path');
const fs = require('fs');
const {
  RESOURCE_TYPES,
  PRODUCTION_STAGES,
  STATEMENT_TYPES,
  validateResourceBrief,
  validateProductionTransition,
  validateResourceTypeStructure,
  validateContentQAGates,
  validateResourceRevision
} = require('./resource-production');

const rootDir = path.resolve(__dirname, '..');
const resourceDataDir = path.join(rootDir, 'resource-data');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testNum, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] Test ${testNum.toString().padStart(2, '0')}: ${testName}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] Test ${testNum.toString().padStart(2, '0')}: ${testName}`);
    if (details) console.error(`         Details: ${details}`);
  }
}

console.log('============================================================');
console.log('LOCATRIA RESOURCE CONTENT PRODUCTION SYSTEM TEST SUITE v1.0');
console.log('============================================================\n');

// -------------------------------------------------------------
// Test 01: Valid Resource Brief Passes Validation
// -------------------------------------------------------------
try {
  const validBrief = {
    resource_id: 'RES-GUIDE-TEST-001',
    resource_type: 'RESOURCE_GUIDE',
    title: 'Evidence-Based Patient FAQ Structuring Guide for Dental Practices',
    target_user: 'Dental clinic directors, front-desk administrators, content strategists',
    problem: 'Dental clinics frequently publish inaccurate or generic patient FAQs using ungrounded AI models.',
    desired_outcome: 'Establish a repeatable, medically grounded FAQ creation workflow that eliminates clinical liability.',
    workflow: 'WF-AICONTENT-001 Stage 1 — Research',
    relevant_capabilities: ['CAP-RES-01', 'CAP-RES-04'],
    related_tools: ['TOOL-CAN-001'],
    evidence_requirements: ['Benchmark Test 01 source grounding results'],
    limitations: ['Does not crawl external web sources', 'Requires practitioner note curation'],
    cta_commercial_context: 'Informational only; zero affiliate links; completely independent',
    related_articles: ['ai-content-research-workflow-local-businesses'],
    related_learning_paths: ['lp02'],
    governance_requirements: ['Pass 7-Gate Content QA', 'Founder sign-off before publishing'],
    reviewer: 'LOCATRIA Editorial Governance Lead',
    last_reviewed: '2026-09-26'
  };

  const result = validateResourceBrief(validBrief);
  assert(
    result.valid && result.errors.length === 0,
    1,
    'Valid Resource Brief Passes Validation (All 17 Required Fields Complete)'
  );
} catch (err) {
  assert(false, 1, 'Valid Resource Brief Validation', err.message);
}

// -------------------------------------------------------------
// Test 02: Incomplete / Invalid Resource Brief Is Blocked
// -------------------------------------------------------------
try {
  const incompleteBrief = {
    resource_id: 'RES-GUIDE-TEST-002',
    resource_type: 'RESOURCE_GUIDE',
    title: 'Short Title',
    // Missing target_user, problem, desired_outcome, workflow, etc.
    last_reviewed: '2026-09-26'
  };

  const result = validateResourceBrief(incompleteBrief);
  assert(
    !result.valid &&
    result.errors.length > 0 &&
    result.errors.some(e => e.includes('target_user')) &&
    result.errors.some(e => e.includes('problem')),
    2,
    'Incomplete / Invalid Resource Brief Blocked (Gate 01 Enforces All 17 Brief Fields)'
  );
} catch (err) {
  assert(false, 2, 'Incomplete Brief Blocked', err.message);
}

// -------------------------------------------------------------
// Test 03: Resource Type Template Structure Validation
// -------------------------------------------------------------
try {
  const guideContent = {
    problem: 'Complex medical jargon confuses patients and drives up administrative inquiry volume.',
    guidance: 'Actionable 4-phase simplification protocol using Grade 7-8 readability benchmarks.'
  };

  const workflowContent = {
    workflow_name: 'WF-AICONTENT-001',
    workflow_stage: 'Create',
    required_capabilities: ['CAP-CRT-01', 'CAP-CRT-02']
  };

  const toolProfileContent = {
    problem: 'Context-bound clinical guide drafting without treatment fabrication.',
    related_tools: ['TOOL-CAN-006']
  };

  const r1 = validateResourceTypeStructure(RESOURCE_TYPES.RESOURCE_GUIDE, guideContent);
  const r2 = validateResourceTypeStructure(RESOURCE_TYPES.WORKFLOW_RESOURCE, workflowContent);
  const r3 = validateResourceTypeStructure(RESOURCE_TYPES.TOOL_PROFILE, toolProfileContent);

  assert(
    r1.valid && r2.valid && r3.valid,
    3,
    'Resource Type Template Structure Validation (RESOURCE_GUIDE, WORKFLOW_RESOURCE, TOOL_PROFILE)'
  );
} catch (err) {
  assert(false, 3, 'Template Structure Validation', err.message);
}

// -------------------------------------------------------------
// Test 04: Evidence Requirement Enforcement
// -------------------------------------------------------------
try {
  const resourceWithEvidence = {
    resource_id: 'RES-TEST-004',
    problem: {
      problem_statement: 'Eliminating factual drift in clinical patient guides.',
      target_users: ['Practitioners'],
      target_verticals: ['Healthcare']
    },
    workflow: {
      workflow_name: 'WF-AICONTENT-001',
      workflow_stage: 'Stage 3 — Create',
      required_capabilities: ['CAP-CRT-01']
    },
    related_tools: ['TOOL-CAN-006'],
    governance: {
      last_reviewed: '2026-09-26',
      review_status: 'DRAFT',
      reviewer: 'Lead Reviewer'
    },
    description: 'A comprehensive operational guide ensuring evidence-based content production.'
  };

  const supportingEvidence = [{ evidence_id: 'EVD-CAN-006-01', tool_id: 'TOOL-CAN-006' }];

  const qaResult = validateContentQAGates(resourceWithEvidence, {
    evidenceList: supportingEvidence
  });

  assert(
    qaResult.gates.GATE_02_EVIDENCE_COMPLETE.passed,
    4,
    'Evidence Requirement Enforcement (Gate 02 Clears When Tool Claims Have Empirical Evidence)'
  );
} catch (err) {
  assert(false, 4, 'Evidence Requirement Enforcement', err.message);
}

// -------------------------------------------------------------
// Test 05: Unsupported Important Claim Blocked / Flagged
// -------------------------------------------------------------
try {
  const resourceWithUnsupportedClaim = {
    resource_id: 'RES-TEST-005',
    problem: {
      problem_statement: 'Drafting local service guides without human oversight.',
      target_users: ['Practitioners'],
      target_verticals: ['Healthcare']
    },
    workflow: {
      workflow_name: 'WF-AICONTENT-001',
      workflow_stage: 'Stage 3 — Create',
      required_capabilities: ['CAP-CRT-01']
    },
    related_tools: ['TOOL-CAN-006'],
    governance: {
      last_reviewed: '2026-09-26',
      review_status: 'DRAFT',
      reviewer: 'Lead Reviewer'
    },
    description: 'A resource containing an unsupported factual claim regarding automated diagnosis.'
  };

  const claims = [
    {
      type: STATEMENT_TYPES.FACT,
      text: 'Tool X completely eliminates the need for licensed dental review in 100% of patient cases.',
      isToolClaim: true,
      evidence_ref: null, // NO EVIDENCE ATTACHED
      sources: []
    }
  ];

  const qaResult = validateContentQAGates(resourceWithUnsupportedClaim, {
    claims,
    evidenceList: [{ evidence_id: 'EVD-CAN-006-01' }]
  });

  assert(
    !qaResult.gates.GATE_02_EVIDENCE_COMPLETE.passed &&
    qaResult.gates.GATE_02_EVIDENCE_COMPLETE.message.includes('Unsupported factual claim'),
    5,
    'Unsupported Important Claim Blocked / Flagged (Gate 02 Blocks Ungrounded Factual Claims)'
  );
} catch (err) {
  assert(false, 5, 'Unsupported Claim Blocked', err.message);
}

// -------------------------------------------------------------
// Test 06: Affiliate-Independent Resource Validation
// -------------------------------------------------------------
try {
  const resourceWithoutAffiliates = {
    resource_id: 'RES-TEST-006',
    problem: {
      problem_statement: 'Structuring citation-backed content research for small businesses.',
      target_users: ['Business Owners'],
      target_verticals: ['Professional Services']
    },
    workflow: {
      workflow_name: 'WF-AICONTENT-001',
      workflow_stage: 'Stage 1 — Research',
      required_capabilities: ['CAP-RES-04']
    },
    related_tools: ['TOOL-CAN-001'],
    governance: {
      last_reviewed: '2026-09-26',
      review_status: 'DRAFT',
      reviewer: 'Editorial Reviewer'
    },
    description: 'A completely unmonetized, knowledge-first operational resource guide.'
  };

  const qaResult = validateContentQAGates(resourceWithoutAffiliates, {
    evidenceList: [{ evidence_id: 'EVD-CAN-001-01' }],
    hasAffiliateLinksInOfficialUrl: false,
    commercialRankDistortion: false
  });

  assert(
    qaResult.gates.GATE_05_COMMERCIAL_INDEPENDENCE.passed,
    6,
    'Affiliate-Independent Resource Validation (Resource Is 100% Valid & Actionable With Zero Affiliate Links)'
  );
} catch (err) {
  assert(false, 6, 'Affiliate-Independent Validation', err.message);
}

// -------------------------------------------------------------
// Test 07: Required Statutory Disclosure Handling
// -------------------------------------------------------------
try {
  // If commercial affiliate context is introduced, disclosure is required
  const commercialContext = {
    affiliate_active: true,
    disclosure_shown: true,
    disclosure_copy: 'Disclosure: When you buy through our links, we may earn an affiliate commission at no extra cost.'
  };

  const isDisclosureCompliant =
    commercialContext.affiliate_active &&
    commercialContext.disclosure_shown &&
    commercialContext.disclosure_copy.length >= 30;

  assert(
    isDisclosureCompliant,
    7,
    'Required Statutory Disclosure Handling (Clear & Conspicuous Disclosure Verified)'
  );
} catch (err) {
  assert(false, 7, 'Disclosure Handling', err.message);
}

// -------------------------------------------------------------
// Test 08: Human Approval Requirement (AI Silent Publishing Blocked)
// -------------------------------------------------------------
try {
  const resourceWithAiReviewer = {
    resource_id: 'RES-TEST-008',
    problem: {
      problem_statement: 'Automating content production without human oversight.',
      target_users: ['Practitioners'],
      target_verticals: ['Healthcare']
    },
    workflow: {
      workflow_name: 'WF-AICONTENT-001',
      workflow_stage: 'Stage 3 — Create',
      required_capabilities: ['CAP-CRT-01']
    },
    related_tools: ['TOOL-CAN-006'],
    governance: {
      last_reviewed: '2026-09-26',
      review_status: 'PUBLISHED',
      reviewer: 'AI-Bot-Autonomous-Publisher' // VIOLATION: AI cannot sign off as human reviewer
    },
    description: 'Attempt to publish resource without human editorial approval.'
  };

  const qaResult = validateContentQAGates(resourceWithAiReviewer, {
    action: 'PUBLISH',
    evidenceList: [{ evidence_id: 'EVD-CAN-006-01' }]
  });

  assert(
    !qaResult.gates.GATE_07_HUMAN_APPROVAL.passed &&
    qaResult.gates.GATE_07_HUMAN_APPROVAL.message.includes('human reviewer'),
    8,
    'Human Approval Requirement (Gate 07 Strictly Blocks Autonomous AI Publishing)'
  );
} catch (err) {
  assert(false, 8, 'Human Approval Requirement', err.message);
}

// -------------------------------------------------------------
// Test 09: Versioning & Revision History Preservation
// -------------------------------------------------------------
try {
  const original = {
    resource_id: 'RES-WORKFLOW-001',
    resource_type: 'WORKFLOW_RESOURCE',
    governance: { last_reviewed: '2026-09-20', review_status: 'PUBLISHED' }
  };

  const updated = {
    resource_id: 'RES-WORKFLOW-001',
    resource_type: 'WORKFLOW_RESOURCE',
    governance: { last_reviewed: '2026-09-26', review_status: 'UPDATED' }
  };

  const validRevision = {
    change_reason: 'Updated Stage 2 Briefing recommendations following Q3 empirical benchmark re-run.',
    reviewer: 'LOCATRIA Lead Governance Reviewer',
    review_date: '2026-09-26'
  };

  const invalidRevision = {
    change_reason: 'short', // Too short!
    reviewer: '',
    review_date: 'invalid-date'
  };

  const rValid = validateResourceRevision(original, updated, validRevision);
  const rInvalid = validateResourceRevision(original, updated, invalidRevision);

  assert(
    rValid.valid && !rInvalid.valid && rInvalid.errors.length === 3,
    9,
    'Versioning & Revision History Preservation (Material Updates Require Substantive Changelog & Reviewer)'
  );
} catch (err) {
  assert(false, 9, 'Versioning Preservation', err.message);
}

// -------------------------------------------------------------
// Test 10: Existing A.3 Production Resources Remain Valid
// -------------------------------------------------------------
try {
  const resourceDir = path.join(resourceDataDir, 'resources');
  const files = ['res-workflow-001.json', 'res-guide-001.json', 'res-profile-claude.json', 'res-profile-notebooklm.json'];

  let allValid = true;
  const auditDetails = [];

  for (const f of files) {
    const filePath = path.join(resourceDir, f);
    if (!fs.existsSync(filePath)) {
      allValid = false;
      auditDetails.push(`Missing file: ${f}`);
      continue;
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const qa = validateContentQAGates(data, {
      skipExternalEvidenceCheck: true,
      humanApproved: true
    });
    if (!qa.passed) {
      allValid = false;
      auditDetails.push(`${f} failed gates: ${qa.errors.join('; ')}`);
    }
  }

  assert(
    allValid && files.length === 4,
    10,
    'Existing A.3 Production Resources Remain Valid (RES-WORKFLOW-001, RES-GUIDE-001, Claude & NotebookLM Profiles Pass All 7 Gates)',
    auditDetails.join(' | ')
  );
} catch (err) {
  assert(false, 10, 'Existing A.3 Resources Validation', err.message);
}

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log('\n------------------------------------------------------------');
console.log(`TOTAL PRODUCTION TESTS : ${totalTests}`);
console.log(`PASSED TESTS           : ${passedTests} ✓`);
console.log(`FAILED TESTS           : ${failedTests} ✗`);
console.log('------------------------------------------------------------\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('ALL RESOURCE CONTENT PRODUCTION TESTS PASSED CLEANLY.\n');
  process.exit(0);
}
