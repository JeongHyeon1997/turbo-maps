import { z } from 'zod';

export const coupleStatusSchema = z.enum(['pending', 'connected']);
export type CoupleStatus = z.infer<typeof coupleStatusSchema>;

export const coupleSchema = z.object({
  id: z.string().uuid(),
  createdBy: z.string().uuid(),
  partnerA: z.string().uuid(),
  partnerB: z.string().uuid().nullable(),
  inviteCode: z.string().min(4).max(12),
  status: coupleStatusSchema,
  createdAt: z.string().datetime().optional(),
  connectedAt: z.string().datetime().nullable().optional(),
});
export type Couple = z.infer<typeof coupleSchema>;

/** Join an existing couple by its invite code. */
export const joinCoupleSchema = z.object({
  inviteCode: z.string().trim().min(4).max(12),
});
export type JoinCouple = z.infer<typeof joinCoupleSchema>;
