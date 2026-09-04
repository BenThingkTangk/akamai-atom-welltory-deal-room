import 'server-only';
import { getServerSupabase } from './supabase/server';
import type { Role } from './roles';

export interface SessionUser {
  id: string;
  email: string;
}

export interface DealMembership {
  deal_id: string;
  deal_slug: string;
  role: Role;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const sb = getServerSupabase();
  const { data } = await sb.auth.getUser();
  if (!data.user || !data.user.email) return null;
  return { id: data.user.id, email: data.user.email };
}

export async function getMembership(dealSlug: string): Promise<DealMembership | null> {
  const user = await getSessionUser();
  if (!user) return null;
  const sb = getServerSupabase();
  const { data, error } = await sb
    .from('deal_members')
    .select('deal_id, role, deals!inner(slug)')
    .eq('user_id', user.id)
    .eq('deals.slug', dealSlug)
    .maybeSingle();
  if (error || !data) return null;
  // Supabase typing: deals may be array or object depending on relation shape
  const rel = (data as unknown as { deals: { slug: string } | Array<{ slug: string }> }).deals;
  const slug = Array.isArray(rel) ? rel[0]?.slug : rel?.slug;
  return {
    deal_id: (data as { deal_id: string }).deal_id,
    deal_slug: slug ?? dealSlug,
    role: (data as { role: Role }).role,
  };
}

export async function requireMembership(dealSlug: string): Promise<{ user: SessionUser; membership: DealMembership }> {
  const user = await getSessionUser();
  if (!user) throw new AuthError('unauthenticated');
  const m = await getMembership(dealSlug);
  if (!m) throw new AuthError('no_membership');
  return { user, membership: m };
}

export class AuthError extends Error {
  constructor(public code: 'unauthenticated' | 'no_membership' | 'forbidden') {
    super(code);
  }
}
