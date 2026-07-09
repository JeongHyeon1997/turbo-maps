import { LandingHeader, SiteFooter } from '@/components/organisms';
import { AdSenseScript } from '@/lib/adsense';

/**
 * Layout shell for logged-out surfaces: landing `/`, `/privacy`, `/terms`.
 * Unlike AppShell (signed-in nav + bottom tab bar), this only offers a login CTA.
 *
 * AdSense loads here (public surface only, gated on NEXT_PUBLIC_ADSENSE_CLIENT) —
 * never in AppShell, so private screens stay ad-free (docs/plan/03-adsense.md).
 */
export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AdSenseScript />
      <LandingHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
