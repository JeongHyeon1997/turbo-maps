import { z } from 'zod';

/** A photo attached to a date log, ordered within its gallery. */
export const dateLogPhotoSchema = z.object({
  id: z.string().uuid(),
  dateLogId: z.string().uuid(),
  storagePath: z.string().min(1),
  caption: z.string().nullable().optional(),
  sortOrder: z.number().int().nonnegative(),
  createdAt: z.string().datetime().optional(),
});
export type DateLogPhoto = z.infer<typeof dateLogPhotoSchema>;

/** Payload to attach an already-uploaded photo to a date log. */
export const createDateLogPhotoSchema = z.object({
  storagePath: z.string().min(1),
  caption: z.string().max(500).optional(),
  sortOrder: z.number().int().nonnegative().optional(),
});
export type CreateDateLogPhoto = z.infer<typeof createDateLogPhotoSchema>;
