import { Card, StatusPill } from '@/components/Shell';
import { getServerSupabase } from '@/lib/supabase/server';
import { requireMembership } from '@/lib/auth';
import { inviteMember, removeMember } from './actions';
import { ROLES, ROLE_LABEL, isOwner } from '@/lib/roles';

export const metadata = { title: 'Team — Private Deal Workspace' };

export default async function TeamPage() {
  const { membership } = await requireMembership('welltory');
  const owner = isOwner(membership.role);
  const sb = getServerSupabase();
  const { data: deal } = await sb.from('deals').select('id').eq('slug', 'welltory').single();
  const { data: members } = await sb
    .from('deal_members')
    .select('id, role, invited_email, user_id, joined_at')
    .eq('deal_id', deal?.id);

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Team</p>
        <h1 className="mt-2 text-h2 font-semibold tracking-tight">Members & invitations</h1>
      </header>
      <Card title="Members">
        <ul className="divide-y divide-line text-sm">
          {members?.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <span>{m.invited_email}</span>
              <StatusPill tone="mute">{ROLE_LABEL[m.role as keyof typeof ROLE_LABEL] ?? m.role}</StatusPill>
              <span className="text-xs text-ink-mute">{m.joined_at ? 'Joined' : 'Invited'}</span>
              {owner && (
                <form action={removeMember}>
                  <input type="hidden" name="member_id" value={m.id} />
                  <button className="rounded-sm border border-line bg-white px-2 py-1 text-xs font-semibold hover:border-state-err hover:text-state-err">
                    Remove
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      </Card>
      {owner ? (
        <Card title="Invite a reviewer">
          <form action={inviteMember} className="grid gap-3 md:grid-cols-3">
            <label className="block text-xs font-medium uppercase tracking-widest text-ink-mute md:col-span-2">
              Email
              <input
                name="email"
                type="email"
                required
                className="mt-2 block w-full rounded-sm border border-line bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs font-medium uppercase tracking-widest text-ink-mute">
              Role
              <select name="role" required className="mt-2 block w-full rounded-sm border border-line bg-white px-3 py-2 text-sm">
                {ROLES.filter((r) => r !== 'welltory_guest' && r !== 'atom_owner').map((r) => (
                  <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                ))}
              </select>
            </label>
            <div className="md:col-span-3">
              <button className="rounded-sm bg-accent-deep px-3 py-1.5 text-xs font-semibold text-white hover:bg-ink">
                Record invitation
              </button>
              <p className="mt-2 text-xs text-ink-mute">
                Records an invitation only. Emails are not sent from this stage.
              </p>
            </div>
          </form>
        </Card>
      ) : (
        <p className="text-xs text-ink-mute">Only deal owners can invite or remove members.</p>
      )}
    </div>
  );
}
