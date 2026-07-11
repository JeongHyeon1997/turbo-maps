'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Href = React.ComponentProps<typeof Link>['href'];

export interface HeaderNavItem {
  label: string;
  href: string;
}

/** `nav` = desktop inline text links. `mobileBar` = `SiteHeader`'s full-width tap-target link
 * bar for signed-out mobile visitors. Kept as a variant key (not a function prop) because
 * `SiteHeader` is a server component and can't pass closures across the boundary to this
 * client component (docs/plan/07-header-footer.md uiux-reviewer fix #3). */
export type HeaderNavVariant = 'nav' | 'mobileBar';

export interface HeaderNavProps {
  items: readonly HeaderNavItem[];
  /** Landmark label — defaults to the primary desktop nav's label. */
  ariaLabel?: string;
  className?: string;
  variant?: HeaderNavVariant;
}

const linkClassNameByVariant: Record<HeaderNavVariant, (active: boolean) => string> = {
  nav: (active) =>
    `rounded-md text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
      active ? 'text-brand' : 'text-text-secondary hover:text-text-primary'
    }`,
  mobileBar: (active) =>
    `flex h-11 flex-1 items-center justify-center rounded-md text-sm font-medium transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
      active ? 'text-brand' : 'text-text-secondary hover:text-text-primary'
    }`,
};

/**
 * Active-aware nav link row shared by `SiteHeader`'s desktop nav and mobile signed-out link bar
 * (signed-in and signed-out variants pass different `items`). Marks the current route with
 * `aria-current="page"` so assistive tech and CSS can both key off one signal. Client-only
 * because highlighting the active link needs `usePathname` — the links themselves are plain
 * `<a>`s under the hood and work with JS disabled.
 */
export function HeaderNav({
  items,
  ariaLabel = '주요 메뉴',
  className = '',
  variant = 'nav',
}: HeaderNavProps) {
  const pathname = usePathname();
  const linkClassName = linkClassNameByVariant[variant];

  return (
    <nav aria-label={ariaLabel} className={className}>
      {items.map((item) => {
        const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href as Href}
            aria-current={active ? 'page' : undefined}
            className={linkClassName(active)}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
