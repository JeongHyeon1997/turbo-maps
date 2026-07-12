import { Logo, ThemeToggle } from '@/components/atoms';
import { AuthAction, HeaderNav, type AvatarDescriptor, type HeaderNavItem } from '@/components/molecules';

export type { AvatarDescriptor };

export interface SiteHeaderProps {
  /** Signed-in profile avatars (self first, then partner), already resolved server-side. Ignored
   * when `authSlot` is provided. */
  avatars?: AvatarDescriptor[];
  /** False when there's no session — shows the signed-out nav + login CTA instead of avatars. */
  signedIn?: boolean;
  /** Overrides the built-in `avatars`/`signedIn`-driven `AuthAction` render entirely. `AppShell`
   * passes a `Suspense`-wrapped async avatar resolver here so the couples+profiles query doesn't
   * block the header/body shell from streaming (docs/plan/12-performance.md STEP E, item 9). */
  authSlot?: React.ReactNode;
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
 * Unified top bar for both signed-in (`AppShell`) and signed-out (`PublicShell`) surfaces —
 * replaces the former `AppHeader`/`LandingHeader` split (docs/plan/07-header-footer.md decision
 * 1). Nav items and the auth affordance both switch on `signedIn`.
 *
 * Signed-out visitors also get a thin, JS-free link bar under the header on mobile (decision 2)
 * so `/explore` and `/places` stay reachable without a hamburger/drawer — the desktop nav is
 * already visible at that width via `HeaderNav`. That link bar shares `HeaderNav`'s
 * active-route logic (aria-current) instead of hand-rolling its own markup (uiux-reviewer fix
 * #3), and only the **top row** is `sticky` — the link bar sits in normal flow below it so
 * scrolling pins just the compact top bar instead of ~108px of combined header (fix #6). At
 * mobile widths `ThemeToggle` renders its own compact single-button cycle internally (fix #1);
 * the right cluster gets `min-w-0` and the logo `shrink-0` so neither can force overflow at a
 * 320px viewport.
 */
export function SiteHeader({ avatars = [], signedIn = false, authSlot }: SiteHeaderProps) {
  const navItems = signedIn ? signedInNav : signedOutNav;

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-divider bg-background/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <div className="flex min-w-0 items-center gap-8">
            <span className="shrink-0">
              <Logo />
            </span>
            <HeaderNav items={navItems} className="hidden gap-6 md:flex" />
          </div>
          <div className="flex min-w-0 items-center gap-3">
            <ThemeToggle />
            {authSlot ?? <AuthAction signedIn={signedIn} avatars={avatars} />}
          </div>
        </div>
      </header>

      {!signedIn && (
        <HeaderNav
          items={signedOutNav}
          ariaLabel="탐색 메뉴"
          className="flex border-b border-divider bg-background px-3 md:hidden"
          variant="mobileBar"
        />
      )}
    </>
  );
}
