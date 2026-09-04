'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rateLimit';
import { originFromHeaders } from '@/lib/origin';

/**
 * Magic-link request handler.
 * - Rate-limited by IP AND email hash.
 * - Never reveals whether the email is invited or exists.
 */
export async function requestMagicLink(formData: FormData) {
  const raw = String(formData.get('email') ?? '').trim().toLowerCase();
  const email = raw.slice(0, 200);
  const h = headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  const ipCheck = rateLimit(`login:ip:${ip}`, 5, 60_000);
  const emailCheck = rateLimit(`login:email:${hash(email)}`, 3, 300_000);
  if (!ipCheck.ok || !emailCheck.ok) {
    // Silent no-op to avoid enumeration.
    redirect('/admin/login?sent=1');
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    // Do not distinguish invalid from unknown.
    redirect('/admin/login?sent=1');
  }

  const sb = getServerSupabase();
  // signInWithOtp with shouldCreateUser=false so we don't auto-create accounts.
  // We accept the response silently either way.
  const base = originFromHeaders(h);
  await sb.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      // Send users to /auth/callback so we can exchange the PKCE code for a
      // session. The callback then redirects into /admin, which enforces
      // membership and role. Using the request origin (instead of
      // NEXT_PUBLIC_APP_URL) keeps this working across every host: local dev,
      // Vercel Preview URLs, and eventually the production admin host.
      emailRedirectTo: new URL('/auth/callback', base).toString(),
    },
  });

  redirect('/admin/login?sent=1');
}

function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
  return (h >>> 0).toString(36);
}
