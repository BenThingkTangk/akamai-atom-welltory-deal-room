import { Card, StatusPill } from '@/components/Shell';
import { getServerSupabase } from '@/lib/supabase/server';

export const metadata = { title: 'Overview — Private Deal Workspace' };

export default async function AdminOverviewPage() {
  const sb = getServerSupabase();
  const { data: deal } = await sb.from('deals').select('*').eq('slug', 'welltory').single();
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
    sections?.filter((s) => s.workflow_status === 'approved' || s.workflow_status === 'approved_with_conditions').length ?? 0;
  const inReview = sections?.filter((s) => s.workflow_status === 'in_review').length ?? 0;
  const blocked = sections?.filter((s) => s.workflow_status === 'changes_requested').length ?? 0;

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-3">
        <Card title="Deal objective">
          <p className="text-lg font-semibold tracking-tight text-ink">
            Land the 17-minute Welltory executive meeting.
          </p>
          <p className="mt-2 text-sm text-ink-mute">
            Build a conditional Switch Assurance offer that makes an Akamai
            evaluation easy to accept: competitive economics, low-lift
            migration, API protection, healthcare-security readiness, and
            strategic co-marketing value.
          </p>
        </Card>
        <Card title="Approval progress">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-ink-mute">Sections</dt><dd className="text-lg font-semibold">{total}</dd></div>
            <div><dt className="text-ink-mute">Approved</dt><dd className="text-lg font-semibold text-state-ok">{approved}</dd></div>
            <div><dt className="text-ink-mute">In review</dt><dd className="text-lg font-semibold text-accent-blue">{inReview}</dd></div>
            <div><dt className="text-ink-mute">Changes requested</dt><dd className="text-lg font-semibold text-state-warn">{blocked}</dd></div>
          </dl>
        </Card>
        <Card title="Internal summary" description="Internal modeling assumption — never display in customer view">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between border-b border-line pb-2"><dt className="text-ink-mute">Customer</dt><dd>Welltory</dd></div>
            <div className="flex justify-between border-b border-line pb-2"><dt className="text-ink-mute">Incumbent</dt><dd>Cloudflare</dd></div>
            <div className="flex justify-between border-b border-line pb-2"><dt className="text-ink-mute">Modeled range</dt><dd className="font-mono">$30K–$40K / mo</dd></div>
            <div className="flex justify-between border-b border-line pb-2"><dt className="text-ink-mute">Primary blocker</dt><dd>Migration burden</dd></div>
            <div className="flex justify-between"><dt className="text-ink-mute">Strategic expansion</dt><dd className="text-right">APIs, healthcare readiness, co-marketing</dd></div>
          </dl>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card title="Recent edits & comments">
          {comments && comments.length ? (
            <ul className="divide-y divide-line text-sm">
              {comments.map((c) => (
                <li key={c.id} className="flex items-start justify-between gap-4 py-3">
                  <div>
                    <p className="text-ink">{c.body}</p>
                    <p className="text-xs text-ink-mute">{c.author_email}</p>
                  </div>
                  <time className="text-xs text-ink-mute">{new Date(c.created_at).toLocaleString()}</time>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-mute">No comments yet.</p>
          )}
        </Card>
        <Card title="Approved slots">
          {slots && slots.length ? (
            <ul className="space-y-2 text-sm">
              {slots.map((s) => (
                <li key={s.id} className="flex items-center justify-between rounded-sm border border-line px-3 py-2">
                  <span>{new Date(s.starts_at_utc).toLocaleString()} → {new Date(s.ends_at_utc).toLocaleTimeString()}</span>
                  <StatusPill tone="ok">Approved</StatusPill>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-mute">No approved future slots yet.</p>
          )}
        </Card>
      </section>

      <section>
        <Card title="Recent versions">
          {versions && versions.length ? (
            <ul className="divide-y divide-line text-sm">
              {versions.map((v) => (
                <li key={v.version} className="flex items-center justify-between py-3">
                  <span className="font-mono text-xs">v{v.version}</span>
                  <span className="text-ink-mute">{v.published_by_email ?? '—'}</span>
                  <time className="text-xs text-ink-mute">{v.published_at ? new Date(v.published_at).toLocaleString() : 'Not published'}</time>
                  <StatusPill tone={v.is_current ? 'ok' : 'mute'}>{v.is_current ? 'Current' : 'Historical'}</StatusPill>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-mute">No versions yet.</p>
          )}
        </Card>
      </section>
    </div>
  );
}
