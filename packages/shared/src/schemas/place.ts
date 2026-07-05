import { z } from 'zod';

export const placeSchema = z.object({
  id: z.string().uuid(),
  kakaoPlaceId: z.string().nullable().optional(),
  name: z.string().min(1),
  category: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  createdAt: z.string().datetime().optional(),
});
export type Place = z.infer<typeof placeSchema>;

/** A place picked from Kakao search, ready to attach to a date log. */
export const upsertPlaceSchema = placeSchema.omit({ id: true, createdAt: true });
export type UpsertPlace = z.infer<typeof upsertPlaceSchema>;
