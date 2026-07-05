import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { SupabaseService } from '../supabase/supabase.service';

export interface AuthenticatedRequest extends Request {
  user: { id: string; email: string | null };
  accessToken: string;
}

/**
 * Supabase access token을 검증하는 가드.
 * 요청 헤더 Authorization: Bearer <token>에서 꺼내 admin 클라이언트로 검증.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly supabase: SupabaseService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('missing bearer token');
    }
    const token = header.slice('Bearer '.length);

    const { data, error } = await this.supabase.admin.auth.getUser(token);
    if (error || !data.user) {
      throw new UnauthorizedException('invalid token');
    }

    req.user = { id: data.user.id, email: data.user.email ?? null };
    req.accessToken = token;
    return true;
  }
}
