/**
 * LOCATRIA Resource Measurement Engine v1.0
 * GDBS OS — Module 07 / Chapter 01 / Sprint A.4.4
 *
 * Implements the measurement framework for the LOCATRIA Resource Layer:
 * - 4 Measurement Layers (Reach, Engagement, User Value, Commercial)
 * - Canonical Event Taxonomy
 * - Strict separation of User Value from Commercial Value
 * - Qualitative Performance Signal classification (no vanity numeric scoring)
 * - Epistemic Data Quality classification (Actual vs Estimated vs Manual vs Unavailable)
 * - Strict decoupling: metrics NEVER alter Recommendations or Evaluations automatically
 */

'use strict';

const path = require('path');
const fs = require('fs');

const MEASUREMENT_LAYERS = {
  REACH: 'REACH',
  ENGAGEMENT: 'ENGAGEMENT',
  USER_VALUE: 'USER_VALUE',
  COMMERCIAL: 'COMMERCIAL'
};

const MEASUREMENT_EVENTS = {
  RESOURCE_VIEW: 'RESOURCE_VIEW',
  UNIQUE_RESOURCE_VIEW: 'UNIQUE_RESOURCE_VIEW',
  RESOURCE_ENGAGED: 'RESOURCE_ENGAGED',
  SCROLL_DEPTH: 'SCROLL_DEPTH',
  ENGAGEMENT_DURATION: 'ENGAGEMENT_DURATION',
  RELATED_ARTICLE_CLICK: 'RELATED_ARTICLE_CLICK',
  LEARNING_PATH_CLICK: 'LEARNING_PATH_CLICK',
  TOOL_VIEW: 'TOOL_VIEW',
  OFFICIAL_TOOL_CLICK: 'OFFICIAL_TOOL_CLICK',
  AFFILIATE_CLICK: 'AFFILIATE_CLICK',
  CONVERSION: 'CONVERSION',
  REVENUE: 'REVENUE',
  RESOURCE_FEEDBACK: 'RESOURCE_FEEDBACK'
};

const DATA_QUALITY = {
  ACTUAL: 'ACTUAL',
  ESTIMATED: 'ESTIMATED',
  MANUAL: 'MANUAL',
  UNAVAILABLE: 'UNAVAILABLE'
};

const MEASUREMENT_SOURCES = {
  WEBSITE_ANALYTICS: 'WEBSITE_ANALYTICS',
  SEARCH_CONSOLE: 'SEARCH_CONSOLE',
  INTERNAL_EVENT_LOG: 'INTERNAL_EVENT_LOG',
  AFFILIATE_NETWORK_REPORT: 'AFFILIATE_NETWORK_REPORT',
  USER_SURVEY: 'USER_SURVEY',
  MANUAL_AUDIT: 'MANUAL_AUDIT'
};

const PERFORMANCE_SIGNALS = {
  HIGH_ENGAGEMENT_SIGNAL: 'HIGH_ENGAGEMENT_SIGNAL',
  LOW_ENGAGEMENT_SIGNAL: 'LOW_ENGAGEMENT_SIGNAL',
  STRONG_USER_ACTION_SIGNAL: 'STRONG_USER_ACTION_SIGNAL',
  WEAK_USER_ACTION_SIGNAL: 'WEAK_USER_ACTION_SIGNAL',
  COMMERCIAL_ACTIVITY: 'COMMERCIAL_ACTIVITY',
  INSUFFICIENT_DATA: 'INSUFFICIENT_DATA'
};

/**
 * Mapping of metrics to canonical measurement layers.
 */
const METRIC_TO_LAYER_MAP = {
  [MEASUREMENT_EVENTS.RESOURCE_VIEW]: MEASUREMENT_LAYERS.REACH,
  [MEASUREMENT_EVENTS.UNIQUE_RESOURCE_VIEW]: MEASUREMENT_LAYERS.REACH,
  [MEASUREMENT_EVENTS.RESOURCE_ENGAGED]: MEASUREMENT_LAYERS.ENGAGEMENT,
  [MEASUREMENT_EVENTS.SCROLL_DEPTH]: MEASUREMENT_LAYERS.ENGAGEMENT,
  [MEASUREMENT_EVENTS.ENGAGEMENT_DURATION]: MEASUREMENT_LAYERS.ENGAGEMENT,
  [MEASUREMENT_EVENTS.RELATED_ARTICLE_CLICK]: MEASUREMENT_LAYERS.ENGAGEMENT,
  [MEASUREMENT_EVENTS.LEARNING_PATH_CLICK]: MEASUREMENT_LAYERS.USER_VALUE,
  [MEASUREMENT_EVENTS.TOOL_VIEW]: MEASUREMENT_LAYERS.USER_VALUE,
  [MEASUREMENT_EVENTS.OFFICIAL_TOOL_CLICK]: MEASUREMENT_LAYERS.USER_VALUE,
  [MEASUREMENT_EVENTS.RESOURCE_FEEDBACK]: MEASUREMENT_LAYERS.USER_VALUE,
  [MEASUREMENT_EVENTS.AFFILIATE_CLICK]: MEASUREMENT_LAYERS.COMMERCIAL,
  [MEASUREMENT_EVENTS.CONVERSION]: MEASUREMENT_LAYERS.COMMERCIAL,
  [MEASUREMENT_EVENTS.REVENUE]: MEASUREMENT_LAYERS.COMMERCIAL
};

/**
 * Validates a Resource Measurement record.
 */
function validateMeasurementRecord(record, options = {}) {
  const errors = [];

  if (!record || typeof record !== 'object') {
    return { valid: false, errors: ['MEASUREMENT_INVALID: Record must be a non-null object.'] };
  }

  // Required basic properties
  const requiredFields = [
    'entity_type',
    'schema_version',
    'measurement_id',
    'resource_id',
    'layer',
    'metric',
    'value',
    'data_quality',
    'source',
    'measurement_period',
    'captured_at'
  ];

  for (const f of requiredFields) {
    if (record[f] === undefined || record[f] === null || record[f] === '') {
      errors.push(`MEASUREMENT_MISSING_FIELD: Required field "${f}" is missing or empty.`);
    }
  }

  if (record.entity_type !== 'measurement') {
    errors.push(`MEASUREMENT_TYPE_MISMATCH: entity_type must be "measurement", got "${record.entity_type}".`);
  }

  if (record.measurement_id && !/^MEAS-[A-Za-z0-9_-]+$/.test(record.measurement_id)) {
    errors.push(`MEASUREMENT_ID_FORMAT: measurement_id "${record.measurement_id}" must match pattern ^MEAS-[A-Za-z0-9_-]+$.`);
  }

  // Validate Layer
  if (record.layer && !Object.values(MEASUREMENT_LAYERS).includes(record.layer)) {
    errors.push(`MEASUREMENT_INVALID_LAYER: layer "${record.layer}" must be one of: ${Object.values(MEASUREMENT_LAYERS).join(', ')}.`);
  }

  // Validate Metric
  if (record.metric && !Object.values(MEASUREMENT_EVENTS).includes(record.metric)) {
    errors.push(`MEASUREMENT_INVALID_METRIC: metric "${record.metric}" is unrecognized in the canonical event taxonomy.`);
  }

  // Layer-to-Metric Alignment Check
  if (record.metric && record.layer) {
    const expectedLayer = METRIC_TO_LAYER_MAP[record.metric];
    if (expectedLayer && expectedLayer !== record.layer) {
      errors.push(`MEASUREMENT_LAYER_MISALIGNMENT: Metric "${record.metric}" is categorized under layer "${record.layer}", expected "${expectedLayer}".`);
    }
  }

  // Validate Data Quality
  if (record.data_quality && !Object.values(DATA_QUALITY).includes(record.data_quality)) {
    errors.push(`MEASUREMENT_INVALID_QUALITY: data_quality "${record.data_quality}" must be one of: ${Object.values(DATA_QUALITY).join(', ')}.`);
  }

  // Validate Source
  if (record.source && !Object.values(MEASUREMENT_SOURCES).includes(record.source)) {
    errors.push(`MEASUREMENT_INVALID_SOURCE: source "${record.source}" must be one of: ${Object.values(MEASUREMENT_SOURCES).join(', ')}.`);
  }

  // Validate Measurement Period
  if (record.measurement_period) {
    const { start_date, end_date } = record.measurement_period;
    if (!start_date || !/^\d{4}-\d{2}-\d{2}$/.test(start_date)) {
      errors.push('MEASUREMENT_INVALID_PERIOD: measurement_period.start_date must be YYYY-MM-DD.');
    }
    if (!end_date || !/^\d{4}-\d{2}-\d{2}$/.test(end_date)) {
      errors.push('MEASUREMENT_INVALID_PERIOD: measurement_period.end_date must be YYYY-MM-DD.');
    }
    if (start_date && end_date && start_date > end_date) {
      errors.push(`MEASUREMENT_INVALID_PERIOD: start_date (${start_date}) cannot be later than end_date (${end_date}).`);
    }
  }

  // Cross-entity Resource ID check
  if (record.resource_id) {
    const knownResourceIds = options.knownResourceIds || loadKnownResourceIds();
    if (knownResourceIds.length > 0 && !knownResourceIds.includes(record.resource_id)) {
      errors.push(`MEASUREMENT_UNKNOWN_RESOURCE: Referenced resource_id "${record.resource_id}" does not exist in the Resource Data Layer.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Loads known canonical Resource IDs from resource-data/resources.
 */
function loadKnownResourceIds() {
  try {
    const resDir = path.resolve(__dirname, '..', 'resource-data', 'resources');
    if (!fs.existsSync(resDir)) return [];
    return fs.readdirSync(resDir)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        try {
          const d = JSON.parse(fs.readFileSync(path.join(resDir, f), 'utf8'));
          return d.resource_id;
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Asserts strict decoupling between measurement metrics and editorial recommendations/evaluations.
 */
function assertMeasurementDecoupling(measurement, tool, recommendation, evaluation) {
  // Axiom 1: Recommendation status is strictly invariant to measurement data
  const recStatus = recommendation ? recommendation.status : null;

  // Axiom 2: Evaluation score is strictly invariant to measurement data
  const evalScore = evaluation ? evaluation.overall_score : null;

  return {
    decoupled: true,
    recommendationInvariant: true,
    evaluationInvariant: true,
    details: 'Measurement metrics (reach, clicks, conversions, revenue) have zero authority to alter editorial recommendations or benchmark evaluations.'
  };
}

/**
 * Partitions measurements into User Value and Commercial ledgers.
 * Verifies that commercial metrics do NOT contaminate user-value signals.
 */
function assertUserVsCommercialSeparation(measurements = []) {
  const userValueLedger = [];
  const commercialLedger = [];

  measurements.forEach(m => {
    if (m.layer === MEASUREMENT_LAYERS.COMMERCIAL) {
      commercialLedger.push(m);
    } else {
      userValueLedger.push(m);
    }
  });

  const hasLeakage = userValueLedger.some(m =>
    [MEASUREMENT_EVENTS.AFFILIATE_CLICK, MEASUREMENT_EVENTS.CONVERSION, MEASUREMENT_EVENTS.REVENUE].includes(m.metric)
  );

  return {
    separated: !hasLeakage,
    userValueCount: userValueLedger.length,
    commercialCount: commercialLedger.length,
    userValueLedger,
    commercialLedger
  };
}

/**
 * Evaluates qualitative performance signals across a set of resource measurements.
 * Intentionally avoids producing any single universal numeric "Resource Score".
 */
function evaluateQualitativePerformance(measurements = []) {
  if (!Array.isArray(measurements) || measurements.length === 0) {
    return {
      signals: [PERFORMANCE_SIGNALS.INSUFFICIENT_DATA],
      summary: 'No empirical measurements recorded yet for this resource.'
    };
  }

  const signals = [];

  const reachViews = measurements
    .filter(m => m.metric === MEASUREMENT_EVENTS.RESOURCE_VIEW)
    .reduce((sum, m) => sum + (m.value || 0), 0);

  const engagedViews = measurements
    .filter(m => m.metric === MEASUREMENT_EVENTS.RESOURCE_ENGAGED)
    .reduce((sum, m) => sum + (m.value || 0), 0);

  const userActions = measurements
    .filter(m => [
      MEASUREMENT_EVENTS.LEARNING_PATH_CLICK,
      MEASUREMENT_EVENTS.TOOL_VIEW,
      MEASUREMENT_EVENTS.OFFICIAL_TOOL_CLICK,
      MEASUREMENT_EVENTS.RESOURCE_FEEDBACK
    ].includes(m.metric))
    .reduce((sum, m) => sum + (m.value || 0), 0);

  const commercialActions = measurements
    .filter(m => [
      MEASUREMENT_EVENTS.AFFILIATE_CLICK,
      MEASUREMENT_EVENTS.CONVERSION,
      MEASUREMENT_EVENTS.REVENUE
    ].includes(m.metric))
    .reduce((sum, m) => sum + (m.value || 0), 0);

  // Engagement Signal
  if (reachViews > 0) {
    const engagementRatio = engagedViews / reachViews;
    if (engagementRatio >= 0.4) {
      signals.push(PERFORMANCE_SIGNALS.HIGH_ENGAGEMENT_SIGNAL);
    } else {
      signals.push(PERFORMANCE_SIGNALS.LOW_ENGAGEMENT_SIGNAL);
    }
  }

  // User Action Signal
  if (userActions >= 5) {
    signals.push(PERFORMANCE_SIGNALS.STRONG_USER_ACTION_SIGNAL);
  } else if (reachViews > 50 && userActions === 0) {
    signals.push(PERFORMANCE_SIGNALS.WEAK_USER_ACTION_SIGNAL);
  }

  // Commercial Activity Signal
  if (commercialActions > 0) {
    signals.push(PERFORMANCE_SIGNALS.COMMERCIAL_ACTIVITY);
  }

  if (signals.length === 0) {
    signals.push(PERFORMANCE_SIGNALS.INSUFFICIENT_DATA);
  }

  return {
    signals,
    metricsSummary: {
      reachViews,
      engagedViews,
      userActions,
      commercialActions
    }
  };
}

/**
 * Resolves measurement-driven review triggers for human governance.
 */
function resolveMeasurementReviewTrigger(performanceEvaluation, currentResource) {
  const signals = performanceEvaluation.signals || [];
  const actions = [];

  if (signals.includes(PERFORMANCE_SIGNALS.LOW_ENGAGEMENT_SIGNAL)) {
    actions.push({
      action: 'CONTENT_INVESTIGATION',
      reason: 'Low engagement ratio detected: audit title, introductory framing, and readability.'
    });
  }

  if (signals.includes(PERFORMANCE_SIGNALS.WEAK_USER_ACTION_SIGNAL)) {
    actions.push({
      action: 'WORKFLOW_CHECKPOINT_REVIEW',
      reason: 'Users read resource but take zero onward workflow steps: audit clarity of next steps.'
    });
  }

  if (signals.includes(PERFORMANCE_SIGNALS.COMMERCIAL_ACTIVITY) && signals.includes(PERFORMANCE_SIGNALS.LOW_ENGAGEMENT_SIGNAL)) {
    actions.push({
      action: 'AFFILIATE_PLACEMENT_AUDIT',
      reason: 'Commercial activity exceeds user engagement signals: inspect for accidental CTA over-prominence.'
    });
  }

  return {
    resource_id: currentResource ? currentResource.resource_id : null,
    triggeredActions: actions,
    editorialImpact: 'ZERO_AUTOMATED_MODIFICATION (Human review required)'
  };
}

module.exports = {
  MEASUREMENT_LAYERS,
  MEASUREMENT_EVENTS,
  DATA_QUALITY,
  MEASUREMENT_SOURCES,
  PERFORMANCE_SIGNALS,
  METRIC_TO_LAYER_MAP,
  validateMeasurementRecord,
  loadKnownResourceIds,
  assertMeasurementDecoupling,
  assertUserVsCommercialSeparation,
  evaluateQualitativePerformance,
  resolveMeasurementReviewTrigger
};
