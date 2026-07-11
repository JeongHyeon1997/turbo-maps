'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/atoms';
import { isAdsenseEnabled } from '@/lib/adsense';
import {
  readStoredConsent,
  storeConsent,
  updateConsent,
  type ConsentChoice,
} from '@/lib/consent';

/** Custom event the footer's "쿠키 설정" link (`CookieSettingsLink`) dispatches to reopen this
 * banner after a visitor already made a choice — the only re-entry point into consent settings
 * for this pass (docs/plan/03-adsense.md STEP1 item 5; no dedicated settings page yet). */
const REOPEN_EVENT = 'welog:consent-reopen';

export function reopenConsentBanner(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(REOPEN_EVENT));
}

/**
 * First-visit consent banner for the public surface — bottom-fixed, shown until the visitor
 * picks 필수만/동의. The choice persists in `localStorage` (`welog-consent`, see `lib/consent.ts`)
 * so it doesn't reappear on return visits, and either button pushes a Consent Mode v2 `update`
 * so AdSense stops holding storage/personalization at the `denied` default set by
 * `ConsentDefaultScript`. Copy must not contradict `/privacy` §5's cookie/third-party-ad
 * disclosure — it links there instead of repeating it.
 *
 * Mounted from `PublicShell` only (never `AppShell`) — signed-in/private screens never show
 * ad-consent UI. Self-gates on `NEXT_PUBLIC_ADSENSE_CLIENT` so it's a no-op in local/dev builds
 * without an AdSense client id, matching `AdSenseScript`'s graceful-off pattern.
 */
export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    setVisible(readStoredConsent() === null);
    const onReopen = () => setVisible(true);
    window.addEventListener(REOPEN_EVENT, onReopen);
    return () => window.removeEventListener(REOPEN_EVENT, onReopen);
  }, []);

  // Slide-up entrance (08 모션 베이스라인) — start below the fold, then transition in on the
  // next frame so the transform actually animates instead of snapping in already-visible.
  useEffect(() => {
    if (!visible) {
      setEntered(false);
      return;
    }
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [visible]);

  if (!isAdsenseEnabled()) return null;

  function choose(choice: ConsentChoice) {
    storeConsent(choice);
    updateConsent(choice);
    setVisible(false);
  }

  return (
    // Markup always renders (once AdSense/Consent Mode is configured) — only the native
    // `hidden` attribute toggles visibility, rather than mounting/unmounting the whole subtree.
    // `hidden` forces `display: none` (removing it from the a11y tree and tab order for
    // already-consented / not-yet-mounted visitors) while keeping the copy present in the
    // server-rendered HTML, so e.g. a crawler/build check can still see the banner exists.
    <div
      role="region"
      aria-label="쿠키 및 맞춤광고 동의"
      hidden={!visible}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-divider bg-surface shadow-lg transition-transform duration-300 ease-out ${
        entered ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between md:gap-6 md:px-8">
        <p className="text-sm text-text-secondary">
          위로그는 서비스 제공과 맞춤광고를 위해 쿠키를 사용해요. 자세한 내용은{' '}
          <Link
            href="/privacy"
            className="text-brand underline underline-offset-2 hover:text-brand-pressed"
          >
            개인정보처리방침
          </Link>
          에서 확인할 수 있어요.
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="ghost" size="md" onClick={() => choose('denied')}>
            필수만
          </Button>
          <Button variant="primary" size="md" onClick={() => choose('granted')}>
            동의
          </Button>
        </div>
      </div>
    </div>
  );
}
