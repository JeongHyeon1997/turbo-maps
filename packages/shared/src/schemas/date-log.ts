import { z } from 'zod';
import { placeSchema } from './place';

export const coordinateSchema = z.object({ lat: z.number(), lng: z.number() });
export type Coordinate = z.infer<typeof coordinateSchema>;

/** A place visited within a date log, with per-visit rating/memo. */
export const dateLogPlaceSchema = z.object({
  id: z.string().uuid(),
  placeId: z.string().uuid(),
  visitOrder: z.number().int().nonnegative(),
  rating: z.number().int().min(0).max(5).nullable().optional(),
  memo: z.string().nullable().optional(),
  place: placeSchema.optional(),
});
export type DateLogPlace = z.infer<typeof dateLogPlaceSchema>;

export const dateLogSchema = z.object({
  id: z.string().uuid(),
  coupleId: z.string().uuid(),
  authorId: z.string().uuid(),
  date: z.string(), // yyyy-mm-dd
  title: z.string().nullable().optional(),
  memo: z.string().nullable().optional(),
  createdAt: z.string().datetime().optional(),
  places: z.array(dateLogPlaceSchema).optional(),
  route: z.array(coordinateSchema).optional(),
});
export type DateLog = z.infer<typeof dateLogSchema>;

/** Payload to create a date log with its places + route in one shot. */
export const createDateLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().max(80).optional(),
  memo: z.string().max(2000).optional(),
  places: z
    .array(
      z.object({
        place: placeSchema.omit({ id: true, createdAt: true }),
        rating: z.number().int().min(0).max(5).optional(),
        memo: z.string().max(500).optional(),
      }),
    )
    .min(1),
  route: z.array(coordinateSchema).optional(),
});
export type CreateDateLog = z.infer<typeof createDateLogSchema>;
