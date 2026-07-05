/**
 * @maps/shared — single source of truth for types/DTOs shared across
 * apps/api, apps/web, apps/mobile. Zod schemas only; never duplicate in apps.
 *
 * Domain schemas (couple / place / date-log / route) are added by the
 * `schema-dev` role via the `shared-schema` skill. Re-export each from here.
 */
export const SHARED_PACKAGE = '@maps/shared' as const;
// export * from './schemas/couple';
// export * from './schemas/place';
// export * from './schemas/date-log';
// export * from './schemas/route';
