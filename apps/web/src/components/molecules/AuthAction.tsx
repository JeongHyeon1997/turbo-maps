import Link from 'next/link';
import { Avatar, Button } from '@/components/atoms';

export interface AvatarDescriptor {
  initial: string;
  color?: string;
  imageUrl?: string | null;
  /** Full nickname, when known, for a more meaningful accessible label than the bare initial. */
  name?: string;
}

export interface AuthActionProps {
  /** Signed-in profile avatars (self first, then partner), already resolved server-side. */
  avatars?: AvatarDescriptor[];
  /** False when there's no session — shows a login CTA instead of avatars. */
  signedIn?: boolean;
}

/**
 * `SiteHeader`'s auth-state affordance: an avatar group linking to `/profile` when signed in
 * (with avatars resolved), a login CTA when signed out, or nothing while a session exists but
 * avatars haven't resolved yet.
 */
export function AuthAction({ avatars = [], signedIn = false }: AuthActionProps) {
  if (avatars.length > 0) {
    return (
      <Link href="/profile" aria-label="내 프로필" className="flex -space-x-2">
        {avatars.map((a, i) => (
          <Avatar key={i} initial={a.initial} color={a.color} imageUrl={a.imageUrl} name={a.name} />
        ))}
      </Link>
    );
  }

  if (!signedIn) {
    return (
      <Button href="/login" variant="primary" size="md">
        로그인
      </Button>
    );
  }

  return null;
}
