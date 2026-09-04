import { describe, it, expect } from 'vitest';
import { buildCustomerPayload, guardCustomerPayload } from '@/lib/publish';

const baseInput = {
  deal_slug: 'welltory',
  version: 1,
  published_at: '2026-09-04T00:00:00.000Z',
  hero: {
    eyebrow: 'Private executive briefing for Welltory',
    headline: 'Secure and scale.',
    supporting: 'A focused Akamai evaluation.',
    primary_cta: 'Choose a 17-minute briefing',
    secondary_cta: 'See the proposed framework',
  },
  trust_strip: ['Competitive evaluation'],
  why_now: ['x'],
  meeting: {
    headline: 'Seventeen minutes to determine.',
    copy: 'Give the joint team 17 minutes.',
    agenda: ['0–3 minutes: priorities'],
    slots: [],
    cta_primary: 'Request',
    cta_alt: 'Alt',
  },
  footer: { lockup: 'Akamai × ATOM', qualifier: 'Private executive briefing.' },
};

describe('buildCustomerPayload', () => {
  it('excludes non-approved workstreams', () => {
    const payload = buildCustomerPayload({
      ...baseInput,
      workstreams: [
        { key: 'commercial', title: 'Economics', customer_language: 'ok', workflow_status: 'approved', visibility: 'approved_for_customer' },
        { key: 'healthcare', title: 'Healthcare', customer_language: 'draft', workflow_status: 'in_review', visibility: 'customer_safe_draft' },
        { key: 'co_marketing', title: 'Co-marketing', customer_language: 'excluded', workflow_status: 'excluded', visibility: 'internal_only' },
        { key: 'migration', title: 'Migration', customer_language: 'condition', workflow_status: 'approved_with_conditions', visibility: 'approved_for_customer', conditions: 'subject to scope' },
      ],
    });
    expect(payload.workstreams.map((w) => w.key)).toEqual(['commercial', 'migration']);
    expect(payload.role).toBe('welltory_guest');
    const cond = payload.workstreams.find((w) => w.key === 'migration');
    expect(cond?.status).toBe('approved_with_conditions');
    expect(cond?.conditions).toBe('subject to scope');
  });
});

describe('guardCustomerPayload', () => {
  it('rejects payloads that leak internal ranges or forbidden phrases', () => {
    const bad = { headline: 'We can match $35K', note: 'customer confirmed' };
    const result = guardCustomerPayload(bad);
    expect(result.ok).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
  });

  it('passes clean customer payloads', () => {
    const payload = buildCustomerPayload({
      ...baseInput,
      workstreams: [
        { key: 'commercial', title: 'Economics', customer_language: 'competitive displacement economics.', workflow_status: 'approved', visibility: 'approved_for_customer' },
      ],
    });
    const result = guardCustomerPayload(payload);
    expect(result.ok).toBe(true);
  });

  it('rejects $30K, $40K, $423K, and "Welltory: Yes"', () => {
    for (const phrase of ['$30,000', '$40,000', '$423K', 'Welltory: Yes', '$35K', 'incumbent account']) {
      const r = guardCustomerPayload({ x: phrase });
      expect(r.ok, `expected reject: ${phrase}`).toBe(false);
    }
  });
});
