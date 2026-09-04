import { describe, it, expect } from 'vitest';
import { filterCustomerSlots } from '@/lib/meetingSlots';
import { validateMeetingRequest } from '@/lib/meetingRequest';

describe('filterCustomerSlots', () => {
  const now = new Date('2026-09-04T14:00:00Z');
  it('only returns approved future slots, sorted', () => {
    const slots = [
      { id: '1', starts_at_utc: '2026-09-05T10:00:00Z', ends_at_utc: '2026-09-05T10:17:00Z', approved: true },
      { id: '2', starts_at_utc: '2026-09-01T10:00:00Z', ends_at_utc: '2026-09-01T10:17:00Z', approved: true },
      { id: '3', starts_at_utc: '2026-09-06T10:00:00Z', ends_at_utc: '2026-09-06T10:17:00Z', approved: false },
      { id: '4', starts_at_utc: '2026-09-10T10:00:00Z', ends_at_utc: '2026-09-10T10:17:00Z', approved: true },
    ];
    const out = filterCustomerSlots(slots, now).map((s) => s.id);
    expect(out).toEqual(['1', '4']);
  });
});

describe('validateMeetingRequest', () => {
  const valid = {
    name: 'Jane Doe',
    work_email: 'jane@example.com',
    role_title: 'CISO',
    slot_id: '11111111-1111-1111-1111-111111111111',
    time_zone: 'America/New_York',
    note: 'Looking forward to it.',
  };
  it('accepts a valid request', () => {
    const r = validateMeetingRequest(valid);
    expect(r.ok).toBe(true);
  });
  it('rejects invalid emails', () => {
    const r = validateMeetingRequest({ ...valid, work_email: 'not-an-email' });
    expect(r.ok).toBe(false);
  });
  it('rejects non-uuid slot ids', () => {
    const r = validateMeetingRequest({ ...valid, slot_id: 'nope' });
    expect(r.ok).toBe(false);
  });
  it('rejects bad time zones', () => {
    const r = validateMeetingRequest({ ...valid, time_zone: '../etc/passwd' });
    expect(r.ok).toBe(false);
  });
});
