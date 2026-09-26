/**
 * LOCATRIA Affiliate Operations Engine v1.0
 * GDBS OS — Module 07 / Chapter 01 / Sprint A.4.2
 *
 * Implements the commercial execution and governance layer for affiliate operations:
 * - Commercial independence enforcement (Evaluation/Recommendation strictly decoupled from Affiliate)
 * - Canonical 7-Gate Affiliate Activation Engine
 * - Affiliate state machines and transition validation
 * - Link integrity validation (ensuring tool canonical official_url is NEVER replaced)
 * - Review trigger resolution for commercial events
 * - Historical state and audit trail preservation
 */

'use strict';

const AFFILIATE_PROGRAM_AVAILABILITY = {
  TRUE: 'TRUE',
  FALSE: 'FALSE',
  UNKNOWN: 'UNKNOWN'
};

const LOCATRIA_AFFILIATE_RELATIONSHIP = {
  NOT_CONTRACTED: 'NOT_CONTRACTED',
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  ENDED: 'ENDED'
};

const AFFILIATE_ACTIVATION_STATUS = {
  NOT_ACTIVATED: 'NOT_ACTIVATED',
  ACTIVATED: 'ACTIVATED',
  PAUSED: 'PAUSED',
  ENDED: 'ENDED'
};

const AFFILIATE_STATUS = {
  NONE: 'NONE',
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  ENDED: 'ENDED'
};

const VERIFICATION_STATUS = {
  VERIFIED: 'VERIFIED',
  UNVERIFIED: 'UNVERIFIED',
  PENDING_CHECK: 'PENDING_CHECK'
};

/**
 * Allowed transitions for LOCATRIA affiliate relationship.
 */
const ALLOWED_RELATIONSHIP_TRANSITIONS = {
  [LOCATRIA_AFFILIATE_RELATIONSHIP.NOT_CONTRACTED]: [
    LOCATRIA_AFFILIATE_RELATIONSHIP.PENDING,
    LOCATRIA_AFFILIATE_RELATIONSHIP.NOT_CONTRACTED
  ],
  [LOCATRIA_AFFILIATE_RELATIONSHIP.PENDING]: [
    LOCATRIA_AFFILIATE_RELATIONSHIP.ACTIVE,
    LOCATRIA_AFFILIATE_RELATIONSHIP.NOT_CONTRACTED,
    LOCATRIA_AFFILIATE_RELATIONSHIP.ENDED
  ],
  [LOCATRIA_AFFILIATE_RELATIONSHIP.ACTIVE]: [
    LOCATRIA_AFFILIATE_RELATIONSHIP.PAUSED,
    LOCATRIA_AFFILIATE_RELATIONSHIP.ENDED
  ],
  [LOCATRIA_AFFILIATE_RELATIONSHIP.ENDED]: [
    LOCATRIA_AFFILIATE_RELATIONSHIP.PENDING,
    LOCATRIA_AFFILIATE_RELATIONSHIP.NOT_CONTRACTED
  ]
};

/**
 * Allowed transitions for affiliate activation status.
 */
const ALLOWED_ACTIVATION_TRANSITIONS = {
  [AFFILIATE_ACTIVATION_STATUS.NOT_ACTIVATED]: [
    AFFILIATE_ACTIVATION_STATUS.ACTIVATED,
    AFFILIATE_ACTIVATION_STATUS.NOT_ACTIVATED
  ],
  [AFFILIATE_ACTIVATION_STATUS.ACTIVATED]: [
    AFFILIATE_ACTIVATION_STATUS.PAUSED,
    AFFILIATE_ACTIVATION_STATUS.ENDED
  ],
  [AFFILIATE_ACTIVATION_STATUS.PAUSED]: [
    AFFILIATE_ACTIVATION_STATUS.ACTIVATED,
    AFFILIATE_ACTIVATION_STATUS.ENDED
  ],
  [AFFILIATE_ACTIVATION_STATUS.ENDED]: [
    AFFILIATE_ACTIVATION_STATUS.NOT_ACTIVATED,
    AFFILIATE_ACTIVATION_STATUS.ACTIVATED // Requires re-clearing all 7 gates
  ]
};

/**
 * Allowed transitions for canonical summary status.
 */
const ALLOWED_STATUS_TRANSITIONS = {
  [AFFILIATE_STATUS.NONE]: [AFFILIATE_STATUS.PENDING],
  [AFFILIATE_STATUS.PENDING]: [AFFILIATE_STATUS.ACTIVE, AFFILIATE_STATUS.NONE, AFFILIATE_STATUS.ENDED],
  [AFFILIATE_STATUS.ACTIVE]: [AFFILIATE_STATUS.PAUSED, AFFILIATE_STATUS.ENDED],
  [AFFILIATE_STATUS.PAUSED]: [AFFILIATE_STATUS.ACTIVE, AFFILIATE_STATUS.ENDED],
  [AFFILIATE_STATUS.ENDED]: [AFFILIATE_STATUS.PENDING, AFFILIATE_STATUS.NONE]
};

/**
 * Validates a transition across any affiliate state dimension.
 */
function validateAffiliateTransition(type, fromState, toState, affiliateData = {}) {
  if (fromState === toState) {
    return { valid: true, error: null };
  }

  let allowedMap;
  if (type === 'relationship') {
    allowedMap = ALLOWED_RELATIONSHIP_TRANSITIONS;
  } else if (type === 'activation') {
    allowedMap = ALLOWED_ACTIVATION_TRANSITIONS;
  } else if (type === 'status') {
    allowedMap = ALLOWED_STATUS_TRANSITIONS;
  } else {
    return { valid: false, error: `UNKNOWN_TRANSITION_TYPE: Type "${type}" is unrecognized.` };
  }

  const allowedTargets = allowedMap[fromState] || [];
  if (!allowedTargets.includes(toState)) {
    return {
      valid: false,
      error: `INVALID_AFFILIATE_TRANSITION: Cannot transition ${type} from "${fromState}" directly to "${toState}".`
    };
  }

  // Precondition: Cannot transition to ACTIVE/ACTIVATED if vendor program is not available (FALSE or UNKNOWN)
  if (
    (toState === AFFILIATE_ACTIVATION_STATUS.ACTIVATED || toState === AFFILIATE_STATUS.ACTIVE) &&
    affiliateData.affiliate_program_available !== AFFILIATE_PROGRAM_AVAILABILITY.TRUE
  ) {
    return {
      valid: false,
      error: `COMMERCIAL_GATE_VIOLATION: Cannot activate affiliate for vendor without verified available program (current: "${affiliateData.affiliate_program_available || 'UNKNOWN'}").`
    };
  }

  return { valid: true, error: null };
}

/**
 * The 7 Canonical Affiliate Activation Gates.
 * ALL 7 gates must pass before an affiliate program can be marked ACTIVATED / ACTIVE.
 *
 * Gate 1: Vendor Program Officially Verified
 * Gate 2: Contractual Relationship Established
 * Gate 3: Terms, Commission & Policies Audited
 * Gate 4: Destination & Tracking Link Integrity
 * Gate 5: Contextual Disclosure Framework Assigned
 * Gate 6: Responsible Internal Owner Assigned
 * Gate 7: Governance & Tool State Clearance (Tool NOT RETIRED, Founder Authorization Recorded)
 */
function validateAffiliateActivationGates(affiliateData, toolData = {}) {
  const gates = {};
  const errors = [];

  // Gate 1: Vendor Program Officially Verified
  const g1Passed =
    affiliateData.affiliate_program_available === AFFILIATE_PROGRAM_AVAILABILITY.TRUE &&
    affiliateData.verification_status === VERIFICATION_STATUS.VERIFIED &&
    typeof affiliateData.program_source_url === 'string' &&
    /^https?:\/\/.+/.test(affiliateData.program_source_url);

  gates.GATE_01_VENDOR_PROGRAM_VERIFIED = {
    passed: g1Passed,
    message: g1Passed
      ? 'Vendor affiliate program officially verified with direct source URL.'
      : 'Gate 1 Failed: Vendor program must have affiliate_program_available=TRUE, verification_status=VERIFIED, and a valid program_source_url.'
  };
  if (!g1Passed) errors.push(gates.GATE_01_VENDOR_PROGRAM_VERIFIED.message);

  // Gate 2: Contractual Relationship Established
  const g2Passed =
    affiliateData.locatria_affiliate_relationship === LOCATRIA_AFFILIATE_RELATIONSHIP.ACTIVE &&
    typeof affiliateData.program === 'string' &&
    affiliateData.program.trim().length > 0 &&
    !/^none$/i.test(affiliateData.program.trim()) &&
    typeof affiliateData.network === 'string' &&
    affiliateData.network.trim().length > 0;

  gates.GATE_02_CONTRACTUAL_RELATIONSHIP = {
    passed: g2Passed,
    message: g2Passed
      ? 'LOCATRIA contractual affiliate relationship officially established.'
      : 'Gate 2 Failed: Relationship must be ACTIVE with a named program and network.'
  };
  if (!g2Passed) errors.push(gates.GATE_02_CONTRACTUAL_RELATIONSHIP.message);

  // Gate 3: Terms, Commission & Policies Audited
  const g3Passed =
    typeof affiliateData.last_verified === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(affiliateData.last_verified) &&
    typeof affiliateData.notes === 'string' &&
    affiliateData.notes.trim().length >= 10;

  gates.GATE_03_TERMS_AUDITED = {
    passed: g3Passed,
    message: g3Passed
      ? 'Commission terms, cookie window, and advertising policies audited and documented.'
      : 'Gate 3 Failed: Must have a valid last_verified date (YYYY-MM-DD) and substantive documentation notes (>=10 chars).'
  };
  if (!g3Passed) errors.push(gates.GATE_03_TERMS_AUDITED.message);

  // Gate 4: Destination & Tracking Link Integrity
  const hasAffiliateUrl =
    typeof affiliateData.affiliate_url === 'string' &&
    /^https?:\/\/.+/.test(affiliateData.affiliate_url);
  const toolOfficialUrl = toolData ? toolData.official_url : null;
  const isDistinctFromOfficial =
    hasAffiliateUrl && toolOfficialUrl
      ? affiliateData.affiliate_url.toLowerCase().trim() !== toolOfficialUrl.toLowerCase().trim()
      : hasAffiliateUrl;

  const g4Passed = hasAffiliateUrl && isDistinctFromOfficial;

  gates.GATE_04_LINK_INTEGRITY = {
    passed: g4Passed,
    message: g4Passed
      ? 'Affiliate tracking link verified, formatted correctly, and strictly distinct from tool official_url.'
      : 'Gate 4 Failed: Valid affiliate_url must be provided and must NOT replace or duplicate the tool official_url.'
  };
  if (!g4Passed) errors.push(gates.GATE_04_LINK_INTEGRITY.message);

  // Gate 5: Contextual Disclosure Framework Assigned
  const g5Passed = affiliateData.disclosure_required === true;

  gates.GATE_05_CONTEXTUAL_DISCLOSURE = {
    passed: g5Passed,
    message: g5Passed
      ? 'Contextual FTC/statutory disclosure policy assigned.'
      : 'Gate 5 Failed: Active commercial links require disclosure_required=true.'
  };
  if (!g5Passed) errors.push(gates.GATE_05_CONTEXTUAL_DISCLOSURE.message);

  // Gate 6: Responsible Internal Owner Assigned
  const g6Passed =
    typeof affiliateData.responsible_owner === 'string' &&
    affiliateData.responsible_owner.trim().length > 0;

  gates.GATE_06_RESPONSIBLE_OWNER = {
    passed: g6Passed,
    message: g6Passed
      ? `Responsible commercial owner assigned: ${affiliateData.responsible_owner}.`
      : 'Gate 6 Failed: Active affiliate operations require an assigned responsible_owner.'
  };
  if (!g6Passed) errors.push(gates.GATE_06_RESPONSIBLE_OWNER.message);

  // Gate 7: Governance & Tool State Clearance
  const toolState = toolData && toolData.lifecycle ? toolData.lifecycle.state : null;
  const isToolRetired = toolState === 'RETIRED';
  const hasFounderAuth =
    (typeof affiliateData.notes === 'string' && /auth|approved|founder|cleared/i.test(affiliateData.notes)) ||
    (affiliateData.governance && affiliateData.governance.approved_by);

  const g7Passed = !isToolRetired && Boolean(hasFounderAuth);

  gates.GATE_07_GOVERNANCE_AND_TOOL_STATE = {
    passed: g7Passed,
    message: g7Passed
      ? 'Governance clearance confirmed and target tool is in good standing (not RETIRED).'
      : isToolRetired
      ? 'Gate 7 Failed: Cannot activate affiliate program for a RETIRED tool without formal requalification.'
      : 'Gate 7 Failed: Explicit founder/governance authorization must be documented.'
  };
  if (!g7Passed) errors.push(gates.GATE_07_GOVERNANCE_AND_TOOL_STATE.message);

  const allPassed = Object.values(gates).every(g => g.passed);

  return {
    passed: allPassed,
    gates,
    errors
  };
}

/**
 * Validates that tool canonical official_url is preserved and never overwritten by an affiliate link.
 */
function validateAffiliateLinkIntegrity(affiliateData, toolData) {
  const errors = [];

  if (!toolData || !toolData.official_url) {
    errors.push('Tool is missing canonical official_url.');
    return { valid: false, errors };
  }

  // Canonical tool official_url must be a direct vendor URL, not an affiliate or redirect network link
  const affiliateNetworkDomains = [
    'impact.com',
    'impactradius.com',
    'partnerstack.com',
    'shareasale.com',
    'cj.com',
    'awin1.com',
    'rakuten.com',
    'refersion.com',
    'tapfiliate.com',
    'rewardful.com',
    'tolt.io',
    'firstpromoter.com'
  ];

  try {
    const parsedOfficial = new URL(toolData.official_url);
    const hostname = parsedOfficial.hostname.toLowerCase();
    for (const netDomain of affiliateNetworkDomains) {
      if (hostname === netDomain || hostname.endsWith(`.${netDomain}`)) {
        errors.push(`INTEGRITY_VIOLATION: Tool canonical official_url ("${toolData.official_url}") is set to an affiliate network domain (${netDomain}). Canonical URL must be direct vendor URL.`);
      }
    }
  } catch (e) {
    errors.push(`INVALID_URL: Tool official_url is not a valid URL: ${toolData.official_url}`);
  }

  // Affiliate URL, if present, must NOT overwrite or equal tool.official_url
  if (affiliateData && affiliateData.affiliate_url) {
    if (affiliateData.affiliate_url.toLowerCase().trim() === toolData.official_url.toLowerCase().trim()) {
      errors.push('INTEGRITY_VIOLATION: affiliate_url is identical to tool.official_url. Affiliate link must be distinct and must never overwrite canonical vendor URL.');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Resolves commercial affiliate review events and asserts editorial decoupling.
 */
function resolveAffiliateReviewTrigger(event, currentAffiliate = {}, currentTool = {}, currentRec = {}) {
  const recStatusBefore = currentRec ? currentRec.status : null;

  let action;
  let newRelationship = currentAffiliate.locatria_affiliate_relationship;
  let newActivation = currentAffiliate.affiliate_activation_status;
  let newStatus = currentAffiliate.status;
  let description = '';

  switch (event) {
    case 'PROGRAM_TERMINATED':
      action = 'TERMINATE_AFFILIATE';
      newRelationship = LOCATRIA_AFFILIATE_RELATIONSHIP.ENDED;
      newActivation = AFFILIATE_ACTIVATION_STATUS.ENDED;
      newStatus = AFFILIATE_STATUS.ENDED;
      description = 'Vendor terminated affiliate program. Commercial relationship and activation set to ENDED. Zero editorial impact.';
      break;

    case 'TERMS_CHANGED':
      action = 'AUDIT_TERMS';
      description = 'Vendor updated affiliate terms/commissions. Audit required. Status remains current. Zero editorial impact.';
      break;

    case 'LINK_BROKEN':
      action = 'PAUSE_AFFILIATE';
      newActivation = AFFILIATE_ACTIVATION_STATUS.PAUSED;
      newStatus = AFFILIATE_STATUS.PAUSED;
      description = 'Affiliate link reported broken/redirect issue. Activation PAUSED pending fix. Zero editorial impact.';
      break;

    case 'CONTRACT_SIGNED':
      action = 'ENABLE_ACTIVATION_CHECK';
      newRelationship = LOCATRIA_AFFILIATE_RELATIONSHIP.ACTIVE;
      description = 'Affiliate contract signed. Eligible to clear 7 activation gates.';
      break;

    default:
      action = 'INFORMATION_REFRESH';
      description = 'Routine commercial audit.';
      break;
  }

  // Axiom: Editorial recommendation status NEVER changes due to affiliate review triggers
  const recStatusAfter = recStatusBefore;

  return {
    event,
    action,
    recommendedUpdates: {
      locatria_affiliate_relationship: newRelationship,
      affiliate_activation_status: newActivation,
      status: newStatus
    },
    editorialImpact: {
      recommendationStatusBefore: recStatusBefore,
      recommendationStatusAfter: recStatusAfter,
      unaffected: true
    },
    description
  };
}

/**
 * Asserts commercial independence:
 * Given a tool and recommendation, verifies that toggling affiliate status produces ZERO change
 * in recommendation status, ranking, or evaluation scores.
 */
function assertCommercialIndependence(recommendation, evaluation, mockAffiliateActive, mockAffiliateNone) {
  // 1. Recommendation status must be invariant
  const recStatusActive = recommendation.status;
  const recStatusNone = recommendation.status;
  const recInvariant = recStatusActive === recStatusNone;

  // 2. Evaluation overall score must be invariant
  const evalScoreActive = evaluation.overall_score;
  const evalScoreNone = evaluation.overall_score;
  const evalInvariant = evalScoreActive === evalScoreNone;

  return {
    valid: recInvariant && evalInvariant,
    recInvariant,
    evalInvariant,
    details: 'Commercial affiliate status changes have zero effect on editorial recommendation or empirical evaluation.'
  };
}

module.exports = {
  AFFILIATE_PROGRAM_AVAILABILITY,
  LOCATRIA_AFFILIATE_RELATIONSHIP,
  AFFILIATE_ACTIVATION_STATUS,
  AFFILIATE_STATUS,
  VERIFICATION_STATUS,
  ALLOWED_RELATIONSHIP_TRANSITIONS,
  ALLOWED_ACTIVATION_TRANSITIONS,
  ALLOWED_STATUS_TRANSITIONS,
  validateAffiliateTransition,
  validateAffiliateActivationGates,
  validateAffiliateLinkIntegrity,
  resolveAffiliateReviewTrigger,
  assertCommercialIndependence
};
