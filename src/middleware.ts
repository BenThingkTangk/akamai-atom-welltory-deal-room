import { NextResponse, type NextRequest } from 'next/server';
import { classifyHost } from '@/lib/hosts';

/**
 * Host-aware middleware.
 * Note: hostname alone NEVER authorizes anything — auth checks still run in
 * server components / server actions. This middleware only routes to the
 * correct top-level surface and handles the apex → www redirect.
 */
export function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const hostHeader = req.headers.get('host') ?? '';
  const host = classifyHost(hostHeader);
  const pathname = nextUrl.pathname;

  // 1) Apex → www permanent redirect. Preserve path and query.
  if (host.kind === 'apex_redirect') {
    const target = new URL(nextUrl.href);
    target.protocol = 'https:';
    target.host = 'www.welltoryakamai.com';
    return NextResponse.redirect(target, 308);
  }

  // 2) Never rewrite for internal Next.js assets / api routes.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return NextResponse.next();
  }

  // 3) Host-specific top-level rewrites. We rewrite `/` → the correct surface
  // path. Path-based access remains available for Vercel Preview.
  if (host.kind === 'customer' && pathname === '/') {
    return NextResponse.rewrite(new URL('/briefing', nextUrl));
  }
  if (host.kind === 'preview' && pathname === '/') {
    return NextResponse.rewrite(new URL('/preview', nextUrl));
  }
  if (host.kind === 'admin' && pathname === '/') {
    return NextResponse.rewrite(new URL('/admin', nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
