'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { getServiceSupabase } from '@/lib/supabase/server';
import { requireMembership } from '@/lib/auth';
import { isOwner } from '@/lib/roles';
import { writeAudit } from '@/lib/audit';

export async function upsertAttendee(formData: FormData) {
  const roleSlot = String(formData.get('role_slot') ?? '');
  const displayName = String(formData.get('display_name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const { user, membership } = await requireMembership('welltory');
  if (!isOwner(membership.role)) throw new Error('Not authorized');
  if (!roleSlot) throw new Error('Missing role slot');
  const svc = getServiceSupabase();
  await svc
    .from('deal_attendees')
    .upsert(
      {
        deal_id: membership.deal_id,
        role_slot: roleSlot,
        display_name: displayName || null,
        email: email || null,
      },
      { onConflict: 'deal_id,role_slot' },
    );
  const h = headers();
  await writeAudit({
    deal_id: membership.deal_id,
    actor_user_id: user.id,
    actor_email: user.email,
    action: 'meeting.slot_upsert',
    entity_type: 'deal_attendee',
    entity_id: null,
    before_value: null,
    after_value: { role_slot: roleSlot, display_name: displayName, email },
    request_ip: h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
    user_agent: h.get('user-agent'),
  });
  revalidatePath('/admin/scheduling');
}

export async function addSlot(formData: FormData) {
  const starts = String(formData.get('starts_at_utc') ?? '').trim();
  const ends = String(formData.get('ends_at_utc') ?? '').trim();
  const { user, membership } = await requireMembership('welltory');
  if (!isOwner(membership.role)) throw new Error('Not authorized');
  if (isNaN(Date.parse(starts)) || isNaN(Date.parse(ends))) throw new Error('Invalid ISO datetimes');
  if (Date.parse(starts) >= Date.parse(ends)) throw new Error('Start must be before end');

  const svc = getServiceSupabase();
  const { data, error } = await svc
    .from('deal_meeting_slots')
    .insert({ deal_id: membership.deal_id, starts_at_utc: starts, ends_at_utc: ends, approved: false })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  const h = headers();
  await writeAudit({
    deal_id: membership.deal_id,
    actor_user_id: user.id,
    actor_email: user.email,
    action: 'meeting.slot_upsert',
    entity_type: 'deal_meeting_slot',
    entity_id: data?.id ?? null,
    before_value: null,
    after_value: { starts, ends, approved: false },
    request_ip: h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
    user_agent: h.get('user-agent'),
  });
  revalidatePath('/admin/scheduling');
}

export async function toggleSlot(formData: FormData) {
  const slotId = String(formData.get('slot_id') ?? '');
  const approved = String(formData.get('approved') ?? 'false') === 'true';
  const { user, membership } = await requireMembership('welltory');
  if (!isOwner(membership.role)) throw new Error('Not authorized');
  const svc = getServiceSupabase();
  await svc
    .from('deal_meeting_slots')
    .update({ approved })
    .eq('id', slotId)
    .eq('deal_id', membership.deal_id);
  const h = headers();
  await writeAudit({
    deal_id: membership.deal_id,
    actor_user_id: user.id,
    actor_email: user.email,
    action: 'meeting.slot_upsert',
    entity_type: 'deal_meeting_slot',
    entity_id: slotId,
    before_value: { approved: !approved },
    after_value: { approved },
    request_ip: h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
    user_agent: h.get('user-agent'),
  });
  revalidatePath('/admin/scheduling');
  revalidatePath('/admin');
}
