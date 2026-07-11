import { Logo } from '@/components/atoms';
import { CookieSettingsLink, FooterColumn, type FooterLinkItem } from '@/components/molecules';

const exploreLinks: readonly FooterLinkItem[] = [
  { label: '탐색', href: '/explore' },
  { label: '장소', href: '/places' },
];

const serviceLinks: readonly FooterLinkItem[] = [
  { label: '소개', href: '/' },
  { label: '문의', href: 'mailto:ojh@pitin-ev.com' },
];

const policyLinks: readonly FooterLinkItem[] = [
  { label: '개인정보처리방침', href: '/privacy' },
  { label: '이용약관', href: '/terms' },
];

export interface SiteFooterProps {
  /** Adds mobile-only bottom padding so content doesn't sit under `BottomNav`'s fixed bar
   * (only relevant in `AppShell` — `PublicShell` has no bottom tab bar). */
  withNavOffset?: boolean;
  /** Appends a "쿠키 설정" link to the 정책 column that reopens `ConsentBanner`
   * (docs/plan/03-adsense.md STEP1 item 5). Only passed `true` from `PublicShell` — the
   * banner never mounts in `AppShell`, so a link there would just do nothing. */
  showCookieSettings?: boolean;
}

/**
 * Global footer — rendered from both `AppShell` and `PublicShell` (docs/plan/07-header-footer.md
 * decision 4) so policy links stay reachable while signed in too. Four groups: brand, 둘러보기
 * (public discovery), 서비스 (about/contact), 정책 (privacy/terms).
 */
export function SiteFooter({ withNavOffset = false, showCookieSettings = false }: SiteFooterProps = {}) {
  return (
    <footer
      className={`border-t border-divider bg-surface ${withNavOffset ? 'pb-24 md:pb-0' : ''}`}
    >
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-x-6 gap-y-10 px-5 py-12 md:grid-cols-4 md:gap-x-10 md:px-8">
        <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
          <Logo />
          <p className="text-sm text-text-secondary">
            커플이 함께한 데이트·맛집·경로를 기록하는 공간이에요.
          </p>
          <p className="text-xs text-text-muted">&copy; 2026 위로그. All rights reserved.</p>
        </div>

        <FooterColumn title="둘러보기" links={exploreLinks} />
        <FooterColumn title="서비스" links={serviceLinks} />
        <FooterColumn
          title="정책"
          links={policyLinks}
          extra={showCookieSettings ? <CookieSettingsLink /> : undefined}
        />
      </div>
    </footer>
  );
}
