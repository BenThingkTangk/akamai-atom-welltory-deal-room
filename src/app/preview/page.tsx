import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase/server';
import { getSessionUser, getMembership } from '@/lib/auth';
import { BriefingView } from '@/components/Briefing';
import type { PublishedBriefingPayload } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Private Briefing Preview',
  robots: { index: false, follow: false, nocache: true },
  other: { 'X-Robots-Tag': 'noindex, nofollow, noarchive' },
};

/**
 * Preview is customer-safe — same payload as briefing, but gated by
 * authenticated membership so unpublished-but-approved drafts can be reviewed.
 */
export default async function PreviewPage() {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  const membership = await getMembership('welltory');
  if (!membership || membership.role === 'welltory_guest') redirect('/admin/login?reason=forbidden');

  const sb = getServerSupabase();
  const { data: deal } = await sb.from('deals').select('id').eq('slug', 'welltory').single();
  if (!deal) return <NoPreview />;

  const { data: published } = await sb
    .from('published_briefing')
    .select('snapshot')
    .eq('deal_id', deal.id)
    .maybeSingle();

  if (!published?.snapshot) return <NoPreview />;
  const snapshot = published.snapshot as unknown as PublishedBriefingPayload;
  return <BriefingView snapshot={snapshot} previewMode />;
}

function NoPreview() {
  return (
    <main className="mx-auto grid min-h-screen max-w-md place-items-center px-6 text-center">
      <div>
        <p className="eyebrow">Preview</p>
        <h1 className="mt-3 text-h2 font-semibold tracking-tight">No published version</h1>
        <p className="mt-3 text-sm text-ink-mute">Publish an approved version from Admin → Versions to see the preview here.</p>
      </div>
    </main>
  );
}
