/**
 * LOCATRIA Resource Operating Dashboard Module v1.0
 * GDBS OS — Module 07 / Chapter 01 / Sprint A.4.6
 *
 * Exposes the Resource Operating Dashboard Data Adapter and View Models.
 */

'use strict';

const dashboard = require('../../validation/resource-dashboard');

module.exports = {
  getCompleteDashboardSnapshot: dashboard.getCompleteDashboardSnapshot,
  buildPortfolioSummary: dashboard.buildPortfolioSummary,
  buildResourcePortfolioView: dashboard.buildResourcePortfolioView,
  buildToolStateView: dashboard.buildToolStateView,
  buildMeasurementSummary: dashboard.buildMeasurementSummary,
  buildUserVsCommercialLedgers: dashboard.buildUserVsCommercialLedgers,
  buildReviewQueueView: dashboard.buildReviewQueueView,
  buildDecisionHistoryView: dashboard.buildDecisionHistoryView,
  buildGovernanceHealthView: dashboard.buildGovernanceHealthView,
  buildCommercialStatusView: dashboard.buildCommercialStatusView,
  buildFounderActionCenterView: dashboard.buildFounderActionCenterView,
  searchEntities: dashboard.searchEntities,
  filterEntities: dashboard.filterEntities,
  assertDashboardDecoupling: dashboard.assertDashboardDecoupling
};
