'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { getServerSupabase } from '@/lib/supabase/server';
import { requireMembership } from '@/lib/auth';
import { canApproveCategory, canComment } from '@/lib/roles';
import { writeAudit } from '@/lib/audit';
import type { SectionCategory } from '@/lib/roles';

type Decision = 'approve' | 'approve_with_conditions' | 'request_changes' | 'exclude';

export async function decideSection(formData: FormData) {
  const sectionId = String(formData.get('section_id') ?? '');
  const decision = String(formData.get('decision') ?? '') as Decision;
  const note = String(formData.get('note') ?? '').trim();
  const expectedRevision = Number(formData.get('expected_revision') ?? -1);

  const { user, membership } = await requireMembership('welltory');
  const sb = getServerSupabase();
  const { data: existing } = await sb.from('deal_sections').select('*').eq('id', sectionId).single();
  if (!existing || existing.deal_id !== membership.deal_id) throw new Error('Section not found');
  if (existing.revision !== expectedRevision) throw new Error('Revision conflict.');
  const category = existing.category as SectionCategory;
  if (!canApproveCategory(membership.role, category)) throw new Error('Not authorized for this category');

  let nextStatus: string;
  let nextVisibility = existing.visibility;
  let approvedValue: string | null = existing.approved_value;
  switch (decision) {
    case 'approve':
      nextStatus = 'approved';
      nextVisibility = 'approved_for_customer';
      approvedValue = existing.draft_value;
      break;
    case 'approve_with_conditions':
      nextStatus = 'approved_with_conditions';
      nextVisibility = 'approved_for_customer';
      approvedValue = existing.draft_value;
      break;
    case 'request_changes':
      nextStatus = 'changes_requested';
      break;
    case 'exclude':
      nextStatus = 'excluded';
      nextVisibility = 'internal_only';
      approvedValue = null;
      break;
    default:
      throw new Error('Invalid decision');
  }

  const { error: updErr } = await sb
    .from('deal_sections')
    .update({
      workflow_status: nextStatus,
      visibility: nextVisibility,
      approved_value: approvedValue,
      revision: existing.revision + 1,
      last_editor: user.email,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sectionId)
    .eq('revision', existing.revision);
  if (updErr) throw new Error('Concurrent update — refresh and retry.');

  await sb.from('deal_approvals').insert({
    deal_id: membership.deal_id,
    section_id: sectionId,
    approver_user_id: user.id,
    approver_email: user.email,
    decision: nextStatus,
    note: note || null,
  });

  const h = headers();
  await writeAudit({
    deal_id: membership.deal_id,
    actor_user_id: user.id,
    actor_email: user.email,
    action: decision === 'approve' || decision === 'approve_with_conditions'
      ? 'section.approve'
      : decision === 'request_changes'
      ? 'section.request_changes'
      : 'section.exclude',
    entity_type: 'deal_section',
    entity_id: sectionId,
    before_value: { workflow_status: existing.workflow_status, visibility: existing.visibility },
    after_value: { workflow_status: nextStatus, visibility: nextVisibility, note },
    request_ip: h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
    user_agent: h.get('user-agent'),
  });

  revalidatePath('/admin/review');
  revalidatePath('/admin/content');
  revalidatePath('/admin');
}

export async function addComment(formData: FormData) {
  const sectionId = String(formData.get('section_id') ?? '');
  const body = String(formData.get('body') ?? '').trim();
  if (!body) return;
  const { user, membership } = await requireMembership('welltory');
  if (!canComment(membership.role)) throw new Error('Guests cannot comment');
  const sb = getServerSupabase();
  const { data } = await sb
    .from('deal_comments')
    .insert({
      deal_id: membership.deal_id,
      section_id: sectionId,
      author_user_id: user.id,
      author_email: user.email,
      body,
    })
    .select('id')
    .single();

  const h = headers();
  await writeAudit({
    deal_id: membership.deal_id,
    actor_user_id: user.id,
    actor_email: user.email,
    action: 'comment.create',
    entity_type: 'deal_comment',
    entity_id: data?.id ?? null,
    before_value: null,
    after_value: { section_id: sectionId, body },
    request_ip: h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
    user_agent: h.get('user-agent'),
  });

  revalidatePath('/admin/review');
}
