import Link from 'next/link';
import { Logo } from '@/components/atoms';

/** Shared footer for logged-out pages: brand mark, copyright, policy links. */
export function SiteFooter() {
  return (
    <footer className="border-t border-divider bg-surface">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-10 text-sm text-text-secondary md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex flex-col gap-1">
          <Logo />
          <p>&copy; 2026 위로그. All rights reserved.</p>
        </div>
        <nav aria-label="정책 링크" className="flex gap-4">
          <Link
            href={'/privacy' as React.ComponentProps<typeof Link>['href']}
            className="rounded transition-colors duration-200 ease-out hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            개인정보처리방침
          </Link>
          <Link
            href={'/terms' as React.ComponentProps<typeof Link>['href']}
            className="rounded transition-colors duration-200 ease-out hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            이용약관
          </Link>
        </nav>
      </div>
    </footer>
  );
}
