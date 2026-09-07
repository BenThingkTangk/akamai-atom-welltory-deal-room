import type { PublishedBriefingPayload } from '@/lib/types';
import Link from 'next/link';
import { Lockup } from './Shell';

export function BriefingView({
  snapshot,
  previewMode = false,
}: {
  snapshot: PublishedBriefingPayload;
  previewMode?: boolean;
}) {
  return (
    <div className="bg-white text-ink">
      {previewMode && (
        <div className="border-b border-line bg-gradient-to-r from-surface-cool via-white to-surface-cool">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-2 text-[11px] uppercase tracking-widest text-ink-mute">
            <span className="rounded-full border border-accent-blue/30 bg-accent-blue/8 px-2 py-0.5 font-semibold text-accent-blue">
              Draft
            </span>
            Not authorized for customer distribution
          </div>
        </div>
      )}

      <header className="sticky top-0 z-30 border-b border-line/70 bg-white/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Lockup />
          <span className="text-[11px] font-medium uppercase tracking-widest text-ink-mute">
            Welltory · Switch Assurance
          </span>
        </div>
      </header>

      <main>
        {/* HERO — cinematic dark panel with aurora */}
        <section className="relative overflow-hidden bg-accent-deep text-white">
          <div className="aurora" aria-hidden />
          <div className="grid-bg absolute inset-0 opacity-30" aria-hidden />
          <div className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-24 md:pt-32">
            <p className="animate-fade-up text-[11px] font-semibold uppercase tracking-widest text-accent-cyan">
              {snapshot.hero.eyebrow}
            </p>
            <h1 className="mt-6 max-w-4xl animate-fade-up font-display text-[clamp(2.8rem,5.4vw,4.75rem)] font-normal leading-[1.02] tracking-[-0.015em]" style={{ animationDelay: '80ms' }}>
              {formatHeroHeadline(snapshot.hero.headline)}
            </h1>
            <p className="mt-6 max-w-2xl animate-fade-up text-lg leading-relaxed text-white/75" style={{ animationDelay: '160ms' }}>
              {snapshot.hero.supporting}
            </p>
            <div className="mt-10 flex flex-wrap gap-3 animate-fade-up" style={{ animationDelay: '240ms' }}>
              <Link
                href="/meeting/request"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-accent-deep shadow-elev2 transition hover:shadow-elev3"
              >
                {snapshot.hero.primary_cta}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="transition group-hover:translate-x-0.5">
                  <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <a
                href="#framework"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white/90 transition hover:border-white/60 hover:text-white"
              >
                {snapshot.hero.secondary_cta}
              </a>
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="border-b border-line/60 bg-surface-soft/50">
          <div className="mx-auto max-w-6xl px-6 py-8">
            <ul className="grid gap-4 text-sm text-ink-mute sm:grid-cols-2 md:grid-cols-4">
              {snapshot.trust_strip.map((t, i) => (
                <li key={t} className="flex items-start gap-3 animate-fade-up" style={{ animationDelay: `${100 + i * 60}ms` }}>
                  <span aria-hidden className="mt-1.5 inline-block h-1 w-6 shrink-0 rounded-full bg-gradient-to-r from-accent-blue to-accent-cyan" />
                  <span className="leading-relaxed">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Why now */}
        <section className="mx-auto max-w-6xl px-6 py-20 md:py-24">
          <p className="eyebrow">Why now</p>
          <h2 className="mt-4 max-w-3xl font-display text-[clamp(2rem,3.6vw,3rem)] font-normal leading-[1.05] tracking-[-0.015em] text-ink">
            Four hypotheses <em className="not-italic italic">worth seventeen minutes</em>.
          </h2>
          <ul className="mt-12 grid gap-5 md:grid-cols-2">
            {snapshot.why_now.map((w, i) => (
              <li
                key={w}
                className="card-lift group relative overflow-hidden rounded-xl border border-line/70 bg-white p-6 text-[15px] leading-relaxed text-ink shadow-elev1"
              >
                <span
                  aria-hidden
                  className="absolute -top-8 left-6 font-display text-[6rem] font-normal italic leading-none text-accent-blue/10 transition group-hover:text-accent-blue/20"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="relative">{w}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Workstreams */}
        <section id="framework" className="border-t border-line/60 bg-surface-soft/40 py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <p className="eyebrow">Proposed framework</p>
            <h2 className="mt-4 max-w-3xl font-display text-[clamp(2rem,3.6vw,3rem)] font-normal leading-[1.05] tracking-[-0.015em] text-ink">
              Five workstreams. <em className="not-italic italic">One conversation.</em>
            </h2>
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {snapshot.workstreams.map((w, i) => (
                <article
                  key={w.key}
                  className="card-lift group relative overflow-hidden rounded-xl border border-line/70 bg-white p-7 shadow-elev1"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full border border-line bg-surface-soft/70 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-ink-mute">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${
                        w.status === 'approved'
                          ? 'border-state-ok/30 bg-state-ok/8 text-state-ok'
                          : 'border-state-warn/30 bg-state-warn/8 text-state-warn'
                      }`}
                    >
                      {w.status === 'approved' ? 'Included' : 'With conditions'}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-2xl font-normal leading-tight tracking-tight text-ink">
                    {w.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink/85">{w.customer_language}</p>
                  {w.conditions && (
                    <details className="mt-4 rounded-md border border-line/70 bg-surface-soft/60 px-3.5 py-2.5 text-xs text-ink-mute">
                      <summary className="cursor-pointer font-medium text-ink/80">Conditions</summary>
                      <p className="mt-2 whitespace-pre-wrap leading-relaxed">{w.conditions}</p>
                    </details>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 17-minute conversion */}
        <section className="relative overflow-hidden border-t border-line/60 bg-accent-deep text-white">
          <div className="aurora" aria-hidden />
          <div className="grid-bg absolute inset-0 opacity-30" aria-hidden />
          <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 md:py-24">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-accent-cyan">
              Seventeen minutes
            </p>
            <h2 className="mt-4 max-w-4xl font-display text-[clamp(2.2rem,4vw,3.4rem)] font-normal leading-[1.04] tracking-[-0.015em]">
              {snapshot.meeting.headline}
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/75">{snapshot.meeting.copy}</p>

            <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-accent-cyan">
                  Agenda
                </p>
                <ol className="mt-4 space-y-2 text-sm">
                  {snapshot.meeting.agenda.map((a, i) => (
                    <li
                      key={a}
                      className="flex items-start gap-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
                    >
                      <span className="font-mono text-[10px] text-accent-cyan">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-white/90">{a}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-accent-cyan">
                  Proposed slots
                </p>
                {snapshot.meeting.slots.length ? (
                  <ul className="mt-4 space-y-2 text-sm">
                    {snapshot.meeting.slots.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
                      >
                        <span className="font-mono text-xs text-white/85 tabular-nums">
                          {s.starts_at_utc} UTC
                        </span>
                        <Link
                          href={`/meeting/request?slot=${encodeURIComponent(s.id)}`}
                          className="text-sm font-semibold text-accent-cyan hover:text-white"
                        >
                          Request \u2192
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
                    Slots will appear here once confirmed.
                  </p>
                )}
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    href="/meeting/request"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-accent-deep shadow-elev2 transition hover:shadow-elev3"
                  >
                    {snapshot.meeting.cta_primary}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                  <Link
                    href="/meeting/request?other=1"
                    className="text-sm font-medium text-accent-cyan hover:text-white"
                  >
                    {snapshot.meeting.cta_alt}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-10 text-xs text-ink-mute md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-ink">{snapshot.footer.lockup}</p>
            <p className="mt-1">{snapshot.footer.qualifier}</p>
          </div>
          <Lockup />
        </div>
      </footer>
    </div>
  );
}

/**
 * Wrap the last two-to-three words of the headline in an editorial italic
 * span so the display serif has a hero moment. If the headline is short,
 * italicise the last word only.
 */
function formatHeroHeadline(headline: string): React.ReactNode {
  const words = headline.split(' ');
  if (words.length <= 3) {
    return (
      <>
        {words.slice(0, -1).join(' ')} <em className="not-italic italic text-accent-cyan">{words.slice(-1)}</em>
      </>
    );
  }
  const italicCount = Math.min(3, Math.max(2, Math.round(words.length * 0.25)));
  return (
    <>
      {words.slice(0, -italicCount).join(' ')}{' '}
      <em className="not-italic italic text-accent-cyan">{words.slice(-italicCount).join(' ')}</em>
    </>
  );
}
