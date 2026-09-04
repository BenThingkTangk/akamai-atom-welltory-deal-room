-- 20260904_0001_init_schema.sql
-- Akamai × ATOM — Welltory Deal Room: initial schema.
-- Enables extensions, defines enums, and creates all tables required by the
-- application. Row Level Security is enabled here; policies are added in a
-- later migration to keep responsibilities separate.

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type deal_role as enum (
    'atom_owner',
    'akamai_deal_owner',
    'commercial_approver',
    'technical_approver',
    'healthcare_reviewer',
    'marketing_reviewer',
    'viewer',
    'welltory_guest'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type section_visibility as enum (
    'internal_only',
    'customer_safe_draft',
    'approved_for_customer',
    'published'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type workflow_status as enum (
    'draft',
    'in_review',
    'changes_requested',
    'approved',
    'approved_with_conditions',
    'excluded'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type section_category as enum (
    'hero',
    'why_now',
    'commercial',
    'migration',
    'api_security',
    'healthcare',
    'co_marketing',
    'agenda',
    'meeting',
    'legal'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type discovery_status as enum (
    'known',
    'ask_in_meeting',
    'post_call_follow_up'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Profiles (mirrors auth.users, one row per authenticated user)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  display_name text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Deals
-- ---------------------------------------------------------------------------
create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  customer text not null,
  incumbent text not null,
  objective text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Deal members (invitation-only; matched by email at first login)
-- ---------------------------------------------------------------------------
create table if not exists public.deal_members (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  invited_email text not null,
  user_id uuid references auth.users(id) on delete set null,
  role deal_role not null,
  invited_by_user_id uuid references auth.users(id),
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  unique (deal_id, invited_email)
);

create index if not exists idx_deal_members_user on public.deal_members(user_id);
create index if not exists idx_deal_members_email on public.deal_members(invited_email);

-- Auto-link a member row to a signed-in user by email match.
create or replace function public.link_member_on_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.deal_members
     set user_id = new.id, joined_at = coalesce(joined_at, now())
   where invited_email = lower(new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_link_member on auth.users;
create trigger on_auth_user_link_member
after insert on auth.users
for each row execute function public.link_member_on_signup();

-- ---------------------------------------------------------------------------
-- Deal sections (structured content fields)
-- ---------------------------------------------------------------------------
create table if not exists public.deal_sections (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  category section_category not null,
  field_key text not null,
  draft_value text not null default '',
  approved_value text,
  visibility section_visibility not null default 'customer_safe_draft',
  workflow_status workflow_status not null default 'draft',
  character_guidance text,
  revision integer not null default 0,
  last_editor text,
  updated_at timestamptz not null default now(),
  unique (deal_id, field_key)
);
create index if not exists idx_deal_sections_deal on public.deal_sections(deal_id);
create index if not exists idx_deal_sections_status on public.deal_sections(workflow_status);

-- ---------------------------------------------------------------------------
-- Internal assumptions (never surfaced to customers)
-- ---------------------------------------------------------------------------
create table if not exists public.deal_internal_assumptions (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  key text not null,
  value_json jsonb not null,
  note text,
  updated_at timestamptz not null default now(),
  unique (deal_id, key)
);

-- ---------------------------------------------------------------------------
-- Commitments (approved-with-conditions offers)
-- ---------------------------------------------------------------------------
create table if not exists public.deal_commitments (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  category section_category not null,
  title text not null,
  customer_language text not null,
  conditions text,
  status workflow_status not null default 'draft',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Discovery checklist
-- ---------------------------------------------------------------------------
create table if not exists public.deal_discovery_items (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  label text not null,
  status discovery_status not null default 'ask_in_meeting',
  note text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Comments
-- ---------------------------------------------------------------------------
create table if not exists public.deal_comments (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  section_id uuid references public.deal_sections(id) on delete set null,
  author_user_id uuid references auth.users(id) on delete set null,
  author_email text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_deal_comments_deal on public.deal_comments(deal_id);

-- ---------------------------------------------------------------------------
-- Approvals
-- ---------------------------------------------------------------------------
create table if not exists public.deal_approvals (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  section_id uuid not null references public.deal_sections(id) on delete cascade,
  approver_user_id uuid references auth.users(id) on delete set null,
  approver_email text not null,
  decision text not null,
  note text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Versions (immutable snapshots)
-- ---------------------------------------------------------------------------
create table if not exists public.deal_versions (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  version integer not null,
  snapshot jsonb not null,
  published_by_user_id uuid references auth.users(id) on delete set null,
  published_by_email text,
  published_at timestamptz not null default now(),
  is_current boolean not null default false,
  unique (deal_id, version)
);

-- Ensure at most one current version per deal.
create unique index if not exists uniq_deal_versions_current
  on public.deal_versions(deal_id)
  where is_current;

-- ---------------------------------------------------------------------------
-- Attendees, slots, requests
-- ---------------------------------------------------------------------------
create table if not exists public.deal_attendees (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  role_slot text not null,
  display_name text,
  email text,
  unique (deal_id, role_slot)
);

create table if not exists public.deal_meeting_slots (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  starts_at_utc timestamptz not null,
  ends_at_utc timestamptz not null,
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  check (starts_at_utc < ends_at_utc)
);

create table if not exists public.meeting_requests (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  name text not null,
  work_email text not null,
  role_title text not null,
  slot_id uuid references public.deal_meeting_slots(id) on delete set null,
  time_zone text not null,
  note text,
  request_ip text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Published briefing (one current row per deal — customer surface reads this)
-- ---------------------------------------------------------------------------
create table if not exists public.published_briefing (
  deal_id uuid primary key references public.deals(id) on delete cascade,
  current_version_id uuid references public.deal_versions(id) on delete set null,
  snapshot jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Audit log
-- ---------------------------------------------------------------------------
create table if not exists public.deal_audit_log (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_email text,
  action text not null,
  entity_type text not null,
  entity_id text,
  before_value jsonb,
  after_value jsonb,
  request_ip text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_deal_created on public.deal_audit_log(deal_id, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS enable (policies defined in the next migration)
-- ---------------------------------------------------------------------------
alter table public.profiles                    enable row level security;
alter table public.deals                       enable row level security;
alter table public.deal_members                enable row level security;
alter table public.deal_sections               enable row level security;
alter table public.deal_internal_assumptions   enable row level security;
alter table public.deal_commitments            enable row level security;
alter table public.deal_discovery_items        enable row level security;
alter table public.deal_comments               enable row level security;
alter table public.deal_approvals              enable row level security;
alter table public.deal_versions               enable row level security;
alter table public.deal_attendees              enable row level security;
alter table public.deal_meeting_slots          enable row level security;
alter table public.meeting_requests            enable row level security;
alter table public.published_briefing          enable row level security;
alter table public.deal_audit_log              enable row level security;
