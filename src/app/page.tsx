import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Private Deal Workspace',
  robots: { index: false, follow: false, nocache: true },
  other: { 'X-Robots-Tag': 'noindex, nofollow, noarchive' },
};

/**
 * Defense in depth. The customer briefing lives at /briefing; the admin
 * workspace at /admin. The bare "/" route existed as a developer index and
 * revealed internal navigation labels ("Confidential", "Not customer-ready")
 * to anonymous callers on the Vercel Preview URL. Now:
 *   - anonymous → /admin/login (invitation prompt with no internal copy)
 *   - authenticated → /admin (which re-checks membership itself)
 */
export default async function RootIndex() {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  redirect('/admin');
}
