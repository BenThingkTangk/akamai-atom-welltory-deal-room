import type { Metadata } from 'next';
import { getServerSupabase } from '@/lib/supabase/server';
import { BriefingView } from '@/components/Briefing';
import type { PublishedBriefingPayload } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Welltory × Akamai Executive Briefing',
  description: 'Private executive briefing.',
  robots: { index: false, follow: false, nocache: true },
  other: { 'X-Robots-Tag': 'noindex, nofollow, noarchive' },
};

/**
 * Customer briefing. Reads ONLY from published_briefing.
 * Never queries internal tables.
 */
export default async function BriefingPage() {
  const sb = getServerSupabase();
  const { data: deal } = await sb.from('deals').select('id').eq('slug', 'welltory').single();
  if (!deal) return <Unavailable />;

  const { data: published } = await sb
    .from('published_briefing')
    .select('snapshot, updated_at')
    .eq('deal_id', deal.id)
    .maybeSingle();

  if (!published?.snapshot) return <Unavailable />;

  const snapshot = published.snapshot as unknown as PublishedBriefingPayload;
  return <BriefingView snapshot={snapshot} />;
}

function Unavailable() {
  return (
    <main className="mx-auto grid min-h-screen max-w-md place-items-center px-6 text-center">
      <div>
        <p className="eyebrow">Private briefing</p>
        <h1 className="mt-3 text-h2 font-semibold tracking-tight">Not currently available</h1>
        <p className="mt-3 text-sm text-ink-mute">
          This briefing is not currently published. Please contact your Akamai
          representative for access.
        </p>
      </div>
    </main>
  );
}
