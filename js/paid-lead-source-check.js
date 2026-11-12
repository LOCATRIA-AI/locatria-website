/**
 * LOCATRIA PAID LEAD SOURCE CHECK — DECISION ENGINE & CLIENT-SIDE CONTROLLER v1.0
 * Based on Paid_Lead_Pulse_Check_v3.xlsx and Website Requirements Specification
 *
 * Privacy Invariant:
 * 100% Client-Side In-Memory Execution.
 * Never transmits user inputs, counts, spend, or source names to GA4 or servers.
 */

(function (root, factory) {
  'use strict';
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.PaidLeadPulseCheck = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // --- Controlled Currency Definitions ---
  const CURRENCIES = {
    USD: { code: 'USD', symbol: '$', label: 'USD ($)' },
    EUR: { code: 'EUR', symbol: '€', label: 'EUR (€)' },
    GBP: { code: 'GBP', symbol: '£', label: 'GBP (£)' },
    CAD: { code: 'CAD', symbol: 'C$', label: 'CAD (C$)' },
    AUD: { code: 'AUD', symbol: 'A$', label: 'AUD (A$)' },
    NZD: { code: 'NZD', symbol: 'NZ$', label: 'NZD (NZ$)' },
    CHF: { code: 'CHF', symbol: 'Fr', label: 'CHF (Fr)' },
    SGD: { code: 'SGD', symbol: 'S$', label: 'SGD (S$)' },
    VND: { code: 'VND', symbol: '₫', label: 'VND (₫)' }
  };

  // --- Calendar Date Helpers (UTC-safe, zero timezone off-by-one) ---
  function parseDateUTC(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const parts = dateStr.trim().split('-');
    if (parts.length !== 3) return null;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    return new Date(Date.UTC(year, month - 1, day));
  }

  function formatISODate(d) {
    if (!(d instanceof Date) || isNaN(d.getTime())) return '';
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function daysDifference(startDate, endDate) {
    if (!startDate || !endDate) return null;
    const msPerDay = 86400000;
    return Math.round((endDate.getTime() - startDate.getTime()) / msPerDay);
  }

  function formatHumanRange(startStr, endStr) {
    const s = parseDateUTC(startStr);
    const e = parseDateUTC(endStr);
    if (!s || !e) return '—';

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const sDay = s.getUTCDate();
    const sMonth = months[s.getUTCMonth()];
    const sYear = s.getUTCFullYear();

    const eDay = e.getUTCDate();
    const eMonth = months[e.getUTCMonth()];
    const eYear = e.getUTCFullYear();

    if (sYear === eYear) {
      if (sMonth === eMonth) {
        return `${sDay} – ${eDay} ${sMonth} ${sYear}`;
      }
      return `${sDay} ${sMonth} – ${eDay} ${eMonth} ${sYear}`;
    }
    return `${sDay} ${sMonth} ${sYear} – ${eDay} ${eMonth} ${eYear}`;
  }

  function formatHumanDate(dateStr) {
    const d = parseDateUTC(dateStr);
    if (!d) return '—';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  }

  function computePeriodDates(reviewDateStr, preset) {
    const r = parseDateUTC(reviewDateStr);
    if (!r) return { start: '', end: '', valid: false };

    const y = r.getUTCFullYear();
    const m = r.getUTCMonth(); // 0-based
    const d = r.getUTCDate();

    let sDate, eDate;

    switch (preset) {
      case 'last-30': {
        // Last 30 days includes review date and previous 29 days
        eDate = new Date(Date.UTC(y, m, d));
        sDate = new Date(Date.UTC(y, m, d - 29));
        break;
      }
      case 'last-60': {
        eDate = new Date(Date.UTC(y, m, d));
        sDate = new Date(Date.UTC(y, m, d - 59));
        break;
      }
      case 'last-90': {
        eDate = new Date(Date.UTC(y, m, d));
        sDate = new Date(Date.UTC(y, m, d - 89));
        break;
      }
      case 'this-month': {
        // 1st of current review month to current review date
        sDate = new Date(Date.UTC(y, m, 1));
        eDate = new Date(Date.UTC(y, m, d));
        break;
      }
      case 'last-month': {
        // 1st of previous calendar month to last day of previous calendar month
        sDate = new Date(Date.UTC(y, m - 1, 1));
        eDate = new Date(Date.UTC(y, m, 0)); // Day 0 of current month = last day of previous month
        break;
      }
      case 'last-3-months': {
        // The three complete calendar months before review month
        sDate = new Date(Date.UTC(y, m - 3, 1));
        eDate = new Date(Date.UTC(y, m, 0));
        break;
      }
      case 'custom':
      default:
        return { start: '', end: '', valid: false, custom: true };
    }

    return {
      start: formatISODate(sDate),
      end: formatISODate(eDate),
      valid: true,
      custom: false
    };
  }

  // --- Parser & Normalizer ---
  function parseNullableInt(val) {
    if (val === null || val === undefined || String(val).trim() === '') return null;
    const n = Number(val);
    if (!Number.isInteger(n) || n < 0) return NaN;
    return n;
  }

  function parseNullableFloat(val) {
    if (val === null || val === undefined || String(val).trim() === '') return null;
    const n = Number(val);
    if (isNaN(n) || n < 0) return NaN;
    return n;
  }

  function parseRate(val) {
    if (val === null || val === undefined || String(val).trim() === '') return null;
    let n = Number(val);
    if (isNaN(n)) return NaN;
    // Normalize percentages: if entered > 1, assume 0-100% scale
    if (n > 1) n = n / 100;
    if (n < 0 || n > 1) return NaN;
    return n;
  }

  // --- 13-Stage Decision Hierarchy ---
  function evaluateLeadSource(input) {
    const validationErrors = {};
    const missingFields = {};

    // 1. Source & Currency
    const sourceName = (input.sourceName || '').trim();
    if (!sourceName) {
      missingFields.sourceName = 'Source name is required.';
    }

    const currencyKey = input.currency && CURRENCIES[input.currency] ? input.currency : 'USD';
    const currencyDef = CURRENCIES[currencyKey];

    // Spend (optional)
    const spend = parseNullableFloat(input.spend);
    if (spend === NaN) {
      validationErrors.spend = 'Total spent must be a non-negative amount.';
    }

    // Review Date
    const reviewDateStr = (input.reviewDate || '').trim();
    const reviewDate = parseDateUTC(reviewDateStr);
    if (!reviewDateStr) {
      missingFields.reviewDate = 'Review date is required.';
    } else if (!reviewDate) {
      validationErrors.reviewDate = 'Review date must be a valid calendar date (YYYY-MM-DD).';
    }

    // Period selection
    const preset = input.periodPreset || 'last-30';
    let periodStartStr = '';
    let periodEndStr = '';

    if (preset === 'custom') {
      periodStartStr = (input.customStart || '').trim();
      periodEndStr = (input.customEnd || '').trim();
    } else if (reviewDate) {
      const computed = computePeriodDates(reviewDateStr, preset);
      periodStartStr = computed.start;
      periodEndStr = computed.end;
    }

    const periodStart = parseDateUTC(periodStartStr);
    const periodEnd = parseDateUTC(periodEndStr);

    if (!periodStartStr) {
      missingFields.periodStart = 'Period start date is required.';
    } else if (!periodStart) {
      validationErrors.periodStart = 'Period start date is invalid.';
    }

    if (!periodEndStr) {
      missingFields.periodEnd = 'Period end date is required.';
    } else if (!periodEnd) {
      validationErrors.periodEnd = 'Period end date is invalid.';
    }

    // Date sequencing validation
    if (periodStart && periodEnd) {
      if (periodStart.getTime() > periodEnd.getTime()) {
        validationErrors.periodSequence = 'Period start date cannot be after period end date.';
      }
    }
    if (periodEnd && reviewDate) {
      if (periodEnd.getTime() > reviewDate.getTime()) {
        validationErrors.reviewSequence = 'Period end date cannot be later than the review date.';
      }
    }

    // 2. Targets & Timing
    const daysToAppt = parseNullableInt(input.daysToAppt);
    const daysToSign = parseNullableInt(input.daysToSign);
    const minInquiries = parseNullableInt(input.minInquiries);
    const targetInqToConv = parseRate(input.targetInqToConv);
    const targetConvToAppt = parseRate(input.targetConvToAppt);
    const maxCostTarget = parseNullableFloat(input.maxCostTarget);

    if (daysToAppt === NaN) validationErrors.daysToAppt = 'Days to appointment must be a non-negative integer.';
    else if (daysToAppt === null) missingFields.daysToAppt = 'Days to appointment is required.';

    if (daysToSign === NaN) validationErrors.daysToSign = 'Days to signed client must be a non-negative integer.';
    else if (daysToSign === null) missingFields.daysToSign = 'Days to signed client is required.';

    if (minInquiries === NaN || (minInquiries !== null && minInquiries < 1)) {
      validationErrors.minInquiries = 'Fewest inquiries before judging must be at least 1.';
    } else if (minInquiries === null) {
      missingFields.minInquiries = 'Minimum inquiries target is required.';
    }

    if (targetInqToConv === NaN) validationErrors.targetInqToConv = 'Target inquiry-to-conversation rate must be between 0% and 100%.';
    else if (targetInqToConv === null) missingFields.targetInqToConv = 'Target inquiry-to-conversation rate is required.';

    if (targetConvToAppt === NaN) validationErrors.targetConvToAppt = 'Target conversation-to-appointment rate must be between 0% and 100%.';
    else if (targetConvToAppt === null) missingFields.targetConvToAppt = 'Target conversation-to-appointment rate is required.';

    if (maxCostTarget === NaN) validationErrors.maxCostTarget = 'Max cost per signed client must be a non-negative number.';

    // 3. Outcomes
    const inquiries = parseNullableInt(input.inquiries);
    const conversations = parseNullableInt(input.conversations);
    const appointments = parseNullableInt(input.appointments);
    const signed = parseNullableInt(input.signed);
    const closed = parseNullableInt(input.closed);
    const active = parseNullableInt(input.active);

    if (inquiries === NaN) validationErrors.inquiries = 'Inquiries must be a non-negative integer.';
    else if (inquiries === null) missingFields.inquiries = 'Inquiries received is required.';

    if (conversations === NaN) validationErrors.conversations = 'Conversations must be a non-negative integer.';
    else if (conversations === null) missingFields.conversations = 'Two-way conversations is required.';

    if (appointments === NaN) validationErrors.appointments = 'Appointments held must be a non-negative integer.';
    else if (appointments === null) missingFields.appointments = 'Appointments held is required.';

    if (signed === NaN) validationErrors.signed = 'Clients signed must be a non-negative integer (enter 0 if none).';
    if (closed === NaN) validationErrors.closed = 'Transactions closed must be a non-negative integer.';
    if (active === NaN) validationErrors.active = 'Still active leads must be a non-negative integer.';

    // Impossible sequence checks (when counts are present)
    if (inquiries !== null && conversations !== null && conversations > inquiries) {
      validationErrors.seqInqConv = 'Two-way conversations cannot exceed inquiries received.';
    }
    if (conversations !== null && appointments !== null && appointments > conversations) {
      validationErrors.seqConvAppt = 'Appointments held cannot exceed two-way conversations.';
    }
    if (appointments !== null && signed !== null && signed > appointments) {
      validationErrors.seqApptSign = 'Clients signed cannot exceed appointments held.';
    }
    if (signed !== null && closed !== null && closed > signed) {
      validationErrors.seqSignClose = 'Closed transactions cannot exceed signed clients.';
    }

    // Combine for highlighting
    const fieldErrors = Object.assign({}, missingFields, validationErrors);

    // Lead Age Range Calculation
    let oldestLeadAge = null;
    let newestLeadAge = null;
    let leadAgeDisplay = '—';
    const datesAreValid = periodStart && periodEnd && reviewDate &&
      periodStart.getTime() <= periodEnd.getTime() &&
      periodEnd.getTime() <= reviewDate.getTime();

    if (datesAreValid && sourceName.length > 0) {
      oldestLeadAge = daysDifference(periodStart, reviewDate);
      newestLeadAge = daysDifference(periodEnd, reviewDate);
      leadAgeDisplay = `${newestLeadAge}–${oldestLeadAge} days`;
    }

    // Calculated Conversion Rates
    const inqToConvRate = (inquiries !== null && inquiries > 0 && conversations !== null)
      ? (conversations / inquiries) : null;
    const convToApptRate = (conversations !== null && conversations > 0 && appointments !== null)
      ? (appointments / conversations) : null;
    const apptToSignedRate = (appointments !== null && appointments > 0 && signed !== null)
      ? (signed / appointments) : null;

    // Calculated Cost Metrics
    const costPerInquiry = (spend !== null && inquiries !== null && inquiries > 0)
      ? (spend / inquiries) : null;
    const costPerAppt = (spend !== null && appointments !== null && appointments > 0)
      ? (spend / appointments) : null;
    const costPerSigned = (spend !== null && signed !== null && signed > 0)
      ? (spend / signed) : null;
    const costPerClosed = (spend !== null && closed !== null && closed > 0)
      ? (spend / closed) : null;

    // --- Decision Tree Evaluation ---
    let statusCode = 'INCOMPLETE';
    let statusTitle = 'Not enough information yet';
    let statusReason = 'Some required fields (marked *) are still empty.';
    let nextStep = 'Fill in the fields marked * in steps ①, ②, and ③.';
    let badgeClass = 'status-card-incomplete';

    const hasValidationErrors = Object.keys(validationErrors).length > 0;
    const hasCoreSource = sourceName.length > 0 && datesAreValid;
    const hasCoreTargets = daysToAppt !== null && daysToSign !== null &&
      minInquiries !== null && targetInqToConv !== null && targetConvToAppt !== null;
    const hasEarlyCounts = inquiries !== null && conversations !== null && appointments !== null;

    // RULE 2: Check your numbers (Critical Data Check)
    if (hasValidationErrors) {
      statusCode = 'CHECK';
      statusTitle = 'Check your numbers';
      const firstError = Object.values(validationErrors)[0];
      statusReason = `Some numbers or dates don't add up: ${firstError}`;
      nextStep = 'Fix the counts or dates indicated, then review again.';
      badgeClass = 'status-card-check';
    }
    // RULE 1: Not enough information yet (Source, Dates, or overall empty state)
    else if (!hasCoreSource || (!hasCoreTargets && !hasEarlyCounts)) {
      statusCode = 'INCOMPLETE';
      statusTitle = 'Not enough information yet';
      statusReason = 'Some required fields (marked *) are still empty.';
      nextStep = 'Fill in the fields marked * in steps ①, ②, and ③.';
      badgeClass = 'status-card-incomplete';
    }
    // RULE 3: Add your timing & targets (Source & outcomes exist, but targets missing)
    else if (!hasCoreTargets) {
      statusCode = 'TARGETS';
      statusTitle = 'Add your timing & targets';
      statusReason = 'The tool needs your own timing and targets before it can evaluate this source.';
      nextStep = 'Fill in step ② using your own experience or market. There is no universal benchmark.';
      badgeClass = 'status-card-incomplete';
    }
    // RULE 1 continued: Missing core counts (inquiries, conversations, or appointments)
    else if (!hasEarlyCounts) {
      statusCode = 'INCOMPLETE';
      statusTitle = 'Not enough information yet';
      statusReason = 'Inquiries, conversations, and appointments held are needed to evaluate the funnel.';
      nextStep = 'Enter your stage counts in step ③. Enter 0 if none occurred.';
      badgeClass = 'status-card-incomplete';
    }
    // RULE 4: Too early to judge — volume
    else if (inquiries < minInquiries) {
      statusCode = 'EARLY_VOLUME';
      statusTitle = 'Too early to judge — volume';
      statusReason = `There are ${inquiries} inquiries, which is below your minimum threshold of ${minInquiries}.`;
      nextStep = 'Keep collecting leads within your budget before making a final judgment.';
      badgeClass = 'status-card-info';
    }
    // RULE 5: Too early to judge — timing
    else if (oldestLeadAge !== null && oldestLeadAge < daysToAppt) {
      statusCode = 'EARLY_TIME';
      statusTitle = 'Too early to judge — timing';
      statusReason = `Even your oldest leads (${oldestLeadAge} days) have had less time than you usually need for a first appointment (${daysToAppt} days).`;
      nextStep = 'Keep following up through your usual contact cycle and review again later.';
      badgeClass = 'status-card-info';
    }
    // RULE 6: Review your follow-up first
    else if (inqToConvRate !== null && inqToConvRate < targetInqToConv) {
      statusCode = 'FOLLOWUP';
      statusTitle = 'Review your follow-up first';
      const actualPct = (inqToConvRate * 100).toFixed(1);
      const targetPct = (targetInqToConv * 100).toFixed(0);
      statusReason = `Only ${actualPct}% of inquiries became two-way conversations (your target is ${targetPct}%).`;
      nextStep = 'Review response speed, number of contact attempts, and communication channels before judging the lead source.';
      badgeClass = 'status-card-amber';
    }
    // RULE 7: Review lead fit & first conversations
    else if (convToApptRate !== null && convToApptRate < targetConvToAppt) {
      statusCode = 'FIT';
      statusTitle = 'Review lead fit & first conversations';
      const actualPct = (convToApptRate * 100).toFixed(1);
      const targetPct = (targetConvToAppt * 100).toFixed(0);
      statusReason = `Conversations are happening, but only ${actualPct}% became held appointments (your target is ${targetPct}%).`;
      nextStep = 'Check whether these leads match the clients you serve, and review how your first conversations are structured.';
      badgeClass = 'status-card-amber';
    }
    // RULE 8: Add clients signed (distinct from 0!)
    else if (signed === null) {
      statusCode = 'NEED_SIGNED';
      statusTitle = 'Add clients signed';
      statusReason = 'Early funnel steps meet your targets. To evaluate further, enter the number of clients signed.';
      nextStep = 'Enter clients signed in step ③. Enter 0 if none have signed yet.';
      badgeClass = 'status-card-incomplete';
    }
    // RULE 9: Promising, still maturing (signed === 0, but newest leads haven't matured)
    else if (signed === 0 && newestLeadAge !== null && newestLeadAge < daysToSign) {
      statusCode = 'MATURING';
      statusTitle = 'Promising, still maturing';
      statusReason = `Early funnel steps meet your targets. Your newest leads are ${newestLeadAge} days old, while you usually need ${daysToSign} days for a client to sign.`;
      nextStep = 'Keep the test within budget and review again as leads progress through appointments.';
      badgeClass = 'status-card-info';
    }
    // RULE 10: Review before spending more (signed === 0, and all leads reached signing window)
    else if (signed === 0 && newestLeadAge !== null && newestLeadAge >= daysToSign) {
      statusCode = 'NO_CLIENTS';
      statusTitle = 'Review before spending more';
      statusReason = `Early steps meet your targets, but no clients have signed after ${newestLeadAge} days (your usual window is ${daysToSign} days).`;
      nextStep = 'Examine what happens during and after appointments before maintaining or increasing your spend.';
      badgeClass = 'status-card-amber';
    }
    // RULE 11: Add spend to assess cost per signed client (signed >= 1, but spend missing)
    else if (signed > 0 && spend === null) {
      statusCode = 'NEED_SPEND';
      statusTitle = 'Add spend to assess cost';
      statusReason = `This source produced ${signed} signed client${signed > 1 ? 's' : ''}, but total spend is not entered.`;
      nextStep = 'Enter total spend in step ① to evaluate cost per signed client.';
      badgeClass = 'status-card-amber';
    }
    // RULE 12: Clients signed: add a cost target (signed >= 1, spend known, maxCostTarget missing)
    else if (signed > 0 && spend !== null && maxCostTarget === null) {
      statusCode = 'CLIENTS_NOTARGET';
      statusTitle = 'Clients signed: add a cost target';
      const costStr = formatCurrency(costPerSigned, currencyDef);
      statusReason = `This source produced ${signed} signed client${signed > 1 ? 's' : ''} at ${costStr} per client.`;
      nextStep = 'Add an optional maximum cost per signed client in step ② to compare with your budget.';
      badgeClass = 'status-card-incomplete';
    }
    // RULE 13A: Worth continuing (cost <= maxCostTarget)
    else if (signed > 0 && spend !== null && maxCostTarget !== null && costPerSigned !== null && costPerSigned <= maxCostTarget) {
      statusCode = 'WITHIN';
      statusTitle = 'Worth continuing';
      const costStr = formatCurrency(costPerSigned, currencyDef);
      const targetStr = formatCurrency(maxCostTarget, currencyDef);
      statusReason = `Cost per signed client (${costStr}) is within your ceiling of ${targetStr}.`;
      nextStep = 'Keep going and keep reviewing as new cohorts arrive. Note that costs alone are not proof of profit.';
      badgeClass = 'status-card-emerald';
    }
    // RULE 13B: Above your cost target (cost > maxCostTarget)
    else if (signed > 0 && spend !== null && maxCostTarget !== null && costPerSigned !== null && costPerSigned > maxCostTarget) {
      statusCode = 'OVER';
      statusTitle = 'Above your cost target';
      const costStr = formatCurrency(costPerSigned, currencyDef);
      const targetStr = formatCurrency(maxCostTarget, currencyDef);
      statusReason = `Clients have signed, but cost per client (${costStr}) is higher than your ceiling of ${targetStr}.`;
      nextStep = 'Review spend, lead fit, and follow-up efficiency before continuing at the same budget.';
      badgeClass = 'status-card-amber';
    }

    return {
      statusCode,
      statusTitle,
      statusReason,
      nextStep,
      badgeClass,
      fieldErrors,
      datesAreValid,
      period: {
        preset,
        startStr: periodStartStr,
        endStr: periodEndStr,
        formattedRange: formatHumanRange(periodStartStr, periodEndStr),
        oldestLeadAge,
        newestLeadAge,
        leadAgeDisplay
      },
      metrics: {
        inqToConvRate,
        convToApptRate,
        apptToSignedRate,
        costPerInquiry,
        costPerAppt,
        costPerSigned,
        costPerClosed
      },
      targetsCheck: {
        inqToConv: targetInqToConv !== null && inqToConvRate !== null
          ? (inqToConvRate >= targetInqToConv ? 'on-target' : 'below-target') : 'neutral',
        convToAppt: targetConvToAppt !== null && convToApptRate !== null
          ? (convToApptRate >= targetConvToAppt ? 'on-target' : 'below-target') : 'neutral',
        costPerSigned: maxCostTarget !== null && costPerSigned !== null
          ? (costPerSigned <= maxCostTarget ? 'on-target' : 'below-target') : 'neutral'
      },
      currency: currencyDef
    };
  }

  function formatCurrency(amount, currencyDef) {
    if (amount === null || amount === undefined || isNaN(amount)) return '—';
    const c = currencyDef || CURRENCIES.USD;
    const rounded = Math.round(amount);
    const formattedNum = rounded.toLocaleString('en-US');
    return `${c.symbol}${formattedNum}`;
  }

  function formatPercent(rate) {
    if (rate === null || rate === undefined || isNaN(rate)) return '—';
    return (rate * 100).toFixed(1) + '%';
  }

  // --- Browser Controller (DOM Layer) ---
  function initBrowserController() {
    if (typeof document === 'undefined') return;

    // Elements
    const form = document.getElementById('single-source-form');
    if (!form) return;

    // Inputs
    const sourceNameEl = document.getElementById('source-name');
    const currencyEl = document.getElementById('currency-select');
    const spendEl = document.getElementById('total-spend');
    const reviewDateEl = document.getElementById('review-date');
    const customDatesBox = document.getElementById('custom-dates-box');
    const customStartEl = document.getElementById('custom-start-date');
    const customEndEl = document.getElementById('custom-end-date');
    const periodDisplayEl = document.getElementById('period-used-display');

    const daysToApptEl = document.getElementById('days-to-appt');
    const daysToSignEl = document.getElementById('days-to-sign');
    const minInquiriesEl = document.getElementById('min-inquiries');
    const targetInqConvEl = document.getElementById('target-inq-conv');
    const targetConvApptEl = document.getElementById('target-conv-appt');
    const maxCostTargetEl = document.getElementById('max-cost-target');

    const inqEl = document.getElementById('count-inquiries');
    const convEl = document.getElementById('count-conversations');
    const apptEl = document.getElementById('count-appointments');
    const signEl = document.getElementById('count-signed');
    const closeEl = document.getElementById('count-closed');
    const activeEl = document.getElementById('count-active');

    let lastSingleResult = null;
    let lastSingleCurrency = null;

    // Display elements
    const statusCard = document.getElementById('status-decision-card');
    const statusPill = document.getElementById('status-badge-pill');
    const statusTitleEl = document.getElementById('status-decision-title');
    const statusReasonEl = document.getElementById('status-decision-reason');
    const actionTextEl = document.getElementById('status-action-text');

    const kpiCostInqEl = document.getElementById('kpi-cost-inquiry');
    const kpiCostApptEl = document.getElementById('kpi-cost-appointment');
    const kpiCostSignEl = document.getElementById('kpi-cost-signed');
    const kpiLeadAgeEl = document.getElementById('kpi-lead-age');

    const tableInqConvActual = document.getElementById('table-inq-conv-actual');
    const tableInqConvTarget = document.getElementById('table-inq-conv-target');
    const tableInqConvBadge = document.getElementById('table-inq-conv-badge');

    const tableConvApptActual = document.getElementById('table-conv-appt-actual');
    const tableConvApptTarget = document.getElementById('table-conv-appt-target');
    const tableConvApptBadge = document.getElementById('table-conv-appt-badge');

    const tableApptSignActual = document.getElementById('table-appt-sign-actual');

    const funnelBarInq = document.getElementById('funnel-bar-inquiries');
    const funnelBarConv = document.getElementById('funnel-bar-conversations');
    const funnelBarAppt = document.getElementById('funnel-bar-appointments');
    const funnelBarSign = document.getElementById('funnel-bar-signed');
    const funnelBarClose = document.getElementById('funnel-bar-closed');

    const funnelCountInq = document.getElementById('funnel-count-inquiries');
    const funnelCountConv = document.getElementById('funnel-count-conversations');
    const funnelCountAppt = document.getElementById('funnel-count-appointments');
    const funnelCountSign = document.getElementById('funnel-count-signed');
    const funnelCountClose = document.getElementById('funnel-count-closed');

    let currentPreset = 'last-30';

    // Preset Buttons
    const presetButtons = document.querySelectorAll('.preset-chip-btn');
    presetButtons.forEach(btn => {
      btn.addEventListener('click', function () {
        presetButtons.forEach(b => b.classList.remove('is-active'));
        this.classList.add('is-active');
        currentPreset = this.getAttribute('data-preset');

        if (currentPreset === 'custom') {
          customDatesBox.classList.add('is-active');
        } else {
          customDatesBox.classList.remove('is-active');
        }
        recalculate();
      });
    });

    // Populate default review date to today's local date if empty
    if (!reviewDateEl.value) {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      reviewDateEl.value = `${y}-${m}-${d}`;
    }

    function gatherSingleInputs() {
      return {
        sourceName: sourceNameEl.value,
        currency: currencyEl.value,
        spend: spendEl.value,
        reviewDate: reviewDateEl.value,
        periodPreset: currentPreset,
        customStart: customStartEl.value,
        customEnd: customEndEl.value,

        daysToAppt: daysToApptEl.value,
        daysToSign: daysToSignEl.value,
        minInquiries: minInquiriesEl.value,
        targetInqToConv: targetInqConvEl.value,
        targetConvToAppt: targetConvApptEl.value,
        maxCostTarget: maxCostTargetEl.value,

        inquiries: inqEl.value,
        conversations: convEl.value,
        appointments: apptEl.value,
        signed: signEl.value,
        closed: closeEl.value,
        active: activeEl.value
      };
    }

    function recalculate() {
      const inputs = gatherSingleInputs();
      const result = evaluateLeadSource(inputs);
      const curr = result.currency;

      // 1. Period Used display
      if (periodDisplayEl) {
        periodDisplayEl.textContent = result.period.formattedRange;
      }

      // Update Human Date Badges
      const reviewDateHuman = document.getElementById('review-date-human');
      const customStartHuman = document.getElementById('custom-start-human');
      const customEndHuman = document.getElementById('custom-end-human');

      if (reviewDateHuman) {
        reviewDateHuman.textContent = reviewDateEl.value ? formatHumanDate(reviewDateEl.value) : '—';
      }
      if (customStartHuman) {
        customStartHuman.textContent = customStartEl.value ? formatHumanDate(customStartEl.value) : '—';
      }
      if (customEndHuman) {
        customEndHuman.textContent = customEndEl.value ? formatHumanDate(customEndEl.value) : '—';
      }

      // 2. Status Card
      statusCard.className = `status-decision-card ${result.badgeClass}`;
      statusPill.textContent = result.statusCode;
      statusTitleEl.textContent = result.statusTitle;
      statusReasonEl.textContent = result.statusReason;
      actionTextEl.textContent = result.nextStep;

      // Cache last single evaluation & update mobile sticky bar
      lastSingleResult = result;
      lastSingleCurrency = curr;
      updateStickySummaryForTab();

      // 3. 4 KPI Cards
      kpiCostInqEl.textContent = formatCurrency(result.metrics.costPerInquiry, curr);
      kpiCostApptEl.textContent = formatCurrency(result.metrics.costPerAppt, curr);
      kpiCostSignEl.textContent = formatCurrency(result.metrics.costPerSigned, curr);
      kpiLeadAgeEl.textContent = result.period.leadAgeDisplay;

      // 4. Target Comparison Table
      tableInqConvActual.textContent = formatPercent(result.metrics.inqToConvRate);
      tableInqConvTarget.textContent = inputs.targetInqToConv ? `${Number(inputs.targetInqToConv).toFixed(1)}%` : '—';
      updateBadge(tableInqConvBadge, result.targetsCheck.inqToConv);

      tableConvApptActual.textContent = formatPercent(result.metrics.convToApptRate);
      tableConvApptTarget.textContent = inputs.targetConvToAppt ? `${Number(inputs.targetConvToAppt).toFixed(1)}%` : '—';
      updateBadge(tableConvApptBadge, result.targetsCheck.convToAppt);

      tableApptSignActual.textContent = formatPercent(result.metrics.apptToSignedRate);

      // 5. Funnel Visualization
      const maxVal = Math.max(
        Number(inputs.inquiries) || 0,
        Number(inputs.conversations) || 0,
        Number(inputs.appointments) || 0,
        Number(inputs.signed) || 0,
        Number(inputs.closed) || 0,
        1
      );

      setBar(funnelBarInq, funnelCountInq, inputs.inquiries, maxVal);
      setBar(funnelBarConv, funnelCountConv, inputs.conversations, maxVal);
      setBar(funnelBarAppt, funnelCountAppt, inputs.appointments, maxVal);
      setBar(funnelBarSign, funnelCountSign, inputs.signed, maxVal);
      setBar(funnelBarClose, funnelCountClose, inputs.closed, maxVal);

      // 6. Highlight Field Errors
      highlightErrors(result.fieldErrors);

      // Auto-save if Remember toggle is active
      saveIfRemembered(inputs);
    }

    function setBar(barEl, countEl, rawVal, maxVal) {
      if (!barEl || !countEl) return;
      if (rawVal === '' || rawVal === null || rawVal === undefined) {
        barEl.style.width = '0%';
        countEl.textContent = '—';
        return;
      }
      const val = Number(rawVal);
      if (val <= 0 || isNaN(val)) {
        barEl.style.width = '0%';
        countEl.textContent = '0';
        return;
      }
      const pct = Math.max(1, Math.min(100, Math.round((val / maxVal) * 100)));
      barEl.style.width = `${pct}%`;
      countEl.textContent = val.toLocaleString();
    }

    function updateBadge(badgeEl, status) {
      if (!badgeEl) return;
      if (status === 'on-target') {
        badgeEl.className = 'check-badge on-target';
        badgeEl.textContent = '✓ On target';
      } else if (status === 'below-target') {
        badgeEl.className = 'check-badge below-target';
        badgeEl.textContent = '⚠ Below target';
      } else {
        badgeEl.className = 'check-badge neutral';
        badgeEl.textContent = '—';
      }
    }

    function highlightErrors(errors) {
      const errorMap = {
        spend: 'spend-error',
        reviewDate: 'review-date-error',
        periodStart: 'custom-start-error',
        periodEnd: 'custom-end-error',
        periodSequence: 'custom-end-error',
        reviewSequence: 'custom-end-error',
        daysToAppt: 'days-to-appt-error',
        daysToSign: 'days-to-sign-error',
        minInquiries: 'min-inquiries-error',
        targetInqToConv: 'target-inq-conv-error',
        targetConvToAppt: 'target-conv-appt-error',
        maxCostTarget: 'max-cost-error',
        inquiries: 'count-inquiries-error',
        conversations: 'count-conversations-error',
        appointments: 'count-appointments-error',
        signed: 'count-signed-error',
        closed: 'count-closed-error',
        seqInqConv: 'count-conversations-error',
        seqConvAppt: 'count-appointments-error',
        seqApptSign: 'count-signed-error',
        seqSignClose: 'count-closed-error'
      };

      document.querySelectorAll('.field-error-text').forEach(el => {
        el.textContent = '';
        el.classList.remove('is-visible');
      });

      document.querySelectorAll('.form-control').forEach(el => {
        el.classList.remove('has-error');
        el.removeAttribute('aria-invalid');
      });

      Object.keys(errors).forEach(errKey => {
        const errorMsg = errors[errKey];
        const errorElId = errorMap[errKey];
        if (errorElId) {
          const el = document.getElementById(errorElId);
          if (el) {
            el.textContent = errorMsg;
            el.classList.add('is-visible');
          }
        }
      });
    }

    // Attach form listeners
    form.addEventListener('input', recalculate);
    form.addEventListener('change', recalculate);

    // Persistence Support (Local only, zero transmission)
    const rememberCheckbox = document.getElementById('remember-device-checkbox');
    const STORAGE_KEY = 'locatria_paid_lead_check_v1';

    function saveIfRemembered(inputs) {
      if (rememberCheckbox && rememberCheckbox.checked) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
        } catch (e) {}
      }
    }

    function loadRemembered() {
      if (!rememberCheckbox) return;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const data = JSON.parse(raw);
          rememberCheckbox.checked = true;
          if (data.sourceName !== undefined) sourceNameEl.value = data.sourceName;
          if (data.currency !== undefined) currencyEl.value = data.currency;
          if (data.spend !== undefined) spendEl.value = data.spend;
          if (data.reviewDate !== undefined) reviewDateEl.value = data.reviewDate;
          if (data.daysToAppt !== undefined) daysToApptEl.value = data.daysToAppt;
          if (data.daysToSign !== undefined) daysToSignEl.value = data.daysToSign;
          if (data.minInquiries !== undefined) minInquiriesEl.value = data.minInquiries;
          if (data.targetInqToConv !== undefined) targetInqConvEl.value = data.targetInqToConv;
          if (data.targetConvToAppt !== undefined) targetConvApptEl.value = data.targetConvToAppt;
          if (data.maxCostTarget !== undefined) maxCostTargetEl.value = data.maxCostTarget;
          if (data.inquiries !== undefined) inqEl.value = data.inquiries;
          if (data.conversations !== undefined) convEl.value = data.conversations;
          if (data.appointments !== undefined) apptEl.value = data.appointments;
          if (data.signed !== undefined) signEl.value = data.signed;
          if (data.closed !== undefined) closeEl.value = data.closed;
          if (data.active !== undefined) activeEl.value = data.active;
          if (data.periodPreset) {
            const btn = document.querySelector(`.preset-chip-btn[data-preset="${data.periodPreset}"]`);
            if (btn) btn.click();
            if (data.customStart) customStartEl.value = data.customStart;
            if (data.customEnd) customEndEl.value = data.customEnd;
          }
        }
      } catch (e) {}
    }

    if (rememberCheckbox) {
      rememberCheckbox.addEventListener('change', () => {
        if (rememberCheckbox.checked) {
          saveIfRemembered(gatherSingleInputs());
        } else {
          try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
        }
      });
    }

    // Load initial remembered data if present
    loadRemembered();

    // Prevent accidental loss of work when form has inputs
    window.addEventListener('beforeunload', (e) => {
      if (rememberCheckbox && rememberCheckbox.checked) return;
      const cur = gatherSingleInputs();
      const hasData = cur.sourceName || cur.spend || cur.inquiries || cur.conversations || cur.appointments || cur.signed;
      if (hasData) {
        e.preventDefault();
        e.returnValue = '';
      }
    });

    // Mobile scroll to results button
    const btnScrollResults = document.getElementById('btn-scroll-results');
    if (btnScrollResults) {
      btnScrollResults.addEventListener('click', () => {
        const compareTab = document.getElementById('tab-compare-mode');
        if (compareTab && compareTab.classList.contains('is-active')) {
          const compBar = document.getElementById('compare-summary-bar') || document.getElementById('compare-sources-section');
          if (compBar) compBar.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          const resultsCol = document.getElementById('results-column') || statusCard;
          if (resultsCol) resultsCol.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    // Print / PDF Button
    const printBtn = document.getElementById('btn-print-pdf');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // Sticky Summary Synchronizer across Tabs (FIX-05)
    function updateStickySummaryForTab() {
      const mobileStickyTitle = document.getElementById('mobile-sticky-title');
      const mobileStickyCost = document.getElementById('mobile-sticky-cost');
      if (!mobileStickyTitle || !mobileStickyCost) return;

      const compareTab = document.getElementById('tab-compare-mode');
      if (compareTab && compareTab.classList.contains('is-active')) {
        if (window._getCompareStats) {
          const stats = window._getCompareStats();
          mobileStickyTitle.textContent = stats.evaluated > 0 ? `${stats.evaluated} Sources Evaluated` : 'Compare Sources';
          mobileStickyCost.textContent = stats.evaluated > 0
            ? `${stats.evaluated} of ${stats.total} evaluated${stats.onTarget > 0 ? ` (${stats.onTarget} on target)` : ''}`
            : `${stats.total} sources · ${stats.needsInfo} need info`;
        } else {
          mobileStickyTitle.textContent = 'Compare Sources';
          mobileStickyCost.textContent = '2 sources · 2 need info';
        }
      } else {
        if (lastSingleResult) {
          mobileStickyTitle.textContent = lastSingleResult.statusTitle;
          const curr = lastSingleCurrency || (CURRENCIES[currencyEl.value] || CURRENCIES.USD);
          mobileStickyCost.textContent = formatCurrency(lastSingleResult.metrics.costPerSigned, curr);
        } else {
          mobileStickyTitle.textContent = 'Single Source Check';
          mobileStickyCost.textContent = '—';
        }
      }
    }
    window._updateStickySummaryForTab = updateStickySummaryForTab;

    // Initial evaluation
    recalculate();

    // Mode Switcher (Single vs Compare)
    const singleTab = document.getElementById('tab-single-mode');
    const compareTab = document.getElementById('tab-compare-mode');
    const singleSection = document.getElementById('single-source-section');
    const compareSection = document.getElementById('compare-sources-section');

    if (singleTab && compareTab) {
      singleTab.addEventListener('click', function () {
        singleTab.classList.add('is-active');
        singleTab.setAttribute('aria-selected', 'true');
        compareTab.classList.remove('is-active');
        compareTab.setAttribute('aria-selected', 'false');
        singleSection.style.display = 'grid';
        compareSection.classList.remove('is-active');
        updateStickySummaryForTab();
      });

      compareTab.addEventListener('click', function () {
        compareTab.classList.add('is-active');
        compareTab.setAttribute('aria-selected', 'true');
        singleTab.classList.remove('is-active');
        singleTab.setAttribute('aria-selected', 'false');
        singleSection.style.display = 'none';
        compareSection.classList.add('is-active');
        initCompareView();
        updateStickySummaryForTab();
      });
    }

    // Reset Modal
    const resetTrigger = document.getElementById('btn-reset-calculator');
    const resetModal = document.getElementById('reset-confirm-modal');
    const resetCancel = document.getElementById('btn-modal-cancel');
    const resetConfirm = document.getElementById('btn-modal-confirm');

    if (resetTrigger && resetModal) {
      resetTrigger.addEventListener('click', () => resetModal.classList.add('is-open'));
      resetCancel.addEventListener('click', () => resetModal.classList.remove('is-open'));
      resetConfirm.addEventListener('click', () => {
        form.reset();
        minInquiriesEl.value = '20';
        try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
        if (rememberCheckbox) rememberCheckbox.checked = false;
        presetButtons[0].click();
        resetModal.classList.remove('is-open');
        recalculate();
        if (window._resetCompareView) {
          window._resetCompareView();
        }
        updateStickySummaryForTab();
      });
    }

    // Example Loader (FIX-02: Single vs Compare Mode Aware)
    const exampleBtn = document.getElementById('btn-load-example');
    if (exampleBtn) {
      exampleBtn.addEventListener('click', function () {
        if (compareTab && compareTab.classList.contains('is-active')) {
          initCompareView();
          if (window._loadCompareExample) {
            window._loadCompareExample();
          }
        } else {
          sourceNameEl.value = 'Portal leads (hypothetical example)';
          currencyEl.value = 'USD';
          spendEl.value = '1500';
          reviewDateEl.value = '2026-11-12';

          // Select custom dates Aug 1 - Aug 31
          const customBtn = document.querySelector('.preset-chip-btn[data-preset="custom"]');
          if (customBtn) customBtn.click();
          customStartEl.value = '2026-08-01';
          customEndEl.value = '2026-08-31';

          daysToApptEl.value = '14';
          daysToSignEl.value = '90';
          minInquiriesEl.value = '20';
          targetInqConvEl.value = '30';
          targetConvApptEl.value = '25';
          maxCostTargetEl.value = '2000';

          inqEl.value = '40';
          convEl.value = '14';
          apptEl.value = '4';
          signEl.value = '0';
          closeEl.value = '0';
          activeEl.value = '6';

          recalculate();
        }
      });
    }
  }

  // --- Multi-Source Compare View (Commercial-Grade Engine) ---
  let compareInitialized = false;
  function initCompareView() {
    if (compareInitialized) return;
    compareInitialized = true;

    const tableBody = document.getElementById('compare-table-body');
    const mobileContainer = document.getElementById('compare-mobile-accordion');
    const summaryChipsContainer = document.getElementById('compare-summary-chips');
    const countNotice = document.getElementById('compare-count-notice');
    const addRowBtn = document.getElementById('btn-add-source-row');

    const sharedCurrencyEl = document.getElementById('shared-currency-select');
    const sharedReviewDateEl = document.getElementById('shared-review-date');
    const sharedReviewDateHuman = document.getElementById('shared-review-date-human');
    const sharedDaysApptEl = document.getElementById('shared-days-appt');
    const sharedDaysSignEl = document.getElementById('shared-days-sign');
    const sharedMinInqEl = document.getElementById('shared-min-inq');
    const sharedInqConvEl = document.getElementById('shared-inq-conv');
    const sharedConvApptEl = document.getElementById('shared-conv-appt');
    const sharedMaxCostEl = document.getElementById('shared-max-cost');

    if (!tableBody) return;

    // Set default review date
    if (!sharedReviewDateEl.value) {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      sharedReviewDateEl.value = `${y}-${m}-${d}`;
    }
    if (sharedReviewDateHuman) {
      sharedReviewDateHuman.textContent = formatHumanDate(sharedReviewDateEl.value);
    }
    sharedReviewDateEl.addEventListener('change', () => {
      if (sharedReviewDateHuman) {
        sharedReviewDateHuman.textContent = formatHumanDate(sharedReviewDateEl.value);
      }
    });

    let nextRowId = 3;
    let rowsData = [
      {
        id: 1,
        source: '',
        period: 'last-30',
        customStart: '',
        customEnd: '',
        spend: '',
        inquiries: '',
        conversations: '',
        appointments: '',
        signed: '',
        closed: ''
      },
      {
        id: 2,
        source: '',
        period: 'last-30',
        customStart: '',
        customEnd: '',
        spend: '',
        inquiries: '',
        conversations: '',
        appointments: '',
        signed: '',
        closed: ''
      }
    ];

    let expandedRows = new Set(); // Blank initial state (FIX-02)
    let sortColumn = null;
    let sortDirection = 'asc';

    function getSharedSettings() {
      return {
        currency: sharedCurrencyEl ? sharedCurrencyEl.value : 'USD',
        reviewDate: sharedReviewDateEl ? sharedReviewDateEl.value : '',
        daysToAppt: sharedDaysApptEl ? sharedDaysApptEl.value : '',
        daysToSign: sharedDaysSignEl ? sharedDaysSignEl.value : '',
        minInquiries: (sharedMinInqEl && sharedMinInqEl.value) ? sharedMinInqEl.value : '20',
        targetInqToConv: sharedInqConvEl ? sharedInqConvEl.value : '',
        targetConvToAppt: sharedConvApptEl ? sharedConvApptEl.value : '',
        maxCostTarget: sharedMaxCostEl ? sharedMaxCostEl.value : ''
      };
    }

    function getRowMissingFields(row, shared) {
      const missing = [];
      if (!row.source || !row.source.trim()) missing.push('Source name');
      if (row.inquiries === '' || row.inquiries === null) missing.push('Inquiries');
      if (row.conversations === '' || row.conversations === null) missing.push('Conversations');
      if (row.appointments === '' || row.appointments === null) missing.push('Appointments');
      if (row.signed === '' || row.signed === null) missing.push('Signed clients (0 if none)');
      if (!shared.daysToAppt) missing.push('Target days to 1st appt');
      if (!shared.daysToSign) missing.push('Target days to sign');
      if (!shared.targetInqToConv) missing.push('Target Inq → Conv %');
      if (!shared.targetConvToAppt) missing.push('Target Conv → Appt %');
      return missing;
    }

    function evaluateRow(row, shared) {
      const missing = getRowMissingFields(row, shared);
      if (missing.length > 0) return null;

      const evalInput = {
        sourceName: row.source || `Source #${row.id}`,
        currency: shared.currency,
        spend: row.spend,
        reviewDate: shared.reviewDate,
        periodPreset: row.period,
        customStart: row.customStart,
        customEnd: row.customEnd,
        daysToAppt: shared.daysToAppt,
        daysToSign: shared.daysToSign,
        minInquiries: shared.minInquiries,
        targetInqToConv: shared.targetInqToConv,
        targetConvToAppt: shared.targetConvToAppt,
        maxCostTarget: shared.maxCostTarget,
        inquiries: row.inquiries,
        conversations: row.conversations,
        appointments: row.appointments,
        signed: row.signed,
        closed: row.closed
      };
      return evaluateLeadSource(evalInput);
    }

    let lastEvaluatedCount = 0;
    let lastNeedsInfoCount = 0;
    let lastOnTargetCount = 0;

    window._getCompareStats = function() {
      return {
        total: rowsData.length,
        evaluated: lastEvaluatedCount,
        needsInfo: lastNeedsInfoCount,
        onTarget: lastOnTargetCount
      };
    };

    window._loadCompareExample = function() {
      if (sharedDaysApptEl) sharedDaysApptEl.value = '14';
      if (sharedDaysSignEl) sharedDaysSignEl.value = '90';
      if (sharedMinInqEl) sharedMinInqEl.value = '20';
      if (sharedInqConvEl) sharedInqConvEl.value = '30';
      if (sharedConvApptEl) sharedConvApptEl.value = '25';
      if (sharedMaxCostEl) sharedMaxCostEl.value = '2000';
      rowsData = [
        {
          id: 1,
          source: 'Portal A (hypothetical example)',
          period: 'last-90',
          customStart: '',
          customEnd: '',
          spend: '1500',
          inquiries: '40',
          conversations: '14',
          appointments: '4',
          signed: '0',
          closed: '0'
        },
        {
          id: 2,
          source: 'Social Ads (hypothetical example)',
          period: 'last-30',
          customStart: '',
          customEnd: '',
          spend: '800',
          inquiries: '25',
          conversations: '8',
          appointments: '2',
          signed: '0',
          closed: '0'
        }
      ];
      expandedRows = new Set([1]);
      renderCompare();
      if (window._updateStickySummaryForTab) window._updateStickySummaryForTab();
    };

    window._resetCompareView = function() {
      if (sharedCurrencyEl) sharedCurrencyEl.value = 'USD';
      if (sharedDaysApptEl) sharedDaysApptEl.value = '';
      if (sharedDaysSignEl) sharedDaysSignEl.value = '';
      if (sharedMinInqEl) sharedMinInqEl.value = '20';
      if (sharedInqConvEl) sharedInqConvEl.value = '';
      if (sharedConvApptEl) sharedConvApptEl.value = '';
      if (sharedMaxCostEl) sharedMaxCostEl.value = '';
      rowsData = [
        {
          id: 1,
          source: '',
          period: 'last-30',
          customStart: '',
          customEnd: '',
          spend: '',
          inquiries: '',
          conversations: '',
          appointments: '',
          signed: '',
          closed: ''
        },
        {
          id: 2,
          source: '',
          period: 'last-30',
          customStart: '',
          customEnd: '',
          spend: '',
          inquiries: '',
          conversations: '',
          appointments: '',
          signed: '',
          closed: ''
        }
      ];
      expandedRows = new Set();
      renderCompare();
      if (window._updateStickySummaryForTab) window._updateStickySummaryForTab();
    };

    function renderCompare() {
      const shared = getSharedSettings();
      const curr = CURRENCIES[shared.currency] || CURRENCIES.USD;

      if (countNotice) {
        countNotice.textContent = `Showing ${rowsData.length} source${rowsData.length > 1 ? 's' : ''} (max 15)`;
      }
      if (addRowBtn) {
        addRowBtn.disabled = rowsData.length >= 15;
      }

      let totalEvaluated = 0;
      let onTargetCount = 0;
      let maturingCount = 0;
      let reviewCount = 0;
      let earlyCount = 0;
      let needsInfoCount = 0;

      const evaluatedResults = new Map();
      const rowMissingMap = new Map();

      rowsData.forEach(row => {
        const missing = getRowMissingFields(row, shared);
        rowMissingMap.set(row.id, missing);
        if (missing.length === 0) {
          const res = evaluateRow(row, shared);
          evaluatedResults.set(row.id, res);
          if (res && res.statusCode !== 'INCOMPLETE') {
            totalEvaluated++;
            if (res.statusCode === 'WITHIN') onTargetCount++;
            else if (res.statusCode === 'MATURING') maturingCount++;
            else if (['FOLLOWUP', 'FIT', 'NO_CLIENTS', 'OVER', 'CHECK'].includes(res.statusCode)) reviewCount++;
            else if (res.statusCode.startsWith('EARLY')) earlyCount++;
          } else {
            needsInfoCount++;
          }
        } else {
          needsInfoCount++;
        }
      });

      lastEvaluatedCount = totalEvaluated;
      lastNeedsInfoCount = needsInfoCount;
      lastOnTargetCount = onTargetCount;

      if (summaryChipsContainer) {
        let chipsHtml = '';
        if (totalEvaluated === 0) {
          chipsHtml = `
            <span class="compare-chip">
              ${rowsData.length} source${rowsData.length > 1 ? 's' : ''} · ${needsInfoCount} need info
            </span>`;
        } else {
          chipsHtml = `
            <span class="compare-chip">
              <strong>${totalEvaluated}</strong> of ${rowsData.length} evaluated${needsInfoCount > 0 ? ` · ${needsInfoCount} need${needsInfoCount === 1 ? 's' : ''} info` : ''}
            </span>`;
        }
        if (onTargetCount > 0) {
          chipsHtml += `<span class="compare-chip on-target">✓ ${onTargetCount} on target</span>`;
        }
        if (maturingCount > 0) {
          chipsHtml += `<span class="compare-chip maturing">● ${maturingCount} maturing</span>`;
        }
        if (reviewCount > 0) {
          chipsHtml += `<span class="compare-chip review">⚠ ${reviewCount} review</span>`;
        }
        if (earlyCount > 0) {
          chipsHtml += `<span class="compare-chip early">⏱ ${earlyCount} too early</span>`;
        }
        summaryChipsContainer.innerHTML = chipsHtml;
      }

      let tableHtml = '';
      let mobileHtml = '';

      rowsData.forEach((row, idx) => {
        const res = evaluatedResults.get(row.id);
        const missing = rowMissingMap.get(row.id) || [];
        const isExpanded = expandedRows.has(row.id);

        let statusLabel = '—';
        let badgeType = 'neutral';
        if (missing.length > 0) {
          statusLabel = 'Needs info';
          badgeType = 'neutral';
        } else if (res) {
          statusLabel = res.statusTitle;
          if (res.statusCode === 'WITHIN') badgeType = 'on-target';
          else if (res.statusCode === 'MATURING') badgeType = 'maturing';
          else if (['FOLLOWUP', 'FIT', 'NO_CLIENTS', 'OVER', 'CHECK'].includes(res.statusCode)) badgeType = 'below-target';
          else if (res.statusCode.startsWith('EARLY')) badgeType = 'maturing';
        }

        const costSignedStr = res && res.metrics.costPerSigned !== null ? formatCurrency(res.metrics.costPerSigned, curr) : '—';
        const inqConvStr = res && res.metrics.inqToConvRate !== null ? formatPercent(res.metrics.inqToConvRate) : '—';
        const convApptStr = res && res.metrics.convToApptRate !== null ? formatPercent(res.metrics.convToApptRate) : '—';

        const inqNum = Number(row.inquiries) || 0;
        const convNum = Number(row.conversations) || 0;
        const apptNum = Number(row.appointments) || 0;
        const signNum = Number(row.signed) || 0;

        const hasSeqInqConv = row.inquiries !== '' && row.conversations !== '' && convNum > inqNum;
        const hasSeqConvAppt = row.conversations !== '' && row.appointments !== '' && apptNum > convNum;
        const hasSeqApptSign = row.appointments !== '' && row.signed !== '' && signNum > apptNum;

        const inqConvPct = res && res.metrics.inqToConvRate !== null ? Math.min(100, Math.round(res.metrics.inqToConvRate * 100)) : 0;
        const convApptPct = res && res.metrics.convToApptRate !== null ? Math.min(100, Math.round(res.metrics.convToApptRate * 100)) : 0;

        // Desktop Row
        tableHtml += `
          <tr class="compare-main-row" data-row-id="${row.id}" style="${isExpanded ? 'background: #f8fafc;' : ''}">
            <td style="font-weight: 700; color: var(--color-text-muted);">${idx + 1}</td>
            <td>
              <input type="text" class="compare-input-compact js-comp-field" data-field="source" value="${escapeHtml(row.source)}" placeholder="e.g. Portal A, Social Ads">
            </td>
            <td>
              <select class="compare-input-compact js-comp-field" data-field="period">
                <option value="last-30" ${row.period === 'last-30' ? 'selected' : ''}>Last 30 days</option>
                <option value="last-60" ${row.period === 'last-60' ? 'selected' : ''}>Last 60 days</option>
                <option value="last-90" ${row.period === 'last-90' ? 'selected' : ''}>Last 90 days</option>
                <option value="this-month" ${row.period === 'this-month' ? 'selected' : ''}>This month</option>
                <option value="last-month" ${row.period === 'last-month' ? 'selected' : ''}>Last month</option>
                <option value="last-3-months" ${row.period === 'last-3-months' ? 'selected' : ''}>Last 3 full months</option>
                <option value="custom" ${row.period === 'custom' ? 'selected' : ''}>Custom dates...</option>
              </select>
            </td>
            <td>
              <input type="number" min="0" class="compare-input-compact mono js-comp-field" data-field="spend" value="${row.spend}" placeholder="e.g. 1500">
            </td>
            <td>
              <input type="number" min="0" class="compare-input-compact mono js-comp-field" data-field="inquiries" value="${row.inquiries}" placeholder="e.g. 40">
            </td>
            <td>
              <input type="number" min="0" class="compare-input-compact mono js-comp-field ${hasSeqInqConv ? 'has-error' : ''}" data-field="conversations" value="${row.conversations}" placeholder="0">
              ${hasSeqInqConv ? '<span class="cell-warning-tag">⚠ > Inquiries</span>' : ''}
            </td>
            <td>
              <input type="number" min="0" class="compare-input-compact mono js-comp-field ${hasSeqConvAppt ? 'has-error' : ''}" data-field="appointments" value="${row.appointments}" placeholder="0">
              ${hasSeqConvAppt ? '<span class="cell-warning-tag">⚠ > Convs</span>' : ''}
            </td>
            <td>
              <input type="number" min="0" class="compare-input-compact mono js-comp-field ${hasSeqApptSign ? 'has-error' : ''}" data-field="signed" value="${row.signed}" placeholder="0 if none">
              ${hasSeqApptSign ? '<span class="cell-warning-tag">⚠ > Appts</span>' : ''}
            </td>
            <td style="text-align: right; font-weight: 600;">
              <div>${inqConvStr}</div>
              ${inqConvPct > 0 ? `<div class="compare-mini-bar"><div class="compare-mini-bar-fill ${inqConvPct >= Number(shared.targetInqToConv) ? 'on-target' : ''}" style="width: ${inqConvPct}%;"></div></div>` : ''}
            </td>
            <td style="text-align: right; font-weight: 600;">
              <div>${convApptStr}</div>
              ${convApptPct > 0 ? `<div class="compare-mini-bar"><div class="compare-mini-bar-fill ${convApptPct >= Number(shared.targetConvToAppt) ? 'on-target' : ''}" style="width: ${convApptPct}%;"></div></div>` : ''}
            </td>
            <td style="text-align: right; font-weight: 700; color: var(--color-primary-800);">
              <div>${costSignedStr}</div>
            </td>
            <td>
              <span class="check-badge ${badgeType}">${statusLabel}</span>
            </td>
            <td style="text-align: center;">
              <div style="display: inline-flex; align-items: center; gap: 2px;">
                <button type="button" class="btn-row-action js-toggle-details" data-row-id="${row.id}" title="Toggle diagnosis details">
                  ${isExpanded ? '▴' : '▾'}
                </button>
                <button type="button" class="btn-row-action js-dup-row" data-row-id="${row.id}" title="Duplicate this source">
                  ⎘
                </button>
                <button type="button" class="btn-row-action delete js-del-row" data-row-id="${row.id}" title="Delete source" ${rowsData.length <= 1 ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : ''}>
                  ✕
                </button>
              </div>
            </td>
          </tr>`;

        // Expandable Sub-Row (Diagnosis & Next Step)
        if (isExpanded) {
          tableHtml += `
            <tr class="compare-row-details" data-details-for="${row.id}">
              <td colspan="13">
                <div class="compare-details-content">
                  <div>
                    ${missing.length > 0 ? `
                      <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: var(--radius-sm); padding: 8px 12px; margin-bottom: 8px;">
                        <strong style="font-size: 11px; text-transform: uppercase; color: #b45309; letter-spacing: 0.04em;">Required Information Missing</strong>
                        <p style="font-size: var(--text-xs); color: #92400e; margin: 4px 0 0 0; line-height: 1.5;">
                          To evaluate this source, please enter: <strong>${missing.join(', ')}</strong>.
                        </p>
                      </div>
                    ` : (res ? `
                      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                        <span class="status-badge-pill ${res.badgeClass}">
                          ${res.statusCode}
                        </span>
                        <strong style="font-size: var(--text-sm); color: var(--color-text-main);">${statusLabel}</strong>
                      </div>
                      <p style="font-size: var(--text-xs); color: var(--color-text-muted); margin: 0 0 8px 0; line-height: 1.5;">
                        ${res.statusReason}
                      </p>
                      <div style="background: #ffffff; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); padding: 8px 12px;">
                        <strong style="font-size: 11px; text-transform: uppercase; color: var(--color-primary-700); letter-spacing: 0.04em;">Suggested Next Step</strong>
                        <div style="font-size: var(--text-xs); color: var(--color-text-main); margin-top: 2px;">
                          ${res.nextStep}
                        </div>
                      </div>
                    ` : '')}
                    ${row.period === 'custom' ? `
                      <div style="display: flex; gap: 12px; margin-top: 10px; align-items: center; background: #fff; padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle);">
                        <strong style="font-size: var(--text-xs);">Custom Dates:</strong>
                        <label style="font-size: var(--text-xs);">Start: <input type="date" class="js-comp-field" data-field="customStart" value="${row.customStart}" style="padding: 2px 6px; font-size: 11px;"></label>
                        <label style="font-size: var(--text-xs);">End: <input type="date" class="js-comp-field" data-field="customEnd" value="${row.customEnd}" style="padding: 2px 6px; font-size: 11px;"></label>
                      </div>
                    ` : ''}
                  </div>
                  <div style="background: #ffffff; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); padding: 10px 14px; font-size: var(--text-xs);">
                    <div style="font-weight: 700; color: var(--color-text-main); margin-bottom: 6px;">Performance Summary</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                      <div>Lead Cohort Age:</div>
                      <div style="font-weight: 700; text-align: right;">${res ? res.period.leadAgeDisplay : '—'}</div>
                      <div>Cost / Inquiry:</div>
                      <div style="font-weight: 700; text-align: right;">${res && res.metrics.costPerInquiry !== null ? formatCurrency(res.metrics.costPerInquiry, curr) : '—'}</div>
                      <div>Cost / Appt:</div>
                      <div style="font-weight: 700; text-align: right;">${res && res.metrics.costPerAppt !== null ? formatCurrency(res.metrics.costPerAppt, curr) : '—'}</div>
                      <div>Cost / Signed:</div>
                      <div style="font-weight: 700; text-align: right; color: var(--color-primary-700);">${costSignedStr}</div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>`;
        }

        // Mobile Card markup
        mobileHtml += `
          <div class="compare-card-row ${isExpanded ? 'is-expanded' : ''}" data-row-id="${row.id}">
            <div class="compare-card-header js-toggle-mobile-header" data-row-id="${row.id}">
              <div>
                <strong style="font-size: var(--text-sm);">${row.source || `Source #${idx + 1}`}</strong>
                <div style="font-size: var(--text-xs); color: var(--color-text-muted);">${statusLabel}</div>
              </div>
              <div style="text-align: right;">
                <div style="font-weight: 700; font-size: var(--text-sm);">${costSignedStr}</div>
                <span style="font-size: 11px; color: var(--color-primary-600);">${isExpanded ? 'Hide Details ▴' : 'Details ▾'}</span>
              </div>
            </div>
            <div class="compare-card-body">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Source Name</label>
                  <input type="text" class="form-control js-comp-field" data-field="source" value="${escapeHtml(row.source)}" placeholder="e.g. Portal A, Social Ads">
                </div>
                <div class="form-group">
                  <label class="form-label">Period</label>
                  <select class="form-control js-comp-field" data-field="period">
                    <option value="last-30" ${row.period === 'last-30' ? 'selected' : ''}>Last 30 days</option>
                    <option value="last-60" ${row.period === 'last-60' ? 'selected' : ''}>Last 60 days</option>
                    <option value="last-90" ${row.period === 'last-90' ? 'selected' : ''}>Last 90 days</option>
                    <option value="this-month" ${row.period === 'this-month' ? 'selected' : ''}>This month</option>
                    <option value="last-month" ${row.period === 'last-month' ? 'selected' : ''}>Last month</option>
                    <option value="last-3-months" ${row.period === 'last-3-months' ? 'selected' : ''}>Last 3 full months</option>
                    <option value="custom" ${row.period === 'custom' ? 'selected' : ''}>Custom dates...</option>
                  </select>
                </div>
              </div>
              ${row.period === 'custom' ? `
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Start Date</label>
                    <input type="date" class="form-control font-mono js-comp-field" data-field="customStart" value="${row.customStart}">
                  </div>
                  <div class="form-group">
                    <label class="form-label">End Date</label>
                    <input type="date" class="form-control font-mono js-comp-field" data-field="customEnd" value="${row.customEnd}">
                  </div>
                </div>
              ` : ''}
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Total Spend (${curr.symbol})</label>
                  <input type="number" min="0" class="form-control font-mono js-comp-field" data-field="spend" value="${row.spend}" placeholder="e.g. 1500">
                </div>
                <div class="form-group">
                  <label class="form-label">Inquiries Received</label>
                  <input type="number" min="0" class="form-control font-mono js-comp-field" data-field="inquiries" value="${row.inquiries}" placeholder="e.g. 40">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Conversations ${hasSeqInqConv ? '<span class="cell-warning-tag">⚠ > Inquiries</span>' : ''}</label>
                  <input type="number" min="0" class="form-control font-mono js-comp-field" data-field="conversations" value="${row.conversations}" placeholder="0">
                </div>
                <div class="form-group">
                  <label class="form-label">Appointments ${hasSeqConvAppt ? '<span class="cell-warning-tag">⚠ > Convs</span>' : ''}</label>
                  <input type="number" min="0" class="form-control font-mono js-comp-field" data-field="appointments" value="${row.appointments}" placeholder="0">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Clients Signed (0 if none) ${hasSeqApptSign ? '<span class="cell-warning-tag">⚠ > Appts</span>' : ''}</label>
                  <input type="number" min="0" class="form-control font-mono js-comp-field" data-field="signed" value="${row.signed}" placeholder="0 if none">
                </div>
              </div>
              ${missing.length > 0 ? `
                <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 10px; font-size: 12px; margin-top: 10px; color: #92400e;">
                  <strong>Required Information Missing:</strong> To evaluate, please enter ${missing.join(', ')}.
                </div>
              ` : (res ? `
                <div style="background: #f8fafc; padding: 12px; border-radius: 6px; font-size: 12px; margin-top: 10px; border: 1px solid var(--color-border-subtle);">
                  <div style="margin-bottom: 4px;"><strong>Diagnosis:</strong> ${res.statusReason}</div>
                  <div><strong>Next Step:</strong> ${res.nextStep}</div>
                </div>
              ` : '')}
              <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px;">
                <button type="button" class="btn btn-secondary btn-sm js-dup-row" data-row-id="${row.id}">Duplicate</button>
                <button type="button" class="btn btn-secondary btn-sm js-del-row" data-row-id="${row.id}" style="color: #b91c1c;" ${rowsData.length <= 1 ? 'disabled' : ''}>Delete</button>
              </div>
            </div>
          </div>`;
      });

      tableBody.innerHTML = tableHtml;
      mobileContainer.innerHTML = mobileHtml;

      if (window._updateStickySummaryForTab) {
        window._updateStickySummaryForTab();
      }

      // Attach row input listeners
      tableBody.querySelectorAll('.js-comp-field').forEach(inputEl => {
        inputEl.addEventListener('input', function () {
          const rowId = parseInt(this.closest('[data-row-id]').getAttribute('data-row-id'), 10);
          const field = this.getAttribute('data-field');
          const targetRow = rowsData.find(r => r.id === rowId);
          if (targetRow) {
            targetRow[field] = this.value;
            renderCompare();
          }
        });
      });

      mobileContainer.querySelectorAll('.js-comp-field').forEach(inputEl => {
        inputEl.addEventListener('input', function () {
          const rowId = parseInt(this.closest('[data-row-id]').getAttribute('data-row-id'), 10);
          const field = this.getAttribute('data-field');
          const targetRow = rowsData.find(r => r.id === rowId);
          if (targetRow) {
            targetRow[field] = this.value;
            renderCompare();
          }
        });
      });

      // Toggle details listener
      tableBody.querySelectorAll('.js-toggle-details').forEach(btn => {
        btn.addEventListener('click', function () {
          const rowId = parseInt(this.getAttribute('data-row-id'), 10);
          if (expandedRows.has(rowId)) expandedRows.delete(rowId);
          else expandedRows.add(rowId);
          renderCompare();
        });
      });

      mobileContainer.querySelectorAll('.js-toggle-mobile-header').forEach(header => {
        header.addEventListener('click', function () {
          const rowId = parseInt(this.getAttribute('data-row-id'), 10);
          if (expandedRows.has(rowId)) expandedRows.delete(rowId);
          else expandedRows.add(rowId);
          renderCompare();
        });
      });

      // Duplicate listener
      document.querySelectorAll('.js-dup-row').forEach(btn => {
        btn.addEventListener('click', function () {
          if (rowsData.length >= 15) return;
          const rowId = parseInt(this.getAttribute('data-row-id'), 10);
          const sourceIdx = rowsData.findIndex(r => r.id === rowId);
          if (sourceIdx !== -1) {
            const src = rowsData[sourceIdx];
            const newRow = Object.assign({}, src, {
              id: nextRowId++,
              source: `${src.source} (copy)`
            });
            rowsData.splice(sourceIdx + 1, 0, newRow);
            renderCompare();
          }
        });
      });

      // Delete listener
      document.querySelectorAll('.js-del-row').forEach(btn => {
        btn.addEventListener('click', function () {
          if (rowsData.length <= 1) return;
          const rowId = parseInt(this.getAttribute('data-row-id'), 10);
          rowsData = rowsData.filter(r => r.id !== rowId);
          expandedRows.delete(rowId);
          renderCompare();
        });
      });
    }

    // Add row button
    if (addRowBtn) {
      addRowBtn.addEventListener('click', function () {
        if (rowsData.length >= 15) return;
        rowsData.push({
          id: nextRowId++,
          source: '',
          period: 'last-30',
          customStart: '',
          customEnd: '',
          spend: '',
          inquiries: '',
          conversations: '',
          appointments: '',
          signed: '',
          closed: ''
        });
        renderCompare();
      });
    }

    // Sort listener
    const tableHeader = document.getElementById('compare-main-table');
    if (tableHeader) {
      tableHeader.querySelectorAll('.sortable-th').forEach(th => {
        th.addEventListener('click', function () {
          const sortKey = this.getAttribute('data-sort');
          if (sortColumn === sortKey) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
          } else {
            sortColumn = sortKey;
            sortDirection = 'asc';
          }

          tableHeader.querySelectorAll('.sort-arrow').forEach(a => a.textContent = '');
          const arrowEl = document.getElementById(`sort-arrow-${sortKey}`);
          if (arrowEl) {
            arrowEl.textContent = sortDirection === 'asc' ? ' ▲' : ' ▼';
          }

          const shared = getSharedSettings();
          rowsData.sort((a, b) => {
            const resA = evaluateRow(a, shared);
            const resB = evaluateRow(b, shared);

            let valA, valB;
            if (sortKey === 'id') {
              valA = a.id; valB = b.id;
            } else if (sortKey === 'source') {
              valA = (a.source || '').toLowerCase();
              valB = (b.source || '').toLowerCase();
            } else if (sortKey === 'spend') {
              valA = Number(a.spend) || 0;
              valB = Number(b.spend) || 0;
            } else if (sortKey === 'inquiries') {
              valA = Number(a.inquiries) || 0;
              valB = Number(b.inquiries) || 0;
            } else if (sortKey === 'inqConv') {
              valA = resA && resA.metrics.inqToConvRate !== null ? resA.metrics.inqToConvRate : -1;
              valB = resB && resB.metrics.inqToConvRate !== null ? resB.metrics.inqToConvRate : -1;
            } else if (sortKey === 'convAppt') {
              valA = resA && resA.metrics.convToApptRate !== null ? resA.metrics.convToApptRate : -1;
              valB = resB && resB.metrics.convToApptRate !== null ? resB.metrics.convToApptRate : -1;
            } else if (sortKey === 'costSigned') {
              valA = resA && resA.metrics.costPerSigned !== null ? resA.metrics.costPerSigned : 999999999;
              valB = resB && resB.metrics.costPerSigned !== null ? resB.metrics.costPerSigned : 999999999;
            } else if (sortKey === 'status') {
              valA = resA ? resA.statusTitle : '';
              valB = resB ? resB.statusTitle : '';
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
          });

          renderCompare();
        });
      });
    }

    [sharedCurrencyEl, sharedReviewDateEl, sharedDaysApptEl, sharedDaysSignEl, sharedMinInqEl, sharedInqConvEl, sharedConvApptEl, sharedMaxCostEl].forEach(el => {
      if (el) el.addEventListener('input', renderCompare);
    });

    renderCompare();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Auto-init on DOM load
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initBrowserController);
    } else {
      initBrowserController();
    }
  }

  return {
    CURRENCIES,
    parseDateUTC,
    formatISODate,
    daysDifference,
    formatHumanRange,
    computePeriodDates,
    evaluateLeadSource,
    formatCurrency,
    formatPercent
  };
});
