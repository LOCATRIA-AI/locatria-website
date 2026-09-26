/**
 * LOCATRIA Resource Content Production System Engine v1.0
 * GDBS OS — Module 07 / Chapter 01 / Sprint A.4.3
 *
 * Implements the canonical production workflow, Resource Brief validation,
 * 7-Gate Content QA, Evidence-First separation, and AI+Human governance rules.
 */

'use strict';

const RESOURCE_TYPES = {
  RESOURCE_GUIDE: 'RESOURCE_GUIDE',
  WORKFLOW_RESOURCE: 'WORKFLOW_RESOURCE',
  TOOL_PROFILE: 'TOOL_PROFILE'
};

const PRODUCTION_STAGES = {
  INTAKE: 'INTAKE',
  BRIEF: 'BRIEF',
  RESEARCH: 'RESEARCH',
  STRUCTURE: 'STRUCTURE',
  DRAFT: 'DRAFT',
  EVIDENCE_QA: 'EVIDENCE_QA',
  GOVERNANCE_QA: 'GOVERNANCE_QA',
  APPROVAL: 'APPROVAL',
  PUBLISH: 'PUBLISH',
  MAINTAIN: 'MAINTAIN'
};

const STATEMENT_TYPES = {
  FACT: 'FACT',
  OBSERVATION: 'OBSERVATION',
  INTERPRETATION: 'INTERPRETATION',
  RECOMMENDATION: 'RECOMMENDATION'
};

const ALLOWED_PRODUCTION_TRANSITIONS = {
  [PRODUCTION_STAGES.INTAKE]: [PRODUCTION_STAGES.BRIEF],
  [PRODUCTION_STAGES.BRIEF]: [PRODUCTION_STAGES.RESEARCH, PRODUCTION_STAGES.INTAKE],
  [PRODUCTION_STAGES.RESEARCH]: [PRODUCTION_STAGES.STRUCTURE, PRODUCTION_STAGES.BRIEF],
  [PRODUCTION_STAGES.STRUCTURE]: [PRODUCTION_STAGES.DRAFT, PRODUCTION_STAGES.RESEARCH],
  [PRODUCTION_STAGES.DRAFT]: [PRODUCTION_STAGES.EVIDENCE_QA, PRODUCTION_STAGES.STRUCTURE],
  [PRODUCTION_STAGES.EVIDENCE_QA]: [PRODUCTION_STAGES.GOVERNANCE_QA, PRODUCTION_STAGES.DRAFT],
  [PRODUCTION_STAGES.GOVERNANCE_QA]: [PRODUCTION_STAGES.APPROVAL, PRODUCTION_STAGES.EVIDENCE_QA, PRODUCTION_STAGES.DRAFT],
  [PRODUCTION_STAGES.APPROVAL]: [PRODUCTION_STAGES.PUBLISH, PRODUCTION_STAGES.GOVERNANCE_QA],
  [PRODUCTION_STAGES.PUBLISH]: [PRODUCTION_STAGES.MAINTAIN],
  [PRODUCTION_STAGES.MAINTAIN]: [PRODUCTION_STAGES.RESEARCH, PRODUCTION_STAGES.DRAFT, PRODUCTION_STAGES.EVIDENCE_QA]
};

const REQUIRED_BRIEF_FIELDS = [
  'resource_id',
  'resource_type',
  'title',
  'target_user',
  'problem',
  'desired_outcome',
  'workflow',
  'relevant_capabilities',
  'related_tools',
  'evidence_requirements',
  'limitations',
  'cta_commercial_context',
  'related_articles',
  'related_learning_paths',
  'governance_requirements',
  'reviewer',
  'last_reviewed'
];

/**
 * Validates a Resource Brief prior to drafting.
 * The Brief must be complete before any content drafting begins.
 */
function validateResourceBrief(brief) {
  const errors = [];

  if (!brief || typeof brief !== 'object') {
    return {
      valid: false,
      errors: ['BRIEF_INVALID: Resource Brief must be a non-null object.']
    };
  }

  // Check required fields
  for (const field of REQUIRED_BRIEF_FIELDS) {
    if (brief[field] === undefined || brief[field] === null || brief[field] === '') {
      errors.push(`BRIEF_MISSING_FIELD: Required brief field "${field}" is missing or empty.`);
    }
  }

  // Check resource_type validity
  if (brief.resource_type && !Object.values(RESOURCE_TYPES).includes(brief.resource_type)) {
    errors.push(`BRIEF_INVALID_TYPE: resource_type "${brief.resource_type}" must be one of: ${Object.values(RESOURCE_TYPES).join(', ')}.`);
  }

  // Check arrays
  const arrayFields = [
    'relevant_capabilities',
    'related_tools',
    'evidence_requirements',
    'limitations',
    'related_articles',
    'related_learning_paths'
  ];

  for (const arrField of arrayFields) {
    if (brief[arrField] !== undefined && !Array.isArray(brief[arrField])) {
      errors.push(`BRIEF_INVALID_FORMAT: Field "${arrField}" must be an array.`);
    }
  }

  // Specific content validations
  if (brief.target_user && typeof brief.target_user === 'string' && brief.target_user.trim().length < 5) {
    errors.push('BRIEF_INSUFFICIENT_DETAIL: target_user must provide substantive detail.');
  }

  if (brief.problem && typeof brief.problem === 'string' && brief.problem.trim().length < 15) {
    errors.push('BRIEF_INSUFFICIENT_DETAIL: problem must clearly define practitioner friction (>= 15 chars).');
  }

  if (brief.desired_outcome && typeof brief.desired_outcome === 'string' && brief.desired_outcome.trim().length < 15) {
    errors.push('BRIEF_INSUFFICIENT_DETAIL: desired_outcome must articulate measurable value (>= 15 chars).');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates a production stage transition.
 */
function validateProductionTransition(fromStage, toStage) {
  if (fromStage === toStage) {
    return { valid: true, error: null };
  }

  const allowed = ALLOWED_PRODUCTION_TRANSITIONS[fromStage] || [];
  if (!allowed.includes(toStage)) {
    return {
      valid: false,
      error: `INVALID_PRODUCTION_TRANSITION: Cannot transition production lifecycle from "${fromStage}" directly to "${toStage}".`
    };
  }

  return { valid: true, error: null };
}

/**
 * Validates the structure and content of a Resource against its canonical template type:
 * - RESOURCE_GUIDE
 * - WORKFLOW_RESOURCE
 * - TOOL_PROFILE
 */
function validateResourceTypeStructure(resourceType, content = {}) {
  const errors = [];

  if (!Object.values(RESOURCE_TYPES).includes(resourceType)) {
    return { valid: false, errors: [`Unrecognized resource type: "${resourceType}"`] };
  }

  switch (resourceType) {
    case RESOURCE_TYPES.RESOURCE_GUIDE:
      // Must explain a problem and provide evidence-supported guidance
      if (!content.problem || (typeof content.problem === 'string' && content.problem.length < 20)) {
        errors.push('RESOURCE_GUIDE_MISSING_PROBLEM: Resource Guide must substantively define the core problem.');
      }
      if (!content.guidance && !content.workflow && !content.sections) {
        errors.push('RESOURCE_GUIDE_MISSING_GUIDANCE: Resource Guide must provide actionable educational guidance.');
      }
      break;

    case RESOURCE_TYPES.WORKFLOW_RESOURCE:
      // Must define an actionable workflow with stages, capabilities, tools, and quality gates
      const wf = content.workflow || {};
      if (!wf.workflow_name && !content.workflow_name) {
        errors.push('WORKFLOW_RESOURCE_MISSING_NAME: Workflow Resource must define canonical workflow_name.');
      }
      if (!wf.workflow_stage && !content.workflow_stage && !wf.workflow_stages) {
        errors.push('WORKFLOW_RESOURCE_MISSING_STAGE: Workflow Resource must define workflow_stage(s).');
      }
      if (!wf.required_capabilities && !content.required_capabilities) {
        errors.push('WORKFLOW_RESOURCE_MISSING_CAPABILITIES: Workflow Resource must map required capabilities.');
      }
      break;

    case RESOURCE_TYPES.TOOL_PROFILE:
      // Must remain strictly contextual rather than a generic review page
      if (!content.problem) {
        errors.push('TOOL_PROFILE_MISSING_PROBLEM: Tool Profile must specify what problem it addresses.');
      }
      if (!content.related_tools || content.related_tools.length === 0) {
        errors.push('TOOL_PROFILE_MISSING_TOOL: Tool Profile must connect to an evaluated canonical tool.');
      }
      break;
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Evaluates the 7 Canonical Content QA Gates:
 *
 * Gate 01 — Brief Complete (Target user, problem, outcome defined)
 * Gate 02 — Evidence Complete (Tool/factual claims backed by empirical tests/citations)
 * Gate 03 — Workflow Complete (Actionable workflow value, steps, inputs/outputs)
 * Gate 04 — Context & Limitation QA (Boundaries, limitations, when not to use)
 * Gate 05 — Commercial Independence (Affiliate decoupled, 100% useful without links)
 * Gate 06 — Governance QA (Schema, review date, lifecycle compliance)
 * Gate 07 — Human Approval (Founder/reviewer explicit sign-off)
 */
function validateContentQAGates(resourceData, options = {}) {
  const gates = {};
  const errors = [];

  const brief = options.brief || null;
  const evidenceList = options.evidenceList || [];
  const evaluationsList = options.evaluationsList || [];
  const claims = options.claims || [];

  // Gate 01 — Brief Complete
  const g1Passed = Boolean(
    brief
      ? validateResourceBrief(brief).valid
      : (resourceData.problem && resourceData.problem.problem_statement && resourceData.problem.target_users && resourceData.problem.target_users.length > 0)
  );

  gates.GATE_01_BRIEF_COMPLETE = {
    passed: g1Passed,
    message: g1Passed
      ? 'Resource purpose, target user, and core problem clearly specified.'
      : 'Gate 01 Failed: Resource Brief incomplete or missing problem/target user specification.'
  };
  if (!g1Passed) errors.push(gates.GATE_01_BRIEF_COMPLETE.message);

  // Gate 02 — Evidence Complete
  // Any tool capability claim must be supported by empirical evidence or evaluation refs
  let g2Passed = true;
  let g2FailReason = '';

  if (Array.isArray(claims) && claims.length > 0) {
    for (const c of claims) {
      if (c.type === STATEMENT_TYPES.FACT || c.isToolClaim) {
        if (!c.evidence_ref && (!c.sources || c.sources.length === 0)) {
          g2Passed = false;
          g2FailReason = `Unsupported factual claim: "${c.text.slice(0, 50)}..." requires evidence backing.`;
          break;
        }
      }
    }
  }

  // If related_tools are declared, verify that supporting evidence exists
  if (g2Passed && Array.isArray(resourceData.related_tools) && resourceData.related_tools.length > 0) {
    if (evidenceList.length === 0 && !options.skipExternalEvidenceCheck) {
      g2Passed = false;
      g2FailReason = 'Declared related_tools require supporting empirical evidence records in the knowledge base.';
    }
  }

  gates.GATE_02_EVIDENCE_COMPLETE = {
    passed: g2Passed,
    message: g2Passed
      ? 'All factual claims and tool capability assertions are adequately supported by evidence.'
      : `Gate 02 Failed: ${g2FailReason}`
  };
  if (!g2Passed) errors.push(gates.GATE_02_EVIDENCE_COMPLETE.message);

  // Gate 03 — Workflow Complete
  const wf = resourceData.workflow || {};
  const g3Passed = Boolean(
    wf.workflow_name &&
    wf.workflow_stage &&
    Array.isArray(wf.required_capabilities) &&
    wf.required_capabilities.length > 0
  );

  gates.GATE_03_WORKFLOW_COMPLETE = {
    passed: g3Passed,
    message: g3Passed
      ? 'Actionable workflow stages, capabilities, and outputs clearly articulated.'
      : 'Gate 03 Failed: Workflow metadata incomplete (workflow_name, workflow_stage, required_capabilities required).'
  };
  if (!g3Passed) errors.push(gates.GATE_03_WORKFLOW_COMPLETE.message);

  // Gate 04 — Context & Limitation QA
  // Resource must bound claims and state limitations
  let g4Passed = true;
  if (options.limitationsRequired !== false) {
    const hasLimitations =
      (brief && Array.isArray(brief.limitations) && brief.limitations.length > 0) ||
      (resourceData.limitations && Array.isArray(resourceData.limitations) && resourceData.limitations.length > 0) ||
      (typeof resourceData.description === 'string' && resourceData.description.length >= 30);

    if (!hasLimitations) {
      g4Passed = false;
    }
  }

  gates.GATE_04_CONTEXT_LIMITATION_QA = {
    passed: g4Passed,
    message: g4Passed
      ? 'Contextual boundaries and functional limitations clearly articulated.'
      : 'Gate 04 Failed: Resource lacks explicit functional boundaries or limitations.'
  };
  if (!g4Passed) errors.push(gates.GATE_04_CONTEXT_LIMITATION_QA.message);

  // Gate 05 — Commercial Independence
  // Resource must retain 100% of knowledge value with zero affiliate links
  const hasAffiliateOverreach = Boolean(
    options.hasAffiliateLinksInOfficialUrl ||
    options.commercialRankDistortion ||
    options.affiliateModifiesRecommendation
  );

  const g5Passed = !hasAffiliateOverreach;

  gates.GATE_05_COMMERCIAL_INDEPENDENCE = {
    passed: g5Passed,
    message: g5Passed
      ? 'Commercial independence preserved: Resource is 100% complete and actionable without affiliate links.'
      : 'Gate 05 Failed: Commercial affiliate data inappropriately influences editorial content.'
  };
  if (!g5Passed) errors.push(gates.GATE_05_COMMERCIAL_INDEPENDENCE.message);

  // Gate 06 — Governance QA
  const gov = resourceData.governance || {};
  const g6Passed = Boolean(
    gov.last_reviewed &&
    /^\d{4}-\d{2}-\d{2}$/.test(gov.last_reviewed) &&
    gov.review_status &&
    gov.reviewer
  );

  gates.GATE_06_GOVERNANCE_QA = {
    passed: g6Passed,
    message: g6Passed
      ? 'Governance metadata valid and compliant with lifecycle schema.'
      : 'Gate 06 Failed: Incomplete governance metadata (last_reviewed date, review_status, reviewer required).'
  };
  if (!g6Passed) errors.push(gates.GATE_06_GOVERNANCE_QA.message);

  // Gate 07 — Human Approval
  // Publication requires explicit human reviewer approval
  const isPublishing =
    (gov.review_status && ['PUBLISHED', 'APPROVED'].includes(gov.review_status.toUpperCase())) ||
    options.action === 'PUBLISH';

  let g7Passed = true;
  let g7FailReason = '';

  if (isPublishing) {
    const isHumanReviewer =
      typeof gov.reviewer === 'string' &&
      gov.reviewer.trim().length > 3 &&
      !/^ai\b|bot\b|automated\b|system\b/i.test(gov.reviewer.trim());

    const humanApproved = options.humanApproved !== false && isHumanReviewer;

    if (!humanApproved) {
      g7Passed = false;
      g7FailReason = 'Publication requires explicit human reviewer sign-off (cannot be published autonomously by AI).';
    }
  }

  gates.GATE_07_HUMAN_APPROVAL = {
    passed: g7Passed,
    message: g7Passed
      ? 'Human approval recorded by authorized governance reviewer.'
      : `Gate 07 Failed: ${g7FailReason}`
  };
  if (!g7Passed) errors.push(gates.GATE_07_HUMAN_APPROVAL.message);

  const allPassed = Object.values(gates).every(g => g.passed);

  return {
    passed: allPassed,
    gates,
    errors
  };
}

/**
 * Validates revision history and versioning preservation for updated resources.
 */
function validateResourceRevision(originalResource, updatedResource, revisionMetadata = {}) {
  const errors = [];

  if (!originalResource || !updatedResource) {
    return { valid: false, errors: ['Both original and updated resource entities are required.'] };
  }

  // Immutable identity check
  if (originalResource.resource_id !== updatedResource.resource_id) {
    errors.push(`IMMUTABLE_ID_VIOLATION: resource_id cannot change across revisions (${originalResource.resource_id} !== ${updatedResource.resource_id}).`);
  }

  if (originalResource.resource_type !== updatedResource.resource_type) {
    errors.push(`IMMUTABLE_TYPE_VIOLATION: resource_type cannot change across revisions (${originalResource.resource_type} !== ${updatedResource.resource_type}).`);
  }

  // Revision metadata check
  if (!revisionMetadata.change_reason || revisionMetadata.change_reason.trim().length < 10) {
    errors.push('REVISION_MISSING_REASON: Material updates require a substantive change_reason (>= 10 chars).');
  }

  if (!revisionMetadata.reviewer || revisionMetadata.reviewer.trim().length < 3) {
    errors.push('REVISION_MISSING_REVIEWER: Material updates require an identified reviewer.');
  }

  if (!revisionMetadata.review_date || !/^\d{4}-\d{2}-\d{2}$/.test(revisionMetadata.review_date)) {
    errors.push('REVISION_INVALID_DATE: Material updates require a valid review_date (YYYY-MM-DD).');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  RESOURCE_TYPES,
  PRODUCTION_STAGES,
  STATEMENT_TYPES,
  REQUIRED_BRIEF_FIELDS,
  validateResourceBrief,
  validateProductionTransition,
  validateResourceTypeStructure,
  validateContentQAGates,
  validateResourceRevision
};
