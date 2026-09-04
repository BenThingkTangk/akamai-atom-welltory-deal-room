import type { PublishedBriefingPayload } from '@/lib/types';
import Link from 'next/link';
import { Lockup } from './Shell';

export function BriefingView({ snapshot, previewMode = false }: { snapshot: PublishedBriefingPayload; previewMode?: boolean }) {
  return (
    <div className="bg-white text-ink">
      {previewMode && (
        <div className="border-b border-line bg-surface-cool">
          <div className="mx-auto max-w-6xl px-6 py-2 text-xs text-ink-mute">
            Draft preview · Not authorized for customer distribution
          </div>
        </div>
      )}
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Lockup />
          <span className="text-[11px] uppercase tracking-widest text-ink-mute">
            Welltory Switch Assurance
          </span>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="edge-mesh relative">
          <div className="mx-auto max-w-6xl px-6 pb-16 pt-20">
            <p className="eyebrow">{snapshot.hero.eyebrow}</p>
            <h1 className="mt-4 max-w-4xl text-hero font-semibold text-accent-deep">
              {snapshot.hero.headline}
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-ink-mute">{snapshot.hero.supporting}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/meeting/request"
                className="rounded-sm bg-accent-deep px-5 py-3 text-sm font-semibold text-white hover:bg-ink"
              >
                {snapshot.hero.primary_cta}
              </Link>
              <a
                href="#framework"
                className="rounded-sm border border-line bg-white px-5 py-3 text-sm font-semibold hover:border-accent-blue"
              >
                {snapshot.hero.secondary_cta}
              </a>
            </div>
          </div>
        </section>

        <div className="hr" />

        {/* Trust strip */}
        <section className="mx-auto max-w-6xl px-6 py-8">
          <ul className="grid gap-4 text-sm text-ink-mute sm:grid-cols-4">
            {snapshot.trust_strip.map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-accent-cyan" />
                {t}
              </li>
            ))}
          </ul>
        </section>

        <div className="hr" />

        {/* Why now */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <p className="eyebrow">Why now</p>
          <h2 className="mt-3 max-w-3xl text-h1 font-semibold tracking-tight">Four hypotheses worth 17 minutes</h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {snapshot.why_now.map((w) => (
              <li key={w} className="rounded-md border border-line bg-surface-soft p-5 text-sm text-ink">
                {w}
              </li>
            ))}
          </ul>
        </section>

        <div className="hr" />

        {/* Workstreams */}
        <section id="framework" className="mx-auto max-w-6xl px-6 py-16">
          <p className="eyebrow">Proposed framework</p>
          <h2 className="mt-3 max-w-3xl text-h1 font-semibold tracking-tight">Five workstreams. One conversation.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {snapshot.workstreams.map((w) => (
              <article key={w.key} className="rounded-md border border-line bg-white p-6 shadow-elev1">
                <p className="eyebrow">{w.status === 'approved' ? 'Included' : 'Included with conditions'}</p>
                <h3 className="mt-2 text-lg font-semibold tracking-tight">{w.title}</h3>
                <p className="mt-3 text-sm text-ink">{w.customer_language}</p>
                {w.conditions && (
                  <details className="mt-3 rounded-sm border border-line bg-surface-soft px-3 py-2 text-xs text-ink-mute">
                    <summary className="cursor-pointer">Conditions</summary>
                    <p className="mt-2 whitespace-pre-wrap">{w.conditions}</p>
                  </details>
                )}
              </article>
            ))}
          </div>
        </section>

        <div className="hr" />

        {/* 17-minute headline */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <p className="eyebrow">Seventeen minutes</p>
          <h2 className="mt-3 max-w-4xl text-h1 font-semibold tracking-tight text-accent-deep">
            {snapshot.meeting.headline}
          </h2>
          <p className="mt-4 max-w-3xl text-ink-mute">{snapshot.meeting.copy}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div>
              <p className="eyebrow">Agenda</p>
              <ol className="mt-3 space-y-2 text-sm">
                {snapshot.meeting.agenda.map((a) => (
                  <li key={a} className="rounded-sm border border-line bg-white px-3 py-2">{a}</li>
                ))}
              </ol>
            </div>
            <div>
              <p className="eyebrow">Proposed slots</p>
              {snapshot.meeting.slots.length ? (
                <ul className="mt-3 space-y-2 text-sm">
                  {snapshot.meeting.slots.map((s) => (
                    <li key={s.id} className="flex items-center justify-between rounded-sm border border-line bg-white px-3 py-2">
                      <span className="font-mono text-xs">{s.starts_at_utc} UTC</span>
                      <Link
                        href={`/meeting/request?slot=${encodeURIComponent(s.id)}`}
                        className="text-accent-blue hover:underline"
                      >
                        Request →
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-ink-mute">Slots will appear here once confirmed.</p>
              )}
              <div className="mt-6">
                <Link
                  href="/meeting/request"
                  className="rounded-sm bg-accent-deep px-4 py-2 text-sm font-semibold text-white hover:bg-ink"
                >
                  {snapshot.meeting.cta_primary}
                </Link>
                <Link href="/meeting/request?other=1" className="ml-3 text-sm text-accent-blue hover:underline">
                  {snapshot.meeting.cta_alt}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-surface-soft">
        <div className="mx-auto max-w-6xl px-6 py-8 text-xs text-ink-mute">
          <p className="font-semibold text-ink">{snapshot.footer.lockup}</p>
          <p className="mt-2">{snapshot.footer.qualifier}</p>
        </div>
      </footer>
    </div>
  );
}
