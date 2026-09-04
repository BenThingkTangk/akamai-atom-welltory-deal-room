# Akamai × ATOM — Welltory Deal Room

Private, invitation-only workspace for the Welltory switch-assurance opportunity.

## Stack
- Next.js App Router (14.2), TypeScript strict
- Tailwind CSS
- Supabase Postgres + Auth (magic link) + RLS + Realtime-ready
- Vercel

## Environments

Copy `.env.example` to `.env.local` and populate.

## Production host behavior
- `www.welltoryakamai.com` — published briefing
- `welltoryakamai.com` — 308 redirect → www
- `admin.welltoryakamai.com` — protected admin workspace
- `preview.welltoryakamai.com` — authenticated customer-safe preview

Host is a routing hint only. Server-side auth guards every internal route.

## Migrations
Located in `supabase/migrations/`. Apply in order:
1. `20260904_0001_init_schema.sql` — enums, tables, RLS enable
2. `20260904_0002_rls_policies.sql` — RLS policies
3. `20260904_0003_seed_data.sql` — deal + sections + commitments + discovery + attendee slots

## Scripts
```
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
```

## Data separation
Customer surfaces read ONLY from `published_briefing`. A defensive payload
guard rejects any snapshot that contains prohibited internal terms.

## Copy rules
See `docs/COPY_RULES.md` for the exhaustive claim boundaries.
