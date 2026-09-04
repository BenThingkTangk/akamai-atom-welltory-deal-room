import type { Metadata } from 'next';
import { getServerSupabase } from '@/lib/supabase/server';
import { getPublicDealId } from '@/lib/publicDealLookup';
import { submitMeetingRequest } from './actions';
import type { PublishedBriefingPayload } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Request the 17-minute briefing',
  robots: { index: false, follow: false, nocache: true },
  other: { 'X-Robots-Tag': 'noindex, nofollow, noarchive' },
};

export default async function MeetingRequestPage({ searchParams }: { searchParams: { slot?: string; sent?: string; other?: string } }) {
  const dealId = await getPublicDealId('welltory');
  const sb = getServerSupabase();
  const { data: published } = dealId
    ? await sb
        .from('published_briefing')
        .select('snapshot')
        .eq('deal_id', dealId)
        .maybeSingle()
    : { data: null };
  const snapshot = published?.snapshot as PublishedBriefingPayload | null;
  const slots = snapshot?.meeting.slots ?? [];
  const sent = searchParams.sent === '1';

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <p className="eyebrow">Meeting request</p>
      <h1 className="mt-3 text-h1 font-semibold tracking-tight">Request the 17-minute briefing</h1>
      {sent ? (
        <div className="mt-8 rounded-md border border-state-ok/30 bg-state-ok/5 px-4 py-5 text-sm">
          Request received — calendar confirmation will follow.
        </div>
      ) : (
        <>
          <p className="mt-3 text-sm text-ink-mute">
            Provide your details and pick a slot. We will follow up to confirm.
          </p>
          <form action={submitMeetingRequest} className="mt-8 space-y-4">
            <Field label="Name" name="name" required />
            <Field label="Work email" name="work_email" type="email" required />
            <Field label="Role / title" name="role_title" required />
            <label className="block text-xs font-medium uppercase tracking-widest text-ink-mute">
              Slot
              <select name="slot_id" required defaultValue={searchParams.slot ?? ''} className="mt-2 block w-full rounded-sm border border-line bg-white px-3 py-2 text-sm">
                <option value="" disabled>Select a proposed slot</option>
                {slots.map((s) => (
                  <option key={s.id} value={s.id}>{s.starts_at_utc} UTC</option>
                ))}
              </select>
              {slots.length === 0 && (
                <span className="mt-2 block text-xs text-ink-mute">
                  No slots posted yet. Submit with a note and we&rsquo;ll propose times.
                </span>
              )}
            </label>
            <Field label="Time zone" name="time_zone" required defaultValue="America/New_York" />
            <label className="block text-xs font-medium uppercase tracking-widest text-ink-mute">
              Optional note
              <textarea name="note" rows={4} className="mt-2 block w-full rounded-sm border border-line bg-white px-3 py-2 text-sm" defaultValue={searchParams.other === '1' ? 'None of the proposed slots work — please suggest alternatives.' : ''} />
            </label>
            <button className="rounded-sm bg-accent-deep px-5 py-3 text-sm font-semibold text-white hover:bg-ink">
              Request this 17-minute briefing
            </button>
            <p className="text-xs text-ink-mute">
              Submitting creates a pending request only. A calendar confirmation will follow.
            </p>
          </form>
        </>
      )}
    </main>
  );
}

function Field({ label, name, type = 'text', required, defaultValue }: { label: string; name: string; type?: string; required?: boolean; defaultValue?: string }) {
  return (
    <label className="block text-xs font-medium uppercase tracking-widest text-ink-mute">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="mt-2 block w-full rounded-sm border border-line bg-white px-3 py-2 text-sm"
      />
    </label>
  );
}
