'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { getServerSupabase, getServiceSupabase } from '@/lib/supabase/server';
import { requireMembership } from '@/lib/auth';
import { canPublish, canRollback } from '@/lib/roles';
import { writeAudit } from '@/lib/audit';
import { buildCustomerPayload, guardCustomerPayload } from '@/lib/publish';
import { filterCustomerSlots } from '@/lib/meetingSlots';

async function assembleApprovedPayload(dealId: string, dealSlug: string) {
  const sb = getServerSupabase();
  const { data: sections } = await sb
    .from('deal_sections')
    .select('*')
    .eq('deal_id', dealId)
    .in('workflow_status', ['approved', 'approved_with_conditions'])
    .in('visibility', ['approved_for_customer', 'published']);

  const findApproved = (key: string) =>
    sections?.find((s) => s.field_key === key)?.approved_value ?? '';

  const workstreams = ['commercial', 'migration', 'api_security', 'healthcare', 'co_marketing'].map((key) => {
    const s = sections?.find((row) => row.field_key === `${key}.customer_language`);
    return s
      ? {
          key,
          title: titleFor(key),
          customer_language: s.approved_value ?? '',
          workflow_status: s.workflow_status,
          visibility: s.visibility,
          conditions: s.workflow_status === 'approved_with_conditions'
            ? sections?.find((r) => r.field_key === `${key}.conditions`)?.approved_value ?? undefined
            : undefined,
        }
      : null;
  }).filter((x): x is NonNullable<typeof x> => x !== null);

  const { data: slots } = await sb
    .from('deal_meeting_slots')
    .select('id, starts_at_utc, ends_at_utc, approved')
    .eq('deal_id', dealId);
  const approvedSlots = filterCustomerSlots(slots ?? []);

  const payload = buildCustomerPayload({
    deal_slug: dealSlug,
    version: 0, // set at publish time
    published_at: new Date().toISOString(),
    hero: {
      eyebrow: findApproved('hero.eyebrow') || 'Private executive briefing for Welltory',
      headline: findApproved('hero.headline') || 'Secure and scale Welltory\u2019s next chapter in AI-powered health.',
      supporting: findApproved('hero.supporting') ||
        'A focused Akamai evaluation spanning competitive infrastructure economics, low-risk transition planning, application and API protection, and healthcare-security readiness.',
      primary_cta: findApproved('hero.primary_cta') || 'Choose a 17-minute briefing',
      secondary_cta: findApproved('hero.secondary_cta') || 'See the proposed framework',
    },
    trust_strip: [
      'Competitive evaluation',
      'Controlled transition',
      'API-first protection',
      'Healthcare-ready architecture',
    ],
    why_now: [
      'Welltory\u2019s expanding AI and integration ecosystem increases the importance of API visibility and protection.',
      'Clinical and professional experiences introduce new security, assurance, and operational questions.',
      'Infrastructure economics should preserve capital for product growth.',
      'A provider transition must protect performance and avoid consuming the engineering roadmap.',
    ],
    workstreams,
    meeting: {
      headline: 'Seventeen minutes to determine whether a formal Akamai proposal is warranted.',
      copy: 'Give the joint team 17 minutes to validate whether Akamai can materially improve the economics, migration burden, and security posture. If the required conditions are not achievable, the team will say so directly and close the loop.',
      agenda: [
        '0\u20133 minutes: Welltory priorities and timing',
        '3\u20138 minutes: Delivery, application, and API footprint',
        '8\u201312 minutes: Migration constraints and contract timing',
        '12\u201315 minutes: Healthcare and clinical-security direction',
        '15\u201317 minutes: Decide whether to produce a formal proposal',
      ],
      slots: approvedSlots.map((s) => ({
        id: s.id,
        starts_at_utc: s.starts_at_utc,
        ends_at_utc: s.ends_at_utc,
      })),
      cta_primary: 'Request this 17-minute briefing',
      cta_alt: 'None of these work',
    },
    footer: {
      lockup: 'Akamai \u00d7 ATOM',
      qualifier:
        'Private executive briefing \u00b7 Subject to technical discovery, commercial approval, contracting, and applicable service terms.',
    },
  });

  const guard = guardCustomerPayload(payload);
  return { payload, guard, workstreamCount: workstreams.length };
}

function titleFor(key: string): string {
  return (
    ({
      commercial: 'Economics',
      migration: 'Migration assurance',
      api_security: 'Application & API protection',
      healthcare: 'Healthcare-security readiness',
      co_marketing: 'Strategic co-marketing',
    } as Record<string, string>)[key] ?? key
  );
}

export async function buildDryRun() {
  const { membership } = await requireMembership('welltory');
  const { payload, guard, workstreamCount } = await assembleApprovedPayload(membership.deal_id, membership.deal_slug);
  return { payload, violations: guard.violations, workstreamCount };
}

export async function publishVersion() {
  const { user, membership } = await requireMembership('welltory');
  if (!canPublish(membership.role)) throw new Error('Not authorized to publish');

  const svc = getServiceSupabase();
  const { data: latest } = await svc
    .from('deal_versions')
    .select('version')
    .eq('deal_id', membership.deal_id)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextVersion = (latest?.version ?? 0) + 1;

  const { payload, guard } = await assembleApprovedPayload(membership.deal_id, membership.deal_slug);
  if (!guard.ok) throw new Error(`Publish rejected. Internal terms detected: ${guard.violations.join(', ')}`);

  const finalPayload = { ...payload, version: nextVersion };

  // Insert immutable version snapshot
  const { data: version, error: verErr } = await svc
    .from('deal_versions')
    .insert({
      deal_id: membership.deal_id,
      version: nextVersion,
      snapshot: finalPayload,
      published_by_user_id: user.id,
      published_by_email: user.email,
      published_at: new Date().toISOString(),
      is_current: true,
    })
    .select('*')
    .single();
  if (verErr || !version) throw new Error('Failed to record version');

  // Unset previous current, set this current (also enforced by DB partial unique index).
  await svc.from('deal_versions').update({ is_current: false }).eq('deal_id', membership.deal_id).neq('id', version.id);

  // Upsert published_briefing (one row per deal).
  await svc
    .from('published_briefing')
    .upsert(
      {
        deal_id: membership.deal_id,
        current_version_id: version.id,
        snapshot: finalPayload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'deal_id' },
    );

  const h = headers();
  await writeAudit({
    deal_id: membership.deal_id,
    actor_user_id: user.id,
    actor_email: user.email,
    action: 'version.publish',
    entity_type: 'deal_version',
    entity_id: version.id,
    before_value: null,
    after_value: { version: nextVersion },
    request_ip: h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
    user_agent: h.get('user-agent'),
  });

  revalidatePath('/admin/versions');
  revalidatePath('/preview');
  revalidatePath('/briefing');
}

export async function rollbackVersion(formData: FormData) {
  const versionId = String(formData.get('version_id') ?? '');
  const { user, membership } = await requireMembership('welltory');
  if (!canRollback(membership.role)) throw new Error('Not authorized to roll back');

  const svc = getServiceSupabase();
  const { data: target } = await svc
    .from('deal_versions')
    .select('*')
    .eq('id', versionId)
    .eq('deal_id', membership.deal_id)
    .single();
  if (!target) throw new Error('Version not found');

  await svc.from('deal_versions').update({ is_current: false }).eq('deal_id', membership.deal_id);
  await svc.from('deal_versions').update({ is_current: true }).eq('id', versionId);
  await svc
    .from('published_briefing')
    .upsert(
      {
        deal_id: membership.deal_id,
        current_version_id: versionId,
        snapshot: target.snapshot,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'deal_id' },
    );

  const h = headers();
  await writeAudit({
    deal_id: membership.deal_id,
    actor_user_id: user.id,
    actor_email: user.email,
    action: 'version.rollback',
    entity_type: 'deal_version',
    entity_id: versionId,
    before_value: null,
    after_value: { version: target.version },
    request_ip: h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
    user_agent: h.get('user-agent'),
  });

  revalidatePath('/admin/versions');
  revalidatePath('/preview');
  revalidatePath('/briefing');
}
