import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

/**
 * Supabase 클라이언트를 관리하는 서비스.
 * - admin: service_role 키 사용. RLS 우회. 서버 사이드 비즈니스 로직 전용.
 * - asUser: 특정 유저의 JWT로 RLS가 적용된 클라이언트를 얻을 때 사용.
 *
 * Schema selection:
 *   SUPABASE_DB_SCHEMA env var (default 'public') controls which Postgres
 *   schema all clients target — the project hosts both prod (`public`) and
 *   test (`test`) schemas; switching is done purely via env.
 */
@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private url!: string;
  private anonKey!: string;
  private serviceRoleKey!: string;
  private schema!: string;

  // Generics widened because SUPABASE_DB_SCHEMA is a runtime string and
  // the default SupabaseClient type pins the schema to the literal "public".
  admin!: SupabaseClient<any, any, any>;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.url = this.config.getOrThrow('SUPABASE_URL');
    this.anonKey = this.config.getOrThrow('SUPABASE_ANON_KEY');
    this.serviceRoleKey = this.config.getOrThrow('SUPABASE_SERVICE_ROLE_KEY');
    this.schema = this.config.get<string>('SUPABASE_DB_SCHEMA') ?? 'public';

    this.admin = createClient(this.url, this.serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      db: { schema: this.schema },
    });

    this.logger.log(
      `Supabase client ready (${this.url}, schema=${this.schema})`,
    );
  }

  /** 유저의 access token을 실어 RLS가 적용된 클라이언트 반환 */
  asUser(accessToken: string): SupabaseClient<any, any, any> {
    return createClient(this.url, this.anonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { autoRefreshToken: false, persistSession: false },
      db: { schema: this.schema },
    });
  }

  /** 현재 활성화된 스키마 이름 (헬스체크 등에서 노출용) */
  get activeSchema(): string {
    return this.schema;
  }
}
