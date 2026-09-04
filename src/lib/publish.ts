import type { PublishedBriefingPayload } from './types';

/**
 * Guard: refuses any payload that contains references to prohibited internal
 * facts, dollar figures, or claims. The check is defense-in-depth on top of
 * database visibility flags — never rely on either in isolation.
 */
const FORBIDDEN_PATTERNS: RegExp[] = [
  /\$?\s*35\s*[Kk](?![A-Za-z0-9])/,      // $35K
  /\$?\s*423\s*[Kk](?![A-Za-z0-9])/,     // $423K
  /customer\s+confirmed/i,
  /welltory\s*:\s*yes/i,
  /\$\s*30[\s,\.]?000\b/,                // $30,000
  /\$\s*40[\s,\.]?000\b/,                // $40,000
  /\$30\s*[Kk](?![A-Za-z0-9])/,
  /\$40\s*[Kk](?![A-Za-z0-9])/,
  /\bincumbent\s+account\b/i,
  /\bengineering\s+time\s*\+\s*cost\b/i,
];

export interface GuardResult {
  ok: boolean;
  violations: string[];
}

/** Deep-scans the payload for forbidden strings. Returns violations, if any. */
export function guardCustomerPayload(payload: unknown): GuardResult {
  const json = JSON.stringify(payload);
  const violations: string[] = [];
  for (const rx of FORBIDDEN_PATTERNS) {
    const m = json.match(rx);
    if (m) violations.push(m[0]);
  }
  return { ok: violations.length === 0, violations };
}

/**
 * Given approved workstream rows + hero fields + slots, produce a payload safe
 * for the public briefing. Excludes anything without workflow_status of
 * `approved` or `approved_with_conditions`, and anything with visibility of
 * `internal_only` or `customer_safe_draft`.
 */
export function buildCustomerPayload(input: {
  deal_slug: string;
  version: number;
  published_at: string; // ISO
  hero: PublishedBriefingPayload['hero'];
  trust_strip: string[];
  why_now: string[];
  workstreams: Array<{
    key: string;
    title: string;
    customer_language: string;
    workflow_status: string;
    visibility: string;
    conditions?: string;
  }>;
  meeting: PublishedBriefingPayload['meeting'];
  footer: PublishedBriefingPayload['footer'];
}): PublishedBriefingPayload {
  const approvedWorkstreams = input.workstreams
    .filter(
      (w) =>
        (w.workflow_status === 'approved' || w.workflow_status === 'approved_with_conditions') &&
        (w.visibility === 'approved_for_customer' || w.visibility === 'published'),
    )
    .map((w) => ({
      key: w.key,
      title: w.title,
      customer_language: w.customer_language,
      status: w.workflow_status as 'approved' | 'approved_with_conditions',
      conditions:
        w.workflow_status === 'approved_with_conditions' && w.conditions ? w.conditions : undefined,
    }));

  const payload: PublishedBriefingPayload = {
    deal_slug: input.deal_slug,
    version: input.version,
    published_at: input.published_at,
    hero: input.hero,
    trust_strip: input.trust_strip,
    why_now: input.why_now,
    workstreams: approvedWorkstreams,
    meeting: input.meeting,
    footer: input.footer,
    role: 'welltory_guest',
  };

  return payload;
}
