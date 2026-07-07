import Link from 'next/link';
import { Avatar, Button, Logo } from '@/components/atoms';

export interface AvatarDescriptor {
  initial: string;
  color?: string;
  imageUrl?: string | null;
}

export interface AppHeaderProps {
  /** Signed-in profile avatars (self first, then partner), already resolved server-side. */
  avatars?: AvatarDescriptor[];
  /** False when there's no session — shows a login CTA instead of avatars. */
  signedIn?: boolean;
}

const nav = [
  { label: '홈', href: '/' },
  { label: '지도', href: '/map' },
  { label: '캘린더', href: '/calendar' },
  { label: '탐색', href: '/explore' },
] as const;

/** Full-width sticky top bar. Nav links appear on desktop; avatars (or login CTA) always. */
export function AppHeader({ avatars = [], signedIn = true }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-divider bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden gap-6 md:flex">
            {nav.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        {avatars.length > 0 ? (
          <div className="flex -space-x-2">
            {avatars.map((a, i) => (
              <Avatar key={i} initial={a.initial} color={a.color} imageUrl={a.imageUrl} />
            ))}
          </div>
        ) : !signedIn ? (
          <Button href="/login" variant="primary">
            로그인
          </Button>
        ) : null}
      </div>
    </header>
  );
}
