import type { Metadata } from 'next';
import { PublicShell } from '@/components/templates';
import { PageTitle, Button } from '@/components/atoms';
import { GuideStep } from '@/components/molecules';
import { guideSteps } from '@/content/guide';
import { SITE_URL } from '@/lib/site-url';
import { ogImage } from '@/lib/og-image';

const TITLE = '위로그 사용법';
const DESCRIPTION =
  '소셜 로그인으로 시작해 커플을 연결하고, 데이트를 기록하고, 원하면 공개 코스로 나누는 방법까지 순서대로 알아보세요.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/guide' },
  openGraph: {
    type: 'website',
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/guide`,
    images: [ogImage(null, TITLE)],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [ogImage(null, TITLE).url],
  },
};

// Public, static — reachable signed out (`/guide` is a `PUBLIC_PREFIXES` entry, see
// src/lib/supabase/middleware.ts) and lists entirely from repo-local content
// (`src/content/guide.ts`), so it needs no Supabase read (docs/plan/10-content.md A2).
// No HowTo JSON-LD — Google scaled back HowTo rich-result support, so this page only
// carries the ordinary WebPage-level metadata above (title/description/OG).

export default function GuidePage() {
  return (
    <PublicShell>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-5 py-12 md:px-8 md:py-16">
        <header className="flex flex-col gap-3 border-b border-divider pb-8">
          <PageTitle className="text-2xl md:text-3xl">{TITLE}</PageTitle>
          <p className="text-sm leading-relaxed text-text-secondary">{DESCRIPTION}</p>
        </header>

        <ol className="flex flex-col gap-4">
          {guideSteps.map((step, i) => (
            <GuideStep key={step.title} index={i + 1} title={step.title} body={step.body} />
          ))}
        </ol>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button href="/login" variant="primary">
            로그인하고 시작하기
          </Button>
          <Button href="/explore" variant="ghost">
            둘러보기
          </Button>
        </div>
      </div>
    </PublicShell>
  );
}
