import Link from 'next/link';

export interface LogoProps {
  href?: string;
}

/** Brand wordmark link. Shared by the signed-in AppHeader and the logged-out landing header. */
export function Logo({ href = '/' }: LogoProps) {
  return (
    <Link
      href={href as React.ComponentProps<typeof Link>['href']}
      className="text-xl font-extrabold tracking-tight text-brand"
    >
      We Log
    </Link>
  );
}
