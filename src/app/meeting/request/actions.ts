'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerSupabase, getServiceSupabase } from '@/lib/supabase/server';
import { validateMeetingRequest } from '@/lib/meetingRequest';
import { rateLimit } from '@/lib/rateLimit';
import { writeAudit } from '@/lib/audit';

export async function submitMeetingRequest(formData: FormData) {
  const h = headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const limit = rateLimit(`meeting:ip:${ip}`, 5, 60_000);
  if (!limit.ok) {
    redirect('/meeting/request?sent=1');
  }

  const raw = {
    name: formData.get('name'),
    work_email: String(formData.get('work_email') ?? '').toLowerCase().trim(),
    role_title: formData.get('role_title'),
    slot_id: formData.get('slot_id'),
    time_zone: formData.get('time_zone'),
    note: formData.get('note') || null,
  };
  const parsed = validateMeetingRequest(raw);
  if (!parsed.ok) {
    // Never leak validation details on the customer surface.
    redirect('/meeting/request?sent=1');
  }

  const sb = getServerSupabase();
  const { data: deal } = await sb.from('deals').select('id').eq('slug', 'welltory').single();
  if (!deal) redirect('/meeting/request?sent=1');

  // Verify the chosen slot exists AND is approved AND still in the future.
  const { data: slot } = await sb
    .from('deal_meeting_slots')
    .select('id, approved, starts_at_utc')
    .eq('id', parsed.value.slot_id)
    .eq('deal_id', deal.id)
    .maybeSingle();
  if (!slot || !slot.approved || Date.parse(slot.starts_at_utc) <= Date.now()) {
    // Slot invalid — record as pending with note and no slot binding.
    const svc = getServiceSupabase();
    await svc.from('meeting_requests').insert({
      deal_id: deal.id,
      name: parsed.value.name,
      work_email: parsed.value.work_email,
      role_title: parsed.value.role_title,
      slot_id: null,
      time_zone: parsed.value.time_zone,
      note: parsed.value.note ?? null,
      request_ip: ip,
      status: 'pending',
    });
    redirect('/meeting/request?sent=1');
  }

  const svc = getServiceSupabase();
  const { data: inserted } = await svc
    .from('meeting_requests')
    .insert({
      deal_id: deal.id,
      name: parsed.value.name,
      work_email: parsed.value.work_email,
      role_title: parsed.value.role_title,
      slot_id: slot.id,
      time_zone: parsed.value.time_zone,
      note: parsed.value.note ?? null,
      request_ip: ip,
      status: 'pending',
    })
    .select('id')
    .single();

  await writeAudit({
    deal_id: deal.id,
    actor_user_id: null,
    actor_email: parsed.value.work_email,
    action: 'meeting.request_create',
    entity_type: 'meeting_request',
    entity_id: inserted?.id ?? null,
    before_value: null,
    after_value: { slot_id: slot.id, time_zone: parsed.value.time_zone },
    request_ip: ip,
    user_agent: h.get('user-agent'),
  });

  redirect('/meeting/request?sent=1');
}
