import { describe, it, expect } from 'vitest';
import { classifyHost, isProductionHost } from '@/lib/hosts';

describe('host classification', () => {
  it('recognizes www / apex / admin / preview production hosts', () => {
    expect(classifyHost('www.welltoryakamai.com').kind).toBe('customer');
    expect(classifyHost('welltoryakamai.com').kind).toBe('apex_redirect');
    expect(classifyHost('admin.welltoryakamai.com').kind).toBe('admin');
    expect(classifyHost('preview.welltoryakamai.com').kind).toBe('preview');
  });

  it('treats vercel preview and localhost as unknown (path-based routing)', () => {
    expect(classifyHost('akamai-atom-welltory-deal-room-abc.vercel.app').kind).toBe('unknown');
    expect(classifyHost('localhost:3000').kind).toBe('unknown');
  });

  it('is case-insensitive and strips ports', () => {
    expect(classifyHost('WWW.WelltoryAkamai.com:443').kind).toBe('customer');
  });

  it('isProductionHost matches known hosts only', () => {
    expect(isProductionHost('www.welltoryakamai.com')).toBe(true);
    expect(isProductionHost('other.com')).toBe(false);
  });
});
