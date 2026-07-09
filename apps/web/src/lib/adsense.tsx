import Script from 'next/script';

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
 * any ad units — the `<ins class="adsbygoogle">` AdUnit component, its placement
 * on public pages, and CMP/Consent-Mode-v2 consent are STEP 1 items 3–5 and are
 * still TODO (need slot ids issued after approval).
 */
export function AdSenseScript() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  if (!client) return null;

  return (
    <Script
      id="adsbygoogle-loader"
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
    />
  );
}
