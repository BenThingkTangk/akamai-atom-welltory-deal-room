import { Card, StatusPill } from '@/components/Shell';
import { getServerSupabase } from '@/lib/supabase/server';
import { decideSection, addComment } from './actions';

export const metadata = { title: 'Review — Private Deal Workspace' };

export default async function ReviewPage() {
  const sb = getServerSupabase();
  const { data: deal } = await sb.from('deals').select('id').eq('slug', 'welltory').single();
  const { data: sections } = await sb
    .from('deal_sections')
    .select('*')
    .eq('deal_id', deal?.id)
    .in('workflow_status', ['in_review', 'changes_requested'])
    .order('updated_at', { ascending: false });

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Review queue</p>
        <h1 className="mt-2 text-h2 font-semibold tracking-tight">Awaiting decision</h1>
      </header>
      {!sections?.length && <p className="text-sm text-ink-mute">Nothing awaiting review.</p>}
      <div className="grid gap-4">
        {sections?.map((s) => (
          <Card key={s.id} title={`${s.category} · ${s.field_key}`}>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <StatusPill tone="mute">{s.workflow_status.replace(/_/g, ' ')}</StatusPill>
              <StatusPill tone="mute">rev {s.revision}</StatusPill>
              <span className="text-ink-mute">Last edit {new Date(s.updated_at).toLocaleString()}</span>
            </div>
            <p className="mt-3 whitespace-pre-wrap rounded-sm border border-line bg-surface-soft px-3 py-2 text-sm">{s.draft_value}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <form action={decideSection} className="space-y-2 rounded-sm border border-line p-3">
                <input type="hidden" name="section_id" value={s.id} />
                <input type="hidden" name="expected_revision" value={s.revision} />
                <label className="block text-xs font-medium uppercase tracking-widest text-ink-mute">
                  Decision
                  <select name="decision" className="mt-2 block w-full rounded-sm border border-line bg-white px-3 py-1.5 text-sm">
                    <option value="approve">Approve</option>
                    <option value="approve_with_conditions">Approve with conditions</option>
                    <option value="request_changes">Request changes</option>
                    <option value="exclude">Exclude</option>
                  </select>
                </label>
                <label className="block text-xs font-medium uppercase tracking-widest text-ink-mute">
                  Note / conditions
                  <textarea name="note" rows={3} className="mt-2 block w-full rounded-sm border border-line bg-white px-3 py-2 text-sm" />
                </label>
                <button className="rounded-sm bg-accent-deep px-3 py-1.5 text-xs font-semibold text-white hover:bg-ink">
                  Record decision
                </button>
              </form>
              <form action={addComment} className="space-y-2 rounded-sm border border-line p-3">
                <input type="hidden" name="section_id" value={s.id} />
                <label className="block text-xs font-medium uppercase tracking-widest text-ink-mute">
                  Comment
                  <textarea name="body" rows={3} className="mt-2 block w-full rounded-sm border border-line bg-white px-3 py-2 text-sm" />
                </label>
                <button className="rounded-sm border border-line bg-white px-3 py-1.5 text-xs font-semibold hover:border-accent-blue">
                  Post comment
                </button>
              </form>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
