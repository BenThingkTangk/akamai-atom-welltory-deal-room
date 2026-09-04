import { describe, it, expect, beforeEach } from 'vitest';
import { rateLimit, _resetRateLimit } from '@/lib/rateLimit';

describe('rateLimit', () => {
  beforeEach(() => _resetRateLimit());
  it('allows up to the limit within the window', () => {
    for (let i = 0; i < 3; i++) {
      const r = rateLimit('k', 3, 60_000, 1_000 + i);
      expect(r.ok).toBe(true);
    }
    const denied = rateLimit('k', 3, 60_000, 1_004);
    expect(denied.ok).toBe(false);
  });
  it('resets after the window', () => {
    rateLimit('k', 1, 1_000, 1_000);
    const denied = rateLimit('k', 1, 1_000, 1_500);
    expect(denied.ok).toBe(false);
    const allowed = rateLimit('k', 1, 1_000, 2_500);
    expect(allowed.ok).toBe(true);
  });
});
