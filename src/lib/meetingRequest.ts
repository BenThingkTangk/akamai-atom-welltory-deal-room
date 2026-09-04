import { z } from 'zod';

export const meetingRequestSchema = z.object({
  name: z.string().trim().min(2).max(120),
  work_email: z
    .string()
    .trim()
    .email()
    .max(200)
    .refine((v) => !/\+.*@/.test(v) || v.length <= 200, 'Invalid email'),
  role_title: z.string().trim().min(2).max(120),
  slot_id: z.string().uuid(),
  time_zone: z
    .string()
    .trim()
    .min(2)
    .max(64)
    .refine((v) => /^[A-Za-z_\/+\-0-9]+$/.test(v), 'Invalid time zone'),
  note: z.string().trim().max(1000).optional().nullable(),
});

export type MeetingRequestInput = z.infer<typeof meetingRequestSchema>;

export function validateMeetingRequest(raw: unknown): { ok: true; value: MeetingRequestInput } | { ok: false; error: string } {
  const parsed = meetingRequestSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: `${first.path.join('.') || 'input'}: ${first.message}` };
  }
  return { ok: true, value: parsed.data };
}
