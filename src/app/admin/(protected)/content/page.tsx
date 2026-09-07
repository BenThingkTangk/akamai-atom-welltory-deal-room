import { Card, StatusPill } from '@/components/Shell';
import { getServerSupabase } from '@/lib/supabase/server';
import { updateSection } from './actions';

export const metadata = { title: 'Content — Private Deal Workspace' };

export default async function AdminContentPage() {
  const sb = getServerSupabase();
  const { data: deal } = await sb.from('deals').select('id').eq('slug', 'welltory').single();
  const { data: sections } = await sb
    .from('deal_sections')
    .select('*')
    .eq('deal_id', deal?.id)
    .order('category')
    .order('field_key');

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Content editor</p>
        <h1 className="mt-2 text-h2 font-semibold tracking-tight">Structured fields</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-mute">
          Edit draft values below. Saving never publishes. Submit for review to
          request an approval. Optimistic concurrency detects and blocks stale
          writes.
        </p>
      </header>
      <div className="grid gap-4">
        {sections?.map((s) => (
          <Card key={s.id} title={`${s.category} · ${s.field_key}`}>
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-mute">
              <StatusPill tone={workflowTone(s.workflow_status)}>{s.workflow_status.replace(/_/g, ' ')}</StatusPill>
              <StatusPill tone="mute">{s.visibility.replace(/_/g, ' ')}</StatusPill>
              <span>rev {s.revision}</span>
              {s.character_guidance && <span>· {s.character_guidance}</span>}
              {s.last_editor && <span>· last edit {new Date(s.updated_at).toLocaleString()}</span>}
            </div>
            <form action={updateSection} className="mt-3 space-y-3">
              <input type="hidden" name="section_id" value={s.id} />
              <input type="hidden" name="expected_revision" value={s.revision} />
              <label className="block text-xs font-medium uppercase tracking-widest text-ink-mute">
                Draft value
                <textarea
                  name="draft_value"
                  defaultValue={s.draft_value}
                  rows={4}
                  className="mt-2 block w-full rounded-sm border border-line bg-white px-3 py-2 font-sans text-sm text-ink outline-none focus:border-accent-blue"
                />
              </label>
              {s.approved_value !== null && (
                <details className="rounded-sm border border-line bg-surface-soft px-3 py-2 text-xs text-ink-mute">
                  <summary className="cursor-pointer">Approved value</summary>
                  <p className="mt-2 whitespace-pre-wrap">{s.approved_value}</p>
                </details>
              )}
              <div className="flex flex-wrap gap-2">
                <button
                  name="op"
                  value="save"
                  type="submit"
                  className="rounded-sm border border-line bg-white px-3 py-1.5 text-xs font-semibold hover:border-accent-blue"
                >
                  Save draft
                </button>
                <button
                  name="op"
                  value="submit_review"
                  type="submit"
                  className="rounded-sm bg-accent-deep px-3 py-1.5 text-xs font-semibold text-white hover:bg-ink"
                >
                  Submit for review
                </button>
              </div>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}

function workflowTone(s: string): 'ok' | 'warn' | 'err' | 'mute' {
  if (s.startsWith('approved')) return 'ok';
  if (s === 'in_review') return 'mute';
  if (s === 'changes_requested') return 'warn';
  if (s === 'excluded') return 'err';
  return 'mute';
}
