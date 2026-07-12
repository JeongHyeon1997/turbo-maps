import Script from 'next/script';
import { CONSENT_DEFAULT_SCRIPT } from '@/lib/consent';

/**
 * Google AdSense loader — see docs/plan/03-adsense.md STEP 1.
 *
 * Mounted ONLY on the public surface (`PublicShell`), never on the authenticated
 * `AppShell`, so a couple's private screens (records / compose / profile) never
 * load an ad script — the standing principle in 03-adsense.md ("광고는 공개
 * 콘텐츠에만"). Anonymous crawlers/visitors always hit the PublicShell rendering
 * of public pages, so this is enough for AdSense site review/verification.
 *
 * Reads the publisher id from `NEXT_PUBLIC_ADSENSE_CLIENT` and renders nothing
 * when unset — graceful off in local/dev and anywhere the env isn't provided.
 *
 * This only LOADS AdSense (required for verification/review). It does NOT place
 * any ad units — the `<ins class="adsbygoogle">` AdUnit component and its
 * placement on public pages are STEP 1 items 3–4 and are still TODO (need slot
 * ids issued after approval). Consent Mode v2 defaults (item 5) are shipped —
 * see `ConsentDefaultScript` below and `ConsentBanner` (components/molecules).
 *
 * `strategy="lazyOnload"` (not `afterInteractive`) — with no ad units placed yet,
 * there's nothing for this script to paint, so deferring it until the browser is
 * idle costs nothing today (docs/plan/12-performance.md STEP E, item 11). **Revisit
 * this once an `AdUnit` is actually placed on a public page** — real ad slots
 * generally want `afterInteractive` (or at least `lazyOnload` re-verified against
 * measured fill/viewability) so they don't render so late they're missed on fast
 * scrolls/short sessions.
 */
export function AdSenseScript() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  if (!client) return null;

  return (
    <Script
      id="adsbygoogle-loader"
      strategy="lazyOnload"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
    />
  );
}

/**
 * Consent Mode v2 default signals — must render (and execute) *before* `AdSenseScript`, so
 * this is a plain synchronous `<script>` (not `next/script`), same pattern as `layout.tsx`'s
 * `THEME_INIT_SCRIPT`: it runs inline while the HTML streams in, well ahead of `AdSenseScript`'s
 * `afterInteractive` (post-hydration) load. Gated on the same env var and mounted from the same
 * place (`PublicShell`, before `<AdSenseScript />`) so the two never drift apart.
 *
 * A real Google-certified CMP is switched on later from the AdSense dashboard (post-approval) —
 * this only ships the `gtag('consent', 'default', …)` baseline Google expects to already be
 * present. See `lib/consent.ts` for the signal set and `ConsentBanner` for the visitor-facing UI
 * that later calls `gtag('consent', 'update', …)`.
 */
export function ConsentDefaultScript() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  if (!client) return null;

  return <script id="consent-default" dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULT_SCRIPT }} />;
}

/** Whether the AdSense/Consent Mode integration is configured for this build — used by
 * `PublicShell` to decide whether `ConsentBanner` and the footer's "쿠키 설정" reopen link
 * are worth rendering at all (docs/plan/03-adsense.md STEP1 item 5). */
export function isAdsenseEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_ADSENSE_CLIENT);
}
