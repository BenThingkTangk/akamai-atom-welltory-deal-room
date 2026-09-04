import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

/**
 * Server component / server action Supabase client bound to the user's cookies.
 * Never uses the service role key. All authorization runs through RLS + explicit
 * server checks.
 */
export function getServerSupabase() {
  const cookieStore = cookies();
  return createServerClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            /* readonly cookies in RSC */
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            /* readonly cookies in RSC */
          }
        },
      },
    },
  );
}

/**
 * Service-role client — server-only, never exposed to the browser.
 * Used only for privileged flows (publish, rollback, audit inserts,
 * invitations). Every call site MUST re-check permissions on the
 * authenticated user before touching this client.
 */
export function getServiceSupabase() {
  const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  // Use createServerClient with a no-op cookie adapter to avoid session leakage.
  return createServerClient(url, key, {
    cookies: {
      get() {
        return undefined;
      },
      set() {
        /* noop */
      },
      remove() {
        /* noop */
      },
    },
  });
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || v.length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}
