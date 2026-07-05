import { z } from 'zod';

export const profileSchema = z.object({
  id: z.string().uuid(),
  nickname: z.string().min(1).max(20),
  avatarUrl: z.string().url().nullable().optional(),
  createdAt: z.string().datetime().optional(),
});
export type Profile = z.infer<typeof profileSchema>;

/** Payload for creating/updating one's own profile (post-login onboarding). */
export const upsertProfileSchema = profileSchema.pick({ nickname: true, avatarUrl: true });
export type UpsertProfile = z.infer<typeof upsertProfileSchema>;
