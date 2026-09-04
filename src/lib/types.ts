import type { Role, SectionCategory } from './roles';

export type Visibility = 'internal_only' | 'customer_safe_draft' | 'approved_for_customer' | 'published';
export type WorkflowStatus =
  | 'draft'
  | 'in_review'
  | 'changes_requested'
  | 'approved'
  | 'approved_with_conditions'
  | 'excluded';

export interface DealSection {
  id: string;
  deal_id: string;
  category: SectionCategory;
  field_key: string;
  draft_value: string;
  approved_value: string | null;
  visibility: Visibility;
  workflow_status: WorkflowStatus;
  character_guidance: string | null;
  revision: number;
  last_editor: string | null;
  updated_at: string;
}

export interface CommercialScenarioInputs {
  monthly_low_usd: number;   // 30000
  monthly_high_usd: number;  // 40000
  term_months: 12 | 24 | 36;
  remaining_incumbent_months: number | null; // 0..18 or null
  transition:
    | 'none'
    | 'delayed_billing'
    | 'overlap_credit'
    | 'buyout_consideration';
  services: 'included' | 'discounted' | 'separate';
  co_marketing: 'none' | 'case_study' | 'webinar' | 'video' | 'exec_quote' | 'package';
  incumbent_baseline_usd_monthly: number | null; // null => savings undetermined
}

export interface CommercialScenarioOutputs {
  monthly_target_low_usd: number;
  monthly_target_high_usd: number;
  annualized_low_usd: number;
  annualized_high_usd: number;
  tcv_low_usd: number;
  tcv_high_usd: number;
  overlap_exposure_usd: number | null; // null when inputs insufficient
  savings_note: string;
  assumptions: string[];
  disclaimer: string;
}

export interface PublishedBriefingPayload {
  deal_slug: string;
  version: number;
  published_at: string;
  hero: {
    eyebrow: string;
    headline: string;
    supporting: string;
    primary_cta: string;
    secondary_cta: string;
  };
  trust_strip: string[];
  why_now: string[];
  workstreams: Array<{
    key: string;
    title: string;
    customer_language: string;
    status: 'approved' | 'approved_with_conditions';
    conditions?: string;
  }>;
  meeting: {
    headline: string;
    copy: string;
    agenda: string[];
    slots: Array<{
      id: string;
      starts_at_utc: string; // ISO
      ends_at_utc: string;   // ISO
    }>;
    cta_primary: string;
    cta_alt: string;
  };
  footer: {
    lockup: string;
    qualifier: string;
  };
  role: Role; // welltory_guest only, never internal roles
}

export type Deal = {
  id: string;
  slug: string;
  customer: string;
  incumbent: string;
  objective: string;
  created_at: string;
};
