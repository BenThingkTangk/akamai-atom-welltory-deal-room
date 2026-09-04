import { Card } from '@/components/Shell';
import { computeScenario, DISCLAIMER } from '@/lib/commercials';

export const metadata = { title: 'Commercials — Private Deal Workspace' };

export default function AdminCommercialsPage({
  searchParams,
}: {
  searchParams: {
    low?: string; high?: string; term?: string; remaining?: string;
    transition?: string; services?: string; comarketing?: string; baseline?: string;
  };
}) {
  const low = num(searchParams.low, 30000);
  const high = num(searchParams.high, 40000);
  const term = ([12, 24, 36] as const).includes(num(searchParams.term, 12) as 12 | 24 | 36)
    ? (num(searchParams.term, 12) as 12 | 24 | 36)
    : 12;
  const remaining = searchParams.remaining && searchParams.remaining !== 'unknown' ? Number(searchParams.remaining) : null;

  const transition = (searchParams.transition ?? 'none') as
    | 'none' | 'delayed_billing' | 'overlap_credit' | 'buyout_consideration';
  const services = (searchParams.services ?? 'included') as 'included' | 'discounted' | 'separate';
  const comarketing = (searchParams.comarketing ?? 'none') as
    | 'none' | 'case_study' | 'webinar' | 'video' | 'exec_quote' | 'package';
  const baseline = searchParams.baseline ? Number(searchParams.baseline) : null;

  const out = computeScenario({
    monthly_low_usd: low,
    monthly_high_usd: high,
    term_months: term,
    remaining_incumbent_months: remaining,
    transition,
    services,
    co_marketing: comarketing,
    incumbent_baseline_usd_monthly: baseline,
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Commercial modeler · internal only</p>
        <h1 className="mt-2 text-h2 font-semibold tracking-tight">Scenario band</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-mute">
          Model approximately $30K–$40K/mo. Delayed billing, overlap support,
          transition credits, or buyout consideration require approval.
        </p>
      </header>

      <form method="get" className="grid gap-4 rounded-md border border-line bg-white p-5 md:grid-cols-4">
        <Field label="Monthly low ($)" name="low" defaultValue={low} type="number" min={0} />
        <Field label="Monthly high ($)" name="high" defaultValue={high} type="number" min={0} />
        <Select label="Term (mo)" name="term" defaultValue={String(term)} options={[['12','12'], ['24','24'], ['36','36']]} />
        <Select
          label="Remaining incumbent (mo)"
          name="remaining"
          defaultValue={remaining == null ? 'unknown' : String(remaining)}
          options={[['unknown','Unknown'], ['0','0'], ['3','3'], ['6','6'], ['9','9'], ['12','12'], ['15','15'], ['18','18']]}
        />
        <Select
          label="Transition"
          name="transition"
          defaultValue={transition}
          options={[
            ['none','None'],
            ['delayed_billing','Delayed billing'],
            ['overlap_credit','Overlap credit'],
            ['buyout_consideration','Buyout consideration'],
          ]}
        />
        <Select
          label="Services"
          name="services"
          defaultValue={services}
          options={[['included','Included'], ['discounted','Discounted'], ['separate','Separately scoped']]}
        />
        <Select
          label="Co-marketing"
          name="comarketing"
          defaultValue={comarketing}
          options={[
            ['none','None'],
            ['case_study','Case study'],
            ['webinar','Webinar'],
            ['video','Customer video'],
            ['exec_quote','Executive quote'],
            ['package','Combined package'],
          ]}
        />
        <Field label="Approved incumbent baseline ($/mo, optional)" name="baseline" defaultValue={baseline ?? ''} type="number" min={0} />
        <div className="md:col-span-4">
          <button className="rounded-sm bg-accent-deep px-3 py-1.5 text-xs font-semibold text-white hover:bg-ink">
            Recompute
          </button>
        </div>
      </form>

      <Card title="Modeled scenario">
        <dl className="grid gap-4 md:grid-cols-3 text-sm">
          <Kv k="Monthly target" v={`$${fmt(out.monthly_target_low_usd)}–$${fmt(out.monthly_target_high_usd)}`} />
          <Kv k="Annualized" v={`$${fmt(out.annualized_low_usd)}–$${fmt(out.annualized_high_usd)}`} />
          <Kv k="Total contract value" v={`$${fmt(out.tcv_low_usd)}–$${fmt(out.tcv_high_usd)}`} />
          <Kv k="Overlap exposure" v={out.overlap_exposure_usd == null ? 'Insufficient approved inputs' : `$${fmt(out.overlap_exposure_usd)}`} />
          <Kv k="Savings note" v={out.savings_note} full />
        </dl>
        <ul className="mt-4 space-y-1 text-xs text-ink-mute">
          {out.assumptions.map((a, i) => <li key={i}>· {a}</li>)}
        </ul>
        <p className="mt-4 rounded-sm border border-state-warn/30 bg-state-warn/5 px-3 py-2 text-xs text-state-warn">
          {DISCLAIMER}
        </p>
      </Card>
    </div>
  );
}

function Field({ label, name, defaultValue, type = 'text', min }: { label: string; name: string; defaultValue: string | number; type?: string; min?: number }) {
  return (
    <label className="block text-xs font-medium uppercase tracking-widest text-ink-mute">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        min={min}
        className="mt-2 block w-full rounded-sm border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-accent-blue"
      />
    </label>
  );
}
function Select({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: [string, string][] }) {
  return (
    <label className="block text-xs font-medium uppercase tracking-widest text-ink-mute">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-2 block w-full rounded-sm border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-accent-blue"
      >
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}
function Kv({ k, v, full }: { k: string; v: string; full?: boolean }) {
  return (
    <div className={full ? 'md:col-span-3' : ''}>
      <dt className="text-xs uppercase tracking-widest text-ink-mute">{k}</dt>
      <dd className="mt-1 font-mono">{v}</dd>
    </div>
  );
}
function num(v: string | undefined, d: number) { const n = v != null ? Number(v) : NaN; return Number.isFinite(n) ? n : d; }
function fmt(n: number) { return n.toLocaleString('en-US', { maximumFractionDigits: 0 }); }
