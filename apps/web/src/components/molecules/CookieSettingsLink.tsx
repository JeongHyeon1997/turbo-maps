'use client';

import { reopenConsentBanner } from './ConsentBanner';
import { footerLinkClassName } from './FooterColumn';

/**
 * Footer "쿠키 설정" trigger — reopens `ConsentBanner` for a visitor who already made a
 * choice (docs/plan/03-adsense.md STEP1 item 5). There's no dedicated consent-settings page
 * yet, so this is the one re-entry point; `SiteFooter` only renders it when
 * `showCookieSettings` is set (PublicShell, and only when AdSense/Consent Mode is configured).
 * Styled identically to the real `<Link>` rows around it via the shared `footerLinkClassName`.
 */
export function CookieSettingsLink() {
  return (
    <button type="button" onClick={reopenConsentBanner} className={footerLinkClassName}>
      쿠키 설정
    </button>
  );
}
