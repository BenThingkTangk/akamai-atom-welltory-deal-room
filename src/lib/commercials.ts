import type { CommercialScenarioInputs, CommercialScenarioOutputs } from './types';

export const DISCLAIMER = 'Internal scenario only. Not a quote, offer, or approved Akamai commitment.';
export const SAVINGS_TBD = 'Savings to be determined after discovery.';

/**
 * Compute a scenario band from a modeled monthly range.
 * All values are internal only. Never render this output on customer surfaces.
 */
export function computeScenario(inputs: CommercialScenarioInputs): CommercialScenarioOutputs {
  const { monthly_low_usd, monthly_high_usd, term_months } = inputs;

  if (!Number.isFinite(monthly_low_usd) || !Number.isFinite(monthly_high_usd)) {
    throw new Error('Monthly modeled values must be finite numbers.');
  }
  if (monthly_low_usd < 0 || monthly_high_usd < 0) {
    throw new Error('Monthly modeled values must be non-negative.');
  }
  if (monthly_low_usd > monthly_high_usd) {
    throw new Error('monthly_low_usd cannot exceed monthly_high_usd.');
  }
  if (![12, 24, 36].includes(term_months)) {
    throw new Error('term_months must be 12, 24, or 36.');
  }

  const annualized_low_usd = monthly_low_usd * 12;
  const annualized_high_usd = monthly_high_usd * 12;
  const tcv_low_usd = monthly_low_usd * term_months;
  const tcv_high_usd = monthly_high_usd * term_months;

  const overlap_exposure_usd = computeOverlapExposure(inputs);
  const savings_note =
    inputs.incumbent_baseline_usd_monthly && inputs.incumbent_baseline_usd_monthly > 0
      ? formatSavings(inputs)
      : SAVINGS_TBD;

  const assumptions = [
    `Modeled monthly range: $${fmt(monthly_low_usd)}–$${fmt(monthly_high_usd)}`,
    `Term: ${term_months} months`,
    `Transition mechanism: ${labelTransition(inputs.transition)}`,
    `Services posture: ${labelServices(inputs.services)}`,
    `Co-marketing option: ${labelCoMarketing(inputs.co_marketing)}`,
    'Final economics depend on traffic, request volume, FQDNs, DNS zones, application and API scope, support, services, term, and contract timing.',
    'Delayed billing, overlap support, transition credits, or buyout consideration require approval.',
  ];

  return {
    monthly_target_low_usd: monthly_low_usd,
    monthly_target_high_usd: monthly_high_usd,
    annualized_low_usd,
    annualized_high_usd,
    tcv_low_usd,
    tcv_high_usd,
    overlap_exposure_usd,
    savings_note,
    assumptions,
    disclaimer: DISCLAIMER,
  };
}

function computeOverlapExposure(inputs: CommercialScenarioInputs): number | null {
  const { remaining_incumbent_months, incumbent_baseline_usd_monthly, transition } = inputs;
  // Only compute when we have approved baseline AND an explicit remaining term
  // AND a transition mechanism that would actually create exposure.
  if (
    remaining_incumbent_months == null ||
    incumbent_baseline_usd_monthly == null ||
    incumbent_baseline_usd_monthly <= 0 ||
    remaining_incumbent_months <= 0
  ) {
    return null;
  }
  if (transition === 'none') {
    return null;
  }
  return Math.round(remaining_incumbent_months * incumbent_baseline_usd_monthly);
}

function formatSavings(inputs: CommercialScenarioInputs): string {
  const baseline = inputs.incumbent_baseline_usd_monthly ?? 0;
  const midpoint = (inputs.monthly_low_usd + inputs.monthly_high_usd) / 2;
  const monthlyDelta = baseline - midpoint;
  if (monthlyDelta <= 0) {
    return 'Modeled midpoint is at or above the approved incumbent baseline — validate before proceeding.';
  }
  const annual = Math.round(monthlyDelta * 12);
  return `Approved-baseline delta: approximately $${fmt(annual)}/yr at modeled midpoint. Subject to validated scope.`;
}

function labelTransition(t: CommercialScenarioInputs['transition']): string {
  switch (t) {
    case 'none':
      return 'None';
    case 'delayed_billing':
      return 'Delayed billing (requires approval)';
    case 'overlap_credit':
      return 'Overlap credit (requires approval)';
    case 'buyout_consideration':
      return 'Buyout consideration (requires approval)';
  }
}

function labelServices(s: CommercialScenarioInputs['services']): string {
  switch (s) {
    case 'included':
      return 'Included';
    case 'discounted':
      return 'Discounted';
    case 'separate':
      return 'Separately scoped';
  }
}

function labelCoMarketing(c: CommercialScenarioInputs['co_marketing']): string {
  switch (c) {
    case 'none':
      return 'None';
    case 'case_study':
      return 'Case study (post-success, subject to separate approval)';
    case 'webinar':
      return 'Webinar (post-success, subject to separate approval)';
    case 'video':
      return 'Customer video (post-success, subject to separate approval)';
    case 'exec_quote':
      return 'Executive quote (post-success, subject to separate approval)';
    case 'package':
      return 'Combined package (post-success, subject to separate approval)';
  }
}

function fmt(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}
