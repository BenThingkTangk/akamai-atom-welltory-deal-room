import Link from 'next/link';
import type { Role } from '@/lib/roles';
import { ROLE_LABEL } from '@/lib/roles';

export function AdminHeader({ email, role }: { email: string; role: Role }) {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-3">
            <Lockup />
            <span className="hidden text-xs font-medium uppercase tracking-widest text-ink-mute md:inline">
              Welltory Switch Assurance
            </span>
          </Link>
        </div>
        <nav aria-label="Admin sections" className="hidden gap-5 text-sm text-ink-mute md:flex">
          <Link href="/admin" className="hover:text-ink">Overview</Link>
          <Link href="/admin/content" className="hover:text-ink">Content</Link>
          <Link href="/admin/commercials" className="hover:text-ink">Commercials</Link>
          <Link href="/admin/commitments" className="hover:text-ink">Commitments</Link>
          <Link href="/admin/review" className="hover:text-ink">Review</Link>
          <Link href="/admin/versions" className="hover:text-ink">Versions</Link>
          <Link href="/admin/team" className="hover:text-ink">Team</Link>
          <Link href="/admin/scheduling" className="hover:text-ink">Scheduling</Link>
          <Link href="/admin/audit" className="hover:text-ink">Audit</Link>
        </nav>
        <div className="flex items-center gap-3 text-xs text-ink-mute">
          <span>{email}</span>
          <span className="rounded-xs border border-line px-2 py-0.5">{ROLE_LABEL[role]}</span>
          <form action="/admin/logout" method="post">
            <button
              type="submit"
              className="rounded-xs border border-line px-2 py-0.5 hover:text-ink"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-line bg-surface-soft">
        <div className="mx-auto max-w-7xl px-6 py-2 text-xs text-ink-mute">
          Internal Akamai review · Confidential · Not customer-ready
        </div>
      </div>
    </header>
  );
}

export function Lockup() {
  return (
    <span aria-label="Akamai × ATOM" className="flex items-center gap-3">
      <span aria-hidden="true" className="inline-block h-5 w-5">
        <svg viewBox="0 0 40 40" width="20" height="20" fill="none">
          <circle cx="20" cy="20" r="4" fill="#0057ff" />
          <ellipse cx="20" cy="20" rx="17" ry="6" stroke="#00bcd4" strokeWidth="1.2" />
          <ellipse cx="20" cy="20" rx="17" ry="6" stroke="#0057ff" strokeWidth="1" transform="rotate(60 20 20)" opacity="0.5" />
          <ellipse cx="20" cy="20" rx="17" ry="6" stroke="#001845" strokeWidth="0.8" transform="rotate(120 20 20)" opacity="0.35" />
        </svg>
      </span>
      <span className="font-semibold tracking-tight text-ink">
        AKAMAI <span className="text-ink-mute">×</span> ATOM
      </span>
    </span>
  );
}

export function StatusPill({ tone, children }: { tone: 'ok' | 'warn' | 'err' | 'mute'; children: React.ReactNode }) {
  const cls =
    tone === 'ok'
      ? 'border-state-ok/30 bg-state-ok/5 text-state-ok'
      : tone === 'warn'
      ? 'border-state-warn/30 bg-state-warn/5 text-state-warn'
      : tone === 'err'
      ? 'border-state-err/30 bg-state-err/5 text-state-err'
      : 'border-line bg-surface-soft text-ink-mute';
  return (
    <span className={`inline-flex items-center gap-1 rounded-xs border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider ${cls}`}>
      {children}
    </span>
  );
}

export function Card({ title, description, children }: { title?: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-line bg-white shadow-elev1">
      {(title || description) && (
        <header className="border-b border-line px-5 py-3">
          {title && <h2 className="text-sm font-semibold tracking-tight text-ink">{title}</h2>}
          {description && <p className="mt-1 text-xs text-ink-mute">{description}</p>}
        </header>
      )}
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

export function PreviewBanner() {
  return (
    <div className="border-b border-line bg-surface-cool">
      <div className="mx-auto max-w-7xl px-6 py-2 text-xs text-ink-mute">
        Draft preview · Not authorized for customer distribution
      </div>
    </div>
  );
}
