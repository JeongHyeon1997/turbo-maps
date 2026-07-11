import Link from 'next/link';
import { Logo, ThemeToggle } from '@/components/atoms';
import { AuthAction, HeaderNav, type AvatarDescriptor, type HeaderNavItem } from '@/components/molecules';

export type { AvatarDescriptor };

export interface SiteHeaderProps {
  /** Signed-in profile avatars (self first, then partner), already resolved server-side. */
  avatars?: AvatarDescriptor[];
  /** False when there's no session — shows the signed-out nav + login CTA instead of avatars. */
  signedIn?: boolean;
}

const signedInNav: readonly HeaderNavItem[] = [
  { label: '홈', href: '/' },
  { label: '지도', href: '/map' },
  { label: '캘린더', href: '/calendar' },
  { label: '탐색', href: '/explore' },
];

// Logged-out visitors only get the public discovery surface — 커뮤니티는 06 이후 추가.
const signedOutNav: readonly HeaderNavItem[] = [
  { label: '탐색', href: '/explore' },
  { label: '장소', href: '/places' },
];

/**
 * Unified sticky top bar for both signed-in (`AppShell`) and signed-out (`PublicShell`) surfaces
 * — replaces the former `AppHeader`/`LandingHeader` split (docs/plan/07-header-footer.md decision
 * 1). Nav items and the auth affordance both switch on `signedIn`.
 *
 * Signed-out visitors also get a thin, JS-free link bar under the header on mobile (decision 2)
 * so `/explore` and `/places` stay reachable without a hamburger/drawer — the desktop nav is
 * already visible at that width via `HeaderNav`.
 */
export function SiteHeader({ avatars = [], signedIn = false }: SiteHeaderProps) {
  const navItems = signedIn ? signedInNav : signedOutNav;

  return (
    <header className="sticky top-0 z-10 border-b border-divider bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 md:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <HeaderNav items={navItems} className="hidden gap-6 md:flex" />
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <AuthAction signedIn={signedIn} avatars={avatars} />
        </div>
      </div>

      {!signedIn && (
        <nav
          aria-label="탐색 메뉴"
          className="flex border-t border-divider px-3 md:hidden"
        >
          {signedOutNav.map((item) => (
            <Link
              key={item.href}
              href={item.href as React.ComponentProps<typeof Link>['href']}
              className="flex h-11 flex-1 items-center justify-center rounded-md text-sm font-medium text-text-secondary transition-colors duration-200 ease-out hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
