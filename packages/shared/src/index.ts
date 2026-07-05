/**
 * @maps/shared — single source of truth for types/DTOs shared across
 * apps/api, apps/web, apps/mobile. Zod schemas only; never duplicate in apps.
 */
export const SHARED_PACKAGE = '@maps/shared' as const;

export * from './schemas/profile';
export * from './schemas/couple';
// export * from './schemas/place';
// export * from './schemas/date-log';
// export * from './schemas/route';
