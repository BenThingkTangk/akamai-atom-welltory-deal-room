import { Card, PageHeader, StatusPill } from '@/components/Shell';
import { getServerSupabase } from '@/lib/supabase/server';

export const metadata = { title: 'Overview \u2014 Private Deal Workspace' };

export default async function AdminOverviewPage() {
  const sb = getServerSupabase();
  const { data: deal } = await sb.from('deals').select('*').eq('slug', 'welltory').single();
  const { data: assumptions } = await sb
    .from('deal_internal_assumptions')
    .select('key, value_json')
    .eq('deal_id', deal?.id);
  const rangeRow = assumptions?.find((r) => r.key === 'monthly_modeled_range');
  const rangeJson = rangeRow?.value_json as { low_usd?: number; high_usd?: number } | null | undefined;
  const modeledRange =
    rangeJson && rangeJson.low_usd != null && rangeJson.high_usd != null
      ? `$${Math.round(rangeJson.low_usd / 1000)}K\u2013$${Math.round(rangeJson.high_usd / 1000)}K / mo`
      : '\u2014';

  const { data: sections } = await sb
    .from('deal_sections')
    .select('category, field_key, workflow_status, visibility, updated_at')
    .eq('deal_id', deal?.id);
  const { data: comments } = await sb
    .from('deal_comments')
    .select('id, body, created_at, author_email')
    .eq('deal_id', deal?.id)
    .order('created_at', { ascending: false })
    .limit(5);
  const { data: versions } = await sb
    .from('deal_versions')
    .select('version, published_at, published_by_email, is_current')
    .eq('deal_id', deal?.id)
    .order('version', { ascending: false })
    .limit(5);
  const { data: slots } = await sb
    .from('deal_meeting_slots')
    .select('id, starts_at_utc, ends_at_utc, approved')
    .eq('deal_id', deal?.id)
    .eq('approved', true)
    .gt('starts_at_utc', new Date().toISOString())
    .order('starts_at_utc');

  const total = sections?.length ?? 0;
  const approved =
    sections?.filter(
      (s) => s.workflow_status === 'approved' || s.workflow_status === 'approved_with_conditions',
    ).length ?? 0;
  const inReview = sections?.filter((s) => s.workflow_status === 'in_review').length ?? 0;
  const blocked = sections?.filter((s) => s.workflow_status === 'changes_requested').length ?? 0;
  const pctApproved = total ? Math.round((approved / total) * 100) : 0;

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-line/70 bg-accent-deep p-8 text-white shadow-elev3 md:p-12">
        <div className="aurora" aria-hidden />
        <div className="grid-bg absolute inset-0 opacity-40" aria-hidden />
        <div className="relative z-10 grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-end">
          <div className="animate-fade-up">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-accent-cyan">
              Objective
            </p>
            <h1 className="mt-3 font-display text-[2.4rem] font-normal leading-[1.05] tracking-[-0.015em] md:text-[3rem]">
              Land the <em className="not-italic italic text-accent-cyan">seventeen-minute</em>{' '}
              Welltory executive meeting.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75">
              Build a conditional Switch Assurance offer that makes an Akamai
              evaluation easy to accept: competitive economics, low-lift
              migration, API protection, healthcare-security readiness, and
              strategic co-marketing value.
            </p>
          </div>

          <div className="relative animate-fade-up rounded-xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm" style={{ animationDelay: '120ms' }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60">
              Approval progress
            </p>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="kpi text-5xl font-semibold tracking-tight">{pctApproved}%</span>
              <span className="text-sm text-white/60">
                {approved} of {total} sections
              </span>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-cyan via-accent-blue to-accent-cyan"
                style={{ width: `${pctApproved}%` }}
              />
            </div>
            <dl className="mt-6 grid grid-cols-3 gap-4 text-xs">
              <div>
                <dt className="text-white/50">In review</dt>
                <dd className="kpi mt-1 text-lg font-semibold text-accent-cyan">{inReview}</dd>
              </div>
              <div>
                <dt className="text-white/50">Blocked</dt>
                <dd className="kpi mt-1 text-lg font-semibold text-state-warn">{blocked}</dd>
              </div>
              <div>
                <dt className="text-white/50">Approved</dt>
                <dd className="kpi mt-1 text-lg font-semibold text-state-ok">{approved}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Internal summary — restricted context */}
      <PageHeader
        eyebrow="Deal state"
        title="Internal"
        accent="summary"
        description="Modeling assumptions and workflow signal. Never displayed in the customer briefing."
      />

      <section className="grid gap-6 lg:grid-cols-3">
        <Card title="Customer" tone="confidential">
          <p className="serif text-3xl italic tracking-tight text-ink">Welltory</p>
          <p className="mt-2 text-xs uppercase tracking-widest text-ink-mute">Incumbent · Cloudflare</p>
          <div className="mt-6 space-y-2 text-xs text-ink-mute">
            <p>Primary blocker: <span className="text-ink">Migration burden</span></p>
            <p>Expansion: <span className="text-ink">APIs, healthcare readiness, co-marketing</span></p>
          </div>
        </Card>

        <Card title="Modeled range" tone="confidential">
          <p className="kpi serif text-[2.4rem] italic leading-none text-ink">{modeledRange}</p>
          <p className="mt-3 text-xs text-ink-mute">
            Internal modeling assumption. Never displayed in the customer view.
          </p>
        </Card>

        <Card title="Sections" tone="accent">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-[11px] uppercase tracking-widest text-ink-mute">Total</dt>
              <dd className="kpi mt-1 text-2xl font-semibold text-ink">{total}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-widest text-ink-mute">Approved</dt>
              <dd className="kpi mt-1 text-2xl font-semibold text-state-ok">{approved}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-widest text-ink-mute">In review</dt>
              <dd className="kpi mt-1 text-2xl font-semibold text-accent-blue">{inReview}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-widest text-ink-mute">Changes req.</dt>
              <dd className="kpi mt-1 text-2xl font-semibold text-state-warn">{blocked}</dd>
            </div>
          </dl>
        </Card>
      </section>

      {/* Activity */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Card title="Recent edits & comments" description="Latest five deal-room events">
          {comments && comments.length ? (
            <ul className="divide-y divide-line/70 text-sm">
              {comments.map((c) => (
                <li key={c.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="text-ink">{c.body}</p>
                    <p className="mt-0.5 text-xs text-ink-mute">{c.author_email}</p>
                  </div>
                  <time className="shrink-0 whitespace-nowrap text-[11px] text-ink-mute">
                    {new Date(c.created_at).toLocaleString()}
                  </time>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState label="No comments yet" hint="Approvals and edits will appear here." />
          )}
        </Card>

        <Card title="Approved slots" description="Meeting windows already blessed for outreach">
          {slots && slots.length ? (
            <ul className="space-y-2 text-sm">
              {slots.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-md border border-line/60 bg-surface-soft/50 px-3.5 py-2.5"
                >
                  <span className="tabular-nums text-ink">
                    {new Date(s.starts_at_utc).toLocaleString()} \u2192{' '}
                    {new Date(s.ends_at_utc).toLocaleTimeString()}
                  </span>
                  <StatusPill tone="ok">Approved</StatusPill>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState label="No approved future slots yet" hint="Propose windows in Scheduling." />
          )}
        </Card>
      </section>

      {/* Versions */}
      <section>
        <Card title="Recent versions" description="Every publish is versioned and audit-logged">
          {versions && versions.length ? (
            <ul className="divide-y divide-line/70 text-sm">
              {versions.map((v) => (
                <li key={v.version} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 py-3">
                  <span className="rounded-full border border-line bg-surface-soft px-2.5 py-0.5 font-mono text-[11px]">
                    v{v.version}
                  </span>
                  <span className="truncate text-ink-mute">{v.published_by_email ?? '\u2014'}</span>
                  <time className="tabular-nums text-[11px] text-ink-mute">
                    {v.published_at ? new Date(v.published_at).toLocaleString() : 'Not published'}
                  </time>
                  <StatusPill tone={v.is_current ? 'ok' : 'mute'}>
                    {v.is_current ? 'Current' : 'Historical'}
                  </StatusPill>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState label="No versions yet" hint="Publish the customer briefing to create v1." />
          )}
        </Card>
      </section>
    </div>
  );
}

function EmptyState({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="flex flex-col items-start gap-1 rounded-md border border-dashed border-line/80 bg-surface-soft/40 px-4 py-6">
      <p className="text-sm font-medium text-ink">{label}</p>
      <p className="text-xs text-ink-mute">{hint}</p>
    </div>
  );
}
