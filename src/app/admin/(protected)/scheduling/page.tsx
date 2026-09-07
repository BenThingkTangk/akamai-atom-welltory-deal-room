import { Card, StatusPill } from '@/components/Shell';
import { getServerSupabase } from '@/lib/supabase/server';
import { addSlot, toggleSlot, upsertAttendee } from './actions';

export const metadata = { title: 'Scheduling — Private Deal Workspace' };

const ROLE_SLOTS = [
  'Akamai account executive',
  'Solutions engineer',
  'Migration / services lead',
  'App & API Security specialist',
  'Guardicore / segmentation specialist',
  'Healthcare or compliance specialist',
  'ATOM strategy lead',
];

export default async function SchedulingPage() {
  const sb = getServerSupabase();
  const { data: deal } = await sb.from('deals').select('id').eq('slug', 'welltory').single();
  const { data: attendees } = await sb
    .from('deal_attendees')
    .select('*')
    .eq('deal_id', deal?.id);
  const { data: slots } = await sb
    .from('deal_meeting_slots')
    .select('*')
    .eq('deal_id', deal?.id)
    .order('starts_at_utc');
  const { data: requests } = await sb
    .from('meeting_requests')
    .select('*')
    .eq('deal_id', deal?.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Scheduling</p>
        <h1 className="mt-2 text-h2 font-semibold tracking-tight">Attendees, slots, and requests</h1>
      </header>

      <Card title="Attendee role slots">
        <p className="text-sm text-ink-mute">Edit role assignments — leave blank to keep a role unnamed.</p>
        <ul className="mt-3 grid gap-3 md:grid-cols-2">
          {ROLE_SLOTS.map((role) => {
            const a = attendees?.find((x) => x.role_slot === role);
            return (
              <li key={role} className="rounded-sm border border-line p-3">
                <p className="text-xs uppercase tracking-widest text-ink-mute">{role}</p>
                <form action={upsertAttendee} className="mt-2 grid gap-2 md:grid-cols-2">
                  <input type="hidden" name="role_slot" value={role} />
                  <input
                    name="display_name"
                    placeholder="Display name (optional)"
                    defaultValue={a?.display_name ?? ''}
                    className="rounded-sm border border-line bg-white px-2 py-1 text-sm"
                  />
                  <input
                    name="email"
                    type="email"
                    placeholder="Email (optional)"
                    defaultValue={a?.email ?? ''}
                    className="rounded-sm border border-line bg-white px-2 py-1 text-sm"
                  />
                  <button className="rounded-sm border border-line bg-white px-2 py-1 text-xs font-semibold hover:border-accent-blue md:col-span-2">
                    Save
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card title="Add meeting slot (UTC)">
        <form action={addSlot} className="grid gap-3 md:grid-cols-3">
          <label className="text-xs uppercase tracking-widest text-ink-mute">
            Start (UTC ISO)
            <input name="starts_at_utc" required placeholder="2026-09-15T14:00:00Z" className="mt-2 block w-full rounded-sm border border-line bg-white px-2 py-1 text-sm" />
          </label>
          <label className="text-xs uppercase tracking-widest text-ink-mute">
            End (UTC ISO)
            <input name="ends_at_utc" required placeholder="2026-09-15T14:17:00Z" className="mt-2 block w-full rounded-sm border border-line bg-white px-2 py-1 text-sm" />
          </label>
          <div className="flex items-end">
            <button className="rounded-sm bg-accent-deep px-3 py-1.5 text-xs font-semibold text-white hover:bg-ink">Add slot</button>
          </div>
        </form>
      </Card>

      <Card title="All slots">
        <ul className="divide-y divide-line text-sm">
          {slots?.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <span className="font-mono text-xs">{s.starts_at_utc} → {s.ends_at_utc}</span>
              <StatusPill tone={s.approved ? 'ok' : 'mute'}>{s.approved ? 'Approved' : 'Pending'}</StatusPill>
              <form action={toggleSlot}>
                <input type="hidden" name="slot_id" value={s.id} />
                <input type="hidden" name="approved" value={s.approved ? 'false' : 'true'} />
                <button className="rounded-sm border border-line bg-white px-2 py-1 text-xs font-semibold hover:border-accent-blue">
                  {s.approved ? 'Un-approve' : 'Approve'}
                </button>
              </form>
            </li>
          ))}
          {!slots?.length && <p className="py-3 text-sm text-ink-mute">No slots yet.</p>}
        </ul>
      </Card>

      <Card title="Recent meeting requests">
        <ul className="divide-y divide-line text-sm">
          {requests?.map((r) => (
            <li key={r.id} className="py-3">
              <p className="font-medium">{r.name} · {r.work_email}</p>
              <p className="text-xs text-ink-mute">{r.role_title} · {r.time_zone} · slot {r.slot_id}</p>
              {r.note && <p className="mt-1 text-xs">{r.note}</p>}
            </li>
          ))}
          {!requests?.length && <p className="py-3 text-sm text-ink-mute">No requests yet.</p>}
        </ul>
      </Card>
    </div>
  );
}
