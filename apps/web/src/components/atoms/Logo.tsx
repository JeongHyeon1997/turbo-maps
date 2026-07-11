import Link from 'next/link';

export interface LogoProps {
  href?: string;
}

/** Brand wordmark link. Shared by `SiteHeader` (signed-in and signed-out) and `SiteFooter`. */
export function Logo({ href = '/' }: LogoProps) {
  return (
    <Link
      href={href as React.ComponentProps<typeof Link>['href']}
      className="font-jua text-xl tracking-tight text-brand"
    >
      위로그
    </Link>
  );
}
