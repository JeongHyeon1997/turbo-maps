import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health.controller';

// Feature modules (couples/places/date-logs/routes) are added by the
// `server-dev` role via the `api-module` skill as the API surface grows.
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), SupabaseModule, AuthModule],
  controllers: [HealthController],
})
export class AppModule {}
