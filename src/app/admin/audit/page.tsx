import { Card } from '@/components/Shell';
import { getServerSupabase } from '@/lib/supabase/server';

export const metadata = { title: 'Audit — Private Deal Workspace' };

export default async function AuditPage() {
  const sb = getServerSupabase();
  const { data: deal } = await sb.from('deals').select('id').eq('slug', 'welltory').single();
  const { data: rows } = await sb
    .from('deal_audit_log')
    .select('*')
    .eq('deal_id', deal?.id)
    .order('created_at', { ascending: false })
    .limit(200);

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Audit log</p>
        <h1 className="mt-2 text-h2 font-semibold tracking-tight">Recent activity</h1>
      </header>
      <Card>
        <table className="w-full text-left text-xs">
          <thead className="border-b border-line text-ink-mute">
            <tr>
              <th className="py-2 pr-2">When</th>
              <th className="py-2 pr-2">Actor</th>
              <th className="py-2 pr-2">Action</th>
              <th className="py-2 pr-2">Entity</th>
              <th className="py-2 pr-2">IP</th>
            </tr>
          </thead>
          <tbody>
            {rows?.map((r) => (
              <tr key={r.id} className="border-b border-line last:border-0">
                <td className="py-2 pr-2 font-mono">{new Date(r.created_at).toLocaleString()}</td>
                <td className="py-2 pr-2">{r.actor_email ?? 'system'}</td>
                <td className="py-2 pr-2">{r.action}</td>
                <td className="py-2 pr-2">{r.entity_type}:{r.entity_id ?? '—'}</td>
                <td className="py-2 pr-2 font-mono">{r.request_ip ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows?.length && <p className="py-4 text-sm text-ink-mute">No audit entries yet.</p>}
      </Card>
    </div>
  );
}
