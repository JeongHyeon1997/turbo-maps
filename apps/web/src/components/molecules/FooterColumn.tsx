import Link from 'next/link';

type Href = React.ComponentProps<typeof Link>['href'];

export interface FooterLinkItem {
  label: string;
  href: string;
}

export interface FooterColumnProps {
  title: string;
  links: readonly FooterLinkItem[];
}

/** `mailto:`/`http(s)://` targets aren't app routes — render a plain anchor instead of `next/link`
 * (matches the pattern already used for external links in `PolicyDocument`). */
function isExternalHref(href: string) {
  return href.startsWith('mailto:') || href.startsWith('http://') || href.startsWith('https://');
}

// `min-h-11` gives each link a 44px touch target (DESIGN.md floor); the row's own height now
// carries most of the vertical rhythm, so the list gap below is kept tight rather than adding
// gap on top of it (uiux-reviewer fix #5).
const linkClassName =
  'inline-flex min-h-11 items-center rounded text-sm text-text-secondary transition-colors duration-200 ease-out hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

/** One labeled link group in `SiteFooter` (둘러보기 / 서비스 / 정책). */
export function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">{title}</h3>
      <ul className="flex flex-col">
        {links.map((link) => (
          <li key={link.href}>
            {isExternalHref(link.href) ? (
              <a href={link.href} className={linkClassName}>
                {link.label}
              </a>
            ) : (
              <Link href={link.href as Href} className={linkClassName}>
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
