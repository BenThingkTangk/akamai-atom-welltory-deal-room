'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { getServerSupabase } from '@/lib/supabase/server';
import { requireMembership } from '@/lib/auth';
import { canEditCategory } from '@/lib/roles';
import { writeAudit } from '@/lib/audit';
import type { SectionCategory } from '@/lib/roles';

export async function updateSection(formData: FormData) {
  const sectionId = String(formData.get('section_id') ?? '');
  const expectedRevision = Number(formData.get('expected_revision') ?? -1);
  const draftValue = String(formData.get('draft_value') ?? '');
  const op = String(formData.get('op') ?? 'save');

  if (!sectionId) throw new Error('Missing section');

  const { user, membership } = await requireMembership('welltory');
  const sb = getServerSupabase();

  const { data: existing, error: readErr } = await sb
    .from('deal_sections')
    .select('id, category, revision, draft_value, workflow_status, deal_id')
    .eq('id', sectionId)
    .single();
  if (readErr || !existing) throw new Error('Section not found');
  if (existing.deal_id !== membership.deal_id) throw new Error('Cross-deal edit blocked');

  const category = existing.category as SectionCategory;
  if (!canEditCategory(membership.role, category)) throw new Error('Not authorized for this category');

  if (existing.revision !== expectedRevision) {
    throw new Error(`Revision conflict: your view was rev ${expectedRevision}, current is rev ${existing.revision}. Reload and reapply.`);
  }

  const nextWorkflow = op === 'submit_review' ? 'in_review' : existing.workflow_status;

  const { data: updated, error: writeErr } = await sb
    .from('deal_sections')
    .update({
      draft_value: draftValue,
      revision: existing.revision + 1,
      workflow_status: nextWorkflow,
      last_editor: user.email,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sectionId)
    .eq('revision', existing.revision)
    .select('*')
    .single();

  if (writeErr || !updated) throw new Error('Concurrent update — refresh and retry.');

  const h = headers();
  await writeAudit({
    deal_id: membership.deal_id,
    actor_user_id: user.id,
    actor_email: user.email,
    action: op === 'submit_review' ? 'section.submit_for_review' : 'section.update',
    entity_type: 'deal_section',
    entity_id: sectionId,
    before_value: { draft_value: existing.draft_value, workflow_status: existing.workflow_status, revision: existing.revision },
    after_value: { draft_value: draftValue, workflow_status: nextWorkflow, revision: existing.revision + 1 },
    request_ip: h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
    user_agent: h.get('user-agent'),
  });

  revalidatePath('/admin/content');
  revalidatePath('/admin');
}
