import { NextResponse, type NextRequest } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';

/**
 * Magic-link callback handler.
 *
 * Supabase's PKCE flow redirects to this route with `?code=<one-time>` after
 * the user clicks their email link. We must call `exchangeCodeForSession(code)`
 * to establish the session cookies. Without this, the session is never
 * persisted and the user is bounced back to /admin/login.
 *
 * Never trusts a caller-supplied `next=` — always redirects to /admin, which
 * runs its own membership check. That keeps this route safe from open-redirect
 * abuse without adding another allowlist.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');

  if (error) {
    // Supabase returns error=access_denied&error_description=... for expired
    // or invalid links. Surface a neutral message on /admin/login.
    const dest = new URL('/admin/login', url.origin);
    dest.searchParams.set('reason', 'invalid_link');
    return NextResponse.redirect(dest);
  }

  if (!code) {
    const dest = new URL('/admin/login', url.origin);
    dest.searchParams.set('reason', 'invalid_link');
    return NextResponse.redirect(dest);
  }

  const sb = getServerSupabase();
  const { error: exchangeError } = await sb.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    const dest = new URL('/admin/login', url.origin);
    dest.searchParams.set('reason', 'invalid_link');
    return NextResponse.redirect(dest);
  }

  // Always land on /admin — the admin layout re-checks membership and role.
  return NextResponse.redirect(new URL('/admin', url.origin));
}
