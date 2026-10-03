/**
 * LOCATRIA Visibility Operating System v1.0
 * Source Registration Script (BUILD-02)
 *
 * Registers authoritative Level 1–Level 6 historical and measurement sources into visibility-data/sources/
 * with deterministic SHA-256 content hashing.
 */

'use strict';

const path = require('path');
const ingestion = require('../js/visibility-ingestion/index');

const sourcesToRegister = [
  {
    source_id: 'SRC-M08-1-T1-CHATGPT-RAW',
    source_name: 'ChatGPT T1 Raw Model Response Export',
    source_type: 'RAW_MODEL_RESPONSE_EXPORT',
    source_path: '../21 Affiliate Program/Module 08/ChatGPT V1.txt',
    source_level: 'S2',
    source_role: 'T1_CONTROL_SOURCE',
    source_format: 'TXT',
    status: 'ACTIVE',
    notes: 'Primary Level 1 raw model responses for 20 prompts in ChatGPT T1 Reference Run'
  },
  {
    source_id: 'SRC-M08-1-T1-GEMINI-RAW',
    source_name: 'Gemini T1 Raw Model Response Export',
    source_type: 'RAW_MODEL_RESPONSE_EXPORT',
    source_path: '../21 Affiliate Program/Module 08/Gemini V1.txt',
    source_level: 'S2',
    source_role: 'T1_CONTROL_SOURCE',
    source_format: 'TXT',
    status: 'ACTIVE',
    notes: 'Primary Level 1 raw model responses for 20 prompts in Gemini T1 Reference Run'
  },
  {
    source_id: 'SRC-M08-1-T1-PERPLEXITY-RAW',
    source_name: 'Perplexity T1 Raw Model Response Export',
    source_type: 'RAW_MODEL_RESPONSE_EXPORT',
    source_path: '../21 Affiliate Program/Module 08/Perplexity V1.txt',
    source_level: 'S2',
    source_role: 'T1_CONTROL_SOURCE',
    source_format: 'TXT',
    status: 'ACTIVE',
    notes: 'Primary Level 1 raw model responses for 20 prompts in Perplexity T1 Reference Run'
  },
  {
    source_id: 'SRC-M08-1-T1-CHATGPT-RUNNER',
    source_name: 'ChatGPT T1 Prompt Execution Runner',
    source_type: 'RAW_PROMPT_EXECUTION_LOG',
    source_path: '../21 Affiliate Program/Module 08/20 prompt run chatGPT.txt',
    source_level: 'S1',
    source_role: 'T1_CONTROL_SOURCE',
    source_format: 'TXT',
    status: 'ACTIVE',
    notes: 'Primary Level 1 executed prompts for ChatGPT in T1 Reference Run'
  },
  {
    source_id: 'SRC-M08-1-T1-GEMINI-RUNNER',
    source_name: 'Gemini T1 Prompt Execution Runner',
    source_type: 'RAW_PROMPT_EXECUTION_LOG',
    source_path: '../21 Affiliate Program/Module 08/20 prompt run chat gemini.txt',
    source_level: 'S1',
    source_role: 'T1_CONTROL_SOURCE',
    source_format: 'TXT',
    status: 'ACTIVE',
    notes: 'Primary Level 1 executed prompts for Gemini in T1 Reference Run'
  },
  {
    source_id: 'SRC-M08-1-T1-PERPLEXITY-RUNNER',
    source_name: 'Perplexity T1 Prompt Execution Runner',
    source_type: 'RAW_PROMPT_EXECUTION_LOG',
    source_path: '../21 Affiliate Program/Module 08/20 prompt run chat Perplexity.txt',
    source_level: 'S1',
    source_role: 'T1_CONTROL_SOURCE',
    source_format: 'TXT',
    status: 'ACTIVE',
    notes: 'Primary Level 1 executed prompts for Perplexity in T1 Reference Run'
  },
  {
    source_id: 'SRC-M08-1-T1-QA-AUDIT',
    source_name: 'M08.1.5 T1 Dataset QA Evidence Audit Workbook',
    source_type: 'QA_EVIDENCE_DATASET',
    source_path: '../21 Affiliate Program/Module 08/M08_1_5_T1_Dataset_QA_Evidence_Audit_v1_0.xlsx',
    source_level: 'S3',
    source_role: 'QA_AUDIT_BASELINE',
    source_format: 'XLSX',
    status: 'ACTIVE',
    notes: 'Authoritative Level 2 QA audit containing audited Sheet 01_T1_DATASET_AUDIT'
  },
  {
    source_id: 'SRC-M08-1-T1-MEASUREMENT',
    source_name: 'M08.1.5 Measurement Dataset Workbook',
    source_type: 'MEASUREMENT_DATASET',
    source_path: '../21 Affiliate Program/Module 08/M08_1_5_Measurement_Dataset_v1_0.xlsx',
    source_level: 'S4',
    source_role: 'QA_AUDIT_BASELINE',
    source_format: 'XLSX',
    status: 'ACTIVE',
    notes: 'Authoritative Level 2 measurement dataset containing Sheet 01_OBSERVATIONS'
  },
  {
    source_id: 'SRC-M08-1-T2-CHATGPT-RUNNER',
    source_name: 'ChatGPT T2 Measurement Runner Prompt v1.0',
    source_type: 'PROTOCOL_SPECIFICATION',
    source_path: '../21 Affiliate Program/Module 08/CHATGPT MEASUREMENT RUNNER PROMPT v1.0.txt',
    source_level: 'S5',
    source_role: 'PROTOCOL_RUNNER',
    source_format: 'TXT',
    status: 'ACTIVE',
    notes: 'M08.1.7-T2.2 runner prompt specification for ChatGPT T2 intervention run'
  },
  {
    source_id: 'SRC-M08-1-T2-CHATGPT-RAW',
    source_name: 'ChatGPT T2 Raw Observation Dataset',
    source_type: 'RAW_MODEL_RESPONSE_EXPORT',
    source_path: '../21 Affiliate Program/Module 08/ChatGPT V3.txt',
    source_level: 'S6',
    source_role: 'T2_INTERVENTION_SOURCE',
    source_format: 'TXT',
    status: 'ACTIVE',
    notes: 'Level 1 raw model responses captured for T2 intervention'
  }
];

console.log('============================================================');
console.log('LOCATRIA VISIBILITY OPERATING SYSTEM — SOURCE REGISTRATION');
console.log('M08.2 BUILD-02 — Registering Authoritative Evidence Sources');
console.log('============================================================\n');

let registeredCount = 0;
for (const s of sourcesToRegister) {
  try {
    const reg = ingestion.registerSource(s, { actor: 'FOUNDER' });
    console.log(`  [PASS] ${reg.source_id} (${reg.source_level}) -> SHA-256: ${reg.source_hash.substring(0, 16)}...`);
    registeredCount++;
  } catch (err) {
    console.error(`  [FAIL] ${s.source_id}: ${err.message}`);
  }
}

console.log(`\nSuccessfully registered ${registeredCount}/${sourcesToRegister.length} sources.`);
