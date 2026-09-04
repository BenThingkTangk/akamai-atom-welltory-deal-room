import { redirect } from 'next/navigation';
import { AdminHeader } from '@/components/Shell';
import { getSessionUser, getMembership } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Private Deal Workspace' };

const DEAL_SLUG = 'welltory';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const membership = await getMembership(DEAL_SLUG);
  if (!membership) redirect('/admin/login?reason=no_membership');
  if (membership.role === 'welltory_guest') redirect('/admin/login?reason=forbidden');

  return (
    <>
      <AdminHeader email={user.email} role={membership.role} />
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </>
  );
}
