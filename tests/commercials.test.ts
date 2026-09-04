import { describe, it, expect } from 'vitest';
import { computeScenario, DISCLAIMER, SAVINGS_TBD } from '@/lib/commercials';

describe('computeScenario', () => {
  it('computes annualized and TCV bands correctly', () => {
    const out = computeScenario({
      monthly_low_usd: 30000,
      monthly_high_usd: 40000,
      term_months: 24,
      remaining_incumbent_months: null,
      transition: 'none',
      services: 'included',
      co_marketing: 'none',
      incumbent_baseline_usd_monthly: null,
    });
    expect(out.annualized_low_usd).toBe(360_000);
    expect(out.annualized_high_usd).toBe(480_000);
    expect(out.tcv_low_usd).toBe(720_000);
    expect(out.tcv_high_usd).toBe(960_000);
    expect(out.overlap_exposure_usd).toBeNull();
    expect(out.savings_note).toBe(SAVINGS_TBD);
    expect(out.disclaimer).toBe(DISCLAIMER);
  });

  it('returns null overlap when transition is none', () => {
    const out = computeScenario({
      monthly_low_usd: 30000,
      monthly_high_usd: 40000,
      term_months: 12,
      remaining_incumbent_months: 6,
      transition: 'none',
      services: 'included',
      co_marketing: 'none',
      incumbent_baseline_usd_monthly: 20000,
    });
    expect(out.overlap_exposure_usd).toBeNull();
  });

  it('computes overlap exposure when approved inputs are present', () => {
    const out = computeScenario({
      monthly_low_usd: 30000,
      monthly_high_usd: 40000,
      term_months: 12,
      remaining_incumbent_months: 6,
      transition: 'overlap_credit',
      services: 'included',
      co_marketing: 'none',
      incumbent_baseline_usd_monthly: 20000,
    });
    expect(out.overlap_exposure_usd).toBe(120_000);
  });

  it('throws on inverted or invalid ranges', () => {
    expect(() =>
      computeScenario({
        monthly_low_usd: 50000,
        monthly_high_usd: 40000,
        term_months: 12,
        remaining_incumbent_months: null,
        transition: 'none',
        services: 'included',
        co_marketing: 'none',
        incumbent_baseline_usd_monthly: null,
      }),
    ).toThrow();
  });

  it('rejects unsupported term values', () => {
    expect(() =>
      computeScenario({
        monthly_low_usd: 30000,
        monthly_high_usd: 40000,
        // @ts-expect-error runtime guard
        term_months: 6,
        remaining_incumbent_months: null,
        transition: 'none',
        services: 'included',
        co_marketing: 'none',
        incumbent_baseline_usd_monthly: null,
      }),
    ).toThrow();
  });
});
