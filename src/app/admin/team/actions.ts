'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { getServiceSupabase } from '@/lib/supabase/server';
import { requireMembership } from '@/lib/auth';
import { canManageTeam, ROLES } from '@/lib/roles';
import { writeAudit } from '@/lib/audit';

export async function inviteMember(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const role = String(formData.get('role') ?? '');
  const { user, membership } = await requireMembership('welltory');
  if (!canManageTeam(membership.role)) throw new Error('Not authorized');
  if (!ROLES.includes(role as (typeof ROLES)[number]) || role === 'welltory_guest' || role === 'atom_owner') {
    throw new Error('Invalid role');
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Invalid email');

  const svc = getServiceSupabase();
  const { data, error } = await svc
    .from('deal_members')
    .insert({
      deal_id: membership.deal_id,
      invited_email: email,
      role,
      invited_by_user_id: user.id,
    })
    .select('id')
    .single();
  if (error) throw new Error(error.message);

  const h = headers();
  await writeAudit({
    deal_id: membership.deal_id,
    actor_user_id: user.id,
    actor_email: user.email,
    action: 'member.invite',
    entity_type: 'deal_member',
    entity_id: data?.id ?? null,
    before_value: null,
    after_value: { email, role },
    request_ip: h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
    user_agent: h.get('user-agent'),
  });
  revalidatePath('/admin/team');
}

export async function removeMember(formData: FormData) {
  const memberId = String(formData.get('member_id') ?? '');
  const { user, membership } = await requireMembership('welltory');
  if (!canManageTeam(membership.role)) throw new Error('Not authorized');

  const svc = getServiceSupabase();
  const { data: existing } = await svc.from('deal_members').select('*').eq('id', memberId).single();
  if (!existing || existing.deal_id !== membership.deal_id) throw new Error('Member not found');

  await svc.from('deal_members').delete().eq('id', memberId);

  const h = headers();
  await writeAudit({
    deal_id: membership.deal_id,
    actor_user_id: user.id,
    actor_email: user.email,
    action: 'member.remove',
    entity_type: 'deal_member',
    entity_id: memberId,
    before_value: { email: existing.invited_email, role: existing.role },
    after_value: null,
    request_ip: h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
    user_agent: h.get('user-agent'),
  });
  revalidatePath('/admin/team');
}
