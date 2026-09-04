import Link from 'next/link';

export const metadata = { title: 'Private Deal Workspace' };

export default function RootIndex() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <p className="eyebrow">Akamai × ATOM · Confidential</p>
      <h1 className="mt-4 text-h1 font-semibold tracking-tight">Welltory Deal Room</h1>
      <p className="mt-4 text-ink-mute">
        This is a private workspace. Choose a surface below (path-based routing
        for previews; production routes by host).
      </p>
      <ul className="mt-8 space-y-3 text-sm">
        <li>
          <Link className="text-accent-blue underline" href="/admin">
            /admin
          </Link>{' '}
          — Protected admin workspace
        </li>
        <li>
          <Link className="text-accent-blue underline" href="/preview">
            /preview
          </Link>{' '}
          — Authenticated customer-safe preview
        </li>
        <li>
          <Link className="text-accent-blue underline" href="/briefing">
            /briefing
          </Link>{' '}
          — Published customer briefing
        </li>
        <li>
          <Link className="text-accent-blue underline" href="/meeting/request">
            /meeting/request
          </Link>{' '}
          — Meeting request form
        </li>
      </ul>
      <p className="mt-10 text-xs text-ink-mute">
        Internal Akamai review · Confidential · Not customer-ready
      </p>
    </main>
  );
}
