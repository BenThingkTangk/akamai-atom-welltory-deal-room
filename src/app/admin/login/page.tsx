import { Lockup } from '@/components/Shell';
import { requestMagicLink } from './actions';

export const metadata = { title: 'Sign in — Private Deal Workspace' };

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { reason?: string; sent?: string };
}) {
  const reason = searchParams.reason;
  const sent = searchParams.sent === '1';
  return (
    <main className="mx-auto grid min-h-screen max-w-md place-items-center px-6 py-12">
      <div className="w-full">
        <div className="mb-8 flex items-center justify-between">
          <Lockup />
          <span className="text-[11px] uppercase tracking-widest text-ink-mute">Confidential</span>
        </div>
        <h1 className="text-h2 font-semibold tracking-tight">Sign in to the deal room</h1>
        <p className="mt-3 text-sm text-ink-mute">
          Invitation-only. Enter the email you were invited under. We&rsquo;ll email a sign-in link.
        </p>
        {reason === 'no_membership' && (
          <p className="mt-4 rounded-sm border border-state-warn/30 bg-state-warn/5 px-3 py-2 text-xs text-state-warn">
            This account is not a member of the deal room.
          </p>
        )}
        {reason === 'forbidden' && (
          <p className="mt-4 rounded-sm border border-state-err/30 bg-state-err/5 px-3 py-2 text-xs text-state-err">
            This account does not have admin access.
          </p>
        )}
        {reason === 'invalid_link' && (
          <p className="mt-4 rounded-sm border border-state-err/30 bg-state-err/5 px-3 py-2 text-xs text-state-err">
            Sign-in link expired or invalid. Request a new one below.
          </p>
        )}
        {sent && (
          <p className="mt-4 rounded-sm border border-state-ok/30 bg-state-ok/5 px-3 py-2 text-xs text-state-ok">
            If that address is invited, a sign-in link has been sent.
          </p>
        )}
        <form action={requestMagicLink} className="mt-6 space-y-4">
          <label className="block text-xs font-medium uppercase tracking-widest text-ink-mute">
            Work email
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-2 block w-full rounded-sm border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-accent-blue"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-sm bg-accent-deep px-4 py-2 text-sm font-semibold text-white hover:bg-ink"
          >
            Email me a sign-in link
          </button>
        </form>
        <p className="mt-6 text-[11px] text-ink-mute">
          Internal Akamai review · Confidential · Not customer-ready
        </p>
      </div>
    </main>
  );
}
