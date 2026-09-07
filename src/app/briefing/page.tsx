import type { Metadata } from 'next';
import { getServerSupabase } from '@/lib/supabase/server';
import { getPublicDealId } from '@/lib/publicDealLookup';
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
  const dealId = await getPublicDealId('welltory');
  if (!dealId) return <Unavailable />;

  const sb = getServerSupabase();
  const { data: published } = await sb
    .from('published_briefing')
    .select('snapshot, updated_at')
    .eq('deal_id', dealId)
    .maybeSingle();

  if (!published?.snapshot) return <Unavailable />;

  const snapshot = published.snapshot as unknown as PublishedBriefingPayload;
  return <BriefingView snapshot={snapshot} />;
}

function Unavailable() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-accent-deep px-6 text-center text-white">
      <div className="aurora" aria-hidden />
      <div className="grid-bg absolute inset-0 opacity-30" aria-hidden />
      <div className="relative z-10 max-w-md animate-fade-up">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-accent-cyan">Private briefing</p>
        <h1 className="mt-4 font-display text-[clamp(2rem,3.6vw,3rem)] font-normal leading-[1.05] tracking-[-0.015em]">
          Not currently <em className="not-italic italic text-accent-cyan">available</em>.
        </h1>
        <p className="mt-5 text-base leading-relaxed text-white/70">
          This briefing is not currently published. Please contact your Akamai
          representative for access.
        </p>
      </div>
    </main>
  );
}
