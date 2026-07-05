import { Controller, Get } from '@nestjs/common';
import { SupabaseService } from './supabase/supabase.service';

@Controller('health')
export class HealthController {
  constructor(private readonly supabase: SupabaseService) {}

  @Get()
  check() {
    return { status: 'ok', ts: new Date().toISOString() };
  }

  /**
   * DB connectivity smoke test. Verifies:
   *   1. Supabase is reachable with the configured service-role key.
   *   2. The schema selected by SUPABASE_DB_SCHEMA exists and exposes profiles.
   * Used after running migrations and after switching schemas.
   */
  @Get('db')
  async dbCheck() {
    const schema = this.supabase.activeSchema;
    try {
      const { count, error } = await this.supabase.admin
        .from('profiles')
        .select('id', { head: true, count: 'exact' });

      if (error) {
        return {
          ok: false,
          schema,
          error: error.message,
          ts: new Date().toISOString(),
        };
      }

      return {
        ok: true,
        schema,
        profilesCount: count ?? 0,
        ts: new Date().toISOString(),
      };
    } catch (e) {
      return {
        ok: false,
        schema,
        error: (e as Error).message,
        ts: new Date().toISOString(),
      };
    }
  }
}
