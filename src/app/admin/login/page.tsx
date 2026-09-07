import { Lockup } from '@/components/Shell';
import { requestMagicLink } from './actions';

export const metadata = { title: 'Sign in \u2014 Private Deal Workspace' };

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { reason?: string; sent?: string };
}) {
  const reason = searchParams.reason;
  const sent = searchParams.sent === '1';
  return (
    <main className="relative min-h-screen overflow-hidden bg-white">
      {/* Split layout */}
      <div className="relative grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
        {/* Left: editorial cinematic panel */}
        <aside className="relative hidden overflow-hidden bg-accent-deep lg:block">
          <div className="aurora" aria-hidden />
          <div className="grid-bg absolute inset-0 opacity-40" aria-hidden />
          <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-white/70">
                <span className="relative inline-flex h-2 w-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-accent-cyan opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-cyan" />
                </span>
                Private Deal Workspace
              </span>
              <span className="text-[11px] font-medium uppercase tracking-widest text-white/60">
                Confidential
              </span>
            </div>

            <div className="max-w-lg animate-fade-up">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-accent-cyan">
                Welltory · Switch Assurance
              </p>
              <h1 className="mt-6 font-display text-[3.4rem] font-normal leading-[1.02] tracking-[-0.015em] text-white">
                A briefing built <em className="not-italic text-accent-cyan">for one</em>{' '}
                <span className="serif italic">decision</span>.
              </h1>
              <p className="mt-6 max-w-md text-base leading-relaxed text-white/70">
                An invitation-only workspace for the seventeen-minute conversation
                that ends with a signed switch commitment. Every section is
                reviewed, approved, and versioned before it leaves this room.
              </p>
              <ul className="mt-8 space-y-2 text-sm text-white/70">
                {[
                  'Invitation-only \u00b7 magic-link authenticated',
                  'Role-scoped: owner, reviewer, guest',
                  'Every publish is versioned and audit-logged',
                  'Customer briefing publishes as a signed snapshot',
                ].map((item, i) => (
                  <li key={item} className="flex items-start gap-3 animate-fade-up" style={{ animationDelay: `${120 + i * 80}ms` }}>
                    <span aria-hidden className="mt-1.5 inline-block h-1 w-6 rounded-full bg-gradient-to-r from-accent-cyan to-transparent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-white/50">
              <Lockup />
              <span>Not authorized for customer distribution</span>
            </div>
          </div>
        </aside>

        {/* Right: sign-in card */}
        <section className="relative flex items-center justify-center px-6 py-16 lg:px-16">
          <div className="grid-bg absolute inset-0 opacity-60 lg:hidden" aria-hidden />
          <div className="relative w-full max-w-md animate-fade-up">
            <div className="mb-10 flex items-center justify-between lg:hidden">
              <Lockup />
              <span className="text-[11px] font-medium uppercase tracking-widest text-ink-mute">
                Confidential
              </span>
            </div>

            <p className="eyebrow">Sign in</p>
            <h2 className="mt-2 text-h1 font-semibold tracking-tight text-ink">
              Enter the <span className="serif italic">deal room</span>
            </h2>
            <p className="mt-3 text-sm text-ink-mute">
              Invitation-only. Enter the email you were invited under &mdash;
              we&rsquo;ll send you a one-time sign-in link.
            </p>

            {reason === 'no_membership' && (
              <p className="mt-6 rounded-md border border-state-warn/30 bg-state-warn/5 px-3.5 py-2.5 text-xs text-state-warn">
                This account is not a member of the deal room.
              </p>
            )}
            {reason === 'forbidden' && (
              <p className="mt-6 rounded-md border border-state-err/30 bg-state-err/5 px-3.5 py-2.5 text-xs text-state-err">
                This account does not have admin access.
              </p>
            )}
            {reason === 'invalid_link' && (
              <p className="mt-6 rounded-md border border-state-err/30 bg-state-err/5 px-3.5 py-2.5 text-xs text-state-err">
                Sign-in link expired or invalid. Request a new one below.
              </p>
            )}
            {sent && (
              <div className="mt-6 rounded-md border border-state-ok/30 bg-state-ok/5 px-3.5 py-3 text-sm text-state-ok">
                <p className="font-semibold">Check your inbox.</p>
                <p className="mt-1 text-xs text-state-ok/80">
                  If that address is invited, a sign-in link has been sent.
                </p>
              </div>
            )}

            <form action={requestMagicLink} className="mt-8 space-y-4">
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-mute">
                  Work email
                </span>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@company.com"
                  className="mt-2 block w-full rounded-md border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-mute/60 outline-none transition focus:border-accent-blue focus:shadow-ring"
                />
              </label>
              <button
                type="submit"
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-md bg-accent-deep px-4 py-3 text-sm font-semibold text-white transition hover:bg-ink"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Email me a sign-in link
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="transition group-hover:translate-x-0.5">
                    <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-accent-blue via-accent-cyan to-accent-blue opacity-0 transition-opacity group-hover:opacity-30" />
              </button>
            </form>

            <p className="mt-8 text-[11px] leading-relaxed text-ink-mute">
              This is an internal Akamai review environment. If you were not
              expecting this invitation, please close this window.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
