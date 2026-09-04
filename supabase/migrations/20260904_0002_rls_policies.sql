-- 20260904_0002_rls_policies.sql
-- Row Level Security policies for the deal room.
--
-- Model:
--   * `auth.uid()` = the authenticated user
--   * deal_members maps user_id -> role for a deal
--   * A helper function returns the caller's role for a deal (or NULL)
--   * Every policy is deal-scoped through deal_members
--
-- The published_briefing table is the ONLY table on which anonymous SELECT is
-- permitted, and only for its safe columns. All internal tables reject
-- anonymous access.

-- ---------------------------------------------------------------------------
-- Helper: caller's role for a deal
-- ---------------------------------------------------------------------------
create or replace function public.deal_role_for(deal uuid)
returns deal_role
language sql
stable
security definer
set search_path = public
as $$
  select role
    from public.deal_members
   where deal_id = deal
     and user_id = auth.uid()
   limit 1;
$$;

create or replace function public.is_owner_for(deal uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.deal_role_for(deal) in ('atom_owner','akamai_deal_owner');
$$;

create or replace function public.can_edit_category(deal uuid, cat section_category)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  with r as (select public.deal_role_for(deal) as role)
  select case (select role from r)
    when 'atom_owner' then true
    when 'akamai_deal_owner' then true
    when 'commercial_approver' then cat = 'commercial'::section_category
    when 'technical_approver' then cat in ('migration'::section_category, 'api_security'::section_category)
    when 'healthcare_reviewer' then cat = 'healthcare'::section_category
    when 'marketing_reviewer' then cat = 'co_marketing'::section_category
    else false
  end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles
  for select using (id = auth.uid());

-- ---------------------------------------------------------------------------
-- deals: readable to any member of the deal
-- ---------------------------------------------------------------------------
drop policy if exists deals_read_members on public.deals;
create policy deals_read_members on public.deals
  for select using (public.deal_role_for(id) is not null);

-- ---------------------------------------------------------------------------
-- deal_members
-- ---------------------------------------------------------------------------
drop policy if exists members_read_self_or_owner on public.deal_members;
create policy members_read_self_or_owner on public.deal_members
  for select using (
    user_id = auth.uid() or public.is_owner_for(deal_id)
  );
drop policy if exists members_insert_owner on public.deal_members;
create policy members_insert_owner on public.deal_members
  for insert with check (public.is_owner_for(deal_id));
drop policy if exists members_update_owner on public.deal_members;
create policy members_update_owner on public.deal_members
  for update using (public.is_owner_for(deal_id)) with check (public.is_owner_for(deal_id));
drop policy if exists members_delete_owner on public.deal_members;
create policy members_delete_owner on public.deal_members
  for delete using (public.is_owner_for(deal_id));

-- ---------------------------------------------------------------------------
-- deal_sections
-- ---------------------------------------------------------------------------
drop policy if exists sections_read_non_guest on public.deal_sections;
create policy sections_read_non_guest on public.deal_sections
  for select using (
    public.deal_role_for(deal_id) is not null
    and public.deal_role_for(deal_id) <> 'welltory_guest'
  );

drop policy if exists sections_write_by_category on public.deal_sections;
create policy sections_write_by_category on public.deal_sections
  for update using (public.can_edit_category(deal_id, category))
  with check (public.can_edit_category(deal_id, category));

drop policy if exists sections_insert_by_owner on public.deal_sections;
create policy sections_insert_by_owner on public.deal_sections
  for insert with check (public.is_owner_for(deal_id));

drop policy if exists sections_delete_by_owner on public.deal_sections;
create policy sections_delete_by_owner on public.deal_sections
  for delete using (public.is_owner_for(deal_id));

-- ---------------------------------------------------------------------------
-- deal_internal_assumptions: owners + non-guest read
-- ---------------------------------------------------------------------------
drop policy if exists internal_read on public.deal_internal_assumptions;
create policy internal_read on public.deal_internal_assumptions
  for select using (
    public.deal_role_for(deal_id) is not null
    and public.deal_role_for(deal_id) <> 'welltory_guest'
  );
drop policy if exists internal_write on public.deal_internal_assumptions;
create policy internal_write on public.deal_internal_assumptions
  for all using (public.is_owner_for(deal_id)) with check (public.is_owner_for(deal_id));

-- ---------------------------------------------------------------------------
-- deal_commitments
-- ---------------------------------------------------------------------------
drop policy if exists commitments_read on public.deal_commitments;
create policy commitments_read on public.deal_commitments
  for select using (
    public.deal_role_for(deal_id) is not null
    and public.deal_role_for(deal_id) <> 'welltory_guest'
  );
drop policy if exists commitments_write on public.deal_commitments;
create policy commitments_write on public.deal_commitments
  for all using (public.can_edit_category(deal_id, category))
  with check (public.can_edit_category(deal_id, category));

-- ---------------------------------------------------------------------------
-- deal_discovery_items
-- ---------------------------------------------------------------------------
drop policy if exists discovery_read on public.deal_discovery_items;
create policy discovery_read on public.deal_discovery_items
  for select using (
    public.deal_role_for(deal_id) is not null
    and public.deal_role_for(deal_id) <> 'welltory_guest'
  );
drop policy if exists discovery_write on public.deal_discovery_items;
create policy discovery_write on public.deal_discovery_items
  for all using (public.is_owner_for(deal_id)) with check (public.is_owner_for(deal_id));

-- ---------------------------------------------------------------------------
-- deal_comments: everyone with a non-guest role can read + write their own
-- ---------------------------------------------------------------------------
drop policy if exists comments_read on public.deal_comments;
create policy comments_read on public.deal_comments
  for select using (
    public.deal_role_for(deal_id) is not null
    and public.deal_role_for(deal_id) <> 'welltory_guest'
  );
drop policy if exists comments_insert on public.deal_comments;
create policy comments_insert on public.deal_comments
  for insert with check (
    author_user_id = auth.uid()
    and public.deal_role_for(deal_id) is not null
    and public.deal_role_for(deal_id) <> 'welltory_guest'
  );
drop policy if exists comments_delete_owner on public.deal_comments;
create policy comments_delete_owner on public.deal_comments
  for delete using (public.is_owner_for(deal_id) or author_user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- deal_approvals
-- ---------------------------------------------------------------------------
drop policy if exists approvals_read on public.deal_approvals;
create policy approvals_read on public.deal_approvals
  for select using (
    public.deal_role_for(deal_id) is not null
    and public.deal_role_for(deal_id) <> 'welltory_guest'
  );
drop policy if exists approvals_insert on public.deal_approvals;
create policy approvals_insert on public.deal_approvals
  for insert with check (
    approver_user_id = auth.uid()
    and public.deal_role_for(deal_id) is not null
    and public.deal_role_for(deal_id) <> 'welltory_guest'
  );

-- ---------------------------------------------------------------------------
-- deal_versions (immutable) — non-guests may read; only owners write
-- Server enforces immutability by never issuing UPDATE except for is_current.
-- ---------------------------------------------------------------------------
drop policy if exists versions_read on public.deal_versions;
create policy versions_read on public.deal_versions
  for select using (
    public.deal_role_for(deal_id) is not null
    and public.deal_role_for(deal_id) <> 'welltory_guest'
  );
drop policy if exists versions_insert on public.deal_versions;
create policy versions_insert on public.deal_versions
  for insert with check (public.is_owner_for(deal_id));
drop policy if exists versions_update on public.deal_versions;
create policy versions_update on public.deal_versions
  for update using (public.is_owner_for(deal_id)) with check (public.is_owner_for(deal_id));

-- ---------------------------------------------------------------------------
-- deal_attendees, deal_meeting_slots, meeting_requests
-- ---------------------------------------------------------------------------
drop policy if exists attendees_read on public.deal_attendees;
create policy attendees_read on public.deal_attendees
  for select using (
    public.deal_role_for(deal_id) is not null
    and public.deal_role_for(deal_id) <> 'welltory_guest'
  );
drop policy if exists attendees_write on public.deal_attendees;
create policy attendees_write on public.deal_attendees
  for all using (public.is_owner_for(deal_id)) with check (public.is_owner_for(deal_id));

drop policy if exists slots_read_members on public.deal_meeting_slots;
create policy slots_read_members on public.deal_meeting_slots
  for select using (
    public.deal_role_for(deal_id) is not null
    and public.deal_role_for(deal_id) <> 'welltory_guest'
  );
drop policy if exists slots_write_owner on public.deal_meeting_slots;
create policy slots_write_owner on public.deal_meeting_slots
  for all using (public.is_owner_for(deal_id)) with check (public.is_owner_for(deal_id));

-- Meeting requests: owners see all; ordinary users see none directly; anon
-- writes are handled by the server via service role (guarded).
drop policy if exists requests_read_owner on public.meeting_requests;
create policy requests_read_owner on public.meeting_requests
  for select using (public.is_owner_for(deal_id));

-- ---------------------------------------------------------------------------
-- published_briefing: anon may read this SINGLE row (customer surface).
-- ---------------------------------------------------------------------------
drop policy if exists published_read_any on public.published_briefing;
create policy published_read_any on public.published_briefing
  for select using (true);
drop policy if exists published_write_owner on public.published_briefing;
create policy published_write_owner on public.published_briefing
  for all using (public.is_owner_for(deal_id)) with check (public.is_owner_for(deal_id));

-- ---------------------------------------------------------------------------
-- deal_audit_log: read for owners only; no UPDATE/DELETE for anyone (server
-- writes via service role only; ordinary users cannot mutate)
-- ---------------------------------------------------------------------------
drop policy if exists audit_read_owner on public.deal_audit_log;
create policy audit_read_owner on public.deal_audit_log
  for select using (public.is_owner_for(deal_id));

-- No INSERT/UPDATE/DELETE policies for authenticated users on audit log =>
-- only service role (which bypasses RLS) can write, which is exactly the
-- required behavior.
