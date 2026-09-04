import 'server-only';
import type { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';

/**
 * Derive the request origin from the incoming headers.
 *
 * Vercel and most reverse proxies set `x-forwarded-proto` and `x-forwarded-host`
 * (or `host`). Falling back to `NEXT_PUBLIC_APP_URL` risks pointing links at a
 * non-existent DNS name if that env var is stale (as it was in Preview during
 * the QA audit). Using the actual origin keeps everything self-consistent:
 * local dev, Vercel Preview URLs, and the eventual production hosts all work
 * without config changes.
 */
export function originFromHeaders(h: Headers | ReadonlyHeaders): string {
  const forwardedProto = h.get('x-forwarded-proto');
  const forwardedHost = h.get('x-forwarded-host');
  const host = h.get('host');
  const proto = forwardedProto ?? (host && host.startsWith('localhost') ? 'http' : 'https');
  const hostname = forwardedHost ?? host;
  if (hostname) {
    return `${proto}://${hostname}`;
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}
