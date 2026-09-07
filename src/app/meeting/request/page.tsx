import type { Metadata } from 'next';
import Link from 'next/link';
import { getServerSupabase } from '@/lib/supabase/server';
import { getPublicDealId } from '@/lib/publicDealLookup';
import { submitMeetingRequest } from './actions';
import { Lockup } from '@/components/Shell';
import type { PublishedBriefingPayload } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Request the 17-minute briefing',
  robots: { index: false, follow: false, nocache: true },
  other: { 'X-Robots-Tag': 'noindex, nofollow, noarchive' },
};

export default async function MeetingRequestPage({
  searchParams,
}: {
  searchParams: { slot?: string; sent?: string; other?: string };
}) {
  const dealId = await getPublicDealId('welltory');
  const sb = getServerSupabase();
  const { data: published } = dealId
    ? await sb.from('published_briefing').select('snapshot').eq('deal_id', dealId).maybeSingle()
    : { data: null };
  const snapshot = published?.snapshot as PublishedBriefingPayload | null;
  const slots = snapshot?.meeting.slots ?? [];
  const sent = searchParams.sent === '1';

  return (
    <div className="relative min-h-screen bg-white">
      <header className="border-b border-line/70 bg-white/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/briefing" className="flex items-center gap-3">
            <Lockup />
          </Link>
          <span className="text-[11px] font-medium uppercase tracking-widest text-ink-mute">
            Welltory · Switch Assurance
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-16 md:py-20">
        <p className="eyebrow animate-fade-up">Meeting request</p>
        <h1 className="mt-4 animate-fade-up font-display text-[clamp(2rem,3.6vw,3rem)] font-normal leading-[1.05] tracking-[-0.015em] text-ink" style={{ animationDelay: '80ms' }}>
          Request the <em className="not-italic italic text-accent-blue">seventeen-minute</em> briefing.
        </h1>

        {sent ? (
          <div className="mt-10 animate-fade-up rounded-xl border border-state-ok/30 bg-state-ok/5 p-6 text-sm text-state-ok" style={{ animationDelay: '160ms' }}>
            <p className="font-semibold text-state-ok">Request received.</p>
            <p className="mt-2 text-state-ok/80">
              A calendar confirmation will follow. If any of the details need to
              change, reply to that message and we&rsquo;ll adjust.
            </p>
          </div>
        ) : (
          <>
            <p className="mt-4 animate-fade-up text-base leading-relaxed text-ink-mute" style={{ animationDelay: '160ms' }}>
              Share your details and pick a proposed slot. Every slot is
              pre-approved by our team, so a confirmation is one reply away.
            </p>
            <form action={submitMeetingRequest} className="mt-10 space-y-5 animate-fade-up" style={{ animationDelay: '240ms' }}>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Name" name="name" required />
                <Field label="Role / title" name="role_title" required />
              </div>
              <Field label="Work email" name="work_email" type="email" required />

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-mute">
                  Slot
                </span>
                <select
                  name="slot_id"
                  required
                  defaultValue={searchParams.slot ?? ''}
                  className="mt-2 block w-full rounded-md border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-accent-blue focus:shadow-ring"
                >
                  <option value="" disabled>
                    Select a proposed slot
                  </option>
                  {slots.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.starts_at_utc} UTC
                    </option>
                  ))}
                </select>
                {slots.length === 0 && (
                  <span className="mt-2 block text-xs text-ink-mute">
                    No slots posted yet. Submit with a note and we&rsquo;ll propose times.
                  </span>
                )}
              </label>

              <Field label="Time zone" name="time_zone" required defaultValue="America/New_York" />

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-mute">
                  Optional note
                </span>
                <textarea
                  name="note"
                  rows={4}
                  className="mt-2 block w-full rounded-md border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-accent-blue focus:shadow-ring"
                  defaultValue={
                    searchParams.other === '1'
                      ? 'None of the proposed slots work \u2014 please suggest alternatives.'
                      : ''
                  }
                />
              </label>

              <div className="flex flex-col items-start gap-3 pt-2 sm:flex-row sm:items-center">
                <button className="group inline-flex items-center gap-2 rounded-full bg-accent-deep px-6 py-3 text-sm font-semibold text-white shadow-elev2 transition hover:bg-ink hover:shadow-elev3">
                  Request this 17-minute briefing
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="transition group-hover:translate-x-0.5">
                    <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <p className="text-xs text-ink-mute">
                  Submitting creates a pending request only. Calendar confirmation follows.
                </p>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-mute">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="mt-2 block w-full rounded-md border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-accent-blue focus:shadow-ring"
      />
    </label>
  );
}
