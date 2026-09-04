import 'server-only';
import { getServiceSupabase } from './supabase/server';

/**
 * Public routes (customer briefing at /briefing, meeting request at
 * /meeting/request) need to resolve a deal slug to its UUID even though the
 * anon-scoped cookie client cannot read the `deals` table (RLS: members only).
 *
 * This helper does the lookup with the service role and returns only the
 * `id` — never other fields. Deliberately narrow so a bug in a public route
 * can't accidentally leak name, incumbent, or notes.
 *
 * Safe to expose because:
 *   - Returns only a UUID that is already discoverable from anon requests to
 *     `published_briefing.deal_id` once anything is published.
 *   - Never returns slug-to-arbitrary-field, so it can't be turned into an
 *     enumeration primitive.
 */
export async function getPublicDealId(slug: string): Promise<string | null> {
  if (!/^[a-z0-9_-]{1,64}$/i.test(slug)) return null;
  const svc = getServiceSupabase();
  const { data } = await svc.from('deals').select('id').eq('slug', slug).maybeSingle();
  return (data as { id?: string } | null)?.id ?? null;
}
