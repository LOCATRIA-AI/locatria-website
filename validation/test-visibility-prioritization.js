/**
 * LOCATRIA Visibility Operating System v1.0
 * Prioritization & Founder Decision Test Suite — Module 08 / M08.2 BUILD-04
 *
 * Validates:
 * - Positive Tests T01–T15 (Priority assessment, 6 dimensions, evidence basis, recommendations,
 *   coexistence of priorities, Founder decisions, overrides, versioning, full traceability, historical immutability)
 * - Negative Tests P01–P18 (Unqualified opportunity rejection, non-existent references, invalid categories,
 *   forbidden scores/ranks, AI decision prohibitions, immutability violations, broken chains, missing override reasons)
 * - Historical Integrity Check: Verifies zero mutation to historical production data.
 */

'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const dal = require('../js/visibility-data/index');
const domain = require('../js/visibility-domain/index');
const prio = require('../js/visibility-prioritization/index');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(testName, testFn) {
  totalTests++;
  try {
    testFn();
    console.log(`  [PASS] Test ${String(totalTests).padStart(2, '0')}: ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] Test ${String(totalTests).padStart(2, '0')}: ${testName}`);
    console.error(`         Error: ${err.message}`);
    failedTests++;
  }
}

console.log('============================================================');
console.log('LOCATRIA VISIBILITY PRIORITIZATION & DECISION TEST SUITE');
console.log('M08.2 BUILD-04 — Prioritization & Founder Decision Foundation v1.0');
console.log('============================================================\n');

// Clean up any test fixtures from _fixtures matching DIAG-B04-*, OPP-B04-*, PRIO-TEST-*, DEC-TEST-*
const fixtureDir = path.join(dal.getBaseDir(), '_fixtures');
if (fs.existsSync(fixtureDir)) {
  const existingFiles = fs.readdirSync(fixtureDir);
  for (const f of existingFiles) {
    if (f.startsWith('diag-b04-') || f.startsWith('opp-b04-') || f.startsWith('prio-test-') || f.startsWith('dec-test-')) {
      try { fs.unlinkSync(path.join(fixtureDir, f)); } catch (_) {}
    }
  }
}

// -------------------------------------------------------------
// SETUP BASELINE TEST FIXTURES IN _fixtures
// -------------------------------------------------------------

// 1. Validated Diagnosis for testing
domain.createDiagnosis({
  diagnosis_id: 'DIAG-B04-001',
  title: 'Entity Omission Diagnosis for Prioritization Testing',
  statement: 'LOCATRIA entity omission across multiple prompts and environments.',
  scope: 'GLOBAL',
  observation_refs: ['OBS-T1-CHATGPT-P01'],
  evidence_refs: ['EVD-VIS-T1-CHATGPT-P01'],
  metric_refs: ['M01_MENTION'],
  environment_refs: ['ENV-CHATGPT'],
  run_refs: ['RUN-M08-1-T1-REF'],
  problem_taxonomy: ['V1_DISCOVERY'],
  confidence_state: 'HIGH'
}, { isFixture: true, recordAudit: false });

domain.transitionDiagnosisStatus('DIAG-B04-001', 'UNDER_REVIEW', { actor: 'OPERATOR', actor_type: 'OPERATOR' }, { isFixture: true, recordAudit: false });
domain.transitionDiagnosisStatus('DIAG-B04-001', 'VALIDATED', { actor: 'FOUNDER', actor_type: 'FOUNDER' }, { isFixture: true, recordAudit: false });

// 2. Qualified Opportunity for testing
domain.createOpportunity({
  opportunity_id: 'OPP-B04-QUAL-001',
  title: 'Canonical Entity Schema Implementation',
  statement: 'Implement Organization schema markup to establish canonical entity identity.',
  scope: 'GLOBAL',
  diagnosis_refs: ['DIAG-B04-001'],
  problem_taxonomy: ['V1_DISCOVERY', 'V4_ENTITY'],
  qualification_state: 'UNQUALIFIED',
  confidence_state: 'HIGH'
}, { isFixture: true, recordAudit: false });

domain.transitionOpportunityStatus('OPP-B04-QUAL-001', 'DRAFTED', { actor: 'OPERATOR', actor_type: 'OPERATOR' }, { isFixture: true, recordAudit: false });
domain.transitionOpportunityStatus('OPP-B04-QUAL-001', 'QUALIFYING', { actor: 'OPERATOR', actor_type: 'OPERATOR' }, { isFixture: true, recordAudit: false });
domain.transitionOpportunityStatus('OPP-B04-QUAL-001', 'QUALIFIED', { actor: 'FOUNDER', actor_type: 'FOUNDER', notes: 'Qualified by Founder' }, { isFixture: true, recordAudit: false });

// 3. Second Qualified Opportunity for testing multi-item coexistence
domain.createOpportunity({
  opportunity_id: 'OPP-B04-QUAL-002',
  title: 'Source Discoverability and Citation Enhancement',
  statement: 'Improve citation acquisition across high-retrieval domains.',
  scope: 'GLOBAL',
  diagnosis_refs: ['DIAG-B04-001'],
  problem_taxonomy: ['V3_CITATION'],
  qualification_state: 'UNQUALIFIED',
  confidence_state: 'HIGH'
}, { isFixture: true, recordAudit: false });

domain.transitionOpportunityStatus('OPP-B04-QUAL-002', 'DRAFTED', { actor: 'OPERATOR', actor_type: 'OPERATOR' }, { isFixture: true, recordAudit: false });
domain.transitionOpportunityStatus('OPP-B04-QUAL-002', 'QUALIFYING', { actor: 'OPERATOR', actor_type: 'OPERATOR' }, { isFixture: true, recordAudit: false });
domain.transitionOpportunityStatus('OPP-B04-QUAL-002', 'QUALIFIED', { actor: 'FOUNDER', actor_type: 'FOUNDER', notes: 'Qualified by Founder' }, { isFixture: true, recordAudit: false });

// 4. An UNQUALIFIED Opportunity for negative testing
domain.createOpportunity({
  opportunity_id: 'OPP-B04-UNQUAL-003',
  title: 'Draft Unqualified Opportunity',
  statement: 'This opportunity is not yet qualified.',
  scope: 'GLOBAL',
  diagnosis_refs: ['DIAG-B04-001'],
  problem_taxonomy: ['V1_DISCOVERY'],
  qualification_state: 'UNQUALIFIED',
  confidence_state: 'MEDIUM'
}, { isFixture: true, recordAudit: false });

// -------------------------------------------------------------
// SECTION 1: POSITIVE TESTS (T01–T15)
// -------------------------------------------------------------

runTest('T01: Create Priority Assessment for QUALIFIED Opportunity', () => {
  const assessment = prio.createPriorityAssessment({
    priority_assessment_id: 'PRIO-TEST-001',
    opportunity_id: 'OPP-B04-QUAL-001',
    impact: 'HIGH',
    evidence_strength: 'HIGH',
    feasibility: 'HIGH',
    urgency: 'HIGH',
    dependency: 'BLOCKING',
    strategic_relevance: 'HIGH',
    impact_basis: 'Directly impacts brand entity discoverability across all 3 AI search environments.',
    evidence_strength_basis: 'Supported by 60 empirical observations across 20 canonical prompts in T1 Reference Run.',
    feasibility_basis: 'JSON-LD schema implementation requires low architectural friction.',
    urgency_basis: 'Entity confusion persists across current production queries.',
    dependency_basis: 'Prerequisite for citation acquisition and accurate context synthesis.',
    strategic_relevance_basis: 'Core objective of Module 08 Visibility Operating System.',
    assessment_scope: 'GLOBAL'
  }, { isFixture: true, recordAudit: false });

  assert.strictEqual(assessment.priority_assessment_id, 'PRIO-TEST-001');
  assert.strictEqual(assessment.opportunity_id, 'OPP-B04-QUAL-001');
  assert.strictEqual(assessment.priority_recommendation, 'P0');
});

runTest('T02: Store all six categorical dimensions', () => {
  const loaded = dal.loadEntity('priority_assessment', 'PRIO-TEST-001', { isFixture: true });
  assert.strictEqual(loaded.impact, 'HIGH');
  assert.strictEqual(loaded.evidence_strength, 'HIGH');
  assert.strictEqual(loaded.feasibility, 'HIGH');
  assert.strictEqual(loaded.urgency, 'HIGH');
  assert.strictEqual(loaded.dependency, 'BLOCKING');
  assert.strictEqual(loaded.strategic_relevance, 'HIGH');
});

runTest('T03: Store evidence basis for every dimension', () => {
  const loaded = dal.loadEntity('priority_assessment', 'PRIO-TEST-001', { isFixture: true });
  assert(loaded.impact_basis.length > 10);
  assert(loaded.evidence_strength_basis.length > 10);
  assert(loaded.feasibility_basis.length > 10);
  assert(loaded.urgency_basis.length > 10);
  assert(loaded.dependency_basis.length > 10);
  assert(loaded.strategic_relevance_basis.length > 10);
});

runTest('T04: Generate transparent Priority Recommendation without scores', () => {
  const rec = prio.generatePriorityRecommendation({
    impact: 'HIGH',
    evidence_strength: 'HIGH',
    feasibility: 'MEDIUM',
    urgency: 'MEDIUM',
    dependency: 'NONE',
    strategic_relevance: 'HIGH'
  });
  assert.strictEqual(rec.recommendation, 'P1');
  assert(rec.rationale.includes('High Priority Candidate'));
  assert.strictEqual(rec.score, undefined, 'No numeric score allowed');
});

runTest('T05: Allow multiple opportunities with same priority (Coexistence)', () => {
  const a1 = prio.createPriorityAssessment({
    priority_assessment_id: 'PRIO-TEST-005-A',
    opportunity_id: 'OPP-B04-QUAL-001',
    impact: 'HIGH',
    evidence_strength: 'HIGH',
    feasibility: 'HIGH',
    urgency: 'MEDIUM',
    dependency: 'NONE',
    strategic_relevance: 'HIGH',
    impact_basis: 'High impact on visibility.',
    evidence_strength_basis: 'Verified across all T1 runs.',
    feasibility_basis: 'Standard implementation effort.',
    urgency_basis: 'Medium near-term urgency.',
    dependency_basis: 'No blocking dependencies.',
    strategic_relevance_basis: 'High strategic relevance.'
  }, { isFixture: true, recordAudit: false });

  const a2 = prio.createPriorityAssessment({
    priority_assessment_id: 'PRIO-TEST-005-B',
    opportunity_id: 'OPP-B04-QUAL-002',
    impact: 'HIGH',
    evidence_strength: 'MEDIUM',
    feasibility: 'HIGH',
    urgency: 'MEDIUM',
    dependency: 'NONE',
    strategic_relevance: 'HIGH',
    impact_basis: 'High citation impact.',
    evidence_strength_basis: 'Moderate evidence from T1.',
    feasibility_basis: 'High feasibility.',
    urgency_basis: 'Medium urgency.',
    dependency_basis: 'Independent opportunity.',
    strategic_relevance_basis: 'Aligned with M08 objectives.'
  }, { isFixture: true, recordAudit: false });

  assert.strictEqual(a1.priority_recommendation, 'P1');
  assert.strictEqual(a2.priority_recommendation, 'P1');
  // Both coexist as P1 without synthetic forced ranking
});

runTest('T06: Allow P1 recommendation followed by Founder DEFER', () => {
  const decision = prio.createFounderDecision({
    decision_id: 'DEC-TEST-006',
    opportunity_id: 'OPP-B04-QUAL-001',
    priority_assessment_id: 'PRIO-TEST-005-A',
    recommendation: 'P1',
    decision: 'DEFER',
    decision_reason: 'Deferred by Founder pending Q4 technical resource reallocation.',
    decided_by: 'FOUNDER'
  }, { isFixture: true, recordAudit: false });

  assert.strictEqual(decision.decision, 'DEFER');
  assert.strictEqual(decision.recommendation, 'P1');
});

runTest('T07: Allow P2 recommendation followed by Founder APPROVE', () => {
  const aP2 = prio.createPriorityAssessment({
    priority_assessment_id: 'PRIO-TEST-007-PAS',
    opportunity_id: 'OPP-B04-QUAL-002',
    impact: 'MEDIUM',
    evidence_strength: 'HIGH',
    feasibility: 'HIGH',
    urgency: 'MEDIUM',
    dependency: 'NONE',
    strategic_relevance: 'MEDIUM',
    impact_basis: 'Incremental citation impact.',
    evidence_strength_basis: 'Sufficient evidence available.',
    feasibility_basis: 'Quick implementation.',
    urgency_basis: 'Standard urgency.',
    dependency_basis: 'None.',
    strategic_relevance_basis: 'Moderate.'
  }, { isFixture: true, recordAudit: false });
  assert.strictEqual(aP2.priority_recommendation, 'P2');

  const decision = prio.createFounderDecision({
    decision_id: 'DEC-TEST-007',
    opportunity_id: 'OPP-B04-QUAL-002',
    priority_assessment_id: 'PRIO-TEST-007-PAS',
    recommendation: 'P2',
    decision: 'APPROVE',
    decision_reason: 'Founder approves early execution due to immediate low-effort availability.',
    decided_by: 'FOUNDER'
  }, { isFixture: true, recordAudit: false });

  assert.strictEqual(decision.decision, 'APPROVE');
  assert.strictEqual(decision.recommendation, 'P2');
});

runTest('T08: Allow Founder override with explicit reason', () => {
  const decision = prio.createFounderDecision({
    decision_id: 'DEC-TEST-008',
    opportunity_id: 'OPP-B04-QUAL-001',
    priority_assessment_id: 'PRIO-TEST-001',
    recommendation: 'P0',
    decision: 'DEFER',
    decision_reason: 'Founder override: Prioritizing foundation stability before dependency execution.',
    decided_by: 'FOUNDER'
  }, { isFixture: true, recordAudit: false });

  assert.strictEqual(decision.decision, 'DEFER');
  assert.strictEqual(decision.recommendation, 'P0');
  assert(decision.decision_reason.includes('Founder override'));
});

runTest('T09: Allow REQUEST_MORE_EVIDENCE', () => {
  const decision = prio.createFounderDecision({
    decision_id: 'DEC-TEST-009',
    opportunity_id: 'OPP-B04-QUAL-001',
    priority_assessment_id: 'PRIO-TEST-001',
    recommendation: 'P0',
    decision: 'REQUEST_MORE_EVIDENCE',
    decision_reason: 'Requesting additional sample runs across Gemini before final approval.',
    decided_by: 'FOUNDER'
  }, { isFixture: true, recordAudit: false });

  assert.strictEqual(decision.decision, 'REQUEST_MORE_EVIDENCE');
});

runTest('T10: Preserve recommendation and decision separately', () => {
  const loaded = dal.loadEntity('founder_decision', 'DEC-TEST-008', { isFixture: true });
  assert.notStrictEqual(loaded.recommendation, loaded.decision);
  assert.strictEqual(loaded.recommendation, 'P0');
  assert.strictEqual(loaded.decision, 'DEFER');
});

runTest('T11: Version Priority Assessment', () => {
  const unreferenced = prio.createPriorityAssessment({
    priority_assessment_id: 'PRIO-TEST-011',
    opportunity_id: 'OPP-B04-QUAL-001',
    impact: 'MEDIUM',
    evidence_strength: 'MEDIUM',
    feasibility: 'HIGH',
    urgency: 'LOW',
    dependency: 'NONE',
    strategic_relevance: 'MEDIUM',
    impact_basis: 'Initial basis.',
    evidence_strength_basis: 'Initial basis.',
    feasibility_basis: 'Initial basis.',
    urgency_basis: 'Initial basis.',
    dependency_basis: 'Initial basis.',
    strategic_relevance_basis: 'Initial basis.'
  }, { isFixture: true, recordAudit: false });

  assert.strictEqual(unreferenced.priority_assessment_version, '1.0.0');

  const v2 = prio.updatePriorityAssessmentVersion('PRIO-TEST-011', {
    urgency: 'HIGH',
    urgency_basis: 'New production telemetry reveals urgent priority.'
  }, { actor: 'OPERATOR' }, { isFixture: true, recordAudit: false });

  assert.strictEqual(v2.priority_assessment_version, '1.1.0');
  assert.strictEqual(v2.urgency, 'HIGH');
});

runTest('T12: Version Founder Decision via revision', () => {
  const rev = prio.recordFounderDecisionRevision('DEC-TEST-007', {
    decision: 'DEFER',
    decision_reason: 'Revised strategic decision: Deferring to focus on Q4 core objectives.',
    decided_by: 'FOUNDER'
  }, { actor: 'FOUNDER' }, { isFixture: true, recordAudit: false });

  assert.strictEqual(rev.decision_version, '2.0.0');
  assert.strictEqual(rev.decision, 'DEFER');
  assert.strictEqual(rev.metadata.supersedes_decision_id, 'DEC-TEST-007');
});

runTest('T13: Trace Founder Decision back to raw evidence', () => {
  const trace = prio.traceDecisionEvidenceChain('DEC-TEST-007', { includeFixtures: true });
  assert.strictEqual(trace.found, true);
  assert.strictEqual(trace.is_complete, true);
  assert.strictEqual(trace.counts.assessments, 1);
  assert.strictEqual(trace.counts.opportunities, 1);
  assert.strictEqual(trace.counts.diagnoses, 1);
  assert.strictEqual(trace.counts.observations, 1);
  assert.strictEqual(trace.counts.evidence, 1);
  assert.strictEqual(trace.broken_links.length, 0);
});

runTest('T14: Prevent AI from finalizing decision', () => {
  assert.throws(() => {
    prio.createFounderDecision({
      decision_id: 'DEC-TEST-014-AI',
      opportunity_id: 'OPP-B04-QUAL-001',
      priority_assessment_id: 'PRIO-TEST-001',
      recommendation: 'P0',
      decision: 'APPROVE',
      decision_reason: 'AI attempted approval.',
      decided_by: 'AI_ADVISOR'
    }, { actor_type: 'AI_ADVISOR', isFixture: true });
  }, /PERMISSION_DENIED/);
});

runTest('T15: Preserve immutable historical records during prioritization and decision', () => {
  const t1Run = dal.loadEntity('measurement_run', 'RUN-M08-1-T1-REF');
  assert(t1Run !== null);
  assert.strictEqual(t1Run.status, 'COMPLETED');
  assert.strictEqual(t1Run.is_immutable, true);

  const obs = dal.listObservations();
  assert.strictEqual(obs.length, 60);

  const evd = dal.listEvidence();
  assert.strictEqual(evd.length, 60);

  const prompts = dal.listPrompts();
  assert.strictEqual(prompts.length, 20);
});

// -------------------------------------------------------------
// SECTION 2: NEGATIVE TESTS (P01–P18)
// -------------------------------------------------------------

runTest('P01: Priority Assessment without qualified Opportunity → REJECT', () => {
  assert.throws(() => {
    prio.createPriorityAssessment({
      priority_assessment_id: 'PRIO-TEST-P01',
      opportunity_id: 'OPP-B04-UNQUAL-003', // UNQUALIFIED!
      impact: 'HIGH',
      evidence_strength: 'HIGH',
      feasibility: 'HIGH',
      urgency: 'HIGH',
      dependency: 'NONE',
      strategic_relevance: 'HIGH',
      impact_basis: 'Basis text.',
      evidence_strength_basis: 'Basis text.',
      feasibility_basis: 'Basis text.',
      urgency_basis: 'Basis text.',
      dependency_basis: 'Basis text.',
      strategic_relevance_basis: 'Basis text.'
    }, { isFixture: true });
  }, /GATE_ERROR/);
});

runTest('P02: Priority Assessment referencing nonexistent Opportunity → REJECT', () => {
  assert.throws(() => {
    prio.createPriorityAssessment({
      priority_assessment_id: 'PRIO-TEST-P02',
      opportunity_id: 'OPP-NON-EXISTENT-999',
      impact: 'HIGH',
      evidence_strength: 'HIGH',
      feasibility: 'HIGH',
      urgency: 'HIGH',
      dependency: 'NONE',
      strategic_relevance: 'HIGH',
      impact_basis: 'Basis text.',
      evidence_strength_basis: 'Basis text.',
      feasibility_basis: 'Basis text.',
      urgency_basis: 'Basis text.',
      dependency_basis: 'Basis text.',
      strategic_relevance_basis: 'Basis text.'
    }, { isFixture: true });
  }, /RELATIONSHIP_ERROR/);
});

runTest('P03: Priority Assessment with unsupported category → REJECT', () => {
  assert.throws(() => {
    prio.createPriorityAssessment({
      priority_assessment_id: 'PRIO-TEST-P03',
      opportunity_id: 'OPP-B04-QUAL-001',
      impact: 'ULTRA_HIGH', // Invalid category!
      evidence_strength: 'HIGH',
      feasibility: 'HIGH',
      urgency: 'HIGH',
      dependency: 'NONE',
      strategic_relevance: 'HIGH',
      impact_basis: 'Basis text.',
      evidence_strength_basis: 'Basis text.',
      feasibility_basis: 'Basis text.',
      urgency_basis: 'Basis text.',
      dependency_basis: 'Basis text.',
      strategic_relevance_basis: 'Basis text.'
    }, { isFixture: true });
  }, /INVALID_DIMENSION|SCHEMA_VALIDATION_ERROR/);
});

runTest('P04: Priority Assessment with forbidden numeric score → REJECT', () => {
  assert.throws(() => {
    prio.createPriorityAssessment({
      priority_assessment_id: 'PRIO-TEST-P04',
      opportunity_id: 'OPP-B04-QUAL-001',
      impact: 'HIGH',
      evidence_strength: 'HIGH',
      feasibility: 'HIGH',
      urgency: 'HIGH',
      dependency: 'NONE',
      strategic_relevance: 'HIGH',
      impact_basis: 'Basis text.',
      evidence_strength_basis: 'Basis text.',
      feasibility_basis: 'Basis text.',
      urgency_basis: 'Basis text.',
      dependency_basis: 'Basis text.',
      strategic_relevance_basis: 'Basis text.',
      priority_score: 92.5 // FORBIDDEN!
    }, { isFixture: true });
  }, /GOVERNANCE_ERROR/);
});

runTest('P05: Priority Recommendation without valid assessment → REJECT', () => {
  assert.throws(() => {
    prio.generatePriorityRecommendation(null);
  }, /Assessment data is required/);
});

runTest('P06: AI attempts Founder Decision → REJECT', () => {
  assert.throws(() => {
    prio.createFounderDecision({
      decision_id: 'DEC-TEST-P06',
      opportunity_id: 'OPP-B04-QUAL-001',
      priority_assessment_id: 'PRIO-TEST-001',
      recommendation: 'P0',
      decision: 'APPROVE',
      decision_reason: 'Automated AI approval.',
      decided_by: 'AI_ADVISOR'
    }, { actor_type: 'AI_ADVISOR', isFixture: true });
  }, /PERMISSION_DENIED/);
});

runTest('P07: Founder Decision without valid Opportunity → REJECT', () => {
  assert.throws(() => {
    prio.createFounderDecision({
      decision_id: 'DEC-TEST-P07',
      opportunity_id: 'OPP-NON-EXISTENT-999',
      priority_assessment_id: 'PRIO-TEST-001',
      recommendation: 'P0',
      decision: 'APPROVE',
      decision_reason: 'Reason.',
      decided_by: 'FOUNDER'
    }, { isFixture: true });
  }, /RELATIONSHIP_ERROR/);
});

runTest('P08: Founder Decision without decision value → REJECT', () => {
  assert.throws(() => {
    prio.createFounderDecision({
      decision_id: 'DEC-TEST-P08',
      opportunity_id: 'OPP-B04-QUAL-001',
      priority_assessment_id: 'PRIO-TEST-001',
      recommendation: 'P0',
      decision: '', // Missing!
      decision_reason: 'Reason.',
      decided_by: 'FOUNDER'
    }, { isFixture: true });
  }, /INVALID_DECISION/);
});

runTest('P09: Founder Decision with unsupported decision value → REJECT', () => {
  assert.throws(() => {
    prio.createFounderDecision({
      decision_id: 'DEC-TEST-P09',
      opportunity_id: 'OPP-B04-QUAL-001',
      priority_assessment_id: 'PRIO-TEST-001',
      recommendation: 'P0',
      decision: 'DEPLOY_NOW', // Invalid!
      decision_reason: 'Reason.',
      decided_by: 'FOUNDER'
    }, { isFixture: true });
  }, /INVALID_DECISION/);
});

runTest('P10: Silent automatic recommendation → approval → REJECT', () => {
  // Creating an assessment must NOT create an automatic decision
  const allDecisions = dal.listFounderDecisions({ includeFixtures: true });
  const autoApproved = allDecisions.filter(d => d.priority_assessment_id === 'PRIO-TEST-001' && d.decision === 'APPROVE' && d.decided_by === 'SYSTEM');
  assert.strictEqual(autoApproved.length, 0, 'No automatic approval permitted');
});

runTest('P11: Mutation of immutable Founder Decision → REJECT', () => {
  assert.throws(() => {
    dal.saveEntity('founder_decision', {
      entity_type: 'founder_decision',
      schema_version: '1.0.0',
      decision_id: 'DEC-TEST-006',
      decision_version: '1.0.0',
      opportunity_id: 'OPP-B04-QUAL-001',
      priority_assessment_id: 'PRIO-TEST-005-A',
      recommendation: 'P1',
      decision: 'APPROVE', // Overwrite attempt
      decision_reason: 'Tamper attempt.',
      decided_by: 'MALICIOUS_ACTOR',
      status: 'DECIDED',
      created_at: new Date().toISOString()
    }, { isFixture: true });
  }, /IMMUTABILITY_VIOLATION/);
});

runTest('P12: Mutation of assessment version already used by decision → REJECT', () => {
  // PRIO-TEST-001 is used by DEC-TEST-008
  assert.throws(() => {
    dal.saveEntity('priority_assessment', {
      entity_type: 'priority_assessment',
      schema_version: '1.0.0',
      priority_assessment_id: 'PRIO-TEST-001',
      priority_assessment_version: '1.0.0',
      opportunity_id: 'OPP-B04-QUAL-001',
      impact: 'LOW',
      evidence_strength: 'LOW',
      feasibility: 'LOW',
      urgency: 'LOW',
      dependency: 'NONE',
      strategic_relevance: 'LOW',
      impact_basis: 'Tamper.',
      evidence_strength_basis: 'Tamper.',
      feasibility_basis: 'Tamper.',
      urgency_basis: 'Tamper.',
      dependency_basis: 'Tamper.',
      strategic_relevance_basis: 'Tamper.',
      assessment_scope: 'GLOBAL',
      assessment_status: 'RECOMMENDED',
      created_at: new Date().toISOString(),
      created_by: 'TAMPERER'
    }, { isFixture: true });
  }, /IMMUTABILITY_VIOLATION/);
});

runTest('P13: Broken evidence chain → REJECT', () => {
  const badTrace = prio.traceDecisionEvidenceChain('DEC-NON-EXISTENT-999');
  assert.strictEqual(badTrace.found, false);
  assert.strictEqual(badTrace.is_complete, false);
  assert(badTrace.broken_links.length > 0);
});

runTest('P14: Missing decision reason when overriding recommendation → REJECT', () => {
  assert.throws(() => {
    prio.createFounderDecision({
      decision_id: 'DEC-TEST-P14',
      opportunity_id: 'OPP-B04-QUAL-001',
      priority_assessment_id: 'PRIO-TEST-001',
      recommendation: 'P0',
      decision: 'DEFER', // Override of P0!
      decision_reason: '', // Empty reason!
      decided_by: 'FOUNDER'
    }, { isFixture: true });
  }, /GOVERNANCE_ERROR/);
});

runTest('P15: Composite score field → REJECT', () => {
  assert.throws(() => {
    prio.createPriorityAssessment({
      priority_assessment_id: 'PRIO-TEST-P15',
      opportunity_id: 'OPP-B04-QUAL-001',
      impact: 'HIGH',
      evidence_strength: 'HIGH',
      feasibility: 'HIGH',
      urgency: 'HIGH',
      dependency: 'NONE',
      strategic_relevance: 'HIGH',
      impact_basis: 'Basis text.',
      evidence_strength_basis: 'Basis text.',
      feasibility_basis: 'Basis text.',
      urgency_basis: 'Basis text.',
      dependency_basis: 'Basis text.',
      strategic_relevance_basis: 'Basis text.',
      composite_score: 88.4 // Strictly forbidden!
    }, { isFixture: true });
  }, /GOVERNANCE_ERROR/);
});

runTest('P16: Hidden ranking field → REJECT', () => {
  assert.throws(() => {
    prio.createPriorityAssessment({
      priority_assessment_id: 'PRIO-TEST-P16',
      opportunity_id: 'OPP-B04-QUAL-001',
      impact: 'HIGH',
      evidence_strength: 'HIGH',
      feasibility: 'HIGH',
      urgency: 'HIGH',
      dependency: 'NONE',
      strategic_relevance: 'HIGH',
      impact_basis: 'Basis text.',
      evidence_strength_basis: 'Basis text.',
      feasibility_basis: 'Basis text.',
      urgency_basis: 'Basis text.',
      dependency_basis: 'Basis text.',
      strategic_relevance_basis: 'Basis text.',
      rank: 1 // Strictly forbidden!
    }, { isFixture: true });
  }, /GOVERNANCE_ERROR/);
});

runTest('P17: AI attempts priority override as Founder → REJECT', () => {
  assert.throws(() => {
    prio.createFounderDecision({
      decision_id: 'DEC-TEST-P17',
      opportunity_id: 'OPP-B04-QUAL-001',
      priority_assessment_id: 'PRIO-TEST-001',
      recommendation: 'P0',
      decision: 'APPROVE',
      decision_reason: 'AI masquerading as Founder.',
      decided_by: 'FOUNDER'
    }, { actor_type: 'AI_ADVISOR', isFixture: true });
  }, /PERMISSION_DENIED/);
});

runTest('P18: Founder Decision version overwritten → REJECT', () => {
  assert.throws(() => {
    dal.saveEntity('founder_decision', {
      entity_type: 'founder_decision',
      schema_version: '1.0.0',
      decision_id: 'DEC-TEST-008',
      decision_version: '1.0.0', // Overwrite existing DEC-TEST-008 version 1.0.0
      opportunity_id: 'OPP-B04-QUAL-001',
      priority_assessment_id: 'PRIO-TEST-001',
      recommendation: 'P0',
      decision: 'APPROVE',
      decision_reason: 'Attempting to overwrite decision v1.',
      decided_by: 'FOUNDER',
      status: 'DECIDED',
      created_at: new Date().toISOString()
    }, { isFixture: true });
  }, /IMMUTABILITY_VIOLATION/);
});

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------

console.log('------------------------------------------------------------');
console.log(`TOTAL PRIORITIZATION TESTS : ${totalTests}`);
console.log(`PASSED TESTS               : ${passedTests} ✓`);
console.log(`FAILED TESTS               : ${failedTests} ✗`);
console.log('------------------------------------------------------------\n');

if (failedTests > 0) {
  console.error(`[FAIL] ${failedTests} test(s) failed.`);
  process.exit(1);
} else {
  console.log('[SUCCESS] All M08.2 Prioritization & Founder Decision tests passed cleanly!\n');
}
