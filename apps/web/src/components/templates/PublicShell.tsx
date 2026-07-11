import { SiteHeader, SiteFooter } from '@/components/organisms';
import { ConsentBanner } from '@/components/molecules';
import { AdSenseScript, ConsentDefaultScript, isAdsenseEnabled } from '@/lib/adsense';

/**
 * Layout shell for logged-out surfaces: landing `/`, `/privacy`, `/terms`, and the public
 * `/explore`·`/places` views. `SiteHeader` renders the signed-out nav (탐색/장소) + login CTA;
 * on mobile it also renders a thin JS-free link bar under the header.
 *
 * AdSense + its Consent Mode v2 default load here (public surface only, gated on
 * `NEXT_PUBLIC_ADSENSE_CLIENT`) — never in AppShell, so private screens stay ad- and
 * consent-UI-free (docs/plan/03-adsense.md). `ConsentDefaultScript` MUST render before
 * `AdSenseScript` — see its docstring for why the ordering holds regardless of Next's script
 * strategy differences. `ConsentBanner` self-gates on the same env var; the footer's "쿠키
 * 설정" reopen link only makes sense alongside it, so it's driven from the same flag here.
 */
export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ConsentDefaultScript />
      <AdSenseScript />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter showCookieSettings={isAdsenseEnabled()} />
      <ConsentBanner />
    </div>
  );
}
