import { SiteHeader, SiteFooter } from '@/components/organisms';
import { AdSenseScript } from '@/lib/adsense';

/**
 * Layout shell for logged-out surfaces: landing `/`, `/privacy`, `/terms`, and the public
 * `/explore`·`/places` views. `SiteHeader` renders the signed-out nav (탐색/장소) + login CTA;
 * on mobile it also renders a thin JS-free link bar under the header.
 *
 * AdSense loads here (public surface only, gated on NEXT_PUBLIC_ADSENSE_CLIENT) —
 * never in AppShell, so private screens stay ad-free (docs/plan/03-adsense.md).
 */
export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AdSenseScript />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
