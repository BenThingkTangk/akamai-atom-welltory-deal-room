import { Card, StatusPill } from '@/components/Shell';
import { getServerSupabase } from '@/lib/supabase/server';
import { publishVersion, rollbackVersion, buildDryRun } from './actions';

export const metadata = { title: 'Versions — Private Deal Workspace' };

export default async function VersionsPage({ searchParams }: { searchParams: { dry?: string } }) {
  const sb = getServerSupabase();
  const { data: deal } = await sb.from('deals').select('id, slug').eq('slug', 'welltory').single();
  const { data: versions } = await sb
    .from('deal_versions')
    .select('*')
    .eq('deal_id', deal?.id)
    .order('version', { ascending: false });

  const dryRun = searchParams.dry === '1' ? await buildDryRun() : null;

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Versions & publishing</p>
        <h1 className="mt-2 text-h2 font-semibold tracking-tight">Immutable snapshots</h1>
      </header>

      <Card title="Prepare a new version">
        <p className="text-sm text-ink-mute">
          Publishing renders only approved or approved-with-conditions content
          into a new immutable version and marks it current. Rollback restores
          an earlier published version.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href="?dry=1" className="rounded-sm border border-line bg-white px-3 py-1.5 text-xs font-semibold hover:border-accent-blue">
            Preview next payload
          </a>
          <form action={publishVersion}>
            <button className="rounded-sm bg-accent-deep px-3 py-1.5 text-xs font-semibold text-white hover:bg-ink">
              Publish new version
            </button>
          </form>
        </div>
        {dryRun && (
          <div className="mt-4">
            {dryRun.violations.length > 0 ? (
              <div className="rounded-sm border border-state-err/40 bg-state-err/5 px-3 py-2 text-xs text-state-err">
                Payload rejected — internal terms detected: {dryRun.violations.join(', ')}
              </div>
            ) : (
              <details className="rounded-sm border border-line bg-surface-soft px-3 py-2">
                <summary className="cursor-pointer text-xs font-semibold">Preview JSON payload ({dryRun.workstreamCount} approved workstreams)</summary>
                <pre className="mt-2 max-h-96 overflow-auto text-[11px] leading-4">{JSON.stringify(dryRun.payload, null, 2)}</pre>
              </details>
            )}
          </div>
        )}
      </Card>

      <Card title="History">
        <ul className="divide-y divide-line text-sm">
          {versions?.map((v) => (
            <li key={v.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <span className="font-mono text-xs">v{v.version}</span>
              <span className="text-ink-mute">{v.published_by_email ?? '—'}</span>
              <time className="text-xs text-ink-mute">{v.published_at ? new Date(v.published_at).toLocaleString() : '—'}</time>
              <StatusPill tone={v.is_current ? 'ok' : 'mute'}>{v.is_current ? 'Current' : 'Historical'}</StatusPill>
              {!v.is_current && (
                <form action={rollbackVersion}>
                  <input type="hidden" name="version_id" value={v.id} />
                  <button className="rounded-sm border border-line bg-white px-2 py-1 text-xs font-semibold hover:border-accent-blue">
                    Roll back to v{v.version}
                  </button>
                </form>
              )}
            </li>
          ))}
          {!versions?.length && <p className="py-4 text-sm text-ink-mute">No versions yet.</p>}
        </ul>
      </Card>
    </div>
  );
}
