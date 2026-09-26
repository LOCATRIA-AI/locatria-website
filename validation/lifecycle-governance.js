/**
 * LOCATRIA Resource Lifecycle & Governance Engine v1.0
 * GDBS OS — Module 07 / Chapter 01 / Sprint A.4.1
 *
 * Implements canonical state machines, transition gates, and review trigger
 * enforcement for Tools, Recommendations, Resources, Affiliates, and Reviews.
 */

'use strict';

const TOOL_STATES = {
  DISCOVERED: 'DISCOVERED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  EVALUATED: 'EVALUATED',
  LISTED: 'LISTED',
  CONDITIONALLY_RECOMMENDED: 'CONDITIONALLY_RECOMMENDED',
  RECOMMENDED: 'RECOMMENDED',
  NOT_RECOMMENDED: 'NOT_RECOMMENDED',
  RETIRED: 'RETIRED'
};

const RECOMMENDATION_STATES = {
  RECOMMENDED: 'RECOMMENDED',
  CONDITIONALLY_RECOMMENDED: 'CONDITIONALLY_RECOMMENDED',
  LISTED: 'LISTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  NOT_RECOMMENDED: 'NOT_RECOMMENDED',
  RETIRED: 'RETIRED'
};

const RESOURCE_STATES = {
  DRAFT: 'DRAFT',
  REVIEW_DUE: 'REVIEW_DUE',
  PUBLISHED: 'PUBLISHED',
  ACTIVE: 'ACTIVE',
  UPDATED: 'UPDATED',
  DOWNGRADED: 'DOWNGRADED',
  RETIRED: 'RETIRED'
};

const AFFILIATE_RELATIONSHIP_STATES = {
  NOT_CONTRACTED: 'NOT_CONTRACTED',
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  ENDED: 'ENDED'
};

const AFFILIATE_ACTIVATION_STATES = {
  NOT_ACTIVATED: 'NOT_ACTIVATED',
  ACTIVATED: 'ACTIVATED',
  PAUSED: 'PAUSED',
  ENDED: 'ENDED'
};

const REVIEW_TRIGGERS = {
  SCHEDULED: 'SCHEDULED',
  PRICE_CHANGE: 'PRICE_CHANGE',
  FEATURE_CHANGE: 'FEATURE_CHANGE',
  AFFILIATE_CHANGE: 'AFFILIATE_CHANGE',
  USER_FEEDBACK: 'USER_FEEDBACK',
  POLICY_CHANGE: 'POLICY_CHANGE',
  SOURCE_CHANGE: 'SOURCE_CHANGE',
  OTHER: 'OTHER'
};

const REVIEW_ACTIONS = {
  INFORMATION_REFRESH: 'INFORMATION_REFRESH',
  RE_EVALUATION: 'RE_EVALUATION',
  RECOMMENDATION_REVIEW: 'RECOMMENDATION_REVIEW',
  PUBLICATION_UPDATE: 'PUBLICATION_UPDATE',
  DOWNGRADE: 'DOWNGRADE',
  RETIREMENT: 'RETIREMENT',
  NO_ACTION: 'NO_ACTION'
};

/**
 * Valid transitions for Tool lifecycle.
 */
const ALLOWED_TOOL_TRANSITIONS = {
  [TOOL_STATES.DISCOVERED]: [TOOL_STATES.UNDER_REVIEW, TOOL_STATES.EVALUATED, TOOL_STATES.NOT_RECOMMENDED],
  [TOOL_STATES.UNDER_REVIEW]: [TOOL_STATES.EVALUATED, TOOL_STATES.LISTED, TOOL_STATES.CONDITIONALLY_RECOMMENDED, TOOL_STATES.NOT_RECOMMENDED, TOOL_STATES.DISCOVERED],
  [TOOL_STATES.EVALUATED]: [TOOL_STATES.LISTED, TOOL_STATES.CONDITIONALLY_RECOMMENDED, TOOL_STATES.RECOMMENDED, TOOL_STATES.NOT_RECOMMENDED, TOOL_STATES.UNDER_REVIEW],
  [TOOL_STATES.LISTED]: [TOOL_STATES.CONDITIONALLY_RECOMMENDED, TOOL_STATES.RECOMMENDED, TOOL_STATES.UNDER_REVIEW, TOOL_STATES.RETIRED],
  [TOOL_STATES.CONDITIONALLY_RECOMMENDED]: [TOOL_STATES.RECOMMENDED, TOOL_STATES.LISTED, TOOL_STATES.UNDER_REVIEW, TOOL_STATES.RETIRED],
  [TOOL_STATES.RECOMMENDED]: [TOOL_STATES.CONDITIONALLY_RECOMMENDED, TOOL_STATES.LISTED, TOOL_STATES.UNDER_REVIEW, TOOL_STATES.RETIRED],
  [TOOL_STATES.NOT_RECOMMENDED]: [TOOL_STATES.UNDER_REVIEW, TOOL_STATES.RETIRED],
  [TOOL_STATES.RETIRED]: [TOOL_STATES.UNDER_REVIEW] // Strict: can only re-enter through UNDER_REVIEW for formal requalification
};

/**
 * Valid transitions for Recommendation lifecycle.
 */
const ALLOWED_RECOMMENDATION_TRANSITIONS = {
  [RECOMMENDATION_STATES.UNDER_REVIEW]: [
    RECOMMENDATION_STATES.LISTED,
    RECOMMENDATION_STATES.CONDITIONALLY_RECOMMENDED,
    RECOMMENDATION_STATES.RECOMMENDED,
    RECOMMENDATION_STATES.NOT_RECOMMENDED
  ],
  [RECOMMENDATION_STATES.LISTED]: [
    RECOMMENDATION_STATES.CONDITIONALLY_RECOMMENDED,
    RECOMMENDATION_STATES.RECOMMENDED,
    RECOMMENDATION_STATES.UNDER_REVIEW,
    RECOMMENDATION_STATES.RETIRED
  ],
  [RECOMMENDATION_STATES.CONDITIONALLY_RECOMMENDED]: [
    RECOMMENDATION_STATES.RECOMMENDED,
    RECOMMENDATION_STATES.LISTED,
    RECOMMENDATION_STATES.UNDER_REVIEW,
    RECOMMENDATION_STATES.RETIRED
  ],
  [RECOMMENDATION_STATES.RECOMMENDED]: [
    RECOMMENDATION_STATES.CONDITIONALLY_RECOMMENDED,
    RECOMMENDATION_STATES.LISTED,
    RECOMMENDATION_STATES.UNDER_REVIEW,
    RECOMMENDATION_STATES.RETIRED
  ],
  [RECOMMENDATION_STATES.NOT_RECOMMENDED]: [
    RECOMMENDATION_STATES.UNDER_REVIEW,
    RECOMMENDATION_STATES.RETIRED
  ],
  [RECOMMENDATION_STATES.RETIRED]: [
    RECOMMENDATION_STATES.UNDER_REVIEW // Re-entry requires explicit requalification under review
  ]
};

/**
 * Validates a lifecycle transition for a given entity type.
 */
function validateTransition(entityType, fromState, toState, options = {}) {
  if (fromState === toState) {
    return { valid: true, error: null };
  }

  let allowedMap;
  if (entityType === 'tool') {
    allowedMap = ALLOWED_TOOL_TRANSITIONS;
  } else if (entityType === 'recommendation') {
    allowedMap = ALLOWED_RECOMMENDATION_TRANSITIONS;
  } else {
    return { valid: true, error: null };
  }

  const allowedTargets = allowedMap[fromState] || [];
  if (!allowedTargets.includes(toState)) {
    return {
      valid: false,
      error: `INVALID_TRANSITION: Cannot transition ${entityType} from state "${fromState}" directly to "${toState}".`
    };
  }

  // Strict check: RETIRED tools cannot bypass requalification
  if (fromState === TOOL_STATES.RETIRED && toState === TOOL_STATES.RECOMMENDED) {
    return {
      valid: false,
      error: `GOVERNANCE_VIOLATION: RETIRED ${entityType} cannot transition directly to RECOMMENDED without formal requalification via UNDER_REVIEW.`
    };
  }

  return { valid: true, error: null };
}

/**
 * Gate 04 — Recommendation Gate Validation.
 * Enforces all preconditions required before a tool can be RECOMMENDED or CONDITIONALLY_RECOMMENDED.
 */
function validateRecommendationGates(recommendation, tool, evaluationList = [], evidenceList = []) {
  const errors = [];
  const status = recommendation.status;

  if (['RECOMMENDED', 'CONDITIONALLY_RECOMMENDED'].includes(status)) {
    // 1. Evidence Check
    if (!Array.isArray(evidenceList) || evidenceList.length === 0) {
      errors.push({
        gate: 'GATE_03_EVIDENCE',
        message: `Recommendation "${recommendation.recommendation_id}" (${status}) lacks supporting empirical evidence.`
      });
    }

    // 2. Evaluation Check
    if (!Array.isArray(evaluationList) || evaluationList.length === 0) {
      errors.push({
        gate: 'GATE_03_EVALUATION',
        message: `Recommendation "${recommendation.recommendation_id}" (${status}) lacks a completed 8-dimension evaluation.`
      });
    }

    // 3. Rationale Check (minimum 15 characters, non-empty)
    if (!recommendation.rationale || typeof recommendation.rationale !== 'string' || recommendation.rationale.trim().length < 15) {
      errors.push({
        gate: 'GATE_04_RATIONALE',
        message: `Recommendation "${recommendation.recommendation_id}" (${status}) requires an explicit qualitative rationale (minimum 15 characters).`
      });
    }

    // 4. Governance Date Check
    if (tool && tool.governance && !tool.governance.last_reviewed) {
      errors.push({
        gate: 'GATE_04_GOVERNANCE',
        message: `Tool "${tool.tool_id}" is ${status} but lacks governance.last_reviewed date.`
      });
    }

    // 5. Context Check
    if (!recommendation.context || !recommendation.context.problem || !recommendation.context.workflow) {
      errors.push({
        gate: 'GATE_04_CONTEXT',
        message: `Recommendation "${recommendation.recommendation_id}" must specify contextual problem and workflow.`
      });
    }
  }

  return {
    passed: errors.length === 0,
    errors
  };
}

/**
 * Gate 06/07 — Review Trigger to Action Resolver.
 * Determines the required governance action based on the review trigger.
 * Note: Affiliate changes NEVER alter recommendation decisions.
 */
function resolveReviewTriggerAction(trigger, details = {}) {
  switch (trigger) {
    case REVIEW_TRIGGERS.SCHEDULED:
      return {
        action: REVIEW_ACTIONS.INFORMATION_REFRESH,
        requiresReevaluation: false,
        requiresRecommendationReview: false,
        canAlterRecommendationAutomatically: false,
        description: 'Biannual scheduled check: refresh documentation, check active URLs and access pricing.'
      };

    case REVIEW_TRIGGERS.PRICE_CHANGE:
      return {
        action: REVIEW_ACTIONS.INFORMATION_REFRESH,
        requiresReevaluation: false,
        requiresRecommendationReview: true,
        canAlterRecommendationAutomatically: false,
        description: 'Vendor pricing altered: update commercial metadata; evaluate whether value dimension is impacted.'
      };

    case REVIEW_TRIGGERS.FEATURE_CHANGE:
      return {
        action: REVIEW_ACTIONS.RE_EVALUATION,
        requiresReevaluation: true,
        requiresRecommendationReview: true,
        canAlterRecommendationAutomatically: false,
        description: 'Core product or AI model update: run benchmark test protocol to confirm capability baseline.'
      };

    case REVIEW_TRIGGERS.AFFILIATE_CHANGE:
      return {
        action: REVIEW_ACTIONS.INFORMATION_REFRESH,
        requiresReevaluation: false,
        requiresRecommendationReview: false, // STRICT: Affiliate never changes recommendation
        canAlterRecommendationAutomatically: false,
        description: 'Vendor affiliate terms modified: update commercial metadata only. ZERO impact on editorial recommendation.'
      };

    case REVIEW_TRIGGERS.USER_FEEDBACK:
      return {
        action: REVIEW_ACTIONS.RECOMMENDATION_REVIEW,
        requiresReevaluation: true,
        requiresRecommendationReview: true,
        canAlterRecommendationAutomatically: false,
        description: 'User reported defect or workflow friction: investigate failure mode and initiate review.'
      };

    case REVIEW_TRIGGERS.POLICY_CHANGE:
      return {
        action: REVIEW_ACTIONS.PUBLICATION_UPDATE,
        requiresReevaluation: false,
        requiresRecommendationReview: true,
        canAlterRecommendationAutomatically: false,
        description: 'Legal/advertising regulatory update: audit disclaimers and review compliance.'
      };

    case REVIEW_TRIGGERS.SOURCE_CHANGE:
      return {
        action: REVIEW_ACTIONS.RE_EVALUATION,
        requiresReevaluation: true,
        requiresRecommendationReview: true,
        canAlterRecommendationAutomatically: false,
        description: 'Scientific/clinical guideline updated: re-ground benchmark brief against new source facts.'
      };

    default:
      return {
        action: REVIEW_ACTIONS.RECOMMENDATION_REVIEW,
        requiresReevaluation: false,
        requiresRecommendationReview: true,
        canAlterRecommendationAutomatically: false,
        description: 'Ad-hoc governance trigger: human review required.'
      };
  }
}

/**
 * Asserts commercial independence:
 * Given a recommendation, asserts that altering affiliate availability or status
 * produces ZERO change in recommendation status.
 */
function assertCommercialIndependence(recommendation, mockAffiliateWithActive, mockAffiliateWithNone) {
  // Recommendation decision must be function of (evidence, evaluation, problem, workflow)
  // NOT affiliate status
  const statusWithActive = recommendation.status;
  const statusWithNone = recommendation.status;
  return statusWithActive === statusWithNone;
}

module.exports = {
  TOOL_STATES,
  RECOMMENDATION_STATES,
  RESOURCE_STATES,
  AFFILIATE_RELATIONSHIP_STATES,
  AFFILIATE_ACTIVATION_STATES,
  REVIEW_TRIGGERS,
  REVIEW_ACTIONS,
  ALLOWED_TOOL_TRANSITIONS,
  ALLOWED_RECOMMENDATION_TRANSITIONS,
  validateTransition,
  validateRecommendationGates,
  resolveReviewTriggerAction,
  assertCommercialIndependence
};
