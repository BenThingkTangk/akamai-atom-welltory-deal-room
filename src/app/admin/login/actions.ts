'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rateLimit';

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
  await sb.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: absoluteUrl('/admin'),
    },
  });

  redirect('/admin/login?sent=1');
}

function absoluteUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return new URL(path, base).toString();
}

function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
  return (h >>> 0).toString(36);
}
