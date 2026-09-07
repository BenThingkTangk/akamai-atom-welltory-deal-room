import { Card, StatusPill } from '@/components/Shell';
import { getServerSupabase } from '@/lib/supabase/server';

export const metadata = { title: 'Commitments — Private Deal Workspace' };

export default async function CommitmentsPage() {
  const sb = getServerSupabase();
  const { data: deal } = await sb.from('deals').select('id').eq('slug', 'welltory').single();
  const { data: commitments } = await sb
    .from('deal_commitments')
    .select('*')
    .eq('deal_id', deal?.id)
    .order('category');
  const { data: discovery } = await sb
    .from('deal_discovery_items')
    .select('*')
    .eq('deal_id', deal?.id)
    .order('label');

  return (
    <div className="space-y-8">
      <section>
        <header className="mb-3">
          <p className="eyebrow">Commitments</p>
          <h1 className="text-h2 font-semibold tracking-tight">Approved-with-conditions and conditional offers</h1>
        </header>
        <div className="grid gap-4">
          {commitments?.map((c) => (
            <Card key={c.id} title={c.title}>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <StatusPill tone="mute">{c.category}</StatusPill>
                <StatusPill tone={c.status === 'approved' ? 'ok' : c.status === 'approved_with_conditions' ? 'warn' : 'mute'}>
                  {c.status.replace(/_/g, ' ')}
                </StatusPill>
              </div>
              <p className="mt-3 text-sm">{c.customer_language}</p>
              {c.conditions && (
                <details className="mt-2 rounded-sm border border-line bg-surface-soft px-3 py-2 text-xs">
                  <summary className="cursor-pointer">Conditions</summary>
                  <p className="mt-2 whitespace-pre-wrap">{c.conditions}</p>
                </details>
              )}
            </Card>
          ))}
          {!commitments?.length && <p className="text-sm text-ink-mute">No commitments seeded yet.</p>}
        </div>
      </section>

      <section>
        <header className="mb-3">
          <p className="eyebrow">Discovery checklist</p>
          <h2 className="text-h2 font-semibold tracking-tight">What we need to validate</h2>
        </header>
        <Card>
          <ul className="divide-y divide-line text-sm">
            {discovery?.map((d) => (
              <li key={d.id} className="flex items-center justify-between py-3">
                <span>{d.label}</span>
                <StatusPill tone={d.status === 'known' ? 'ok' : d.status === 'ask_in_meeting' ? 'warn' : 'mute'}>
                  {d.status.replace(/_/g, ' ')}
                </StatusPill>
              </li>
            ))}
            {!discovery?.length && <p className="py-4 text-sm text-ink-mute">No discovery items seeded yet.</p>}
          </ul>
        </Card>
      </section>
    </div>
  );
}
