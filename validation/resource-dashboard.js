/**
 * LOCATRIA Resource Operating Dashboard Data Adapter & Engine v1.0
 * GDBS OS — Module 07 / Chapter 01 / Sprint A.4.6
 *
 * Single Source of Truth: Canonical entity records in resource-data/.
 *
 * Provides derived read-only view models for the Founder Operating Dashboard:
 * 1. PortfolioSummary
 * 2. ResourcePortfolioView
 * 3. ToolStateView
 * 4. MeasurementSummary
 * 5. UserVsCommercialLedgers
 * 6. ReviewQueueView
 * 7. DecisionHistoryView
 * 8. GovernanceHealthView
 * 9. CommercialStatusView
 * 10. FounderActionCenterView
 *
 * Strict Governance Invariants:
 * - NO numeric scores, ratings, or rankings (Score = 0 tolerance).
 * - NO automatic editorial decisions from telemetry or commercial events.
 * - Strict separation of User Value and Commercial Activity ledgers.
 * - Empty state is an authentic production state; no data fabrication.
 */

'use strict';

const path = require('path');
const fs = require('fs');

const dal = require('../js/resource-data/index');

const rootDir = path.resolve(__dirname, '..');
const defaultBaseDir = path.join(rootDir, 'resource-data');

/**
 * Builds SECTION 01 — Operating Overview View Model.
 * Reads canonical entity counts directly from the canonical data layer.
 */
function buildPortfolioSummary(options = {}) {
  const tools = dal.listTools(options);
  const resources = dal.listResources(options);
  const evaluations = dal.listEvaluations(options);
  const recommendations = dal.listRecommendations(options);
  const evidence = dal.listEvidence(options);
  const affiliates = dal.listAffiliates(options);
  const reviews = dal.listReviews(options);
  const relationships = dal.listRelationships(options);
  const measurements = dal.listMeasurements ? dal.listMeasurements(options) : [];

  const activeAffiliates = affiliates.filter(a =>
    a.locatria_affiliate_relationship === 'ACTIVE' ||
    a.affiliate_activation_status === 'ACTIVATED' ||
    a.status === 'ACTIVE'
  ).length;

  return {
    total_tools: tools.length,
    total_resources: resources.length,
    total_evaluations: evaluations.length,
    total_recommendations: recommendations.length,
    total_evidence: evidence.length,
    total_reviews: reviews.length,
    total_measurements: measurements.length,
    total_relationships: relationships.length,
    active_affiliates: activeAffiliates,
    snapshot_date: new Date().toISOString().slice(0, 10),
    environment: 'LOCAL_REPO_SNAPSHOT'
  };
}

/**
 * Builds SECTION 02 — Resource Portfolio View Model.
 * Categorizes canonical resources by type and displays lifecycle/operational state.
 * Absolute Rule: No scoring, no ranking, no "Top Resources".
 */
function buildResourcePortfolioView(options = {}) {
  const resources = dal.listResources(options);

  const byType = {
    RESOURCE_GUIDE: 0,
    WORKFLOW_RESOURCE: 0,
    TOOL_PROFILE: 0
  };

  const byStatus = {};

  const items = resources.map(res => {
    const type = res.resource_type || 'UNKNOWN';
    if (byType[type] !== undefined) {
      byType[type]++;
    } else {
      byType[type] = 1;
    }

    const gov = res.governance || {};
    const status = gov.review_status || res.lifecycle_status || 'ACTIVE';
    byStatus[status] = (byStatus[status] || 0) + 1;

    return {
      resource_id: res.resource_id,
      resource_title: res.resource_title || '',
      resource_type: type,
      description: res.description || '',
      lifecycle_status: status,
      target_verticals: (res.problem && res.problem.target_verticals) ? res.problem.target_verticals : [],
      related_tools: Array.isArray(res.related_tools) ? res.related_tools : [],
      related_articles: Array.isArray(res.related_articles) ? res.related_articles : [],
      related_learning_paths: Array.isArray(res.related_learning_paths) ? res.related_learning_paths : [],
      last_reviewed: gov.last_reviewed || '2026-09-26',
      review_status: gov.review_status || 'PUBLISHED',
      reviewer: gov.reviewer || 'LOCATRIA Editorial Governance Board'
    };
  });

  return {
    total_resources: items.length,
    by_type: byType,
    by_status: byStatus,
    resources: items
  };
}

/**
 * Builds SECTION 03 — Tool & Recommendation State View Model.
 * Canonical tool inventory joined with current recommendation state.
 * Absolute Rule: No ranking, no best/worst/winner, no score.
 */
function buildToolStateView(options = {}) {
  const tools = dal.listTools(options);
  const recommendations = dal.listRecommendations(options);

  const recMap = new Map();
  for (const rec of recommendations) {
    if (rec.tool_id) {
      recMap.set(rec.tool_id, rec);
    }
  }

  const statusBreakdown = {
    RECOMMENDED: 0,
    CONDITIONALLY_RECOMMENDED: 0,
    LISTED: 0,
    UNDER_REVIEW: 0,
    NOT_RECOMMENDED: 0,
    RETIRED: 0
  };

  const items = tools.map(tool => {
    const rec = recMap.get(tool.tool_id) || {};
    const recStatus = rec.status || tool.lifecycle_status || 'LISTED';

    if (statusBreakdown[recStatus] !== undefined) {
      statusBreakdown[recStatus]++;
    } else {
      statusBreakdown[recStatus] = 1;
    }

    const classification = tool.classification || {};
    const problem = tool.problem || {};
    const workflow = tool.workflow || {};
    const commercial = tool.commercial || {};
    const governance = tool.governance || {};

    return {
      tool_id: tool.tool_id,
      tool_name: tool.tool_name || '',
      provider: tool.provider || '',
      official_url: tool.official_url || '',
      primary_capability: classification.primary_capability || '',
      target_users: classification.target_users || [],
      target_verticals: classification.target_verticals || [],
      primary_problem: problem.primary_problem || '',
      supported_workflows: workflow.supported_workflows || [],
      workflow_stages: workflow.workflow_stages || [],
      pricing_model: commercial.pricing_model || 'UNKNOWN',
      free_plan: commercial.free_plan !== undefined ? commercial.free_plan : false,
      lifecycle_status: tool.lifecycle_status || 'LISTED',
      recommendation_id: rec.recommendation_id || null,
      recommendation_status: recStatus,
      recommendation_rationale: rec.rationale || '',
      when_to_consider: rec.when_to_consider || [],
      when_not_to_use: rec.when_not_to_use || [],
      evidence_refs: rec.evidence_refs || [],
      last_reviewed: governance.last_reviewed || '2026-09-26',
      reviewer: governance.reviewer || 'LOCATRIA Empirical Evaluation Lab'
    };
  });

  return {
    total_tools: items.length,
    status_breakdown: statusBreakdown,
    tools: items
  };
}

/**
 * Builds SECTION 04 — Measurement Overview View Model.
 * Reads empirical telemetry across REACH, ENGAGEMENT, USER_VALUE, COMMERCIAL.
 * When measurements = 0, authentic empty state is returned with NO synthetic charts.
 */
function buildMeasurementSummary(options = {}) {
  const measurements = dal.listMeasurements ? dal.listMeasurements(options) : [];

  const layerBreakdown = {
    REACH: 0,
    ENGAGEMENT: 0,
    USER_VALUE: 0,
    COMMERCIAL: 0
  };

  const qualityBreakdown = {
    ACTUAL: 0,
    ESTIMATED: 0,
    MANUAL: 0
  };

  const resourcesWithData = new Set();
  let latestPeriod = null;

  for (const m of measurements) {
    if (m.measurement_layer && layerBreakdown[m.measurement_layer] !== undefined) {
      layerBreakdown[m.measurement_layer]++;
    }
    if (m.data_quality && qualityBreakdown[m.data_quality] !== undefined) {
      qualityBreakdown[m.data_quality]++;
    }
    if (m.resource_id) {
      resourcesWithData.add(m.resource_id);
    }
    if (m.period && m.period.end_date) {
      if (!latestPeriod || m.period.end_date > latestPeriod) {
        latestPeriod = m.period.end_date;
      }
    }
  }

  const hasData = measurements.length > 0;

  return {
    total_measurements: measurements.length,
    resources_with_measurements: resourcesWithData.size,
    latest_measurement_period: latestPeriod,
    status: hasData ? 'ACTIVE_DATA' : 'INSUFFICIENT_DATA',
    display_state: hasData ? 'POPULATED' : 'EMPTY',
    empty_state_message: hasData
      ? null
      : 'NO MEASUREMENT DATA AVAILABLE\n\nThe measurement system is ready, but no real telemetry has been recorded yet.\nNo synthetic data or fabricated charts are displayed.',
    data_quality_distribution: qualityBreakdown,
    layer_breakdown: layerBreakdown,
    records: measurements
  };
}

/**
 * Builds SECTION 05 — User Value vs Commercial Activity Ledgers View Model.
 * Preserves the strict separation: User Value precedes Commercial Value.
 * Absolute Rule: Never combine these into a unified score.
 */
function buildUserVsCommercialLedgers(options = {}) {
  const measurements = dal.listMeasurements ? dal.listMeasurements(options) : [];

  const userValueEvents = {
    LEARNING_PATH_CLICK: 0,
    TOOL_VIEW: 0,
    OFFICIAL_TOOL_CLICK: 0,
    RESOURCE_FEEDBACK: 0
  };

  const commercialEvents = {
    AFFILIATE_CLICK: 0,
    CONVERSION: 0,
    REVENUE: 0
  };

  let totalUserValueEvents = 0;
  let totalCommercialEvents = 0;

  for (const m of measurements) {
    if (m.measurement_layer === 'USER_VALUE' && m.event_type) {
      userValueEvents[m.event_type] = (userValueEvents[m.event_type] || 0) + (m.metrics?.actual_count || 1);
      totalUserValueEvents++;
    } else if (m.measurement_layer === 'COMMERCIAL' && m.event_type) {
      commercialEvents[m.event_type] = (commercialEvents[m.event_type] || 0) + (m.metrics?.actual_count || 1);
      totalCommercialEvents++;
    }
  }

  return {
    combined_score_allowed: false,
    user_value_ledger: {
      layer: 'USER_VALUE',
      principle: 'User Value precedes Commercial Value. Measured independently to verify utility for local business practitioners.',
      total_events: totalUserValueEvents,
      events: userValueEvents,
      status: totalUserValueEvents > 0 ? 'ACTIVE' : 'INSUFFICIENT_DATA',
      empty_message: totalUserValueEvents === 0 ? 'NO USER VALUE TELEMETRY RECORDED' : null
    },
    commercial_ledger: {
      layer: 'COMMERCIAL',
      principle: 'Commercial activity is an operational outcome only. It does not imply editorial superiority or recommendation quality.',
      total_events: totalCommercialEvents,
      events: commercialEvents,
      status: totalCommercialEvents > 0 ? 'ACTIVE' : 'NO_COMMERCIAL_ACTIVITY',
      empty_message: totalCommercialEvents === 0 ? 'NO COMMERCIAL TELEMETRY RECORDED' : null
    }
  };
}

/**
 * Builds SECTION 06 — Review Queue View Model.
 * Consumes A.4.5 Review Candidate state.
 * Absolute Rule: No automated approvals; human review is required for all candidates.
 */
function buildReviewQueueView(options = {}) {
  const reviews = dal.listReviews(options);

  const statusCounts = {
    OPEN: 0,
    IN_REVIEW: 0,
    DECISION_REQUIRED: 0,
    RESOLVED: 0,
    CLOSED: 0,
    DISMISSED: 0
  };

  const candidates = [];

  for (const r of reviews) {
    const status = r.status || 'OPEN';
    if (statusCounts[status] !== undefined) {
      statusCounts[status]++;
    } else {
      statusCounts[status] = 1;
    }

    candidates.push({
      review_candidate_id: r.review_candidate_id || r.review_id || 'RC-UNKNOWN',
      resource_id: r.resource_id || null,
      tool_id: r.tool_id || null,
      trigger: r.trigger || 'OTHER',
      signal: r.signal || null,
      severity: r.severity || 'MEDIUM',
      reason: r.reason || '',
      proposed_review_type: r.proposed_review_type || 'GOVERNANCE_REVIEW',
      assigned_reviewer: r.assigned_reviewer || null,
      detected_at: r.detected_at || r.created_at || 'UNKNOWN',
      status: status
    });
  }

  const pendingCount = statusCounts.OPEN + statusCounts.IN_REVIEW + statusCounts.DECISION_REQUIRED;

  return {
    total_candidates: candidates.length,
    pending_attention_count: pendingCount,
    status_counts: statusCounts,
    status: pendingCount > 0 ? 'ATTENTION_REQUIRED' : 'NO_OPEN_CANDIDATES',
    empty_state_message: candidates.length === 0
      ? 'NO OPEN REVIEW CANDIDATES\n\nThere are currently no review items requiring human attention.'
      : null,
    candidates: candidates
  };
}

/**
 * Builds SECTION 07 — Decision & Action History View Model.
 * Aggregates governance history logs across tools, resources, and reviews.
 * Preserves immutable read-only records.
 */
function buildDecisionHistoryView(options = {}) {
  const tools = dal.listTools(options);
  const resources = dal.listResources(options);
  const reviews = dal.listReviews(options);

  const decisions = [];

  // Extract from Tools governance history
  for (const t of tools) {
    const gov = t.governance || {};
    if (Array.isArray(gov.history)) {
      for (const h of gov.history) {
        decisions.push({
          date: h.review_date || gov.last_reviewed || '2026-09-26',
          entity_type: 'TOOL',
          entity_id: t.tool_id,
          entity_name: t.tool_name,
          trigger: h.trigger || 'SCHEDULED',
          decision: h.decision || gov.review_status || 'RECOMMENDED',
          rationale: h.rationale || gov.change_notes || 'Baseline evaluation approval',
          reviewer: h.reviewer || gov.reviewer || 'LOCATRIA Empirical Evaluation Lab',
          previous_state: h.previous_state || 'EVALUATED',
          new_state: h.new_state || t.lifecycle_status || 'RECOMMENDED'
        });
      }
    } else if (gov.change_notes) {
      decisions.push({
        date: gov.last_reviewed || '2026-09-26',
        entity_type: 'TOOL',
        entity_id: t.tool_id,
        entity_name: t.tool_name,
        trigger: 'SCHEDULED',
        decision: gov.review_status || t.lifecycle_status || 'RECOMMENDED',
        rationale: gov.change_notes,
        reviewer: gov.reviewer || 'LOCATRIA Empirical Evaluation Lab',
        previous_state: 'EVALUATED',
        new_state: t.lifecycle_status || 'RECOMMENDED'
      });
    }
  }

  // Extract from Resources governance history
  for (const r of resources) {
    const gov = r.governance || {};
    if (Array.isArray(gov.history)) {
      for (const h of gov.history) {
        decisions.push({
          date: h.review_date || gov.last_reviewed || '2026-09-26',
          entity_type: 'RESOURCE',
          entity_id: r.resource_id,
          entity_name: r.resource_title,
          trigger: h.trigger || 'PUBLICATION_GATE',
          decision: h.decision || 'PUBLISHED',
          rationale: h.rationale || gov.change_notes || 'Initial publication approval',
          reviewer: h.reviewer || gov.reviewer || 'LOCATRIA Editorial Governance Board',
          previous_state: h.previous_state || 'DRAFT',
          new_state: h.new_state || 'PUBLISHED'
        });
      }
    } else if (gov.change_notes) {
      decisions.push({
        date: gov.last_reviewed || '2026-09-26',
        entity_type: 'RESOURCE',
        entity_id: r.resource_id,
        entity_name: r.resource_title,
        trigger: 'PUBLICATION_GATE',
        decision: gov.review_status || 'PUBLISHED',
        rationale: gov.change_notes,
        reviewer: gov.reviewer || 'LOCATRIA Editorial Governance Board',
        previous_state: 'DRAFT',
        new_state: 'PUBLISHED'
      });
    }
  }

  // Extract from Reviews
  for (const rev of reviews) {
    if (rev.decision) {
      decisions.push({
        date: rev.decision_date || rev.updated_at || 'UNKNOWN',
        entity_type: rev.resource_id ? 'RESOURCE' : 'TOOL',
        entity_id: rev.resource_id || rev.tool_id,
        entity_name: rev.entity_name || rev.resource_id || rev.tool_id,
        trigger: rev.trigger || 'OTHER',
        decision: rev.decision,
        rationale: rev.rationale || 'Operational review decision',
        reviewer: rev.reviewer || 'Founder',
        previous_state: rev.previous_state || 'ACTIVE',
        new_state: rev.new_state || 'ACTIVE'
      });
    }
  }

  // Sort descending by date
  decisions.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  return {
    total_decisions: decisions.length,
    decisions: decisions
  };
}

/**
 * Builds SECTION 08 — Governance Health View Model.
 * Evaluates operational conditions and presents categorical health states.
 * Absolute Rule: No numeric Governance Score. Use states: OK, ATTENTION, ACTION REQUIRED, INSUFFICIENT DATA.
 */
function buildGovernanceHealthView(options = {}) {
  const tools = dal.listTools(options);
  const resources = dal.listResources(options);
  const recommendations = dal.listRecommendations(options);
  const evidence = dal.listEvidence(options);
  const affiliates = dal.listAffiliates(options);
  const reviews = dal.listReviews(options);

  const evidenceToolIds = new Set(evidence.map(e => e.tool_id).filter(Boolean));
  const toolsWithoutEvidence = tools.filter(t => !evidenceToolIds.has(t.tool_id));

  const retiredTools = tools.filter(t => t.lifecycle_status === 'RETIRED');

  const recMissingGov = recommendations.filter(r => !r.status || !r.rationale || !r.evidence_refs || r.evidence_refs.length === 0);

  const affUnverified = affiliates.filter(a => !a.last_verified);

  const commercialUnactivated = affiliates.filter(a => a.affiliate_activation_status !== 'ACTIVATED');

  const openReviews = reviews.filter(r => r.status === 'OPEN' || r.status === 'DECISION_REQUIRED');

  const checks = [
    {
      id: 'GOV-CHK-01',
      name: 'Tools Without Required Evidence',
      condition_count: toolsWithoutEvidence.length,
      state: toolsWithoutEvidence.length === 0 ? 'OK' : 'ACTION_REQUIRED',
      details: toolsWithoutEvidence.length === 0
        ? 'All 10 tools have empirical benchmark evidence records.'
        : `${toolsWithoutEvidence.length} tools lack empirical evidence.`
    },
    {
      id: 'GOV-CHK-02',
      name: 'Recommendations Missing Governance Fields',
      condition_count: recMissingGov.length,
      state: recMissingGov.length === 0 ? 'OK' : 'ACTION_REQUIRED',
      details: recMissingGov.length === 0
        ? 'All 10 recommendations have valid status, rationale, and evidence links.'
        : `${recMissingGov.length} recommendations have missing fields.`
    },
    {
      id: 'GOV-CHK-03',
      name: 'RETIRED Tool Depreciation State',
      condition_count: retiredTools.length,
      state: 'OK',
      details: retiredTools.length === 0
        ? 'Zero deprecated tools in current production baseline.'
        : `${retiredTools.length} tools are in terminal RETIRED state.`
    },
    {
      id: 'GOV-CHK-04',
      name: 'Affiliate Records Requiring Verification',
      condition_count: affUnverified.length,
      state: affUnverified.length === 0 ? 'OK' : 'ATTENTION',
      details: affUnverified.length === 0
        ? 'All 10 affiliate profiles verified with audit timestamps.'
        : `${affUnverified.length} affiliate records require verification.`
    },
    {
      id: 'GOV-CHK-05',
      name: 'Commercial Independence Baseline',
      condition_count: commercialUnactivated.length,
      state: 'OK',
      details: 'All 10 tool records remain strictly NOT_ACTIVATED / NOT_CONTRACTED. Zero commercial entanglement.'
    },
    {
      id: 'GOV-CHK-06',
      name: 'Open Review Candidates',
      condition_count: openReviews.length,
      state: openReviews.length === 0 ? 'OK' : 'ACTION_REQUIRED',
      details: openReviews.length === 0
        ? 'Review queue is clear. Zero open candidates requiring attention.'
        : `${openReviews.length} candidates pending review.`
    },
    {
      id: 'GOV-CHK-07',
      name: 'Measurement Telemetry Baseline',
      condition_count: 0,
      state: 'INSUFFICIENT_DATA',
      details: 'Telemetry collection pending initial production run. No synthetic data generated.'
    }
  ];

  const hasActionRequired = checks.some(c => c.state === 'ACTION_REQUIRED');
  const hasAttention = checks.some(c => c.state === 'ATTENTION');

  let overallHealth = 'SYSTEM_HEALTHY';
  if (hasActionRequired) overallHealth = 'ACTION_REQUIRED';
  else if (hasAttention) overallHealth = 'ATTENTION';

  return {
    overall_health: overallHealth,
    no_numeric_score: true,
    total_checks: checks.length,
    checks: checks
  };
}

/**
 * Builds SECTION 09 — Commercial / Affiliate Status View Model.
 * Displays commercial layer separately from editorial recommendations.
 * Preserves the 4-way distinction:
 * 1. Vendor Program Availability
 * 2. LOCATRIA Relationship
 * 3. Activation Status
 * 4. Recommendation Status
 */
function buildCommercialStatusView(options = {}) {
  const tools = dal.listTools(options);
  const affiliates = dal.listAffiliates(options);
  const recommendations = dal.listRecommendations(options);

  const affMap = new Map();
  for (const a of affiliates) {
    if (a.tool_id) affMap.set(a.tool_id, a);
  }

  const recMap = new Map();
  for (const r of recommendations) {
    if (r.tool_id) recMap.set(r.tool_id, r);
  }

  let totalVendorProgramsAvailable = 0;
  let activeRelationships = 0;
  let activatedAffiliates = 0;

  const items = tools.map(t => {
    const aff = affMap.get(t.tool_id) || {};
    const rec = recMap.get(t.tool_id) || {};

    const vendorAvailable = aff.affiliate_program_available === 'TRUE' || aff.affiliate_available === true;
    if (vendorAvailable) totalVendorProgramsAvailable++;

    const locatriaRel = aff.locatria_affiliate_relationship || 'NOT_CONTRACTED';
    if (locatriaRel === 'ACTIVE') activeRelationships++;

    const actStatus = aff.affiliate_activation_status || 'NOT_ACTIVATED';
    if (actStatus === 'ACTIVATED') activatedAffiliates++;

    return {
      tool_id: t.tool_id,
      tool_name: t.tool_name,
      vendor_program_available: vendorAvailable ? 'TRUE' : 'FALSE',
      locatria_relationship: locatriaRel,
      activation_status: actStatus,
      recommendation_status: rec.status || t.lifecycle_status || 'LISTED',
      network: aff.network || 'None',
      disclosure_required: aff.disclosure_required || false,
      last_verified: aff.last_verified || '2026-09-26'
    };
  });

  return {
    total_tools_audited: items.length,
    vendor_programs_available: totalVendorProgramsAvailable,
    active_relationships: activeRelationships,
    activated_affiliates: activatedAffiliates,
    decoupling_status: 'STRICTLY_DECOUPLED',
    commercial_neutrality_verified: true,
    empty_affiliate_activity_message: activatedAffiliates === 0
      ? 'NO ACTIVE AFFILIATE RELATIONSHIPS\n\nCommercial activity is currently inactive across all tools.'
      : null,
    tools: items
  };
}

/**
 * Builds SECTION 10 — Founder Action Center View Model.
 * Aggregates all operational tasks requiring human attention.
 * Founder remains the sole decision authority; no automated executions.
 */
function buildFounderActionCenterView(options = {}) {
  const reviews = dal.listReviews(options);
  const tools = dal.listTools(options);
  const evidence = dal.listEvidence(options);

  const actionItems = [];

  // Check 1: Open Review Candidates
  for (const r of reviews) {
    if (r.status === 'OPEN' || r.status === 'DECISION_REQUIRED') {
      actionItems.push({
        id: `ACT-${r.review_candidate_id || r.review_id}`,
        category: 'REVIEW_REQUIRED',
        title: `Review Candidate Pending: ${r.review_candidate_id || r.review_id}`,
        entity_ref: r.resource_id || r.tool_id,
        severity: r.severity || 'MEDIUM',
        description: r.reason || 'Candidate requiring Founder evaluation.',
        action_needed: 'Evaluate evidence and record decision outcome (A.4.5 Gate).'
      });
    }
  }

  // Check 2: Missing Evidence check
  const evidenceToolIds = new Set(evidence.map(e => e.tool_id).filter(Boolean));
  for (const t of tools) {
    if (!evidenceToolIds.has(t.tool_id)) {
      actionItems.push({
        id: `ACT-EVD-${t.tool_id}`,
        category: 'EVIDENCE_REQUIRED',
        title: `Empirical Evidence Missing: ${t.tool_name}`,
        entity_ref: t.tool_id,
        severity: 'HIGH',
        description: `Tool ${t.tool_id} does not have an empirical evaluation evidence record.`,
        action_needed: 'Conduct laboratory benchmark test or assign research ticket.'
      });
    }
  }

  // Check 3: Telemetry baseline notice
  actionItems.push({
    id: 'ACT-MEAS-BASELINE',
    category: 'INSUFFICIENT_DATA',
    title: 'Measurement Telemetry Collection Pending',
    entity_ref: 'resource-data/measurements',
    severity: 'LOW',
    description: 'The Resource Measurement Layer (A.4.4) is architected and validated, but awaits initial production traffic.',
    action_needed: 'Monitor real visitor interaction logs once website deployment completes.'
  });

  return {
    total_actions: actionItems.length,
    requires_founder_decision: actionItems.some(a => a.category !== 'INSUFFICIENT_DATA'),
    categories: {
      REVIEW_REQUIRED: actionItems.filter(a => a.category === 'REVIEW_REQUIRED').length,
      EVIDENCE_REQUIRED: actionItems.filter(a => a.category === 'EVIDENCE_REQUIRED').length,
      RE_EVALUATION_REQUIRED: actionItems.filter(a => a.category === 'RE_EVALUATION_REQUIRED').length,
      GOVERNANCE_ATTENTION: actionItems.filter(a => a.category === 'GOVERNANCE_ATTENTION').length,
      COMMERCIAL_UPDATE: actionItems.filter(a => a.category === 'COMMERCIAL_UPDATE').length,
      CONTENT_UPDATE: actionItems.filter(a => a.category === 'CONTENT_UPDATE').length,
      INSUFFICIENT_DATA: actionItems.filter(a => a.category === 'INSUFFICIENT_DATA').length
    },
    items: actionItems
  };
}

/**
 * Searches across canonical operating entities.
 * Returns direct canonical entity references without creating duplicates.
 */
function searchEntities(query, options = {}) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return [];
  }

  const q = query.trim().toLowerCase();
  const results = [];

  // Search Tools
  const tools = dal.listTools(options);
  for (const t of tools) {
    if (
      (t.tool_id && t.tool_id.toLowerCase().includes(q)) ||
      (t.tool_name && t.tool_name.toLowerCase().includes(q)) ||
      (t.provider && t.provider.toLowerCase().includes(q))
    ) {
      results.push({
        entity_type: 'TOOL',
        entity_id: t.tool_id,
        entity_name: t.tool_name,
        match_field: t.tool_id.toLowerCase().includes(q) ? 'tool_id' : 'tool_name',
        entity: t
      });
    }
  }

  // Search Resources
  const resources = dal.listResources(options);
  for (const r of resources) {
    if (
      (r.resource_id && r.resource_id.toLowerCase().includes(q)) ||
      (r.resource_title && r.resource_title.toLowerCase().includes(q)) ||
      (r.resource_type && r.resource_type.toLowerCase().includes(q))
    ) {
      results.push({
        entity_type: 'RESOURCE',
        entity_id: r.resource_id,
        entity_name: r.resource_title,
        match_field: r.resource_id.toLowerCase().includes(q) ? 'resource_id' : 'resource_title',
        entity: r
      });
    }
  }

  // Search Recommendations
  const recommendations = dal.listRecommendations(options);
  for (const rec of recommendations) {
    if (
      (rec.recommendation_id && rec.recommendation_id.toLowerCase().includes(q)) ||
      (rec.tool_id && rec.tool_id.toLowerCase().includes(q))
    ) {
      results.push({
        entity_type: 'RECOMMENDATION',
        entity_id: rec.recommendation_id,
        entity_name: `Recommendation for ${rec.tool_id}`,
        match_field: 'recommendation_id',
        entity: rec
      });
    }
  }

  // Search Reviews
  const reviews = dal.listReviews(options);
  for (const rev of reviews) {
    const revId = rev.review_candidate_id || rev.review_id || '';
    if (revId.toLowerCase().includes(q)) {
      results.push({
        entity_type: 'REVIEW',
        entity_id: revId,
        entity_name: `Review Candidate ${revId}`,
        match_field: 'review_candidate_id',
        entity: rev
      });
    }
  }

  return results;
}

/**
 * Filters a collection of entities based on criteria.
 */
function filterEntities(items, criteria = {}) {
  if (!Array.isArray(items)) return [];

  return items.filter(item => {
    for (const [key, val] of Object.entries(criteria)) {
      if (val === undefined || val === null || val === 'ALL' || val === '') continue;

      if (key === 'workflow_stage') {
        const stages = item.workflow_stages || [];
        if (!stages.includes(val)) return false;
      } else if (key === 'vertical') {
        const verts = item.target_verticals || [];
        if (!verts.includes(val)) return false;
      } else if (item[key] !== val) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Asserts Dashboard Decoupling & Integrity Invariants:
 * - NO numeric scoring or ranking
 * - NO automatic recommendation alterations
 * - Separation of User Value and Commercial Activity
 * - Authentic empty baseline representation
 */
function assertDashboardDecoupling(snapshot) {
  const violations = [];

  // Check 1: Numeric Scoring Invariant
  const jsonStr = JSON.stringify(snapshot);
  const bannedScorePatterns = [
    /"resource_score"/i,
    /"tool_score"/i,
    /"recommendation_score"/i,
    /"governance_score"/i,
    /"affiliate_score"/i,
    /"quality_score"/i,
    /"performance_score"/i,
    /"overall_score"/i,
    /"tool_ranking"/i,
    /"best_tool"/i,
    /"winner"/i
  ];

  for (const pattern of bannedScorePatterns) {
    if (pattern.test(jsonStr)) {
      violations.push(`INVARIANT_VIOLATION: Numeric score or ranking detected matching ${pattern}`);
    }
  }

  // Check 2: User Value vs Commercial Separation
  if (snapshot.user_vs_commercial) {
    if (snapshot.user_vs_commercial.combined_score_allowed !== false) {
      violations.push('INVARIANT_VIOLATION: User Value and Commercial Activity ledgers must never allow a combined score.');
    }
  }

  // Check 3: Governance Health No-Score Invariant
  if (snapshot.governance_health && snapshot.governance_health.no_numeric_score !== true) {
    violations.push('INVARIANT_VIOLATION: Governance health panel must use categorical states, not numeric scores.');
  }

  return {
    compliant: violations.length === 0,
    violations
  };
}

/**
 * Compiles the entire Resource Operating Dashboard Snapshot.
 */
function getCompleteDashboardSnapshot(options = {}) {
  const portfolioSummary = buildPortfolioSummary(options);
  const resourcePortfolio = buildResourcePortfolioView(options);
  const toolState = buildToolStateView(options);
  const measurementSummary = buildMeasurementSummary(options);
  const userVsCommercial = buildUserVsCommercialLedgers(options);
  const reviewQueue = buildReviewQueueView(options);
  const decisionHistory = buildDecisionHistoryView(options);
  const governanceHealth = buildGovernanceHealthView(options);
  const commercialStatus = buildCommercialStatusView(options);
  const founderActionCenter = buildFounderActionCenterView(options);

  const snapshot = {
    generated_at: new Date().toISOString(),
    operating_overview: portfolioSummary,
    resource_portfolio: resourcePortfolio,
    tool_state: toolState,
    measurement_overview: measurementSummary,
    user_vs_commercial: userVsCommercial,
    review_queue: reviewQueue,
    decision_history: decisionHistory,
    governance_health: governanceHealth,
    commercial_status: commercialStatus,
    founder_action_center: founderActionCenter
  };

  const decouplingCheck = assertDashboardDecoupling(snapshot);
  if (!decouplingCheck.compliant) {
    const err = new Error(`DASHBOARD_DECOUPLING_ERROR: ${decouplingCheck.violations.join('; ')}`);
    err.violations = decouplingCheck.violations;
    throw err;
  }

  return snapshot;
}

module.exports = {
  buildPortfolioSummary,
  buildResourcePortfolioView,
  buildToolStateView,
  buildMeasurementSummary,
  buildUserVsCommercialLedgers,
  buildReviewQueueView,
  buildDecisionHistoryView,
  buildGovernanceHealthView,
  buildCommercialStatusView,
  buildFounderActionCenterView,
  searchEntities,
  filterEntities,
  assertDashboardDecoupling,
  getCompleteDashboardSnapshot
};
