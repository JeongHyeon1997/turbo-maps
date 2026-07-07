'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Href = React.ComponentProps<typeof Link>['href'];

interface Tab {
  href: string;
  label: string;
  icon: React.ReactNode;
  center?: boolean;
}

const I = (d: string) => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d={d} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const tabs: Tab[] = [
  { href: '/', label: '홈', icon: I('M3 11l9-8 9 8M5 10v10h14V10') },
  { href: '/map', label: '지도', icon: I('M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3zM9 3v15M15 6v15') },
  { href: '/logs/new', label: '기록', icon: I('M12 5v14M5 12h14'), center: true },
  { href: '/explore', label: '탐색', icon: I('M12 22a10 10 0 100-20 10 10 0 000 20zM15.5 8.5l-2 5-5 2 2-5 5-2z') },
  { href: '/profile', label: '내정보', icon: I('M12 12a4 4 0 100-8 4 4 0 000 8zM5 21a7 7 0 0114 0') },
];

/** Mobile-only fixed bottom tab bar. Hidden on md+ (desktop uses header nav). */
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-divider bg-background/95 backdrop-blur md:hidden">
      <ul className="mx-auto flex max-w-md items-center justify-around px-2 py-1.5">
        {tabs.map((t) => {
          const active = t.href === '/' ? pathname === '/' : pathname.startsWith(t.href);
          if (t.center) {
            return (
              <li key={t.href}>
                <Link
                  href={t.href as Href}
                  aria-label={t.label}
                  className="flex h-12 w-12 -translate-y-2 items-center justify-center rounded-full bg-brand text-white shadow-md"
                >
                  {t.icon}
                </Link>
              </li>
            );
          }
          return (
            <li key={t.href}>
              <Link
                href={t.href as Href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs ${
                  active ? 'text-brand' : 'text-text-muted'
                }`}
              >
                {t.icon}
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
