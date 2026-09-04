import { getServiceSupabase } from './supabase/server';

export type AuditAction =
  | 'section.update'
  | 'section.submit_for_review'
  | 'section.approve'
  | 'section.request_changes'
  | 'section.exclude'
  | 'comment.create'
  | 'version.create'
  | 'version.publish'
  | 'version.rollback'
  | 'member.invite'
  | 'member.role_change'
  | 'member.remove'
  | 'meeting.slot_upsert'
  | 'meeting.request_create'
  | 'auth.login'
  | 'auth.logout';

export interface AuditEntry {
  deal_id: string;
  actor_user_id: string | null;
  actor_email: string | null;
  action: AuditAction;
  entity_type: string;
  entity_id: string | null;
  before_value: unknown | null;
  after_value: unknown | null;
  request_ip: string | null;
  user_agent: string | null;
}

export async function writeAudit(entry: AuditEntry): Promise<void> {
  const sb = getServiceSupabase();
  const { error } = await sb.from('deal_audit_log').insert({
    deal_id: entry.deal_id,
    actor_user_id: entry.actor_user_id,
    actor_email: entry.actor_email,
    action: entry.action,
    entity_type: entry.entity_type,
    entity_id: entry.entity_id,
    before_value: entry.before_value,
    after_value: entry.after_value,
    request_ip: entry.request_ip,
    user_agent: entry.user_agent,
  });
  if (error) {
    // Never throw from audit; log to stderr instead so audit never blocks the
    // primary action. Failure is surfaced elsewhere (advisors, logs).
    // eslint-disable-next-line no-console
    console.error('[audit] write failed', error);
  }
}
