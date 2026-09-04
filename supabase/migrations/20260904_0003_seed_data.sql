-- 20260904_0003_seed_data.sql
-- Seed data for the Welltory deal.
-- Contains ONLY approved customer language for public workstreams; internal
-- ranges are stored in deal_internal_assumptions and are never surfaced to
-- customer views. Prohibited claims (e.g. "$35K", "$423K", "customer
-- confirmed", "Welltory: Yes") are intentionally absent.

insert into public.deals (slug, customer, incumbent, objective)
values (
  'welltory',
  'Welltory',
  'Cloudflare',
  'Land the 17-minute Welltory executive meeting.'
) on conflict (slug) do nothing;

with d as (select id from public.deals where slug = 'welltory')
insert into public.deal_internal_assumptions (deal_id, key, value_json, note)
select d.id, k.key, k.value_json::jsonb, k.note from d, (values
  ('monthly_modeled_range', '{"low_usd": 30000, "high_usd": 40000}', 'Internal modeling assumption — never display in customer view.'),
  ('pricing_disclosure', '"internal_only"', 'Internal only.'),
  ('primary_objective', '"17_minute_executive_meeting"', 'Primary objective.')
) as k(key, value_json, note)
on conflict (deal_id, key) do nothing;

-- --------------------------------------------------------------------------
-- Sections (structured fields) — all initially draft, visibility customer_safe_draft
-- --------------------------------------------------------------------------
with d as (select id from public.deals where slug = 'welltory')
insert into public.deal_sections (deal_id, category, field_key, draft_value, character_guidance, visibility)
select d.id, s.category::section_category, s.field_key, s.draft_value, s.guidance, s.visibility::section_visibility
from d, (values
  ('hero','hero.eyebrow','Private executive briefing for Welltory','<=80 chars','customer_safe_draft'),
  ('hero','hero.headline','Secure and scale Welltory''s next chapter in AI-powered health.','<=140 chars','customer_safe_draft'),
  ('hero','hero.supporting','A focused Akamai evaluation spanning competitive infrastructure economics, low-risk transition planning, application and API protection, and healthcare-security readiness.','<=280 chars','customer_safe_draft'),
  ('hero','hero.primary_cta','Choose a 17-minute briefing','<=40 chars','customer_safe_draft'),
  ('hero','hero.secondary_cta','See the proposed framework','<=40 chars','customer_safe_draft'),

  ('commercial','commercial.customer_language','Akamai is prepared to develop competitive displacement economics based on validated delivery, application, API-security, services, and contract-transition requirements.','<=320 chars','customer_safe_draft'),
  ('commercial','commercial.conditions','','Conditions to display when approved with conditions','customer_safe_draft'),
  ('commercial','commercial.internal_guidance','Model approximately $30K–$40K per month. Final economics depend on traffic, request volume, FQDNs, DNS zones, application and API scope, support, services, term, and contract timing. Delayed billing, overlap support, transition credits, or buyout consideration require approval.','Internal only — never customer-facing.','internal_only'),

  ('migration','migration.customer_language','Akamai will design a phased transition plan intended to minimize Welltory engineering effort, validate performance and security before cutover, and preserve clear rollback options until agreed acceptance criteria are met.','<=320 chars','customer_safe_draft'),
  ('migration','migration.conditions','','Conditions','customer_safe_draft'),
  ('migration','migration.internal_guidance','Consider a named migration lead and supporting services team subject to scope and approval. Use discovery, target architecture, phased onboarding, parallel validation, acceptance gates, rollback planning, and controlled cutover. Minimize Welltory engineering burden without promising zero effort.','Internal only.','internal_only'),

  ('api_security','api_security.customer_language','Evaluate a unified application and API protection architecture built for Welltory''s expanding health, AI, integration, and partner ecosystem.','<=280 chars','customer_safe_draft'),
  ('api_security','api_security.conditions','','Conditions','customer_safe_draft'),
  ('api_security','api_security.internal_guidance','Evaluate App & API Protector, API discovery and security, WAF, DDoS protection, bot and abuse defense, DNS, and delivery requirements. Do not use unsupported competitor statistics.','Internal only.','internal_only'),

  ('healthcare','healthcare.customer_language','Bring Akamai healthcare and security specialists into a focused architecture session covering clinical data flows, application and API exposure, segmentation, operational evidence, and recovery readiness.','<=320 chars','customer_safe_draft'),
  ('healthcare','healthcare.conditions','','Conditions','customer_safe_draft'),
  ('healthcare','healthcare.internal_guidance','Position around current healthcare-enterprise expectations and proposed HIPAA Security Rule modernization. Explore ePHI data flows, asset visibility, MFA dependencies, segmentation, audit evidence, containment, and recovery planning. Guardicore is a scoped solution, not a guarantee of HIPAA compliance. BAA coverage and service eligibility require Akamai review.','Internal only.','internal_only'),

  ('co_marketing','co_marketing.customer_language','If the program succeeds, both teams may evaluate a separately approved joint market story highlighting secure, scalable AI-powered health experiences.','<=280 chars','customer_safe_draft'),
  ('co_marketing','co_marketing.conditions','','Conditions','customer_safe_draft'),
  ('co_marketing','co_marketing.internal_guidance','Consider exceptional economics or migration investment in exchange for separately approved post-success participation. Options may include a case study, executive quote, webinar, customer video, announcement, or reference call. Nothing is granted upfront. Participation is optional and contingent on successful implementation.','Internal only.','internal_only'),

  ('agenda','agenda.line_1','0–3 minutes: Welltory priorities and timing','','customer_safe_draft'),
  ('agenda','agenda.line_2','3–8 minutes: Delivery, application, and API footprint','','customer_safe_draft'),
  ('agenda','agenda.line_3','8–12 minutes: Migration constraints and contract timing','','customer_safe_draft'),
  ('agenda','agenda.line_4','12–15 minutes: Healthcare and clinical-security direction','','customer_safe_draft'),
  ('agenda','agenda.line_5','15–17 minutes: Decide whether to produce a formal proposal','','customer_safe_draft'),

  ('meeting','meeting.headline','Seventeen minutes to determine whether a formal Akamai proposal is warranted.','<=140 chars','customer_safe_draft'),
  ('meeting','meeting.copy','Give the joint team 17 minutes to validate whether Akamai can materially improve the economics, migration burden, and security posture. If the required conditions are not achievable, the team will say so directly and close the loop.','<=400 chars','customer_safe_draft'),

  ('legal','legal.footer_qualifier','Private executive briefing · Subject to technical discovery, commercial approval, contracting, and applicable service terms.','','customer_safe_draft')
) as s(category, field_key, draft_value, guidance, visibility)
on conflict (deal_id, field_key) do nothing;

-- --------------------------------------------------------------------------
-- Commitments (approved-with-conditions style workstream cards)
-- --------------------------------------------------------------------------
with d as (select id from public.deals where slug = 'welltory')
insert into public.deal_commitments (deal_id, category, title, customer_language, conditions, status)
select d.id, c.category::section_category, c.title, c.customer_language, c.conditions, c.status::workflow_status from d, (values
  ('commercial','Economics','Akamai is prepared to develop competitive displacement economics based on validated delivery, application, API-security, services, and contract-transition requirements.','Subject to discovery of traffic volume, FQDNs, DNS zones, application/API scope, term, and contracting entity. Any transition mechanisms require internal approval.','draft'),
  ('migration','Migration assurance','Akamai will design a phased transition plan intended to minimize Welltory engineering effort, validate performance and security before cutover, and preserve clear rollback options until agreed acceptance criteria are met.','Named migration lead and services team subject to approved scope.','draft'),
  ('api_security','Application & API protection','Evaluate a unified application and API protection architecture built for Welltory''s expanding health, AI, integration, and partner ecosystem.','Scope confirmed in discovery.','draft'),
  ('healthcare','Healthcare-security readiness','Bring Akamai healthcare and security specialists into a focused architecture session covering clinical data flows, application and API exposure, segmentation, operational evidence, and recovery readiness.','Guardicore and BAA coverage subject to Akamai review; not a compliance guarantee.','draft'),
  ('co_marketing','Strategic co-marketing','If the program succeeds, both teams may evaluate a separately approved joint market story highlighting secure, scalable AI-powered health experiences.','Optional; post-success; separately approved.','draft')
) as c(category, title, customer_language, conditions, status);

-- --------------------------------------------------------------------------
-- Discovery checklist
-- --------------------------------------------------------------------------
with d as (select id from public.deals where slug = 'welltory')
insert into public.deal_discovery_items (deal_id, label, status)
select d.id, x.label, x.status::discovery_status from d, (values
  ('Monthly egress in TB','ask_in_meeting'),
  ('Monthly request volume','ask_in_meeting'),
  ('FQDNs on ports 80/443','ask_in_meeting'),
  ('DNS zones','ask_in_meeting'),
  ('Incumbent contract end or renewal window','ask_in_meeting'),
  ('Current products and support level','ask_in_meeting'),
  ('Geographic traffic and peak patterns','ask_in_meeting'),
  ('Applications, environments, and origins','ask_in_meeting'),
  ('API count or estimated API surface','ask_in_meeting'),
  ('Bot, abuse, and DDoS needs','ask_in_meeting'),
  ('Logging, SIEM, and managed services','ask_in_meeting'),
  ('Clinical or ePHI data-flow assumptions','ask_in_meeting'),
  ('Desired term, currency, and contracting entity','ask_in_meeting')
) as x(label, status);

-- --------------------------------------------------------------------------
-- Attendee role slots (no real names — role placeholders only)
-- --------------------------------------------------------------------------
with d as (select id from public.deals where slug = 'welltory')
insert into public.deal_attendees (deal_id, role_slot, display_name, email)
select d.id, r, null, null from d, (values
  ('Akamai account executive'),
  ('Solutions engineer'),
  ('Migration / services lead'),
  ('App & API Security specialist'),
  ('Guardicore / segmentation specialist'),
  ('Healthcare or compliance specialist'),
  ('ATOM strategy lead')
) as x(r);
