'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Role } from '@/lib/roles';
import { ROLE_LABEL } from '@/lib/roles';

const NAV = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/content', label: 'Content' },
  { href: '/admin/commercials', label: 'Commercials' },
  { href: '/admin/commitments', label: 'Commitments' },
  { href: '/admin/review', label: 'Review' },
  { href: '/admin/versions', label: 'Versions' },
  { href: '/admin/team', label: 'Team' },
  { href: '/admin/scheduling', label: 'Scheduling' },
  { href: '/admin/audit', label: 'Audit' },
];

export function AdminHeader({ email, role }: { email: string; role: Role }) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-white/85 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/admin" className="group flex items-center gap-3">
          <Lockup />
          <span className="hidden text-[11px] font-medium uppercase tracking-widest text-ink-mute md:inline">
            Welltory · Switch Assurance
          </span>
        </Link>
        <nav aria-label="Admin sections" className="hidden items-center gap-6 text-sm text-ink-mute lg:flex">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-active={active ? 'true' : 'false'}
                className="nav-link transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3 text-xs">
          <div className="hidden items-center gap-2 md:flex">
            <span className="text-ink-mute">{email}</span>
            <span className="rounded-full border border-line bg-surface-soft px-2 py-0.5 font-medium text-ink">
              {ROLE_LABEL[role]}
            </span>
          </div>
          <form action="/admin/logout" method="post">
            <button
              type="submit"
              className="rounded-full border border-line px-3 py-1 text-ink-mute transition hover:border-line-strong hover:text-ink"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-line/60 bg-surface-soft/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-1.5 text-[11px] uppercase tracking-widest text-ink-mute">
          <span className="flex items-center gap-2">
            <StatusDot />
            Internal Akamai review · Confidential
          </span>
          <span className="hidden md:inline">Not authorized for customer distribution</span>
        </div>
      </div>
      {/* Mobile nav */}
      <nav aria-label="Admin sections (mobile)" className="flex gap-1 overflow-x-auto border-t border-line/50 px-4 py-2 text-xs text-ink-mute lg:hidden">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              data-active={active ? 'true' : 'false'}
              className={`whitespace-nowrap rounded-full px-3 py-1 transition ${
                active ? 'bg-accent-deep text-white' : 'hover:bg-surface-soft hover:text-ink'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === '/admin') return pathname === '/admin';
  return pathname === href || pathname.startsWith(href + '/');
}

function StatusDot() {
  return (
    <span aria-hidden className="relative inline-flex h-2 w-2">
      <span className="absolute inset-0 animate-ping rounded-full bg-accent-cyan opacity-60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-cyan" />
    </span>
  );
}

export function Lockup() {
  return (
    <span aria-label="Akamai × ATOM" className="flex items-center gap-3">
      <span aria-hidden="true" className="relative inline-flex h-7 w-7 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-blue/30 via-accent-cyan/20 to-transparent blur-md" />
        <svg viewBox="0 0 40 40" width="26" height="26" fill="none" className="relative">
          <defs>
            <linearGradient id="lg1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0057ff" />
              <stop offset="1" stopColor="#00bcd4" />
            </linearGradient>
          </defs>
          <circle cx="20" cy="20" r="4.5" fill="url(#lg1)" />
          <ellipse cx="20" cy="20" rx="17" ry="6" stroke="#00bcd4" strokeWidth="1.2" />
          <ellipse cx="20" cy="20" rx="17" ry="6" stroke="#0057ff" strokeWidth="1" transform="rotate(60 20 20)" opacity="0.5" />
          <ellipse cx="20" cy="20" rx="17" ry="6" stroke="#001845" strokeWidth="0.8" transform="rotate(120 20 20)" opacity="0.35" />
        </svg>
      </span>
      <span className="font-semibold tracking-tight text-ink">
        AKAMAI <span className="mx-0.5 text-ink-mute/70">×</span> ATOM
      </span>
    </span>
  );
}

export function StatusPill({ tone, children }: { tone: 'ok' | 'warn' | 'err' | 'mute' | 'info'; children: React.ReactNode }) {
  const cls =
    tone === 'ok'
      ? 'border-state-ok/30 bg-state-ok/8 text-state-ok'
      : tone === 'warn'
      ? 'border-state-warn/30 bg-state-warn/8 text-state-warn'
      : tone === 'err'
      ? 'border-state-err/30 bg-state-err/8 text-state-err'
      : tone === 'info'
      ? 'border-accent-blue/30 bg-accent-blue/8 text-accent-blue'
      : 'border-line bg-surface-soft text-ink-mute';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${cls}`}>
      {children}
    </span>
  );
}

export function Card({
  title,
  description,
  action,
  tone = 'default',
  children,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  tone?: 'default' | 'accent' | 'confidential';
  children: React.ReactNode;
}) {
  const toneCls =
    tone === 'accent'
      ? 'border-accent-blue/20 bg-gradient-to-br from-white to-accent-blue/[0.03]'
      : tone === 'confidential'
      ? 'border-line bg-gradient-to-br from-white to-surface-cool/60'
      : 'border-line bg-white';
  return (
    <section className={`card-lift group relative overflow-hidden rounded-lg border ${toneCls} shadow-elev1`}>
      {tone === 'confidential' && (
        <span className="absolute right-4 top-3 text-[9px] font-semibold uppercase tracking-widest text-ink-mute/70">
          Internal
        </span>
      )}
      {(title || description || action) && (
        <header className="flex items-start justify-between gap-4 border-b border-line/60 px-5 py-3.5">
          <div>
            {title && <h2 className="text-sm font-semibold tracking-tight text-ink">{title}</h2>}
            {description && <p className="mt-1 text-xs text-ink-mute">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

export function PageHeader({
  eyebrow,
  title,
  accent,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  /** Optional word or phrase to render in the editorial serif italic. */
  accent?: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-line/70 pb-6 md:flex-row md:items-end md:justify-between">
      <div className="animate-fade-up">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-3 font-display text-[clamp(1.8rem,3vw,2.6rem)] font-normal leading-[1.05] tracking-[-0.015em] text-ink">
          {accent ? (
            <>
              {title} <em className="not-italic italic text-accent-blue">{accent}</em>
            </>
          ) : (
            title
          )}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-mute">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function PreviewBanner() {
  return (
    <div className="border-b border-line bg-gradient-to-r from-surface-cool via-white to-surface-cool">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-6 py-2 text-[11px] uppercase tracking-widest text-ink-mute">
        <StatusPill tone="info">Draft</StatusPill>
        Not authorized for customer distribution
      </div>
    </div>
  );
}
