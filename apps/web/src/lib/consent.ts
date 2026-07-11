/**
 * Consent Mode v2 (Google) — see docs/plan/03-adsense.md STEP1 item 5.
 *
 * A real, Google-certified CMP is only turned on from the AdSense dashboard after site
 * approval — that's not something this codebase can do ahead of time. What we *can* ship now
 * is the code-side half Google expects to already be in place before/at review: default
 * `denied` consent signals set before the AdSense loader runs, plus a first-party banner that
 * lets a visitor grant/deny and pushes a Consent Mode `update` accordingly. `ConsentBanner`
 * (molecule) reads/writes the choice via this module; `ConsentDefaultScript` (lib/adsense.tsx)
 * emits the inline default snippet.
 *
 * Scope note: only `ad_storage` / `ad_user_data` / `ad_personalization` / `analytics_storage`
 * are modeled. There's no analytics script wired up yet (`analytics_storage` is included
 * because it's part of the standard Consent Mode v2 signal set Google's docs describe
 * together — safe to default `denied` even unused).
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const CONSENT_STORAGE_KEY = 'welog-consent';

/** `granted` = personalized ads allowed. `denied` = "필수만" — storage/personalization stay off. */
export type ConsentChoice = 'granted' | 'denied';

export function readStoredConsent(): ConsentChoice | null {
  if (typeof window === 'undefined') return null;
  const v = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  return v === 'granted' || v === 'denied' ? v : null;
}

export function storeConsent(choice: ConsentChoice): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
}

function consentSignals(choice: ConsentChoice) {
  return {
    ad_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
    analytics_storage: choice,
  };
}

/** Pushes a Consent Mode v2 `update` — called by `ConsentBanner`'s 동의/필수만 buttons. */
export function updateConsent(choice: ConsentChoice): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
  window.gtag('consent', 'update', consentSignals(choice));
}

/**
 * Inline script source rendered by `ConsentDefaultScript` (lib/adsense.tsx), *before* the
 * AdSense loader — sets the Consent Mode v2 `default` synchronously, ahead of any ad request.
 * Reads a previously-stored choice so a returning "granted" visitor doesn't flash
 * denied-then-granted; first-time visitors default to fully `denied` until `ConsentBanner`
 * records a choice. Kept as a plain string (no imports) so it can run standalone, ahead of the
 * adsbygoogle bundle — same pattern as `THEME_INIT_SCRIPT` in lib/theme.ts.
 */
export const CONSENT_DEFAULT_SCRIPT = `(function(){try{window.dataLayer=window.dataLayer||[];function gtag(){window.dataLayer.push(arguments);}window.gtag=window.gtag||gtag;var k=${JSON.stringify(
  CONSENT_STORAGE_KEY,
)};var v=localStorage.getItem(k);var g=v==='granted'?'granted':'denied';gtag('consent','default',{ad_storage:g,ad_user_data:g,ad_personalization:g,analytics_storage:g,wait_for_update:500});}catch(e){}})();`;
