export interface MeetingSlot {
  id: string;
  starts_at_utc: string; // ISO
  ends_at_utc: string;   // ISO
  approved: boolean;
}

/**
 * Only approved future slots (>= now) may appear on the customer briefing.
 */
export function filterCustomerSlots(slots: MeetingSlot[], now: Date = new Date()): MeetingSlot[] {
  const nowMs = now.getTime();
  return slots
    .filter((s) => s.approved)
    .filter((s) => Date.parse(s.starts_at_utc) > nowMs)
    .sort((a, b) => Date.parse(a.starts_at_utc) - Date.parse(b.starts_at_utc));
}
