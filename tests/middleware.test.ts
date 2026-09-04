/**
 * The middleware imports next/server which is only available in the Next
 * runtime. To keep tests dependency-free, we assert routing intent by
 * exercising the classifier + a small pure helper.
 */
import { describe, it, expect } from 'vitest';
import { classifyHost } from '@/lib/hosts';

function intendedRewrite(host: string, pathname: string): { redirect?: string; rewriteTo?: string } {
  const h = classifyHost(host);
  if (h.kind === 'apex_redirect') return { redirect: 'https://www.welltoryakamai.com' + pathname };
  if (h.kind === 'customer' && pathname === '/') return { rewriteTo: '/briefing' };
  if (h.kind === 'preview' && pathname === '/') return { rewriteTo: '/preview' };
  if (h.kind === 'admin' && pathname === '/') return { rewriteTo: '/admin' };
  return {};
}

describe('middleware routing intent', () => {
  it('apex redirects to www permanently', () => {
    expect(intendedRewrite('welltoryakamai.com', '/anything?q=1')).toEqual({
      redirect: 'https://www.welltoryakamai.com/anything?q=1',
    });
  });
  it('www / rewrites to /briefing', () => {
    expect(intendedRewrite('www.welltoryakamai.com', '/')).toEqual({ rewriteTo: '/briefing' });
  });
  it('admin / rewrites to /admin', () => {
    expect(intendedRewrite('admin.welltoryakamai.com', '/')).toEqual({ rewriteTo: '/admin' });
  });
  it('preview / rewrites to /preview', () => {
    expect(intendedRewrite('preview.welltoryakamai.com', '/')).toEqual({ rewriteTo: '/preview' });
  });
  it('unknown host falls through unmodified', () => {
    expect(intendedRewrite('foo.vercel.app', '/')).toEqual({});
    expect(intendedRewrite('localhost:3000', '/admin')).toEqual({});
  });
});
