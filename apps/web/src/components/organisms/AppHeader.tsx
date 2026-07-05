import Link from 'next/link';
import { Avatar } from '@/components/atoms';

export interface AppHeaderProps {
  coupleInitials?: [string, string];
}

const nav = [
  { label: '홈', href: '/' },
  { label: '지도', href: '/map' },
  { label: '캘린더', href: '/calendar' },
  { label: '탐색', href: '/explore' },
] as const;

/** Full-width sticky top bar. Nav links appear on desktop; avatars always. */
export function AppHeader({ coupleInitials = ['J', 'H'] }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-divider bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-8">
        <div className="flex items-center gap-8">
          <span className="text-xl font-extrabold tracking-tight text-brand">maps</span>
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
        <div className="flex -space-x-2">
          <Avatar initial={coupleInitials[0]} color="#E8635C" />
          <Avatar initial={coupleInitials[1]} color="#B79BD9" />
        </div>
      </div>
    </header>
  );
}
